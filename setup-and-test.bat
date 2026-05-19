@echo off
chcp 65001 >nul
echo ========================================
echo   yourResume 依赖安装 & 测试脚本
echo ========================================
echo.

cd /d "%~dp0frontend"

echo [0/4] 清理旧的 node_modules...
if exist node_modules_broken rmdir /s /q node_modules_broken
if exist node_modules rmdir /s /q node_modules
echo 清理完成。
echo.

echo [1/4] 安装依赖...
call npm install
if %errorlevel% neq 0 (
    echo 依赖安装失败！请检查网络连接。
    pause
    exit /b 1
)
echo 依赖安装完成。
echo.

echo [2/4] 安装 Playwright Chromium...
call npx playwright install chromium
if %errorlevel% neq 0 (
    echo Playwright 安装失败，但测试可以继续（仅影响系统测试）。
)
echo.

echo [3/4] TypeScript 类型检查...
call npm run typecheck
call npm run typecheck:tests
if %errorlevel% neq 0 (
    echo 类型检查失败！请修复类型错误后重试。
    pause
    exit /b 1
)
echo 类型检查通过。
echo.

echo [4/4] 运行全部测试...
call npm run test
echo.

echo ========================================
echo   完成！
echo   单元/集成测试已运行。
echo   运行系统测试：npm run test:system
echo ========================================
pause
