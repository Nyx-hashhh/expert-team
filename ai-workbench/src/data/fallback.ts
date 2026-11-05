import type { Enterprise, GenerateRequest, GenerateResult, PlatformVersions } from "@/contracts/content";

export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? "品牌坚守真实品质与在地故事。";
  const goal = request.goal.trim() || "把品牌的好故事分享给更多人";
  const brand = enterprise.name;
  const tag = enterprise.industry.replaceAll(" ", "");
  const foreignUsesChinese = /中文|汉语/.test(goal) || (!/英文|英语|\benglish\b/i.test(goal) && /[\u3400-\u9fff]/.test(goal));
  const foreignGoal = goal
    .replace(/^(?:请)?(?:用|使用)(?:中文|汉语|英文|英语)(?:写|撰写|输出)?[：:,，。;；\s]*/u, "")
    .replace(/^(?:please\s+)?(?:write|respond)\s+in\s+(?:english|chinese)[.:,;\s]*/i, "")
    .replace(/[。.!！?？]+$/u, "")
    .trim();
  const englishGoal = /[\u3400-\u9fff]/.test(foreignGoal) ? "" : foreignGoal;
  const englishProduct = /[\u3400-\u9fff]/.test(product) ? "" : product;
  const englishFocus = englishGoal.replace(/^(?:promote|showcase|highlight|introduce|feature)\s+/i, "");
  const englishFocusSentence = englishFocus !== englishGoal ? `Discover ${englishFocus.charAt(0).toLowerCase()}${englishFocus.slice(1)}.` : englishGoal ? `${englishGoal}.` : "";
  const englishLocation: Record<string, string> = { "spring-tea": "Anji, Zhejiang", "heritage-town": "Jingdezhen, Jiangxi", "navel-orange": "Ganzhou, Jiangxi" };
  const locationEn = /[\u3400-\u9fff]/.test(enterprise.location) ? englishLocation[enterprise.id] : enterprise.location;
  const xiaohongshu: PlatformVersions = {
    A: {
      title: `谁懂！把${enterprise.industry}带进日常的快乐`,
      body: `最近发现了一个想分享给朋友的小众好物 ✨\n\n${brand}来自${enterprise.location}。${product}\n\n这次我们想说：${goal}。比起匆匆划过的广告，更希望你能感受到它背后的认真与温度。\n\n如果你也喜欢有故事的好东西，先收藏，找个周末慢慢了解吧 🤍`,
      hashtags: [`#${tag}`, "#宝藏品牌", "#生活里的小确幸", "#送礼灵感"],
    },
    B: {
      title: `送礼不想撞款？我找到了${brand}`,
      body: `还在为送什么礼物纠结吗？🎁\n\n我最近被${brand}打动了。它不是流水线式的选择，而是来自${enterprise.location}的一份用心：${product}\n\n${goal}。分享给同样想认真挑礼物的你，实用、有记忆点，也能把故事讲给收礼的人听。\n\n你会把它送给谁？评论区告诉我！`,
      hashtags: [`#${tag}`, "#走心礼物", "#本地好物", "#发现好品牌"],
    },
  };
  const weibo: PlatformVersions = {
    A: {
      title: `${brand}上新提案`,
      body: `来自${enterprise.location}的${brand}，把${enterprise.industry}做出了新意。${product}\n\n这次传播主题：${goal}。欢迎分享你的看法，一起为认真做产品的小品牌打气！`,
      hashtags: [`#${tag}#`, "#中小企业好物#", "#地方品牌新发现#"],
    },
    B: {
      title: `把好故事带上热搜`,
      body: `一件好产品，背后是一群认真生活的人。${brand}从${enterprise.location}出发，用自己的方式讲述${enterprise.industry}。${goal}。转发给那个会喜欢它的朋友！`,
      hashtags: [`#${brand}#`, "#宝藏国货#", "#好物分享#"],
    },
  };
  const douyin: PlatformVersions = {
    A: {
      title: `3 秒带你认识${brand}`,
      body: `开场钩子：你以为${enterprise.industry}只能这样？\n核心卖点：${product}\n结尾行动：来认识${brand}。`,
      hashtags: [`#${tag}`, "#品牌故事", "#好物推荐"],
      storyboard: [
        { timeRange: "0–3s", shot: "特写｜产品细节快速切入，字幕抛出反差问题", voiceover: `你以为${enterprise.industry}只能这样？`, bgm: "轻快节拍，首秒入点" },
        { timeRange: "3–9s", shot: "中景｜产地与制作过程交替展示", voiceover: `${brand}来自${enterprise.location}，每一步都认真。`, bgm: "节奏逐渐明亮" },
        { timeRange: "9–15s", shot: "近景｜使用场景与品牌收尾", voiceover: `${goal}。现在，就从${brand}开始。`, bgm: "温暖收束" },
      ],
    },
    B: {
      title: `${brand}的一天`,
      body: `开场钩子：这份来自${enterprise.location}的心意，你见过吗？\n用一段日常场景讲出品牌温度。`,
      hashtags: [`#${brand}`, "#地方好物", "#记录生活"],
      storyboard: [
        { timeRange: "0–3s", shot: "近景｜礼盒打开的瞬间，镜头推进", voiceover: "这份礼物，为什么让人记住？", bgm: "清脆开盒音效" },
        { timeRange: "3–10s", shot: "全景｜产地环境、人物手作、产品轮播", voiceover: `${brand}把${enterprise.location}的故事装了进去。`, bgm: "自然舒缓的木吉他" },
        { timeRange: "10–15s", shot: "特写｜递给朋友，定格笑脸", voiceover: `${goal}。把这份心意分享出去。`, bgm: "温暖尾音" },
      ],
    },
  };
  const reddit: PlatformVersions = foreignUsesChinese ? {
    A: {
      title: `我们是${brand}，欢迎聊聊小品牌的成长`,
      body: `大家好，我们是${brand}。我们正在探索怎样把认真做出的产品介绍给更多人。${product}\n\n${foreignGoal}。如果你第一次接触一个小品牌，最想了解什么？欢迎直接提问，我们会认真回复。`,
      hashtags: ["r/smallbusiness", "讨论", "品牌故事"],
    },
    B: {
      title: `什么样的本地品牌值得你支持？`,
      body: `我们在经营${brand}时一直思考这个问题。品牌的故事始于${enterprise.location}，而产品的细节也值得被看见：${product}\n\n${foreignGoal}。你会因为什么信任一个刚认识的小品牌？`,
      hashtags: ["r/Entrepreneur", "提问", "小企业"],
    },
  } : {
    A: {
      title: `Meet ${brand} — ask us anything`,
      body: `Hi r/smallbusiness! We are building ${brand}${locationEn ? ` in ${locationEn}` : ""}, and we would love to hear from this community.${englishProduct ? `\n\n${englishProduct}` : ""}${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nWhat would you want to know before trying a brand like ours? We are here to listen and learn.`,
      hashtags: ["r/smallbusiness", "Discussion", "Founder story"],
    },
    B: {
      title: "What makes a local brand worth supporting?",
      body: `We have been thinking about this while growing ${brand}. For us, it comes down to knowing the people behind a product and whether it earns your trust.${locationEn ? ` Our story starts in ${locationEn}.` : ""}${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nWhat matters most to you when you discover an independent brand?`,
      hashtags: ["r/Entrepreneur", "Question", "Small business"],
    },
  };
  const discord: PlatformVersions = foreignUsesChinese ? {
    A: {
      title: `✨ ${brand}的新消息`,
      body: `大家好！想和社群分享我们最近在做的事。\n\n${product}\n\n${foreignGoal}。有什么想了解的，欢迎在讨论区留言。`,
      hashtags: ["#公告", "#新品消息", "#社群"],
    },
    B: {
      title: `${brand}社群抢先看`,
      body: `先把这个消息告诉大家 👀\n\n${brand}正在把来自${enterprise.location}的故事分享给更多人。${product}\n\n${foreignGoal}。如果想看幕后过程，欢迎留言告诉我们。`,
      hashtags: ["#社群预览", "#幕后故事", "#交流"],
    },
  } : {
    A: {
      title: `✨ New from ${brand}`,
      body: `Hey everyone! We are excited to share what we have been working on${locationEn ? ` in ${locationEn}` : ""}.${englishProduct ? `\n\n${englishProduct}` : ""}${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nDrop your questions in the thread — our team will be here to chat.`,
      hashtags: ["#announcements", "#new-release", "#community"],
    },
    B: {
      title: `Community first look: ${brand}`,
      body: `You are getting the first look before anyone else 👀\n\nHere is a closer look at the people and care behind ${brand}.${locationEn ? ` Our story starts in ${locationEn}.` : ""}${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nReact with 🌿 if you want a behind-the-scenes tour, or reply with what you would like to see next.`,
      hashtags: ["#community-preview", "#behind-the-scenes", "#feedback"],
    },
  };
  const instagram: PlatformVersions = foreignUsesChinese ? {
    A: {
      title: `把${enterprise.location}的好味道带回家`,
      body: `${brand}来自${enterprise.location}。${product}\n\n${foreignGoal}。喜欢当季好物的话，欢迎留言交流。`,
      hashtags: [`#${tag}`, "#当季好物", "#产地直达"],
    },
    B: {
      title: `从产地到日常，认识${brand}`,
      body: `想知道一份好产品从哪里来？走进${enterprise.location}，看看${brand}背后的用心。${product}\n\n${foreignGoal}。你最想了解哪个细节？欢迎在评论区告诉我们。`,
      hashtags: [`#${tag}`, "#产地故事", "#发现好物"],
    },
  } : {
    A: {
      title: "A closer look at what makes it special",
      body: `Thoughtful details, a sense of place, and a story worth sharing.${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nWhat would you like to know more about? Tell us below.`,
      hashtags: ["#SmallBusiness", "#MadeWithCare", "#DiscoverLocal"],
    },
    B: {
      title: "The story behind the details",
      body: `There is more to this product than meets the eye. Explore the people, place, and care behind it.${englishFocusSentence ? `\n\n${englishFocusSentence}` : ""}\n\nSave this post for later and share your questions in the comments.`,
      hashtags: ["#BrandStory", "#BehindTheScenes", "#IndependentBrand", "#ShopSmall"],
    },
  };
  const tiktok: PlatformVersions = foreignUsesChinese ? {
    A: {
      title: `认识来自${enterprise.location}的${brand}`,
      body: `开场：先看看这个产品的细节。\n亮点：${product}\n结尾：关注${brand}，了解更多品牌故事。`,
      hashtags: ["#小品牌", "#发现好物", "#品牌故事"],
      storyboard: [
        { timeRange: "0–2秒", shot: "产品细节特写，镜头快速推进", voiceover: `先来认识${brand}。`, bgm: "轻快节奏，产品出现时切入重拍" },
        { timeRange: "2–8秒", shot: "产地、制作过程与产品细节快速切换", voiceover: product, bgm: "画面跟随节拍切换" },
        { timeRange: "8–15秒", shot: "展示使用场景，以品牌画面收尾", voiceover: `${foreignGoal}。关注我们，继续了解。`, bgm: "温暖收束" },
      ],
    },
    B: {
      title: `${brand}的15秒故事`,
      body: `开场：故事从${enterprise.location}开始。\n中段：看见产品背后的人与细节。\n结尾：你会想试试吗？欢迎留言。`,
      hashtags: ["#认识品牌", "#产地故事", "#好物分享"],
      storyboard: [
        { timeRange: "0–3秒", shot: "从一个有趣的细节开始，字幕抛出问题", voiceover: "一个好产品，能让你记住什么？", bgm: "好奇感开场音效" },
        { timeRange: "3–10秒", shot: "展示制作过程、当地环境和成品", voiceover: `${brand}把${enterprise.location}的故事放进每个细节。`, bgm: "自然节奏逐渐增强" },
        { timeRange: "10–15秒", shot: "产品递到手中，镜头定格", voiceover: `${foreignGoal}。你会想试试吗？`, bgm: "提问前短暂停顿" },
      ],
    },
  } : {
    A: {
      title: `A closer look at ${brand}`,
      body: `Hook: Stop scrolling and take a closer look.\nStory: ${englishProduct || `Meet the people and details behind ${brand}.`}\nNext: ${englishFocusSentence || "Follow along for more."}`,
      hashtags: ["#SmallBusinessTok", "#HiddenGem", "#BrandStory"],
      storyboard: [
        { timeRange: "0–2s", shot: "Close-up reveal with a fast push-in", voiceover: `Stop scrolling — meet ${brand}.`, bgm: "Upbeat audio, beat drop on reveal" },
        { timeRange: "2–8s", shot: "Quick cuts of the place, process and product details", voiceover: "Every detail has a story.", bgm: "Keep cuts synced to the beat" },
        { timeRange: "8–15s", shot: "Product in use, then logo and comment prompt", voiceover: `${englishFocusSentence ? `${englishFocusSentence} ` : ""}Follow to see more.`, bgm: "Warm lift and clean finish" },
      ],
    },
    B: {
      title: `The 15-second story behind ${brand}`,
      body: `Hook: ${locationEn ? `This started in ${locationEn}.` : "Every brand starts somewhere."}\nStory: One detail, one maker, one reason it matters.\nNext: What would you like to know? Comment below.`,
      hashtags: ["#TikTokMadeMeBuyIt", "#MeetTheMaker", "#ShopSmall"],
      storyboard: [
        { timeRange: "0–3s", shot: "Open on a surprising detail, text overlay asks a question", voiceover: "What makes a product feel personal?", bgm: "Curious opening sting" },
        { timeRange: "3–10s", shot: "Maker hands, local scenery and finished product", voiceover: `${brand} brings care to every detail.`, bgm: "Organic rhythmic build" },
        { timeRange: "10–15s", shot: "Hand-off moment and direct-to-camera close", voiceover: `${englishFocusSentence ? `${englishFocusSentence} ` : ""}Would you try it?`, bgm: "Beat pause for the question" },
      ],
    },
  };
  const all: Record<GenerateRequest["platforms"][number], PlatformVersions> = { xiaohongshu, weibo, douyin, reddit, discord, instagram, tiktok };
  return {
    contractVersion: 1,
    enterpriseId: enterprise.id,
    source: "fallback",
    platforms: Object.fromEntries(request.platforms.map((platform) => [platform, all[platform]])),
  };
}
