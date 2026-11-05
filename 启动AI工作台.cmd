@echo off
setlocal
chcp 65001 >nul
title 启动 AI 多平台传播工作台

if /I "%~1"=="--check" (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-workbench.ps1" -Check
) else (
  powershell.exe -NoProfile -ExecutionPolicy Bypass -File "%~dp0scripts\start-workbench.ps1"
)

set "LAUNCH_EXIT=%ERRORLEVEL%"
if not "%LAUNCH_EXIT%"=="0" if /I not "%~1"=="--check" pause
exit /b %LAUNCH_EXIT%
