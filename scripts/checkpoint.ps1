<# 开工前快照：保证"上一个可用的状态"已提交，然后才允许开始新编码。
   用法: powershell -ExecutionPolicy Bypass -File scripts/checkpoint.ps1 [-Message "说明"]
   注: Windows PowerShell 5.1 会把 git 写往 stderr 的内容当错误流，因此本脚本统一按退出码判断 #>
param([string]$Message = "chore: checkpoint last working state before new work")

function Fail([string]$msg) {
    Write-Host ("[checkpoint] 错误: " + $msg) -ForegroundColor Red
    exit 1
}

# 1) 目录尚未初始化 Git -> 第一个动作必须是 git init + 初始提交
$inside = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or -not $inside) {
    Write-Host '[checkpoint] 当前目录还不是 Git 仓库，执行 git init ...'
    git init
    if ($LASTEXITCODE -ne 0) { Fail 'git init 失败' }
    git add -A
    if (git status --porcelain) {
        git commit -m "chore: initial commit (baseline snapshot)"
        if ($LASTEXITCODE -ne 0) { Fail '初始提交失败' }
        Write-Host '[checkpoint] 初始快照已提交，可以作为第一个回滚点。'
    } else {
        Write-Host '[checkpoint] 目录为空，git init 完成（建议先放入项目文件再提交）。'
    }
    exit 0
}

# 2) 存在未提交改动 -> 提交上一个可用的状态
$dirty = git status --porcelain
if ($dirty) {
    Write-Host '[checkpoint] 发现未提交改动，先把上一个可用状态提交:'
    $dirty | ForEach-Object { Write-Host ("  " + $_) }
    git add -A
    git commit -m $Message
    if ($LASTEXITCODE -ne 0) { Fail '快照提交失败（如缺少提交身份，先运行 git config --global user.name / user.email）' }
    Write-Host ("[checkpoint] 上一可用状态已提交: " + (git rev-parse --short HEAD) + "，现在可以开始新的编码。")
} else {
    # 3) 工作区干净 -> 上一状态已在最新提交中
    Write-Host ("[checkpoint] 工作区干净，上一可用状态已在提交 " + (git rev-parse --short HEAD) + " 中，可以直接开始新的编码，完成后请立即单独提交。")
}
