# 知行传播 · AI 多平台传播工作台

面向中小企业的本地演示原型。项目使用 Next.js App Router、Tailwind CSS、shadcn/ui、Lucide、Recharts、html2canvas 与 OpenAI 兼容接口。

## 本地启动

```powershell
npm install
npm run dev
```

打开 http://localhost:3000 。即使没有模型密钥，生成操作也会返回本地演示内容。`npm run build` 可检查项目能否构建。

如需调用商用模型，仅在本机新建 `.env.local` 并填写：

```text
LLM_API_KEY=你的密钥
LLM_BASE_URL=兼容 OpenAI 的服务地址
LLM_MODEL=所选模型名
```

`.env.local` 已被 Git 忽略。请勿把真实密钥写入源码、JSON、文档或提交记录。

## 三人协作边界

| 负责人 | 目录 | 内容 |
| --- | --- | --- |
| 主程 A | `src/contracts/`、`src/features/studio/`、`src/app/api/`、`src/components/ui/`、`package.json` | 数据契约、主控台、模型接口与全局依赖 |
| 队友 B | `src/features/preview/` | 右侧多平台预览与交付按钮 |
| 队友 C | `src/data/`、`src/features/analytics/`、`src/app/analytics/` | 行业案例、兜底内容与传播看板 |
| 主程 A | `src/app/page.tsx`、`src/app/layout.tsx`、`src/features/calendar/` | 页面装配与排期状态流转 |

共享契约在 `src/contracts/content.ts`，当前版本 `contractVersion: 1`。生成请求包含企业 ID、已选素材 ID 与素材正文、诉求、平台数组和语调。返回结果按平台划分，每个平台固定有 `A`、`B` 两版。修改契约时先与其他负责人同步，避免跨目录编辑。

预设案例和模拟数据存于 `src/data/`。新增素材、排期列表与试用额度保存在当前浏览器的 localStorage 中。传播看板数据明确为演示模拟数据；状态“模拟已发布”不会调用社媒平台接口。

## Git

当前项目位于上层仓库的 `dev-a` 分支。每轮改动前先提交上一可用快照；配置远端后，同步云端前先在分支上执行 `git pull origin main` 并处理可能的冲突。当前未配置 Git 远端。
