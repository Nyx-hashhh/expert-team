# 知行传播｜中小企业 AI 多平台传播工作台

这是一个供 AI 应用创新比赛现场演示的本地 Web 原型。它帮助小企业把已有的产品资料、品牌故事和参考文案整理成创作背景，再把一次宣发诉求转译成小红书、微博和抖音三种不同表达。项目采用 Next.js App Router 单仓库架构，前后端一起启动，不需要数据库、Docker 或真实社媒账号。

## 网页能做什么

打开工作台后，可以切换春茶、古镇文旅、助农脐橙三个企业案例，勾选需要引用的素材，也可以在浏览器里新增素材。输入推广目标、选择平台和表达语调后，工作台会为每个平台准备 A/B 两版文案及话题标签。右侧可以切换平台与版本，复制内容、导出预览图，或将当前版本加入发布日历。日历支持草稿、待审核、已排期、模拟已发布的状态流转；传播看板展示明确标记为演示数据的渠道趋势。

模型密钥只由服务端从本机 `.env.local` 读取。没有配置密钥或接口暂时不可用时，工作台会使用本地演示结果，保证现场仍能走通主要流程。新增素材、排期和试用额度保存在当前浏览器的 localStorage；换浏览器或清理站点数据后不会自动同步。

## 设计思路

首页是左侧固定导航、中间创作区、右侧多端预览的三栏布局。内容从“企业素材 → 宣发诉求 → 统一 JSON 结果 → 平台预览与排期”单向流动。共享数据结构集中在 `ai-workbench/src/contracts/`，各功能区只消费契约，不互相读取对方的内部状态。这样三位成员可以主要在自己的目录里工作，降低合并冲突。

## 分区与负责人

| 成员 | 主要负责目录 | 任务 |
| --- | --- | --- |
| A，主程 | `ai-workbench/src/contracts/`、`ai-workbench/src/features/studio/`、`ai-workbench/src/app/api/`、`ai-workbench/src/components/ui/`、`ai-workbench/package.json` | 数据契约、全局依赖、主控台表单和模型接口；维护首页装配文件 `ai-workbench/src/app/page.tsx` |
| B，预览 | `ai-workbench/src/features/preview/` | 小红书手机卡、微博信息流、抖音分镜预览，以及复制、导图和交付交互 |
| C（huihui1753），案例与报表 | `ai-workbench/src/data/`、`ai-workbench/src/features/analytics/`、`ai-workbench/src/app/analytics/` | 行业案例、演示兜底数据、模拟指标与图表看板 |

发布日历位于 `ai-workbench/src/features/calendar/` 和 `ai-workbench/src/app/calendar/`，目前由 A 维护。改动公共契约、页面入口、全局样式或 `package.json` 时，先在团队里说明，再由 A 统一处理或协调合并。

## 第一次拉取与本地运行

仓库名使用 GitHub 地址允许的 `expert-team`。克隆后进入应用子目录运行：

```bash
git clone https://github.com/Nyx-hashhh/expert-team.git
cd expert-team/ai-workbench
npm install
npm run dev
```

浏览器打开 `http://localhost:3000`。没有 API Key 也能体验本地演示流程。如需调用模型，只在自己电脑的 `ai-workbench/.env.local` 填写 `LLM_API_KEY`、`LLM_BASE_URL` 和 `LLM_MODEL`；此文件已被 Git 忽略。更细的启动说明见 [应用说明](ai-workbench/README.md)。

Windows 可直接双击仓库根目录的 `启动AI工作台.cmd`。启动器会检查完整的 Node.js/npm 环境；首次运行或 `package-lock.json` 更新后会自动执行 `npm ci`，等待工作台返回正常页面后才打开浏览器。3000 端口被其他程序占用时会尝试 3001–3010，启动日志写入 `ai-workbench/.next/workbench.stdout.log` 和 `workbench.stderr.log`。若提示缺少 npm，请安装完整的 Node.js LTS，不能只依赖某个工具附带的 `node.exe`。

每次从 GitHub 拉取代码后，运行 `启动AI工作台.cmd --check` 检查本机环境，再双击启动器确认页面可用。更新前先关闭旧工作台服务；启动器会按锁文件自动同步依赖，避免旧版 `node_modules` 与新代码不一致。

## 每位成员如何更新代码

首次克隆后，从最新的 `main` 建立自己的分支。A 使用 `dev-a`；B、C 分别使用 `dev-b`、`dev-c`，其他协作者也应使用独立分支。

```bash
git switch main
git pull origin main
git switch -c dev-b
```

开始一轮新修改前，先确认上一个可用版本已经提交。主要修改自己负责的目录。完成后，在自己的分支上提交并推送：

```bash
git add .
git commit -m "feat: 简要说明本轮改动"
git pull origin main
git push -u origin dev-b
```

第一次推送后可用 `git push` 更新同一分支，再在 GitHub 上发起指向 `main` 的 Pull Request，写明修改内容和涉及目录。合并冲突优先由对应目录负责人处理；跨目录改动请在 PR 里标注。`git pull origin main` 会把主线更新带入当前分支，执行前先保存自己的工作，出现冲突时解决后再推送。

## 开工前快照与一键回滚

开始新功能、修改或重构之前，上一个可用的状态必须已经在 Git 里，保证随时能回到改崩前的样子。仓库根目录的 `scripts/checkpoint.ps1` 会自动完成这件事：目录还没初始化 Git 时执行 `git init` 并提交初始快照；存在未提交改动时自动把上一个可用状态提交；工作区干净时提示可以开工。

```powershell
powershell -ExecutionPolicy Bypass -File scripts/checkpoint.ps1
```

改崩了想回到上一次正常运行的快照时：

```powershell
# 丢弃自最近一次提交以来的所有改动（含新文件），回到最近一次提交
powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1 -Mode discard

# 连最近一次提交也一并回退（被打掉的提交仍可通过 git reflog 找回）
powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1 -Mode last
```

两个脚本都会先展示要提交或丢弃的内容再执行，`rollback.ps1` 需要输入 `Y` 确认（加 `-Force` 跳过）。完整规则见 [AGENTS.md](AGENTS.md)。

## 协作时请避免

- 不要直接向 `main` 推送，也不要多人共用一个开发分支。
- 不要在没有沟通的情况下修改别人的负责目录、共享契约、`package.json` 或全局样式。
- 不要提交 `.env.local`、API Key、`node_modules`、构建产物或真实客户资料。
- 不要把看板模拟数据描述成真实社媒平台统计，也不要把“模拟已发布”当作实际发布。
- 不要为了验证简单修改而新增与实现重复的测试文件；必要验证完成后清理临时测试代码。

当前仓库以本地演示稳定性为目标。模型接口、平台预览和模拟数据均在独立目录中，后续可以逐步替换实现，而无需重做整个工作台。
