import { NextResponse } from "next/server";
import { z } from "zod";
import { ADMIN_COOKIE, ADMIN_SESSION_SECONDS, adminIsConfigured, createAdminSession, destroyAdminSession, hasAdminSession, privateHeaders, requireAdmin, sameOrigin, verifyAdminPassword } from "@/lib/admin-auth";

const loginSchema = z.object({ password: z.string().min(1).max(200) });

export async function GET(request: Request) {
  return Response.json({ authenticated: hasAdminSession(request), configured: adminIsConfigured() }, { headers: privateHeaders });
}

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "请求来源无效" }, { status: 403 });
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "请输入管理员口令" }, { status: 400 });
  const result = verifyAdminPassword(parsed.data.password);
  if (result === "unconfigured") return Response.json({ error: "管理员尚未初始化，请在服务器运行 npm run admin:init" }, { status: 503 });
  if (result === "locked") return Response.json({ error: "尝试次数过多，请 15 分钟后重试" }, { status: 429 });
  if (result !== "ok") return Response.json({ error: "管理员口令错误" }, { status: 401 });
  const response = NextResponse.json({ ok: true }, { headers: privateHeaders });
  response.cookies.set(ADMIN_COOKIE, createAdminSession(), {
    httpOnly: true, sameSite: "strict", secure: request.url.startsWith("https:") || request.headers.get("x-forwarded-proto") === "https",
    path: "/", maxAge: ADMIN_SESSION_SECONDS,
  });
  return response;
}

export async function DELETE(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;
  destroyAdminSession(request);
  const response = NextResponse.json({ ok: true }, { headers: privateHeaders });
  response.cookies.set(ADMIN_COOKIE, "", { path: "/", maxAge: 0, httpOnly: true, sameSite: "strict" });
  return response;
}
