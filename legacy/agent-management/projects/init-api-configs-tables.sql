-- 创建智能体API配置表
CREATE TABLE IF NOT EXISTS agent_api_configs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id VARCHAR(36) NOT NULL,
  name VARCHAR(128) NOT NULL,
  type VARCHAR(20) NOT NULL DEFAULT 'REST',
  url TEXT NOT NULL,
  method VARCHAR(10) NOT NULL DEFAULT 'GET',
  headers JSONB,
  query_params JSONB,
  body_template TEXT,
  auth_type VARCHAR(20),
  auth_config JSONB,
  description TEXT,
  is_active BOOLEAN DEFAULT true NOT NULL,
  timeout INTEGER DEFAULT 30000 NOT NULL,
  retry_count INTEGER DEFAULT 0 NOT NULL,
  rate_limit INTEGER DEFAULT 60 NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE
);

-- 创建索引
CREATE INDEX IF NOT EXISTS agent_api_configs_agent_id_idx ON agent_api_configs(agent_id);
CREATE INDEX IF NOT EXISTS agent_api_configs_type_idx ON agent_api_configs(type);
CREATE INDEX IF NOT EXISTS agent_api_configs_is_active_idx ON agent_api_configs(is_active);
CREATE INDEX IF NOT EXISTS agent_api_configs_created_at_idx ON agent_api_configs(created_at);

-- 创建API执行日志表
CREATE TABLE IF NOT EXISTS api_execution_logs (
  id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid(),
  api_config_id VARCHAR(36) NOT NULL,
  task_id VARCHAR(36),
  agent_id VARCHAR(36) NOT NULL,
  request_url TEXT NOT NULL,
  request_method VARCHAR(10) NOT NULL,
  request_headers JSONB,
  request_body TEXT,
  response_status INTEGER,
  response_headers JSONB,
  response_body TEXT,
  status VARCHAR(20) NOT NULL,
  error_message TEXT,
  execution_time INTEGER NOT NULL,
  retries INTEGER DEFAULT 0 NOT NULL,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now() NOT NULL
);

-- 创建索引
CREATE INDEX IF NOT EXISTS api_exec_logs_api_config_id_idx ON api_execution_logs(api_config_id);
CREATE INDEX IF NOT EXISTS api_exec_logs_task_id_idx ON api_execution_logs(task_id);
CREATE INDEX IF NOT EXISTS api_exec_logs_agent_id_idx ON api_execution_logs(agent_id);
CREATE INDEX IF NOT EXISTS api_exec_logs_status_idx ON api_execution_logs(status);
CREATE INDEX IF NOT EXISTS api_exec_logs_created_at_idx ON api_execution_logs(created_at);

-- 添加注释
COMMENT ON TABLE agent_api_configs IS '智能体API配置表';
COMMENT ON TABLE api_execution_logs IS 'API执行日志表';
