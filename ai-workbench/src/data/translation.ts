import type { CreativeBrief, Enterprise, TranslateRequest, TranslationMode } from "@/contracts/content";

const audienceWords = ["年轻白领", "白领", "职场人", "年轻人", "宝妈", "家庭", "情侣", "游客", "学生", "送礼人群", "消费者"];
const sceneWords = ["送礼", "办公室", "通勤", "周末", "旅行", "节日", "聚会", "家庭", "下午茶", "新品上市", "早鸟"];

function firstSentence(value: string, fallback: string) {
  return value.trim().split(/[。！？!？\n]/).find(Boolean)?.trim() || fallback;
}

function findCue(goal: string, words: string[], fallback: string) {
  return words.find((word) => goal.includes(word)) ?? fallback;
}

function modeCopy(mode: TranslationMode, enterprise: Enterprise, audience: string, scene: string, proof: string, story: string) {
  if (mode === "seed") {
    return {
      coreMessage: `${proof}，它解决的不是“多买一样东西”，而是让${scene}这件事更省心、更有记忆点。`,
      storyAngle: `从${audience}在${scene}时的一个真实犹豫写起，先讲体验，再让${enterprise.name}自然出现。`,
      hook: `${scene}最难的，从来不是选择多，而是很少有东西让人真想分享。`,
      storyArc: [`一个具体的${scene}难题`, `偶然发现${enterprise.name}`, `用真实细节证明改变`, `用问题邀请读者说出自己的选择`],
    };
  }
  if (mode === "brand") {
    return {
      coreMessage: `${enterprise.name}想留下的，不只是一件产品，而是${enterprise.location}的人、手艺和生活方式。`,
      storyAngle: `把镜头交给品牌背后的人，从“为什么还愿意认真做”切入，用${story}支撑品牌价值。`,
      hook: `有些品牌先想怎么卖出去，${enterprise.name}先想的是：什么值得留下来。`,
      storyArc: [`从${enterprise.location}的一个日常画面开场`, `写坚持背后的选择`, `落到${proof}`, `邀请读者认识品牌而非催促购买`],
    };
  }
  return {
    coreMessage: `${enterprise.name}把${proof}变成一段能被${audience}感受到的日常故事。`,
    storyAngle: `从${scene}里的一个普通瞬间切入：人物先有犹豫，随后被一个来自${enterprise.location}的细节打动。`,
    hook: `真正让人记住的，往往不是一句卖点，而是“这正好像我的生活”。`,
    storyArc: [`用${scene}中的细节让人物出现`, `抛出一个真实的小困扰`, `让${enterprise.name}以解决方案而非广告登场`, `用克制的余韵和互动问题收尾`],
  };
}

export function buildCreativeBrief(request: TranslateRequest, enterprise: Enterprise): CreativeBrief {
  const selected = request.selectedMaterials;
  const product = selected.find((item) => item.type === "product")?.content ?? selected[0]?.content ?? enterprise.tagline;
  const story = selected.find((item) => item.type === "story")?.content ?? enterprise.tagline;
  const reference = selected.find((item) => item.type === "reference")?.content;
  const proof = firstSentence(product, enterprise.tagline);
  const audience = findCue(request.goal, audienceWords, `愿意认真挑选${enterprise.industry}的人`);
  const scene = findCue(request.goal, sceneWords, "日常选择");
  const copy = modeCopy(request.mode, enterprise, audience, scene, proof, firstSentence(story, enterprise.tagline));

  return {
    mode: request.mode,
    audience,
    coreMessage: copy.coreMessage,
    storyAngle: copy.storyAngle,
    hook: reference ? firstSentence(reference, copy.hook) : copy.hook,
    storyArc: copy.storyArc,
    humanTouch: [
      `保留“${request.goal.trim()}”的真实目标，但不要原句硬塞进正文`,
      `使用${request.tone}口吻，多写可看见的动作和细节`,
      "允许短句、停顿和轻微不完美，像真人分享而不是品牌宣讲",
    ],
    avoid: ["不要使用“赋能、引领、匠心打造、重新定义”等空泛词", "不要连续堆叠形容词和感叹号", "没有素材依据的数据、功效和用户评价一律不写"],
  };
}
