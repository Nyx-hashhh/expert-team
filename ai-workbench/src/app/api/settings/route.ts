import { z } from "zod";
import { connection } from "next/server";
import { getLlmConfig, readSettings, writeSettings } from "@/lib/server-store";
import { privateHeaders, requireAdmin } from "@/lib/admin-auth";

const bodySchema = z.object({
  apiKey: z.string().max(400),
  baseURL: z.string().max(400),
  model: z.string().max(120),
  generateModel: z.string().max(120),
  translateModel: z.string().max(120),
});

export async function GET(request: Request) {
  await connection();
  const denied = requireAdmin(request);
  if (denied) return denied;
  const saved = readSettings();
  const active = getLlmConfig("generate");
  return Response.json({
    llm: {
      apiKeyConfigured: Boolean(saved.llm.apiKey || process.env.LLM_API_KEY || process.env.GENERATE_LLM_API_KEY),
      hasEnvKey: Boolean(process.env.LLM_API_KEY || process.env.GENERATE_LLM_API_KEY),
      baseURL: saved.llm.baseURL,
      model: saved.llm.model,
      generateModel: saved.llm.generateModel,
      translateModel: saved.llm.translateModel,
      updatedAt: saved.updatedAt,
    },
    active: { apiKeyConfigured: Boolean(active.apiKey), baseURL: active.baseURL ?? "", model: active.model },
  }, { headers: privateHeaders });
}

export async function POST(request: Request) {
  const denied = requireAdmin(request, true);
  if (denied) return denied;
  let input: z.infer<typeof bodySchema>;
  try { input = bodySchema.parse(await request.json()); }
  catch { return Response.json({ error: "设置内容格式不正确" }, { status: 400 }); }

  const previous = readSettings().llm;
  // Empty means keep the configured secret, including an environment fallback.
  const apiKey = input.apiKey.trim() || previous.apiKey || process.env.LLM_API_KEY || process.env.GENERATE_LLM_API_KEY || "";

  writeSettings({
    apiKey,
    baseURL: input.baseURL.trim(),
    model: input.model.trim(),
    generateModel: input.generateModel.trim(),
    translateModel: input.translateModel.trim(),
  });

  const active = getLlmConfig("generate");
  return Response.json({ ok: true, active: { apiKeyConfigured: Boolean(active.apiKey), model: active.model } }, { headers: privateHeaders });
}
