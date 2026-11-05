import type { Enterprise, GenerateRequest, GenerateResult, PlatformVersions } from "@/contracts/content";
import { buildCreativeBrief } from "@/data/translation";

export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? "品牌坚守真实品质与在地故事。";
  const goal = request.goal.trim() || "把品牌的好故事分享给更多人";
  const brand = enterprise.name;
  const tag = enterprise.industry.replaceAll(" ", "");
  const brief = request.creativeBrief ?? buildCreativeBrief({ contractVersion: 1, enterpriseId: request.enterpriseId, selectedMaterials: request.selectedMaterials, goal, tone: request.tone, mode: request.translationMode ?? "story" }, enterprise);
  const brandStory = request.selectedMaterials.find((item) => item.type === "story")?.content ?? enterprise.tagline;
  const xiaohongshu: PlatformVersions = {
    A: {
      title: brief.hook,
      body: `${brief.storyAngle}\n\n${brandStory}\n\n真正打动我的，是一个很具体的细节：${product}\n\n${brief.coreMessage}\n\n不急着下结论。你会在什么样的时刻，想起这样的东西？`,
      hashtags: [`#${tag}`, "#宝藏品牌", "#生活里的小确幸", "#送礼灵感"],
    },
    B: {
      title: `${brief.audience}会懂的一个小选择`,
      body: `故事不是从“推荐”开始的。\n\n它从一个很普通的念头开始：想在${enterprise.location}之外，也留住一点这里的味道和生活。于是有了${brand}。\n\n${product}\n\n没有夸张的承诺，只是把该做的细节做好。也许这正是${goal}真正值得被看见的方式。\n\n如果是你，会把它留给自己，还是送给某个人？`,
      hashtags: [`#${tag}`, "#走心礼物", "#本地好物", "#发现好品牌"],
    },
  };
  const weibo: PlatformVersions = {
    A: {
      title: `${brand}上新提案`,
      body: `${brief.hook}\n\n${brandStory}\n\n${product}\n\n${brief.coreMessage}\n\n你愿意为怎样的细节停下来？`,
      hashtags: [`#${tag}#`, "#中小企业好物#", "#地方品牌新发现#"],
    },
    B: {
      title: `把好故事带上热搜`,
      body: `先别急着把${brand}叫作“好品牌”。\n\n看看它从哪里来：${enterprise.location}。看看是谁在做：${brandStory}\n\n再看看留下来的细节：${product}\n\n答案交给你。`,
      hashtags: [`#${brand}#`, "#宝藏国货#", "#好物分享#"],
    },
  };
  const douyin: PlatformVersions = {
    A: {
      title: brief.hook,
      body: `开场不报品牌名，先让观众看见一个真实场景。\n中段用人物动作带出：${product}\n结尾只留一句克制的问题，不喊口号。`,
      hashtags: [`#${tag}`, "#品牌故事", "#好物推荐"],
      storyboard: [
        { timeRange: "0–3s", shot: "特写｜先出现手部动作或生活细节，不露品牌全貌", voiceover: brief.hook, bgm: "环境声先入，第二秒才进轻节拍" },
        { timeRange: "3–9s", shot: "中景｜人物、产地与产品细节交替，不使用棚拍式轮播", voiceover: brief.storyAngle, bgm: "节奏自然抬升" },
        { timeRange: "9–15s", shot: "近景｜真实使用瞬间，最后一秒再出现品牌", voiceover: `${brief.coreMessage} 你会为这个细节停下来吗？`, bgm: "留半秒空白后收束" },
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
  const instagram: PlatformVersions = {
    A: {
      title: `A story worth slowing down for`,
      body: `Made with care in ${enterprise.location}. ${product}\n\nAt ${brand}, we believe the best things carry a sense of place. Today, we are taking the next step: ${goal}.\n\nSave this post for later and share it with someone who loves discovering thoughtful independent brands.`,
      hashtags: ["#SmallBusiness", "#MadeWithCare", `#${brand.replaceAll(" ", "")}`, "#DiscoverLocal"],
    },
    B: {
      title: `From ${enterprise.location}, with care`,
      body: `Swipe to meet ${brand} — the people, place and details behind every product.\n\n${product}\n\nOur current mission: ${goal}. Which part of the story would you like to see next? Tell us below.`,
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
