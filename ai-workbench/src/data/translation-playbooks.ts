import type { TranslationMode } from "@/contracts/content";

export interface TranslationPlaybook {
  briefInstruction: string;
  generationInstruction: string;
}

export const TRANSLATION_PLAYBOOKS: Record<TranslationMode, TranslationPlaybook> = {
  story: {
    briefInstruction: "面向偏爱文学表达、愿意沉浸阅读的宣发受众。围绕一个可核验的具体案例，以散文或小说的叙事质感设计开端、发展、高潮、结局、尾声。写清人物购买产品或品牌研发产品的原因、心路历程、困难、转折与承诺；让核心卖点在关键事件中被感受到，而不是单独罗列。细节应具体、生动、有因果，不虚构人物经历与戏剧冲突。",
    generationInstruction: "采用文学化五幕叙事：开端建立人物与伏笔，发展呈现寻找、犹豫或研发困难，高潮用关键选择或真实验证承载核心卖点，结局落到可观察变化，尾声用意象回环并给出具体承诺。语言详实、有感官细节和心理变化，避免把故事写成长版说明书。",
  },
  seed: {
    briefInstruction: "以某个真实人物的使用原因、过程和感受为主线，像对家人或好朋友分享一次有用的发现。先说明为什么需要、怎样选择，再写第一次使用和真实场景，从体验细节自然归纳产品特点与卖点。明确适合人群、适用场景和使用边界；区分个人感受与客观事实，不伪装消费者、不虚构使用天数或效果。",
    generationInstruction: "采用朋友式体验分享：从日常困扰与购买缘由开始，还原选择和使用过程，用一个体验细节证明一个卖点，说明适合谁、适合什么场景及可能不适合谁。语气亲切自然、坦诚克制，不使用销售话术或无依据的极端推荐。",
  },
  brand: {
    briefInstruction: "目标是增加品牌正向声音并形成稳定心智，让消费者比较同类产品时优先想起、信任和选择该品牌。先明确品牌所属品类与唯一核心优势，再以研发能力、品类专注、团队、标准或时间沉淀证明专业性，以认证、检测、奖项、销量、好评或渠道事实建立权威性，最后落到消费者选择利益。所有排名与权威表述必须有完整可核验证据。",
    generationInstruction: "采用品牌心智表达：先完成品类定锚，再提出一个核心差异，依次用专业能力与权威证据支撑，并解释这些能力对消费者选择的实际价值。保持核心概念一致，促进认知、信任与购买；禁止无证据使用第一、唯一、领先、权威推荐等表述。",
  },
};

export function getTranslationPlaybook(mode: TranslationMode) {
  return TRANSLATION_PLAYBOOKS[mode];
}
