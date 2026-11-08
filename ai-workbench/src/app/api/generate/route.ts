import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
import { buildRuntimeGenerationInstruction } from "@/data/copywriting-runtime";
import { getTranslationPlaybook } from "@/data/translation-playbooks";
import { CONTRACT_VERSION, PLATFORMS, type Enterprise, type GenerateResult, type Platform, type PlatformVersions, type TranslationMode } from "@/contracts/content";
import { createLlmClient } from "@/lib/llm-client";

const creativeBriefSchema = z.object({
  mode: z.enum(["story", "seed", "brand"]), audience: z.string(), coreMessage: z.string(), storyAngle: z.string(), hook: z.string(),
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
const platformPairSchema = z.object({ A: versionSchema, B: versionSchema });

const CHINESE_PLATFORMS: Platform[] = ["xiaohongshu", "weibo", "douyin"];
const STORYBOARD_PLATFORMS: Platform[] = ["douyin", "tiktok"];

// 模型偶发会在 JSON 外包一层 markdown 代码块，先直解再截取花括号内容兜底
function parseLenient(raw: string): unknown {
  try { return JSON.parse(raw); } catch { /* 继续尝试截取 */ }
  const start = raw.indexOf("{");
  const end = raw.lastIndexOf("}");
  if (start >= 0 && end > start) return JSON.parse(raw.slice(start, end + 1));
  throw new Error("模型输出不是合法 JSON");
}

function platformSystemPrompt(enterprise: Enterprise, mode: TranslationMode, tone: string, platform: Platform, modeInstruction: string): string {
  const runtimeInstruction = buildRuntimeGenerationInstruction(enterprise, mode, tone, [platform], modeInstruction);
  const langRule = CHINESE_PLATFORMS.includes(platform)
    ? "本平台使用中文。"
    : "本平台使用英文；仅当用户在 goal 中明确指定其他语言时遵从用户指定。";
  const storyboardSkeleton = STORYBOARD_PLATFORMS.includes(platform)
    ? '，两版各再增加 "storyboard": [{"timeRange": "…", "shot": "…", "voiceover": "…", "bgm": "…"}]'
    : "";
  return `你是中小企业多平台传播策划。${runtimeInstruction} 本次目标平台：${platform}。${langRule}品牌名、地名和平台固有名称可保留专名；除用户明确要求外，不要把另一种语言的素材原文直接拼入句子，应自然转述。不得捏造事实、人物、数据、功效、用户评价、排名或实时热榜。只输出一个合法 JSON 对象，结构固定为：{"A": {"title": "…", "body": "…", "hashtags": ["…"]}, "B": {"title": "…", "body": "…", "hashtags": ["…"]}}${storyboardSkeleton}。顶层键仅使用 A 和 B，A、B 的值必须是对象而不是数组。`;
}

export async function POST(request: Request) {
  let input: z.infer<typeof requestSchema>;
  try { input = requestSchema.parse(await request.json()); }
  catch { return Response.json({ error: "请求格式不符合数据契约" }, { status: 400 }); }
  const enterprise = (enterprisesData as Enterprise[]).find((item) => item.id === input.enterpriseId);
  if (!enterprise) return Response.json({ error: "企业案例不存在" }, { status: 404 });
  const mode = input.translationMode ?? input.creativeBrief?.mode ?? "story";
  const playbook = getTranslationPlaybook(mode);
  const apiKey = process.env.GENERATE_LLM_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) return Response.json({ error: "未配置文案生成 API：请在 .env.local 中设置 GENERATE_LLM_API_KEY" }, { status: 503 });

  const selected = input.selectedMaterials.filter((item) => input.selectedMaterialIds.includes(item.id));
  const userPayload = { enterprise: { name: enterprise.name, industry: enterprise.industry, location: enterprise.location, tagline: enterprise.tagline }, selectedMaterials: selected, goal: input.goal, tone: input.tone, translationMode: input.translationMode, creativeBrief: input.creativeBrief };
  // 前端 100 秒中止，平台间还有 2s 错峰：单次 40s × 最多 2 次平台内尝试 ≈ 82s，
  // 保证任何单个平台的最坏情况也不越过前端预算，避免供应商卡顿时前端干到超时
  const client = createLlmClient({ apiKey, baseURL: process.env.GENERATE_LLM_BASE_URL || process.env.LLM_BASE_URL, timeoutMs: 40000, maxRetries: 1 });
  const model = process.env.GENERATE_LLM_MODEL || process.env.LLM_MODEL || "deepseek-chat";

  // 各平台并行请求：错峰 2 秒启动，避免同时新建多条连接触发供应商侧连接超时；
  // 单平台最多 2 次尝试，容忍模型偶发的结构瑕疵（漏字段、包数组）
  const tasks = input.platforms.map(async (platform: Platform, index: number): Promise<[Platform, PlatformVersions]> => {
    await new Promise((resolve) => setTimeout(resolve, index * 2000));
    let lastError: unknown;
    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const completion = await client.chat.completions.create({
          model,
          response_format: { type: "json_object" },
          reasoning_effort: "low",
          messages: [
            { role: "system", content: platformSystemPrompt(enterprise, mode, input.tone, platform, playbook.generationInstruction) },
            { role: "user", content: JSON.stringify({ ...userPayload, platform }) },
          ],
        });
        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error(`${platform}: 模型未返回内容`);
        const json = parseLenient(raw) as Record<string, unknown>;
        // 模型偶发把 A/B 的值包成数组，解包取其中第一个对象
        for (const key of ["A", "B"]) {
          if (Array.isArray(json[key])) json[key] = (json[key] as unknown[]).find((item) => item && typeof item === "object") ?? (json[key] as unknown[])[0];
        }
        const pair = platformPairSchema.parse(json);
        return [platform, { A: pair.A, B: pair.B }];
      } catch (error) {
        lastError = error;
        console.error(`[generate] ${platform} 第 ${attempt} 次尝试失败：`, String(error).slice(0, 300));
      }
    }
    throw lastError;
  });

  const settled = await Promise.allSettled(tasks);
  const failures = settled.flatMap((item) => item.status === "rejected" ? [`${item.reason}`] : []);
  if (failures.length > 0) {
    for (const failure of failures) console.error("[generate] 平台生成失败：", failure);
    return Response.json({ error: `部分平台生成失败（${failures.length}/${input.platforms.length}），请重试` }, { status: 502 });
  }
  const platforms = Object.fromEntries(settled.map((item) => item.status === "fulfilled" ? item.value : [])) as Partial<Record<Platform, PlatformVersions>>;
  const result: GenerateResult = { contractVersion: CONTRACT_VERSION, enterpriseId: enterprise.id, source: "ai", platforms };
  return Response.json(result);
}
