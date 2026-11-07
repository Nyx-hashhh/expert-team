import type { ContentVersion, TranslationMode } from "@/contracts/content";
import type { CaseFacts } from "./facts";
import { pickBySeed } from "./facts";
import type { PlatformDrafts, VoiceContext, VoiceRenderer } from "./voice-types";
import { makeStoryboard } from "./voice-types";

/** 闺蜜安利：朋友间聊天，先经历再给判断，结论由读者自己抵达 */

const interactClosers = [
  "评论区想问的随便问，我第二份已经开封了。",
  "有同款使用感的来对一下，评论区见。",
  "踩过坑的姐妹也来说说，帮我避个雷。",
];

function xhsSeedA(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `${f.painScene}，直到换了${f.brand}这${f.productId}。`,
    `${f.firstTaste}。`,
    `后来自己下单了，${f.priceLine}。踩过坑之后我固定会核两件事：${f.specs[0]}；${f.specs[1] ?? f.specs[0]}。这家都对得上。`,
    `${f.ruleSentence}冲着这条，我愿意把它推荐给朋友。`,
    `${f.costPerUse}。${f.scenes[0]}用着顺手，${f.scenes[1] ?? f.scenes[0]}也合适。`,
    `适合${f.fit}。${f.notFit}，这点自己掂量。`,
    pickBySeed(interactClosers, ctx.seed, 1),
  ].join("\n\n");
  return {
    title: `${f.productId}怎么选，我把这份用完才敢写`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#姐妹实测"],
  };
}

function xhsSeedB(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `第二份${f.productId}到的那天，我确认这次不是冲动。`,
    `最早是${ctx.audience}的需求找上门。第一次用没什么惊艳，${f.firstTaste}，第二周开始变成习惯。`,
    `翻出订单看了一眼：${f.priceLine}，${f.model}。核过的信息也放这里：${f.specs[0]}。`,
    `让放心的是背后的人。${f.ruleSentence}`,
    `${f.costPerUse}，${f.visualDetail}这个细节我很吃。`,
    `${f.fit}可以冲；${f.notFit}。`,
    pickBySeed(interactClosers, ctx.seed, 2),
  ].join("\n\n");
  return {
    title: `回购清单又添一员：${f.brand}的${f.productId}`,
    body: para,
    hashtags: [...f.xhsTags.slice(1, 4), "#回购好物"],
  };
}

function xhsBrandA(f: CaseFacts): ContentVersion {
  const para = [
    `被问了好几次${f.industry}里有没有靠谱的牌子，干脆写清楚。`,
    `同类那么多，能让我记住${f.brand}的，不是包装，是一条规矩。`,
    `${f.ruleSentence}这话听起来有点轴，但放在${f.industry}里，轴的人做的东西才敢往朋友手里递。`,
    `落到产品上就是这些事实：${f.specs[0]}，${f.specs[1] ?? f.specs[0]}。${f.priceLine}。`,
    `对买东西的人来说，${f.tagline}。`,
    `我的标准很简单：把规矩和丑话都摆出来的牌子，值得第二次下单。${f.notFit}。`,
  ].join("\n\n");
  return {
    title: `记住${f.brand}，是因为它有条笨规矩`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#品牌观察"],
  };
}

function xhsBrandB(f: CaseFacts): ContentVersion {
  const para = [
    `如果把${f.brand}介绍里的形容词都删掉，剩下的是这些。`,
    `${f.ruleSentence}他的原话是，${f.personQuote}。`,
    `能查证的都在这：${f.specs.join("；")}。${f.priceLine}。`,
    `一个牌子值不值得长期跟，看的不是一次爆款，而是愿不愿意把边界说在前面。${f.notFit}。`,
    `适合${f.fit}。`,
    `把这篇存下来，下次比较同类的时候拿出来对一对。`,
  ].join("\n\n");
  return {
    title: `删掉形容词，${f.brand}还剩什么`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#放心买", "#怎么选牌子"],
  };
}

function xhsStoryA(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `${f.openingMoment}。拆开的瞬间，${f.smellLine}。`,
    `${f.originScene}。`,
    `${f.ruleSentence}有人劝过，他说，${f.personQuote}。`,
    `这份${f.productId}，就是从这样的地方来的。${f.priceLine}，${f.specs[0]}。`,
    `现在它在我${f.scenes[0]}。${f.visualDetail}的时候，总觉得那些山里的清晨也跟着过来了。`,
    `分享给同样${f.fit}的人。`,
  ].join("\n\n");
  return {
    title: `${f.brand}的事，是从一条规矩开始知道的`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#有故事的品牌"],
  };
}

function xhsStoryB(f: CaseFacts): ContentVersion {
  const para = [
    `收到${f.brand}的东西之前，我对${f.industry}的印象还停在货架。`,
    `${f.firstTaste}。后来才知道这背后的讲究。`,
    `${f.originScene}。${f.ruleSentence}他的原话是，${f.personQuote}。`,
    `${f.priceLine}。${f.scenes[1] ?? f.scenes[0]}的时候拿出来，${f.visualDetail}。`,
    `东西和人一样，处久了才见真章。`,
  ].join("\n\n");
  return {
    title: `用了半年，才慢慢看懂${f.brand}的讲究`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#日常好物"],
  };
}

function weiboSeed(f: CaseFacts): ContentVersion {
  const body = `${f.productId}用了一个月来交作业。${f.firstTaste}。${f.specs[0]}，${f.priceLine}，${f.costPerUse}。${f.fit}可以参考；${f.notFit}。${pickBySeed(interactClosers, f.model, 3)}`;
  return { title: `${f.productId}一个月使用报告`, body, hashtags: [...f.weiboTags] };
}

function weiboSeedB(f: CaseFacts): ContentVersion {
  const body = `第二份${f.productId}到货。上次那条很多人问细节：${f.specs[0]}；${f.priceLine}。${f.costPerUse}，会过日子的人都算这笔账。${f.notFit}。${f.pollQuestion}`;
  return { title: `回购了，这次把细节说全`, body, hashtags: [...f.weiboTags] };
}

function weiboBrand(f: CaseFacts): ContentVersion {
  const body = `${f.industry}里我持续回购的是${f.brand}。理由不玄：${f.ruleSentence}${f.specs[0]}，${f.priceLine}。把规矩和边界都摆出来的牌子，才敢往朋友手里递。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboBrandB(f: CaseFacts): ContentVersion {
  const body = `${f.personQuote}。这是${f.brand}主理人的原话，他们也确实这么做了。${f.specs[0]}，${f.priceLine}，${f.tagline}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStory(f: CaseFacts): ContentVersion {
  const body = `${f.originScene}。${f.ruleSentence}${f.personQuote}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStoryB(f: CaseFacts): ContentVersion {
  const body = `${f.openingMoment}。拆开，${f.smellLine}。后来才知道，${f.ruleSentence}${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function douyinSeed(f: CaseFacts): ContentVersion {
  const voice = [
    `上个月开始，日常换成了${f.brand}的${f.productId}。`,
    `${f.firstTaste}。${f.visualDetail}，摸鱼看两眼很解压。`,
    `这样用完正好一个月，${f.priceLine}，${f.costPerUse}。`,
    `核过的硬指标：${f.specs[0]}。${f.fit}的可以冲。`,
    `同款评论区扣个字，链接甩给你。`,
  ].join("\n");
  return {
    title: `${f.productId}，我实测了一个月`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "工位或家中真实使用场景，手部动作特写", voiceover: `上个月开始，日常换成了${f.brand}的${f.productId}。`, bgm: "轻快节奏，保留现场声" },
      { timeRange: "3-9s", shot: `使用过程实拍：${f.visualDetail}`, voiceover: `${f.firstTaste}。${f.visualDetail}，摸鱼看两眼很解压。`, bgm: "节奏跟随动作" },
      { timeRange: "9-15s", shot: "产品与参数卡同框，字幕标真实数据", voiceover: `${f.priceLine}，${f.costPerUse}。`, bgm: "音乐收小，突出口播" },
      { timeRange: "15-20s", shot: "回到使用者，结尾指向评论区", voiceover: `适合${f.fit}。同款评论区扣个字。`, bgm: "干净收尾" },
    ]),
  };
}

function douyinSeedB(f: CaseFacts): ContentVersion {
  const voice = [
    `第二份${f.productId}开箱，这次是帮你们把账算明白。`,
    `${f.priceLine}，${f.costPerUse}。`,
    `核过的信息再报一遍：${f.specs[0]}。${f.model}，认准这个。`,
    `上一条评论区的问题集中回答：${f.notFit}。`,
    `还在犹豫的，这条先存着。`,
  ].join("\n");
  return {
    title: `${f.productId}回购开箱，这次算总账`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#回购开箱"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "开箱瞬间的第一视角", voiceover: `第二份${f.productId}开箱，这次是帮你们把账算明白。`, bgm: "干净利落的开场" },
      { timeRange: "3-9s", shot: "价格与用量信息上字幕，手写计算感", voiceover: `${f.priceLine}，${f.costPerUse}。`, bgm: "轻节奏" },
      { timeRange: "9-15s", shot: "产品细节与型号特写", voiceover: `核过的信息再报一遍：${f.specs[0]}。${f.model}，认准这个。`, bgm: "突出旁白" },
      { timeRange: "15-20s", shot: "正面回应镜头，字幕列注意事项", voiceover: `上一条评论区的问题集中回答：${f.notFit}。还在犹豫的，这条先存着。`, bgm: "收尾" },
    ]),
  };
}

function douyinBrand(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.industry}里我只认一条：看规矩。`,
    `${f.ruleSentence}`,
    `落到产品上：${f.specs[0]}，${f.priceLine}。`,
    `${f.gold}。`,
    `你买东西先看什么？评论区聊聊。`,
  ].join("\n");
  return {
    title: `记住${f.brand}，是因为它有条笨规矩`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "字幕抛出观点：看牌子先看规矩", voiceover: `${f.industry}里我只认一条：看规矩。`, bgm: "沉稳简洁的节拍" },
      { timeRange: "3-10s", shot: `规矩对应的真实画面`, voiceover: `${f.ruleSentence}`, bgm: "现场声为主" },
      { timeRange: "10-16s", shot: "产品特写与参数字幕", voiceover: `落到产品上：${f.specs[0]}，${f.priceLine}。`, bgm: "音乐渐入" },
      { timeRange: "16-20s", shot: "品牌画面定格", voiceover: `${f.gold}。你买东西先看什么？评论区聊聊。`, bgm: "收束" },
    ]),
  };
}

function douyinBrandB(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.industry}选牌子，先做一道减法。`,
    `删掉广告词，${f.brand}剩的是：${f.specs[0]}。`,
    `${f.ruleSentence}原话是，${f.personQuote}。`,
    `${f.priceLine}。${f.tagline}。`,
    `这道减法你们也拿去用，试试手里的牌子还剩什么。`,
  ].join("\n");
  return {
    title: `一道减法，测出${f.brand}的真本事`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#理性消费"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "黑屏白字：一道减法", voiceover: `${f.industry}选牌子，先做一道减法。`, bgm: "极简开场" },
      { timeRange: "3-10s", shot: "删减动画：形容词逐个划掉", voiceover: `删掉广告词，${f.brand}剩的是：${f.specs[0]}。`, bgm: "节奏点配合删减" },
      { timeRange: "10-16s", shot: "人物与产品的真实工作画面", voiceover: `${f.ruleSentence}原话是，${f.personQuote}。`, bgm: "现场声" },
      { timeRange: "16-20s", shot: "产品定格与价格字幕", voiceover: `${f.priceLine}。这道减法你们也拿去用。`, bgm: "收尾" },
    ]),
  };
}

function douyinStory(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.openingMoment}。`,
    `${f.originScene}。`,
    `${f.ruleSentence}他说，${f.personQuote}。`,
    `${f.gold}。`,
    `想把这份讲究讲给更多人听。`,
  ].join("\n");
  return {
    title: `${f.gold.split("，")[0]}，${f.brand}的讲究`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#有故事的品牌"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: `当下时刻的实拍画面`, voiceover: `${f.openingMoment}。`, bgm: "环境声先入，不加音乐" },
      { timeRange: "3-10s", shot: `${f.originScene}的实景`, voiceover: `${f.originScene}。`, bgm: "轻节奏慢慢进入" },
      { timeRange: "10-16s", shot: "人物工作或产品的特写", voiceover: `${f.ruleSentence}他说，${f.personQuote}。`, bgm: "音乐放缓" },
      { timeRange: "16-20s", shot: "使用场景收尾，品牌最后出现", voiceover: `${f.gold}。`, bgm: "留一秒余韵" },
    ]),
  };
}

function douyinStoryB(f: CaseFacts): ContentVersion {
  const voice = [
    `手边这份${f.productId}，先给结果。`,
    `${f.firstTaste}，我已经用到第二份。`,
    `往回翻，它来自${f.location}。${f.originScene}。`,
    `${f.ruleSentence}`,
    `现在再看手里这份，${f.gold}。`,
  ].join("\n");
  return {
    title: `从${f.location}到你手里，这份${f.productId}经过了什么`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#溯源"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "成品使用画面先出现", voiceover: `手边这份${f.productId}，先给结果。${f.firstTaste}。`, bgm: "轻快开场" },
      { timeRange: "3-10s", shot: "转场倒回：产地实景", voiceover: `往回翻，它来自${f.location}。${f.originScene}。`, bgm: "倒带音效转场" },
      { timeRange: "10-16s", shot: "人物与工序特写", voiceover: `${f.ruleSentence}`, bgm: "节奏稳定" },
      { timeRange: "16-20s", shot: "回到手边成品，首尾呼应", voiceover: `现在再看手里这份，${f.gold}。`, bgm: "收束" },
    ]),
  };
}

export const renderBff: VoiceRenderer = (mode: TranslationMode, f: CaseFacts, ctx: VoiceContext): PlatformDrafts => {
  const xiaohongshu = mode === "seed"
    ? { A: xhsSeedA(f, ctx), B: xhsSeedB(f, ctx) }
    : mode === "brand"
      ? { A: xhsBrandA(f), B: xhsBrandB(f) }
      : { A: xhsStoryA(f, ctx), B: xhsStoryB(f) };
  const weibo = mode === "seed"
    ? { A: weiboSeed(f), B: weiboSeedB(f) }
    : mode === "brand"
      ? { A: weiboBrand(f), B: weiboBrandB(f) }
      : { A: weiboStory(f), B: weiboStoryB(f) };
  const douyin = mode === "seed"
    ? { A: douyinSeed(f), B: douyinSeedB(f) }
    : mode === "brand"
      ? { A: douyinBrand(f), B: douyinBrandB(f) }
      : { A: douyinStory(f), B: douyinStoryB(f) };
  return { xiaohongshu, weibo, douyin };
};
