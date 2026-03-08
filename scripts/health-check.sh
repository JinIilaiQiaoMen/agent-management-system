#!/bin/bash
# ZAEP 健康检查脚本
# 每30分钟执行一次

PROJECT_DIR="/workspace/projects/workspace/zaep/projects"
LOG_FILE="/tmp/zaep-health-check.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

echo "[$TIMESTAMP] 开始健康检查..." >> $LOG_FILE

cd $PROJECT_DIR

# 1. 检查项目目录是否存在
if [ ! -d "$PROJECT_DIR" ]; then
    echo "[$TIMESTAMP] ❌ 错误：项目目录不存在" >> $LOG_FILE
    exit 1
fi

# 2. 检查 node_modules 是否存在
if [ ! -d "node_modules" ]; then
    echo "[$TIMESTAMP] ⚠️ 警告：node_modules 不存在，需要安装依赖" >> $LOG_FILE
fi

# 3. 类型检查
echo "[$TIMESTAMP] 执行类型检查..." >> $LOG_FILE
if pnpm tsc --noEmit 2>&1 | tee -a $LOG_FILE; then
    echo "[$TIMESTAMP] ✅ 类型检查通过" >> $LOG_FILE
else
    echo "[$TIMESTAMP] ❌ 类型检查失败" >> $LOG_FILE
fi

# 4. 构建检查 (可选，耗时较长)
# echo "[$TIMESTAMP] 执行构建检查..." >> $LOG_FILE
# if pnpm build 2>&1 | tee -a $LOG_FILE; then
#     echo "[$TIMESTAMP] ✅ 构建成功" >> $LOG_FILE
# else
#     echo "[$TIMESTAMP] ❌ 构建失败" >> $LOG_FILE
# fi

# 5. 检查磁盘空间
DISK_USAGE=$(df -h . | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "[$TIMESTAMP] ⚠️ 警告：磁盘使用率 ${DISK_USAGE}%" >> $LOG_FILE
else
    echo "[$TIMESTAMP] ✅ 磁盘空间充足 (${DISK_USAGE}%)" >> $LOG_FILE
fi

echo "[$TIMESTAMP] 健康检查完成" >> $LOG_FILE
echo "----------------------------------------" >> $LOG_FILE
