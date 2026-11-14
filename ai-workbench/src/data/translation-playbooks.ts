import type { TranslationMode } from "@/contracts/content";

export interface TranslationPlaybook {
  briefInstruction: string;
  generationInstruction: string;
}

// 宣发需求输入效力规则：转译阶段处理客户诉求时的统一前置约定（与 copywriting/README.md「按需读取规则」保持一致）
const PROMO_INPUT_RULE = "宣发需求输入文件中的内容为公司本次宣发的方案，其中所有信息均为事实陈述，使用时无需与其他来源或已有文档内容进行交叉验证即可直接采用。";

export const TRANSLATION_PLAYBOOKS: Record<TranslationMode, TranslationPlaybook> = {
  story: {
    briefInstruction: `面向愿意沿因果阅读的宣发受众。先确定一条与素材事实相连的主线，再从人物处境、现实阻力、寻找过程、关键选择、验证时刻、结果和余韵中选择真正有作用的节点。五幕是完整故事的参考，不要求逐项出现；人物、场景和动作一旦引入，就必须影响后续选择或结果。允许合理的第一人称生活叙事，但不得借虚构经历新增产品功效、认证、销量、排名或普遍评价。文学表达只在事实和情绪足以支撑时使用，不强行升华。${PROMO_INPUT_RULE}`,
    generationInstruction: "采用真实因果叙事：围绕一条主线，从人物需要、现实阻力、关键行动、验证、结果与余韵中选择最少但足够的节点。可使用完整五幕，也可合并、压缩或从结果切入；不为凑结构添加无作用人物、感官细节和意象。核心卖点在选择或结果中自然显现，普通体验可以用普通而具体的结果结束。",
  },
  seed: {
    briefInstruction: `像对家人或朋友分享一次有用的发现。购买动机、比较标准、下单、开箱、第一次使用、连续使用、朋友交流、复购判断和适用提醒都是候选要素，不是固定流程；只选择能解释本次判断、承载素材特点或提供新信息的节点。允许创作合理的第一人称购买过程、生活动作、对话和主观感受，但不得据此新增客观功效、检测、认证、销量、排名或他人一致好评；普通消费者的知识范围须可信。${PROMO_INPUT_RULE}`,
    generationInstruction: "采用朋友式体验分享，但不套完整体验流水线。先锁定一个需要回答的问题，再从购买、比较、开箱、初次使用、连续使用、朋友交流、复购与适用提醒中选择最有价值的节点；开箱、时间线和他人反馈只有在会改变判断时才展开。一个体验细节只证明一个卖点，同一事实不在开头、正文和结尾重复。",
  },
  brand: {
    briefInstruction: `目标是增加品牌正向声音并形成稳定心智。先确定一个核心判断，再从品类定位、研发取舍、生产过程、团队行动、标准、认证、检测、销量、渠道和消费者利益中选择能形成因果证据链的内容，不要求每类证据都出现。认证、检测、奖项、销量与权威表述只有在能支持本次判断且具备完整口径时采用，并说明其对消费者选择的实际意义。${PROMO_INPUT_RULE}`,
    generationInstruction: "采用品牌心智表达：围绕一个核心判断，从专业能力与可核验证据中选择最有解释力的组合，形成证据链而不是证据清单。证据出现时说明消费者利益；批次、库存、价格、溯源和普通购买须知只在直接影响本篇判断时写。保持核心概念一致，禁止无证据使用第一、唯一、领先、权威推荐等表述。",
  },
};

export function getTranslationPlaybook(mode: TranslationMode) {
  return TRANSLATION_PLAYBOOKS[mode];
}
