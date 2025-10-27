-- Djurdjura Water Distribution System Database Schema
-- This file contains all the necessary SQL to set up the database

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create regions table
CREATE TABLE IF NOT EXISTS regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE IF NOT EXISTS users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('admin', 'supervisor', 'regional_manager', 'operations')),
    region_id UUID REFERENCES regions(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE IF NOT EXISTS clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    contact_person VARCHAR(100),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE IF NOT EXISTS products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    volume VARCHAR(20) NOT NULL,
    units_per_pallet INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport_tariffs table
CREATE TABLE IF NOT EXISTS transport_tariffs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    driver_type VARCHAR(20) NOT NULL CHECK (driver_type IN ('factory', 'local')),
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE IF NOT EXISTS orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
    region_id UUID NOT NULL REFERENCES regions(id) ON DELETE CASCADE,
    assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'delivered', 'returned', 'cancelled')),
    total_price DECIMAL(10,2) NOT NULL,
    delivery_date DATE,
    delivery_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(20) DEFAULT 'info' CHECK (type IN ('info', 'warning', 'success', 'error')),
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE IF NOT EXISTS activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    action_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    affected_table VARCHAR(50) NOT NULL,
    affected_record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_region ON users(region_id);
CREATE INDEX IF NOT EXISTS idx_clients_region ON clients(region_id);
CREATE INDEX IF NOT EXISTS idx_orders_client ON orders(client_id);
CREATE INDEX IF NOT EXISTS idx_orders_region ON orders(region_id);
CREATE INDEX IF NOT EXISTS idx_orders_assigned ON orders(assigned_to);
CREATE INDEX IF NOT EXISTS idx_orders_status ON orders(status);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_table ON activity_logs(affected_table);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_products_updated_at BEFORE UPDATE ON products FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transport_tariffs_updated_at BEFORE UPDATE ON transport_tariffs FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create activity logging function
CREATE OR REPLACE FUNCTION log_activity()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO activity_logs (user_id, action_type, details, affected_table, affected_record_id)
    VALUES (
        COALESCE(NEW.user_id, OLD.user_id),
        TG_OP,
        CASE 
            WHEN TG_OP = 'INSERT' THEN 'Created new ' || TG_TABLE_NAME
            WHEN TG_OP = 'UPDATE' THEN 'Updated ' || TG_TABLE_NAME
            WHEN TG_OP = 'DELETE' THEN 'Deleted ' || TG_TABLE_NAME
        END,
        TG_TABLE_NAME,
        COALESCE(NEW.id, OLD.id)
    );
    RETURN COALESCE(NEW, OLD);
END;
$$ language 'plpgsql';

-- Create activity logging triggers
CREATE TRIGGER log_users_activity AFTER INSERT OR UPDATE OR DELETE ON users FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_clients_activity AFTER INSERT OR UPDATE OR DELETE ON clients FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_orders_activity AFTER INSERT OR UPDATE OR DELETE ON orders FOR EACH ROW EXECUTE FUNCTION log_activity();
CREATE TRIGGER log_products_activity AFTER INSERT OR UPDATE OR DELETE ON products FOR EACH ROW EXECUTE FUNCTION log_activity();

-- Row Level Security (RLS) Policies

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE regions ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE products ENABLE ROW LEVEL SECURITY;
ALTER TABLE transport_tariffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Regions policies (everyone can read, only admins can modify)
CREATE POLICY "Everyone can read regions" ON regions FOR SELECT USING (true);
CREATE POLICY "Only admins can modify regions" ON regions FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Users policies
CREATE POLICY "Users can read their own data" ON users FOR SELECT USING (id = auth.uid());
CREATE POLICY "Admins can read all users" ON users FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Regional managers can read users in their region" ON users FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'regional_manager' 
        AND u.region_id = users.region_id
    )
);
CREATE POLICY "Only admins can modify users" ON users FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Clients policies
CREATE POLICY "Everyone can read clients" ON clients FOR SELECT USING (true);
CREATE POLICY "Admins can modify clients" ON clients FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Regional managers can modify clients in their region" ON clients FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'regional_manager' 
        AND u.region_id = clients.region_id
    )
);

-- Products policies
CREATE POLICY "Everyone can read products" ON products FOR SELECT USING (true);
CREATE POLICY "Only admins can modify products" ON products FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Transport tariffs policies
CREATE POLICY "Everyone can read transport tariffs" ON transport_tariffs FOR SELECT USING (true);
CREATE POLICY "Only admins can modify transport tariffs" ON transport_tariffs FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);

-- Orders policies
CREATE POLICY "Users can read orders in their region" ON orders FOR SELECT USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND (u.role = 'admin' OR u.region_id = orders.region_id)
    )
);
CREATE POLICY "Users can read orders assigned to them" ON orders FOR SELECT USING (
    assigned_to = auth.uid()
);
CREATE POLICY "Admins can modify all orders" ON orders FOR ALL USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Regional managers can modify orders in their region" ON orders FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users u 
        WHERE u.id = auth.uid() 
        AND u.role = 'regional_manager' 
        AND u.region_id = orders.region_id
    )
);
CREATE POLICY "Operations can update assigned orders" ON orders FOR UPDATE USING (
    assigned_to = auth.uid()
);

-- Notifications policies
CREATE POLICY "Users can read their own notifications" ON notifications FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "Users can update their own notifications" ON notifications FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "System can insert notifications" ON notifications FOR INSERT WITH CHECK (true);

-- Activity logs policies
CREATE POLICY "Admins can read all activity logs" ON activity_logs FOR SELECT USING (
    EXISTS (SELECT 1 FROM users WHERE id = auth.uid() AND role = 'admin')
);
CREATE POLICY "Users can read their own activity logs" ON activity_logs FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "System can insert activity logs" ON activity_logs FOR INSERT WITH CHECK (true);

-- Insert initial data
INSERT INTO regions (id, name, description) VALUES 
    ('550e8400-e29b-41d4-a716-446655440001', 'East', 'Eastern region of Algeria'),
    ('550e8400-e29b-41d4-a716-446655440002', 'West', 'Western region of Algeria'),
    ('550e8400-e29b-41d4-a716-446655440003', 'Center', 'Central region of Algeria')
ON CONFLICT (id) DO NOTHING;

INSERT INTO users (id, name, email, role, region_id, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440010', 'Admin Djurdjura', 'admin@djurdjura.dz', 'admin', NULL, 'active'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Hamouch', 'hamouch@djurdjura.dz', 'regional_manager', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Mahmoud Djouadi', 'mahmoud@djurdjura.dz', 'supervisor', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Chef Région Ouest', 'chef.ouest@djurdjura.dz', 'regional_manager', '550e8400-e29b-41d4-a716-446655440002', 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO products (id, name, volume, units_per_pallet, unit_price, status) VALUES 
    ('550e8400-e29b-41d4-a716-446655440020', '5.5L Djurdjura Water', '5.5L', 212, 65.00, 'active'),
    ('550e8400-e29b-41d4-a716-446655440021', '1.5L Djurdjura Water', '1.5L', 112, 45.00, 'active')
ON CONFLICT (id) DO NOTHING;

INSERT INTO transport_tariffs (id, city, price, driver_type, region_id) VALUES 
    ('550e8400-e29b-41d4-a716-446655440030', 'Biskra', 31000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440031', 'Ouled Djellal', 28000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440032', 'Tebessa', 35000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440033', 'El Mghair', 25000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('550e8400-e29b-41d4-a716-446655440034', 'Oued Souf', 32000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (id) DO NOTHING;

-- Create functions for common operations
CREATE OR REPLACE FUNCTION assign_order_to_user(order_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    order_region UUID;
    user_role TEXT;
    user_region UUID;
BEGIN
    -- Get order region
    SELECT region_id INTO order_region FROM orders WHERE id = order_id;
    
    -- Get user role and region
    SELECT role, region_id INTO user_role, user_region FROM users WHERE id = user_id;
    
    -- Check if user can be assigned to this order
    IF user_role = 'admin' OR (user_role = 'regional_manager' AND user_region = order_region) THEN
        UPDATE orders SET assigned_to = user_id, updated_at = NOW() WHERE id = order_id;
        RETURN TRUE;
    ELSE
        RETURN FALSE;
    END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to get user dashboard data
CREATE OR REPLACE FUNCTION get_user_dashboard_data(user_id UUID)
RETURNS JSON AS $$
DECLARE
    user_role TEXT;
    user_region UUID;
    result JSON;
BEGIN
    -- Get user role and region
    SELECT role, region_id INTO user_role, user_region FROM users WHERE id = user_id;
    
    -- Build result based on role
    result := json_build_object(
        'role', user_role,
        'region_id', user_region,
        'orders', CASE 
            WHEN user_role = 'admin' THEN (
                SELECT json_agg(json_build_object(
                    'id', id,
                    'status', status,
                    'total_price', total_price,
                    'created_at', created_at
                ))
                FROM orders
                ORDER BY created_at DESC
                LIMIT 10
            )
            WHEN user_role = 'regional_manager' THEN (
                SELECT json_agg(json_build_object(
                    'id', id,
                    'status', status,
                    'total_price', total_price,
                    'created_at', created_at
                ))
                FROM orders
                WHERE region_id = user_region
                ORDER BY created_at DESC
                LIMIT 10
            )
            ELSE (
                SELECT json_agg(json_build_object(
                    'id', id,
                    'status', status,
                    'total_price', total_price,
                    'created_at', created_at
                ))
                FROM orders
                WHERE assigned_to = user_id
                ORDER BY created_at DESC
                LIMIT 10
            )
        END
    );
    
    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
