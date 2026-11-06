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
  if (context.tone === "专业品鉴") return `现有信息可以支持以上判断，但结论仍应限定在具体条件内。${context.boundary} 比起一句笼统推荐，知道它在什么情况下成立，才更有参考价值。`;
  if (context.tone === "年轻活力") return `${context.boundary} 信息给到这里，选择权交还给你。最想继续看哪个细节，评论里点一个。`;
  if (context.tone === "温暖叙事") return `${context.boundary} 不必急着把每个答案都说满，给差异留一点位置，也给自己的需要留一点时间。`;
  return `${context.boundary} 如果你的情况和这里相近，可以先收藏这些细节；还有哪一点没讲清楚，直接问就好。`;
}

function immersive(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const start = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? context.hook : `${context.brand}被记住以前，先发生了一件很普通的事`,
    body: `${start}\n\n故事没有急着把产品推到眼前。人先有自己的需要，现实也有不肯让步的部分。${context.tension}\n\n决定落下来时，卖点才真正有了分量。${context.action}\n\n${context.experience}\n\n再靠近一些，会看见那些容易被一句话带过的细节。${context.detailWalkthrough}\n\n它们最终抵达的不是参数表，而是人的日常：${context.benefit}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function diary(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const morning = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? `这一天过完以后，我记住了${context.brand}的几个细节` : `从早到晚，看看${context.brand}怎样进入真实生活`,
    body: `早些时候。${morning}\n\n事情刚开始时，最先出现的不是惊喜，而是一个实际问题。${context.tension}\n\n后来。${context.action}\n\n真正进入使用场景后，感受变得具体。${context.experience}\n\n到了可以下判断的时候，我重新看了一遍产品信息。${context.detailWalkthrough}\n\n也把容易忽略的选择条件记了下来。${context.selectionAdvice}\n\n这一天留下的结论很简单：${context.benefit}\n\n${ending(context)}`,
  };
}

function reverse(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const result = variant === "A" ? context.alternateOpening : context.benefit;
  return {
    title: variant === "A" ? `先说结果：${context.brand}真正留下的是这个细节` : `看到结果以后，我把选择过程重新倒回去看了一遍`,
    body: `${result}\n\n答案出现得很快，原因却要往前找。最初面对的是${context.tension}\n\n再往前，是一次没有被宣传语替代的选择。${context.action}\n\n它是否成立，要放进真实使用里看。${context.experience}\n\n这时再读产品信息，许多细节才有了因果。${context.detailWalkthrough}\n\n如果把结果和条件放在一起，${context.fit}\n\n${context.selectionAdvice}\n\n${ending(context)}`,
  };
}

function dualLine(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const firstLine = variant === "A" ? `在${context.location}，${context.opening}` : `在日常生活的另一端，${context.alternateOpening}`;
  const secondLine = variant === "A" ? context.alternateOpening : context.opening;
  return {
    title: variant === "A" ? `两条时间线，在${context.brand}这里相遇` : `一边是制作现场，一边是使用日常`,
    body: `${firstLine}\n\n与此同时，另一条线正在展开。${secondLine}\n\n一边要处理的是${context.tension}\n\n另一边在意的是产品进入生活后是否自然、是否方便、是否符合原本的需要。\n\n两条线在这个决定上相遇：${context.action}\n\n${context.detailWalkthrough}\n\n当产品真正抵达使用场景，结果是${context.experience}\n\n${context.selectionAdvice}\n\n这也解释了它能够提供的实际价值：${context.benefit}\n\n${ending(context)}`,
  };
}

function detailDocumentary(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const detail = variant === "A" ? context.opening : context.alternateOpening;
  return {
    title: variant === "A" ? `不急着评价，先把${context.brand}的细节看清楚` : `把形容词拿掉以后，这些产品事实还在`,
    body: `${detail}\n\n判断从可见的事实开始。${context.detailWalkthrough}\n\n这些信息不能孤立阅读。它们对应着实际过程：${context.action}\n\n放进具体场景后，观察到的是${context.experience}\n\n因此，${context.benefit}\n\n购买或体验之前，还需要把自己的条件带回来。${context.selectionAdvice}\n\n${context.fit}\n\n${ending(context)}`,
  };
}

function friendChat(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const start = variant === "A" ? `先别急着听结论，我把整个过程讲给你。${context.opening}` : `我想先说一个很容易代入的画面。${context.alternateOpening}`;
  return {
    title: variant === "A" ? `像给朋友挑东西一样，我会先看${context.brand}这些地方` : `不是“闭眼入”，把真实情况说完整再决定`,
    body: `${start}\n\n真正做选择时，人不会只看漂亮的一面。会担心，也会反复确认，因为${context.tension}\n\n我更愿意先看它怎样被做出来。${context.action}\n\n再看买回去或真正体验时会发生什么。${context.experience}\n\n产品细节也一起摊开：${context.detailWalkthrough}\n\n对照自己的生活，可以重点看这些条件。${context.selectionAdvice}\n\n所以，${context.fit}\n\n${ending(context)}`,
  };
}

function objectView(context: XiaohongshuContext, variant: "A" | "B"): Draft {
  const subject = context.industry.includes("文旅") ? "一件亲手完成的作品" : context.industry.includes("橙") ? "一颗刚被分拣好的橙子" : context.industry.includes("茶") ? "一罐刚装好的春茶" : "这件产品";
  return {
    title: variant === "A" ? `如果${subject}会说话，它会怎样讲完这段旅程` : `跟着一件产品，从来处走到日常`,
    body: `${subject}最初还在${context.location}。它看见的是${context.opening}\n\n接下来发生的事并不轻松。${context.tension}\n\n它经过的每一步都有具体依据。${context.action}\n\n${context.detailWalkthrough}\n\n后来，它离开原来的地方，进入另一个人的日常。${context.experience}\n\n从产品的视角回望，这段路最终解释的是${context.benefit}\n\n人做选择时仍有自己的条件。${context.selectionAdvice}\n\n${ending(context)}`,
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
