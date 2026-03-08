-- 客户背调系统升级：添加对话式分析功能
-- 执行时间：$(date)

-- 1. 创建聊天会话表
CREATE TABLE IF NOT EXISTS chat_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  company_name VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'completed', 'archived')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引以优化查询性能
CREATE INDEX idx_chat_sessions_customer_id ON chat_sessions(customer_id);
CREATE INDEX idx_chat_sessions_user_id ON chat_sessions(user_id);
CREATE INDEX idx_chat_sessions_status ON chat_sessions(status);
CREATE INDEX idx_chat_sessions_created_at ON chat_sessions(created_at DESC);

-- 添加注释
COMMENT ON TABLE chat_sessions IS '客户背调聊天会话表';
COMMENT ON COLUMN chat_sessions.id IS '会话唯一标识';
COMMENT ON COLUMN chat_sessions.customer_id IS '关联的客户ID';
COMMENT ON COLUMN chat_sessions.company_name IS '公司名称';
COMMENT ON COLUMN chat_sessions.user_id is '创建会话的用户ID';
COMMENT ON COLUMN chat_sessions.status IS '会话状态：active-活跃中, completed-已完成, archived-已归档';
COMMENT ON COLUMN chat_sessions.metadata IS '会话元数据（JSON格式）';
COMMENT ON COLUMN chat_sessions.created_at IS '创建时间';
COMMENT ON COLUMN chat_sessions.updated_at IS '更新时间';

-- 2. 创建聊天消息表
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID NOT NULL REFERENCES chat_sessions(id) ON DELETE CASCADE,
  role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
  content TEXT NOT NULL,
  user_id UUID REFERENCES users(id) ON DELETE SET NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 创建索引
CREATE INDEX idx_chat_messages_session_id ON chat_messages(session_id);
CREATE INDEX idx_chat_messages_user_id ON chat_messages(user_id);
CREATE INDEX idx_chat_messages_role ON chat_messages(role);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at);

-- 添加注释
COMMENT ON TABLE chat_messages IS '客户背调聊天消息表';
COMMENT ON COLUMN chat_messages.id IS '消息唯一标识';
COMMENT ON COLUMN chat_messages.session_id IS '关联的会话ID';
COMMENT ON COLUMN chat_messages.role IS '消息角色：user-用户, assistant-AI助手, system-系统';
COMMENT ON COLUMN chat_messages.content IS '消息内容';
COMMENT ON COLUMN chat_messages.user_id IS '发送者用户ID（用户消息时）';
COMMENT ON COLUMN chat_messages.metadata IS '消息元数据（JSON格式）';
COMMENT ON COLUMN chat_messages.created_at IS '创建时间';

-- 3. 创建更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_chat_sessions_updated_at
  BEFORE UPDATE ON chat_sessions
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 4. 添加客户表字段（如果不存在）
DO $$
BEGIN
  -- 检查并添加 source 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'source'
  ) THEN
    ALTER TABLE customers ADD COLUMN source VARCHAR(100);
    COMMENT ON COLUMN customers.source IS '客户来源：customer_analysis-客户背调, manual-手动添加, import-导入等';
  END IF;

  -- 检查并添加 status 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'status'
  ) THEN
    ALTER TABLE customers ADD COLUMN status VARCHAR(50) DEFAULT 'new';
    COMMENT ON COLUMN customers.status IS '客户状态：new-新客户, active-活跃, inactive-不活跃, archived-已归档';
  END IF;

  -- 检查并添加 score 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'score'
  ) THEN
    ALTER TABLE customers ADD COLUMN score INTEGER DEFAULT 0;
    COMMENT ON COLUMN customers.score IS '客户评分（0-100）';
  END IF;

  -- 检查并添加 user_id 字段
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'customers' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE customers ADD COLUMN user_id UUID REFERENCES users(id) ON DELETE SET NULL;
    COMMENT ON COLUMN customers.user_id IS '关联的用户ID';
  END IF;
END $$;

-- 5. 创建视图：最近的会话列表
CREATE OR REPLACE VIEW recent_chat_sessions AS
SELECT
  cs.id,
  cs.company_name,
  cs.status,
  cs.created_at,
  cs.updated_at,
  cs.user_id,
  u.name as user_name,
  c.website,
  (SELECT COUNT(*) FROM chat_messages cm WHERE cm.session_id = cs.id) as message_count,
  (SELECT content FROM chat_messages cm WHERE cm.session_id = cs.id AND cm.role = 'assistant' ORDER BY created_at DESC LIMIT 1) as last_assistant_message
FROM chat_sessions cs
LEFT JOIN users u ON cs.user_id = u.id
LEFT JOIN customers c ON cs.customer_id = c.id
ORDER BY cs.updated_at DESC;

COMMENT ON VIEW recent_chat_sessions IS '最近的聊天会话列表视图';

-- 6. 创建函数：删除归档会话
CREATE OR REPLACE FUNCTION delete_archived_sessions(days_ago INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM chat_sessions
  WHERE status = 'archived'
    AND updated_at < NOW() - INTERVAL '1 day' * days_ago;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION delete_archived_sessions IS '删除指定天数前的归档会话';

-- 7. 创建函数：完成会话
CREATE OR REPLACE FUNCTION complete_session(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE chat_sessions
  SET status = 'completed',
      updated_at = NOW()
  WHERE id = session_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION complete_session IS '标记会话为已完成';

-- 8. 创建函数：归档会话
CREATE OR REPLACE FUNCTION archive_session(session_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE chat_sessions
  SET status = 'archived',
      updated_at = NOW()
  WHERE id = session_id;

  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION archive_session IS '归档会话';

-- 迁移完成
SELECT '客户背调系统升级迁移完成！' as status;
