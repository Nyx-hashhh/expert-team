import type { ContentVersion, CreativeBrief, Enterprise, GenerateRequest, GenerateResult, Platform, PlatformVersions, TranslationMode } from "@/contracts/content";
import { buildCreativeBrief } from "@/data/translation";

interface BrandProfile {
  opening: string;
  alternateOpening: string;
  tension: string;
  action: string;
  experience: string;
  benefit: string;
  fit: string;
  boundary: string;
  strength: string;
  visual: string;
  englishPlace: string;
  englishProduct: string;
  englishBenefit: string;
}

interface CopyPair {
  A: ContentVersion;
  B: ContentVersion;
}

function profileFor(enterprise: Enterprise, product: string): BrandProfile {
  if (enterprise.id === "spring-tea") return {
    opening: "安吉清晨的雾还没有散，海拔800米的茶园里，一芽一叶刚刚舒展开。",
    alternateOpening: "下午三点，办公室的消息提示音没有停，杯里的热水却让几片茶叶慢慢安静下来。",
    tension: "明前茶的采摘期很短，但春天不能被催熟；芽叶状态、天气和火候，都要求人耐心等到合适的时刻。",
    action: "三代茶农合作社坚持小批量采制，以一芽一叶为原料，再用低温慢焙保留春茶的清新。",
    experience: "50克独立罐放在工位不占地方，用普通杯具也能泡开，适合日常自饮，也适合作为轻巧的伴手礼。",
    benefit: "让不熟悉复杂茶席的人，也能在城市日常里尝到一杯有明确产地和时令的春茶。",
    fit: "适合想从清淡春茶入门、需要办公室茶饮或寻找轻量伴手礼的人。",
    boundary: "偏爱浓重焙火感或需要大份量囤茶的人，建议先确认滋味与规格是否符合习惯。",
    strength: "安吉产地、海拔800米茶园、清明前采摘、一芽一叶、小批量低温慢焙，构成了云岭春茶清楚而可核验的专业底座。",
    visual: "雾中茶园、指尖芽叶、低温慢焙的手部动作与办公室杯中舒展的茶叶",
    englishPlace: "Anji, Zhejiang",
    englishProduct: "high-mountain pre-Qingming spring tea, picked as one bud and one leaf and slowly roasted in small batches",
    englishBenefit: "an approachable spring-tea ritual for a desk, a quiet break, or a thoughtful gift",
  };
  if (enterprise.id === "heritage-town") return {
    opening: "转进青石巷时，老街的声音先慢了下来：脚步落在石板上，工坊里传来工具与材料相触的轻响。",
    alternateOpening: "手机里存过很多古镇照片，真正留下触感的，却是那件并不十分规整的手作。",
    tension: "古镇很容易成为拍照背景，手艺也容易被压缩成几句介绍；要真正理解它，需要停下来听、看，还要亲手试一次。",
    action: "本地青年与老匠人共同设计半日路线，把老街导览、手作工坊和在地茶点串成一次可以参与的文化体验。",
    experience: "双人预约适合朋友或伴侣用半天慢慢走完；从听讲解到动手，再坐下来尝茶点，节奏完整而不赶。",
    benefit: "游客不只带走照片，也能通过材料、动作和一件亲手完成的作品，理解手艺怎样进入今天的生活。",
    fit: "适合喜欢慢游、文化体验、手作和双人周末安排的人。",
    boundary: "追求大型娱乐项目、密集景点或纯购物行程的人，可能不适合这条半日体验路线。",
    strength: "本地青年与老匠人共创、工坊体验、老街导览和在地茶点，形成了青石巷文旅区别于普通打卡路线的内容能力。",
    visual: "青石路、匠人手部、材料纹理、游客第一次动手与茶点旁完成的作品",
    englishPlace: "Jingdezhen, Jiangxi",
    englishProduct: "a half-day heritage experience combining a guided old-street walk, a hands-on workshop, and local tea snacks",
    englishBenefit: "a slower way to understand local craft by taking part rather than simply taking photos",
  };
  if (enterprise.id === "navel-orange") return {
    opening: "赣州冬日的阳光落在果皮上，返乡青年从树下摘下一颗橙，先看大小，再看成熟的颜色。",
    alternateOpening: "纸箱打开时，清亮的橙香先出来了；五斤的份量，刚好能在一家人的餐桌上慢慢吃完。",
    tension: "好果子不只要种出来，还要面对分级、损耗、包装和运输；如果只追求速度，成熟度与到货体验就很难稳定。",
    action: "返乡青年联合乡邻果农建立直销渠道，按约180—230克人工分拣，坚持赣南产地直采、现摘现发。",
    experience: "5斤家庭装不会显得过量，适合冬季家庭水果、办公室分享或探望亲友；到货后按实际成熟度安排食用与储存。",
    benefit: "让消费者知道橙子从哪里来、怎样被挑选，也让认真种植的果农拥有更直接的销售路径。",
    fit: "适合重视产地、当季新鲜度和家庭份量的人。",
    boundary: "农产品存在外观、大小和酸甜度的自然差异，具体到货状态、储存和售后应按实际情况说明。",
    strength: "赣南产地、人工分拣、明确单果规格、现摘现发与5斤家庭装，共同构成橙意果园透明、易理解的购买理由。",
    visual: "冬日果园、人工称重分拣、装箱动作、剥开橙皮时的汁水与家庭分享",
    englishPlace: "Ganzhou, Jiangxi",
    englishProduct: "freshly picked Gannan navel oranges, hand-sorted at roughly 180–230 grams each in a five-jin family box",
    englishBenefit: "a transparent, right-sized way for households to enjoy seasonal fruit directly from the growing region",
  };
  return {
    opening: `${enterprise.location}的一天，从一个与${enterprise.industry}有关的普通动作开始。`,
    alternateOpening: `人们第一次认识${enterprise.name}，往往不是因为一句口号，而是因为一个能被看见的细节。`,
    tension: `消费者需要的不只是更多选择，而是知道产品为什么适合自己的场景，以及哪些事实值得信任。`,
    action: product,
    experience: `把产品放进真实使用过程，记录选择、操作、感受与限制。`,
    benefit: enterprise.tagline,
    fit: `适合与${enterprise.industry}需求和使用场景相符的人。`,
    boundary: "具体体验因使用条件和个人偏好而异，应以企业提供的真实资料为准。",
    strength: `${enterprise.name}需要以可核验的产品、流程、团队或服务事实建立专业认知。`,
    visual: "真实环境、制作或服务过程、产品细节与实际使用动作",
    englishPlace: enterprise.location,
    englishProduct: "a product shaped by real materials, process, and everyday use",
    englishBenefit: "a clearer choice grounded in specific facts rather than broad claims",
  };
}

function toneLine(tone: string, kind: "lead" | "close") {
  const lines: Record<string, [string, string]> = {
    闺蜜安利: ["先不急着下结论，我把真实的选择和使用过程讲给你听。", "如果你的情况也差不多，可以从这些细节判断它合不合适。"],
    专业品鉴: ["先看判断条件，再谈结论：产地、过程、规格和使用场景缺一不可。", "选择不必听口号，回到参数、过程和自己的实际需要就够了。"],
    年轻活力: ["别只看第一眼，真正有意思的都藏在过程里。", "你更想先看哪个细节？评论区选一个，我们继续拆。"],
    温暖叙事: ["有些好东西不急着说服人，它先在日常里留下一个安静的瞬间。", "愿这份来自具体地方、具体双手的认真，也能抵达你的日常。"],
  };
  return (lines[tone] ?? [`用“${tone}”的方式，从真实细节开始。`, "答案留给真实的使用和选择。"])[kind === "lead" ? 0 : 1];
}

function modeCopies(mode: TranslationMode, tone: string, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief) {
  const lead = toneLine(tone, "lead");
  const close = toneLine(tone, "close");
  if (mode === "seed") return {
    A: {
      title: `把${enterprise.name}放进真实日常后，我更在意这几件事`,
      body: `${lead}\n\n最初的需要很具体：${brief.audience}想在合适的场景里找到一个不费力、也不含糊的选择。${brief.coreMessage}\n\n于是我先看过程，再看产品。${profile.action}\n\n真正使用时，最有参考价值的是：${profile.experience}\n\n${profile.fit}\n\n也把边界说在前面：${profile.boundary}\n\n${close}`,
    },
    B: {
      title: `不是“闭眼入”，而是先看它适不适合你`,
      body: `${profile.alternateOpening}\n\n选择之前，我会先问三个问题：来源是否清楚，使用是否顺手，规格是否适合自己的生活。${enterprise.name}给出的答案是：${profile.action}\n\n它最打动人的并非一句夸奖，而是一个明确场景——${profile.experience}\n\n${brief.coreMessage}\n\n${profile.fit} ${profile.boundary}\n\n${close}`,
    },
  };
  if (mode === "brand") return {
    A: {
      title: `${enterprise.name}想占据的，不是热闹，而是一个清楚的选择理由`,
      body: `${enterprise.name}属于${enterprise.industry}。它希望被记住的核心，不是一串宽泛形容词，而是具体、稳定、可核验。\n\n${profile.strength}\n\n${brief.coreMessage}\n\n这些专业能力最终要回到消费者：${profile.benefit}\n\n品牌心智不是喊出来的。每一次产品、服务和内容，都需要重复兑现同一件事。${close}`,
    },
    B: {
      title: `同类选择很多，为什么记住${enterprise.name}`,
      body: `${lead}\n\n品牌的差异要经得起追问：从哪里来，谁在做，用什么标准，最后为消费者解决什么。\n\n${profile.action}\n\n${profile.strength}\n\n${brief.coreMessage}\n\n因此，${enterprise.name}给出的购买理由很明确：${profile.benefit}\n\n没有完整来源的“第一”和“领先”不写；能长期被验证的事实，才是品牌真正的背书。`,
    },
  };
  return {
    A: {
      title: brief.hook,
      body: `${profile.opening}\n\n${profile.tension}\n\n事情的转折不在一句广告里，而在一个具体选择中：${profile.action}\n\n于是，产品的意义才慢慢落到生活里。${profile.experience}\n\n${brief.coreMessage}\n\n${profile.benefit}\n\n${close}`,
    },
    B: {
      title: `故事从一个没有被省略的细节开始`,
      body: `${profile.alternateOpening}\n\n起初，人只是想解决一个普通问题。比较、犹豫，再回到真正重要的标准，过程并不戏剧化，却足够真实。\n\n${profile.tension}\n\n最后留下来的，是这项选择：${profile.action}\n\n${profile.benefit}\n\n回到最初的画面，日常没有突然改变，只是多了一个更清楚、更安心的选择。${close}`,
    },
  };
}

function shortModeStatement(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile) {
  if (mode === "seed") return `${profile.experience} ${profile.fit}`;
  if (mode === "brand") return `${profile.strength} ${profile.benefit}`;
  return `${profile.tension} ${profile.action}`;
}

function makeVersion(title: string, body: string, hashtags: string[], storyboard?: ContentVersion["storyboard"]): ContentVersion {
  return { title, body, hashtags, ...(storyboard ? { storyboard } : {}) };
}

function chinesePlatforms(mode: TranslationMode, tone: string, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief): Record<Platform, CopyPair> {
  const base = modeCopies(mode, tone, enterprise, profile, brief);
  const tag = enterprise.industry.replaceAll(" ", "");
  const modeTag = mode === "story" ? "品牌故事" : mode === "seed" ? "真实体验" : "品牌观察";
  const statement = shortModeStatement(mode, enterprise, profile);
  const toneLead = toneLine(tone, "lead");
  const toneClose = toneLine(tone, "close");
  const dyA = mode === "story"
    ? [
        { timeRange: "0–3s", shot: `特写｜${profile.visual.split("、")[0]}`, voiceover: brief.hook, bgm: "环境声先入，第二秒加入轻节拍" },
        { timeRange: "3–10s", shot: `中景｜${profile.visual}`, voiceover: profile.tension, bgm: "节奏随动作逐步抬升" },
        { timeRange: "10–18s", shot: "近景｜关键动作与产品事实同框，字幕只标真实参数", voiceover: profile.action, bgm: "高潮处收紧，保留现场声" },
        { timeRange: "18–24s", shot: "使用场景收尾，品牌最后出现", voiceover: `${profile.benefit} ${toneLine(tone, "close")}`, bgm: "放慢并留一秒余韵" },
      ]
    : mode === "seed"
      ? [
          { timeRange: "0–3s", shot: "先展示真实麻烦或选择场景，不急着露品牌", voiceover: "先别急着推荐，看看它放进真实生活里怎么样。", bgm: "轻快、干净的开场节拍" },
          { timeRange: "3–10s", shot: `完整展示一次使用过程：${profile.visual}`, voiceover: profile.experience, bgm: "镜头跟随操作节奏" },
          { timeRange: "10–17s", shot: "参数与体验细节一一对应，字幕标注适用条件", voiceover: profile.fit, bgm: "保持自然现场声" },
          { timeRange: "17–22s", shot: "回到使用者，画面给出边界提示", voiceover: profile.boundary, bgm: "提问前短暂停顿" },
        ]
      : [
          { timeRange: "0–3s", shot: `品牌名与${enterprise.industry}核心场景同时出现`, voiceover: `同类选择很多，为什么记住${enterprise.name}？`, bgm: "克制、有识别度的节拍" },
          { timeRange: "3–11s", shot: `过程镜头｜${profile.visual}`, voiceover: profile.strength, bgm: "随证据出现稳步推进" },
          { timeRange: "11–18s", shot: "产品与消费者场景交替，字幕呈现可核验事实", voiceover: profile.benefit, bgm: "减少音乐，突出旁白" },
          { timeRange: "18–22s", shot: "固定品牌视觉与核心记忆句", voiceover: enterprise.tagline, bgm: "简洁收束" },
        ];
  const dyB = [...dyA].reverse().map((shot, index) => ({ ...shot, timeRange: index === 0 ? "0–3s" : index === dyA.length - 1 ? "16–22s" : `${3 + (index - 1) * 6}–${9 + (index - 1) * 6}s` }));

  return {
    xiaohongshu: {
      A: makeVersion(base.A.title, base.A.body, [`#${tag}`, `#${modeTag}`, "#真实分享", "#生活灵感"]),
      B: makeVersion(base.B.title, base.B.body, [`#${enterprise.name}`, "#选购思路", "#适合自己的才重要"]),
    },
    weibo: {
      A: makeVersion(`${enterprise.name}｜一个值得说清的细节`, `${toneLead}\n\n${brief.hook}\n\n${statement}\n\n与其先下结论，不如先看这些能被验证的事实。你选择同类产品时，最在意哪一点？`, [`#${enterprise.name}#`, `#${tag}#`, `#${modeTag}#`]),
      B: makeVersion(`关于${enterprise.industry}，品牌应该回答什么`, `来源、过程、适用场景和边界，缺一项都很难建立信任。\n\n${profile.action}\n\n${profile.boundary}\n\n${toneClose}`, [`#品牌观察#`, `#消费选择#`, `#${enterprise.name}#`]),
    },
    douyin: {
      A: makeVersion(base.A.title, `${toneLead}\n不靠口号，用一组真实镜头讲清${enterprise.name}为什么值得被看见。`, [`#${tag}`, `#${modeTag}`, "#真实记录"], dyA),
      B: makeVersion(base.B.title, `换一个切口：先给结果，再回到过程和证据，最后说明适合谁。\n${toneClose}`, [`#${enterprise.name}`, "#幕后过程", "#选择有依据"], dyB),
    },
    reddit: {
      A: makeVersion(`我们在经营${enterprise.name}，想听听大家会怎样判断这类产品`, `先说明身份：我们是${enterprise.name}团队，来自${enterprise.location}。${toneLead}\n\n${profile.action}\n\n我们认为它的价值在于：${profile.benefit}\n\n也有需要说清的边界：${profile.boundary}\n\n如果你第一次接触这类品牌，最希望先看到哪一种证据？`, ["r/smallbusiness", "讨论", "透明经营"]),
      B: makeVersion(`一个小品牌怎样把专业说清楚，而不是只说“用心”？`, `${profile.strength}\n\n我们正在尝试把过程、标准与限制都公开，而不是只展示最好看的结果。${profile.fit}\n\n${toneClose}`, ["r/Entrepreneur", "问题", "品牌建设"]),
    },
    discord: {
      A: makeVersion(`📌 ${enterprise.name}社群共创：下一期想看什么？`, `${toneLead}\n\n先给大家一个真实进度：${profile.action}\n\n我们准备继续公开${profile.visual}。\n\n请回复 1「过程幕后」、2「真实使用」、3「标准与证据」。票数最高的内容会在下一次更新。`, ["#community", "#poll", "#behind-the-scenes"]),
      B: makeVersion(`👀 社群抢先看｜${enterprise.name}`, `${profile.alternateOpening}\n\n本次抢先信息：${profile.experience}\n\n有疑问直接留在线程里。我们会整理成FAQ，并把目前不能确认的内容明确标出来。${toneClose}`, ["#first-look", "#feedback", "#ask-us"]),
    },
    instagram: {
      A: makeVersion(base.A.title, `${toneLead}\n\n${profile.opening}\n\n这组画面记录的是${profile.visual}。镜头之外，还有一个选择：${profile.action}\n\n${profile.benefit}\n\n保存这组内容，下一次我们继续讲过程里的另一个细节。`, [`#${tag}`, "#VisualStory", "#MadeWithCare", "#BehindTheScenes"]),
      B: makeVersion(`从${enterprise.location}到日常`, `${profile.alternateOpening}\n\n不是所有价值都能在第一张图里看见。向后滑，看看来源、过程、使用和边界怎样组成${enterprise.name}。\n\n${toneClose}`, [`#${enterprise.name}`, "#BrandStory", "#DiscoverLocal"]),
    },
    tiktok: {
      A: makeVersion(base.A.title, `${toneLead}\nHook：先用画面提出问题。\nProof：展示真实过程与事实。\nClose：给出适配结论，不强迫购买。`, [`#${tag}`, `#${modeTag}`, "#BehindTheScenes"], dyA.map((shot) => ({ ...shot, timeRange: shot.timeRange.replace("秒", "s") }))),
      B: makeVersion(`22秒看懂${enterprise.name}的一个真实差异`, `从结果倒推过程：为什么这样做、什么事实能证明、它适合谁。\n${toneClose}`, [`#${enterprise.name}`, "#SmallBusinessTok", "#KnowWhatYouBuy"], dyB.map((shot) => ({ ...shot, timeRange: shot.timeRange.replace("秒", "s") }))),
    },
  };
}

function englishPlatforms(mode: TranslationMode, tone: string, enterprise: Enterprise, profile: BrandProfile): Pick<Record<Platform, CopyPair>, "reddit" | "discord" | "instagram" | "tiktok"> {
  const modeFocus = mode === "story"
    ? `The story is not a legend. It is a real choice made in the process: ${profile.englishProduct}.`
    : mode === "seed"
      ? `In everyday use, the useful question is whether it fits your routine. It offers ${profile.englishBenefit}.`
      : `The brand position is specific: ${profile.englishProduct}, supported by a process people can inspect.`;
  const toneNote = tone === "专业品鉴" ? "We prefer conditions and evidence to sweeping claims." : tone === "年轻活力" ? "Quick look, real process, clear takeaway." : tone === "闺蜜安利" ? "Here is the honest version I would share with a friend." : "Some details speak quietly, but stay with you.";
  return {
    reddit: {
      A: makeVersion(`We are building ${enterprise.name} in ${profile.englishPlace} — what would you verify first?`, `Disclosure: this is the ${enterprise.name} team. ${toneNote}\n\n${modeFocus}\n\nThe practical value is ${profile.englishBenefit}. We do not want to hide the limits or turn a brand claim into a fact.\n\nWhat evidence would you want before considering a product or experience like this?`, ["r/smallbusiness", "Discussion", "Transparent business"]),
      B: makeVersion("How can a small brand show expertise without sounding like an ad?", `Our answer is to show the place, process, conditions, and limits behind the offer. ${modeFocus}\n\nWhat makes you trust an unfamiliar independent brand: a standard, a demonstration, customer context, or something else?`, ["r/Entrepreneur", "Question", "Brand building"]),
    },
    discord: {
      A: makeVersion(`📌 ${enterprise.name} community vote`, `${toneNote}\n\nWe are preparing a closer look at ${profile.englishProduct}.\n\nReply 1 for the process, 2 for real-life use, or 3 for evidence and standards. We will build the next update around the top choice.`, ["#community", "#poll", "#behind-the-scenes"]),
      B: makeVersion(`👀 First look: ${enterprise.name}`, `${modeFocus}\n\nAsk us anything in the thread. We will turn the questions into a public FAQ and clearly mark what still needs verification.`, ["#first-look", "#feedback", "#ask-us"]),
    },
    instagram: {
      A: makeVersion(`A closer look at ${enterprise.name}`, `${toneNote}\n\nThis visual story begins in ${profile.englishPlace}. ${modeFocus}\n\nThe detail that matters in daily life: ${profile.englishBenefit}.\n\nSave this post for the next chapter in the process.`, ["#BrandStory", "#MadeWithCare", "#BehindTheScenes", "#SmallBusiness"]),
      B: makeVersion("From place and process to everyday use", `There is more behind the first frame. Swipe through the source, the hands, the process, and the real-life context behind ${enterprise.name}.\n\nWhich detail would you like us to explain next?`, ["#VisualStory", "#DiscoverLocal", "#IndependentBrand"]),
    },
    tiktok: {
      A: makeVersion(`The detail behind ${enterprise.name}`, `Hook: one visual question.\nProof: the process in action.\nClose: who it fits and why.`, ["#SmallBusinessTok", "#BehindTheScenes", "#KnowWhatYouBuy"], [
        { timeRange: "0–2s", shot: `Open on a tactile detail from ${profile.englishPlace}`, voiceover: "Before the brand name, look at this detail.", bgm: "Natural sound, then a clean beat" },
        { timeRange: "2–9s", shot: "Show the hands, setting, and process without decorative filler", voiceover: modeFocus, bgm: "Cuts follow the real action" },
        { timeRange: "9–16s", shot: "Move into a clear everyday-use context", voiceover: profile.englishBenefit, bgm: "Lower the music under the key fact" },
        { timeRange: "16–20s", shot: "Brand lockup and a specific comment prompt", voiceover: "What would you want us to verify next?", bgm: "Brief pause before the question" },
      ]),
      B: makeVersion(`Why ${enterprise.name} makes this choice`, `Start with the result, rewind to the process, and finish with the limits — not a sales slogan.`, ["#MeetTheMaker", "#BrandProcess", "#ShopSmall"], [
        { timeRange: "0–2s", shot: "Show the finished moment first", voiceover: "The result makes more sense when you see what came before it.", bgm: "Fast opening, immediate pause" },
        { timeRange: "2–10s", shot: "Rewind through place, material, and process", voiceover: `This begins in ${profile.englishPlace}.`, bgm: "Reverse transition into organic rhythm" },
        { timeRange: "10–18s", shot: "Pair one claim with one visible proof", voiceover: modeFocus, bgm: "Steady build" },
        { timeRange: "18–22s", shot: "End on the real-life fit, not a hard sell", voiceover: profile.englishBenefit, bgm: "Warm, clean finish" },
      ]),
    },
  };
}

export function buildFallback(request: GenerateRequest, enterprise: Enterprise): GenerateResult {
  const goal = request.goal.trim() || "把品牌的真实价值分享给更多人";
  const product = request.selectedMaterials.find((item) => item.type === "product")?.content ?? request.selectedMaterials[0]?.content ?? enterprise.tagline;
  const mode = request.translationMode ?? request.creativeBrief?.mode ?? "story";
  const brief = request.creativeBrief ?? buildCreativeBrief({ contractVersion: 1, enterpriseId: request.enterpriseId, selectedMaterials: request.selectedMaterials, goal, tone: request.tone, mode }, enterprise);
  const profile = profileFor(enterprise, product);
  const chinese = chinesePlatforms(mode, request.tone, enterprise, profile, brief);
  const foreignUsesChinese = /中文|汉语/.test(goal) || (!/英文|英语|\benglish\b/i.test(goal) && /[\u3400-\u9fff]/.test(goal));
  const english = foreignUsesChinese ? null : englishPlatforms(mode, request.tone, enterprise, profile);
  const platforms = Object.fromEntries(request.platforms.map((platform) => {
    if (english && (platform === "reddit" || platform === "discord" || platform === "instagram" || platform === "tiktok")) return [platform, english[platform]];
    return [platform, chinese[platform]];
  })) as Partial<Record<Platform, PlatformVersions>>;
  return { contractVersion: 1, enterpriseId: enterprise.id, source: "fallback", platforms };
}
