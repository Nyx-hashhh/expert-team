import OpenAI from "openai";
import { z } from "zod";
import enterprisesData from "@/data/enterprises.json";
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
});

export async function POST(request: Request) {
  let input: TranslateRequest;
  try { input = requestSchema.parse(await request.json()) as TranslateRequest; }
  catch { return Response.json({ error: "请填写客户诉求并选择有效的转译模式" }, { status: 400 }); }

  const enterprise = (enterprisesData as Enterprise[]).find((item) => item.id === input.enterpriseId);
  if (!enterprise) return Response.json({ error: "企业案例不存在" }, { status: 404 });
  const playbook = getTranslationPlaybook(input.mode);
  const apiKey = process.env.TRANSLATE_LLM_API_KEY || process.env.LLM_API_KEY;
  if (!apiKey) return Response.json({ error: "未配置智能转译 API：请在 .env.local 中设置 TRANSLATE_LLM_API_KEY" }, { status: 503 });

  const client = new OpenAI({
    apiKey,
    baseURL: process.env.TRANSLATE_LLM_BASE_URL || process.env.LLM_BASE_URL || undefined,
    // 前端 50 秒即中止：单次 16s + 最多 1 次重试 ≈ 33s，保证最坏情况也落在前端预算内，
    // 避免供应商卡顿时整段请求挂满重试链条，让用户对着加载圈干等
    timeout: 16000,
    maxRetries: 1,
  });
  try {
    const completion = await client.chat.completions.create({
      model: process.env.TRANSLATE_LLM_MODEL || process.env.LLM_MODEL || "deepseek-chat",
      response_format: { type: "json_object" },
      reasoning_effort: "low",
      messages: [
        { role: "system", content: `你是资深内容策划，负责把客户的原始宣发诉求转成个性化、可执行的创意简报，而不是直接写成品广告。当前模式规则：${playbook.briefInstruction} 必须严格依据企业素材，不得虚构人物、经历、使用效果、数据、功效、排名或用户评价。不要堆砌形容词，不使用“赋能、引领、匠心打造、重新定义”等套话。只输出合法 JSON，字段为：mode、audience、coreMessage、storyAngle、hook。每项都用一句具体、可执行的中文表述，不写解释或多余字段。` },
        { role: "user", content: JSON.stringify({ enterprise, goal: input.goal, tone: input.tone, mode: input.mode, selectedMaterials: input.selectedMaterials }) },
      ],
    });
    const raw = completion.choices[0]?.message?.content;
    if (!raw) return Response.json({ error: "模型未返回内容，请重试" }, { status: 502 });
    let brief: TranslateResult["brief"];
    try {
      let json: unknown;
      try { json = JSON.parse(raw); }
      catch {
        // 模型偶发在 JSON 外包一层 markdown 代码块，截取花括号内容兜底
        const start = raw.indexOf("{");
        const end = raw.lastIndexOf("}");
        if (start < 0 || end <= start) throw new Error("invalid json");
        json = JSON.parse(raw.slice(start, end + 1));
      }
      brief = briefSchema.parse(json);
    }
    catch (error) {
      console.error("[translate] 模型返回内容解析失败：", error, "finish_reason=", completion.choices[0]?.finish_reason, "usage=", JSON.stringify(completion.usage), "raw头300字=", raw.slice(0, 300), "raw尾200字=", raw.slice(-200));
      return Response.json({ error: "模型返回内容不符合约定格式，请重试" }, { status: 502 });
    }
    return Response.json({ contractVersion: CONTRACT_VERSION, source: "ai", brief } satisfies TranslateResult);
  } catch (error) {
    console.error("[translate] 上游 API 调用失败：", error);
    return Response.json({ error: "智能转译 API 调用失败：请检查网络与供应商配置后重试" }, { status: 502 });
  }
}
