@echo off
REM ComfyUI 启动脚本 (Windows)

echo ==========================================
echo   ComfyUI 启动脚本
echo ==========================================
echo.

cd /d "%~dp0"
if not exist "venv\Scripts\activate.bat" (
    echo 错误：虚拟环境不存在，请先运行安装脚本
    pause
    exit /b 1
)

echo 激活虚拟环境...
call venv\Scripts\activate.bat

echo.
echo 启动 ComfyUI 服务...
echo.
echo 访问地址: http://localhost:8188
echo 按 Ctrl+C 停止服务
echo.

python main.py --listen 0.0.0.0 --port 8188 --enable-cors-header "*"

pause
