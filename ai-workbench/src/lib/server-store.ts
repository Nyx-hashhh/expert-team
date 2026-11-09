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
