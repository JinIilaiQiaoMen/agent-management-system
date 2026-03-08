-- ============================================
-- AI 智能化企业系统数据库迁移脚本
-- 版本：002_add_new_modules
-- 日期：2026-02-28
-- ============================================

-- ============================================
-- 1. 数据治理与API集成模块
-- ============================================

-- API 配置表
CREATE TABLE IF NOT EXISTS api_configurations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    api_url VARCHAR(500) NOT NULL,
    api_key TEXT,
    api_type VARCHAR(50) NOT NULL, -- 'llm', 'external', 'internal'
    method VARCHAR(20) DEFAULT 'POST',
    headers JSONB,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'inactive', 'error'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- 数据模型表
CREATE TABLE IF NOT EXISTS data_models (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    schema JSONB NOT NULL,
    version VARCHAR(50) DEFAULT '1.0.0',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- 系统集成配置表
CREATE TABLE IF NOT EXISTS system_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    system_type VARCHAR(100) NOT NULL, -- 'saas', 'finance', 'material', 'crm'
    endpoint VARCHAR(500),
    authentication_config JSONB,
    sync_interval INTEGER DEFAULT 3600, -- 同步间隔（秒）
    status VARCHAR(20) DEFAULT 'active',
    last_sync_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 2. 资产数字化管控模块
-- ============================================

-- 资产表
CREATE TABLE IF NOT EXISTS assets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_code VARCHAR(100) UNIQUE NOT NULL,
    qr_code TEXT,
    name VARCHAR(255) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(255),
    model VARCHAR(255),
    specification TEXT,
    unit VARCHAR(50),
    quantity INTEGER DEFAULT 0,
    price DECIMAL(10,2),
    total_value DECIMAL(15,2),
    location VARCHAR(255),
    storage_location VARCHAR(255),
    supplier VARCHAR(255),
    purchase_date DATE,
    warranty_date DATE,
    status VARCHAR(50) DEFAULT 'normal', -- 'normal', 'maintenance', 'scrapped'
    images JSONB,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    created_by UUID
);

-- 采购记录表
CREATE TABLE IF NOT EXISTS procurement_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    request_user_id UUID NOT NULL,
    approve_user_id UUID,
    pr_number VARCHAR(100),
    supplier VARCHAR(255),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'completed', 'cancelled'
    request_quantity INTEGER NOT NULL,
    approved_quantity INTEGER,
    unit_price DECIMAL(10,2),
    total_price DECIMAL(10,2),
    budget DECIMAL(15,2),
    description TEXT,
    request_remarks TEXT,
    approve_remarks TEXT,
    request_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    approve_date TIMESTAMP WITH TIME ZONE,
    expected_delivery_date DATE,
    actual_delivery_date DATE,
    FOREIGN KEY (request_user_id) REFERENCES users(id),
    FOREIGN KEY (approve_user_id) REFERENCES users(id)
);

-- 入库记录表
CREATE TABLE IF NOT EXISTS asset_inbound (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    procurement_id UUID,
    quantity INTEGER NOT NULL,
    inbound_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator_id UUID,
    batch_number VARCHAR(100),
    remarks TEXT,
    FOREIGN KEY (operator_id) REFERENCES users(id)
);

-- 出库记录表
CREATE TABLE IF NOT EXISTS asset_outbound (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    quantity INTEGER NOT NULL,
    outbound_type VARCHAR(50) NOT NULL, -- 'issue', 'return', 'transfer', 'scrap'
    outbound_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    operator_id UUID,
    receiver_id UUID,
    remarks TEXT,
    FOREIGN KEY (operator_id) REFERENCES users(id),
    FOREIGN KEY (receiver_id) REFERENCES users(id)
);

-- 库存流水表
CREATE TABLE IF NOT EXISTS inventory_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    transaction_type VARCHAR(50) NOT NULL, -- 'in', 'out', 'adjust'
    quantity INTEGER NOT NULL,
    quantity_before INTEGER NOT NULL,
    quantity_after INTEGER NOT NULL,
    user_id UUID,
    reference_id UUID,
    reference_type VARCHAR(50),
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 库存预警表
CREATE TABLE IF NOT EXISTS inventory_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    asset_id UUID,
    alert_type VARCHAR(50) NOT NULL, -- 'low_stock', 'expiring', 'excess'
    threshold_value INTEGER,
    current_value INTEGER,
    message TEXT,
    status VARCHAR(20) DEFAULT 'active', -- 'active', 'resolved', 'ignored'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    resolved_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 3. 智能人事系统模块
-- ============================================

-- 简历表
CREATE TABLE IF NOT EXISTS resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    candidate_name VARCHAR(255) NOT NULL,
    email VARCHAR(255),
    phone VARCHAR(50),
    position_applied VARCHAR(255),
    resume_url TEXT,
    skills JSONB,
    experience JSONB,
    education JSONB,
    portfolio_url TEXT,
    ai_score INTEGER,
    ai_analysis JSONB,
    status VARCHAR(50) DEFAULT 'new', -- 'new', 'screening', 'interview', 'offer', 'rejected', 'hired'
    hr_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- 面试记录表
CREATE TABLE IF NOT EXISTS interviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID,
    interviewer_id UUID,
    interview_date TIMESTAMP WITH TIME ZONE,
    interview_type VARCHAR(50), -- 'phone', 'video', 'onsite'
    duration INTEGER, -- 分钟
    score INTEGER,
    feedback TEXT,
    ai_feedback JSONB,
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'completed', 'cancelled', 'no_show'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (interviewer_id) REFERENCES users(id)
);

-- 员工表
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    user_id UUID,
    name VARCHAR(255) NOT NULL,
    gender VARCHAR(20),
    birth_date DATE,
    id_number VARCHAR(50),
    phone VARCHAR(50),
    email VARCHAR(255),
    department VARCHAR(100),
    position VARCHAR(100),
    manager_id UUID,
    hire_date DATE NOT NULL,
    probation_end_date DATE,
    contract_url TEXT,
    contract_start_date DATE,
    contract_end_date DATE,
    salary DECIMAL(10,2),
    salary_period VARCHAR(20), -- 'monthly', 'yearly'
    bank_account VARCHAR(100),
    address TEXT,
    emergency_contact VARCHAR(255),
    emergency_phone VARCHAR(50),
    status VARCHAR(50) DEFAULT 'active', -- 'active', 'probation', 'resigned', 'terminated'
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (manager_id) REFERENCES employees(id)
);

-- 考勤记录表
CREATE TABLE IF NOT EXISTS attendance_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    work_hours DECIMAL(4,2),
    location VARCHAR(255),
    check_in_location VARCHAR(255),
    check_out_location VARCHAR(255),
    status VARCHAR(50) DEFAULT 'normal', -- 'normal', 'late', 'early_leave', 'absent', 'overtime'
    remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id)
);

-- 请假记录表
CREATE TABLE IF NOT EXISTS leave_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    leave_type VARCHAR(50) NOT NULL, -- 'annual', 'sick', 'personal', 'maternity', 'paternity'
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    total_days DECIMAL(4,2) NOT NULL,
    reason TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'cancelled'
    approve_user_id UUID,
    approve_date TIMESTAMP WITH TIME ZONE,
    approve_remarks TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approve_user_id) REFERENCES users(id)
);

-- KPI 考核表
CREATE TABLE IF NOT EXISTS performance_kpis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    year INTEGER NOT NULL,
    quarter INTEGER NOT NULL,
    kpi_data JSONB,
    total_score INTEGER,
    rating VARCHAR(20), -- 'S', 'A', 'B', 'C', 'D'
    evaluator_id UUID,
    evaluation_date TIMESTAMP WITH TIME ZONE,
    feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (evaluator_id) REFERENCES users(id)
);

-- ============================================
-- 4. 财务审计系统模块
-- ============================================

-- 报销记录表
CREATE TABLE IF NOT EXISTS expense_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_id UUID NOT NULL,
    category VARCHAR(100) NOT NULL,
    subcategory VARCHAR(100),
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'CNY',
    description TEXT,
    receipt_url TEXT,
    receipt_date DATE,
    expense_date DATE,
    project_code VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'approved', 'rejected', 'paid', 'returned'
    approve_user_id UUID,
    approve_date TIMESTAMP WITH TIME ZONE,
    approve_remarks TEXT,
    ai_risk_score INTEGER,
    ai_risk_flags JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (employee_id) REFERENCES employees(id),
    FOREIGN KEY (approve_user_id) REFERENCES users(id)
);

-- 对账记录表
CREATE TABLE IF NOT EXISTS reconciliation_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    account_date DATE NOT NULL,
    bank_balance DECIMAL(15,2),
    system_balance DECIMAL(15,2),
    difference DECIMAL(15,2),
    transactions JSONB,
    status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'matched', 'unmatched', 'resolved'
    mismatch_details JSONB,
    reconcile_user_id UUID,
    reconcile_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (reconcile_user_id) REFERENCES users(id)
);

-- 财务标准配置表
CREATE TABLE IF NOT EXISTS financial_standards (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    standard_type VARCHAR(100) NOT NULL, -- 'expense_limit', 'approval_rule', 'audit_rule'
    category VARCHAR(100),
    level VARCHAR(50), -- 'low', 'medium', 'high'
    limit_amount DECIMAL(15,2),
    rules JSONB,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE
);

-- ============================================
-- 5. 营销内容生成模块
-- ============================================

-- 内容生成记录表
CREATE TABLE IF NOT EXISTS content_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content_type VARCHAR(50) NOT NULL, -- 'copywriting', 'video', 'image', 'social'
    prompt TEXT,
    generated_content TEXT,
    generated_media_url TEXT,
    template_id UUID,
    style VARCHAR(100),
    tone VARCHAR(100),
    platform VARCHAR(100), -- 'weixin', 'douyin', 'weibo', 'xiaohongshu'
    status VARCHAR(50) DEFAULT 'generated', -- 'generated', 'approved', 'rejected', 'published'
    user_id UUID,
    ai_model VARCHAR(100),
    generation_time_ms INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 营销素材表
CREATE TABLE IF NOT EXISTS marketing_materials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL, -- 'image', 'video', 'audio', 'document'
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    file_size BIGINT,
    dimensions JSONB, -- width, height for images/videos
    duration INTEGER, -- duration in seconds for videos/audio
    tags JSONB,
    category VARCHAR(100),
    usage_count INTEGER DEFAULT 0,
    upload_user_id UUID,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (upload_user_id) REFERENCES users(id)
);

-- 内容模板表
CREATE TABLE IF NOT EXISTS content_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    platform VARCHAR(100),
    template_content TEXT NOT NULL,
    variables JSONB,
    style VARCHAR(100),
    tone VARCHAR(100),
    preview_url TEXT,
    is_system_template BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- A/B 测试记录表
CREATE TABLE IF NOT EXISTS ab_tests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    test_name VARCHAR(255) NOT NULL,
    content_a_id UUID,
    content_b_id UUID,
    platform VARCHAR(100),
    start_date DATE,
    end_date DATE,
    metrics_a JSONB,
    metrics_b JSONB,
    winner VARCHAR(10), -- 'A', 'B', 'tie'
    confidence_level DECIMAL(5,4),
    status VARCHAR(50) DEFAULT 'running', -- 'running', 'completed', 'paused'
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (content_a_id) REFERENCES content_records(id),
    FOREIGN KEY (content_b_id) REFERENCES content_records(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- ============================================
-- 6. 客户智能分析模块
-- ============================================

-- 客户影像表
CREATE TABLE IF NOT EXISTS customer_images (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    image_url TEXT NOT NULL,
    image_type VARCHAR(50), -- 'profile', 'product', 'scene', 'other'
    analysis_result JSONB,
    tags JSONB,
    confidence_score INTEGER,
    analysis_status VARCHAR(50) DEFAULT 'pending', -- 'pending', 'processing', 'completed', 'failed'
    analyzed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id)
);

-- 方案记录表
CREATE TABLE IF NOT EXISTS solution_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    image_id UUID,
    solution_content TEXT NOT NULL,
    solution_type VARCHAR(100),
    ai_confidence_score INTEGER,
    matching_features JSONB,
    recommended_products JSONB,
    estimated_budget DECIMAL(15,2),
    status VARCHAR(50) DEFAULT 'draft', -- 'draft', 'sent', 'accepted', 'rejected', 'modified'
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (image_id) REFERENCES customer_images(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 报告生成记录表
CREATE TABLE IF NOT EXISTS report_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_type VARCHAR(100) NOT NULL, -- 'analysis', 'proposal', 'comparison'
    customer_id UUID,
    solution_id UUID,
    report_content TEXT,
    report_url TEXT,
    data JSONB,
    charts JSONB,
    generated_by UUID,
    status VARCHAR(50) DEFAULT 'generated', -- 'generated', 'sent', 'viewed'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    sent_at TIMESTAMP WITH TIME ZONE,
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (solution_id) REFERENCES solution_records(id),
    FOREIGN KEY (generated_by) REFERENCES users(id)
);

-- 预约记录表
CREATE TABLE IF NOT EXISTS appointment_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    solution_id UUID,
    appointment_date TIMESTAMP WITH TIME ZONE NOT NULL,
    duration INTEGER, -- 分钟
    location VARCHAR(255),
    type VARCHAR(50), -- 'online', 'onsite', 'phone'
    status VARCHAR(50) DEFAULT 'scheduled', -- 'scheduled', 'confirmed', 'completed', 'cancelled', 'no_show'
    reminders_sent INTEGER DEFAULT 0,
    notes TEXT,
    created_by UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (solution_id) REFERENCES solution_records(id),
    FOREIGN KEY (created_by) REFERENCES users(id)
);

-- 跟进记录表
CREATE TABLE IF NOT EXISTS follow_up_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID,
    appointment_id UUID,
    follow_up_type VARCHAR(50) NOT NULL, -- 'call', 'email', 'visit', 'message'
    follow_up_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    content TEXT,
    next_follow_up_date TIMESTAMP WITH TIME ZONE,
    outcome VARCHAR(50), -- 'interested', 'not_interested', 'pending', 'deal', 'lost'
    operator_id UUID,
    ai_suggestion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    FOREIGN KEY (customer_id) REFERENCES customers(id),
    FOREIGN KEY (appointment_id) REFERENCES appointment_records(id),
    FOREIGN KEY (operator_id) REFERENCES users(id)
);

-- ============================================
-- 创建索引
-- ============================================

-- API 配置索引
CREATE INDEX IF NOT EXISTS idx_api_configurations_status ON api_configurations(status);
CREATE INDEX IF NOT EXISTS idx_api_configurations_type ON api_configurations(api_type);

-- 资产索引
CREATE INDEX IF NOT EXISTS idx_assets_code ON assets(asset_code);
CREATE INDEX IF NOT EXISTS idx_assets_status ON assets(status);
CREATE INDEX IF NOT EXISTS idx_assets_category ON assets(category);

-- 采购记录索引
CREATE INDEX IF NOT EXISTS idx_procurement_records_status ON procurement_records(status);
CREATE INDEX IF NOT EXISTS idx_procurement_records_user ON procurement_records(request_user_id);

-- 库存流水索引
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_asset ON inventory_transactions(asset_id);
CREATE INDEX IF NOT EXISTS idx_inventory_transactions_type ON inventory_transactions(transaction_type);

-- 简历索引
CREATE INDEX IF NOT EXISTS idx_resumes_status ON resumes(status);
CREATE INDEX IF NOT EXISTS idx_resumes_position ON resumes(position_applied);

-- 员工索引
CREATE INDEX IF NOT EXISTS idx_employees_code ON employees(employee_code);
CREATE INDEX IF NOT EXISTS idx_employees_status ON employees(status);
CREATE INDEX IF NOT EXISTS idx_employees_department ON employees(department);

-- 考勤记录索引
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee ON attendance_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_attendance_records_date ON attendance_records(check_in_time::DATE);

-- 报销记录索引
CREATE INDEX IF NOT EXISTS idx_expense_records_employee ON expense_records(employee_id);
CREATE INDEX IF NOT EXISTS idx_expense_records_status ON expense_records(status);
CREATE INDEX IF NOT EXISTS idx_expense_records_date ON expense_records(created_at);

-- 内容生成记录索引
CREATE INDEX IF NOT EXISTS idx_content_records_type ON content_records(content_type);
CREATE INDEX IF NOT EXISTS idx_content_records_user ON content_records(user_id);

-- 营销素材索引
CREATE INDEX IF NOT EXISTS idx_marketing_materials_type ON marketing_materials(type);
CREATE INDEX IF NOT EXISTS idx_marketing_materials_tags ON marketing_materials USING GIN(tags);

-- 客户影像索引
CREATE INDEX IF NOT EXISTS idx_customer_images_customer ON customer_images(customer_id);
CREATE INDEX IF NOT EXISTS idx_customer_images_status ON customer_images(analysis_status);

-- 方案记录索引
CREATE INDEX IF NOT EXISTS idx_solution_records_customer ON solution_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_solution_records_status ON solution_records(status);

-- 预约记录索引
CREATE INDEX IF NOT EXISTS idx_appointment_records_customer ON appointment_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_appointment_records_date ON appointment_records(appointment_date);

-- 跟进记录索引
CREATE INDEX IF NOT EXISTS idx_follow_up_records_customer ON follow_up_records(customer_id);
CREATE INDEX IF NOT EXISTS idx_follow_up_records_date ON follow_up_records(follow_up_date);

-- ============================================
-- 创建触发器 - 自动更新 updated_at
-- ============================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- 为所有有 updated_at 字段的表创建触发器
DO $$
DECLARE
    table_name TEXT;
BEGIN
    FOR table_name IN VALUES
        ('api_configurations'), ('data_models'), ('system_integrations'),
        ('assets'), ('resumes'), ('employees'),
        ('expense_records'), ('financial_standards'),
        ('content_templates')
    LOOP
        EXECUTE format('
            DROP TRIGGER IF EXISTS update_%s_updated_at ON %s;
            CREATE TRIGGER update_%s_updated_at
            BEFORE UPDATE ON %s
            FOR EACH ROW
            EXECUTE FUNCTION update_updated_at_column()
        ', table_name, table_name, table_name, table_name);
    END LOOP;
END $$;
