<# 一键回滚到上一次正常运行的快照。
   -Mode discard : 丢弃自最近一次提交以来的所有改动（含未跟踪文件），回到最近一次提交
   -Mode last    : 在 discard 基础上，把最新一次提交一并回退（被回退的提交仍可通过 git reflog 找回）
   危险操作: 默认要求确认，加 -Force 跳过。执行前会先展示将被丢弃的内容。
   注: Windows PowerShell 5.1 会把 git 写往 stderr 的内容当错误流，因此本脚本统一按退出码判断。
   用法: powershell -ExecutionPolicy Bypass -File scripts/rollback.ps1 -Mode discard [-Force] #>
param(
    [ValidateSet('discard', 'last')]
    [string]$Mode = 'discard',
    [switch]$Force
)

$inside = git rev-parse --is-inside-work-tree 2>$null
if ($LASTEXITCODE -ne 0 -or -not $inside) {
    Write-Host '[rollback] 错误: 当前目录不是 Git 仓库。' -ForegroundColor Red
    exit 1
}
git rev-parse --verify HEAD 2>$null
if ($LASTEXITCODE -ne 0) {
    Write-Host '[rollback] 错误: 仓库里还没有任何提交，没有可回滚的快照。' -ForegroundColor Red
    exit 1
}

$head = git rev-parse --short HEAD
Write-Host ("[rollback] 当前快照(HEAD): " + $head)
if ($Mode -eq 'last') {
    Write-Host "[rollback] 将回到上一次提交(HEAD~1)，最新一次提交被回退但可通过 git reflog 找回。"
}
$dirty = git status --porcelain
if ($dirty) {
    Write-Host '[rollback] 以下未提交改动将被丢弃:'
    $dirty | ForEach-Object { Write-Host ("  " + $_) }
} else {
    Write-Host '[rollback] 没有未提交改动。'
}

if (-not $Force) {
    $ans = Read-Host '回滚会永久丢弃上述改动，确认回滚? (Y/N)'
    if ($ans -notmatch '^[Yy]') {
        Write-Host '[rollback] 已取消，未做任何修改。'
        exit 0
    }
}

git reset --hard
if ($LASTEXITCODE -ne 0) {
    Write-Host '[rollback] 错误: git reset --hard 失败。' -ForegroundColor Red
    exit 1
}
git clean -fd
if ($Mode -eq 'last') {
    git reset --hard HEAD~1
    if ($LASTEXITCODE -ne 0) {
        Write-Host '[rollback] 错误: 回退最新提交失败。' -ForegroundColor Red
        exit 1
    }
}
Write-Host ("[rollback] 完成，当前快照: " + (git rev-parse --short HEAD))
