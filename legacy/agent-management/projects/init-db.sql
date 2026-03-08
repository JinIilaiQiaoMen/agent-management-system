-- ==========================================
-- 数据库初始化脚本
-- ==========================================

-- 创建扩展
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 创建用户和数据库（如果不存在）
DO
$do$
BEGIN
   IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = 'agent_user') THEN
      CREATE ROLE agent_user LOGIN PASSWORD 'agent_password';
   END IF;
END
$do$;

-- 授权
GRANT ALL PRIVILEGES ON DATABASE agent_management TO agent_user;
GRANT ALL PRIVILEGES ON SCHEMA public TO agent_user;

-- 创建必要的表结构
-- 注意：实际的表结构会在应用首次启动时通过Drizzle ORM自动创建

-- 创建索引优化查询
-- 这些索引也会在应用启动时自动创建

-- 插入初始数据（可选）
-- 可以在这里插入一些初始的智能体、知识库等数据

COMMENT ON DATABASE agent_management IS 'Agent Management System Database';
