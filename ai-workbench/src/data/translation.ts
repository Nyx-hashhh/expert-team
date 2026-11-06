import type { CreativeBrief, Enterprise, TranslateRequest, TranslationMode } from "@/contracts/content";
import { buildEvidencePrompts } from "@/data/translation-playbooks";

const audienceWords = ["年轻白领", "白领", "职场人", "年轻人", "宝妈", "家庭", "情侣", "游客", "学生", "送礼人群", "消费者"];
const sceneWords = ["送礼", "办公室", "通勤", "周末", "旅行", "节日", "聚会", "家庭", "下午茶", "新品上市", "早鸟"];

function firstSentence(value: string, fallback: string) {
  return value.trim().split(/[。！？!？\n]/).find(Boolean)?.trim() || fallback;
}

function findCue(goal: string, words: string[], fallback: string) {
  return words.find((word) => goal.includes(word)) ?? fallback;
}

function modeCopy(mode: TranslationMode, enterprise: Enterprise, audience: string, scene: string, proof: string) {
  if (mode === "seed") {
    return {
      coreMessage: `${proof}；通过一次可信的${scene}体验，帮助${audience}判断它是否适合自己。`,
      storyAngle: `由一位与${audience}处境相近的真实使用者，像朋友一样复盘为什么选择${enterprise.name}、怎样使用，以及哪些人和场景更适合。`,
      hook: `如果你也在为${scene}反复比较，我更想先说说它真实用起来是什么感觉。`,
      storyArc: [`具体困扰与购买原因`, `比较、顾虑与选择依据`, `第一次使用的真实感受`, `放进${scene}持续体验`, `从细节归纳优势`, `说明适合人群与使用边界`],
    };
  }
  if (mode === "brand") {
    return {
      coreMessage: `${enterprise.name}以${proof}建立${enterprise.industry}的专业认知，让${audience}在同类选择中有清楚、可信的优先理由。`,
      storyAngle: `围绕一个核心心智关键词，解释${enterprise.name}在${enterprise.industry}上的专业积累、可信背书，以及这些能力对消费者意味着什么。`,
      hook: `同类产品很多，真正帮助人做决定的，是一个品牌凭什么值得长期信任。`,
      storyArc: [`明确${enterprise.industry}品类与目标人群`, `提出一个核心品牌差异`, `用研发、标准或时间沉淀证明专业`, `用可核验证据建立权威`, `把品牌能力转成消费者利益`, `形成稳定记忆与购买理由`],
    };
  }
  return {
    coreMessage: `${enterprise.name}通过一个与${scene}有关的具体案例，让偏爱文学表达的读者在人物变化中感受到：${proof}。`,
    storyAngle: `选择一位真实人物，从${scene}中的一个细节写起，详实呈现其购买或研发过程中的愿望、犹豫、困难和转折，让${enterprise.name}的核心卖点在高潮事件中得到验证。`,
    hook: `故事开始时，人物还不知道，一次关于${scene}的选择会让他重新认识来自${enterprise.location}的这件产品。`,
    storyArc: [`开端：人物、场景与伏笔`, `发展：购买或研发的原因、犹豫与困难`, `高潮：关键选择验证核心卖点`, `结局：具体变化与消费者利益落地`, `尾声：意象回环与可兑现承诺`],
  };
}

export function buildCreativeBrief(request: TranslateRequest, enterprise: Enterprise): CreativeBrief {
  const selected = request.selectedMaterials;
  const product = selected.find((item) => item.type === "product")?.content ?? selected[0]?.content ?? enterprise.tagline;
  const reference = selected.find((item) => item.type === "reference")?.content;
  const proof = firstSentence(product, enterprise.tagline);
  const audience = findCue(request.goal, audienceWords, `愿意认真挑选${enterprise.industry}的人`);
  const scene = findCue(request.goal, sceneWords, "日常选择");
  const copy = modeCopy(request.mode, enterprise, audience, scene, proof);

  return {
    mode: request.mode,
    audience,
    coreMessage: copy.coreMessage,
    storyAngle: copy.storyAngle,
    hook: reference ? firstSentence(reference, copy.hook) : copy.hook,
    storyArc: copy.storyArc,
    humanTouch: buildEvidencePrompts(request.mode, enterprise.name, enterprise.industry, request.goal, selected),
    avoid: ["不要使用“赋能、引领、匠心打造、重新定义”等空泛词", "不要连续堆叠形容词和感叹号", "没有素材依据的数据、功效和用户评价一律不写"],
  };
}
