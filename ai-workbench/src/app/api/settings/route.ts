import { z } from "zod";
import { connection } from "next/server";
import { getLlmConfig, maskApiKey, readSettings, writeSettings } from "@/lib/server-store";

const bodySchema = z.object({
  apiKey: z.string().max(400),
  baseURL: z.string().max(400),
  model: z.string().max(120),
  generateModel: z.string().max(120),
  translateModel: z.string().max(120),
});

export async function GET() {
  await connection();
  const saved = readSettings();
  const active = getLlmConfig("generate");
  return Response.json({
    llm: {
      // 不回传完整密钥，只回传掩码；保存时若提交的是掩码或空值则视为「未修改」
      apiKeyMasked: maskApiKey(saved.llm.apiKey || process.env.LLM_API_KEY || ""),
      hasEnvKey: Boolean(process.env.LLM_API_KEY || process.env.GENERATE_LLM_API_KEY),
      baseURL: saved.llm.baseURL,
      model: saved.llm.model,
      generateModel: saved.llm.generateModel,
      translateModel: saved.llm.translateModel,
      updatedAt: saved.updatedAt,
    },
    active: { apiKeyMasked: maskApiKey(active.apiKey), baseURL: active.baseURL ?? "", model: active.model },
  });
}

export async function POST(request: Request) {
  let input: z.infer<typeof bodySchema>;
  try { input = bodySchema.parse(await request.json()); }
  catch { return Response.json({ error: "设置内容格式不正确" }, { status: 400 }); }

  const previous = readSettings().llm;
  // 提交掩码（未修改）或空值时保留原有密钥；否则写入新密钥
  const isMasked = input.apiKey.includes("••••");
  const apiKey = isMasked || !input.apiKey ? previous.apiKey : input.apiKey.trim();

  writeSettings({
    apiKey,
    baseURL: input.baseURL.trim(),
    model: input.model.trim(),
    generateModel: input.generateModel.trim(),
    translateModel: input.translateModel.trim(),
  });

  const active = getLlmConfig("generate");
  return Response.json({ ok: true, active: { apiKeyMasked: maskApiKey(active.apiKey), model: active.model } });
}
