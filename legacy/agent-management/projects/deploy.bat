@echo off
REM ==========================================
REM 部署脚本 - Windows
REM ==========================================

setlocal enabledelayedexpansion

if "%1"=="" goto help

REM 检查Docker是否安装
:check_docker
echo [INFO] 检查Docker是否安装...
docker --version >nul 2>&1
if errorlevel 1 (
    echo [ERROR] Docker未安装，请先安装Docker Desktop
    exit /b 1
)
echo [INFO] Docker已安装
goto :eof

REM 检查.env文件
:check_env_file
echo [INFO] 检查环境变量文件...
if not exist .env (
    echo [WARN] .env文件不存在，从.env.example复制...
    copy .env.example .env
    echo [INFO] 请编辑.env文件并填写正确的配置值
    exit /b 0
)
echo [INFO] .env文件已存在
goto :eof

REM 创建必要的目录
:create_directories
echo [INFO] 创建必要的目录...
if not exist logs mkdir logs
if not exist uploads mkdir uploads
if not exist nginx\ssl mkdir nginx\ssl
echo [INFO] 目录创建完成
goto :eof

REM 构建Docker镜像
:build_docker
echo [INFO] 构建Docker镜像...
docker-compose build --no-cache
if errorlevel 1 (
    echo [ERROR] Docker镜像构建失败
    exit /b 1
)
echo [INFO] Docker镜像构建完成
goto :eof

REM 启动服务
:start_services
echo [INFO] 启动服务...
docker-compose up -d
if errorlevel 1 (
    echo [ERROR] 服务启动失败
    exit /b 1
)
echo [INFO] 服务启动完成
goto :eof

REM 停止服务
:stop_services
echo [INFO] 停止服务...
docker-compose down
echo [INFO] 服务已停止
goto :eof

REM 重启服务
:restart_services
echo [INFO] 重启服务...
docker-compose restart
echo [INFO] 服务已重启
goto :eof

REM 查看日志
:view_logs
echo [INFO] 查看服务日志...
docker-compose logs -f
goto :eof

REM 清理资源
:cleanup
echo [INFO] 清理未使用的Docker资源...
docker system prune -f
echo [INFO] 清理完成
goto :eof

REM 显示帮助
:help
echo 用法: deploy.bat [命令]
echo.
echo 可用命令:
echo   install     - 首次安装和部署
echo   start       - 启动服务
echo   stop        - 停止服务
echo   restart     - 重启服务
echo   logs        - 查看日志
echo   build       - 重新构建镜像
echo   cleanup     - 清理Docker资源
echo   help        - 显示此帮助信息
goto :eof

REM 主函数
if "%1"=="install" (
    call :check_docker
    call :check_env_file
    call :create_directories
    call :build_docker
    call :start_services
    echo [INFO] 部署完成！访问 http://localhost:5000
) else if "%1"=="start" (
    call :check_docker
    call :start_services
) else if "%1"=="stop" (
    call :check_docker
    call :stop_services
) else if "%1"=="restart" (
    call :check_docker
    call :restart_services
) else if "%1"=="logs" (
    call :check_docker
    call :view_logs
) else if "%1"=="build" (
    call :check_docker
    call :build_docker
) else if "%1"=="cleanup" (
    call :check_docker
    call :cleanup
) else if "%1"=="help" (
    call :help
) else (
    echo [ERROR] 未知命令: %1
    call :help
    exit /b 1
)

endlocal
