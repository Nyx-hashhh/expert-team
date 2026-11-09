import { z } from "zod";
import { connection } from "next/server";
import { createSession, destroySession, hashPassword, readUsers, resolveSession, writeUsers } from "@/lib/server-store";

const postSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("register"), email: z.string().email().max(200), password: z.string().min(6).max(100) }),
  z.object({ action: z.literal("login"), email: z.string().email().max(200), password: z.string().max(100) }),
  z.object({ action: z.literal("logout"), token: z.string().max(200) }),
]);

// 模板版用户系统：邮箱 + 密码注册/登录，会话令牌由前端保存在 localStorage。
// 上线前需替换为真实邮箱验证码 + 加密存储，此处仅作界面与流程打通。
export async function GET(request: Request) {
  await connection();
  const token = new URL(request.url).searchParams.get("token") ?? "";
  const session = token ? resolveSession(token) : null;
  if (!session) return Response.json({ user: null });
  return Response.json({ user: { email: session.email, createdAt: session.createdAt } });
}

export async function POST(request: Request) {
  let input: z.infer<typeof postSchema>;
  try { input = postSchema.parse(await request.json()); }
  catch {
    return Response.json({ error: "请输入有效邮箱，密码至少 6 位" }, { status: 400 });
  }

  if (input.action === "logout") {
    destroySession(input.token);
    return Response.json({ ok: true });
  }

  const email = input.email.toLowerCase().trim();
  const store = readUsers();

  if (input.action === "register") {
    if (store.users.some((user) => user.email === email)) {
      return Response.json({ error: "该邮箱已注册，请直接登录" }, { status: 409 });
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
