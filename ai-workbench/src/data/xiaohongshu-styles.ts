import type { PlatformVersions, TranslationMode } from "@/contracts/content";

export type XiaohongshuStyle = "immersive" | "diary" | "reverse" | "dual-line" | "detail-documentary" | "friend-chat" | "object-view";

export interface XiaohongshuContext {
  brand: string;
  industry: string;
  location: string;
  goal: string;
  audience: string;
  hook: string;
  mode: TranslationMode;
  tone: string;
  opening: string;
  alternateOpening: string;
  tension: string;
  action: string;
  experience: string;
  benefit: string;
  fit: string;
  boundary: string;
  strength: string;
  detailWalkthrough: string;
  selectionAdvice: string;
}

interface Draft {
  title: string;
  body: string;
}

const allStyles: XiaohongshuStyle[] = ["immersive", "diary", "reverse", "dual-line", "detail-documentary", "friend-chat", "object-view"];

const tonePools: Record<string, XiaohongshuStyle[]> = {
  闺蜜安利: ["friend-chat", "diary", "reverse", "immersive", "object-view"],
  专业品鉴: ["detail-documentary", "dual-line", "reverse", "immersive", "diary"],
  年轻活力: ["reverse", "diary", "object-view", "friend-chat", "dual-line"],
  温暖叙事: ["immersive", "dual-line", "object-view", "diary", "detail-documentary"],
};

function hash(value: string) {
  let result = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    result ^= value.charCodeAt(index);
    result = Math.imul(result, 16777619);
  }
  return result >>> 0;
}

function selectStyles(context: XiaohongshuContext) {
  const pool = tonePools[context.tone] ?? allStyles;
  const seed = hash(`${context.brand}|${context.industry}|${context.mode}|${context.tone}|${context.goal}`);
  const first = pool[seed % pool.length];
  let second = pool[(seed + 2) % pool.length];
  if (second === first) second = allStyles[(allStyles.indexOf(first) + 1) % allStyles.length];
  return [first, second] as const;
}

function ending(context: XiaohongshuContext) {
  if (context.tone === "专业品鉴") return context.boundary;
  if (context.tone === "年轻活力") return `${context.boundary} 需求对得上，再考虑它。`;
  if (context.tone === "温暖叙事") return `${context.boundary} 知道这些，再回到自己的日常里判断。`;
  return `${context.boundary} 我能替你问到的细节都在这里了，剩下就看它和你的生活合不合拍。`;
}

function immersive(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const start = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? context.hook : `${context.brand}被记住以前，先发生了一件很普通的事`,
    body: `${start}\n\n${context.tension}\n\n${context.action} 这一步没有戏剧性的转折，只有人根据天气、材料和经验作出的判断。\n\n${context.experience} ${context.benefit}\n\n${context.detailWalkthrough}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function diary(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const morning = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? `这一天过完以后，我记住了${context.brand}的几个细节` : `从早到晚，看看${context.brand}怎样进入真实生活`,
    body: `${morning}\n\n手边的事情没停，我也没急着下结论。${context.experience}\n\n让我继续往下了解的，是它能把来处和做法说具体：${context.action}\n\n${context.detailWalkthrough}\n\n这些信息放回一天的生活里，作用很清楚。${context.benefit}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function reverse(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const result = variant === "A" ? context.alternateOpening : context.benefit;
  return {
    title: variant === "A" ? `先说结果：${context.brand}真正留下的是这个细节` : `看到结果以后，我把选择过程重新倒回去看了一遍`,
    body: `${result}\n\n我把过程往回翻，最早卡住人的问题是${context.tension}\n\n${context.action}\n\n这个选择到了使用端，没有停在一句宣传语里。${context.experience}\n\n${context.detailWalkthrough}\n\n${context.fit} ${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function dualLine(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const firstLine = variant === "A" ? `在${context.location}，${context.opening}` : `在日常生活的另一端，${context.alternateOpening}`;
  const secondLine = variant === "A" ? context.alternateOpening : context.opening;
  return {
    title: variant === "A" ? `两条时间线，在${context.brand}这里相遇` : `一边是制作现场，一边是使用日常`,
    body: `${firstLine}\n\n${secondLine}\n\n产地要处理${context.tension} 使用的人关心的，则是它能不能自然进入原有生活。\n\n${context.action}\n\n${context.detailWalkthrough}\n\n两端在这里接上：${context.experience} ${context.benefit}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function detailDocumentary(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const detail = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? `不急着评价，先把${context.brand}的细节看清楚` : `把形容词拿掉以后，这些产品事实还在`,
    body: `${detail}\n\n${context.detailWalkthrough}\n\n规格并不自己说明价值，要看它对应了什么动作。${context.action}\n\n${context.experience} ${context.benefit}\n\n${context.selectionAdvice}\n\n${context.fit}\n\n${ending(context)}`,
  };
}

function friendChat(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const start = variant === "A" ? `${context.opening}` : `${context.alternateOpening}`;
  return {
    title: variant === "A" ? `像给朋友挑东西一样，我会先看${context.brand}这些地方` : `不是“闭眼入”，把真实情况说完整再决定`,
    body: `${start}\n\n姐妹，我替你多问了一层。${context.tension}\n\n我会愿意继续了解，是因为它把做法交代得很实在。${context.action}\n\n拿回日常里，感受也不是悬空的：${context.experience} ${context.benefit}\n\n${context.detailWalkthrough}\n\n${context.selectionAdvice}\n\n${context.fit}\n\n${ending(context)}`,
  };
}

function objectView(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const subject = context.industry.includes("文旅") ? "一件亲手完成的作品" : context.industry.includes("橙") ? "一颗刚被分拣好的橙子" : context.industry.includes("茶") ? "一罐刚装好的春茶" : "这件产品";
  return {
    title: variant === "A" ? `如果${subject}会说话，它会怎样讲完这段旅程` : `跟着一件产品，从来处走到日常`,
    body: `${subject}最初还在${context.location}。${context.opening}\n\n${context.tension}\n\n${context.action}\n\n${context.detailWalkthrough}\n\n离开原来的地方以后，它在另一个人的生活里有了具体位置。${context.experience} ${context.benefit}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

const builders: Record<XiaohongshuStyle, (context: XiaohongshuContext, variant: "A" | "B") => Draft> = {
  immersive,
  diary,
  reverse,
  "dual-line": dualLine,
  "detail-documentary": detailDocumentary,
  "friend-chat": friendChat,
  "object-view": objectView,
};

export function buildXiaohongshuVersions(context: XiaohongshuContext): PlatformVersions {
  const [styleA, styleB] = selectStyles(context);
  const draftA = builders[styleA](context, "A");
  const draftB = builders[styleB](context, "B");
  const tag = context.industry.replaceAll(" ", "");
  return {
    A: { ...draftA, hashtags: [`#${tag}`, `#${context.brand}`, "#真实分享", "#生活灵感"] },
    B: { ...draftB, hashtags: [`#${context.brand}`, "#产品细节", "#选购思路", "#适合自己的才重要"] },
  };
}

export function listXiaohongshuStyles() {
  return [...allStyles];
}
