import type { Enterprise } from "@/contracts/content";

/**
 * 兜底文案 · 事实层
 *
 * 每个案例的原子事实：只存"发生了什么、是什么、多少钱"，不存成句的文案。
 * 句子由各语调渲染器（voice-*）负责写出，保证同一事实在不同语调与平台下呈现不同表达。
 */

export interface CaseFacts {
  brand: string;
  industry: string;
  location: string;
  tagline: string;

  /** 具体产品名（用户口中的叫法） */
  productId: string;
  /** 型号或 SKU */
  model: string;
  /** 价格事实（含规格） */
  priceLine: string;
  /** 使用成本折算（种草型的过程性数据） */
  costPerUse: string;
  /** 可核验参数，3-4 条，渲染时最多取 3 条进正文 */
  specs: string[];
  /** 人物身份（品牌故事主角） */
  person: string;
  /** 人物的关键抉择或规矩（故事型高潮） */
  personRule: string;
  /** 人物与规矩组成的完整自然句（避免同位语拼接断裂） */
  ruleSentence: string;
  /** 人物的一句原话式表达（可作引语） */
  personQuote: string;
  /** 第一次使用的口感/体感 */
  firstTaste: string;
  /** 可看见的视觉细节 */
  visualDetail: string;
  /** 气味或触感 */
  smellLine: string;
  /** 故事型开场：收货或抵达的当下时刻 */
  openingMoment: string;
  /** 产地/制作现场的背景画面 */
  originScene: string;
  /** 使用场景列表 */
  scenes: string[];
  /** 适合的人（写成处境） */
  fit: string;
  /** 不适合或需谨慎的情况（边界） */
  notFit: string;
  /** 中译中金句（本体喻体逻辑可验证） */
  gold: string;
  /** 行业化的日常困扰（闺蜜安利开场用，避免跨行业穿帮） */
  painScene: string;
  /** 行业化的核验维度说法（专业品鉴收尾用） */
  verifyAxis: string;
  /** 微博收尾的讨论问题 */
  pollQuestion: string;
  /** 小红书话题标签池（取 3-5 个） */
  xhsTags: string[];
  /** 微博话题词（2 个） */
  weiboTags: [string, string];
  /** 抖音标签（3-4 个） */
  douyinTags: string[];
  /** 海外平台的英文事实（英文生成逻辑现状保留，仅字段来源切换） */
  englishPlace: string;
  englishProduct: string;
  englishBenefit: string;
}

const TEA: CaseFacts = {
  brand: "云岭春茶",
  industry: "高山绿茶",
  location: "安吉",
  tagline: "把一段真实的春天装进罐子",
  productId: "明前一级绿茶",
  model: "YL-MQ50",
  priceLine: "50克罐装，128元",
  costPerUse: "一天两泡，一罐正好一个月，折下来一天三块多",
  specs: ["清明前头采（过了清明香气差一截）", "一芽一叶，泡开叶子立在水里", "海拔800米茶园", "低温慢焙"],
  person: "陈青禾，合作社第三代茶农",
  personRule: "雨水叶不收，宁可那年减产三成",
  ruleSentence: "合作社第三代的陈青禾立下一条规矩：雨水叶不收，宁可那年减产三成。",
  personQuote: "茶是喝进人身体里的东西，糊弄不得",
  firstTaste: "第一口淡得没什么存在感，第三口开始回甘",
  visualDetail: "叶子在杯里立着",
  smellLine: "青叶混着炭火的气味",
  openingMoment: "茶叶到的那天，这边在下小雨，罐身上还带着一点凉",
  originScene: "安吉的雾要过了八点才散，采茶人天不亮就上山，明前的日子就十几天",
  scenes: ["下午三点犯困又不敢喝咖啡的工位", "周末在家慢泡一杯", "春日拜访长辈的伴手礼"],
  fit: "想从花茶包升级、办公室常备、送长辈求稳的人",
  notFit: "喝惯重焙火浓茶的人可能嫌它寡",
  gold: "明前茶是装进罐子的十来天，过一天少一天",
    painScene: "工位抽屉里囤的花茶包，基本都是过期的命",
  verifyAxis: "采摘时令、芽叶等级",
  pollQuestion: "明前茶你们认产地还是认时令？",
  xhsTags: ["#明前绿茶", "#办公室喝茶", "#茶生活", "#伴手礼", "#春茶"],
  weiboTags: ["#明前茶#", "#云岭春茶#"],
  douyinTags: ["#明前绿茶", "#办公室好物", "#戒咖啡", "#茶"],
  englishPlace: "Anji, Zhejiang",
  englishProduct: "high-mountain pre-Qingming spring tea, picked as one bud and one leaf and slowly roasted in small batches",
  englishBenefit: "an approachable spring-tea ritual for a desk, a quiet break, or a thoughtful gift",
};

const HERITAGE: CaseFacts = {
  brand: "青石巷文旅",
  industry: "非遗手作体验",
  location: "景德镇",
  tagline: "老街、工坊与一次亲手完成的作品",
  productId: "半日非遗手作路线",
  model: "QS-HALFDAY",
  priceLine: "单人128元、双人198元，每场6人小团",
  costPerUse: "约3小时的路线，提前48小时可免费改期",
  specs: ["老街导览+手作工坊+在地茶点三段式", "每场限6人", "提前48小时免费改期", "作品可带走"],
  person: "本地青年与老匠人共同设计",
  personRule: "路线按手艺的真实工序设计，不为拍照好看删减步骤",
  ruleSentence: "设计这条路线的匠人守着一条规矩：按手艺的真实工序走，不为拍照好看删减步骤。",
  personQuote: "手艺要亲手碰过材料，才算认识",
  firstTaste: "第一次拉坯歪歪扭扭，匠人在旁边扶了一把，作品不规整，但确实是自己的",
  visualDetail: "石板路上的脚步声和工坊里工具与材料相触的轻响",
  smellLine: "瓷泥带着一点凉和湿",
  openingMoment: "转进青石巷的时候，老街的声音先慢了下来",
  originScene: "景德镇的老巷里，匠人坐在工作台前，手上的动作没有停过",
  scenes: ["周末和朋友或伴侣的半天", "带娃家庭的动手时间", "一个人的慢游下午"],
  fit: "喜欢慢游、想亲手做点东西、安排双人周末的人",
  notFit: "追求大型娱乐项目、密集景点或纯购物行程的人",
  gold: "半日手作路线，是一段可以带回家的手艺",
    painScene: "周末存了一堆古镇照片，翻出来却想不起那天到底做了什么",
  verifyAxis: "工序完整度、零基础可参与度",
  pollQuestion: "出去玩你们更想打卡还是想动手做点东西？",
  xhsTags: ["#景德镇", "#非遗体验", "#周末去哪儿", "#手作", "#citywalk"],
  weiboTags: ["#非遗体验#", "#景德镇#"],
  douyinTags: ["#景德镇", "#非遗手作", "#周末去哪儿", "#动手"],
  englishPlace: "Jingdezhen, Jiangxi",
  englishProduct: "a half-day heritage experience combining a guided old-street walk, a hands-on workshop, and local tea snacks",
  englishBenefit: "a slower way to understand local craft by taking part rather than simply taking photos",
};

const ORANGE: CaseFacts = {
  brand: "橙意果园",
  industry: "赣南脐橙",
  location: "赣州",
  tagline: "产地直采，现摘现发",
  productId: "赣南一级脐橙家庭装",
  model: "CY-NG5",
  priceLine: "5斤装59.9元，约16-20颗",
  costPerUse: "一家人的果盘一周刚好吃完，不担心囤坏",
  specs: ["单果约180-230克人工分拣", "现摘现发", "坏果拍照秒赔", "产地直发不走中间仓"],
  person: "返乡青年联合乡邻果农",
  personRule: "按单果规格人工分拣，个头不达标的留给自家吃",
  ruleSentence: "做直销的返乡青年守着一条规矩：按单果规格人工分拣，个头不达标的留给自家吃。",
  personQuote: "果子好不好，开了箱才知道，所以我们敢赔",
  firstTaste: "剥开的时候汁水先出来，果肉是紧的，酸度压得住甜",
  visualDetail: "冬日果园的阳光落在果皮上，颜色是沉稳的橙红",
  smellLine: "纸箱一开，清亮的橙香先出来",
  openingMoment: "纸箱打开时，橙香先出来了，五斤的份量比想象中扎实",
  originScene: "赣州冬天的果园里，返乡青年从树下摘下一颗橙，先看大小，再看颜色",
  scenes: ["冬季家庭果盘", "办公室整箱分食", "探望亲友的随手礼"],
  fit: "重视产地和当季新鲜度、家里果盘消耗快的人",
  notFit: "农产品外观大小和酸甜度有自然差异，追求每颗一模一样的人要先想清楚",
  gold: "产地直发的脐橙，是果树替你守了一年的时令",
    painScene: "网上买的橙子，一半酸一半面，挑不出规律",
  verifyAxis: "单果规格、采摘发货时效",
  pollQuestion: "买水果你们最在意甜度还是新鲜度？",
  xhsTags: ["#赣南脐橙", "#冬日水果", "#产地直发", "#家庭果盘", "#脐橙"],
  weiboTags: ["#赣南脐橙#", "#产地直发#"],
  douyinTags: ["#赣南脐橙", "#开箱", "#冬日水果", "#水果自由"],
  englishPlace: "Ganzhou, Jiangxi",
  englishProduct: "freshly picked Gannan navel oranges, hand-sorted at roughly 180-230 grams each in a five-jin family box",
  englishBenefit: "a transparent, right-sized way for households to enjoy seasonal fruit directly from the growing region",
};

const SKINCARE: CaseFacts = {
  brand: "澄露护肤",
  industry: "基础保湿护肤",
  location: "上海",
  tagline: "把每天的基础保湿做明白",
  productId: "B5舒缓保湿精华",
  model: "CL-B5-30",
  priceLine: "30毫升按压瓶，89元，替换装59元",
  costPerUse: "洁面后1-2泵，按压瓶好控制量，一瓶用一个季度",
  specs: ["甘油、泛醇、角鲨烷", "无香精无着色剂", "白天后续配合防晒"],
  person: "配方师出身的主理人",
  personRule: "配方表上没有的承诺一个都不写，功效没有依据的话不说",
  ruleSentence: "配方师出身的主理人守着一条规矩：配方表上没有的承诺一个都不写，功效没有依据的话不说。",
  personQuote: "基础打不稳，叠再多也是白叠",
  firstTaste: "上脸是清润的质地，推开后不黏，等一分钟再上面霜刚好",
  visualDetail: "一泵挤在手背，是半透明的啫喱感",
  smellLine: "没有香味，闻起来就是原料本身的样子",
  openingMoment: "洗手台前的瓶瓶罐罐排成一列，真正每天用到的往往只有最简单的几步",
  originScene: "实验室里，配方师对着稳定性数据一遍遍调整比例",
  scenes: ["早间通勤前的两分钟", "出差只带一瓶的极简行李", "换季皮肤闹脾气的时候"],
  fit: "想简化护肤步骤、关注配方信息、把基础保湿做稳的人",
  notFit: "期待猛药型功效的人；皮肤问题持续应先看医生，精华不能替代治疗",
  gold: "基础保湿是给护肤做减法",
    painScene: "洗手台上的瓶瓶罐罐越堆越多，每天真用到的只有两三瓶",
  verifyAxis: "配方成分、用量与使用顺序",
  pollQuestion: "你们的护肤流程现在是几步，评论区数一数？",
  xhsTags: ["#基础保湿", "#精简护肤", "#成分党", "#敏感肌友好", "#护肤"],
  weiboTags: ["#精简护肤#", "#基础保湿#"],
  douyinTags: ["#精简护肤", "#成分党", "#护肤干货", "#干皮救星"],
  englishPlace: "Shanghai",
  englishProduct: "a 30 ml pump-bottle hydrating serum formulated with glycerin, panthenol, and squalane, with no added fragrance or colorants",
  englishBenefit: "a clear, manageable approach to everyday hydration without turning a basic routine into an unnecessarily complicated one",
};

const STORAGE: CaseFacts = {
  brand: "简序日用",
  industry: "小户型收纳",
  location: "宁波",
  tagline: "给常用物品一个清楚的位置",
  productId: "前开式收纳箱",
  model: "JX-F3222",
  priceLine: "单只29元，三只装79元，标签卡纸随箱附赠",
  costPerUse: "衣柜、玄关、浴室各放一只，小户型一年的整理就稳了",
  specs: ["外部尺寸约32×22×16厘米，购买前先量空间", "可叠放，前开门带卡扣", "标签位可更换"],
  person: "做工业设计出身的主理人",
  personRule: "每个结构对应一次真实动作，不为画面整齐加没用的小设计",
  ruleSentence: "做工业设计出身的主理人守着一条规矩：每个结构都要对应一次真实动作，不为画面整齐加没用的小设计。",
  personQuote: "收纳是省动作，不是把东西藏起来",
  firstTaste: "叠在衣柜第三层，不用搬开上面的箱子就能拿到袜子",
  visualDetail: "前门打开的瞬间，常用的小件就站在眼前",
  smellLine: "箱体是干净的塑料质感，没有异味",
  openingMoment: "柜门打开以后，常用的小件就在眼前，却总要翻过两三层",
  originScene: "小户型的出租屋里，设计出身的屋主把柜子量了又量",
  scenes: ["衣柜深处的袜子区", "玄关进门三步内的杂物位", "浴室台面下的囤货区"],
  fit: "小户型或租住、愿意先量好空间再下单的人",
  notFit: "想存重物的人要看清承重说明；尺寸不合会白买，先量再买",
  gold: "前开门的收纳箱，是给常用物品留的一个固定位置",
    painScene: "柜子叠了三层，每次要用都得先搬开上面两只箱",
  verifyAxis: "外部尺寸、拿取动线",
  pollQuestion: "你们家最乱的是哪个角落？我先说我家玄关。",
  xhsTags: ["#小户型收纳", "#租房改造", "#收纳好物", "#家居整理", "#好物分享"],
  weiboTags: ["#小户型收纳#", "#租房改造#"],
  douyinTags: ["#收纳神器", "#小户型", "#租房好物", "#整理收纳"],
  englishPlace: "Ningbo, Zhejiang",
  englishProduct: "a front-opening polypropylene storage box measuring approximately 32 x 22 x 16 cm, designed to stack and fitted with a latch and replaceable label slot",
  englishBenefit: "a practical way to reduce lifting and searching in compact homes by giving frequently used items a clear, accessible place",
};

const FACTS: Record<string, CaseFacts> = {
  "spring-tea": TEA,
  "heritage-town": HERITAGE,
  "navel-orange": ORANGE,
  "clear-dew-skincare": SKINCARE,
  "simple-order-home": STORAGE,
};

/** 未知企业使用素材内容降级生成事实的兜底字段集 */
function fallbackFacts(enterprise: Enterprise, product: string): CaseFacts {
  return {
    brand: enterprise.name,
    industry: enterprise.industry,
    location: enterprise.location,
    tagline: enterprise.tagline,
    productId: enterprise.industry,
    model: "",
    priceLine: "以产品页实际规格为准",
    costPerUse: "按实际使用频率折算",
    specs: ["以产品页参数为准"],
    person: `${enterprise.name}团队`,
    personRule: "以可核验的产品与流程事实建立认知",
    ruleSentence: `${enterprise.name}团队守着一条规矩：以可核验的产品与流程事实建立认知。`,
    personQuote: "把来源、过程和边界讲清楚",
    firstTaste: "以真实使用感受为准",
    visualDetail: "产品使用过程的画面",
    smellLine: "",
    openingMoment: `第一次认识${enterprise.name}，往往来自一个能被看见的细节`,
    originScene: `${enterprise.location}的日常作业现场`,
    scenes: ["日常使用场景"],
    fit: `与${enterprise.industry}需求和使用场景相符的人`,
    notFit: "具体体验因使用条件而异，以真实资料为准",
    gold: `选择${enterprise.name}，是把判断建立在可核验事实上`,
    painScene: `${enterprise.industry}的选择太多，挑起来反而没了准头`,
    verifyAxis: "核心参数、使用条件",
    pollQuestion: `选${enterprise.industry}产品，你们最看重什么？`,
    xhsTags: [`#${enterprise.industry}`, "#好物分享", "#真实体验"],
    weiboTags: [`#${enterprise.name}#`, `#${enterprise.industry}#`],
    douyinTags: [`#${enterprise.industry}`, "#好物", "#真实测评"],
    englishPlace: enterprise.location,
    englishProduct: "a product shaped by real materials, process, and everyday use",
    englishBenefit: "a clearer choice grounded in specific facts rather than broad claims",
    ...product ? { firstTaste: product.slice(0, 40) } : {},
  };
}

export function factsFor(enterprise: Enterprise, product: string): CaseFacts {
  return FACTS[enterprise.id] ?? fallbackFacts(enterprise, product);
}

/** 稳定散列：同一输入选同一变体，避免同请求内重复 */
export function pickBySeed<T>(pool: readonly T[], seed: string, offset = 0): T {
  let hash = 2166136261;
  for (let i = 0; i < seed.length; i += 1) {
    hash ^= seed.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  const unsigned = hash >>> 0;
  return pool[(unsigned + offset) % pool.length];
}
