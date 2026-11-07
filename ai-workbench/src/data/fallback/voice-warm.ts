import type { ContentVersion, TranslationMode } from "@/contracts/content";
import type { CaseFacts } from "./facts";
import type { PlatformDrafts, VoiceContext, VoiceRenderer } from "./voice-types";
import { makeStoryboard } from "./voice-types";

/** 温暖叙事：近距离观察视角，感官与留白推动情绪，意象回环收尾；emoji 克制（2-3 个） */

function xhsSeedA(f: CaseFacts, ctx: VoiceContext): ContentVersion {
  const para = [
    `${f.openingMoment}。`,
    `最初的需要并不复杂。${ctx.audience}想找一个不打扰生活、又把事情做好一点的${f.productId}。`,
    `第一次用，${f.firstTaste}。`,
    `后来才慢慢知道它的来处。${f.originScene}。${f.ruleSentence}`,
    `现在它在我${f.scenes[0]}。${f.visualDetail}，${f.scenes[1] ?? f.scenes[0]}也合适。${f.costPerUse}，日子就这样一点点过顺了。`,
    `不必急着替它下结论。${f.fit}的人，自然会懂。${f.notFit}。`,
    `慢慢来，也是一种对生活的认真。`,
  ].join("\n\n");
  return {
    title: `${f.productId}，是慢慢用出来的放心`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#慢生活"],
  };
}

function xhsSeedB(f: CaseFacts): ContentVersion {
  const para = [
    `第二份${f.productId}到的那个下午，我把旧罐子洗净收了起来。`,
    `想起第一次遇见它的时候。${f.firstTaste}，当时没有多想。`,
    `用得久了才知道，${f.ruleSentence}${f.personQuote}。`,
    `${f.priceLine}。${f.visualDetail}，是我每天愿意停下来看一眼的理由。`,
    `东西和人一样，处得久，才见真章。`,
    `如果你也在找一个安稳的日常，或许可以试试。${f.fit}。`,
  ].join("\n\n");
  return {
    title: `用完才想写的${f.productId}`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#日常好物"],
  };
}

function xhsBrandA(f: CaseFacts): ContentVersion {
  const para = [
    `品牌名字出现以前，先有人在具体的地方，做着具体的事。`,
    `${f.originScene}。`,
    `${f.ruleSentence}他说，${f.personQuote}。`,
    `这些事情落进产品里，是${f.specs[0]}。${f.priceLine}。`,
    `对用它的人来说，${f.tagline}。`,
    `被记住不必靠更响亮的声音。一次次兑现同一个承诺，名字自然有了重量。${f.gold}。`,
  ].join("\n\n");
  return {
    title: `${f.brand}想被记住的，是一件长期做下去的事`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#有故事的品牌"],
  };
}

function xhsBrandB(f: CaseFacts): ContentVersion {
  const para = [
    `从${f.location}出发的一个品牌，怎样住进人的记忆。`,
    `人们或许先遇见产品。${f.firstTaste}。`,
    `后来才知道背后是谁、为何这样做。${f.ruleSentence}`,
    `专业并不冰冷。它落在每道流程，也落在愿意说明边界的坦诚里。${f.notFit}。`,
    `${f.priceLine}。${f.fit}。`,
    `这便是${f.brand}希望留下的印象。`,
  ].join("\n\n");
  return {
    title: `从${f.location}出发，${f.brand}的来路`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#品牌故事"],
  };
}

function xhsStoryA(f: CaseFacts): ContentVersion {
  const para = [
    `${f.openingMoment}。拆开的瞬间，${f.smellLine}。`,
    `${f.originScene}。`,
    `${f.ruleSentence}有人劝过，他说，${f.personQuote}。`,
    `这${f.productId}，就是从这样的地方来的。${f.priceLine}，${f.specs[0]}。`,
    `现在它在我${f.scenes[0]}。${f.visualDetail}的时候，总觉得那些远处的清晨也跟着过来了。`,
    `${f.gold}。`,
  ].join("\n\n");
  return {
    title: `${f.brand}的事，要从${f.location}的一个清晨说起`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#慢生活", "#有故事的品牌"],
  };
}

function xhsStoryB(f: CaseFacts): ContentVersion {
  const para = [
    `收到${f.brand}的东西之前，我对${f.industry}的印象还停在货架。`,
    `${f.firstTaste}。`,
    `后来才知道背后的讲究。${f.originScene}。`,
    `${f.ruleSentence}他的原话是，${f.personQuote}。`,
    `${f.priceLine}。${f.scenes[1] ?? f.scenes[0]}的时候拿出来，${f.visualDetail}。`,
    `日子往前走，好的东西慢慢留下。${f.gold}。`,
  ].join("\n\n");
  return {
    title: `用了一段时间，才慢慢看懂${f.brand}`,
    body: para,
    hashtags: [...f.xhsTags.slice(0, 3), "#日常好物"],
  };
}

function weiboSeed(f: CaseFacts): ContentVersion {
  const body = `用了些日子的${f.productId}，想认真说一句。${f.firstTaste}。${f.ruleSentence}${f.priceLine}。${f.fit}的人会懂。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboSeedB(f: CaseFacts): ContentVersion {
  const body = `第二份${f.productId}到了。用旧了才知道，${f.costPerUse}，${f.visualDetail}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboBrand(f: CaseFacts): ContentVersion {
  const body = `${f.brand}的名字出现以前，先有人在${f.location}做着具体的事。${f.personRule}，这条规矩立了就没有破过。${f.priceLine}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboBrandB(f: CaseFacts): ContentVersion {
  const body = `专业并不冰冷。${f.brand}把它落在${f.specs[0]}，也落在愿意说明边界的坦诚里。${f.personQuote}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStory(f: CaseFacts): ContentVersion {
  const body = `${f.originScene}。${f.ruleSentence}他说，${f.personQuote}。${f.gold}。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function weiboStoryB(f: CaseFacts): ContentVersion {
  const body = `${f.openingMoment}。${f.smellLine}。后来才知道，${f.personRule}，是${f.brand}一直没破过的规矩。${f.pollQuestion}`;
  return { title: "", body, hashtags: [...f.weiboTags] };
}

function douyinStory(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.openingMoment}。`,
    `${f.originScene}。`,
    `${f.ruleSentence}他说，${f.personQuote}。`,
    `这${f.productId}，就是从这样的地方来的。`,
    `${f.gold}。`,
  ].join("\n");
  return {
    title: `${f.brand}的事，从一个清晨说起`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#有故事的品牌"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "收货或抵达的当下时刻，光线自然", voiceover: `${f.openingMoment}。`, bgm: "环境声先入，不加音乐" },
      { timeRange: "3-10s", shot: `${f.originScene}的实景，节奏放慢`, voiceover: `${f.originScene}。`, bgm: "轻音乐慢慢进入" },
      { timeRange: "10-16s", shot: "人物手部与工序特写", voiceover: `${f.ruleSentence}他说，${f.personQuote}。`, bgm: "音乐放缓" },
      { timeRange: "16-20s", shot: "使用场景收尾，品牌最后出现", voiceover: `${f.gold}。`, bgm: "留一秒余韵" },
    ]),
  };
}

function douyinStoryB(f: CaseFacts): ContentVersion {
  const voice = [
    `手边这份${f.productId}，先看结果。`,
    `${f.firstTaste}。`,
    `往前回望，${f.originScene}。`,
    `${f.ruleSentence}`,
    `现在再看手里这份，${f.gold}。`,
  ].join("\n");
  return {
    title: `再看一眼手里的${f.productId}`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#溯源"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "成品在手边的安静画面", voiceover: `手边这份${f.productId}，先看结果。${f.firstTaste}。`, bgm: "轻柔开场" },
      { timeRange: "3-10s", shot: "回望产地，慢镜头", voiceover: `往前回望，${f.originScene}。`, bgm: "音乐渐起" },
      { timeRange: "10-16s", shot: "人物与规矩对应的画面", voiceover: `${f.ruleSentence}`, bgm: "节奏平缓" },
      { timeRange: "16-20s", shot: "回到手边，首尾呼应", voiceover: `现在再看手里这份，${f.gold}。`, bgm: "余韵收束" },
    ]),
  };
}

function douyinSeed(f: CaseFacts): ContentVersion {
  const voice = [
    `用了些日子的${f.productId}，想认真说一句。`,
    `${f.firstTaste}。${f.visualDetail}。`,
    `${f.ruleSentence}`,
    `${f.priceLine}。${f.costPerUse}。`,
    `慢慢用，会觉得日子顺一点。`,
  ].join("\n");
  return {
    title: `用了些日子，才想说的${f.productId}`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4)],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "日常使用场景，光线柔和", voiceover: `用了些日子的${f.productId}，想认真说一句。`, bgm: "温和开场" },
      { timeRange: "3-9s", shot: `使用细节：${f.visualDetail}`, voiceover: `${f.firstTaste}。${f.visualDetail}。`, bgm: "轻音乐" },
      { timeRange: "9-15s", shot: "人物与工序画面", voiceover: `${f.ruleSentence}`, bgm: "平稳" },
      { timeRange: "15-20s", shot: "使用场景收尾", voiceover: `${f.priceLine}。慢慢用，会觉得日子顺一点。`, bgm: "收束" },
    ]),
  };
}

function douyinSeedB(f: CaseFacts): ContentVersion {
  const voice = [
    `第二份${f.productId}到的那个下午。`,
    `旧罐子洗净收起来，新的打开。${f.smellLine || f.firstTaste}。`,
    `${f.costPerUse}。`,
    `安稳的东西，会让日子有细水长流的感觉。`,
  ].join("\n");
  return {
    title: `第二份${f.productId}到的下午`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#日常"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "收包裹的安静画面", voiceover: `第二份${f.productId}到的那个下午。`, bgm: "环境声" },
      { timeRange: "3-9s", shot: "新旧交替的手部特写", voiceover: `旧罐子洗净收起来，新的打开。${f.smellLine || f.firstTaste}。`, bgm: "轻音乐渐入" },
      { timeRange: "9-15s", shot: "日常使用画面", voiceover: `${f.costPerUse}。`, bgm: "平稳" },
      { timeRange: "15-20s", shot: "窗边收尾，光线柔和", voiceover: `安稳的东西，会让日子有细水长流的感觉。`, bgm: "余韵" },
    ]),
  };
}

function douyinBrand(f: CaseFacts): ContentVersion {
  const voice = [
    `${f.brand}的名字出现以前，先有人在${f.location}做着具体的事。`,
    `${f.personRule}，这条规矩没有破过。`,
    `${f.personQuote}。`,
    `${f.tagline}。`,
    `${f.gold}。`,
  ].join("\n");
  return {
    title: `${f.brand}想被记住的，是一件长期的事`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#品牌故事"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: `${f.location}的开场画面`, voiceover: `${f.brand}的名字出现以前，先有人在${f.location}做着具体的事。`, bgm: "环境声开场" },
      { timeRange: "3-10s", shot: "人物工作的慢镜头", voiceover: `${f.personRule}，这条规矩没有破过。`, bgm: "轻音乐" },
      { timeRange: "10-16s", shot: "产品成品特写", voiceover: `${f.personQuote}。${f.tagline}。`, bgm: "平稳" },
      { timeRange: "16-20s", shot: "品牌画面，留白收尾", voiceover: `${f.gold}。`, bgm: "余韵" },
    ]),
  };
}

function douyinBrandB(f: CaseFacts): ContentVersion {
  const voice = [
    `专业并不冰冷。`,
    `${f.brand}把它落在${f.specs[0]}，也落在愿意说明边界的坦诚里。`,
    `${f.notFit}，丑话照说。`,
    `${f.priceLine}。`,
    `这样的牌子，值得慢慢认识。`,
  ].join("\n");
  return {
    title: `把丑话说在前面的${f.brand}`,
    body: voice,
    hashtags: [...f.douyinTags.slice(0, 4), "#坦诚"],
    storyboard: makeStoryboard([
      { timeRange: "0-3s", shot: "字幕：专业并不冰冷", voiceover: `专业并不冰冷。`, bgm: "温和开场" },
      { timeRange: "3-10s", shot: "参数与工序画面", voiceover: `${f.brand}把它落在${f.specs[0]}，也落在愿意说明边界的坦诚里。`, bgm: "轻节奏" },
      { timeRange: "10-16s", shot: "边界说明的字幕", voiceover: `${f.notFit}，丑话照说。`, bgm: "平稳" },
      { timeRange: "16-20s", shot: "产品定格", voiceover: `${f.priceLine}。这样的牌子，值得慢慢认识。`, bgm: "收束" },
    ]),
  };
}

export const renderWarm: VoiceRenderer = (mode: TranslationMode, f: CaseFacts, ctx: VoiceContext): PlatformDrafts => {
  const xiaohongshu = mode === "seed"
    ? { A: xhsSeedA(f, ctx), B: xhsSeedB(f) }
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
