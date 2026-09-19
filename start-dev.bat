@echo off
setlocal EnableExtensions
cd /d "%~dp0"

set "NODE_EXE=node"
where node >nul 2>nul
if errorlevel 1 (
  if exist "C:\Program Files\nodejs\node.exe" (
    set "NODE_EXE=C:\Program Files\nodejs\node.exe"
  ) else (
    echo [error] Node.js not found. Install Node 18+ or add it to PATH.
    exit /b 1
  )
)

echo [1/2] Generating content index...
"%NODE_EXE%" scripts\generate-content-index.mjs
if errorlevel 1 (
  echo [error] content index generation failed.
  exit /b 1
)

if not exist "node_modules\@rsbuild\core\bin\rsbuild.js" (
  echo [error] Dependencies missing. Run: pnpm install
  exit /b 1
)

echo [2/2] Starting Rsbuild dev server on http://localhost:3000 ...
"%NODE_EXE%" node_modules\@rsbuild\core\bin\rsbuild.js dev
