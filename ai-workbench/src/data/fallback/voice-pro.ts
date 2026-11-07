import type { ContentVersion, TranslationMode } from "@/contracts/content";
import type { CaseFacts } from "./facts";
import type { PlatformDrafts, VoiceContext, VoiceRenderer } from "./voice-types";
import { makeStoryboard } from "./voice-types";

/** 专业品鉴：分析者视角，零 emoji，结论附带条件；评价维度与证据互相印证 */

function xhsSeedA(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `这${f.productId}断续用了四周，把可核验的信息和实际感受分开记录。`,
    `先讲使用端：${f.firstTaste}。${f.visualDetail}。${f.scenes[0]}与${f.scenes[1] ?? f.scenes[0]}两个场景都试过，表现稳定。`,
    `再核产品端：${f.specs[0]}；${f.specs[1] ?? f.specs[0]}。${f.priceLine}，${f.costPerUse}。`,
    `供应端值得记一笔：${f.ruleSentence}这条规矩解释了批次稳定性的来源。`,
    `面向${ctx.audience}的结论：${f.fit}，匹配度较高。${f.notFit}，选购前应对照自身条件。`,
    `附一份判断口径：同类产品比较时，优先核验参数与使用条件的对应关系，其次看供应端是否有稳定工序，最后才是个人偏好。${f.verifyAxis}是这类产品最值得先对的两项。`,
  ].join("\n\n");
  return {
    title: `${f.productId}四周使用记录与判断口径`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#使用记录"],
  };
}

function xhsSeedB(f: CaseFacts): ContentVersion {
  const para = [
    `第二份${f.productId}到手，补一次复核。`,
    `与首份对比：${f.firstTaste}的一致性可以确认。${f.specs[0]}，${f.priceLine}。`,
    `复核中发现的细节：${f.visualDetail}。${f.personRule}，这条约束对使用端的影响是稳定的。`,
    `成本口径更新：${f.costPerUse}。`,
    `适用判断维持原结论：${f.fit}。边界条件：${f.notFit}。`,
    `需要完整参数表的可以留言，逐项列。`,
  ].join("\n\n");
  return {
    title: `${f.productId}复核：第二份的一致性检验`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#复核记录"],
  };
}

function xhsBrandA(f: CaseFacts): ContentVersion {
  const para = [
    `${f.industry}品类的判断维度大致有三：原料或工序、供应端稳定性、消费者端利益。${f.brand}在这三项上各有可核验的对应。`,
    `原料与工序：${f.specs[0]}；${f.specs[1] ?? f.specs[0]}。`,
    `供应端稳定性来自一条约束：${f.ruleSentence}这类规矩的实际作用是减少批次波动，而非宣传语。`,
    `消费者端：${f.tagline}。${f.priceLine}，${f.costPerUse}。`,
    `边界：${f.notFit}。没有完整统计口径的排名与好评，暂不作为判断依据。`,
    `结论附带条件：${f.fit}时，${f.brand}具备优先核验价值；反之应先比较同类参数。`,
  ].join("\n\n");
  return {
    title: `${f.brand}的三维核验：原料、工序与边界`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 4), "#品牌核验"],
  };
}

function xhsBrandB(f: CaseFacts): ContentVersion {
  const para = [
    `把${f.brand}的公开信息按可信度分层列一遍。`,
    `第一层，可直接核验：${f.specs.join("；")}。${f.priceLine}。`,
    `第二层，供应端陈述：${f.ruleSentence}原话：${f.personQuote}。陈述与产品表现方向一致。`,
    `第三层，需长期验证：${f.tagline}。`,
    `使用参考：${f.firstTaste}。${f.scenes[0]}。`,
    `分层的目的只有一个：知道哪句话可以直接信，哪句话需要时间。${f.fit}可参考此框架。`,
  ].join("\n\n");
  return {
    title: `${f.brand}的信息分层：哪些可信，哪些要验证`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#信息核验", "#理性消费"],
  };
}

function xhsStoryA(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `${f.openingMoment}。`,
    `从工序链看这份${f.productId}：${f.originScene}。${f.specs[0]}。`,
    `关键节点在人的决策上：${f.ruleSentence}${f.personQuote}。这一步决定了原料端的下限。`,
    `到消费端：${f.firstTaste}。${f.priceLine}。`,
    `面向${ctx.audience}：${f.fit}。${f.notFit}。`,
    `${f.gold}。这句不是修辞，是这条供应链的真实时间结构。`,
  ].join("\n\n");
  return {
    title: `从${f.location}到手边：一份${f.productId}的工序链`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#溯源", "#工序"],
  };
}

function xhsStoryB(f: CaseFacts): ContentVersion {
  const para = [
    `${f.productId}的判断，最后落在人的规矩上。`,
    `${f.originScene}。这条产线上最重要的约束是：${f.personRule}。`,
    `${f.ruleSentence}理由是他那句话，${f.personQuote}。`,
    `产品端对应：${f.specs[0]}，${f.priceLine}。使用端对应：${f.firstTaste}。`,
    `两条线互相印证，判断才立得住。${f.fit}；${f.notFit}。`,
  ].join("\n\n");
  return {
    title: `判断${f.brand}，最后落在一条规矩上`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#判断依据"],
  };
}

function weiboSeed(f: CaseFacts): ContentVersion {
  const body = `${f.productId}四周使用记录。使用端：${f.firstTaste}。产品端：${f.specs[0]}，${f.priceLine}。供应端：${f.ruleSentence}，解释了批次稳定性。结论附带条件：${f.fit}；${f.notFit}。${f.pollQuestion}`;
  return { title: `${f.productId}使用记录`, body, hashtags: [...f.weiboTags] };
}

function weiboSeedB(f: CaseFacts): ContentVersion {
  const body = `第二份${f.productId}复核完毕。与首份对比：一致性可确认，${f.specs[0]}。成本口径：${f.costPerUse}。${f.gold}。${f.pollQuestion}`;
  return { title: `${f.productId}复核结论`, body, hashtags: [...f.weiboTags] };
}

function weiboBrand(f: CaseFacts): ContentVersion {
  const body = `${f.industry}品类看三件事：原料工序、供应端稳定、消费者利益。${f.brand}的对应项：${f.specs[0]}；${f.personRule}；${f.tagline}。${f.priceLine}。无完整统计口径的排名暂不采信。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboBrandB(f: CaseFacts): ContentVersion {
  const body = `把${f.brand}的公开信息分层核验：可直接核验的是${f.specs[0]}；供应端陈述是${f.personRule}；需长期验证的是${f.tagline}。${f.priceLine}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStory(f: CaseFacts): ContentVersion {
  const body = `${f.originScene}。${f.ruleSentence}产品端对应${f.specs[0]}，${f.priceLine}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStoryB(f: CaseFacts): ContentVersion {
  const body = `判断${f.brand}，最后落在一条规矩上：${f.personRule}。理由是${f.personQuote}。${f.firstTaste}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function douyinSeed(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.productId}，用了四周，讲三个层次。`,
    `使用端，${f.firstTaste}。`,
    `产品端，${f.specs[0]}，${f.priceLine}。`,
    `供应端，${f.ruleSentence}批次稳定的来源就在这。`,
    `条件先给足：${f.fit}合适，${f.notFit}。`,
    `想看完整参数的，评论区留言。`,
  ].join("\n");
  return {
    title: `${f.productId}，三个层次的实测`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "三层框架字幕：使用端/产品端/供应端", voiceover: `${f.productId}，用了四周，讲三个层次。`, bgm: "简洁冷静的节拍" },
      { timeRange: "3-9s", shot: "真实使用画面", voiceover: `使用端，${f.firstTaste}。`, bgm: "现场声" },
      { timeRange: "9-15s", shot: "产品特写加参数字幕", voiceover: `产品端，${f.specs[0]}，${f.priceLine}。`, bgm: "节奏稳定" },
      { timeRange: "15-20s", shot: "供应端画面与规矩字幕", voiceover: `供应端，${f.ruleSentence}条件先给足：${f.fit}合适。`, bgm: "收束" },
    ]),
  };
}

function douyinSeedB(f: CaseFacts): ContentVersion {
  const voice = [
    `第二份${f.productId}，做一次一致性复核。`,
    `和首份对比：${f.firstTaste}，没跑偏。`,
    `参数复核：${f.specs[0]}。${f.model}，认准型号下单。`,
    `${f.costPerUse}，账在这。`,
    `复核结论维持原判：${f.fit}。`,
  ].join("\n");
  return {
    title: `第二份${f.productId}，一致性复核`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#复核"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "两份产品并排出现的画面", voiceover: `第二份${f.productId}，做一次一致性复核。`, bgm: "利落开场" },
      { timeRange: "3-9s", shot: "使用对比画面", voiceover: `和首份对比：${f.firstTaste}，没跑偏。`, bgm: "现场声" },
      { timeRange: "9-15s", shot: "型号特写与参数字幕", voiceover: `参数复核：${f.specs[0]}。${f.model}，认准型号下单。`, bgm: "突出旁白" },
      { timeRange: "15-20s", shot: "结论字幕定格", voiceover: `${f.costPerUse}，账在这。复核结论维持原判。`, bgm: "收尾" },
    ]),
  };
}

function douyinBrand(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.industry}品类，看三个维度。`,
    `原料工序，${f.specs[0]}。`,
    `供应端稳定，${f.personRule}，这是${f.brand}的约束。`,
    `消费者利益，${f.tagline}。${f.priceLine}。`,
    `${f.gold}。`,
    `三个维度都能核验的牌子，才值得进你的清单。`,
  ].join("\n");
  return {
    title: `${f.brand}，三个维度的核验`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "三维度框架字幕", voiceover: `${f.industry}品类，看三个维度。`, bgm: "冷静的节拍" },
      { timeRange: "3-9s", shot: "原料或工序实拍", voiceover: `原料工序，${f.specs[0]}。`, bgm: "现场声" },
      { timeRange: "9-15s", shot: "人物规矩对应的画面", voiceover: `供应端稳定，${f.personRule}。`, bgm: "节奏推进" },
      { timeRange: "15-20s", shot: "产品与品牌定格", voiceover: `消费者利益，${f.tagline}。${f.gold}。`, bgm: "收束" },
    ]),
  };
}

function douyinBrandB(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.brand}的公开信息，按可信度分三层。`,
    `第一层可直接核验：${f.specs[0]}。`,
    `第二层供应端陈述：${f.personQuote}。`,
    `第三层要时间验证：${f.tagline}。`,
    `${f.priceLine}。`,
    `知道哪句能直接信，哪句要等时间，钱才花得明白。`,
  ].join("\n");
  return {
    title: `${f.brand}的信息，分三层看`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#理性消费"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "三层结构字幕", voiceover: `${f.brand}的公开信息，按可信度分三层。`, bgm: "极简开场" },
      { timeRange: "3-9s", shot: "第一层：参数特写", voiceover: `第一层可直接核验：${f.specs[0]}。`, bgm: "轻节奏" },
      { timeRange: "9-15s", shot: "第二层：人物画面", voiceover: `第二层供应端陈述：${f.personQuote}。`, bgm: "现场声" },
      { timeRange: "15-20s", shot: "第三层与价格字幕", voiceover: `第三层要时间验证：${f.tagline}。${f.priceLine}。`, bgm: "收尾" },
    ]),
  };
}

function douyinStory(f: CaseFacts): ContentVersion {
  const voice = [
    `这份${f.productId}，从${f.location}到手边。`,
    `${f.originScene}。`,
    `链上最关键的一环是人：${f.ruleSentence}`,
    `${f.personQuote}。`,
    `产品端对应：${f.specs[0]}，${f.priceLine}。`,
    `${f.gold}。`,
  ].join("\n");
  return {
    title: `从${f.location}到手边，这条链怎么走`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#溯源"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "产地全景开场", voiceover: `这份${f.productId}，从${f.location}到手边。`, bgm: "环境声" },
      { timeRange: "3-9s", shot: `${f.originScene}的实景`, voiceover: `${f.originScene}。`, bgm: "轻节奏进入" },
      { timeRange: "9-15s", shot: "人物工序特写", voiceover: `链上最关键的一环是人：${f.ruleSentence}${f.personQuote}。`, bgm: "现场声为主" },
      { timeRange: "15-20s", shot: "成品到手画面", voiceover: `产品端对应：${f.specs[0]}。${f.gold}。`, bgm: "收束" },
    ]),
  };
}

function douyinStoryB(f: CaseFacts): ContentVersion {
  const voice = [
    `先看手边这份${f.productId}。`,
    `${f.firstTaste}。`,
    `倒回源头：${f.originScene}。`,
    `链上最关键的一环：${f.ruleSentence}`,
    `两头对上，判断成立：${f.fit}。`,
    `${f.gold}。`,
  ].join("\n");
  return {
    title: `倒着看这份${f.productId}的来路`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#溯源", "#倒放"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "成品使用画面", voiceover: `先看手边这份${f.productId}。${f.firstTaste}。`, bgm: "轻快开场" },
      { timeRange: "3-9s", shot: "倒带回产地的转场", voiceover: `倒回源头：${f.originScene}。`, bgm: "倒带音效" },
      { timeRange: "9-15s", shot: "人物与工序", voiceover: `链上最关键的一环：${f.ruleSentence}`, bgm: "稳定节奏" },
      { timeRange: "15-20s", shot: "回到手边成品", voiceover: `两头对上，判断成立。${f.gold}。`, bgm: "收束" },
    ]),
  };
}

export const renderPro: VoiceRenderer = (mode: TranslationMode, f: CaseFacts, ctx: VoiceContext): PlatformDrafts => {
  const xiaohongshu = mode === "seed"
    ? { A: xhsSeedA(f, ctx), B: xhsSeedB(f) }
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
