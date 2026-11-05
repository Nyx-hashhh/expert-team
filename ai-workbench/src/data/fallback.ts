import type { Enterprise, GenerateRequest, GenerateResult, PlatformVersions } from "@/contracts/content";

export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? "品牌坚守真实品质与在地故事。";
  const goal = request.goal.trim() || "把品牌的好故事分享给更多人";
  const brand = enterprise.name;
  const tag = enterprise.industry.replaceAll(" ", "");
  const instagramUsesChinese = /中文|汉语/.test(goal) || (!/英文|英语|\benglish\b/i.test(goal) && /[\u3400-\u9fff]/.test(goal));
  const instagramGoal = goal
    .replace(/^(?:请)?(?:用|使用)(?:中文|汉语|英文|英语)(?:写|撰写|输出)?[：:,，。;；\s]*/u, "")
    .replace(/^(?:please\s+)?(?:write|respond)\s+in\s+(?:english|chinese)[.:,;\s]*/i, "")
    .replace(/[。.!！?？]+$/u, "")
    .trim();
  const englishGoal = /[\u3400-\u9fff]/.test(instagramGoal) ? "" : instagramGoal;
  const englishFocus = englishGoal.replace(/^(?:promote|showcase|highlight|introduce|feature)\s+/i, "");
  const englishFocusSentence = englishFocus !== englishGoal ? `Discover ${englishFocus.charAt(0).toLowerCase()}${englishFocus.slice(1)}.` : englishGoal ? `${englishGoal}.` : "";
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
  const reddit: PlatformVersions = {
    A: {
      title: `We are ${brand}, a small ${enterprise.industry} brand from ${enterprise.location} — AMA`,
      body: `Hi r/smallbusiness! We are building ${brand} in ${enterprise.location}, and our focus is simple: ${product}\n\nOur next goal is to ${goal}. We would love honest feedback from this community: what would you want to know before trying a brand like ours? No hard sell — we are here to listen and learn.`,
      hashtags: ["r/smallbusiness", "Discussion", "Founder story"],
    },
    B: {
      title: `What makes a local ${enterprise.industry} brand worth supporting?`,
      body: `We have been thinking about this while growing ${brand}. For us, it comes down to where the product comes from, who makes it, and whether the quality holds up.\n\nOur story starts in ${enterprise.location}: ${product}\n\nWe are currently working to ${goal}. What earns your trust when you discover an unfamiliar independent brand?`,
      hashtags: ["r/Entrepreneur", "Question", "Small business"],
    },
  };
  const discord: PlatformVersions = {
    A: {
      title: `✨ New from ${brand}`,
      body: `Hey everyone! We are excited to share what we have been working on in ${enterprise.location}.\n\n**Why it is special**\n${product}\n\n**What is next**\n${goal}\n\nDrop your questions in the thread — our team will be here to chat.`,
      hashtags: ["#announcements", "#new-release", "#community"],
    },
    B: {
      title: `Community first look: ${brand}`,
      body: `You are getting the first look before anyone else 👀\n\n${brand} is our way of sharing a piece of ${enterprise.location} with more people. ${product}\n\nWe are now preparing to ${goal}. React with 🌿 if you want a behind-the-scenes tour, or reply with what you would like us to show next.`,
      hashtags: ["#community-preview", "#behind-the-scenes", "#feedback"],
    },
  };
  const instagram: PlatformVersions = instagramUsesChinese ? {
    A: {
      title: `把${enterprise.location}的好味道带回家`,
      body: `${brand}来自${enterprise.location}。${product}\n\n${instagramGoal}。喜欢当季好物的话，欢迎留言交流。`,
      hashtags: [`#${tag}`, "#当季好物", "#产地直达"],
    },
    B: {
      title: `从产地到日常，认识${brand}`,
      body: `想知道一份好产品从哪里来？走进${enterprise.location}，看看${brand}背后的用心。${product}\n\n${instagramGoal}。你最想了解哪个细节？欢迎在评论区告诉我们。`,
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
  const tiktok: PlatformVersions = {
    A: {
      title: `POV: you just found a hidden gem from ${enterprise.location}`,
      body: `Hook: Stop scrolling — this is not your usual ${enterprise.industry} brand.\nPayoff: ${product}\nCTA: Follow ${brand} and watch the story unfold.`,
      hashtags: ["#SmallBusinessTok", "#HiddenGem", "#BrandStory"],
      storyboard: [
        { timeRange: "0–2s", shot: "Macro product reveal with a fast push-in", voiceover: `Stop scrolling — meet ${brand}.`, bgm: "Trending upbeat audio, beat drop on reveal" },
        { timeRange: "2–8s", shot: "Quick cuts of the place, process and product details", voiceover: `${product}`, bgm: "Keep cuts synced to the beat" },
        { timeRange: "8–15s", shot: "Product in use, then logo and comment prompt", voiceover: `${goal}. Follow to see what happens next.`, bgm: "Warm lift and clean finish" },
      ],
    },
    B: {
      title: `The 15-second story behind ${brand}`,
      body: `Hook: This started in ${enterprise.location}.\nStory: One detail, one maker, one reason it matters.\nCTA: Would you try it? Comment below.`,
      hashtags: ["#TikTokMadeMeBuyIt", "#MeetTheMaker", "#ShopSmall"],
      storyboard: [
        { timeRange: "0–3s", shot: "Open on a surprising detail, text overlay asks a question", voiceover: `What if ${enterprise.industry} could feel this personal?`, bgm: "Curious opening sting" },
        { timeRange: "3–10s", shot: "Maker hands, local scenery and finished product", voiceover: `${brand} brings a piece of ${enterprise.location} into every detail.`, bgm: "Organic rhythmic build" },
        { timeRange: "10–15s", shot: "Hand-off moment and direct-to-camera close", voiceover: `${goal}. Would you try it?`, bgm: "Beat pause for the question" },
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
