// 服务端本地设置存储：把 API 密钥等配置从 .env.local 迁移到设置界面。
// 所有数据落在 ai-workbench/.local-data/ 下（已在 .gitignore 忽略，不入库）。
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import os from "node:os";

// Keep runtime data outside the checkout so replacing the application does not erase it.
const DATA_DIR = process.env.WORKBENCH_DATA_DIR || path.join(os.homedir(), ".zhixing-workbench");
const LEGACY_DIR = path.join(process.cwd(), ".local-data");
const LEGACY_FILES = ["settings.json", "smtp.json", "email-codes.json", "users.json", "usage.json", "orders.json"];
let migrated = false;

function ensureDir() {
  fs.mkdirSync(DATA_DIR, { recursive: true, mode: 0o700 });
  if (migrated) return;
  if (process.env.WORKBENCH_SKIP_LEGACY_MIGRATION === "1") { migrated = true; return; }
  // Copy only missing files. Leave the old directory intact as the migration backup.
  for (const file of LEGACY_FILES) {
    const source = path.join(LEGACY_DIR, file);
    const target = path.join(/* turbopackIgnore: true */ DATA_DIR, file);
    if (source !== target && fs.existsSync(/* turbopackIgnore: true */ source) && !fs.existsSync(/* turbopackIgnore: true */ target)) {
      fs.copyFileSync(source, target, fs.constants.COPYFILE_EXCL);
      fs.chmodSync(target, 0o600);
    }
  }
  migrated = true;
}

function readJson<T>(file: string, fallback: T): T {
  ensureDir();
  try {
    const raw = fs.readFileSync(path.join(DATA_DIR, file), "utf-8");
    return { ...fallback, ...(JSON.parse(raw) as T) };
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === "ENOENT") return fallback;
    throw error;
  }
}

function writeJson(file: string, value: unknown) {
  ensureDir();
  const target = path.join(DATA_DIR, file);
  const tmp = `${target}.${crypto.randomBytes(6).toString("hex")}.tmp`;
  try {
    fs.writeFileSync(tmp, JSON.stringify(value, null, 2), { encoding: "utf-8", mode: 0o600 });
    fs.renameSync(tmp, target);
  } finally {
    if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
  }
}

export function readPrivateJson<T>(file: string, fallback: T): T { return readJson(file, fallback); }
export function writePrivateJson(file: string, value: unknown): void { writeJson(file, value); }

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

// ---------- 用量与充值（按账号计费：登录用户独立额度，未登录共用游客额度） ----------
// usage.json 顶层 used/quota 永远代表游客额度；登录用户的桶挂在 users[email] 下。
// 旧版本文件没有 users 字段，经 readJson 的 fallback 合并自动补齐，老数据继续当游客额度用。

export type UsageLogEntry = { time: string; kind: string; amount: number };

export type UsageScope = { email: string | null };

export type UserUsage = {
  used: number;
  quota: number;
  log: UsageLogEntry[];
  recharges: { time: string; packId: string; amount: number }[];
};

export type UsageState = {
  used: number;
  quota: number;
  log: UsageLogEntry[];
  recharges: { time: string; packId: string; amount: number }[];
  users: Record<string, UserUsage>;
};

const USAGE_FILE = "usage.json";
const DEFAULT_QUOTA = 20;
const USAGE_FALLBACK: UsageState = { used: 0, quota: DEFAULT_QUOTA, log: [], recharges: [], users: {} };

const emptyBucket = (): UserUsage => ({ used: 0, quota: DEFAULT_QUOTA, log: [], recharges: [] });

export function readUsage(): UsageState {
  return readJson(USAGE_FILE, USAGE_FALLBACK);
}

export function resolveScope(email: string | null): UsageScope {
  return { email: email ? email.toLowerCase() : null };
}

// 取某个身份对应的额度桶：email 为空返回游客桶，否则取/建该邮箱的桶。
// 游客桶是字段拷贝（number 无法按引用自增），落盘前用 commitBucket 回填。
function bucketFor(state: UsageState, scope: UsageScope): UserUsage {
  if (!scope.email) {
    return { used: state.used, quota: state.quota, log: state.log, recharges: state.recharges };
  }
  const email = scope.email;
  const existing = state.users[email];
  if (existing) return existing;
  const bucket = emptyBucket();
  state.users[email] = bucket;
  return bucket;
}

function commitBucket(state: UsageState, scope: UsageScope, bucket: UserUsage) {
  if (!scope.email) {
    state.used = bucket.used;
    state.quota = bucket.quota;
    state.log = bucket.log;
    state.recharges = bucket.recharges;
  }
  writeJson(USAGE_FILE, state);
}

// 只读用途：取某身份当前的额度视图（新账号未产生消耗时返回默认桶，不落盘）
export function usageFor(scope: UsageScope): UserUsage {
  const state = readUsage();
  return bucketFor(state, scope);
}

export function hasQuota(scope: UsageScope): boolean {
  const bucket = usageFor(scope);
  return bucket.used < bucket.quota;
}

// 402 文案：账号提示去充值；游客提示注册登录（充值本身要求登录）
export function quotaExceededMessage(scope: UsageScope): string {
  if (scope.email) return "该账号可用次数已用完，请前往「设置 → 用量与充值」充值后重试";
  return "游客次数已用完。在「设置 → 账号登录」注册或登录后即可充值获取更多次数";
}

export function consumeUsage(scope: UsageScope, kind: string, amount = 1): UserUsage {
  const state = readUsage();
  const bucket = bucketFor(state, scope);
  bucket.used += amount;
  bucket.log.unshift({ time: new Date().toISOString(), kind, amount });
  bucket.log = bucket.log.slice(0, 200);
  commitBucket(state, scope, bucket);
  return bucket;
}

export function addQuota(scope: UsageScope, packId: string, amount: number): UserUsage {
  const state = readUsage();
  const bucket = bucketFor(state, scope);
  bucket.quota += amount;
  bucket.recharges.unshift({ time: new Date().toISOString(), packId, amount });
  commitBucket(state, scope, bucket);
  return bucket;
}

// ---------- 充值订单（模拟支付：点充值先生成待支付订单，前端确认「模拟支付」后才到账） ----------

export type OrderRecord = {
  orderId: string;
  email: string;
  packId: string;
  packName: string;
  amount: number; // 充值次数
  price: string; // 展示价格，如 ¥29
  status: "pending" | "paid";
  createdAt: string;
  paidAt?: string;
};

const ORDERS_FILE = "orders.json";
const ORDERS_FALLBACK = { orders: [] as OrderRecord[] };

export function readOrders() {
  return readJson(ORDERS_FILE, ORDERS_FALLBACK);
}

export function createOrder(email: string, pack: { id: string; name: string; amount: number; price: string }): OrderRecord {
  const store = readOrders();
  const order: OrderRecord = {
    orderId: `ZHIXING${Date.now()}${crypto.randomInt(100, 1000)}`,
    email: email.toLowerCase(),
    packId: pack.id,
    packName: pack.name,
    amount: pack.amount,
    price: pack.price,
    status: "pending",
    createdAt: new Date().toISOString(),
  };
  store.orders.unshift(order);
  store.orders = store.orders.slice(0, 200);
  writeJson(ORDERS_FILE, store);
  return order;
}

// 确认支付：校验归属后标 paid 并入账；对已支付订单幂等返回（不重复加额度）。
export function payOrder(email: string, orderId: string): OrderRecord | "not-found" {
  const store = readOrders();
  const order = store.orders.find((item) => item.orderId === orderId);
  if (!order || order.email !== email.toLowerCase()) return "not-found";
  if (order.status !== "paid") {
    order.status = "paid";
    order.paidAt = new Date().toISOString();
    writeJson(ORDERS_FILE, store);
    addQuota(resolveScope(order.email), order.packId, order.amount);
  }
  return order;
}

// ---------- SMTP 发信配置（邮箱验证码用） ----------
// 授权码保存在服务端持久目录，也可用环境变量 SMTP_USER / SMTP_AUTH_CODE 兜底。

export type SmtpSettings = {
  host: string; // 留空时按发信邮箱后缀自动判断
  port: number;
  user: string; // 发信邮箱
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

// ---------- 请求侧登录态解析（x-auth-token 头优先，兼容 ?token= 查询参数） ----------

// null = 未携带 token（游客）；"expired" = 携带了 token 但会话不存在或已过期。
export type SessionResolution = { email: string } | null | "expired";

export function resolveRequestSession(request: Request): SessionResolution {
  const token = request.headers.get("x-auth-token") || new URL(request.url).searchParams.get("token") || "";
  if (!token) return null;
  const session = resolveSession(token);
  if (!session) return "expired";
  return { email: session.email };
}
