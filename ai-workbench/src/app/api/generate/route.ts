import OpenAI from "openai";
import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
import { buildFallback } from "@/data/fallback";
import { getTranslationPlaybook } from "@/data/translation-playbooks";
import { CONTRACT_VERSION, PLATFORMS, type Enterprise, type GenerateResult } from "@/contracts/content";

const creativeBriefSchema = z.object({
  mode: z.enum(["story", "seed", "brand"]), audience: z.string(), coreMessage: z.string(), storyAngle: z.string(), hook: z.string(),
  storyArc: z.array(z.string()), humanTouch: z.array(z.string()), avoid: z.array(z.string()),
});

const requestSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  enterpriseId: z.string(),
  selectedMaterialIds: z.array(z.string()),
  selectedMaterials: z.array(z.object({ id: z.string(), type: z.enum(["product", "story", "reference"]), title: z.string().max(200), content: z.string().max(5000) })).max(30),
  goal: z.string().trim().min(1).max(2000),
  platforms: z.array(z.enum(PLATFORMS)).min(1),
  tone: z.string().max(80),
  translationMode: z.enum(["story", "seed", "brand"]).optional(),
  creativeBrief: creativeBriefSchema.optional(),
});

const versionSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  hashtags: z.array(z.string()).min(1),
  storyboard: z.array(z.object({ timeRange: z.string(), shot: z.string(), voiceover: z.string(), bgm: z.string() })).optional(),
});
const resultSchema = z.object({
  xiaohongshu: z.object({ A: versionSchema, B: versionSchema }).optional(),
  weibo: z.object({ A: versionSchema, B: versionSchema }).optional(),
  douyin: z.object({ A: versionSchema, B: versionSchema }).optional(),
  reddit: z.object({ A: versionSchema, B: versionSchema }).optional(),
  discord: z.object({ A: versionSchema, B: versionSchema }).optional(),
  instagram: z.object({ A: versionSchema, B: versionSchema }).optional(),
  tiktok: z.object({ A: versionSchema, B: versionSchema }).optional(),
});

export async function POST(request: Request) {
  let input: z.infer<typeof requestSchema>;
  try { input = requestSchema.parse(await request.json()); }
  catch { return Response.json({ error: "请求格式不符合数据契约" }, { status: 400 }); }
  const enterprise = (enterprisesData as Enterprise[]).find((item) => item.id === input.enterpriseId);
  if (!enterprise) return Response.json({ error: "企业案例不存在" }, { status: 404 });
  const fallback = () => Response.json(buildFallback(input, enterprise));
  const playbook = getTranslationPlaybook(input.translationMode ?? input.creativeBrief?.mode ?? "story");
  const apiKey = process.env.LLM_API_KEY;
  if (!apiKey) return fallback();

  const selected = input.selectedMaterials.filter((item) => input.selectedMaterialIds.includes(item.id));
  const client = new OpenAI({ apiKey, baseURL: process.env.LLM_BASE_URL || undefined, timeout: 5200, maxRetries: 0 });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.LLM_MODEL || "deepseek-chat",
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: `你是中小企业多平台传播策划。当前内容模式必须遵循：${playbook.generationInstruction} 只输出合法 JSON 对象。按创意简报为每个平台生成 A/B 两个真正不同切口的原生文案：xiaohongshu、weibo、douyin 使用中文；reddit、discord、instagram、tiktok 四个平台统一使用同一种语言，优先遵从用户在 goal 中明确指定的语言，未指定时跟随 goal 的主要语言。四个国外平台每版的 title、body、hashtags，以及 TikTok storyboard 的 shot、voiceover、bgm 必须语言一致。品牌名、地名和平台固有名称可保留专名；除用户明确要求外，不要把另一种语言的素材原文直接拼入句子，应自然转述。每版包含 title、body、hashtags 字符串数组；douyin 与 tiktok 每版另含 storyboard 数组，每项含 timeRange、shot、voiceover、bgm。Reddit 以讨论和真实交流为主；Discord 适合社群互动；Instagram 注重视觉叙事；TikTok 强调开头钩子与节奏。避免整齐排比、口号、空泛升华与“赋能、引领、匠心打造、重新定义”等套话。不得捏造事实、人物、数据、功效、用户评价、排名或实时热榜。JSON 顶层键仅使用 xiaohongshu、weibo、douyin、reddit、discord、instagram、tiktok。` },
        { role: "user", content: JSON.stringify({ enterprise: { name: enterprise.name, industry: enterprise.industry, location: enterprise.location, tagline: enterprise.tagline }, selectedMaterials: selected, goal: input.goal, platforms: input.platforms, tone: input.tone, translationMode: input.translationMode, creativeBrief: input.creativeBrief }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return fallback();
    const parsed = resultSchema.parse(JSON.parse(raw));
    for (const platform of input.platforms) if (!parsed[platform]) return fallback();
    const result: GenerateResult = { contractVersion: CONTRACT_VERSION, enterpriseId: enterprise.id, source: "ai", platforms: Object.fromEntries(input.platforms.map((platform) => [platform, parsed[platform]])) };
    return Response.json(result);
  } catch { return fallback(); }
}
