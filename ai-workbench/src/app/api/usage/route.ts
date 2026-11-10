import { connection } from "next/server";
import { addQuota, readUsage } from "@/lib/server-store";

// cacheComponents 模式下用 connection() 声明实时读取本地文件，禁止静态缓存

// 演示充值套餐：半成品阶段不接入真实支付，点击「立即充值」直接到账并记一条充值日志。
const PACKS: Record<string, { name: string; price: string; amount: number }> = {
  trial: { name: "体验包", price: "¥9.9", amount: 50 },
  standard: { name: "标准包", price: "¥29", amount: 200 },
  pro: { name: "专业包", price: "¥99", amount: 1000 },
};

export async function GET() {
  await connection();
  const usage = readUsage();
  return Response.json({
    used: usage.used,
    quota: usage.quota,
    remaining: Math.max(usage.quota - usage.used, 0),
    recentLog: usage.log.slice(0, 10),
    recharges: usage.recharges.slice(0, 10),
    packs: Object.entries(PACKS).map(([id, pack]) => ({ id, ...pack })),
  });
}

export async function POST(request: Request) {
  let body: { packId?: string };
  try { body = await request.json(); } catch { body = {}; }
  const pack = PACKS[body.packId ?? ""];
  if (!pack) return Response.json({ error: "充值套餐不存在" }, { status: 400 });
  const usage = addQuota(body.packId!, pack.amount);
  return Response.json({
    ok: true,
    message: `演示环境：已为「${pack.name}」充值 ${pack.amount} 次（未接入真实支付）`,
    used: usage.used,
    quota: usage.quota,
    remaining: Math.max(usage.quota - usage.used, 0),
  });
}
