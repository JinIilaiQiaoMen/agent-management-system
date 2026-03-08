-- 工厂供应链 AI 协同系统数据库表结构
-- 执行时间：$(date)

-- 1. 产品表
CREATE TABLE IF NOT EXISTS products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sku VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  category VARCHAR(100),
  description TEXT,
  unit VARCHAR(20) DEFAULT '件',
  unit_cost DECIMAL(10, 2) DEFAULT 0,
  selling_price DECIMAL(10, 2) DEFAULT 0,
  supplier_id UUID REFERENCES suppliers(id) ON DELETE SET NULL,
  lead_time_days INTEGER DEFAULT 7,
  min_stock_level INTEGER DEFAULT 0,
  max_stock_level INTEGER DEFAULT 1000,
  reorder_point INTEGER DEFAULT 100,
  safety_stock INTEGER DEFAULT 50,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'discontinued')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_products_sku ON products(sku);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_supplier_id ON products(supplier_id);
CREATE INDEX IF NOT EXISTS idx_products_status ON products(status);

COMMENT ON TABLE products IS '产品表';
COMMENT ON COLUMN products.sku IS '产品SKU编码';
COMMENT ON COLUMN products.unit_cost IS '单位成本';
COMMENT ON COLUMN products.selling_price IS '销售价格';
COMMENT ON COLUMN products.lead_time_days IS '交货周期（天）';
COMMENT ON COLUMN products.min_stock_level IS '最小库存量';
COMMENT ON COLUMN products.max_stock_level IS '最大库存量';
COMMENT ON COLUMN products.reorder_point IS '补货点';
COMMENT ON COLUMN products.safety_stock IS '安全库存';

-- 2. 供应商表
CREATE TABLE IF NOT EXISTS suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  contact_person VARCHAR(100),
  email VARCHAR(255),
  phone VARCHAR(20),
  address TEXT,
  rating DECIMAL(3, 2) DEFAULT 5.00,
  status VARCHAR(50) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blacklisted')),
  payment_terms VARCHAR(100),
  lead_time_days INTEGER DEFAULT 7,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_suppliers_name ON suppliers(name);
CREATE INDEX IF NOT EXISTS idx_suppliers_status ON suppliers(status);

COMMENT ON TABLE suppliers IS '供应商表';
COMMENT ON COLUMN suppliers.rating IS '供应商评级（1-5）';
COMMENT ON COLUMN suppliers.lead_time_days IS '标准交货周期';

-- 3. 库存表
CREATE TABLE IF NOT EXISTS inventory (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  warehouse_id VARCHAR(50) DEFAULT 'main',
  quantity_on_hand INTEGER DEFAULT 0,
  quantity_allocated INTEGER DEFAULT 0,
  quantity_available INTEGER GENERATED ALWAYS AS (quantity_on_hand - quantity_allocated) STORED,
  average_cost DECIMAL(10, 2) DEFAULT 0,
  total_value DECIMAL(15, 2) GENERATED ALWAYS AS (quantity_on_hand * average_cost) STORED,
  last_restocked_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, warehouse_id)
);

CREATE INDEX IF NOT EXISTS idx_inventory_product_id ON inventory(product_id);
CREATE INDEX IF NOT EXISTS idx_inventory_warehouse_id ON inventory(warehouse_id);

COMMENT ON TABLE inventory IS '库存表';
COMMENT ON COLUMN inventory.quantity_on_hand IS '现有库存量';
COMMENT ON COLUMN inventory.quantity_allocated IS '已分配库存量';
COMMENT ON COLUMN inventory.quantity_available IS '可用库存量';

-- 4. 销售订单表
CREATE TABLE IF NOT EXISTS sales_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  customer_name VARCHAR(255) NOT NULL,
  customer_email VARCHAR(255),
  customer_phone VARCHAR(20),
  order_date DATE NOT NULL,
  delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount DECIMAL(15, 2) DEFAULT 0,
  discount_amount DECIMAL(10, 2) DEFAULT 0,
  shipping_address TEXT,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_orders_order_number ON sales_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_sales_orders_customer_name ON sales_orders(customer_name);
CREATE INDEX IF NOT EXISTS idx_sales_orders_order_date ON sales_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_sales_orders_status ON sales_orders(status);

COMMENT ON TABLE sales_orders IS '销售订单表';
COMMENT ON COLUMN sales_orders.order_number IS '订单编号';

-- 5. 销售订单明细表
CREATE TABLE IF NOT EXISTS sales_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sales_order_id UUID NOT NULL REFERENCES sales_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku VARCHAR(100),
  product_name VARCHAR(255),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(10, 2) NOT NULL,
  discount_percent DECIMAL(5, 2) DEFAULT 0,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity * unit_price * (1 - discount_percent/100)) STORED,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_sales_order_items_sales_order_id ON sales_order_items(sales_order_id);
CREATE INDEX IF NOT EXISTS idx_sales_order_items_product_id ON sales_order_items(product_id);

COMMENT ON TABLE sales_order_items IS '销售订单明细表';

-- 6. 采购订单表
CREATE TABLE IF NOT EXISTS purchase_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  supplier_id UUID NOT NULL REFERENCES suppliers(id) ON DELETE RESTRICT,
  order_date DATE NOT NULL,
  expected_delivery_date DATE,
  actual_delivery_date DATE,
  status VARCHAR(50) DEFAULT 'pending' CHECK (status IN ('pending', 'confirmed', 'received', 'partial', 'cancelled')),
  total_amount DECIMAL(15, 2) DEFAULT 0,
  currency VARCHAR(10) DEFAULT 'CNY',
  payment_status VARCHAR(50) DEFAULT 'unpaid' CHECK (payment_status IN ('unpaid', 'partial', 'paid')),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_number ON purchase_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_supplier_id ON purchase_orders(supplier_id);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_order_date ON purchase_orders(order_date);
CREATE INDEX IF NOT EXISTS idx_purchase_orders_status ON purchase_orders(status);

COMMENT ON TABLE purchase_orders IS '采购订单表';

-- 7. 采购订单明细表
CREATE TABLE IF NOT EXISTS purchase_order_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  purchase_order_id UUID NOT NULL REFERENCES purchase_orders(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  sku VARCHAR(100),
  quantity_ordered INTEGER NOT NULL,
  quantity_received INTEGER DEFAULT 0,
  unit_cost DECIMAL(10, 2) NOT NULL,
  line_total DECIMAL(12, 2) GENERATED ALWAYS AS (quantity_ordered * unit_cost) STORED,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_purchase_order_items_purchase_order_id ON purchase_order_items(purchase_order_id);
CREATE INDEX IF NOT EXISTS idx_purchase_order_items_product_id ON purchase_order_items(product_id);

COMMENT ON TABLE purchase_order_items IS '采购订单明细表';

-- 8. 生产订单表
CREATE TABLE IF NOT EXISTS production_orders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_number VARCHAR(100) UNIQUE NOT NULL,
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  quantity_ordered INTEGER NOT NULL,
  quantity_completed INTEGER DEFAULT 0,
  start_date DATE,
  end_date DATE,
  status VARCHAR(50) DEFAULT 'planned' CHECK (status IN ('planned', 'in_progress', 'completed', 'cancelled', 'on_hold')),
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5),
  production_line VARCHAR(50),
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_production_orders_order_number ON production_orders(order_number);
CREATE INDEX IF NOT EXISTS idx_production_orders_product_id ON production_orders(product_id);
CREATE INDEX IF NOT EXISTS idx_production_orders_status ON production_orders(status);
CREATE INDEX IF NOT EXISTS idx_production_orders_priority ON production_orders(priority);

COMMENT ON TABLE production_orders IS '生产订单表';
COMMENT ON COLUMN production_orders.priority IS '优先级（1-最高，5-最低）';

-- 9. 品控检查表
CREATE TABLE IF NOT EXISTS quality_control (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  check_number VARCHAR(100) UNIQUE NOT NULL,
  batch_number VARCHAR(100),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE RESTRICT,
  production_order_id UUID REFERENCES production_orders(id) ON DELETE SET NULL,
  check_date DATE NOT NULL,
  check_type VARCHAR(50) CHECK (check_type IN ('incoming', 'in_process', 'final', 'outgoing')),
  quantity_checked INTEGER NOT NULL,
  quantity_passed INTEGER DEFAULT 0,
  quantity_failed INTEGER DEFAULT 0,
  pass_rate DECIMAL(5, 2) GENERATED ALWAYS AS (CASE WHEN quantity_checked > 0 THEN (quantity_passed::DECIMAL / quantity_checked * 100) ELSE 0 END) STORED,
  inspector_name VARCHAR(100),
  issues TEXT,
  action_taken VARCHAR(255),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_quality_control_check_number ON quality_control(check_number);
CREATE INDEX IF NOT EXISTS idx_quality_control_product_id ON quality_control(product_id);
CREATE INDEX IF NOT EXISTS idx_quality_control_check_date ON quality_control(check_date);
CREATE INDEX IF NOT EXISTS idx_quality_control_check_type ON quality_control(check_type);

COMMENT ON TABLE quality_control IS '品控检查表';
COMMENT ON COLUMN quality_control.check_type IS '检查类型：incoming-来料, in_process-过程, final-最终, outgoing-出货';
COMMENT ON COLUMN quality_control.pass_rate IS '合格率（%）';

-- 10. 成本记录表
CREATE TABLE IF NOT EXISTS cost_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  record_number VARCHAR(100) UNIQUE NOT NULL,
  product_id UUID REFERENCES products(id) ON DELETE SET NULL,
  production_order_id UUID REFERENCES production_orders(id) ON DELETE SET NULL,
  cost_type VARCHAR(50) NOT NULL CHECK (cost_type IN ('material', 'labor', 'overhead', 'shipping', 'other')),
  cost_date DATE NOT NULL,
  cost_category VARCHAR(100),
  cost_amount DECIMAL(12, 2) NOT NULL,
  currency VARCHAR(10) DEFAULT 'CNY',
  quantity DECIMAL(10, 2),
  unit_cost DECIMAL(10, 2) GENERATED ALWAYS AS (CASE WHEN quantity > 0 THEN cost_amount / quantity ELSE 0 END) STORED,
  notes TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_cost_records_record_number ON cost_records(record_number);
CREATE INDEX IF NOT EXISTS idx_cost_records_product_id ON cost_records(product_id);
CREATE INDEX IF NOT EXISTS idx_cost_records_cost_type ON cost_records(cost_type);
CREATE INDEX IF NOT EXISTS idx_cost_records_cost_date ON cost_records(cost_date);

COMMENT ON TABLE cost_records IS '成本记录表';
COMMENT ON COLUMN cost_records.cost_type IS '成本类型：material-材料, labor-人工, overhead-制造费用, shipping-运输, other-其他';

-- 11. 需求预测表
CREATE TABLE IF NOT EXISTS demand_forecasts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES products(id) ON DELETE CASCADE,
  forecast_date DATE NOT NULL,
  forecast_period_start DATE NOT NULL,
  forecast_period_end DATE NOT NULL,
  predicted_quantity INTEGER NOT NULL,
  actual_quantity INTEGER,
  accuracy_rate DECIMAL(5, 2),
  confidence_level VARCHAR(20) CHECK (confidence_level IN ('high', 'medium', 'low')),
  forecast_method VARCHAR(50) DEFAULT 'ai',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(product_id, forecast_date)
);

CREATE INDEX IF NOT EXISTS idx_demand_forecasts_product_id ON demand_forecasts(product_id);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_forecast_date ON demand_forecasts(forecast_date);
CREATE INDEX IF NOT EXISTS idx_demand_forecasts_forecast_period ON demand_forecasts(forecast_period_start, forecast_period_end);

COMMENT ON TABLE demand_forecasts IS '需求预测表';
COMMENT ON COLUMN demand_forecasts.confidence_level IS '置信度：high-高, medium-中, low-低';
COMMENT ON COLUMN demand_forecasts.forecast_method IS '预测方法：ai-AI预测, statistical-统计分析, expert-专家评估';

-- 12. 供应链事件表
CREATE TABLE IF NOT EXISTS supply_chain_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(50) NOT NULL CHECK (event_type IN ('order_created', 'order_confirmed', 'order_shipped', 'order_delivered', 'low_stock', 'out_of_stock', 'quality_issue', 'cost_alert', 'forecast_updated', 'production_started', 'production_completed')),
  event_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  entity_type VARCHAR(50),
  entity_id UUID,
  description TEXT,
  severity VARCHAR(20) DEFAULT 'info' CHECK (severity IN ('info', 'warning', 'error', 'critical')),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_supply_chain_events_event_type ON supply_chain_events(event_type);
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_event_date ON supply_chain_events(event_date);
CREATE INDEX IF NOT EXISTS idx_supply_chain_events_severity ON supply_chain_events(severity);

COMMENT ON TABLE supply_chain_events IS '供应链事件表';

-- 13. 更新时间触发器
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 为需要更新时间的表添加触发器
DO $$
BEGIN
  -- Products
  DROP TRIGGER IF EXISTS update_products_updated_at ON products;
  CREATE TRIGGER update_products_updated_at
    BEFORE UPDATE ON products
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Suppliers
  DROP TRIGGER IF EXISTS update_suppliers_updated_at ON suppliers;
  CREATE TRIGGER update_suppliers_updated_at
    BEFORE UPDATE ON suppliers
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Inventory
  DROP TRIGGER IF EXISTS update_inventory_updated_at ON inventory;
  CREATE TRIGGER update_inventory_updated_at
    BEFORE UPDATE ON inventory
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Sales Orders
  DROP TRIGGER IF EXISTS update_sales_orders_updated_at ON sales_orders;
  CREATE TRIGGER update_sales_orders_updated_at
    BEFORE UPDATE ON sales_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Purchase Orders
  DROP TRIGGER IF EXISTS update_purchase_orders_updated_at ON purchase_orders;
  CREATE TRIGGER update_purchase_orders_updated_at
    BEFORE UPDATE ON purchase_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Production Orders
  DROP TRIGGER IF EXISTS update_production_orders_updated_at ON production_orders;
  CREATE TRIGGER update_production_orders_updated_at
    BEFORE UPDATE ON production_orders
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

  -- Demand Forecasts
  DROP TRIGGER IF EXISTS update_demand_forecasts_updated_at ON demand_forecasts;
  CREATE TRIGGER update_demand_forecasts_updated_at
    BEFORE UPDATE ON demand_forecasts
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();
END $$;

-- 14. 创建视图

-- 库存预警视图
CREATE OR REPLACE VIEW inventory_alerts AS
SELECT
  i.id,
  i.product_id,
  p.sku,
  p.name as product_name,
  p.category,
  i.warehouse_id,
  i.quantity_on_hand,
  i.quantity_available,
  i.quantity_allocated,
  p.min_stock_level,
  p.reorder_point,
  p.safety_stock,
  p.max_stock_level,
  CASE
    WHEN i.quantity_available <= 0 THEN 'out_of_stock'
    WHEN i.quantity_available <= p.min_stock_level THEN 'critical'
    WHEN i.quantity_available <= p.reorder_point THEN 'low_stock'
    WHEN i.quantity_available >= p.max_stock_level THEN 'overstock'
    ELSE 'normal'
  END as alert_level,
  p.unit_cost,
  i.total_value,
  i.last_restocked_at
FROM inventory i
JOIN products p ON i.product_id = p.id
WHERE p.status = 'active'
ORDER BY
  CASE
    WHEN i.quantity_available <= 0 THEN 1
    WHEN i.quantity_available <= p.min_stock_level THEN 2
    WHEN i.quantity_available <= p.reorder_point THEN 3
    ELSE 4
  END;

COMMENT ON VIEW inventory_alerts IS '库存预警视图';

-- 供应链概览视图
CREATE OR REPLACE VIEW supply_chain_overview AS
SELECT
  (SELECT COUNT(*) FROM products WHERE status = 'active') as total_products,
  (SELECT COUNT(*) FROM suppliers WHERE status = 'active') as total_suppliers,
  (SELECT COUNT(*) FROM sales_orders WHERE status IN ('confirmed', 'processing', 'shipped')) as active_sales_orders,
  (SELECT COUNT(*) FROM purchase_orders WHERE status IN ('pending', 'confirmed')) as active_purchase_orders,
  (SELECT COUNT(*) FROM production_orders WHERE status = 'in_progress') as active_production_orders,
  (SELECT COUNT(*) FROM quality_control WHERE check_date = CURRENT_DATE) as quality_checks_today,
  (SELECT SUM(total_value) FROM inventory) as total_inventory_value,
  (SELECT COUNT(*) FROM inventory_alerts WHERE alert_level IN ('out_of_stock', 'critical')) as critical_stock_alerts;

COMMENT ON VIEW supply_chain_overview IS '供应链概览视图';

-- 迁移完成
SELECT 'Supply chain database migration completed!' as status;
