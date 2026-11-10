import { connection } from "next/server";
import { z } from "zod";
import { createOrder, payOrder, readOrders, resolveRequestSession, usageFor } from "@/lib/server-store";

// cacheComponents 模式下用 connection() 声明实时读取本地文件，禁止静态缓存

// 演示充值套餐：不接入真实支付，先产生待支付订单，由前端确认「模拟支付」后到账（计入登录账号）。
const PACKS: Record<string, { name: string; price: string; amount: number }> = {
  trial: { name: "体验包", price: "¥9.9", amount: 50 },
  standard: { name: "标准包", price: "¥29", amount: 200 },
  pro: { name: "专业包", price: "¥99", amount: 1000 },
};

function expiredResponse() {
  return Response.json({ error: "登录已过期，请重新登录" }, { status: 401 });
}

export async function GET(request: Request) {
  await connection();
  const session = resolveRequestSession(request);
  // 携带了 token 但已失效： 明确告知前端登出重登，而不是悄悄展示游客额度造成误充
  if (session === "expired") return Response.json({ error: "登录已过期，请重新登录" }, { status: 401 });
  const email = session?.email ?? null;
  const bucket = usageFor({ email });
  const orders = email ? readOrders().orders.filter((item) => item.email === email).slice(0, 10) : [];
  return Response.json({
    account: email,
    used: bucket.used,
    quota: bucket.quota,
    remaining: Math.max(bucket.quota - bucket.used, 0),
    recentLog: bucket.log.slice(0, 10),
    recharges: bucket.recharges.slice(0, 10),
    orders,
    packs: Object.entries(PACKS).map(([id, pack]) => ({ id, ...pack })),
  });
}

const bodySchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("create-order"), packId: z.string() }),
  z.object({ action: z.literal("mock-pay"), orderId: z.string() }),
]);

export async function POST(request: Request) {
  let body: z.infer<typeof bodySchema>;
  try { body = bodySchema.parse(await request.json()); }
  catch { return Response.json({ error: "请求参数不合法" }, { status: 400 }); }
  const session = resolveRequestSession(request);
  if (!session) return Response.json({ error: "请先登录后再充值" }, { status: 401 });
  if (session === "expired") return expiredResponse();

  if (body.action === "create-order") {
    const pack = PACKS[body.packId];
    if (!pack) return Response.json({ error: "充值套餐不存在" }, { status: 400 });
    const order = createOrder(session.email, { id: body.packId, name: pack.name, amount: pack.amount, price: pack.price });
    return Response.json({ ok: true, order });
  }

  const order = payOrder(session.email, body.orderId);
  if (order === "not-found") return Response.json({ error: "订单不存在或与当前账号不符" }, { status: 404 });
  const bucket = usageFor({ email: session.email });
  return Response.json({
    ok: true,
    message: `模拟支付成功：已为 ${order.email} 充值 ${order.amount} 次（${order.packName} ${order.price}）`,
    account: session.email,
    used: bucket.used,
    quota: bucket.quota,
    remaining: Math.max(bucket.quota - bucket.used, 0),
  });
}
