.PHONY: install build test dev start stop logs clean deploy help

# 默认目标
.DEFAULT_GOAL := help

# 颜色
BLUE := \033[0;34m
GREEN := \033[0;32m
YELLOW := \033[1;33m
RED := \033[0;31m
NC := \033[0m

# 项目信息
PROJECT_NAME := ZAEP三省六部
VERSION := 1.0.0
BUILD_TIME := $(shell date +%Y%m%d%H%M%S)

# 打印消息
PRINT_INFO = @echo "$(BLUE)[INFO]$(NC)"
PRINT_SUCCESS = @echo "$(GREEN)[SUCCESS]$(NC)"
PRINT_WARNING = @echo "$(YELLOW)[WARNING]$(NC)"
PRINT_ERROR = @echo "$(RED)[ERROR]$(NC)"

# 依赖
NODE := $(shell command -v node 2>/dev/null)
NPM := $(shell command -v npm 2>/dev/null)
DOCKER := $(shell command -v docker 2>/dev/null)
DOCKER_COMPOSE := $(shell command -v docker-compose 2>/dev/null)

.PHONY: help
help: ## 显示帮助信息
	@echo ""
	@echo "$(BLUE)======================================"
	@echo "$(BLUE)  $(PROJECT_NAME) - Makefile"
	@echo "$(BLUE)======================================"
	@echo ""
	@echo "$(GREEN)用法: make [目标]"
	@echo ""
	@echo "$(YELLOW)可用的目标："
	@echo "  install         - 安装依赖"
	@echo "  build           - 构建应用"
	@echo "  test             - 运行测试"
	@echo "  dev              - 启动开发服务器"
	@echo "  start            - 启动生产服务"
	@echo "  stop             - 停止服务"
	@echo "  logs             - 查看日志"
	@echo "  clean            - 清理构建文件"
	@echo "  deploy           - 部署服务"
	@echo "  package          - 打包应用"
	@echo "  help             - 显示此帮助"
	@echo ""
	@echo "$(YELLOW)环境变量："
	@echo "  BUILD_ENV=dev|staging|prod  - 构建环境 (默认: dev)"
	@echo "  ENV_FILE=...                 - 环境变量文件"
	@echo ""
	@echo "$(YELLOW)示例："
	@echo "  make dev BUILD_ENV=dev"
	@echo "  make deploy BUILD_ENV=prod"
	@echo ""

.PHONY: install
install: ## 安装依赖
	@$(PRINT_INFO) 检查Node.js...
ifndef NODE
	$(error) Node.js未安装，请先安装Node.js 18+
else
	@$(PRINT_SUCCESS) Node.js版本: $(shell node -v)"
endif

	@$(PRINT_INFO) 安装NPM依赖...
	npm install

	@$(PRINT_SUCCESS) 依赖安装完成

.PHONY: build
build: ## 构建应用
	@$(PRINT_INFO) 检查Node.js...
ifndef NODE
	$(error) Node.js未安装，请先运行 make install
endif

	@$(PRINT_INFO) 设置构建环境: $(BUILD_ENV)
	$(eval export BUILD_ENV=$(BUILD_ENV))

	@$(PRINT_INFO) 构建应用...
	npm run build

	@$(PRINT_SUCCESS) 构建完成

.PHONY: test
test: ## 运行测试
	@$(PRINT_INFO) 运行测试...
	npm run test

.PHONY: dev
dev: ## 启动开发服务器
	@$(PRINT_INFO) 检查Node.js...
ifndef NODE
	$(error) Node.js未安装，请先运行 make install
endif

	@$(PRINT_INFO) 启动开发服务器...
	npm run dev

.PHONY: start
start: ## 启动生产服务
	@$(PRINT_INFO) 检查Docker...
ifndef DOCKER
	$(error) Docker未安装，请先安装Docker
endif

	@$(PRINT_INFO) 启动生产服务...
	docker-compose -f docker-compose.yml up -d

	@$(PRINT_INFO) 等待服务就绪...
	sleep 10

	@$(PRINT_INFO) 执行健康检查...
	curl -f http://localhost:3000/api/health || echo "服务可能未就绪"

	@$(PRINT_SUCCESS) 服务启动完成
	@echo ""
	@echo "访问地址:"
	@echo "  应用: http://localhost:3000"
	@echo "  仪表盘: http://localhost:3000/dashboard"

.PHONY: stop
stop: ## 停止服务
	@$(PRINT_INFO) 停止服务...
	docker-compose down

	@$(PRINT_SUCCESS) 服务已停止

.PHONY: logs
logs: ## 查看日志
	@$(PRINT_INFO) 显示应用日志...
	docker-compose logs -f app

.PHONY: clean
clean: ## 清理构建文件
	@$(PRINT_INFO) 清理构建文件...
	rm -rf .next
	rm -rf node_modules/.cache
	rm -rf build

	@$(PRINT_SUCCESS) 清理完成

.PHONY: deploy
deploy: ## 部署服务（快捷方式）
	@$(PRINT_INFO) 使用一键部署脚本...
	./deploy.sh $(BUILD_ENV:deploy)

.PHONY: package
package: ## 打包应用
	@$(PRINT_INFO) 打包应用...

	# 创建打包目录
	@mkdir -p dist

	# 复制应用文件
	@cp -r .next dist/
	@cp -r node_modules dist/
	@cp -r public dist/
	@cp package.json dist/
	@cp package-lock.json dist/
	@cp docker-compose.yml dist/
	@cp Dockerfile dist/
	@cp deploy.sh dist/

	# 创建版本文件
	@echo "$(PROJECT_NAME) v$(VERSION)" > dist/VERSION
	@echo "构建时间: $(BUILD_TIME)" >> dist/VERSION
	@echo "环境: $(BUILD_ENV)" >> dist/VERSION

	# 打包
	@cd dist && tar czf zaep-v$(VERSION)-$(BUILD_ENV)-$(BUILD_TIME).tar.gz . && cd ..

	@$(PRINT_SUCCESS) 打包完成: dist/zaep-v$(VERSION)-$(BUILD_ENV)-$(BUILD_TIME).tar.gz

.PHONY: check-env
check-env: ## 检查环境
	@$(PRINT_INFO) 检查环境...

	@echo "$(BLUE)环境信息:"
	@echo "  Node.js: $(shell node -v)"
	@echo "  npm: $(shell npm -v)"
	@echo "  Docker: $(shell docker -v)"
	@echo "  Docker Compose: $(shell docker-compose -v)"

.PHONY: check-deps
check-deps: ## 检查依赖
	@$(PRINT_INFO) 检查依赖...

	@$(PRINT_INFO) 检查必需的依赖..."
	@command -v node >/dev/null 2>&1 || (echo "❌ Node.js未安装" && exit 1)
	@command -v npm >/dev/null 2>&1 || (echo "❌ npm未安装" && exit 1)
	@command -v docker >/dev/null 2>&1 || (echo "❌ Docker未安装" && exit 1)
	@command -v docker-compose >/dev/null 2>&1 || (echo "❌ Docker Compose未安装" && exit 1)

	@$(PRINT_SUCCESS) 所有依赖已安装

.PHONY: init
init: ## 初始化项目
	@$(PRINT_INFO) 初始化项目...

	@$(PRINT_INFO) 复制环境变量文件...
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		$(PRINT_WARNING) .env.local 已创建，请编辑此文件; \
	fi

	@$(PRINT_INFO) 安装依赖...
	npm install

	@$(PRINT_INFO) 生成Prisma客户端...
	npx prisma generate

	@$(PRINT_INFO) 创建数据库...
	docker-compose -f docker-compose.yml up -d postgres redis

	@$(PRINT_SUCCESS) 项目初始化完成
	@echo ""
	@echo "下一步："
	@echo "  1. 编辑 .env.local 文件"
	@echo "  2. 运行 make build"
	@echo "  3. 运行 make dev 或 make start"

.PHONY: db-push
db-push: ## 推送数据库模式
	@$(PRINT_INFO) 推送数据库模式...
	npx prisma db push

.PHONY: db-seed
db-seed: ## 填充数据库
	@$(PRINT_INFO) 填充数据库...
	npx prisma db seed

.PHONY: db-reset
db-reset: db-push db-seed ## 重置数据库

.PHONY: docker-build
docker-build: ## 构建Docker镜像
	@$(PRINT_INFO) 构建Docker镜像...
	docker-compose build

.PHONY: docker-up
docker-up: ## 启动Docker服务
	@$(PRINT_INFO) 启动Docker服务...
	docker-compose up -d

.PHONY: docker-down
docker-down: ## 停止Docker服务
	@$(PRINT_INFO) 停止Docker服务...
	docker-compose down

.PHONY: docker-logs
docker-logs: ## 查看Docker日志
	@$(PRINT_INFO) 查看Docker日志...
	docker-compose logs -f

.PHONY: docker-restart
docker-restart: ## 重启Docker服务
	@$(PRINT_INFO) 重启Docker服务...
	docker-compose restart

.PHONY: docker-clean
docker-clean: ## 清理Docker资源
	@$(PRINT_INFO) 清理Docker资源...
	docker-compose down -v
	docker system prune -f

.PHONY: docker-ps
docker-ps: ## 查看Docker容器状态
	@$(PRINT_INFO) 查看Docker容器状态...
	docker-compose ps

.PHONY: update-deps
update-deps: ## 更新依赖
	@$(PRINT_INFO) 检查更新...
	npm outdated

	@$(PRINT_INFO) 更新依赖...
	npm update

	@$(PRINT_SUCCESS) 依赖已更新

.PHONY: outdated
outdated: ## 检查过时的依赖
	@$(PRINT_INFO) 检查过时的依赖...
	npm outdated

.PHONY: lint
lint: ## 运行代码检查
	@$(PRINT_INFO) 运行代码检查...
	npm run lint

.PHONY: format
format: ## 格式化代码
	@$(PRINT_INFO) 格式化代码...
	npm run format

.PHONY: type-check
type-check: ## 运行类型检查
	@$(PRINT_INFO) 运行类型检查...
	npm run type-check

.PHONY: setup
setup: init check-deps build ## 完整的初始化

.PHONY: quickstart
quickstart: init build db-push start ## 快速启动

.PHONY: prod-build
prod-build: ## 生产环境构建
	@$(MAKE) BUILD_ENV=production build

.PHONY: prod-deploy
prod-deploy: ## 生产环境部署
	@$(MAKE) BUILD_ENV=production deploy

.PHONY: dev-deploy
dev-deploy: ## 开发环境部署
	@$(MAKE) BUILD_ENV=dev deploy

.PHONY: health
health: ## 健康检查
	@$(PRINT_INFO) 执行健康检查...
	@curl -f http://localhost:3000/api/health && $(PRINT_SUCCESS) 服务健康 || $(PRINT_ERROR) 服务不健康

.PHONY: status
status: ## 查看服务状态
	@$(PRINT_INFO) 查看服务状态...
	@$(MAKE) docker-ps health

.PHONY: backup
backup: ## 备份数据库
	@$(PRINT_INFO) 备份数据库...
	@mkdir -p backups
	@docker exec zaep-postgres pg_dump -U zaep zaep > backups/zaep-backup-$(shell date +%Y%m%d%H%M%S).sql

.PHONY: restore
restore: ## 恢复数据库
	@$(PRINT_INFO) 恢复数据库...
	@read -p "输入备份文件路径: " file; \
	cat "$$file" | docker exec -i zaep-postgres psql -U zaep zaep

.PHONY: verify
verify: install test lint type-check ## 验证代码
