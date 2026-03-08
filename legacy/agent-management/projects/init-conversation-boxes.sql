-- 创建对话盒子相关表

-- 对话盒子表
CREATE TABLE IF NOT EXISTS conversation_boxes (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(256) NOT NULL,
    description TEXT,
    task_id VARCHAR(36),
    created_by VARCHAR(128) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'active',
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS conv_boxes_task_idx ON conversation_boxes(task_id);
CREATE INDEX IF NOT EXISTS conv_boxes_status_idx ON conversation_boxes(status);
CREATE INDEX IF NOT EXISTS conv_boxes_created_by_idx ON conversation_boxes(created_by);

-- 对话盒子智能体关联表
CREATE TABLE IF NOT EXISTS conversation_box_agents (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id VARCHAR(36) NOT NULL,
    agent_id VARCHAR(36) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'participant',
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS conv_box_agents_box_idx ON conversation_box_agents(box_id);
CREATE INDEX IF NOT EXISTS conv_box_agents_agent_idx ON conversation_box_agents(agent_id);

-- 对话盒子消息表
CREATE TABLE IF NOT EXISTS conversation_box_messages (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    box_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    sender_type VARCHAR(20) NOT NULL,
    sender_agent_id VARCHAR(36),
    reply_to_id VARCHAR(36),
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS conv_box_msgs_box_idx ON conversation_box_messages(box_id);
CREATE INDEX IF NOT EXISTS conv_box_msgs_agent_idx ON conversation_box_messages(sender_agent_id);
CREATE INDEX IF NOT EXISTS conv_box_msgs_reply_idx ON conversation_box_messages(reply_to_id);
CREATE INDEX IF NOT EXISTS conv_box_msgs_created_idx ON conversation_box_messages(created_at);

-- 智能体响应表
CREATE TABLE IF NOT EXISTS conversation_box_agent_responses (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id VARCHAR(36) NOT NULL,
    agent_id VARCHAR(36) NOT NULL,
    content TEXT NOT NULL,
    is_hidden BOOLEAN DEFAULT FALSE NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS conv_box_resps_msg_idx ON conversation_box_agent_responses(message_id);
CREATE INDEX IF NOT EXISTS conv_box_resps_agent_idx ON conversation_box_agent_responses(agent_id);

-- 注释
COMMENT ON TABLE conversation_boxes IS '对话盒子 - 多智能体协作对话容器';
COMMENT ON TABLE conversation_box_agents IS '对话盒子智能体关联表';
COMMENT ON TABLE conversation_box_messages IS '对话盒子消息表';
COMMENT ON TABLE conversation_box_agent_responses IS '智能体响应表';
