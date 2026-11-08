# 知行传播 · AI 多平台传播工作台

面向中小企业的本地演示原型。项目使用 Next.js App Router、Tailwind CSS、shadcn/ui、Lucide、Recharts、html2canvas 与 OpenAI 兼容接口。

## 本地启动

```powershell
npm install
npm run dev
```

打开 http://localhost:3000 。即使没有模型密钥，生成操作也会返回本地演示内容。`npm run build` 可检查项目能否构建。

如需调用第三方商用模型，仅在本机 `.env.local` 中分别填写“智能转译”和“文案生成”两组配置。供应商需提供 OpenAI 兼容接口：

```text
# 智能转译（POST /api/translate）
TRANSLATE_LLM_API_KEY=你的转译接口密钥
TRANSLATE_LLM_BASE_URL=供应商的 OpenAI 兼容服务地址
TRANSLATE_LLM_MODEL=转译使用的模型名

# 文案生成（POST /api/generate）
GENERATE_LLM_API_KEY=你的生成接口密钥
GENERATE_LLM_BASE_URL=供应商的 OpenAI 兼容服务地址
GENERATE_LLM_MODEL=生成使用的模型名
```

两组配置可以填写同一家供应商和同一个密钥，也可以分别使用不同供应商或模型。旧版 `LLM_API_KEY`、`LLM_BASE_URL`、`LLM_MODEL` 通用配置仍可作为兼容兜底。`.env.local` 已被 Git 忽略。请勿把真实密钥写入源码、JSON、文档或提交记录。

## 智能转译 API

`POST /api/translate` 先把客户的原始诉求转换为可执行的创意简报，再由 `POST /api/generate` 生成各平台文案。两个接口都只调用模型 API：未配置密钥时返回 503 并提示缺少的环境变量；调用失败、超时或模型返回格式不符合约定时返回 502 和具体原因，不再回退到本地兜底内容。

请求示例：

```json
{
  "contractVersion": 1,
  "enterpriseId": "spring-tea",
  "selectedMaterials": [],
  "goal": "新品上市早鸟特惠，主打年轻白领送礼场景",
  "tone": "温暖叙事",
  "mode": "story"
}
```

`mode` 支持 `story`（故事型）、`seed`（种草型）、`brand`（品牌型）。响应的 `brief` 包含 `audience`、`coreMessage`、`storyAngle`、`hook` 四项核心思路。前端会把这份简报随生成请求传给 `/api/generate`，避免直接复述客户原话和模板化表达。

## 三人协作边界

| 负责人 | 目录 | 内容 |
| --- | --- | --- |
| 主程 A | `src/contracts/`、`src/features/studio/`、`src/app/api/`、`src/components/ui/`、`package.json` | 数据契约、主控台、模型接口与全局依赖 |
| 队友 B | `src/features/preview/` | 右侧多平台预览与交付按钮 |
| 队友 C | `src/data/`、`src/features/analytics/`、`src/app/analytics/` | 行业案例与传播看板 |
| 主程 A | `src/app/page.tsx`、`src/app/layout.tsx`、`src/features/calendar/` | 页面装配与排期状态流转 |

共享契约在 `src/contracts/content.ts`，当前版本 `contractVersion: 1`。生成请求包含企业 ID、已选素材 ID 与素材正文、诉求、平台数组和语调。返回结果按平台划分，每个平台固定有 `A`、`B` 两版。修改契约时先与其他负责人同步，避免跨目录编辑。

预设案例和模拟数据存于 `src/data/`。新增素材、排期列表与试用额度保存在当前浏览器的 localStorage 中。传播看板数据明确为演示模拟数据；状态“模拟已发布”不会调用社媒平台接口。

## Git

当前项目位于上层仓库的 `dev-a` 分支。每轮改动前先提交上一可用快照；配置远端后，同步云端前先在分支上执行 `git pull origin main` 并处理可能的冲突。当前未配置 Git 远端。
