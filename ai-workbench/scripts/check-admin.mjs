import assert from "node:assert/strict";
import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const dataDir = fs.mkdtempSync(path.join(os.tmpdir(), "zhixing-admin-check-"));
const port = 3055 + crypto.randomInt(0, 100);
const base = `http://127.0.0.1:${port}`;
const initialPassword = "temporary-test-passphrase";
const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(initialPassword, salt, 64);
fs.writeFileSync(path.join(dataDir, "admin-auth.json"), JSON.stringify({ salt: salt.toString("hex"), hash: hash.toString("hex"), failed: 0, lockedUntil: 0 }));

let server;
const backupDir = `${dataDir}-backup`;
let output = "";
const start = async () => {
  server = spawn(process.execPath, ["node_modules/next/dist/bin/next", "start", "--hostname", "127.0.0.1", "--port", String(port)], {
    cwd: process.cwd(), windowsHide: true,
    env: { ...process.env, WORKBENCH_DATA_DIR: dataDir, WORKBENCH_SKIP_LEGACY_MIGRATION: "1" },
  });
  server.stdout.on("data", (chunk) => { output += chunk.toString(); });
  server.stderr.on("data", (chunk) => { output += chunk.toString(); });
  for (let i = 0; i < 100; i++) {
    try { if ((await fetch(`${base}/api/admin/session`)).ok) return; } catch { /* starting */ }
    if (server.exitCode !== null) throw new Error(`server exited: ${output}`);
    await new Promise((resolve) => setTimeout(resolve, 200));
  }
  throw new Error(`server did not start: ${output}`);
};
const stop = async () => {
  if (!server || server.exitCode !== null) return;
  server.kill();
  await new Promise((resolve) => { server.once("exit", resolve); setTimeout(resolve, 3000); });
};
const request = (route, method = "GET", body, cookie = "") => fetch(`${base}${route}`, {
  method,
  headers: { ...(body ? { "Content-Type": "application/json" } : {}), ...(method !== "GET" ? { Origin: base } : {}), ...(cookie ? { Cookie: cookie } : {}) },
  body: body ? JSON.stringify(body) : undefined,
});

try {
  await start();
  const publicAuth = await (await request("/api/auth")).json();
  assert.equal(Object.hasOwn(publicAuth, "smtp"), false);
  assert.equal((await request("/api/settings")).status, 401);
  assert.equal((await request("/api/settings", "POST", { apiKey: "x", baseURL: "", model: "", generateModel: "", translateModel: "" })).status, 401);
  assert.equal((await request("/api/settings/test", "POST", {})).status, 401);
  assert.equal((await request("/api/admin/smtp")).status, 401);
  assert.equal((await request("/api/auth", "POST", { action: "save-smtp", user: "x@example.com", authCode: "x" })).status, 400);
  assert.equal((await fetch(`${base}/api/admin/session`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ password: initialPassword }) })).status, 403);
  assert.equal((await request("/api/admin/session", "POST", { password: "wrong" })).status, 401);

  const login = await request("/api/admin/session", "POST", { password: initialPassword });
  assert.equal(login.status, 200);
  const cookie = login.headers.get("set-cookie")?.split(";")[0] ?? "";
  assert.ok(cookie.startsWith("zhixing_admin_session="));
  assert.equal((await fetch(`${base}/api/settings`, { method: "POST", headers: { Origin: "https://other.example", Cookie: cookie, "Content-Type": "application/json" }, body: JSON.stringify({ apiKey: "x", baseURL: "", model: "", generateModel: "", translateModel: "" }) })).status, 403);
  const smtp = { user: "sender@example.com", host: "smtp.example.com", port: 465, authCode: "dummy-smtp-secret" };
  assert.equal((await request("/api/admin/smtp", "POST", smtp, cookie)).status, 200);
  const smtpResponse = await request("/api/admin/smtp", "GET", undefined, cookie);
  const smtpText = await smtpResponse.text();
  assert.equal(smtpResponse.status, 200);
  assert.equal(smtpText.includes(smtp.authCode), false);
  assert.equal(JSON.parse(smtpText).authCodeConfigured, true);
  assert.equal((await request("/api/admin/smtp", "POST", { ...smtp, host: "smtp2.example.com", authCode: "" }, cookie)).status, 200);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, "smtp.json"), "utf8")).authCode, smtp.authCode);

  const llm = { apiKey: "dummy-api-secret", baseURL: "https://example.com", model: "model-1", generateModel: "", translateModel: "" };
  assert.equal((await request("/api/settings", "POST", llm, cookie)).status, 200);
  const settingsText = await (await request("/api/settings", "GET", undefined, cookie)).text();
  assert.equal(settingsText.includes(llm.apiKey), false);
  assert.equal((await request("/api/settings", "POST", { ...llm, apiKey: "", model: "model-2" }, cookie)).status, 200);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dataDir, "settings.json"), "utf8")).llm.apiKey, llm.apiKey);
  await stop();
  fs.cpSync(dataDir, backupDir, { recursive: true });
  fs.unlinkSync(path.join(dataDir, "smtp.json"));
  fs.unlinkSync(path.join(dataDir, "settings.json"));
  fs.copyFileSync(path.join(backupDir, "smtp.json"), path.join(dataDir, "smtp.json"));
  fs.copyFileSync(path.join(backupDir, "settings.json"), path.join(dataDir, "settings.json"));
  await start();
  assert.equal((await request("/api/admin/smtp", "GET", undefined, cookie)).status, 200);
  assert.equal(JSON.parse(await (await request("/api/settings", "GET", undefined, cookie)).text()).llm.model, "model-2");

  assert.equal((await request("/api/admin/password", "POST", { currentPassword: initialPassword, newPassword: "replacement-test-passphrase" }, cookie)).status, 200);
  assert.equal((await request("/api/admin/smtp", "GET", undefined, cookie)).status, 401);
  assert.equal((await request("/api/admin/session", "POST", { password: initialPassword })).status, 401);
  const secondLogin = await request("/api/admin/session", "POST", { password: "replacement-test-passphrase" });
  assert.equal(secondLogin.status, 200);
  const secondCookie = secondLogin.headers.get("set-cookie")?.split(";")[0] ?? "";
  assert.equal((await request("/api/admin/session", "DELETE", undefined, secondCookie)).status, 200);
  assert.equal((await request("/api/admin/smtp", "GET", undefined, secondCookie)).status, 401);
  const expiryLogin = await request("/api/admin/session", "POST", { password: "replacement-test-passphrase" });
  const expiryCookie = expiryLogin.headers.get("set-cookie")?.split(";")[0] ?? "";
  const sessionsFile = path.join(dataDir, "admin-sessions.json");
  const sessions = JSON.parse(fs.readFileSync(sessionsFile, "utf8"));
  for (const key of Object.keys(sessions.sessions)) sessions.sessions[key] = 0;
  fs.writeFileSync(sessionsFile, JSON.stringify(sessions));
  assert.equal((await request("/api/admin/smtp", "GET", undefined, expiryCookie)).status, 401);
  console.log("Admin authorization, secret retention, restart and backup restoration, and logout checks passed.");
} finally {
  await stop();
  const tempRoot = fs.realpathSync(os.tmpdir()) + path.sep;
  for (const dir of [dataDir, backupDir]) {
    if (!path.resolve(dir).startsWith(tempRoot)) throw new Error("Refusing to remove a path outside the temporary directory");
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
