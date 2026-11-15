import crypto from "node:crypto";
import { readPrivateJson, writePrivateJson } from "@/lib/server-store";

export const ADMIN_COOKIE = "zhixing_admin_session";
export const ADMIN_SESSION_SECONDS = 12 * 60 * 60;
const AUTH_FILE = "admin-auth.json";
const SESSIONS_FILE = "admin-sessions.json";

type AdminAuth = { salt: string; hash: string; failed: number; lockedUntil: number };
type AdminSessions = { sessions: Record<string, number> };
const emptyAuth: AdminAuth = { salt: "", hash: "", failed: 0, lockedUntil: 0 };

function tokenFromRequest(request: Request): string {
  const cookies = request.headers.get("cookie") ?? "";
  const entry = cookies.split(";").map((item) => item.trim()).find((item) => item.startsWith(`${ADMIN_COOKIE}=`));
  return entry?.slice(ADMIN_COOKIE.length + 1) ?? "";
}

function sessionKey(token: string): string {
  return crypto.createHash("sha256").update(token).digest("hex");
}

export function adminIsConfigured(): boolean {
  const auth = readPrivateJson(AUTH_FILE, emptyAuth);
  return Boolean(auth.salt && auth.hash);
}

export function verifyAdminPassword(password: string): "ok" | "invalid" | "locked" | "unconfigured" {
  const auth = readPrivateJson(AUTH_FILE, emptyAuth);
  if (!auth.salt || !auth.hash) return "unconfigured";
  if (Date.now() < auth.lockedUntil) return "locked";
  const actual = crypto.scryptSync(password, Buffer.from(auth.salt, "hex"), 64);
  const expected = Buffer.from(auth.hash, "hex");
  const valid = expected.length === actual.length && crypto.timingSafeEqual(actual, expected);
  if (valid) {
    writePrivateJson(AUTH_FILE, { ...auth, failed: 0, lockedUntil: 0 });
    return "ok";
  }
  const failed = auth.failed + 1;
  writePrivateJson(AUTH_FILE, { ...auth, failed: failed >= 5 ? 0 : failed, lockedUntil: failed >= 5 ? Date.now() + 15 * 60_000 : 0 });
  return "invalid";
}

export function createAdminSession(): string {
  const token = crypto.randomBytes(32).toString("hex");
  const store = readPrivateJson<AdminSessions>(SESSIONS_FILE, { sessions: {} });
  const now = Date.now();
  store.sessions = Object.fromEntries(Object.entries(store.sessions).filter(([, expiry]) => expiry > now));
  store.sessions[sessionKey(token)] = now + ADMIN_SESSION_SECONDS * 1000;
  writePrivateJson(SESSIONS_FILE, store);
  return token;
}

export function hasAdminSession(request: Request): boolean {
  const token = tokenFromRequest(request);
  if (!/^[0-9a-f]{64}$/.test(token)) return false;
  const store = readPrivateJson<AdminSessions>(SESSIONS_FILE, { sessions: {} });
  return (store.sessions[sessionKey(token)] ?? 0) > Date.now();
}

export function destroyAdminSession(request: Request): void {
  const token = tokenFromRequest(request);
  if (!/^[0-9a-f]{64}$/.test(token)) return;
  const store = readPrivateJson<AdminSessions>(SESSIONS_FILE, { sessions: {} });
  delete store.sessions[sessionKey(token)];
  writePrivateJson(SESSIONS_FILE, store);
}

export function changeAdminPassword(password: string): void {
  const salt = crypto.randomBytes(16);
  const hash = crypto.scryptSync(password, salt, 64);
  writePrivateJson(AUTH_FILE, { salt: salt.toString("hex"), hash: hash.toString("hex"), failed: 0, lockedUntil: 0 });
  writePrivateJson(SESSIONS_FILE, { sessions: {} });
}

export function requireAdmin(request: Request, mutation = false): Response | null {
  if (!hasAdminSession(request)) return Response.json({ error: "需要管理员登录" }, { status: 401 });
  if (mutation && !sameOrigin(request)) return Response.json({ error: "请求来源无效" }, { status: 403 });
  return null;
}

export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get("origin");
  const host = request.headers.get("host");
  if (!origin || !host) return false;
  try {
    const parsed = new URL(origin);
    const protocol = request.headers.get("x-forwarded-proto") || new URL(request.url).protocol.slice(0, -1);
    return parsed.host === host && parsed.protocol === `${protocol}:`;
  } catch { return false; }
}

export const privateHeaders = { "Cache-Control": "no-store" };
