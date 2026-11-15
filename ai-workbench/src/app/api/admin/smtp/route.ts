import { z } from "zod";
import { privateHeaders, requireAdmin } from "@/lib/admin-auth";
import { getSmtpConfig, readSmtp, writeSmtp } from "@/lib/server-store";

const schema = z.object({
  user: z.string().email().max(200),
  host: z.string().max(200),
  port: z.coerce.number().int().min(1).max(65535),
  authCode: z.string().max(200),
});

export async function GET(request: Request) {
  const denied = requireAdmin(request);
  if (denied) return denied;
  const saved = readSmtp();
  const active = getSmtpConfig();
  return Response.json({ user: saved.user || active.user, host: saved.host || active.host, port: saved.port || active.port, authCodeConfigured: Boolean(active.authCode) }, { headers: privateHeaders });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "发信配置格式不正确" }, { status: 400 });
  const previous = readSmtp();
  const authCode = parsed.data.authCode.trim() || previous.authCode || process.env.SMTP_AUTH_CODE || "";
  if (!authCode) return Response.json({ error: "首次保存需要填写 SMTP 授权码" }, { status: 400 });
  writeSmtp({ user: parsed.data.user.toLowerCase().trim(), host: parsed.data.host.trim(), port: parsed.data.port, authCode });
  return Response.json({ ok: true }, { headers: privateHeaders });
}
