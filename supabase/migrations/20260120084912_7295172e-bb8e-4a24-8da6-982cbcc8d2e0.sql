-- Create products table
CREATE TABLE public.products (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    sku TEXT UNIQUE NOT NULL,
    base_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    current_price DECIMAL(10,2) NOT NULL DEFAULT 0,
    stock INTEGER NOT NULL DEFAULT 0,
    reorder_point INTEGER NOT NULL DEFAULT 10,
    demand_level TEXT NOT NULL DEFAULT 'medium' CHECK (demand_level IN ('low', 'medium', 'high')),
    category TEXT,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agents table
CREATE TABLE public.agents (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('inventory', 'pricing', 'customer_service', 'analytics')),
    status TEXT NOT NULL DEFAULT 'idle' CHECK (status IN ('idle', 'active', 'error', 'maintenance')),
    description TEXT,
    last_action TEXT,
    last_action_at TIMESTAMP WITH TIME ZONE,
    config JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create pricing_rules table
CREATE TABLE public.pricing_rules (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    rule_type TEXT NOT NULL CHECK (rule_type IN ('demand', 'stock', 'time', 'promotion')),
    conditions JSONB NOT NULL DEFAULT '{}',
    adjustment_type TEXT NOT NULL CHECK (adjustment_type IN ('percentage', 'fixed')),
    adjustment_value DECIMAL(10,2) NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    priority INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create customer_queries table
CREATE TABLE public.customer_queries (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    customer_name TEXT NOT NULL,
    query_text TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'resolved')),
    response TEXT,
    priority TEXT NOT NULL DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    assigned_agent_id UUID REFERENCES public.agents(id),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create agent_logs table
CREATE TABLE public.agent_logs (
    id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    agent_id UUID REFERENCES public.agents(id),
    agent_type TEXT NOT NULL,
    action TEXT NOT NULL,
    details JSONB DEFAULT '{}',
    status TEXT NOT NULL DEFAULT 'success' CHECK (status IN ('success', 'warning', 'error')),
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all tables (public access for now since no auth)
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pricing_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customer_queries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agent_logs ENABLE ROW LEVEL SECURITY;

-- Create public access policies (anyone can read/write for demo)
CREATE POLICY "Public read access" ON public.products FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.products FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.products FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.products FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.agents FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.agents FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.agents FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.agents FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.pricing_rules FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.pricing_rules FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.pricing_rules FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.pricing_rules FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.customer_queries FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.customer_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Public update access" ON public.customer_queries FOR UPDATE USING (true);
CREATE POLICY "Public delete access" ON public.customer_queries FOR DELETE USING (true);

CREATE POLICY "Public read access" ON public.agent_logs FOR SELECT USING (true);
CREATE POLICY "Public insert access" ON public.agent_logs FOR INSERT WITH CHECK (true);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON public.agents FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_pricing_rules_updated_at BEFORE UPDATE ON public.pricing_rules FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_customer_queries_updated_at BEFORE UPDATE ON public.customer_queries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Insert default agents
INSERT INTO public.agents (name, type, status, description) VALUES
    ('Inventory Monitor', 'inventory', 'active', 'Monitors stock levels and triggers reorder alerts'),
    ('Price Optimizer', 'pricing', 'active', 'Adjusts prices based on demand and stock levels'),
    ('Customer Service Bot', 'customer_service', 'active', 'Handles customer inquiries and FAQ responses'),
    ('Analytics Engine', 'analytics', 'active', 'Analyzes sales patterns and generates insights');

-- Insert sample products
INSERT INTO public.products (name, sku, base_price, current_price, stock, reorder_point, demand_level, category) VALUES
    ('Organic Apples', 'PROD-001', 4.99, 4.99, 150, 50, 'medium', 'Produce'),
    ('Whole Milk 1L', 'PROD-002', 3.49, 3.49, 200, 75, 'high', 'Dairy'),
    ('Artisan Bread', 'PROD-003', 5.99, 5.99, 45, 30, 'medium', 'Bakery'),
    ('Free Range Eggs', 'PROD-004', 6.99, 6.99, 80, 40, 'high', 'Dairy'),
    ('Premium Coffee', 'PROD-005', 12.99, 12.99, 25, 20, 'low', 'Beverages');

-- Insert sample pricing rules
INSERT INTO public.pricing_rules (name, rule_type, conditions, adjustment_type, adjustment_value, priority) VALUES
    ('High Demand Surge', 'demand', '{"demand_level": "high"}', 'percentage', 15, 10),
    ('Low Stock Premium', 'stock', '{"stock_below_reorder": true}', 'percentage', 10, 20),
    ('Low Demand Discount', 'demand', '{"demand_level": "low"}', 'percentage', -10, 5);

-- Enable realtime for all tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.products;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pricing_rules;
ALTER PUBLICATION supabase_realtime ADD TABLE public.customer_queries;
ALTER PUBLICATION supabase_realtime ADD TABLE public.agent_logs;