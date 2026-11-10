import { z } from "zod";
import { getLlmConfig } from "@/lib/server-store";
import { createLlmClient } from "@/lib/llm-client";

const bodySchema = z.object({
  apiKey: z.string().max(400).optional(),
  baseURL: z.string().max(400).optional(),
  model: z.string().max(120).optional(),
});

// 用一次最小对话请求验证连通性（读取的是「表单里即将保存的值」，而不是已保存的设置）
export async function POST(request: Request) {
  let input: z.infer<typeof bodySchema>;
  try { input = bodySchema.parse(await request.json()); }
  catch { return Response.json({ error: "请求格式不正确" }, { status: 400 }); }

  const saved = getLlmConfig("generate");
  const apiKey = input.apiKey && !input.apiKey.includes("••••") ? input.apiKey.trim() : saved.apiKey;
  if (!apiKey) return Response.json({ ok: false, error: "请先填写 API 密钥" }, { status: 400 });

  const baseURL = input.baseURL?.trim() || saved.baseURL || undefined;
  const model = input.model?.trim() || saved.model || "deepseek-chat";
  // 本机到供应商边缘存在间歇性连接停摆，单发请求撞上一次就误报“密钥/配置不可用”，
  // 这里允许 SDK 重试一次跨过停摆窗口；两次尝试的预算仍远小于页面等待容忍度
  const client = createLlmClient({ apiKey, baseURL, timeoutMs: 15000, maxRetries: 1 });
  const startedAt = Date.now();
  try {
    const completion = await client.chat.completions.create({
      model,
      // 思考型模型会先消耗推理 token，预算太小会把 content 挤空，让“成功”看起来像“没连上”
      reasoning_effort: "low",
      messages: [{ role: "user", content: "回复两个字：连通" }],
      max_tokens: 256,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    return Response.json({ ok: true, model, latencyMs: Date.now() - startedAt, reply: reply.slice(0, 40) });
  } catch (error) {
    const raw = String(error);
    const hint = /timeout|timed out|UND_ERR|ECONN|fetch failed/i.test(raw)
      ? "连接上游超时：本机到供应商的网络偶发停摆，请稍候再点一次测试；若反复出现请检查网络或更换供应商地址"
      : raw.slice(0, 300);
    return Response.json({ ok: false, model, error: hint }, { status: 502 });
  }
}
