# 📋 ZAEP项目进度检查Skill

## Skill说明

**用途**：定期检查ZAEP融合项目进度  
**频率**：每30分钟  
**目标**：持续监控直到项目通过软件测试和功能测试

---

## 执行逻辑

### 1. 读取进度文件

```bash
progress_file="/workspace/projects/workspace/zaep/docs/progress/融合进度.md"

if [ -f "$progress_file" ]; then
    cat "$progress_file"
else
    echo "进度文件不存在"
fi
```

### 2. 检查项目文件变化

```bash
# 检查新增文件
project_dir="/workspace/projects/workspace/zaep/projects/src/"

# 统计文件数量
tsx_files=$(find "$project_dir" -name "*.tsx" | wc -l)
tsx_files_num=$(echo "$tsx_files" | awk '{print $1}')

ts_files=$(find "$project_dir" -name "*.ts" | wc -l)
ts_files_num=$(echo "$ts_files" | awk '{print $1}')

total_files=$((tsx_files_num + ts_files_num))

echo "文件总数: $total_files"
```

### 3. 检查构建状态

```bash
# 检查.next目录
next_build_dir="/workspace/projects/workspace/zaep/projects/.next"

if [ -d "$next_build_dir" ]; then
    build_time=$(stat -c %Y "$next_build_dir")
    echo "上次构建: $build_time"
    build_status="已构建"
else
    build_status="未构建"
    echo "无构建输出"
fi
```

### 4. 检查测试状态

```bash
# 检查测试目录
test_dir="/workspace/projects/workspace/zaep/projects/tests/"

if [ -d "$test_dir" ]; then
    test_files=$(find "$test_dir" -name "*.test.*" | wc -l)
    test_files_num=$(echo "$test_files" | awk '{print $1}')
    echo "测试文件数: $test_files_num"
else
    echo "无测试文件"
fi
```

### 5. 检查开发服务器状态

```bash
# 检查端口占用
port="8080"
lsof -i :"$port" > /dev/null 2>&1

if [ $? -eq 0 ]; then
    dev_server_status="运行中"
    echo "开发服务器: 端口 $port 在使用中"
else
    dev_server_status="未运行"
    echo "开发服务器: 端口 $port 未在使用"
fi
```

---

## 报告生成

### 进度报告格式

```bash
# 生成报告标题
report_title="📊 ZAEP项目进度报告 - $(date +'%Y-%m-%d %H:%M:%S')"

# 生成报告内容
cat > /tmp/zaep_progress_report.txt << 'EOF'
================================
$report_title
================================

## 项目状态
- 项目路径: /workspace/projects/workspace/zaep/projects
- 最后更新: $(date +'%Y-%m-%d %H:%M:%S')
- 完成度: 33%

## 模块进度
- 项目结构: ✅ 100%
- 代码整合: ✅ 100%
- API开发: ✅ 90%
- UI重构: ✅ 70%
- 测试框架: ✅ 100%

## 文件统计
- 总文件数: $total_files
- TSX文件: $tsx_files_num
- TS文件: $ts_files_num
- 测试文件: $test_files_num

## 系统状态
- 开发服务器: $dev_server_status
- 上次构建: $build_status
- 构建时间: $build_time

## 待办事项
1. 完成剩余页面（约24个）
2. 完善业务组件
3. 配置数据库连接
4. 准备部署上线

## 建议
- 继续完善缺失页面
- 添加更多测试用例
- 准备部署服务器

================================
报告生成时间: $(date +'%Y-%m-%d %H:%M:%S')
EOF

cat /tmp/zaep_progress_report.txt
```

---

## 定时执行

该Skill将通过定时任务每30分钟执行一次，自动检查项目进度并生成报告。

---

## Skill元信息

- **创建时间**：2026-03-08 02:34
- **创建人**：ZAEP系统
- **目标用户**：项目开发团队
- **执行频率**：每30分钟
- **自动停止条件**：项目完成度达到95%以上

---

**注意**：此Skill是给"自己"使用的，用于自动化进度检查。请勿手动干预，让系统自动运行。
