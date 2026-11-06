import OpenAI from "openai";
import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
import { buildCreativeBrief } from "@/data/translation";
import { getTranslationPlaybook } from "@/data/translation-playbooks";
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
  const playbook = getTranslationPlaybook(input.mode);
  const apiKey = process.env.TRANSLATE_LLM_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) return Response.json({ contractVersion: CONTRACT_VERSION, source: "local", brief: localBrief } satisfies TranslateResult);

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.TRANSLATE_LLM_BASE_URL || process.env.LLM_BASE_URL || undefined,
    timeout: 5000,
    maxRetries: 0,
  });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.TRANSLATE_LLM_MODEL || process.env.LLM_MODEL || "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `你是资深内容策划，负责把客户的原始宣发诉求转成个性化、可执行的创意简报，而不是直接写成品广告。当前模式规则：${playbook.briefInstruction} 必须严格依据企业素材，不得虚构人物、经历、使用效果、数据、功效、排名或用户评价。不要堆砌形容词，不使用“赋能、引领、匠心打造、重新定义”等套话。只输出合法 JSON，字段为：mode、audience、coreMessage、storyAngle、hook、storyArc（3-6项）、humanTouch（2-6项）、avoid（2-8项）。humanTouch 必须填写“为完成当前创意，建议用户继续补充或核实的事实与证据”，并针对企业、品类、诉求和所选素材指出具体缺口，不得填写泛泛的写作建议。` },
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
