// 服务端本地设置存储：把 API 密钥等配置从 .env.local 迁移到设置界面。
// 所有数据落在 ai-workbench/.local-data/ 下（已在 .gitignore 忽略，不入库）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const DATA_DIR = path.join(process.cwd(), ".local-data");

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function readJson<T>(file: string, fallback: T): T {
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch {
    return fallback;
  }
}

function writeJson(file: string, value: unknown) {
  ensureDir();
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.tmp`;
  fs.writeFileSync(tmp, JSON.stringify(value, null, 2), "utf-8");
  fs.renameSync(tmp, target);
}

// ---------- LLM 设置 ----------

export type LlmSettings = {
  apiKey: string;
  baseURL: string;
  model: string;
  // 可选的按功能覆盖（留空则沿用上面的通用配置）
  generateModel: string;
  translateModel: string;
};

export type AppSettings = { llm: LlmSettings; updatedAt: string };

const SETTINGS_FILE = "settings.json";
const SETTINGS_FALLBACK: AppSettings = {
  llm: { apiKey: "", baseURL: "", model: "", generateModel: "", translateModel: "" },
  updatedAt: "",
};

export function readSettings(): AppSettings {
  return readJson(SETTINGS_FILE, SETTINGS_FALLBACK);
}

export function writeSettings(llm: LlmSettings): AppSettings {
  const next: AppSettings = { llm, updatedAt: new Date().toISOString() };
  writeJson(SETTINGS_FILE, next);
  return next;
}

// 合成最终生效的配置：设置界面 > 环境变量（兼容老 .env.local 写法）
export function getLlmConfig(scope: "generate" | "translate"): { apiKey: string; baseURL: string | undefined; model: string } {
  const saved = readSettings().llm;
  const envKey = scope === "generate" ? process.env.GENERATE_LLM_API_KEY : process.env.TRANSLATE_LLM_API_KEY;
  const envBase = scope === "generate" ? process.env.GENERATE_LLM_BASE_URL : process.env.TRANSLATE_LLM_BASE_URL;
  const envModel = scope === "generate" ? process.env.GENERATE_LLM_MODEL : process.env.TRANSLATE_LLM_MODEL;
  const apiKey = saved.apiKey || envKey || "";
  const baseURL = saved.baseURL || envBase || undefined;
  const scopedModel = scope === "generate" ? saved.generateModel : saved.translateModel;
  const model = scopedModel || saved.model || envModel || "deepseek-chat";
  return { apiKey, baseURL, model };
}

export function maskApiKey(key: string): string {
  if (!key) return "";
  if (key.length <= 8) return "••••••••";
  return `${key.slice(0, 4)}••••••••${key.slice(-4)}`;
}

// ---------- 用量与充值（演示版） ----------

export type UsageState = {
  used: number;
  quota: number;
  log: { time: string; kind: string; amount: number }[];
  recharges: { time: string; packId: string; amount: number }[];
};

const USAGE_FILE = "usage.json";
const DEFAULT_QUOTA = 20;
const USAGE_FALLBACK: UsageState = { used: 0, quota: DEFAULT_QUOTA, log: [], recharges: [] };

export function readUsage(): UsageState {
  return readJson(USAGE_FILE, USAGE_FALLBACK);
}

export function hasQuota(): boolean {
  const usage = readUsage();
  return usage.used < usage.quota;
}

export function consumeUsage(kind: string, amount = 1): UsageState {
  const usage = readUsage();
  usage.used += amount;
  usage.log.unshift({ time: new Date().toISOString(), kind, amount });
  usage.log = usage.log.slice(0, 200);
  writeJson(USAGE_FILE, usage);
  return usage;
}

export function addQuota(packId: string, amount: number): UsageState {
  const usage = readUsage();
  usage.quota += amount;
  usage.recharges.unshift({ time: new Date().toISOString(), packId, amount });
  writeJson(USAGE_FILE, usage);
  return usage;
}

// ---------- SMTP 发信配置（邮箱验证码用） ----------
// 授权码保存在 .local-data/smtp.json（不入 Git），也可用环境变量 SMTP_USER / SMTP_AUTH_CODE 兜底。

export type SmtpSettings = {
  host: string; // 留空时按发信邮箱后缀自动判断
  port: number;
  user: string; // 发信邮箱，如 18654380225@163.com
  authCode: string; // 邮箱后台生成的 SMTP 授权码（不是登录密码）
};

const SMTP_FILE = "smtp.json";
const SMTP_FALLBACK: SmtpSettings = { host: "", port: 465, user: "", authCode: "" };

export function readSmtp(): SmtpSettings {
  return readJson(SMTP_FILE, SMTP_FALLBACK);
}

export function writeSmtp(next: SmtpSettings) {
  writeJson(SMTP_FILE, next);
}

// 合成最终生效配置：设置界面 > 环境变量；host 未填时按邮箱后缀给默认值
export function getSmtpConfig(): SmtpSettings {
  const saved = readSmtp();
  const user = saved.user || process.env.SMTP_USER || "";
  const authCode = saved.authCode || process.env.SMTP_AUTH_CODE || "";
  let host = saved.host || process.env.SMTP_HOST || "";
  const port = saved.port || Number(process.env.SMTP_PORT) || 465;
  if (!host && user) {
    if (user.endsWith("@163.com")) host = "smtp.163.com";
    else if (user.endsWith("@126.com")) host = "smtp.126.com";
    else if (user.endsWith("@qq.com")) host = "smtp.qq.com";
    else if (user.endsWith("@foxmail.com")) host = "smtp.qq.com";
  }
  return { host, port, user, authCode };
}

// ---------- 邮箱验证码（注册用，只存哈希，带过期与重发限制） ----------

export type EmailCodeRecord = {
  codeHash: string;
  sentAt: string;
  expiresAt: string;
  usedAt: string | null;
};

export type EmailCodeStore = { codes: Record<string, EmailCodeRecord> };

const CODES_FILE = "email-codes.json";
const CODE_FALLBACK: EmailCodeStore = { codes: {} };

export const CODE_TTL_MS = 10 * 60 * 1000; // 验证码 10 分钟有效
export const CODE_RESEND_MS = 60 * 1000; // 60 秒内不允许重发

function mailCodeHash(email: string, code: string): string {
  return crypto.createHash("sha256").update(`${email}::${code}::zhixing-mail-code`).digest("hex");
}

// 生成 6 位数字验证码，落盘哈希；60 秒内重复调用抛 Error("SEND_TOO_FREQUENT")。
// 返回的明文验证码仅供服务端发信使用，不返回给前端。
export function createEmailCode(email: string): string {
  const store = readJson(CODES_FILE, CODE_FALLBACK);
  const key = email.toLowerCase();
  const prev = store.codes[key];
  if (prev && Date.now() - new Date(prev.sentAt).getTime() < CODE_RESEND_MS) {
    throw new Error("SEND_TOO_FREQUENT");
  }
  const code = String(crypto.randomInt(100000, 999999));
  const now = new Date();
  store.codes[key] = {
    codeHash: mailCodeHash(key, code),
    sentAt: now.toISOString(),
    expiresAt: new Date(now.getTime() + CODE_TTL_MS).toISOString(),
    usedAt: null,
  };
  writeJson(CODES_FILE, store);
  return code;
}

// 校验验证码：未过期、未使用、哈希一致。通过即作废（一次性使用）。
export function verifyEmailCode(email: string, code: string): boolean {
  const store = readJson(CODES_FILE, CODE_FALLBACK);
  const key = email.toLowerCase();
  const record = store.codes[key];
  if (!record || record.usedAt) return false;
  if (new Date(record.expiresAt).getTime() < Date.now()) return false;
  if (record.codeHash !== mailCodeHash(key, code)) return false;
  record.usedAt = new Date().toISOString();
  writeJson(CODES_FILE, store);
  return true;
}

// 发信失败时撤销刚生成的验证码，避免占用 60 秒重发窗口（用户填好授权码可立即重试）
export function deleteEmailCode(email: string) {
  const store = readJson(CODES_FILE, CODE_FALLBACK);
  const key = email.toLowerCase();
  if (!store.codes[key]) return;
  delete store.codes[key];
  writeJson(CODES_FILE, store);
}

// ---------- 用户（邮箱注册，模板版） ----------

export type StoredUser = {
  email: string;
  passwordHash: string;
  createdAt: string;
};

export type SessionRecord = { email: string; createdAt: string; expiresAt: string };

export type UserStore = { users: StoredUser[]; sessions: Record<string, SessionRecord> };

const USERS_FILE = "users.json";
const USER_FALLBACK: UserStore = { users: [], sessions: {} };

export function readUsers(): UserStore {
  return readJson(USERS_FILE, USER_FALLBACK);
}

export function writeUsers(store: UserStore) {
  writeJson(USERS_FILE, store);
}

export function hashPassword(email: string, password: string): string {
  return crypto.createHash("sha256").update(`${email.toLowerCase()}::${password}::zhixing-demo-salt`).digest("hex");
}

export function createSession(email: string): string {
  const store = readUsers();
  const token = crypto.randomBytes(24).toString("hex");
  const now = new Date();
  const expires = new Date(now.getTime() + 30 * 24 * 3600 * 1000);
  store.sessions[token] = { email: email.toLowerCase(), createdAt: now.toISOString(), expiresAt: expires.toISOString() };
  writeUsers(store);
  return token;
}

export function resolveSession(token: string): SessionRecord | null {
  const store = readUsers();
  const session = store.sessions[token];
  if (!session) return null;
  if (new Date(session.expiresAt).getTime() < Date.now()) return null;
  return session;
}

export function destroySession(token: string) {
  const store = readUsers();
  delete store.sessions[token];
  writeUsers(store);
}
