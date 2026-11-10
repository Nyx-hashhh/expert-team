import { z } from "zod";
import nodemailer from "nodemailer";
import { connection } from "next/server";
import {
  CODE_TTL_MS,
  createEmailCode,
  createSession,
  deleteEmailCode,
  destroySession,
  getSmtpConfig,
  hashPassword,
  maskApiKey,
  readUsers,
  resolveSession,
  verifyEmailCode,
  writeSmtp,
  writeUsers,
} from "@/lib/server-store";

const postSchema = z.discriminatedUnion("action", [
  z.object({
    action: z.literal("register"),
    email: z.string().email().max(200),
    password: z.string().min(6).max(100),
    code: z.string().regex(/^\d{6}$/, "验证码为 6 位数字"),
  }),
  z.object({ action: z.literal("login"), email: z.string().email().max(200), password: z.string().max(100) }),
  z.object({ action: z.literal("logout"), token: z.string().max(200) }),
  z.object({ action: z.literal("send-code"), email: z.string().email().max(200) }),
  z.object({
    action: z.literal("save-smtp"),
    user: z.string().email().max(200),
    authCode: z.string().min(1).max(200),
    host: z.string().max(200).optional(),
    port: z.coerce.number().int().min(1).max(65535).optional(),
  }),
]);

// 用户系统：邮箱 + 密码 + 邮箱验证码注册，会话令牌由前端保存在 localStorage。
// 验证码只存哈希（.local-data/email-codes.json），10 分钟有效、一次性使用、60 秒内禁止重发。
export async function GET(request: Request) {
  await connection();
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const session = token ? resolveSession(token) : null;
  // 附带发信邮箱配置状态（只回传掩码，不回传授权码）
  const smtp = getSmtpConfig();
  const smtpStatus = {
    user: smtp.user,
    authCodeMasked: maskApiKey(smtp.authCode),
    host: smtp.host,
    hasEnvCode: Boolean(process.env.SMTP_AUTH_CODE),
  };
  if (!session) return Response.json({ user: null, smtp: smtpStatus });
  return Response.json({ user: { email: session.email, createdAt: session.createdAt }, smtp: smtpStatus });
}

export async function POST(request: Request) {
  let input: z.infer<typeof postSchema>;
  try { input = postSchema.parse(await request.json()); }
  catch {
    return Response.json({ error: "请输入有效邮箱，密码至少 6 位，验证码为 6 位数字" }, { status: 400 });
  }

  if (input.action === "logout") {
    destroySession(input.token);
    return Response.json({ ok: true });
  }

  // —— 保存发信邮箱 SMTP 授权码（存 .local-data/smtp.json，不入仓库） ——
  if (input.action === "save-smtp") {
    const user = input.user.toLowerCase().trim();
    const host = (input.host ?? "").trim();
    const port = input.port ?? 465;
    writeSmtp({ user, authCode: input.authCode.trim(), host, port });
    return Response.json({ ok: true, smtp: { user, authCodeMasked: maskApiKey(input.authCode.trim()), host, port } });
  }

  const email = input.email.toLowerCase().trim();
  const store = readUsers();

  // —— 发送注册验证码 ——
  if (input.action === "send-code") {
    if (store.users.some((user) => user.email === email)) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    }

    let code: string;
    try {
      code = createEmailCode(email);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      if (msg !== "SEND_TOO_FREQUENT") {
        console.error("[send-code] createEmailCode failed:", err);
        return Response.json({ error: `验证码生成失败：${msg}` }, { status: 500 });
      }
      return Response.json({ error: "发送太频繁，请 1 分钟后再试" }, { status: 429 });
    }

    const smtp = getSmtpConfig();
    if (!smtp.user || !smtp.authCode || !smtp.host) {
      deleteEmailCode(email);
      return Response.json(
        { error: "尚未配置发信邮箱：请先在本页「发信邮箱配置」填入邮箱与 SMTP 授权码（或设置环境变量 SMTP_USER / SMTP_AUTH_CODE）" },
        { status: 400 },
      );
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.port === 465,
      auth: { user: smtp.user, pass: smtp.authCode },
      connectionTimeout: 10_000,
    });

    const ttlMinutes = Math.round(CODE_TTL_MS / 60_000);
    try {
      await transporter.sendMail({
        from: `"知行传播工作台" <${smtp.user}>`,
        to: email,
        subject: `注册验证码：${code}`,
        text: `您正在注册「知行传播工作台」，验证码：${code}，${ttlMinutes} 分钟内有效。若非本人操作请忽略本邮件。`,
        html: `<p>您正在注册「知行传播工作台」。</p><p style="font-size:22px;font-weight:700;letter-spacing:4px">${code}</p><p style="color:#888">验证码 ${ttlMinutes} 分钟内有效。若非本人操作请忽略本邮件。</p>`,
      });
      return Response.json({ ok: true, expiresIn: Math.round(CODE_TTL_MS / 1000) });
    } catch (err) {
      deleteEmailCode(email); // 发信失败则撤销验证码，允许用户修好配置后立即重试
      const detail = err instanceof Error ? err.message.slice(0, 200) : "未知错误";
      return Response.json({ error: `邮件发送失败（${detail}）。请检查授权码是否正确、SMTP 服务是否已开启` }, { status: 502 });
    }
  }

  if (input.action === "register") {
    if (store.users.some((user) => user.email === email)) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
    }
    // 先校验验证码（未过期、未用过、哈希一致），通过即作废
    if (!verifyEmailCode(email, input.code)) {
      return Response.json({ error: "验证码错误或已过期，请重新获取" }, { status: 400 });
    }
    store.users.push({ email, passwordHash: hashPassword(email, input.password), createdAt: new Date().toISOString() });
    writeUsers(store);
    const token = createSession(email);
    return Response.json({ ok: true, token, user: { email } });
  }

  // login
  const user = store.users.find((item) => item.email === email);
  if (!user || user.passwordHash !== hashPassword(email, input.password)) {
    return Response.json({ error: "邮箱或密码不正确" }, { status: 401 });
  }
  const token = createSession(email);
  return Response.json({ ok: true, token, user: { email } });
}
