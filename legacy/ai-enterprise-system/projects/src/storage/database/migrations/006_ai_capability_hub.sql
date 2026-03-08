-- ============================================================
-- AI能力中台数据库表结构
-- 创建日期: 2026-03-01
-- 版本: 1.0
-- 功能: 模型智能路由、缓存系统、用量监控
-- 目标: 将付费API调用量压缩80%以上
-- ============================================================

-- 1. AI模型提供商配置表
CREATE TABLE IF NOT EXISTS model_providers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    provider_name VARCHAR(50) UNIQUE NOT NULL, -- doubao, deepseek, kimi, openai, claude
    provider_display_name VARCHAR(100) NOT NULL,
    api_endpoint TEXT NOT NULL,
    auth_type VARCHAR(20) NOT NULL, -- api_key, oauth2
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 100, -- 路由优先级，数字越小优先级越高
    rate_limit_per_minute INTEGER, -- 每分钟调用限制
    cost_per_1k_tokens DECIMAL(10, 4), -- 每1000 tokens成本
    cost_per_1k_input_tokens DECIMAL(10, 4),
    cost_per_1k_output_tokens DECIMAL(10, 4),
    max_tokens INTEGER, -- 最大tokens限制
    supports_streaming BOOLEAN DEFAULT false,
    supports_function_calling BOOLEAN DEFAULT false,
    supports_vision BOOLEAN DEFAULT false,
    average_latency_ms INTEGER, -- 平均响应延迟
    success_rate DECIMAL(5, 2), -- 成功率
    last_health_check_at TIMESTAMPTZ,
    health_status VARCHAR(20) DEFAULT 'unknown', -- healthy, degraded, down
    configuration JSONB, -- 额外配置
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 模型路由规则表
CREATE TABLE IF NOT EXISTS model_routing_rules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    rule_name VARCHAR(200) NOT NULL,
    rule_description TEXT,
    task_type VARCHAR(50) NOT NULL, -- text_generation, conversation, summarization, translation, code_generation, image_understanding
    priority INTEGER DEFAULT 100,
    conditions JSONB NOT NULL, -- 路由条件
    model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    cache_enabled BOOLEAN DEFAULT true,
    cache_ttl_seconds INTEGER DEFAULT 3600, -- 缓存有效期
    fallback_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    fallback_model_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. AI响应缓存表
CREATE TABLE IF NOT EXISTS ai_cache (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    cache_key VARCHAR(255) UNIQUE NOT NULL, -- SHA-256 hash of request
    request_hash VARCHAR(255) NOT NULL,
    request_content TEXT NOT NULL, -- 压缩存储请求内容
    response_content TEXT NOT NULL, -- 压缩存储响应内容
    model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50),
    input_tokens INTEGER,
    output_tokens INTEGER,
    cache_hit_count INTEGER DEFAULT 0, -- 缓存命中次数
    created_at TIMESTAMPTZ DEFAULT NOW(),
    last_accessed_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ NOT NULL,
    is_valid BOOLEAN DEFAULT true
);

-- 4. API调用日志表（用量监控）
CREATE TABLE IF NOT EXISTS api_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) UNIQUE NOT NULL,
    model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL,
    task_type VARCHAR(50),
    user_id UUID,
    organization_id UUID,
    cache_hit BOOLEAN DEFAULT false,
    cache_key VARCHAR(255),
    input_tokens INTEGER DEFAULT 0,
    output_tokens INTEGER DEFAULT 0,
    total_tokens INTEGER DEFAULT 0,
    input_cost DECIMAL(10, 6),
    output_cost DECIMAL(10, 6),
    total_cost DECIMAL(10, 6),
    latency_ms INTEGER,
    status VARCHAR(20) DEFAULT 'success', -- success, error, timeout
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    metadata JSONB
);

-- 5. 模型性能指标表
CREATE TABLE IF NOT EXISTS model_performance_metrics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    model_name VARCHAR(100) NOT NULL,
    date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    successful_requests INTEGER DEFAULT 0,
    failed_requests INTEGER DEFAULT 0,
    total_input_tokens INTEGER DEFAULT 0,
    total_output_tokens INTEGER DEFAULT 0,
    avg_latency_ms DECIMAL(10, 2),
    avg_input_cost DECIMAL(10, 6),
    avg_output_cost DECIMAL(10, 6),
    total_cost DECIMAL(12, 6),
    cache_hit_rate DECIMAL(5, 2), -- 缓存命中率
    success_rate DECIMAL(5, 2), -- 成功率
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(model_provider_id, model_name, date)
);

-- 6. 成本分析表
CREATE TABLE IF NOT EXISTS cost_analytics (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    date DATE NOT NULL,
    total_requests INTEGER DEFAULT 0,
    cache_hit_requests INTEGER DEFAULT 0, -- 缓存命中请求数
    actual_paid_requests INTEGER DEFAULT 0, -- 实际付费请求数
    total_cost_without_cache DECIMAL(12, 6), -- 无缓存时的总成本
    total_cost_with_cache DECIMAL(12, 6), -- 有缓存时的总成本
    cost_saved DECIMAL(12, 6), -- 节省的成本
    cost_saving_rate DECIMAL(5, 2), -- 成本节省率
    compression_rate DECIMAL(5, 2), -- 调用量压缩率
    model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    task_type VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(date, model_provider_id, task_type)
);

-- 7. 路由决策日志表
CREATE TABLE IF NOT EXISTS routing_decision_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    request_id VARCHAR(100) NOT NULL,
    task_type VARCHAR(50),
    input_text TEXT,
    input_tokens INTEGER,
    selected_model_provider_id UUID REFERENCES model_providers(id) ON DELETE SET NULL,
    selected_model_name VARCHAR(100),
    routing_rule_id UUID REFERENCES model_routing_rules(id) ON DELETE SET NULL,
    routing_reason TEXT, -- 选择该模型的原因
    alternative_models JSONB, -- 备选模型
    routing_confidence DECIMAL(5, 2), -- 路由置信度
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_ai_cache_key ON ai_cache(cache_key);
CREATE INDEX IF NOT EXISTS idx_ai_cache_expires_at ON ai_cache(expires_at) WHERE is_valid = true;
CREATE INDEX IF NOT EXISTS idx_ai_cache_model ON ai_cache(model_provider_id, model_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_created_at ON api_usage_logs(created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_model ON api_usage_logs(model_provider_id, model_name);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_user ON api_usage_logs(user_id, created_at);
CREATE INDEX IF NOT EXISTS idx_api_usage_logs_cache_hit ON api_usage_logs(cache_hit);
CREATE INDEX IF NOT EXISTS idx_model_performance_metrics_date ON model_performance_metrics(date);
CREATE INDEX IF NOT EXISTS idx_model_performance_metrics_model ON model_performance_metrics(model_provider_id, model_name);
CREATE INDEX IF NOT EXISTS idx_cost_analytics_date ON cost_analytics(date);
CREATE INDEX IF NOT EXISTS idx_routing_decision_logs_request_id ON routing_decision_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_routing_decision_logs_created_at ON routing_decision_logs(created_at);

-- Add constraints
ALTER TABLE ai_cache ADD CONSTRAINT chk_cache_expires_at CHECK (expires_at > created_at);
ALTER TABLE api_usage_logs ADD CONSTRAINT chk_tokens_non_negative CHECK (input_tokens >= 0 AND output_tokens >= 0 AND total_tokens >= 0);
ALTER TABLE model_performance_metrics ADD CONSTRAINT chk_metrics_date CHECK (date <= CURRENT_DATE);
ALTER TABLE cost_analytics ADD CONSTRAINT chk_cost_analytics_date CHECK (date <= CURRENT_DATE);

-- Insert sample model providers
INSERT INTO model_providers (
    provider_name,
    provider_display_name,
    api_endpoint,
    auth_type,
    is_active,
    priority,
    rate_limit_per_minute,
    cost_per_1k_tokens,
    cost_per_1k_input_tokens,
    cost_per_1k_output_tokens,
    max_tokens,
    supports_streaming,
    supports_function_calling,
    supports_vision,
    average_latency_ms,
    success_rate,
    health_status
) VALUES
(
    'doubao',
    '豆包 (Doubao)',
    'https://ark.cn-beijing.volces.com/api/v3',
    'api_key',
    true,
    10,
    100,
    0.008,
    0.004,
    0.012,
    8192,
    true,
    true,
    true,
    800,
    99.50,
    'healthy'
),
(
    'deepseek',
    'DeepSeek',
    'https://api.deepseek.com/v1',
    'api_key',
    true,
    20,
    60,
    0.014,
    0.001,
    0.028,
    16384,
    true,
    true,
    false,
    1200,
    99.20,
    'healthy'
),
(
    'kimi',
    'Kimi (Moonshot)',
    'https://api.moonshot.cn/v1',
    'api_key',
    true,
    30,
    40,
    0.012,
    0.003,
    0.015,
    32768,
    true,
    true,
    false,
    1500,
    98.80,
    'healthy'
)
ON CONFLICT (provider_name) DO NOTHING;

-- Insert sample routing rules
INSERT INTO model_routing_rules (
    rule_name,
    rule_description,
    task_type,
    priority,
    conditions,
    model_provider_id,
    model_name,
    is_active,
    cache_enabled,
    cache_ttl_seconds
)
SELECT
    'Simple Text Generation',
    '简单文本生成任务（低复杂度）',
    'text_generation',
    100,
    jsonb_build_object(
        'complexity', 'low',
        'max_tokens', 1000,
        'requires_reasoning', false
    ),
    mp.id,
    'doubao-pro-32k',
    true,
    true,
    3600
FROM model_providers mp
WHERE mp.provider_name = 'doubao'
UNION ALL
SELECT
    'Complex Conversation',
    '复杂对话任务（高复杂度）',
    'conversation',
    200,
    jsonb_build_object(
        'complexity', 'high',
        'max_tokens', 4000,
        'requires_reasoning', true,
        'context_length', 'long'
    ),
    mp.id,
    'deepseek-chat',
    true,
    true,
    1800
FROM model_providers mp
WHERE mp.provider_name = 'deepseek'
UNION ALL
SELECT
    'Long Context Summarization',
    '长文本摘要（超长上下文）',
    'summarization',
    300,
    jsonb_build_object(
        'complexity', 'medium',
        'max_tokens', 16000,
        'requires_reasoning', false,
        'context_length', 'very_long'
    ),
    mp.id,
    'moonshot-v1-32k',
    true,
    true,
    7200
FROM model_providers mp
WHERE mp.provider_name = 'kimi'
ON CONFLICT DO NOTHING;

-- Insert sample cache entries (for demonstration)
INSERT INTO ai_cache (
    cache_key,
    request_hash,
    request_content,
    response_content,
    model_provider_id,
    model_name,
    task_type,
    input_tokens,
    output_tokens,
    cache_hit_count,
    expires_at
)
SELECT
    encode(digest(('hello_' || mp.provider_name), 'sha256'), 'hex'),
    encode(digest(('hello_' || mp.provider_name), 'sha256'), 'hex'),
    'Hello',
    'Hello! How can I help you today?',
    mp.id,
    CASE mp.provider_name
        WHEN 'doubao' THEN 'doubao-pro-32k'
        WHEN 'deepseek' THEN 'deepseek-chat'
        ELSE 'moonshot-v1-32k'
    END,
    'conversation',
    1,
    8,
    5,
    NOW() + interval '1 hour'
FROM model_providers mp
ON CONFLICT (cache_key) DO NOTHING;

-- Insert sample usage logs (last 7 days)
INSERT INTO api_usage_logs (
    request_id,
    model_provider_id,
    model_name,
    task_type,
    cache_hit,
    input_tokens,
    output_tokens,
    total_tokens,
    input_cost,
    output_cost,
    total_cost,
    latency_ms,
    status
)
SELECT
    'req-' || mp.provider_name || '-' || to_char(NOW() - (random() * 7 * 24 * 60 * 60)::integer * interval '1 second', 'YYYYMMDDHH24MISS'),
    mp.id,
    CASE mp.provider_name
        WHEN 'doubao' THEN 'doubao-pro-32k'
        WHEN 'deepseek' THEN 'deepseek-chat'
        ELSE 'moonshot-v1-32k'
    END,
    CASE (i % 5)
        WHEN 0 THEN 'text_generation'
        WHEN 1 THEN 'conversation'
        WHEN 2 THEN 'summarization'
        WHEN 3 THEN 'translation'
        ELSE 'code_generation'
    END,
    (random() > 0.7), -- 30% cache hit rate
    (random() * 500 + 50)::integer,
    (random() * 300 + 50)::integer,
    (random() * 800 + 100)::integer,
    round((random() * 500 + 50) * mp.cost_per_1k_input_tokens / 1000, 6),
    round((random() * 300 + 50) * mp.cost_per_1k_output_tokens / 1000, 6),
    round((random() * 800 + 100) * mp.cost_per_1k_tokens / 1000, 6),
    (random() * 2000 + 500)::integer,
    CASE (random() > 0.95) WHEN true THEN 'error' ELSE 'success' END
FROM model_providers mp
CROSS JOIN (SELECT generate_series(1, 50) AS i) AS seq
ON CONFLICT (request_id) DO NOTHING;
