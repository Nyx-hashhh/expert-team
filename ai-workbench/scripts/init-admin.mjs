import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import crypto from "node:crypto";
import readline from "node:readline";

const directory = process.env.WORKBENCH_DATA_DIR || path.join(os.homedir(), ".zhixing-workbench");
const target = path.join(directory, "admin-auth.json");
fs.mkdirSync(directory, { recursive: true, mode: 0o700 });
if (fs.existsSync(target)) {
  console.error("管理员已初始化。请在设置页登录后修改口令。");
  process.exit(1);
}

const terminal = readline.createInterface({ input: process.stdin, output: process.stdout });
const originalWrite = terminal._writeToOutput.bind(terminal);
let hidden = true;
terminal._writeToOutput = (text) => { if (!hidden) originalWrite(text); };
process.stdout.write("请输入初始管理员口令（至少 8 位）：");
const password = await new Promise((resolve) => terminal.question("", resolve));
hidden = false;
process.stdout.write("\n");
terminal.close();
if (password.length < 8 || password.length > 200) {
  console.error("口令长度须为 8 至 200 位。");
  process.exit(1);
}

const salt = crypto.randomBytes(16);
const hash = crypto.scryptSync(password, salt, 64);
const tmp = `${target}.${crypto.randomBytes(6).toString("hex")}.tmp`;
try {
  fs.writeFileSync(tmp, JSON.stringify({ salt: salt.toString("hex"), hash: hash.toString("hex"), failed: 0, lockedUntil: 0 }, null, 2), { mode: 0o600 });
  fs.renameSync(tmp, target);
} finally {
  if (fs.existsSync(tmp)) fs.unlinkSync(tmp);
}
console.log("管理员已初始化；凭据保存在服务端持久目录。请妥善备份该目录。");
