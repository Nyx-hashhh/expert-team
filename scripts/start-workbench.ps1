param([switch]$Check)

$ErrorActionPreference = 'Stop'

try {
    $appDir = Join-Path (Split-Path $PSScriptRoot -Parent) 'ai-workbench'
    $manifest = Join-Path $appDir 'package.json'
    $lockfile = Join-Path $appDir 'package-lock.json'
    if (-not (Test-Path $manifest) -or -not (Test-Path $lockfile)) {
        throw "Workbench files are missing from $appDir"
    }

    # Explorer and Codex may keep an older PATH after Node.js is installed.
    # Agent-injected toolchains (e.g. .workbuddy\binaries) must be excluded first:
    # their npm ships a safe-delete shim that aborts `npm ci` on bulk node_modules deletion,
    # and the bundled Node version may be too old for some packages (html2canvas-pro needs >=24).
    $pathEntries = @(
        $env:Path,
        [Environment]::GetEnvironmentVariable('Path', 'User'),
        [Environment]::GetEnvironmentVariable('Path', 'Machine')
    ) | ForEach-Object { ($_ -split ';') } | Where-Object { $_ -and $_ -notlike '*\.workbuddy\binaries*' }
    $env:Path = ($pathEntries | Select-Object -Unique) -join ';'

    # 同一会话可能注入大小写重复的代理变量（HTTP_PROXY/http_proxy），
    # 会让 Start-Process 抛「重复键」异常导致 dev server 静默失败。统一规范成一条。
    $proxyGroups = @{
        http_proxy  = @('HTTP_PROXY', 'http_proxy')
        https_proxy = @('HTTPS_PROXY', 'https_proxy')
        all_proxy   = @('ALL_PROXY', 'all_proxy')
        no_proxy    = @('NO_PROXY', 'no_proxy')
    }
    foreach ($group in $proxyGroups.GetEnumerator()) {
        $value = $null
        foreach ($variant in $group.Value) {
            $v = [Environment]::GetEnvironmentVariable($variant, 'Process')
            if ($v) { if (-not $value) { $value = $v } }
            [Environment]::SetEnvironmentVariable($variant, $null, 'Process')
        }
        if ($value) { [Environment]::SetEnvironmentVariable($group.Key, $value, 'Process') }
    }
    # 清除 agent 会话注入的 Node 全局项，避免影响 dev server 解析依赖
    Remove-Item Env:NODE_OPTIONS -ErrorAction SilentlyContinue
    Remove-Item Env:NODE_PATH -ErrorAction SilentlyContinue

    $npm = Get-Command npm.cmd -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    $nodeAlongsideNpm = if ($npm) { Join-Path (Split-Path $npm.Source -Parent) 'node.exe' } else { '' }
    $nodeCommand = Get-Command node.exe -CommandType Application -ErrorAction SilentlyContinue | Select-Object -First 1
    $nodePath = if ($nodeAlongsideNpm -and (Test-Path $nodeAlongsideNpm)) { $nodeAlongsideNpm } elseif ($nodeCommand) { $nodeCommand.Source } else { '' }
    if (-not $nodePath -or -not $npm) {
        throw 'Node.js with npm is required. Install Node.js LTS, then open this launcher again.'
    }

    if ($Check) {
        Write-Host "Launcher check passed. Node: $nodePath; npm: $($npm.Source)"
        exit 0
    }

    $modulesDir = Join-Path $appDir 'node_modules'
    $marker = Join-Path $modulesDir '.workbench-lock.sha256'
    $sha256 = [System.Security.Cryptography.SHA256]::Create()
    $lockStream = [System.IO.File]::OpenRead($lockfile)
    try {
        $lockHash = [BitConverter]::ToString($sha256.ComputeHash($lockStream)).Replace('-', '')
    } finally {
        $lockStream.Dispose()
        $sha256.Dispose()
    }
    $savedHash = if (Test-Path $marker) { (Get-Content $marker -Raw).Trim() } else { '' }
    if (-not (Test-Path (Join-Path $modulesDir 'next\dist\bin\next')) -or $savedHash -ne $lockHash) {
        Write-Host 'Installing or updating workbench dependencies...'
        Push-Location $appDir
        try {
            & $npm.Source ci --prefer-offline --no-audit --no-fund
            if ($LASTEXITCODE -ne 0) { throw 'npm ci failed. Check the network and try again.' }
        } finally {
            Pop-Location
        }
        Set-Content -Path $marker -Value $lockHash -NoNewline
    }

    $port = $null
    $reuse = $false
    foreach ($candidate in 3000..3010) {
        $listener = Get-NetTCPConnection -State Listen -LocalPort $candidate -ErrorAction SilentlyContinue | Select-Object -First 1
        if (-not $listener) {
            $port = $candidate
            break
        }
        $processInfo = Get-CimInstance Win32_Process -Filter "ProcessId=$($listener.OwningProcess)" -ErrorAction SilentlyContinue
        if ($processInfo -and $processInfo.CommandLine -like "*$appDir*") {
            $port = $candidate
            $reuse = $true
            break
        }
    }
    if (-not $port) { throw 'Ports 3000-3010 are busy. Close another local server and retry.' }

    $url = "http://localhost:$port"
    if (-not $reuse) {
        $nextCli = Join-Path $modulesDir 'next\dist\bin\next'
        $logDir = Join-Path $appDir '.next'
        New-Item -ItemType Directory -Path $logDir -Force | Out-Null
        $stdout = Join-Path $logDir 'workbench.stdout.log'
        $stderr = Join-Path $logDir 'workbench.stderr.log'
        Write-Host "Starting workbench at $url ..."
        Start-Process -FilePath $nodePath -ArgumentList @("`"$nextCli`"", 'dev', '--hostname', '127.0.0.1', '--port', "$port") -WorkingDirectory $appDir -WindowStyle Hidden -RedirectStandardOutput $stdout -RedirectStandardError $stderr | Out-Null
    } else {
        Write-Host "Using running workbench at $url ..."
    }

    $ready = $false
    $deadline = (Get-Date).AddSeconds(90)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -eq 200) { $ready = $true; break }
        } catch { Start-Sleep -Milliseconds 750 }
    }
    if (-not $ready) {
        throw "Workbench did not become ready at $url. Check ai-workbench\.next\workbench.stderr.log"
    }

    Start-Process $url
    Write-Host "Workbench opened: $url"
    exit 0
} catch {
    Write-Host "[ERROR] $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}
