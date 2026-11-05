import OpenAI from "openai";
import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
import { buildCreativeBrief } from "@/data/translation";
import { CONTRACT_VERSION, type Enterprise, type TranslateRequest, type TranslateResult } from "@/contracts/content";

const materialSchema = z.object({ id: z.string(), type: z.enum(["product", "story", "reference"]), title: z.string().max(200), content: z.string().max(5000) });
const requestSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  enterpriseId: z.string(),
  selectedMaterials: z.array(materialSchema).max(30),
  goal: z.string().trim().min(1).max(2000),
  tone: z.string().trim().min(1).max(80),
  mode: z.enum(["story", "seed", "brand"]),
});
const briefSchema = z.object({
  mode: z.enum(["story", "seed", "brand"]),
  audience: z.string().min(1),
  coreMessage: z.string().min(1),
  storyAngle: z.string().min(1),
  hook: z.string().min(1),
  storyArc: z.array(z.string().min(1)).min(3).max(6),
  humanTouch: z.array(z.string().min(1)).min(2).max(6),
  avoid: z.array(z.string().min(1)).min(2).max(8),
});

export async function POST(request: Request) {
  let input: TranslateRequest;
  try { input = requestSchema.parse(await request.json()) as TranslateRequest; }
  catch { return Response.json({ error: "请填写客户诉求并选择有效的转译模式" }, { status: 400 }); }

  const enterprise = (enterprisesData as Enterprise[]).find((item) => item.id === input.enterpriseId);
  if (!enterprise) return Response.json({ error: "企业案例不存在" }, { status: 404 });
  const localBrief = buildCreativeBrief(input, enterprise);
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return Response.json({ contractVersion: CONTRACT_VERSION, source: "local", brief: localBrief } satisfies TranslateResult);

  const client = new OpenAI({ apiKey, baseURL: process.env.LLM_BASE_URL || undefined, timeout: 5000, maxRetries: 0 });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: "你是资深内容策划，负责把客户的原始推广诉求转成可执行的文案创意简报。只输出合法 JSON。不要写成品广告，不要堆砌形容词，不使用‘赋能、引领、匠心打造、重新定义’等套话。必须从素材中寻找真实细节，用人物、场景、冲突和克制的情绪建立故事感。输出字段：mode、audience、coreMessage、storyAngle、hook、storyArc（3-6项）、humanTouch（2-6项）、avoid（2-8项）。" },
        { role: "user", content: JSON.stringify({ enterprise, goal: input.goal, tone: input.tone, mode: input.mode, selectedMaterials: input.selectedMaterials, localDraftForReference: localBrief }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return Response.json({ contractVersion: CONTRACT_VERSION, source: "local", brief: localBrief } satisfies TranslateResult);
    const brief = briefSchema.parse(JSON.parse(raw));
    return Response.json({ contractVersion: CONTRACT_VERSION, source: "ai", brief } satisfies TranslateResult);
  } catch {
    return Response.json({ contractVersion: CONTRACT_VERSION, source: "local", brief: localBrief } satisfies TranslateResult);
  }
}
