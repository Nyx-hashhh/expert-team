import type { Material, TranslationMode } from "@/contracts/content";

export interface TranslationPlaybook {
  briefInstruction: string;
  generationInstruction: string;
  arcLabel: string;
  evidenceLabel: string;
}

export const TRANSLATION_PLAYBOOKS: Record<TranslationMode, TranslationPlaybook> = {
  story: {
    arcLabel: "文学化五幕",
    evidenceLabel: "完成故事前建议补充",
    briefInstruction: "面向偏爱文学表达、愿意沉浸阅读的宣发受众。围绕一个可核验的具体案例，以散文或小说的叙事质感设计开端、发展、高潮、结局、尾声。写清人物购买产品或品牌研发产品的原因、心路历程、困难、转折与承诺；让核心卖点在关键事件中被感受到，而不是单独罗列。细节应具体、生动、有因果，不虚构人物经历与戏剧冲突。",
    generationInstruction: "采用文学化五幕叙事：开端建立人物与伏笔，发展呈现寻找、犹豫或研发困难，高潮用关键选择或真实验证承载核心卖点，结局落到可观察变化，尾声用意象回环并给出具体承诺。语言详实、有感官细节和心理变化，避免把故事写成长版说明书。",
  },
  seed: {
    arcLabel: "朋友式体验路径",
    evidenceLabel: "形成可信体验前建议补充",
    briefInstruction: "以某个真实人物的使用原因、过程和感受为主线，像对家人或好朋友分享一次有用的发现。先说明为什么需要、怎样选择，再写第一次使用和真实场景，从体验细节自然归纳产品特点与卖点。明确适合人群、适用场景和使用边界；区分个人感受与客观事实，不伪装消费者、不虚构使用天数或效果。",
    generationInstruction: "采用朋友式体验分享：从日常困扰与购买缘由开始，还原选择和使用过程，用一个体验细节证明一个卖点，说明适合谁、适合什么场景及可能不适合谁。语气亲切自然、坦诚克制，不使用销售话术或无依据的极端推荐。",
  },
  brand: {
    arcLabel: "品牌心智路径",
    evidenceLabel: "建立品牌背书前建议补充",
    briefInstruction: "目标是增加品牌正向声音并形成稳定心智，让消费者比较同类产品时优先想起、信任和选择该品牌。先明确品牌所属品类与唯一核心优势，再以研发能力、品类专注、团队、标准或时间沉淀证明专业性，以认证、检测、奖项、销量、好评或渠道事实建立权威性，最后落到消费者选择利益。所有排名与权威表述必须有完整可核验证据。",
    generationInstruction: "采用品牌心智表达：先完成品类定锚，再提出一个核心差异，依次用专业能力与权威证据支撑，并解释这些能力对消费者选择的实际价值。保持核心概念一致，促进认知、信任与购买；禁止无证据使用第一、唯一、领先、权威推荐等表述。",
  },
};

export function getTranslationPlaybook(mode: TranslationMode) {
  return TRANSLATION_PLAYBOOKS[mode];
}

export function buildEvidencePrompts(mode: TranslationMode, enterpriseName: string, industry: string, goal: string, materials: Material[]) {
  const hasProduct = materials.some((item) => item.type === "product");
  const hasStory = materials.some((item) => item.type === "story");
  const goalSummary = goal.trim().slice(0, 36);

  if (mode === "story") {
    return [
      `确认一个与“${goalSummary}”直接相关的真实主角或具体案例，以及人物与${enterpriseName}的关系`,
      hasStory ? "核实素材中的品牌经历，并补充一次真实困难、关键选择和前后变化" : "补充购买产品或研发产品的真实原因、心路历程、困难挫折与转折点",
      `补充能代表${industry}的动作、环境、气味、声音、触感或对话等现场细节`,
      hasProduct ? "说明哪项产品参数在故事高潮中得到验证，以及它给人物带来的具体变化" : "补充核心产品特征、主要卖点及可被事件验证的事实依据",
      `确认${enterpriseName}能够长期兑现的具体承诺、服务标准或行动，避免空泛誓言`,
    ];
  }

  if (mode === "seed") {
    return [
      `补充分享者的真实身份特征、原有习惯，以及为什么需要解决“${goalSummary}”`,
      "说明实际使用时长、频率、步骤和至少一个具体生活场景",
      "补充第一次使用和持续使用中的可感知细节，并区分个人感受与客观参数",
      hasProduct ? "核实每个主要卖点对应的使用证据，避免只重复产品参数" : "补充产品参数、使用方法和能支撑体验判断的事实",
      "说明适合人群、适用场景、不适合情况及仍需观察的部分",
    ];
  }

  return [
    `确认希望${enterpriseName}在消费者心中占据的唯一核心关键词，以及与“${goalSummary}”的关系`,
    `补充${industry}相关的研发能力、团队资历、品类专注年限、标准或长期投入`,
    "如使用认证、检测、专利或奖项，请提供名称、对象、发布机构、年份和有效范围",
    "如使用销量第一、好评第一等排名，请提供品类、渠道或地区、统计周期、样本和发布方",
    "说明上述专业或权威事实最终为消费者带来的品质、体验、稳定性或服务利益",
  ];
}
