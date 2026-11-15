import { z } from "zod";
import { changeAdminPassword, privateHeaders, requireAdmin, verifyAdminPassword } from "@/lib/admin-auth";

const schema = z.object({ currentPassword: z.string().min(1).max(200), newPassword: z.string().min(8).max(200) });

export async function POST(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;
  const parsed = schema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return Response.json({ error: "新口令至少 8 位" }, { status: 400 });
  if (verifyAdminPassword(parsed.data.currentPassword) !== "ok") return Response.json({ error: "当前口令错误" }, { status: 401 });
  changeAdminPassword(parsed.data.newPassword);
  return Response.json({ ok: true }, { headers: privateHeaders });
}
