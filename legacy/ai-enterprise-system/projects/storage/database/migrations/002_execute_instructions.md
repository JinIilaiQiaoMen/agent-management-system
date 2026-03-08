# 数据库迁移执行说明

## 📋 迁移文件
- 文件路径: `storage/database/migrations/002_add_new_modules.sql`
- 版本: 002
- 描述: 添加所有新模块的数据库表结构

## 🚀 执行步骤

### 方式一：通过 Supabase Dashboard（推荐）

1. 登录 Supabase Dashboard
2. 进入你的项目
3. 点击左侧菜单 "SQL Editor"
4. 点击 "New Query"
5. 复制 `002_add_new_modules.sql` 文件的全部内容
6. 粘贴到SQL编辑器中
7. 点击 "Run" 执行
8. 等待执行完成（约5-10秒）
9. 查看执行结果，确认所有表创建成功

### 方式二：通过命令行

```bash
# 使用 psql 连接到 Supabase
psql -h db.xxx.supabase.co -U postgres -d postgres -f storage/database/migrations/002_add_new_modules.sql
```

## ✅ 迁移内容

### 1. 数据治理与API集成模块（3个表）
- `api_configurations` - API配置表
- `data_models` - 数据模型表
- `system_integrations` - 系统集成配置表

### 2. 资产数字化管控模块（6个表）
- `assets` - 资产表
- `procurement_records` - 采购记录表
- `asset_inbound` - 入库记录表
- `asset_outbound` - 出库记录表
- `inventory_transactions` - 库存流水表
- `inventory_alerts` - 库存预警表

### 3. 智能人事系统模块（6个表）
- `resumes` - 简历表
- `interviews` - 面试记录表
- `employees` - 员工表
- `attendance_records` - 考勤记录表
- `leave_requests` - 请假记录表
- `performance_kpis` - KPI考核表

### 4. 财务审计系统模块（3个表）
- `expense_records` - 报销记录表
- `reconciliation_records` - 对账记录表
- `financial_standards` - 财务标准配置表

### 5. 营销内容生成模块（4个表）
- `content_records` - 内容生成记录表
- `marketing_materials` - 营销素材表
- `content_templates` - 内容模板表
- `ab_tests` - A/B测试记录表

### 6. 客户智能分析模块（5个表）
- `customer_images` - 客户影像表
- `solution_records` - 方案记录表
- `report_records` - 报告生成记录表
- `appointment_records` - 预约记录表
- `follow_up_records` - 跟进记录表

### 其他
- 30+个索引
- 自动更新触发器

## 🔍 验证迁移

执行以下SQL查询验证表是否创建成功：

```sql
-- 检查所有新表
SELECT 
    schemaname,
    tablename
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'api_configurations',
        'data_models',
        'system_integrations',
        'assets',
        'procurement_records',
        'asset_inbound',
        'asset_outbound',
        'inventory_transactions',
        'inventory_alerts',
        'resumes',
        'interviews',
        'employees',
        'attendance_records',
        'leave_requests',
        'performance_kpis',
        'expense_records',
        'reconciliation_records',
        'financial_standards',
        'content_records',
        'marketing_materials',
        'content_templates',
        'ab_tests',
        'customer_images',
        'solution_records',
        'report_records',
        'appointment_records',
        'follow_up_records'
    )
ORDER BY tablename;
```

## ⚠️ 注意事项

1. **执行前备份数据**：虽然这个迁移只是创建新表，不会影响现有数据，但建议先备份
2. **依赖用户表**：部分表有外键关联到 `users` 表，确保 `users` 表已存在
3. **依赖客户表**：`customer_images` 等表关联到 `customers` 表，确保 `customers` 表已存在
4. **执行权限**：确保你的数据库用户有创建表、索引、触发器的权限

## 🔄 回滚方法

如果需要回滚，执行以下SQL：

```sql
-- 删除所有新表（按依赖关系倒序）
DROP TABLE IF EXISTS follow_up_records CASCADE;
DROP TABLE IF EXISTS appointment_records CASCADE;
DROP TABLE IF EXISTS report_records CASCADE;
DROP TABLE IF EXISTS solution_records CASCADE;
DROP TABLE IF EXISTS customer_images CASCADE;

DROP TABLE IF EXISTS ab_tests CASCADE;
DROP TABLE IF EXISTS content_templates CASCADE;
DROP TABLE IF EXISTS marketing_materials CASCADE;
DROP TABLE IF EXISTS content_records CASCADE;

DROP TABLE IF EXISTS financial_standards CASCADE;
DROP TABLE IF EXISTS reconciliation_records CASCADE;
DROP TABLE IF EXISTS expense_records CASCADE;

DROP TABLE IF EXISTS performance_kpis CASCADE;
DROP TABLE IF EXISTS leave_requests CASCADE;
DROP TABLE IF EXISTS attendance_records CASCADE;
DROP TABLE IF EXISTS employees CASCADE;
DROP TABLE IF EXISTS interviews CASCADE;
DROP TABLE IF EXISTS resumes CASCADE;

DROP TABLE IF EXISTS inventory_alerts CASCADE;
DROP TABLE IF EXISTS inventory_transactions CASCADE;
DROP TABLE IF EXISTS asset_outbound CASCADE;
DROP TABLE IF EXISTS asset_inbound CASCADE;
DROP TABLE IF EXISTS procurement_records CASCADE;
DROP TABLE IF EXISTS assets CASCADE;

DROP TABLE IF EXISTS system_integrations CASCADE;
DROP TABLE IF EXISTS data_models CASCADE;
DROP TABLE IF EXISTS api_configurations CASCADE;

-- 删除触发器函数
DROP FUNCTION IF EXISTS update_updated_at_column CASCADE;
```

## 📞 支持

如果遇到问题，请检查：
1. Supabase连接是否正常
2. SQL文件是否完整复制
3. 用户权限是否足够
4. 是否有语法错误
