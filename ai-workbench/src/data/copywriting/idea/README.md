# idea｜智能转译引擎（第一步 API：宣发诉求 → 思路大纲）

本目录服务于系统的第一次 API 接入：把用户输入的一句话宣发诉求，转译为结构化**思路大纲**（创意简报），供人工确认修改后交给第二步成文。本阶段只产出思路，不产出成文——不涉及平台排版、语调措辞与字数分段。

## 大纲四维度（输出契约）

每份大纲固定输出四个维度，各维度一句具体、可执行的表述，务求简短精准：

1. **核心宣发受众**：这条内容写给谁看（其审美与信息需求，区别于最终购买人群）。
2. **核心表达**：看完只能记住的一件事（单一主张）。
3. **内容切口**：用哪三项以内的事实、从哪个角度证明这个主张。
4. **开场钩子**：用什么具体悬念、反差或场景把受众拉进来。

任务拆解方法见 [task-brief.md](task-brief.md)；真实性与证据边界见 [evidence-and-safety.md](evidence-and-safety.md)——大纲阶段锁定的每一项事实，后续成文不得越界放大。

## 注意力机制（本阶段读取规则）

按当前叙事模式**只读一个**模式文件，其余不读：

| 用户选择的转译模式 | 只读 |
| --- | --- |
| 故事型 | [modes/story.md](modes/story.md) |
| 种草型 | [modes/seed.md](modes/seed.md) |
| 品牌型 | [modes/brand.md](modes/brand.md) |

- 必读底座仅 3 件：本 README、[task-brief.md](task-brief.md)、[evidence-and-safety.md](evidence-and-safety.md)。
- 需要确认品类通用宣传维度（如农产品的"口感与味觉"）时，只读 [post/categories/](../post/categories/) 下对应品类目录的 README.md 一个文件，不通读该品类其他文件。
- 平台规则（post/platforms/）、语调规则（post/tones/）、爆款排版案例（post/platforms/xiaohongshu-cases.md 等）**与本阶段无关，一律不读**——它们属于第二步成文阶段。
