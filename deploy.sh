#!/bin/bash

# ZAEP 三省六部 - 一键部署脚本
# 使用方法: ./deploy.sh [dev|staging|prod]

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# 配置
ENV=${1:-dev}
PROJECT_NAME="zaep"
CONTAINER_NAME="zaep-app"
POSTGRES_CONTAINER="zaep-postgres"
REDIS_CONTAINER="zaep-redis"

# 打印带颜色的消息
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# 检查依赖
check_dependencies() {
    log_info "检查依赖..."

    # 检查Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker未安装，请先安装Docker"
        exit 1
    fi

    # 检查Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose未安装，请先安装Docker Compose"
        exit 1
    fi

    # 检查Node.js
    if ! command -v node &> /dev/null; then
        log_error "Node.js未安装，请先安装Node.js 18+"
        exit 1
    fi

    log_success "所有依赖检查通过"
}

# 检查环境变量
check_env_vars() {
    log_info "检查环境变量..."

    local env_file=".env.${ENV}"

    if [ ! -f "$env_file" ]; then
        log_warning "环境变量文件 $env_file 不存在"
        log_warning "将使用默认配置"
    else
        log_success "环境变量文件 $env_file 已加载"
    fi
}

# 构建应用
build_app() {
    log_info "构建应用..."

    # 安装依赖
    log_info "安装NPM依赖..."
    npm install --silent

    # 构建Next.js应用
    log_info "构建Next.js应用..."
    npm run build --silent

    log_success "应用构建完成"
}

# 数据库迁移
run_migrations() {
    log_info "运行数据库迁移..."

    # 生成Prisma客户端
    log_info "生成Prisma客户端..."
    npx prisma generate

    # 推送数据库迁移
    log_info "推送数据库迁移..."
    npx prisma db push

    log_success "数据库迁移完成"
}

# 启动服务
start_services() {
    log_info "启动服务..."

    # 停止旧容器
    log_info "停止旧容器..."
    docker-compose down 2>/dev/null || true

    # 启动服务
    log_info "启动服务..."
    docker-compose up -d

    log_success "服务启动完成"
}

# 等待服务就绪
wait_for_services() {
    log_info "等待服务就绪..."

    local max_attempts=60
    local attempt=0

    while [ $attempt -lt $max_attempts ]; do
        # 检查应用是否就绪
        if curl -s http://localhost:3000/api/health > /dev/null 2>&1; then
            log_success "应用服务就绪"
            return
        fi

        attempt=$((attempt + 1))
        echo -n "."
        sleep 2
    done

    echo ""
    log_error "服务启动超时"
    docker-compose logs app
    exit 1
}

# 健康检查
health_check() {
    log_info "执行健康检查..."

    # 检查应用
    local app_status=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3000/api/health)
    if [ "$app_status" = "200" ]; then
        log_success "应用服务健康"
    else
        log_warning "应用服务可能不健康 (HTTP $app_status)"
    fi

    # 检查PostgreSQL
    local postgres_running=$(docker ps --filter "name=$POSTGRES_CONTAINER" --format "{{.Status}}" | head -1)
    if [ "$postgres_running" = "Up" ]; then
        log_success "PostgreSQL服务健康"
    else
        log_warning "PostgreSQL服务未运行"
    fi

    # 检查Redis
    local redis_running=$(docker ps --filter "name=$REDIS_CONTAINER" --format "{{.Status}}" | head -1)
    if [ "$redis_running" = "Up" ]; then
        log_success "Redis服务健康"
    else
        log_warning "Redis服务未运行"
    fi
}

# 显示访问信息
show_access_info() {
    log_info "访问信息:"
    echo ""
    echo -e "${GREEN}  应用地址:${NC}  http://localhost:3000"
    echo -e "${GREEN}  管理面板:${NC}  http://localhost:3000/dashboard"
    echo -e "${GREEN}  API文档:${NC}   http://localhost:3000/api/docs"
    echo ""
    echo -e "${BLUE}  管理命令:${NC}"
    echo "  docker-compose logs -f app    查看应用日志"
    echo "  docker-compose logs -f postgres  查看数据库日志"
    echo "  docker-compose down          停止所有服务"
    echo "  docker-compose restart        重启所有服务"
    echo ""
    echo -e "${YELLOW}  默认登录信息:${NC}"
    echo "  用户名: admin@zaep.com"
    echo "  密码: admin123"
    echo ""
}

# 清理
cleanup() {
    log_info "清理旧容器和镜像..."
    docker-compose down
    docker system prune -f
    log_success "清理完成"
}

# 完全重新部署
rebuild() {
    log_info "完全重新部署..."

    # 停止并清理
    docker-compose down
    docker system prune -f

    # 重新构建
    build_app
    run_migrations

    # 启动服务
    start_services
    wait_for_services
    health_check
    show_access_info
}

# 主函数
main() {
    log_info "====================================="
    log_info "ZAEP 三省六部 - 一键部署脚本"
    log_info "环境: $ENV"
    log_info "======================================="
    echo ""

    # 解析命令行参数
    case "${1:-deploy}" in
        deploy)
            check_dependencies
            check_env_vars
            build_app
            run_migrations
            start_services
            wait_for_services
            health_check
            show_access_info
            ;;
        rebuild)
            rebuild
            ;;
        start)
            start_services
            wait_for_services
            show_access_info
            ;;
        stop)
            log_info "停止服务..."
            docker-compose down
            log_success "服务已停止"
            ;;
        logs)
            docker-compose logs -f app
            ;;
        status)
            health_check
            ;;
        clean)
            cleanup
            ;;
        *)
            echo "使用方法: $0 [deploy|rebuild|start|stop|logs|status|clean]"
            echo ""
            echo "命令:"
            echo "  deploy   - 部署应用（默认）"
            echo "  rebuild  - 完全重新部署"
            echo "  start    - 启动服务"
            echo "  stop     - 停止服务"
            echo "  logs     - 查看应用日志"
            echo "  status   - 查看服务状态"
            echo "  clean    - 清理旧容器"
            echo ""
            echo "环境: $0 [dev|staging|prod] [deploy|rebuild|...]"
            exit 1
            ;;
    esac

    log_info "======================================="
    log_success "部署完成！"
    log_info "======================================="
}

# 捕获退出信号
trap 'log_error "部署被中断"; exit 1' INT TERM

# 运行主函数
main "$@"
