import type { Enterprise, GenerateRequest, GenerateResult, PlatformVersions } from "@/contracts/content";

export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? "品牌坚守真实品质与在地故事。";
  const goal = request.goal.trim() || "把品牌的好故事分享给更多人";
  const brand = enterprise.name;
  const tag = enterprise.industry.replaceAll(" ", "");
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
  const all = { xiaohongshu, weibo, douyin };
  return {
    contractVersion: 1,
    enterpriseId: enterprise.id,
    source: "fallback",
    platforms: Object.fromEntries(request.platforms.map((platform) => [platform, all[platform]])),
  };
}
