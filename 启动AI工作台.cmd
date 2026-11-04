@echo off
setlocal
chcp 65001 >nul

set "APP_DIR=%~dp0ai-workbench"
set "WORKBENCH_URL=http://localhost:3000"

title 启动 AI 多平台传播工作台

if not exist "%APP_DIR%\package.json" (
  echo [错误] 未找到工作台目录：%APP_DIR%
  echo 请确认本文件仍位于 expert team 文件夹根目录。
  pause
  exit /b 1
)

where node.exe >nul 2>nul
if errorlevel 1 (
  echo [错误] 未检测到 Node.js。
  echo 请先安装 Node.js，再双击本文件。
  pause
  exit /b 1
)

set "BROWSER_EXE="
if exist "%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%ProgramFiles%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%LocalAppData%\Microsoft\Edge\Application\msedge.exe" set "BROWSER_EXE=%LocalAppData%\Microsoft\Edge\Application\msedge.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%ProgramFiles(x86)%\Google\Chrome\Application\chrome.exe"
if not defined BROWSER_EXE if exist "%LocalAppData%\Google\Chrome\Application\chrome.exe" set "BROWSER_EXE=%LocalAppData%\Google\Chrome\Application\chrome.exe"

if not defined BROWSER_EXE (
  echo [错误] 未找到 Edge 或 Chrome，因此没有打开其他浏览器。
  echo 请安装 Edge 或 Chrome 后重新双击本文件。
  pause
  exit /b 1
)

if /i "%~1"=="--check" (
  echo 启动器检查通过。
  exit /b 0
)

if not exist "%APP_DIR%\node_modules" (
  echo 首次启动，正在安装依赖，请稍候……
  pushd "%APP_DIR%"
  call npm install
  if errorlevel 1 (
    popd
    echo [错误] 依赖安装失败，请检查网络后重试。
    pause
    exit /b 1
  )
  popd
)

echo 正在启动工作台……
start "AI Workbench Server" /D "%APP_DIR%" cmd.exe /k "npm run dev"

powershell.exe -NoProfile -ExecutionPolicy Bypass -Command "$deadline=(Get-Date).AddSeconds(45); while((Get-Date)-lt $deadline) { try { $client=[Net.Sockets.TcpClient]::new(); $client.Connect('127.0.0.1',3000); $client.Dispose(); exit 0 } catch { Start-Sleep -Milliseconds 500 } }; exit 1"

if errorlevel 1 (
  echo [提示] 工作台启动时间较长，请查看新打开的服务窗口。
  echo 服务就绪后可访问：%WORKBENCH_URL%
  pause
)

start "" "%BROWSER_EXE%" "%WORKBENCH_URL%"

:done
echo 工作台已打开。服务窗口保持运行即可。
timeout /t 2 /nobreak >nul
endlocal
