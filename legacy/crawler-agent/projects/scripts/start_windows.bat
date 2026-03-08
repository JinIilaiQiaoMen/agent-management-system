@echo off
REM Web爬虫控制台 - Windows启动脚本
REM 使用方法: 双击运行此文件

echo ========================================
echo   Web爬虫控制台 - 启动中...
echo ========================================
echo.

REM 检查Python环境
python --version >nul 2>&1
if errorlevel 1 (
    echo [错误] 未找到Python，请先安装Python 3.8+
    pause
    exit /b 1
)

echo [1/4] 检查Python环境... OK
echo.

REM 检查虚拟环境
if not exist ".venv\Scripts\activate.bat" (
    echo [警告] 未找到虚拟环境，创建中...
    python -m venv .venv
    echo [信息] 虚拟环境创建完成
    echo.
)

REM 激活虚拟环境
call .venv\Scripts\activate.bat
echo [2/4] 激活虚拟环境... OK
echo.

REM 安装依赖
echo [3/4] 安装依赖包...
pip install -r requirements.txt --quiet
if errorlevel 1 (
    echo [错误] 依赖安装失败，请检查网络连接
    pause
    exit /b 1
)

echo [信息] 依赖安装完成
echo.

REM 安装Playwright浏览器
echo [信息] 检查Playwright浏览器...
playwright install chromium --quiet
echo.

REM 启动Web服务
echo [4/4] 启动Web服务...
echo.
echo ========================================
echo   服务地址: http://localhost:5000
echo   按Ctrl+C停止服务
echo ========================================
echo.

cd web_ui
python app.py

pause
