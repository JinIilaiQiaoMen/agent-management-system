@echo off
REM 一键安装脚本（Windows）

chcp 65001 >nul
echo ======================================
echo   智能Web爬虫控制系统 - 一键安装
echo ======================================
echo.

REM 检查 Python 版本
echo 📌 检查 Python 版本...
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python 未安装，请先安装 Python 3.8 或更高版本
    echo 下载地址: https://www.python.org/downloads/
    pause
    exit /b 1
)

for /f "tokens=2" %%i in ('python --version 2^>^&1') do set PYTHON_VERSION=%%i
echo ✅ Python 版本: %PYTHON_VERSION%

REM 检查 pip
echo.
echo 📌 检查 pip...
pip --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ pip 未安装，请重新安装 Python 并确保勾选 "Add Python to PATH"
    pause
    exit /b 1
)

echo ✅ pip 已安装

REM 询问是否创建虚拟环境
echo.
set /p create_venv="是否创建虚拟环境？推荐使用 (y/n): "
if /i "%create_venv%"=="y" (
    echo.
    echo 📌 创建虚拟环境...
    python -m venv venv
    echo ✅ 虚拟环境创建成功

    echo.
    echo 📌 激活虚拟环境...
    call venv\Scripts\activate.bat
    echo ✅ 虚拟环境已激活
)

REM 升级 pip
echo.
echo 📌 升级 pip...
python -m pip install --upgrade pip

REM 安装依赖
echo.
echo 📌 安装项目依赖...
echo    这可能需要几分钟，请耐心等待...
pip install -r requirements.txt

if %errorlevel% neq 0 (
    echo ❌ 依赖安装失败
    pause
    exit /b 1
)

echo ✅ 依赖安装成功

REM 安装 Playwright 浏览器
echo.
echo 📌 安装 Playwright 浏览器...
set /p install_playwright="是否安装 Playwright 浏览器？用于处理动态网页 (y/n): "
if /i "%install_playwright%"=="y" (
    echo    正在安装 Chromium 浏览器...
    playwright install chromium

    if %errorlevel% neq 0 (
        echo ❌ Playwright 浏览器安装失败
        echo    可以稍后手动安装: playwright install chromium
    ) else (
        echo ✅ Playwright 浏览器安装成功
    )
) else (
    echo ⚠️  已跳过 Playwright 浏览器安装
    echo    如需使用，请运行: playwright install chromium
)

REM 创建必要目录
echo.
echo 📌 创建项目目录...
if not exist downloads mkdir downloads
if not exist data mkdir data
if not exist logs mkdir logs
echo ✅ 目录创建成功

REM 复制环境配置文件
echo.
echo 📌 配置环境变量...
if not exist .env (
    if exist .env.example (
        copy .env.example .env >nul
        echo ✅ 已创建 .env 配置文件
        echo    可以根据需要修改 .env 文件
    )
) else (
    echo ⚠️  .env 文件已存在，跳过创建
)

REM 运行环境检查
echo.
echo 📌 运行环境检查...
python check_env.py

REM 完成提示
echo.
echo ======================================
echo 🎉 安装完成！
echo ======================================
echo.
echo 启动方式:
echo   一键启动: start_windows.bat
echo   手动启动: python web_ui\app.py
echo.
echo 访问地址: http://localhost:5000
echo.
echo 其他命令:
echo   环境检查: python check_env.py
echo   运行测试: python test_sina_news_improved.py
echo.

pause
