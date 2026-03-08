-- ============================================================
-- 欧美线下渠道赋能系统数据库表结构
-- 创建日期: 2026-03-01
-- 版本: 1.0
-- ============================================================

-- 1. 门店信息表
CREATE TABLE IF NOT EXISTS stores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_code VARCHAR(50) UNIQUE NOT NULL,
    store_name VARCHAR(200) NOT NULL,
    country VARCHAR(2) NOT NULL, -- ISO 3166-1 alpha-2 country code
    city VARCHAR(100),
    address TEXT,
    postal_code VARCHAR(20),
    currency VARCHAR(3) DEFAULT 'USD', -- ISO 4217 currency code
    language VARCHAR(2) DEFAULT 'en', -- ISO 639-1 language code (en, es, de, fr)
    store_type VARCHAR(50), -- flagship, standard, outlet, pop-up
    area_sqm INTEGER, -- Store area in square meters
    opening_date DATE,
    timezone VARCHAR(50),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. 员工信息表 (GDPR compliant - minimal data)
CREATE TABLE IF NOT EXISTS employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    employee_code VARCHAR(50) UNIQUE NOT NULL,
    hashed_name VARCHAR(255) NOT NULL, -- SHA-256 hashed name
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    position VARCHAR(100), -- cashier, sales_associate, manager, stock_clerk
    department VARCHAR(100),
    hire_date DATE,
    is_active BOOLEAN DEFAULT true,
    language_preference VARCHAR(2) DEFAULT 'en',
    skills JSONB, -- Array of skills: ['customer_service', 'inventory_management', 'pos']
    max_hours_per_week INTEGER DEFAULT 48, -- EU Working Time Directive default
    hourly_wage DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. 客流记录表 (GDPR compliant - anonymized)
CREATE TABLE IF NOT EXISTS traffic_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    hashed_customer_id VARCHAR(255), -- SHA-256 hashed customer ID
    x_coordinate DECIMAL(10, 2), -- X coordinate (meters, blurred to 0.5m)
    y_coordinate DECIMAL(10, 2), -- Y coordinate (meters, blurred to 0.5m)
    zone_type VARCHAR(50), -- entrance, cash_register, shelf_a, shelf_b, fitting_room
    recorded_at TIMESTAMPTZ DEFAULT NOW(),
    duration_seconds INTEGER, -- Time spent in zone
    path_sequence JSONB, -- Array of coordinates for path tracking
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. 客流预测表
CREATE TABLE IF NOT EXISTS traffic_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_customers INTEGER NOT NULL,
    lower_bound INTEGER,
    upper_bound INTEGER,
    confidence_level DECIMAL(5, 2), -- 0.95 = 95% confidence
    forecast_model VARCHAR(100),
    forecast_generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. 排班记录表
CREATE TABLE IF NOT EXISTS schedules (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES employees(id) ON DELETE CASCADE,
    shift_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    shift_type VARCHAR(50), -- morning, afternoon, evening, full_day
    scheduled_hours DECIMAL(4, 2),
    actual_hours DECIMAL(4, 2),
    is_overtime BOOLEAN DEFAULT false,
    overtime_hours DECIMAL(4, 2),
    overtime_rate DECIMAL(5, 2), -- 1.25, 1.5, etc.
    compliance_check BOOLEAN DEFAULT true, -- Labor law compliance
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. 产品信息表
CREATE TABLE IF NOT EXISTS products (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    product_code VARCHAR(50) UNIQUE NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    category VARCHAR(100),
    subcategory VARCHAR(100),
    brand VARCHAR(100),
    sku VARCHAR(100),
    barcode VARCHAR(50),
    unit_cost DECIMAL(10, 2),
    selling_price DECIMAL(10, 2),
    supplier_id UUID, -- Reference to supplier (if exists)
    lead_time_days INTEGER DEFAULT 7, -- Average lead time in days
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. 库存记录表
CREATE TABLE IF NOT EXISTS inventory (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_quantity INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER DEFAULT 10,
    safety_stock INTEGER DEFAULT 5,
    last_restocked_at TIMESTAMPTZ,
    location_in_store VARCHAR(100), -- shelf_a_1, warehouse_zone_1, etc.
    unit VARCHAR(20) DEFAULT 'piece',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(store_id, product_id)
);

-- 8. 销售记录表 (GDPR compliant - anonymized)
CREATE TABLE IF NOT EXISTS sales_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    transaction_id VARCHAR(100) UNIQUE NOT NULL,
    hashed_customer_id VARCHAR(255), -- SHA-256 hashed customer ID (optional)
    transaction_date TIMESTAMPTZ NOT NULL,
    total_amount DECIMAL(12, 2) NOT NULL,
    payment_method VARCHAR(50), -- cash, credit_card, debit_card, mobile
    sales_channel VARCHAR(50), -- in_store, online, omnichannel
    employee_id UUID REFERENCES employees(id),
    currency VARCHAR(3),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. 销售明细表
CREATE TABLE IF NOT EXISTS sales_items (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    sale_id UUID REFERENCES sales_records(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    quantity INTEGER NOT NULL,
    unit_price DECIMAL(10, 2) NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    discount_percent DECIMAL(5, 2) DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. 需求预测表
CREATE TABLE IF NOT EXISTS demand_forecasts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    forecast_date DATE NOT NULL,
    predicted_quantity DECIMAL(10, 2) NOT NULL,
    lower_bound DECIMAL(10, 2),
    upper_bound DECIMAL(10, 2),
    confidence_level DECIMAL(5, 2),
    forecast_model VARCHAR(100),
    forecast_horizon_days INTEGER,
    seasonality_factor DECIMAL(5, 2),
    promotion_impact_factor DECIMAL(5, 2),
    forecast_generated_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. 补货建议表
CREATE TABLE IF NOT EXISTS replenishment_suggestions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    current_quantity INTEGER NOT NULL,
    suggested_order_quantity INTEGER NOT NULL,
    reorder_point INTEGER,
    safety_stock INTEGER,
    estimated_delivery_date DATE,
    urgency_level VARCHAR(20), -- critical, high, medium, low
    total_cost DECIMAL(12, 2),
    status VARCHAR(20) DEFAULT 'pending', -- pending, approved, ordered, received
    auto_approved BOOLEAN DEFAULT false,
    suggested_at TIMESTAMPTZ DEFAULT NOW(),
    approved_at TIMESTAMPTZ,
    approved_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. 巡店记录表 (GDPR compliant - anonymized)
CREATE TABLE IF NOT EXISTS store_audits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    audit_date DATE NOT NULL,
    audit_time TIME,
    auditor_id UUID, -- Employee or AI system ID
    audit_type VARCHAR(50), -- manual, ai_remote, hybrid
    overall_score DECIMAL(5, 2),
    grade VARCHAR(2), -- A+, A, B+, B, C+, C, D
    total_violations INTEGER DEFAULT 0,
    frames_analyzed INTEGER DEFAULT 0,
    gdpr_compliant BOOLEAN DEFAULT true,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. 巡店违规记录表
CREATE TABLE IF NOT EXISTS audit_violations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES store_audits(id) ON DELETE CASCADE,
    violation_type VARCHAR(100) NOT NULL, -- employee_without_badge, shelf_not_organized, etc.
    violation_severity VARCHAR(20), -- low, medium, high, critical
    description TEXT,
    evidence_image_url TEXT, -- Screenshot URL (optional)
    location_in_store VARCHAR(100),
    detected_at TIMESTAMPTZ DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'open', -- open, in_progress, resolved, ignored
    assigned_to UUID REFERENCES employees(id),
    resolved_at TIMESTAMPTZ,
    resolution_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. 巡店建议表
CREATE TABLE IF NOT EXISTS audit_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    audit_id UUID REFERENCES store_audits(id) ON DELETE CASCADE,
    priority VARCHAR(20), -- critical, high, medium, low
    issue VARCHAR(200),
    action_required TEXT,
    deadline DATE,
    status VARCHAR(20) DEFAULT 'pending', -- pending, in_progress, completed, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. 会员信息表 (GDPR compliant - minimal data)
CREATE TABLE IF NOT EXISTS members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_code VARCHAR(50) UNIQUE NOT NULL,
    hashed_email VARCHAR(255), -- Masked email for notifications
    hashed_phone VARCHAR(255), -- Masked phone for notifications
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    membership_tier VARCHAR(20), -- regular, silver, gold, platinum, vip
    join_date DATE,
    language_preference VARCHAR(2) DEFAULT 'en',
    marketing_consent BOOLEAN DEFAULT false, -- GDPR opt-in
    data_consent_given_at TIMESTAMPTZ,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. RFM分析表
CREATE TABLE IF NOT EXISTS rfm_analysis (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    recency_days INTEGER NOT NULL, -- Days since last purchase
    frequency INTEGER NOT NULL, -- Number of purchases in period
    monetary DECIMAL(12, 2) NOT NULL, -- Total amount spent
    recency_score INTEGER CHECK (recency_score BETWEEN 1 AND 5),
    frequency_score INTEGER CHECK (frequency_score BETWEEN 1 AND 5),
    monetary_score INTEGER CHECK (monetary_score BETWEEN 1 AND 5),
    rfm_score INTEGER, -- Sum of R+F+M
    segment VARCHAR(50), -- VIP, Loyal, New, Churned, High Value, Regular
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. 流失预测表
CREATE TABLE IF NOT EXISTS churn_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    prediction_date DATE NOT NULL,
    churn_probability DECIMAL(5, 2) NOT NULL, -- 0.00 to 1.00
    risk_level VARCHAR(20), -- High, Medium, Low
    prediction VARCHAR(20), -- Churn, Retain
    confidence_level DECIMAL(5, 2),
    model_version VARCHAR(50),
    features JSONB, -- Feature vector used for prediction
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. 个性化推荐表
CREATE TABLE IF NOT EXISTS personalized_recommendations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    product_id UUID REFERENCES products(id) ON DELETE CASCADE,
    recommendation_date DATE NOT NULL,
    similarity_score DECIMAL(5, 2), -- 0.00 to 1.00
    confidence DECIMAL(5, 2),
    recommendation_type VARCHAR(50), -- collaborative_filtering, content_based, hybrid
    is_viewed BOOLEAN DEFAULT false,
    is_purchased BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. 营销活动表
CREATE TABLE IF NOT EXISTS marketing_campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_name VARCHAR(200) NOT NULL,
    campaign_type VARCHAR(50), -- welcome, win_back, birthday, recommendation, seasonal
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    target_segment VARCHAR(50), -- all, VIP, Churned, High Value, etc.
    language VARCHAR(2) DEFAULT 'en',
    channel VARCHAR(50), -- Email, SMS, Push, In-App, Multi-channel
    subject VARCHAR(200),
    content_template TEXT,
    discount_percent DECIMAL(5, 2),
    offer_description TEXT,
    start_date DATE,
    end_date DATE,
    status VARCHAR(20) DEFAULT 'draft', -- draft, scheduled, active, paused, completed
    estimated_budget DECIMAL(12, 2),
    actual_cost DECIMAL(12, 2),
    created_by UUID,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. 营销发送记录表
CREATE TABLE IF NOT EXISTS marketing_sends (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID REFERENCES marketing_campaigns(id) ON DELETE CASCADE,
    member_id UUID REFERENCES members(id) ON DELETE CASCADE,
    sent_at TIMESTAMPTZ DEFAULT NOW(),
    channel VARCHAR(50),
    status VARCHAR(20) DEFAULT 'pending', -- pending, sent, delivered, opened, clicked, bounced, failed
    delivery_status TEXT,
    opened_at TIMESTAMPTZ,
    clicked_at TIMESTAMPTZ,
    unsubscribed BOOLEAN DEFAULT false,
    unsubscribed_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 21. 系统配置表 (POS/ERP集成配置)
CREATE TABLE IF NOT EXISTS system_integrations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    integration_type VARCHAR(50) NOT NULL, -- pos, erp, crm, payment
    provider VARCHAR(100) NOT NULL, -- Square, Shopify_POS, Toast, NetSuite, SAP, etc.
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    api_endpoint TEXT,
    auth_type VARCHAR(50), -- OAuth2, API_Key, Basic
    credentials_encrypted TEXT, -- Encrypted credentials
    is_active BOOLEAN DEFAULT true,
    last_sync_at TIMESTAMPTZ,
    sync_frequency_minutes INTEGER,
    configuration JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. 热区分析表
CREATE TABLE IF NOT EXISTS heatmap_analyses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    analysis_date DATE NOT NULL,
    analysis_period VARCHAR(20), -- daily, weekly, monthly
    high_traffic_zone JSONB, -- Coordinates and density data
    medium_traffic_zone JSONB,
    low_traffic_zone JSONB,
    total_customers INTEGER,
    avg_duration_seconds DECIMAL(10, 2),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. 事件日志表 (GDPR compliant - minimal data)
CREATE TABLE IF NOT EXISTS event_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    event_type VARCHAR(100) NOT NULL,
    event_category VARCHAR(50), -- traffic, inventory, audit, marketing
    store_id UUID REFERENCES stores(id) ON DELETE CASCADE,
    description TEXT,
    severity VARCHAR(20), -- info, warning, error, critical
    metadata JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance optimization
CREATE INDEX IF NOT EXISTS idx_traffic_records_store_date ON traffic_records(store_id, recorded_at);
CREATE INDEX IF NOT EXISTS idx_traffic_records_zone ON traffic_records(store_id, zone_type);
CREATE INDEX IF NOT EXISTS idx_schedules_store_date ON schedules(store_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_schedules_employee_date ON schedules(employee_id, shift_date);
CREATE INDEX IF NOT EXISTS idx_inventory_store_product ON inventory(store_id, product_id);
CREATE INDEX IF NOT EXISTS idx_sales_records_store_date ON sales_records(store_id, transaction_date);
CREATE INDEX IF NOT EXISTS idx_sales_items_product ON sales_items(product_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_store_product_date ON demand_forecasts(store_id, product_id, forecast_date);
CREATE INDEX IF NOT EXISTS idx_replenishment_suggestions_store_status ON replenishment_suggestions(store_id, status);
CREATE INDEX IF NOT EXISTS idx_store_audits_store_date ON store_audits(store_id, audit_date);
CREATE INDEX IF NOT EXISTS idx_audit_violations_audit ON audit_violations(audit_id);
CREATE INDEX IF NOT EXISTS idx_members_store ON members(store_id);
CREATE INDEX IF NOT EXISTS idx_rfm_analysis_member_date ON rfm_analysis(member_id, analysis_date);
CREATE INDEX IF NOT EXISTS idx_churn_predictions_member_date ON churn_predictions(member_id, prediction_date);
CREATE INDEX IF NOT EXISTS idx_personalized_recommendations_member_date ON personalized_recommendations(member_id, recommendation_date);
CREATE INDEX IF NOT EXISTS idx_marketing_campaigns_store_status ON marketing_campaigns(store_id, status);
CREATE INDEX IF NOT EXISTS idx_marketing_sends_campaign_member ON marketing_sends(campaign_id, member_id);

-- Add constraints
ALTER TABLE traffic_records ADD CONSTRAINT chk_traffic_coordinates CHECK (x_coordinate >= 0 AND y_coordinate >= 0);
ALTER TABLE schedules ADD CONSTRAINT chk_schedule_times CHECK (end_time > start_time);
ALTER TABLE inventory ADD CONSTRAINT chk_inventory_quantity CHECK (current_quantity >= 0);
ALTER TABLE demand_forecasts ADD CONSTRAINT chk_demand_forecast CHECK (predicted_quantity >= 0);
ALTER TABLE replenishment_suggestions ADD CONSTRAINT chk_replenishment_quantity CHECK (suggested_order_quantity >= 0);
ALTER TABLE store_audits ADD CONSTRAINT chk_audit_score CHECK (overall_score BETWEEN 0 AND 100);
ALTER TABLE churn_predictions ADD CONSTRAINT chk_churn_probability CHECK (churn_probability BETWEEN 0 AND 1);

-- Insert sample stores (US, UK, Germany, France, Spain)
INSERT INTO stores (store_code, store_name, country, city, currency, language, store_type, area_sqm, opening_date, timezone, is_active) VALUES
('NYC-001', 'Manhattan Flagship', 'US', 'New York', 'USD', 'en', 'flagship', 500, '2020-01-15', 'America/New_York', true),
('LON-001', 'London Oxford Street', 'GB', 'London', 'GBP', 'en', 'flagship', 450, '2020-03-01', 'Europe/London', true),
('BER-001', 'Berlin Mitte', 'DE', 'Berlin', 'EUR', 'de', 'standard', 300, '2020-06-15', 'Europe/Berlin', true),
('PAR-001', 'Paris Champs-Élysées', 'FR', 'Paris', 'EUR', 'fr', 'flagship', 400, '2020-09-01', 'Europe/Paris', true),
('MAD-001', 'Madrid Gran Vía', 'ES', 'Madrid', 'EUR', 'es', 'standard', 350, '2021-01-15', 'Europe/Madrid', true)
ON CONFLICT (store_code) DO NOTHING;

-- Insert sample employees
INSERT INTO employees (employee_code, hashed_name, store_id, position, hire_date, language_preference, skills, max_hours_per_week, hourly_wage, is_active)
SELECT
    'EMP-' || s.country || '-' || generate_series(1, 5),
    encode(sha256(('Employee ' || s.country || '-' || generate_series(1, 5))::bytea), 'hex'),
    s.id,
    CASE generate_series(1, 5) % 5
        WHEN 0 THEN 'manager'
        WHEN 1 THEN 'sales_associate'
        WHEN 2 THEN 'cashier'
        WHEN 3 THEN 'stock_clerk'
        ELSE 'sales_associate'
    END,
    '2023-01-01'::date + (random() * 365)::integer * interval '1 day',
    s.language,
    jsonb_build_array(
        CASE generate_series(1, 5) % 3
            WHEN 0 THEN 'customer_service'
            WHEN 1 THEN 'inventory_management'
            ELSE 'pos'
        END,
        'teamwork'
    ),
    CASE s.country
        WHEN 'US' THEN 60  -- US: 60 hours/week (FLSA)
        WHEN 'GB' THEN 48  -- UK: 48 hours/week
        ELSE 48            -- EU: 48 hours/week (Working Time Directive)
    END,
    round((15 + random() * 10)::numeric, 2), -- $15-$25 per hour
    true
FROM stores s
ON CONFLICT (employee_code) DO NOTHING;

-- Insert sample products
INSERT INTO products (product_code, product_name, category, subcategory, brand, sku, unit_cost, selling_price, lead_time_days, is_active) VALUES
('PRD-001', 'Premium Leather Handbag', 'Fashion', 'Handbags', 'LuxeBrand', 'HB-001', 45.00, 120.00, 14, true),
('PRD-002', 'Classic Cotton T-Shirt', 'Apparel', 'Tops', 'BasicWear', 'TS-001', 8.00, 25.00, 7, true),
('PRD-003', 'Wireless Bluetooth Headphones', 'Electronics', 'Audio', 'SoundTech', 'WH-001', 35.00, 89.99, 21, true),
('PRD-004', 'Organic Coffee Beans 1kg', 'Food', 'Beverages', 'EcoBrew', 'CB-001', 12.00, 28.00, 5, true),
('PRD-005', 'Stainless Steel Water Bottle', 'Accessories', 'Hydration', 'EcoLife', 'WB-001', 7.50, 22.00, 10, true),
('PRD-006', 'Running Sneakers', 'Footwear', 'Athletic', 'SportPro', 'RS-001', 32.00, 85.00, 14, true),
('PRD-007', 'Ceramic Coffee Mug Set', 'Home', 'Kitchen', 'HomeEssentials', 'CM-001', 15.00, 38.00, 14, true),
('PRD-008', 'LED Desk Lamp', 'Home', 'Lighting', 'BrightHome', 'DL-001', 22.00, 55.00, 21, true),
('PRD-009', 'Yoga Mat Non-Slip', 'Sports', 'Fitness', 'ZenFit', 'YM-001', 18.00, 45.00, 10, true),
('PRD-010', 'Portable Power Bank 10000mAh', 'Electronics', 'Mobile', 'PowerTech', 'PB-001', 20.00, 49.99, 14, true)
ON CONFLICT (product_code) DO NOTHING;

-- Insert sample inventory for each store-product combination
INSERT INTO inventory (store_id, product_id, current_quantity, reorder_point, safety_stock, location_in_store, unit)
SELECT
    s.id,
    p.id,
    (random() * 50 + 5)::integer, -- 5-55 units
    10,
    5,
    'shelf_' || chr(65 + (p.id::text % 26)) || '_' || (random() * 5 + 1)::integer,
    'piece'
FROM stores s, products p
ON CONFLICT (store_id, product_id) DO NOTHING;

-- Insert sample traffic records (last 7 days)
INSERT INTO traffic_records (store_id, hashed_customer_id, x_coordinate, y_coordinate, zone_type, recorded_at, duration_seconds, path_sequence)
SELECT
    s.id,
    encode(sha256(('cust_' || generate_series(1, 100))::bytea), 'hex'),
    round((random() * 20)::numeric, 2),
    round((random() * 15)::numeric, 2),
    CASE (random() * 10)::integer
        WHEN 0 THEN 'entrance'
        WHEN 1 THEN 'cash_register'
        WHEN 2,3,4 THEN 'shelf_' || chr(65 + (random() * 4)::integer)
        WHEN 5 THEN 'fitting_room'
        ELSE 'general_area'
    END,
    NOW() - (random() * 7 * 24 * 60 * 60)::integer * interval '1 second',
    (random() * 300 + 30)::integer, -- 30-330 seconds
    jsonb_build_array(
        jsonb_build_object('x', round((random() * 20)::numeric, 2), 'y', round((random() * 15)::numeric, 2)),
        jsonb_build_object('x', round((random() * 20)::numeric, 2), 'y', round((random() * 15)::numeric, 2))
    )
FROM stores s
ON CONFLICT DO NOTHING;

-- Insert sample sales records (last 30 days)
INSERT INTO sales_records (store_id, transaction_id, transaction_date, total_amount, payment_method, sales_channel, currency)
SELECT
    s.id,
    'TXN-' || s.country || '-' || format_timestamp('YYYYMMDDHH24MISS', NOW() - (random() * 30 * 24 * 60 * 60)::integer * interval '1 second'),
    NOW() - (random() * 30 * 24 * 60 * 60)::integer * interval '1 second',
    round((random() * 200 + 20)::numeric, 2),
    CASE (random() * 3)::integer
        WHEN 0 THEN 'credit_card'
        WHEN 1 THEN 'debit_card'
        WHEN 2 THEN 'cash'
        ELSE 'mobile'
    END,
    'in_store',
    s.currency
FROM stores s, generate_series(1, 50) -- 50 transactions per store
ON CONFLICT (transaction_id) DO NOTHING;

-- Insert sample members
INSERT INTO members (member_code, hashed_email, hashed_phone, store_id, membership_tier, join_date, language_preference, marketing_consent, is_active)
SELECT
    'MEM-' || s.country || '-' || format_timestamp('YYYYMMDD', NOW() - (random() * 365 * 24 * 60 * 60)::integer * interval '1 second') || '-' || generate_series(1, 20),
    'm***@example.com',
    '***' || (random() * 8999 + 1000)::integer::text,
    s.id,
    CASE (random() * 10)::integer
        WHEN 0,1 THEN 'vip'
        WHEN 2,3,4 THEN 'gold'
        WHEN 5,6,7 THEN 'silver'
        ELSE 'regular'
    END,
    NOW() - (random() * 365 * 24 * 60 * 60)::integer * interval '1 second',
    s.language,
    (random() > 0.3), -- 70% opt-in rate
    true
FROM stores s
ON CONFLICT (member_code) DO NOTHING;

-- Insert sample RFM analysis
INSERT INTO rfm_analysis (member_id, analysis_date, recency_days, frequency, monetary, recency_score, frequency_score, monetary_score, rfm_score, segment)
SELECT
    m.id,
    CURRENT_DATE - (random() * 30)::integer * interval '1 day',
    (random() * 20 + 1)::integer,
    round((random() * 1000 + 50)::numeric, 2),
    CASE
        WHEN (random() * 30 + 1)::integer <= 30 THEN 5
        WHEN (random() * 30 + 1)::integer <= 60 THEN 4
        WHEN (random() * 30 + 1)::integer <= 90 THEN 3
        WHEN (random() * 30 + 1)::integer <= 180 THEN 2
        ELSE 1
    END,
    CASE (random() * 20 + 1)::integer
        WHEN 10,11,12 THEN 5
        WHEN 7,8,9 THEN 4
        WHEN 4,5,6 THEN 3
        WHEN 2,3 THEN 2
        ELSE 1
    END,
    CASE round((random() * 1000 + 50)::numeric, 2)
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
        ELSE 1
    END,
    CASE
        WHEN (random() * 30 + 1)::integer <= 30 THEN 5
        WHEN (random() * 30 + 1)::integer <= 60 THEN 4
        WHEN (random() * 30 + 1)::integer <= 90 THEN 3
        WHEN (random() * 30 + 1)::integer <= 180 THEN 2
        ELSE 1
    END +
    CASE (random() * 20 + 1)::integer
        WHEN 10,11,12 THEN 5
        WHEN 7,8,9 THEN 4
        WHEN 4,5,6 THEN 3
        WHEN 2,3 THEN 2
        ELSE 1
    END +
    CASE round((random() * 1000 + 50)::numeric, 2)
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
        ELSE 1
    END,
    CASE
        WHEN (random() * 30 + 1)::integer <= 30 THEN 5
        WHEN (random() * 30 + 1)::integer <= 60 THEN 4
        WHEN (random() * 30 + 1)::integer <= 90 THEN 3
        WHEN (random() * 30 + 1)::integer <= 180 THEN 2
        ELSE 1
    END +
    CASE (random() * 20 + 1)::integer
        WHEN 10,11,12 THEN 5
        WHEN 7,8,9 THEN 4
        WHEN 4,5,6 THEN 3
        WHEN 2,3 THEN 2
        ELSE 1
    END +
    CASE round((random() * 1000 + 50)::numeric, 2)
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
        ELSE 1
    END,
    CASE
        WHEN (random() * 30 + 1)::integer <= 30 THEN 5
        WHEN (random() * 30 + 1)::integer <= 60 THEN 4
        WHEN (random() * 30 + 1)::integer <= 90 THEN 3
        WHEN (random() * 30 + 1)::integer <= 180 THEN 2
        ELSE 1
    END +
    CASE (random() * 20 + 1)::integer
        WHEN 10,11,12 THEN 5
        WHEN 7,8,9 THEN 4
        WHEN 4,5,6 THEN 3
        WHEN 2,3 THEN 2
        ELSE 1
    END +
    CASE round((random() * 1000 + 50)::numeric, 2)
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
        WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
        ELSE 1
    END,
    CASE
        WHEN (CASE (random() * 30 + 1)::integer
            WHEN 10,11,12 THEN 5
            WHEN 7,8,9 THEN 4
            WHEN 4,5,6 THEN 3
            WHEN 2,3 THEN 2
            ELSE 1
        END >= 4) AND (CASE round((random() * 1000 + 50)::numeric, 2)
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
            ELSE 1
        END >= 4) THEN 'VIP'
        WHEN (random() * 30 + 1)::integer <= 30 THEN 'Loyal'
        WHEN (random() * 30 + 1)::integer > 180 THEN 'Churned'
        WHEN (CASE round((random() * 1000 + 50)::numeric, 2)
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 500 THEN 5
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 300 THEN 4
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 200 THEN 3
            WHEN round((random() * 1000 + 50)::numeric, 2) >= 100 THEN 2
            ELSE 1
        END >= 4) THEN 'High Value'
        ELSE 'Regular'
    END
FROM members m
ON CONFLICT DO NOTHING;

-- Insert sample churn predictions
INSERT INTO churn_predictions (member_id, prediction_date, churn_probability, risk_level, prediction, confidence_level)
SELECT
    m.id,
    CURRENT_DATE,
    round(random()::numeric, 2),
    CASE round(random()::numeric, 2)
        WHEN round(random()::numeric, 2) >= 0.7 THEN 'High'
        WHEN round(random()::numeric, 2) >= 0.4 THEN 'Medium'
        ELSE 'Low'
    END,
    CASE round(random()::numeric, 2)
        WHEN round(random()::numeric, 2) >= 0.5 THEN 'Churn'
        ELSE 'Retain'
    END,
    round(random() * 0.3 + 0.7::numeric, 2)
FROM members m
ON CONFLICT DO NOTHING;

-- Insert sample store audits
INSERT INTO store_audits (store_id, audit_date, audit_time, auditor_id, audit_type, overall_score, grade, total_violations, frames_analyzed, gdpr_compliant)
SELECT
    s.id,
    CURRENT_DATE - (random() * 7)::integer * interval '1 day',
    (random() * 10 + 8)::integer || ':00:00'::time,
    (SELECT id FROM employees WHERE store_id = s.id AND position = 'manager' LIMIT 1),
    CASE (random() * 2)::integer
        WHEN 0 THEN 'ai_remote'
        ELSE 'manual'
    END,
    round((random() * 30 + 70)::numeric, 2),
    CASE
        WHEN round((random() * 30 + 70)::numeric, 2) >= 95 THEN 'A+'
        WHEN round((random() * 30 + 70)::numeric, 2) >= 90 THEN 'A'
        WHEN round((random() * 30 + 70)::numeric, 2) >= 85 THEN 'B+'
        WHEN round((random() * 30 + 70)::numeric, 2) >= 80 THEN 'B'
        WHEN round((random() * 30 + 70)::numeric, 2) >= 75 THEN 'C+'
        WHEN round((random() * 30 + 70)::numeric, 2) >= 70 THEN 'C'
        ELSE 'D'
    END,
    (random() * 10)::integer,
    (random() * 100 + 50)::integer,
    true
FROM stores s
ON CONFLICT DO NOTHING;

-- Insert sample audit violations
INSERT INTO audit_violations (audit_id, violation_type, violation_severity, description, location_in_store, status)
SELECT
    a.id,
    CASE (random() * 5)::integer
        WHEN 0 THEN 'employee_without_badge'
        WHEN 1 THEN 'shelf_not_organized'
        WHEN 2 THEN 'floor_not_clean'
        WHEN 3 THEN 'product_misplaced'
        ELSE 'cashier_absent'
    END,
    CASE (random() * 3)::integer
        WHEN 0 THEN 'low'
        WHEN 1 THEN 'medium'
        WHEN 2 THEN 'high'
        ELSE 'critical'
    END,
    'Detected during audit',
    CASE (random() * 4)::integer
        WHEN 0 THEN 'entrance'
        WHEN 1 THEN 'shelf_a'
        WHEN 2 THEN 'shelf_b'
        ELSE 'cash_register'
    END,
    CASE (random() * 3)::integer
        WHEN 0 THEN 'open'
        WHEN 1 THEN 'in_progress'
        ELSE 'resolved'
    END
FROM store_audits a
ON CONFLICT DO NOTHING;

COMMENT ON TABLE stores IS '门店信息表';
COMMENT ON TABLE employees IS '员工信息表 (GDPR compliant)';
COMMENT ON TABLE traffic_records IS '客流记录表 (GDPR compliant - anonymized)';
COMMENT ON TABLE inventory IS '库存记录表';
COMMENT ON TABLE sales_records IS '销售记录表 (GDPR compliant)';
COMMENT ON TABLE members IS '会员信息表 (GDPR compliant)';
COMMENT ON TABLE store_audits IS '巡店记录表 (GDPR compliant)';
COMMENT ON TABLE rfm_analysis IS 'RFM客户价值分析表';
COMMENT ON TABLE churn_predictions IS '流失预测表';
