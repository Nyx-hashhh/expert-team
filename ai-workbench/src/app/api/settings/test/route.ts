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
  const client = createLlmClient({ apiKey, baseURL, timeoutMs: 15000, maxRetries: 0 });
  const startedAt = Date.now();
  try {
    const completion = await client.chat.completions.create({
      model,
      messages: [{ role: "user", content: "回复两个字：连通" }],
      max_tokens: 8,
    });
    const reply = completion.choices[0]?.message?.content?.trim() ?? "";
    return Response.json({ ok: true, model, latencyMs: Date.now() - startedAt, reply: reply.slice(0, 40) });
  } catch (error) {
    return Response.json({ ok: false, model, error: String(error).slice(0, 300) }, { status: 502 });
  }
}
