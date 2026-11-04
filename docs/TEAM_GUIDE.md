# 团队使用说明

欢迎参与“知行传播”工作台。我们正在制作一个可在本地稳定演示的 AI 应用原型，面向没有专门运营团队的中小企业。进入工作台后，可以选择企业案例、勾选产品和品牌素材、输入本次推广诉求，再生成适合小红书、微博和抖音的 A/B 两版内容。右侧用于检查各平台的展示效果，也可以复制文案、导出预览图或放入发布日历。发布日历记录草稿到模拟发布的状态；传播看板展示标明为演示数据的趋势与标签。

## 为什么这样设计

企业已有的产品资料和品牌故事先进入知识库，创作时只引用本次勾选的素材。主控台将同一诉求转换为统一的 JSON 请求，生成接口返回每个平台的 A/B 版本。预览区只读取约定的数据结构，避免把平台展示规则写进生成接口。排期和试用额度保存在当前浏览器，预设案例与模拟指标放在项目 JSON 文件中，因此本地启动不需要数据库、Docker 或社媒平台授权。未配置模型密钥时，工作台使用本地兜底内容完成演示。

## 找到自己的工作区域

仓库最外层是 Git 根目录，网页项目在 `ai-workbench/`。请从 Git 根目录运行 Git 命令；进入 `ai-workbench/` 后运行 npm 命令。

| 负责人 | 主要维护目录和文件 | 工作内容 |
| --- | --- | --- |
| 主程 A | `ai-workbench/src/contracts/`、`src/features/studio/`、`src/app/api/`、`src/components/ui/`、`package.json` | 统一数据契约、创作主控台、模型接口、全局依赖与页面装配 |
| 队友 B | `ai-workbench/src/features/preview/` | 小红书、微博、抖音预览，平台和版本切换，复制、导图、推送日历按钮 |
| 队友 C | `ai-workbench/src/data/`、`src/features/analytics/`、`src/app/analytics/` | 企业案例与兜底内容、演示指标、传播图表 |
| 主程 A | `ai-workbench/src/features/calendar/`、`src/app/calendar/`、`src/app/page.tsx`、`src/app/layout.tsx` | 排期状态和各模块在页面中的连接 |

表格中的 `src/` 均指 `ai-workbench/src/`。共享契约在 `ai-workbench/src/contracts/content.ts`，当前版本为 `contractVersion: 1`。生成请求会带上企业、所选素材、推广目标、平台和语调；返回结果按平台包含 A/B 两版。需要新增字段时，请先与主程约定字段名和含义，再由主程更新契约，随后各分区使用新字段。

## 第一次拉取并运行

仓库创建后，从 GitHub 页面复制 HTTPS 仓库地址，在自己的电脑上运行：

```powershell
git clone <仓库的 HTTPS 地址>
cd expert-team
cd ai-workbench
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。如果不准备联调真实模型，直接使用本地兜底内容即可。需要联调时，在自己电脑的 `ai-workbench/.env.local` 中填写 `LLM_API_KEY`、`LLM_BASE_URL` 和 `LLM_MODEL`；这个文件不会上传到仓库。

## 更新和上传自己的工作

每个人在自己的分支开发：主程使用 `dev-a`，预览负责人使用 `dev-b`，案例与看板负责人使用 `dev-c`。新成员从 `main` 建自己的分支。开始新一轮修改前，先确保上一个可用状态已提交；提交信息写清楚这一轮做了什么。不想逐条手敲时，运行 `scripts/checkpoint.ps1` 自动检查并提交；改崩需要恢复时，用 `scripts/rollback.ps1 -Mode discard` 一键回到最近一次提交（完整规则见根目录 `AGENTS.md`）。

以 `dev-b` 为例，第一次建分支可在仓库根目录运行：

```powershell
git switch -c dev-b origin/main
```

已有分支时运行 `git switch dev-b`。开始工作或准备上传前，先获取主线更新：

```powershell
git pull origin main
```

若 Git 提示需要指定合并方式，先在本仓库运行 `git config pull.rebase false`，再重新拉取。处理完冲突，确认网页可以正常启动后，只暂存自己负责的路径。例如队友 B：

```powershell
git add ai-workbench/src/features/preview
git commit -m "feat: improve platform previews"
git push -u origin dev-b
```

上传分支后，在 GitHub 发起从自己分支到 `main` 的 Pull Request，请对应负责人检查。队友 C 可按同样步骤暂存 `ai-workbench/src/data`、`ai-workbench/src/features/analytics` 和 `ai-workbench/src/app/analytics`。主程负责整合、全局依赖和共享契约。

## 请避免这些操作

- 不要把 API Key、`.env.local`、个人账号凭据或客户真实敏感资料提交到 GitHub。
- 不要直接在 `main` 上开发，也不要直接覆盖其他成员负责的目录。确需跨区修改时，先在 Pull Request 中说明并请负责人协作。
- 不要在自己的分区复制一套新的内容类型或 JSON 字段；统一以 `src/contracts/content.ts` 为准。
- 不要把 `node_modules/`、`.next/` 或本机生成文件提交进仓库。
- 不要将“模拟已发布”理解为真实社媒发布，也不要把看板模拟指标当作真实经营数据。
- 不要为了小改动添加只重复实现细节的测试文件。必要验证完成后，移除临时测试代码。

如遇到合并冲突或接口字段不清楚，保留自己的分支和提交，先在 Pull Request 中说明情况，再一起解决。
