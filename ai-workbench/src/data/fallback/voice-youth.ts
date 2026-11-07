import type { ContentVersion, TranslationMode } from "@/contracts/content";
import type { CaseFacts } from "./facts";
import type { PlatformDrafts, VoiceContext, VoiceRenderer } from "./voice-types";
import { makeStoryboard } from "./voice-types";

/** 年轻活力：行动视角，短句强动词，活力来自节奏；emoji 克制（3-4 个） */

function xhsSeedA(f: CaseFacts): ContentVersion {
  const para = [
    `${f.productId}，实测一个月，直接汇报。`,
    `第一口别急着下结论。${f.firstTaste}。${f.visualDetail}，工位摸鱼看两眼很解压。`,
    `账先算明白：${f.priceLine}。${f.costPerUse}。`,
    `硬指标查过：${f.specs[0]}。${f.specs[1] ?? f.specs[0]}。`,
    `背后的人也扒了：${f.ruleSentence}就冲这条，放心。`,
    `${f.fit}，冲。${f.notFit}，先缓缓。`,
    `评论区扣字，蹲一个真实反馈。`,
  ].join("\n\n");
  return {
    title: `${f.productId}实测一个月，直接汇报`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#实测报告"],
  };
}

function xhsSeedB(f: CaseFacts): ContentVersion {
  const para = [
    `第二份${f.productId}到货，这单已经闭眼了。`,
    `一个月前的我还是观望党。${f.firstTaste}，第二周直接变习惯。`,
    `下单前查过的：${f.specs[0]}。${f.model}，别买错。${f.priceLine}。`,
    `最戳我的细节：${f.visualDetail}。`,
    `${f.ruleSentence}，这种轴人做的东西差不了。`,
    `${f.fit}照抄作业。${f.notFit}，绕道。`,
    `用过的来评论区碰头。`,
  ].join("\n\n");
  return {
    title: `回购了！${f.productId}这单我闭眼了`,
    body: para,
    hashtags: [...f.xhsTags.slice(1, 4), "#回购清单"],
  };
}

function xhsBrandA(f: CaseFacts): ContentVersion {
  const para = [
    `${f.industry}这个赛道，牌子多到眼花。我的筛法很粗暴：看谁敢立规矩。`,
    `${f.ruleSentence}`,
    `有人觉得轴。我觉得，肯在这上面较真的，产品不会糊弄。`,
    `能查的都在这：${f.specs[0]}；${f.priceLine}。`,
    `${f.tagline}。${f.fit}直接记下这家。`,
    `${f.gold}，这句真不是文案，是事实。`,
  ].join("\n\n");
  return {
    title: `${f.industry}眼花？看谁敢立规矩`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#怎么选"],
  };
}

function xhsBrandB(f: CaseFacts): ContentVersion {
  const para = [
    `做一道减法题：把${f.industry}牌子的广告词全删了，看还剩什么。`,
    `${f.brand}剩下的是，${f.specs[0]}。`,
    `再剩一个故事：${f.ruleSentence}原话：${f.personQuote}。`,
    `价格也没得藏：${f.priceLine}。${f.costPerUse}。`,
    `减到最后还站得住的，才是真东西。${f.fit}，这家可以进清单。`,
    `这道减法题，拿去测你手里正在用的牌子。`,
  ].join("\n\n");
  return {
    title: `一道减法题，测出${f.brand}真本事`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#理性消费", "#减法测试"],
  };
}

function xhsStoryA(f: CaseFacts): ContentVersion {
  const para = [
    `${f.openingMoment}。`,
    `镜头往前倒。${f.originScene}。`,
    `${f.ruleSentence}别人劝，他不听。原话：${f.personQuote}。`,
    `现在这份${f.productId}在我${f.scenes[0]}。${f.priceLine}。`,
    `${f.visualDetail}的时候，就想起那边山里的人。`,
    `${f.gold}。`,
    `好东西配得上一个故事，更配得上被用起来。`,
  ].join("\n\n");
  return {
    title: `${f.gold.split("，")[0]}，说的就是这家`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#有故事的品牌"],
  };
}

function xhsStoryB(f: CaseFacts): ContentVersion {
  const para = [
    `手边这份${f.productId}，先给结果：${f.firstTaste}。`,
    `往回倒带。${f.originScene}。`,
    `中间这段最值钱：${f.ruleSentence}`,
    `${f.personQuote}，这话我记到现在。`,
    `${f.priceLine}。${f.model}，认准下单。`,
    `从产地到我手里，每一步都能查。这种踏实感，谁懂。`,
  ].join("\n\n");
  return {
    title: `倒带看${f.brand}，每一步都能查`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#溯源", "#倒放"],
  };
}

function weiboSeed(f: CaseFacts): ContentVersion {
  const body = `${f.productId}，一个月实测汇报。${f.firstTaste}。${f.specs[0]}，${f.priceLine}，${f.costPerUse}。${f.fit}直接抄作业，${f.notFit}。用过的碰头，评论区聊。`;
  return { title: `${f.productId}实测汇报`, body, hashtags: [...f.weiboTags] };
}

function weiboSeedB(f: CaseFacts): ContentVersion {
  const body = `第二份${f.productId}到货，正式回购。查过的都放这：${f.specs[0]}，${f.model}。${f.costPerUse}，会算账的都懂。${f.gold}。${f.pollQuestion}`;
  return { title: `回购了，这单闭眼了`, body, hashtags: [...f.weiboTags] };
}

function weiboBrand(f: CaseFacts): ContentVersion {
  const body = `${f.industry}牌子多到眼花，我的筛法很粗暴：看谁敢立规矩。${f.brand}立了一条，${f.personRule}。${f.specs[0]}，${f.priceLine}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboBrandB(f: CaseFacts): ContentVersion {
  const body = `做道减法题：删掉${f.industry}牌子的广告词看剩什么。${f.brand}剩下${f.specs[0]}，和一个规矩：${f.personRule}。${f.priceLine}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStory(f: CaseFacts): ContentVersion {
  const body = `${f.originScene}。${f.ruleSentence}原话：${f.personQuote}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStoryB(f: CaseFacts): ContentVersion {
  const body = `先给结果：${f.firstTaste}。倒回去看，${f.originScene}。中间最值钱的一环：${f.personRule}。${f.priceLine}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function douyinSeed(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.productId}，实测一个月。`,
    `先说体验：${f.firstTaste}。${f.visualDetail}。`,
    `再报数据：${f.priceLine}，${f.costPerUse}。`,
    `查过的硬指标：${f.specs[0]}。`,
    `${f.fit}，直接冲。${f.notFit}，先缓缓。`,
    `蹲同款的评论区扣字。`,
  ].join("\n");
  return {
    title: `${f.productId}，我实测了一个月`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "字幕弹出：实测一个月", voiceover: `${f.productId}，实测一个月。`, bgm: "鼓点开场" },
      { timeRange: "3-9s", shot: `使用实拍：${f.visualDetail}`, voiceover: `先说体验：${f.firstTaste}。`, bgm: "节奏跟手" },
      { timeRange: "9-15s", shot: "价格数据上屏", voiceover: `再报数据：${f.priceLine}，${f.costPerUse}。查过的硬指标：${f.specs[0]}。`, bgm: "音乐收小" },
      { timeRange: "15-20s", shot: "结论字幕，指向评论区", voiceover: `${f.fit}，直接冲。蹲同款的评论区扣字。`, bgm: "利落收尾" },
    ]),
  };
}

function douyinSeedB(f: CaseFacts): ContentVersion {
  const voice = [
    `第二份${f.productId}开箱，帮你们把账算明白。`,
    `${f.priceLine}，${f.costPerUse}。`,
    `型号认准：${f.model}。${f.specs[0]}。`,
    `集中回答上条的问题：${f.notFit}。`,
    `还在犹豫的，先存这条。`,
  ].join("\n");
  return {
    title: `回购开箱，这次把账算明白`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#开箱"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "开箱第一视角", voiceover: `第二份${f.productId}开箱，帮你们把账算明白。`, bgm: "干脆的开场" },
      { timeRange: "3-9s", shot: "价格数据手写感字幕", voiceover: `${f.priceLine}，${f.costPerUse}。`, bgm: "轻快" },
      { timeRange: "9-15s", shot: "型号与参数特写", voiceover: `型号认准：${f.model}。${f.specs[0]}。`, bgm: "突出旁白" },
      { timeRange: "15-20s", shot: "答疑字幕", voiceover: `集中回答上条的问题：${f.notFit}。还在犹豫的，先存这条。`, bgm: "收尾" },
    ]),
  };
}

function douyinBrand(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.industry}牌子多，我的筛法很简单。`,
    `看谁敢立规矩。`,
    `${f.brand}立了一条：${f.personRule}。`,
    `能查的：${f.specs[0]}。${f.priceLine}。`,
    `${f.gold}。`,
    `你买东西先看什么？评论区聊。`,
  ].join("\n");
  return {
    title: `${f.industry}牌子多？看谁敢立规矩`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "大字：看谁敢立规矩", voiceover: `${f.industry}牌子多，我的筛法很简单。看谁敢立规矩。`, bgm: "强节奏开场" },
      { timeRange: "3-9s", shot: "规矩对应的真实画面", voiceover: `${f.brand}立了一条：${f.personRule}。`, bgm: "现场声" },
      { timeRange: "9-15s", shot: "产品与参数字幕", voiceover: `能查的：${f.specs[0]}。${f.priceLine}。`, bgm: "节奏推进" },
      { timeRange: "15-20s", shot: "品牌定格", voiceover: `${f.gold}。你买东西先看什么？评论区聊。`, bgm: "收束" },
    ]),
  };
}

function douyinBrandB(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.industry}选牌子，先做道减法。`,
    `删掉广告词，${f.brand}剩：${f.specs[0]}。`,
    `还剩个规矩：${f.personRule}。`,
    `${f.priceLine}。`,
    `这道减法拿去用，测测你手里的牌子。`,
  ].join("\n");
  return {
    title: `一道减法题，测出${f.brand}真本事`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#理性消费"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "黑屏大字：一道减法", voiceover: `${f.industry}选牌子，先做道减法。`, bgm: "极简开场" },
      { timeRange: "3-9s", shot: "形容词逐个划掉的动画", voiceover: `删掉广告词，${f.brand}剩：${f.specs[0]}。`, bgm: "节奏点配合" },
      { timeRange: "9-15s", shot: "人物与工序", voiceover: `还剩个规矩：${f.personRule}。${f.priceLine}。`, bgm: "现场声" },
      { timeRange: "15-20s", shot: "产品定格", voiceover: `这道减法拿去用，测测你手里的牌子。`, bgm: "收尾" },
    ]),
  };
}

function douyinStory(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.openingMoment}。`,
    `倒回去看。${f.originScene}。`,
    `${f.ruleSentence}`,
    `原话：${f.personQuote}。`,
    `${f.gold}。`,
    `这条视频，先讲给讲究的人。`,
  ].join("\n");
  return {
    title: `${f.gold.split("，")[0]}，说的就是这家`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#有故事的品牌"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "当下时刻实拍", voiceover: `${f.openingMoment}。`, bgm: "环境声" },
      { timeRange: "3-9s", shot: "倒带回产地", voiceover: `倒回去看。${f.originScene}。`, bgm: "倒带音效转场" },
      { timeRange: "9-15s", shot: "人物工序特写", voiceover: `${f.ruleSentence}原话：${f.personQuote}。`, bgm: "节奏放缓" },
      { timeRange: "15-20s", shot: "使用场景收尾", voiceover: `${f.gold}。`, bgm: "余韵收束" },
    ]),
  };
}

function douyinStoryB(f: CaseFacts): ContentVersion {
  const voice = [
    `先给结果：${f.firstTaste}。`,
    `倒带，回到${f.location}。${f.originScene}。`,
    `中间这环最值钱：${f.personRule}。`,
    `${f.priceLine}。`,
    `每一步都能查，这种踏实感谁懂。`,
  ].join("\n");
  return {
    title: `倒带看${f.brand}，每一步都能查`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#溯源"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "成品使用画面先出", voiceover: `先给结果：${f.firstTaste}。`, bgm: "轻快开场" },
      { timeRange: "3-9s", shot: "倒带转场到产地", voiceover: `倒带，回到${f.location}。${f.originScene}。`, bgm: "倒带音效" },
      { timeRange: "9-15s", shot: "工序与人物", voiceover: `中间这环最值钱：${f.personRule}。`, bgm: "稳定" },
      { timeRange: "15-20s", shot: "回到手边成品", voiceover: `${f.priceLine}。每一步都能查，这种踏实感谁懂。`, bgm: "收束" },
    ]),
  };
}

export const renderYouth: VoiceRenderer = (mode: TranslationMode, f: CaseFacts, ctx: VoiceContext): PlatformDrafts => {
  const xiaohongshu = mode === "seed"
    ? { A: xhsSeedA(f), B: xhsSeedB(f) }
    : mode === "brand"
      ? { A: xhsBrandA(f), B: xhsBrandB(f) }
      : { A: xhsStoryA(f), B: xhsStoryB(f) };
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

void ({} as VoiceContext);
