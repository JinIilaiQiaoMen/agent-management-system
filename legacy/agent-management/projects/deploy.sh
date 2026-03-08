#!/bin/bash

# ==========================================
# 部署脚本 - Linux/Mac
# ==========================================

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# 函数：打印信息
info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查Docker是否安装
check_docker() {
    info "检查Docker是否安装..."
    if ! command -v docker &> /dev/null; then
        error "Docker未安装，请先安装Docker"
        exit 1
    fi
    info "Docker已安装: $(docker --version)"
}

# 检查Docker Compose是否安装
check_docker_compose() {
    info "检查Docker Compose是否安装..."
    if ! command -v docker-compose &> /dev/null; then
        warn "Docker Compose未安装，将使用Docker Compose V2"
    else
        info "Docker Compose已安装: $(docker-compose --version)"
    fi
}

# 检查.env文件
check_env_file() {
    info "检查环境变量文件..."
    if [ ! -f .env ]; then
        warn ".env文件不存在，从.env.example复制..."
        cp .env.example .env
        info "请编辑.env文件并填写正确的配置值"
        exit 0
    fi
    info ".env文件已存在"
}

# 创建必要的目录
create_directories() {
    info "创建必要的目录..."
    mkdir -p logs
    mkdir -p uploads
    mkdir -p nginx/ssl
    info "目录创建完成"
}

# 构建Docker镜像
build_docker() {
    info "构建Docker镜像..."
    docker-compose build --no-cache
    info "Docker镜像构建完成"
}

# 启动服务
start_services() {
    info "启动服务..."
    docker-compose up -d
    info "服务启动完成"
}

# 停止服务
stop_services() {
    info "停止服务..."
    docker-compose down
    info "服务已停止"
}

# 查看日志
view_logs() {
    info "查看服务日志..."
    docker-compose logs -f
}

# 重启服务
restart_services() {
    info "重启服务..."
    docker-compose restart
    info "服务已重启"
}

# 更新服务
update_services() {
    info "更新服务..."
    git pull origin main
    docker-compose down
    build_docker
    start_services
    info "服务更新完成"
}

# 备份数据库
backup_database() {
    info "备份数据库..."
    BACKUP_DIR="./backups/$(date +%Y%m%d_%H%M%S)"
    mkdir -p "$BACKUP_DIR"
    docker-compose exec -T postgres pg_dump -U postgres agent_management > "$BACKUP_DIR/backup.sql"
    info "数据库备份完成: $BACKUP_DIR/backup.sql"
}

# 恢复数据库
restore_database() {
    if [ -z "$1" ]; then
        error "请指定备份文件路径"
        exit 1
    fi
    info "恢复数据库..."
    docker-compose exec -T postgres psql -U postgres agent_management < "$1"
    info "数据库恢复完成"
}

# 清理资源
cleanup() {
    info "清理未使用的Docker资源..."
    docker system prune -f
    info "清理完成"
}

# 显示帮助
show_help() {
    echo "用法: ./deploy.sh [命令]"
    echo ""
    echo "可用命令:"
    echo "  install     - 首次安装和部署"
    echo "  start       - 启动服务"
    echo "  stop        - 停止服务"
    echo "  restart     - 重启服务"
    echo "  logs        - 查看日志"
    echo "  build       - 重新构建镜像"
    echo "  update      - 更新服务（git pull + 重新构建）"
    echo "  backup      - 备份数据库"
    echo "  restore     - 恢复数据库"
    echo "  cleanup     - 清理Docker资源"
    echo "  help        - 显示此帮助信息"
}

# 主函数
main() {
    case "$1" in
        install)
            check_docker
            check_docker_compose
            check_env_file
            create_directories
            build_docker
            start_services
            info "部署完成！访问 http://localhost:5000"
            ;;
        start)
            check_docker
            start_services
            ;;
        stop)
            check_docker
            stop_services
            ;;
        restart)
            check_docker
            restart_services
            ;;
        logs)
            check_docker
            view_logs
            ;;
        build)
            check_docker
            build_docker
            ;;
        update)
            check_docker
            update_services
            ;;
        backup)
            check_docker
            backup_database
            ;;
        restore)
            check_docker
            restore_database "$2"
            ;;
        cleanup)
            check_docker
            cleanup
            ;;
        help|--help|-h)
            show_help
            ;;
        *)
            error "未知命令: $1"
            show_help
            exit 1
            ;;
    esac
}

# 执行主函数
main "$@"
