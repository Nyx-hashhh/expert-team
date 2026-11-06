import type { ContentVersion, CreativeBrief, Enterprise, GenerateRequest, GenerateResult, Platform, PlatformVersions, TranslationMode } from "@/contracts/content";
import { buildCreativeBrief } from "@/data/translation";
import { buildXiaohongshuVersions } from "@/data/xiaohongshu-styles";

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
  detailWalkthrough: string;
  selectionAdvice: string;
  englishPlace: string;
  englishProduct: string;
  englishBenefit: string;
}

interface CopyPair {
  A: ContentVersion;
  B: ContentVersion;
}

interface DraftPair {
  A: Pick<ContentVersion, "title" | "body">;
  B: Pick<ContentVersion, "title" | "body">;
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
    detailWalkthrough: "一只小罐里其实藏着几道时间：芽叶生长在海拔800米的茶园，采摘赶在清明前，只取一芽一叶；鲜叶分成小批次处理，再经过低温慢焙。最后装进50克独立罐，春茶才从山里的短暂时令，变成可以放进工位抽屉或随手带去见朋友的一份轻巧心意。",
    selectionAdvice: "挑这类春茶时，可以先确认采摘时间、芽叶规格和制作方式，再看包装是否符合自己的饮用频率。办公室用普通杯具即可，但投茶量、水温和浸泡时间仍会影响入口感受；偏爱浓重焙火或需要长期大量饮用的人，应先确认风味与份量。",
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
    detailWalkthrough: "这条路线的价值不在景点数量，而在顺序：先由老街导览建立背景，再进入工坊接触材料与动作，最后以在地茶点留出交流和休息。周末半日的长度控制了体力和时间门槛，双人票则更贴近朋友或伴侣共同体验的场景。",
    selectionAdvice: "预约前应确认具体体验项目、零基础是否可参加、作品能否带走、制作与等待时间，以及茶点和导览的实际安排。喜欢慢游和动手的人更容易获得完整体验；如果期待大型娱乐项目、密集景点或纯购物，需要先判断路线是否符合预期。",
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
    detailWalkthrough: "赣南产地解决来源问题，约180—230克的单果规格帮助消费者预估大小，人工分拣负责筛选与装箱，现摘现发强调当季链路；5斤家庭装则把份量落到普通家庭可以在合理时间内吃完的范围。",
    selectionAdvice: "收到后可以先检查果皮、软硬和运输状态，再按成熟度安排食用与通风储存。农产品的外观、大小和酸甜度存在自然差异，购买前还应了解发货时效、坏果售后与储存建议，而不是只看一句“甜”。",
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
    detailWalkthrough: `产品资料目前能够确认的是：${product}。成稿应继续把材料、规格、步骤、使用条件和消费者利益一一对应，避免只换一组形容词。`,
    selectionAdvice: "选择建议应根据真实品类补充使用方法、适合人群、场景限制、维护或储存要求；证据不足的功效、排名和评价暂不写入。",
    englishPlace: enterprise.location,
    englishProduct: "a product shaped by real materials, process, and everyday use",
    englishBenefit: "a clearer choice grounded in specific facts rather than broad claims",
  };
}

interface ToneVoice {
  lead: string;
  proofBridge: string;
  boundaryBridge: string;
  close: string;
  videoHook: string;
  communityAction: string;
}

function voiceFor(tone: string): ToneVoice {
  if (tone === "专业品鉴") return {
    lead: "先建立评价条件，再谈结论。",
    proofBridge: "把主观印象拆开看，真正有效的是参数、过程与使用条件之间能否互相印证。",
    boundaryBridge: "结论需要附带适用条件。",
    close: "回到可验证的事实和自己的实际需要，判断会比口号可靠。",
    videoHook: "先定标准：这类产品到底应该看什么？",
    communityAction: "请按“最想核验的指标”投票，我们会在下一期逐项公开依据。",
  };
  if (tone === "年轻活力") return {
    lead: "时间不等人，先把关键场景拉到眼前。",
    proofBridge: "别停在第一眼。动作继续，过程继续，真正的差异要在关键一刻接得住。",
    boundaryBridge: "好用不等于万能，边界也得说快、说清。",
    close: "下一回合想拆哪个细节？选一个，我们直接上现场。",
    videoHook: "先别划走——这个细节马上要经受一次真实考验。",
    communityAction: "回复1看过程、2看实测、3看证据，票高的下一条直接拍。",
  };
  if (tone === "温暖叙事") return {
    lead: "有些选择不急着发出声音，它先在日常里留下一个安静的画面。",
    proofBridge: "人记住的往往不是一句卖点，而是双手怎样做、时间怎样经过，最后有什么被认真留下。",
    boundaryBridge: "温柔并不意味着回避真实。",
    close: "愿这份来自具体地方、具体双手的认真，也能在你的日常里找到位置。",
    videoHook: "镜头先别给品牌，先听一听这个地方原本的声音。",
    communityAction: "如果你愿意，告诉我们最想继续听哪一段，我们慢慢把它讲完。",
  };
  return {
    lead: "先别听我下结论，我把怎么选、怎么用、哪里合适都摊开说。",
    proofBridge: "像给朋友挑东西一样，我更在意它进了真实生活以后顺不顺手。",
    boundaryBridge: "喜欢归喜欢，不合适的情况也得提前告诉你。",
    close: "如果你的情况和我说的差不多，再从这些细节判断要不要继续了解。",
    videoHook: "姐妹先别冲，跟我把真实过程走一遍。",
    communityAction: "你把最纠结的地方丢进评论，我按大家的问题继续补体验。",
  };
}

function friendlyCopies(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief): DraftPair {
  if (mode === "seed") return {
    A: { title: `先别急着被种草，我把${enterprise.name}怎么用讲清楚`, body: `你可能也遇到过：想找一个适合${brief.audience}的选择，介绍看了不少，真正放进生活却不知道顺不顺手。\n\n我会先看来源和过程。${profile.action}\n\n再看它进了日常以后怎样。${profile.experience}\n\n对我来说，有参考价值的不是“好用”两个字，而是这些具体条件：${profile.fit}\n\n也替你把容易忽略的地方问了：${profile.boundary}\n\n情况接近的话，可以从这些细节继续判断，不用被一句“闭眼入”推着走。` },
    B: { title: `像给家里人挑东西一样，我会先问这几个问题`, body: `先把一个很容易代入的场景讲给你：${profile.alternateOpening}\n\n如果是给自己或家里人选，我会问：来自哪里？怎么做？使用起来麻不麻烦？${enterprise.name}目前能说清的是：${profile.action}\n\n${profile.experience}\n\n所以它更适合${profile.fit.replace(/^适合/, "")}\n\n但这句也要放在推荐前面：${profile.boundary}\n\n把需求对上，比跟着热闹下单踏实。` },
  };
  if (mode === "brand") return {
    A: { title: `朋友问我为什么记住${enterprise.name}，答案不是一句“用心”`, body: `同类品牌那么多，能让我记住的，通常是它有没有把一件事反复做好。\n\n${profile.strength}\n\n翻成我们买东西时真正关心的话，就是：${profile.benefit}\n\n不急着喊第一，也不拿一墙荣誉压人。能把来源、过程和边界讲清楚，才是一个品牌值得继续认识的开始。` },
    B: { title: `不聊大词，聊聊${enterprise.name}到底凭什么被选择`, body: `如果把品牌介绍里的形容词都删掉，还剩下什么？\n\n${profile.action}\n\n这些事构成了${enterprise.name}在${enterprise.industry}里的真实位置：${profile.strength}\n\n对消费者而言，它不是遥远的品牌宣言，而是${profile.benefit}\n\n这就是我愿意把它介绍给朋友的理由——具体，而且能被继续验证。` },
  };
  return {
    A: { title: `我想把${enterprise.name}背后的这件小事讲给你听`, body: `你先跟我到故事开始的地方看看。${profile.opening}\n\n一开始，没有谁想着讲一个多么传奇的故事。大家只是遇到了一个很现实的问题：${profile.tension}\n\n犹豫过，也比较过。最后决定没有被省略——${profile.action}\n\n真正让人放下心来的，是它后来进入日常的样子：${profile.experience}\n\n${profile.benefit}\n\n如果你也在意这些细节，这个故事或许正好能替你多问一步。` },
    B: { title: `不是广告里的高光，是一个普通人会在意的瞬间`, body: `先说一个我很想分享的画面：${profile.alternateOpening}\n\n人真正做选择时，很少只看漂亮的一面。会担心，会反复确认，也会问一句：这件东西到底和我的生活有什么关系？\n\n答案藏在过程里。${profile.action}\n\n也落在结果里。${profile.benefit}\n\n${profile.boundary}\n\n故事讲到这里，不催你下结论。把它留作一次认真选择的参考就好。` },
  };
}

function professionalCopies(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief): DraftPair {
  if (mode === "seed") return {
    A: { title: `${enterprise.name}体验分析：先看条件，再谈是否值得选择`, body: `评价对象：${enterprise.industry}。目标人群：${brief.audience}。\n\n第一项看产品与过程。${profile.action}\n\n第二项看场景适配。${profile.experience}\n\n第三项看消费者收益。${profile.benefit}\n\n基于现有信息，${profile.fit}\n\n结论需要附带限制：${profile.boundary}\n\n这不是适用于所有人的推荐，而是一份有条件的判断。` },
    B: { title: `把体验拆成四个判断维度，${enterprise.name}表现在哪里`, body: `一、来源与过程：${profile.action}\n\n二、实际使用：${profile.experience}\n\n三、核心利益：${profile.benefit}\n\n四、适配边界：${profile.boundary}\n\n如果你的优先级与${profile.fit.replace(/^适合/, "")}相符，它具有继续了解的价值；反之，应先比较规格、口味或使用条件。` },
  };
  if (mode === "brand") return {
    A: { title: `${enterprise.name}的品牌资产，应该如何被验证`, body: `品牌认知需要三个层次：品类定锚、专业能力、消费者利益。\n\n品类：${enterprise.industry}。\n\n专业底座：${profile.strength}\n\n产品与行动：${profile.action}\n\n消费者利益：${profile.benefit}\n\n现阶段可使用以上事实建立认知；没有完整统计口径的销量、好评与排名，不应作为权威结论。` },
    B: { title: `同类品牌比较时，${enterprise.name}提供了哪些有效信息`, body: `判断品牌是否值得优先选择，不宜从口号开始。\n\n先看其差异是否可说明：${profile.action}\n\n再看能力是否持续：${profile.strength}\n\n最后看这些能力是否转化为真实利益：${profile.benefit}\n\n因此，${enterprise.name}更适合以“可追溯过程与明确场景”建立长期心智，而不是争夺无法核验的泛化标签。` },
  };
  return {
    A: { title: `从一个具体事件看${enterprise.name}的产品逻辑`, body: `观察起点：${profile.opening}\n\n事件的前提是：${profile.tension}\n\n关键选择发生在过程而非宣传阶段。${profile.action}\n\n这项选择随后在实际场景中得到验证：${profile.experience}\n\n由此可以得出条件化结论——${profile.benefit}\n\n${profile.boundary}\n\n故事提供情境，事实负责证明；二者不能互相替代。` },
    B: { title: `一次选择、一个验证：拆解${enterprise.name}的故事证据`, body: `观察记录从这个结果开始：${profile.alternateOpening}\n\n如果按叙事因果拆分，起点是现实需求，阻力是${profile.tension}\n\n高潮不是情绪放大，而是这项决定：${profile.action}\n\n结果则落在${profile.experience}\n\n${profile.benefit}\n\n所有判断均应限定在现有素材与使用条件内。` },
  };
}

function youthfulCopies(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile): DraftPair {
  if (mode === "seed") return {
    A: { title: `先别冲！${enterprise.name}放进真实场景后是这种画风`, body: `需求出现。开始比较。然后问题来了：好看是一回事，真正用起来顺不顺又是另一回事。\n\n先看它怎么做——${profile.action}\n\n再把它扔进日常——${profile.experience}\n\n关键结果：${profile.benefit}\n\n适配名单：${profile.fit}\n\n边界也不藏：${profile.boundary}\n\n信息给齐。要不要继续了解，你来拍板。` },
    B: { title: `${enterprise.name}体验闯关：第一关就看真实细节`, body: `体验闯关现在开始。先上场景：${profile.alternateOpening}\n\n第一关，来源和过程能不能讲明白？${profile.action}\n\n第二关，到了真实场景会不会掉链子？${profile.experience}\n\n第三关，究竟适合谁？${profile.fit}\n\n最后一关最重要：${profile.boundary}\n\n不喊“闭眼入”。眼睛睁开，反而更容易选对。` },
  };
  if (mode === "brand") return {
    A: { title: `品牌很多，${enterprise.name}凭什么挤进你的记忆区`, body: `先报赛道：${enterprise.industry}。\n\n再亮核心能力：${profile.strength}\n\n不绕弯，直接看行动：${profile.action}\n\n这些最后换来什么？${profile.benefit}\n\n心智位置不是抢麦抢来的。每次都把同一件事做好，名字自然会被记住。` },
    B: { title: `删掉“领先”和“匠心”，${enterprise.name}还剩什么`, body: `这题很直接。\n\n剩下产地、过程、规格、团队和真实场景。${profile.action}\n\n剩下能持续重复的能力。${profile.strength}\n\n也剩下消费者能拿到的明确价值：${profile.benefit}\n\n这才是品牌的有效记忆点。短，清楚，能验证。` },
  };
  return {
    A: { title: `开场就出状况，但${enterprise.name}的故事这才刚开始`, body: `镜头推近。${profile.opening}\n\n下一秒，现实问题上线：${profile.tension}\n\n没有神转折。有人动手，有人判断，然后做了这个选择——${profile.action}\n\n关键时刻到了。${profile.experience}\n\n结果不是一句“太好了”，而是${profile.benefit}\n\n故事收住。细节留下。你记住的是哪一幕？` },
    B: { title: `把结果倒放一次，看看一个好选择怎么长出来`, body: `结果先上屏：${profile.alternateOpening}\n\n暂停。倒回去。\n\n最初只是一个普通需求，随后碰上${profile.tension}\n\n再往前，是没有被跳过的动作：${profile.action}\n\n于是结果成立——${profile.benefit}\n\n没有传奇滤镜。真实过程本身，就够有力量。` },
  };
}

function warmCopies(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief): DraftPair {
  if (mode === "seed") return {
    A: { title: `一件东西适不适合日常，要让时间和动作慢慢回答`, body: `${profile.alternateOpening}\n\n最初的需要并不复杂。${brief.audience}只是想找到一个不打扰生活、又能把事情做好一点的选择。\n\n于是先看它从哪里来，怎样被做出来。${profile.action}\n\n再看它进入日常后的样子。${profile.experience}\n\n${profile.fit}\n\n也不回避这份真实：${profile.boundary}\n\n好的分享不替人决定，只把一路感受到的细节轻轻放在桌面上。` },
    B: { title: `用过以后，真正留下来的不是惊叹，而是一点从容`, body: `${profile.opening}\n\n选择之前，人总会犹豫。怕不合适，也怕买来的东西很快被遗忘。\n\n${profile.action}\n\n当它真正被使用，价值才有了形状：${profile.experience}\n\n${profile.benefit}\n\n至于是否适合自己，还要记得${profile.boundary}\n\n慢一点判断，也是一种对生活的认真。` },
  };
  if (mode === "brand") return {
    A: { title: `${enterprise.name}想被记住的，是一件长期做下去的事`, body: `${profile.opening}\n\n品牌的名字出现以前，先有人在具体的地方，重复做着具体的事。${profile.action}\n\n时间把这些动作慢慢沉淀成能力：${profile.strength}\n\n它最终抵达消费者时，变成${profile.benefit}\n\n被记住不必靠更响亮的声音。一次次兑现同一个承诺，名字自然会有重量。` },
    B: { title: `从${enterprise.location}出发，一个品牌怎样住进人的记忆`, body: `${profile.alternateOpening}\n\n人们或许先遇见产品，后来才知道背后是谁、为何这样做。\n\n${profile.strength}\n\n专业并不冰冷。它落在每次选择、每道流程，也落在愿意说明边界的坦诚里。${profile.boundary}\n\n${profile.benefit}\n\n这便是${enterprise.name}希望留下的品牌印象。` },
  };
  return {
    A: { title: brief.hook, body: `${profile.opening}\n\n故事从这里展开。人物有自己的愿望，现实也有不肯让步的部分：${profile.tension}\n\n时间往前走，犹豫没有被略去。直到一个决定落下来——${profile.action}\n\n这是故事最紧的一刻，也是产品特征真正被看见的一刻。后来，${profile.experience}\n\n${profile.benefit}\n\n日常并没有因此变得宏大，只是多了一份可以被触摸、被记住的认真。` },
    B: { title: `那一天过去以后，一个细节仍留在日常里`, body: `${profile.alternateOpening}\n\n起初，人只是想解决一件普通的小事。寻找的过程有迟疑，也有不得不面对的困难。${profile.tension}\n\n最后，他们没有绕开那道难题。${profile.action}\n\n事情落定以后，改变很具体：${profile.benefit}\n\n镜头回到开头。光线、声音和人的动作仍旧平常，只是我们已经知道，这个细节为何值得留下。` },
  };
}

function modeCopies(mode: TranslationMode, tone: string, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief): DraftPair {
  if (tone === "专业品鉴") return professionalCopies(mode, enterprise, profile, brief);
  if (tone === "年轻活力") return youthfulCopies(mode, enterprise, profile);
  if (tone === "温暖叙事") return warmCopies(mode, enterprise, profile, brief);
  return friendlyCopies(mode, enterprise, profile, brief);
}

function shortModeStatement(mode: TranslationMode, enterprise: Enterprise, profile: BrandProfile) {
  if (mode === "seed") return `${profile.experience} ${profile.fit}`;
  if (mode === "brand") return `${profile.strength} ${profile.benefit}`;
  return `${profile.tension} ${profile.action}`;
}

function makeVersion(title: string, body: string, hashtags: string[], storyboard?: ContentVersion["storyboard"]): ContentVersion {
  return { title, body, hashtags, ...(storyboard ? { storyboard } : {}) };
}

function chinesePlatforms(mode: TranslationMode, tone: string, enterprise: Enterprise, profile: BrandProfile, brief: CreativeBrief, goal: string): Record<Platform, CopyPair> {
  const base = modeCopies(mode, tone, enterprise, profile, brief);
  const xiaohongshu = buildXiaohongshuVersions({
    brand: enterprise.name,
    industry: enterprise.industry,
    location: enterprise.location,
    goal,
    audience: brief.audience,
    hook: brief.hook,
    mode,
    tone,
    ...profile,
  });
  const tag = enterprise.industry.replaceAll(" ", "");
  const modeTag = mode === "story" ? "品牌故事" : mode === "seed" ? "真实体验" : "品牌观察";
  const statement = shortModeStatement(mode, enterprise, profile);
  const voice = voiceFor(tone);
  const dyA = mode === "story"
    ? [
        { timeRange: "0–3s", shot: `特写｜${profile.visual.split("、")[0]}`, voiceover: brief.hook, bgm: "环境声先入，第二秒加入轻节拍" },
        { timeRange: "3–10s", shot: `中景｜${profile.visual}`, voiceover: profile.tension, bgm: "节奏随动作逐步抬升" },
        { timeRange: "10–18s", shot: "近景｜关键动作与产品事实同框，字幕只标真实参数", voiceover: profile.action, bgm: "高潮处收紧，保留现场声" },
        { timeRange: "18–24s", shot: "使用场景收尾，品牌最后出现", voiceover: `${profile.benefit} ${voice.close}`, bgm: "放慢并留一秒余韵" },
      ]
    : mode === "seed"
      ? [
          { timeRange: "0–3s", shot: "先展示真实麻烦或选择场景，不急着露品牌", voiceover: voice.videoHook, bgm: "轻快、干净的开场节拍" },
          { timeRange: "3–10s", shot: `完整展示一次使用过程：${profile.visual}`, voiceover: profile.experience, bgm: "镜头跟随操作节奏" },
          { timeRange: "10–17s", shot: "参数与体验细节一一对应，字幕标注适用条件", voiceover: profile.fit, bgm: "保持自然现场声" },
          { timeRange: "17–22s", shot: "回到使用者，画面给出边界提示", voiceover: profile.boundary, bgm: "提问前短暂停顿" },
        ]
      : [
          { timeRange: "0–3s", shot: `品牌名与${enterprise.industry}核心场景同时出现`, voiceover: voice.videoHook, bgm: "克制、有识别度的节拍" },
          { timeRange: "3–11s", shot: `过程镜头｜${profile.visual}`, voiceover: profile.strength, bgm: "随证据出现稳步推进" },
          { timeRange: "11–18s", shot: "产品与消费者场景交替，字幕呈现可核验事实", voiceover: profile.benefit, bgm: "减少音乐，突出旁白" },
          { timeRange: "18–22s", shot: "固定品牌视觉与核心记忆句", voiceover: enterprise.tagline, bgm: "简洁收束" },
        ];
  const dyB = [...dyA].reverse().map((shot, index) => ({ ...shot, timeRange: index === 0 ? "0–3s" : index === dyA.length - 1 ? "16–22s" : `${3 + (index - 1) * 6}–${9 + (index - 1) * 6}s` }));

  return {
    xiaohongshu,
    weibo: {
      A: makeVersion(`${enterprise.name}｜一个值得说清的细节`, `${voice.lead}\n\n${brief.hook}\n\n${statement}\n\n${voice.proofBridge}\n\n${voice.close}`, [`#${enterprise.name}#`, `#${tag}#`, `#${modeTag}#`]),
      B: makeVersion(`关于${enterprise.industry}，品牌应该回答什么`, `${voice.boundaryBridge}\n\n${profile.action}\n\n${profile.boundary}\n\n${voice.close}`, [`#品牌观察#`, `#消费选择#`, `#${enterprise.name}#`]),
    },
    douyin: {
      A: makeVersion(base.A.title, `${voice.lead}\n${voice.proofBridge}`, [`#${tag}`, `#${modeTag}`, "#真实记录"], dyA),
      B: makeVersion(base.B.title, `${voice.boundaryBridge}\n${voice.close}`, [`#${enterprise.name}`, "#幕后过程", "#选择有依据"], dyB),
    },
    reddit: {
      A: makeVersion(`我们在经营${enterprise.name}，想听听大家会怎样判断这类产品`, `先说明身份：我们是${enterprise.name}团队，来自${enterprise.location}。\n\n${voice.lead}\n\n${profile.action}\n\n${voice.proofBridge} ${profile.benefit}\n\n${voice.boundaryBridge} ${profile.boundary}\n\n如果你第一次接触这类品牌，最希望先看到哪一种证据？`, ["r/smallbusiness", "讨论", "透明经营"]),
      B: makeVersion(`一个小品牌怎样把专业说清楚，而不是只说“用心”？`, `${profile.strength}\n\n${voice.proofBridge}\n\n${profile.fit}\n\n${voice.close}`, ["r/Entrepreneur", "问题", "品牌建设"]),
    },
    discord: {
      A: makeVersion(`📌 ${enterprise.name}社群共创：下一期想看什么？`, `${voice.lead}\n\n先给大家一个真实进度：${profile.action}\n\n我们准备继续公开${profile.visual}。\n\n${voice.communityAction}`, ["#community", "#poll", "#behind-the-scenes"]),
      B: makeVersion(`👀 社群抢先看｜${enterprise.name}`, `${profile.alternateOpening}\n\n本次抢先信息：${profile.experience}\n\n${voice.boundaryBridge} 有疑问直接留在线程里，我们会把目前不能确认的内容明确标出。\n\n${voice.close}`, ["#first-look", "#feedback", "#ask-us"]),
    },
    instagram: {
      A: makeVersion(base.A.title, `${voice.lead}\n\n${profile.opening}\n\n这组画面记录的是${profile.visual}。${voice.proofBridge}\n\n${profile.action}\n\n${voice.close}`, [`#${tag}`, "#VisualStory", "#MadeWithCare", "#BehindTheScenes"]),
      B: makeVersion(`从${enterprise.location}到日常`, `${profile.alternateOpening}\n\n不是所有价值都能在第一张图里看见。向后滑，看看来源、过程、使用和边界怎样组成${enterprise.name}。\n\n${voice.close}`, [`#${enterprise.name}`, "#BrandStory", "#DiscoverLocal"]),
    },
    tiktok: {
      A: makeVersion(base.A.title, `${voice.videoHook}\n${voice.proofBridge}\n${voice.close}`, [`#${tag}`, `#${modeTag}`, "#BehindTheScenes"], dyA.map((shot) => ({ ...shot, timeRange: shot.timeRange.replace("秒", "s") }))),
      B: makeVersion(`22秒看懂${enterprise.name}的一个真实差异`, `${voice.lead}\n${voice.boundaryBridge}\n${voice.close}`, [`#${enterprise.name}`, "#SmallBusinessTok", "#KnowWhatYouBuy"], dyB.map((shot) => ({ ...shot, timeRange: shot.timeRange.replace("秒", "s") }))),
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
  const chinese = chinesePlatforms(mode, request.tone, enterprise, profile, brief, goal);
  const english = englishPlatforms(mode, request.tone, enterprise, profile);
  const platforms = Object.fromEntries(request.platforms.map((platform) => {
    if (platform === "reddit" || platform === "discord" || platform === "instagram" || platform === "tiktok") return [platform, english[platform]];
    return [platform, chinese[platform]];
  })) as Partial<Record<Platform, PlatformVersions>>;
  return { contractVersion: 1, enterpriseId: enterprise.id, source: "fallback", platforms };
}
