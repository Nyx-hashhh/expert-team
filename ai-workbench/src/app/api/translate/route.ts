import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
import { getTranslationPlaybook } from "@/data/translation-playbooks";
import { CONTRACT_VERSION, type Enterprise, type TranslateRequest, type TranslateResult } from "@/contracts/content";
import { fitCreativeBriefToLimits, CREATIVE_BRIEF_LIMIT_INSTRUCTION } from "@/lib/creative-brief";
import { createLlmClient } from "@/lib/llm-client";
import { consumeUsage, getLlmConfig, hasQuota, quotaExceededMessage, resolveRequestSession, resolveScope } from "@/lib/server-store";

const materialSchema = z.object({ id: z.string(), type: z.enum(["product", "story", "reference"]), title: z.string().max(200), content: z.string().max(5000) });
const requestSchema = z.object({
  contractVersion: z.literal(CONTRACT_VERSION),
  enterpriseId: z.string(),
  enterpriseProfile: z.object({ name: z.string().trim().min(1).max(60), industry: z.string().trim().min(1).max(60), location: z.string().trim().max(60), tagline: z.string().trim().max(120) }).optional(),
  selectedMaterials: z.array(materialSchema).max(30),
  goal: z.string().trim().min(1).max(2000),
  tone: z.string().trim().min(1).max(80),
  mode: z.enum(["story", "seed", "brand"]),
});
const briefCandidateSchema = z.object({
  mode: z.enum(["story", "seed", "brand"]),
  audience: z.string().trim().min(1),
  coreMessage: z.string().trim().min(1),
  storyAngle: z.string().trim().min(1),
  hook: z.string().trim().min(1),
});

function parseBrief(raw: string, mode: TranslateRequest["mode"]): TranslateResult["brief"] {
  let json: unknown;
  try { json = JSON.parse(raw); }
  catch {
    // 模型偶发在 JSON 外包一层 markdown 代码块，截取花括号内容兜底
    const start = raw.indexOf("{");
    const end = raw.lastIndexOf("}");
    if (start < 0 || end <= start) throw new Error("invalid json");
    json = JSON.parse(raw.slice(start, end + 1));
  }
  // mode 由用户在前端选定，避免模型在该字段追加说明导致无谓失败
  if (json && typeof json === "object" && !Array.isArray(json)) (json as Record<string, unknown>).mode = mode;
  return fitCreativeBriefToLimits(briefCandidateSchema.parse(json));
}

export async function POST(request: Request) {
  let input: TranslateRequest;
  try { input = requestSchema.parse(await request.json()) as TranslateRequest; }
  catch { return Response.json({ error: "请填写客户诉求并选择有效的转译模式" }, { status: 400 }); }

  // 内置案例优先；自定义企业（前端 "+" 新增）未命中时回退使用请求自带的企业档案
  const enterprise = (enterprisesData as Enterprise[]).find((item) => item.id === input.enterpriseId)
    ?? (input.enterpriseProfile ? { id: input.enterpriseId, materials: [], accent: "", ...input.enterpriseProfile } as Enterprise : undefined);
  if (!enterprise) return Response.json({ error: "企业案例不存在" }, { status: 404 });
  const playbook = getTranslationPlaybook(input.mode);
  const { apiKey, baseURL, model } = getLlmConfig("translate");
  if (!apiKey) return Response.json({ error: "未配置智能转译 API：请前往「设置 → API 配置」填写 API 密钥" }, { status: 503 });
  const session = resolveRequestSession(request);
  if (session === "expired") return Response.json({ error: "登录已过期，请重新登录" }, { status: 401 });
  const scope = resolveScope(session?.email ?? null);
  if (!hasQuota(scope)) return Response.json({ error: quotaExceededMessage(scope) }, { status: 402 });

  // 前端 50 秒即中止：最多两次 16s 请求；正常的超长输出在本地直接压缩，
  // 只有空正文或 JSON 结构损坏才重试，避免为字数问题多等一轮模型。
  const client = createLlmClient({ apiKey, baseURL, timeoutMs: 16000, maxRetries: 0 });
  try {
    const systemPrompt = `你是资深内容策划，负责把客户的原始宣发诉求转成个性化、可执行的创意简报，而不是直接写成品广告。当前模式规则：${playbook.briefInstruction} 必须严格依据企业素材，不得虚构人物、经历、使用效果、数据、功效、排名或用户评价。不要堆砌形容词，不使用“赋能、引领、匠心打造、重新定义”等套话。${CREATIVE_BRIEF_LIMIT_INSTRUCTION} 只输出合法 JSON，字段为：mode、audience、coreMessage、storyAngle、hook。不写解释或多余字段。`;
    const sourcePayload = { enterprise, goal: input.goal, tone: input.tone, mode: input.mode, selectedMaterials: input.selectedMaterials };
    let brief: TranslateResult["brief"] | null = null;
    let lastError: unknown;

    for (let attempt = 1; attempt <= 2; attempt++) {
      const userContent = attempt === 1
        ? JSON.stringify(sourcePayload)
        : JSON.stringify({
          task: "上一轮没有返回可解析的完整 JSON。请按规定字段重新输出。",
          source: sourcePayload,
        });
      try {
        const completion = await client.chat.completions.create({
          model,
          response_format: { type: "json_object" },
          reasoning_effort: "low",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userContent },
          ],
        });
        const raw = completion.choices[0]?.message?.content;
        if (!raw) throw new Error(`模型未返回正文（finish_reason=${completion.choices[0]?.finish_reason ?? "unknown"}）`);
        brief = parseBrief(raw, input.mode);
        break;
      } catch (error) {
        lastError = error;
        console.error(`[translate] 第 ${attempt} 次输出未通过格式与字数校验：`, String(error).slice(0, 500));
      }
    }
    if (!brief) {
      console.error("[translate] 两次输出均无可用正文：", lastError);
      return Response.json({ error: "模型未返回可用的转译内容，请重试" }, { status: 502 });
    }
    // 只对成功消耗次数（演示计费：成功一次扣一次，登录用户记在账号名下）
    const usage = consumeUsage(scope, "translate", 1);
    console.log(`[usage] 转译成功，已用 ${usage.used}/${usage.quota} 次`);
    return Response.json({ contractVersion: CONTRACT_VERSION, source: "ai", brief } satisfies TranslateResult);
  } catch (error) {
    console.error("[translate] 上游 API 调用失败：", error);
    return Response.json({ error: "智能转译 API 调用失败：请检查网络与供应商配置后重试" }, { status: 502 });
  }
}
