# post｜多平台版本创作（第二步 API：思路大纲 → 最终社媒文案）

本目录服务于系统的第二次 API 接入：以第一阶段确认后的**思路大纲四维度**（受众、核心表达、切口、钩子）为唯一输入，生成贴合目标平台风格的 A/B 成稿。本阶段不重新构思大纲，只在既定思路上做平台化表达。

## 注意力机制（本阶段读取规则，最重要）

不同平台的写作方式差异极大，**只读本次任务选中的维度，禁止整目录通读**：

| 维度 | 选取规则 | 示例 |
| --- | --- | --- |
| 平台（必读） | 本次勾选了哪个平台，只读哪个文件 | 小红书任务只读 [platforms/xiaohongshu.md](platforms/xiaohongshu.md)（可加 [xiaohongshu-cases.md](platforms/xiaohongshu-cases.md)），不读微博、抖音、IG 等文件 |
| 品类（必读） | 企业属于哪个品类，只读该品类目录下当前模式对应的那 1 个文件 | 农产品种草文案只读 [categories/agricultural-products/seed.md](categories/agricultural-products/seed.md) |
| 语调（必读） | 用户选了哪种语调，只读哪个文件 | 闺蜜安利只读 [tones/bestie-recommendation.md](tones/bestie-recommendation.md) |
| 模式骨架（按需） | 大纲四维度已含模式信息，仅在不确定推进骨架时读 [idea/modes/](../idea/modes/) 下当前模式那 1 个文件 | — |
| 共享底座（必读） | [copy-skeleton.md](copy-skeleton.md)（素材六要素 + 平台输出规范总表） | — |
| 成稿与终检（必读） | [composition/](composition/) 三个规则文件 | — |
| 技法库（按需） | [reference-library.md](reference-library.md)、[writing-craft.md](writing-craft.md) 在需要开场钩子、金句与互动设计时查阅 | — |

未选中平台/品类/语调的规则文件不进入上下文；跨维度冲突处理以 [composition/composition-order.md](composition/composition-order.md) 的优先级为准：`真实性与安全 > 叙事模式 > 品类证据 > 平台结构 > 表达语调 > 热点与修辞`。

## 本阶段优化重点

- 严格按各平台的字数、分段、排版与互动习惯成文（如小红书短句成组、两句话分段、段间空行）。
- 每个平台只吃自己的原生结构：不得把同一正文裁切后复制到多个平台。
- 使用 [reference-library.md](reference-library.md) 提炼的爆款话术逻辑（按品类），去除 AI 感、套话与机械模板。
- A/B 两版至少更换核心切口、主角或场景、证据顺序、开场钩子、互动方式中的两项，交稿前过 [composition/final-checklist.md](composition/final-checklist.md)。

## 目录导航

- [platforms/](platforms/)：七个目标平台的内容结构（小红书另附爆款案例档案）。
- [categories/](categories/)：四类品类在三种模式下的细化规则。
- [tones/](tones/)：四种表达语调的语言规则。
- [composition/](composition/)：组合顺序、跨维度写作规则与成稿检查表。
- [copy-skeleton.md](copy-skeleton.md)：素材六要素与平台输出规范总表。
- [reference-library.md](reference-library.md)、[writing-craft.md](writing-craft.md)：爆款公式与落笔技法。
