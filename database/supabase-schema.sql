-- Djurdjura Water Distribution System Database Schema
-- Supabase PostgreSQL Database Setup

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
CREATE TYPE user_role AS ENUM ('admin', 'supervisor', 'regional_manager', 'operations');
CREATE TYPE user_status AS ENUM ('active', 'inactive', 'pending');
CREATE TYPE order_status AS ENUM ('pending', 'in_progress', 'delivered', 'returned', 'cancelled');
CREATE TYPE notification_type AS ENUM ('info', 'warning', 'success', 'error');
CREATE TYPE driver_type AS ENUM ('factory', 'local');

-- Create regions table
CREATE TABLE regions (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create users table
CREATE TABLE users (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'operations',
    region_id UUID REFERENCES regions(id),
    status user_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create clients table
CREATE TABLE clients (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    address TEXT NOT NULL,
    region_id UUID NOT NULL REFERENCES regions(id),
    contact_person VARCHAR(100),
    rc_number VARCHAR(50),
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create products table
CREATE TABLE products (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    volume VARCHAR(20) NOT NULL,
    units_per_pallet INTEGER NOT NULL,
    unit_price DECIMAL(10,2) NOT NULL,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create transport_tariffs table
CREATE TABLE transport_tariffs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    city VARCHAR(100) NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    driver_type driver_type NOT NULL DEFAULT 'factory',
    region_id UUID NOT NULL REFERENCES regions(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create orders table
CREATE TABLE orders (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    client_id UUID NOT NULL REFERENCES clients(id),
    region_id UUID NOT NULL REFERENCES regions(id),
    assigned_to UUID REFERENCES users(id),
    status order_status NOT NULL DEFAULT 'pending',
    total_price DECIMAL(12,2) NOT NULL,
    product_5_5L_pallets INTEGER DEFAULT 0,
    product_1_5L_pallets INTEGER DEFAULT 0,
    truck_type VARCHAR(20) DEFAULT 'factory',
    truck_capacity INTEGER DEFAULT 22,
    delivery_date DATE,
    delivery_proof_url TEXT,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create notifications table
CREATE TABLE notifications (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    type notification_type NOT NULL DEFAULT 'info',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create activity_logs table
CREATE TABLE activity_logs (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    details TEXT NOT NULL,
    affected_table VARCHAR(100) NOT NULL,
    affected_record_id UUID,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_clients_region ON clients(region_id);
CREATE INDEX idx_orders_client ON orders(client_id);
CREATE INDEX idx_orders_status ON orders(status);
CREATE INDEX idx_orders_created_at ON orders(created_at);
CREATE INDEX idx_notifications_user ON notifications(user_id);
CREATE INDEX idx_notifications_read ON notifications(is_read);
CREATE INDEX idx_activity_logs_user ON activity_logs(user_id);
CREATE INDEX idx_activity_logs_table ON activity_logs(affected_table);

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

-- Insert initial data
INSERT INTO regions (id, name, description) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'East Region', 'Eastern Algeria region including Biskra, Ouled Djellal, El Mghair, Oued Souf, Tebessa'),
    ('550e8400-e29b-41d4-a716-446655440002', 'West Region', 'Western Algeria region'),
    ('550e8400-e29b-41d4-a716-446655440003', 'North Region', 'Northern Algeria region'),
    ('550e8400-e29b-41d4-a716-446655440004', 'South Region', 'Southern Algeria region');

-- Insert users with hashed passwords (password123 for all demo accounts)
INSERT INTO users (id, name, email, password_hash, role, region_id, status) VALUES
    ('550e8400-e29b-41d4-a716-446655440010', 'Admin Djurdjura', 'admin@djurdjura.dz', '$2a$10$rQZ8K9vXqH2nF3pL4mN5Ou6vR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'admin', NULL, 'active'),
    ('550e8400-e29b-41d4-a716-446655440011', 'Hamouch', 'hamouch@djurdjura.dz', '$2a$10$rQZ8K9vXqH2nF3pL4mN5Ou6vR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'regional_manager', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('550e8400-e29b-41d4-a716-446655440012', 'Mahmoud Djouadi', 'mahmoud@djurdjura.dz', '$2a$10$rQZ8K9vXqH2nF3pL4mN5Ou6vR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'supervisor', '550e8400-e29b-41d4-a716-446655440001', 'active'),
    ('550e8400-e29b-41d4-a716-446655440013', 'Operations Team', 'operations@djurdjura.dz', '$2a$10$rQZ8K9vXqH2nF3pL4mN5Ou6vR7sT8uV9wX0yZ1aB2cD3eF4gH5iJ6kL7mN8oP9qR', 'operations', NULL, 'active');

-- Insert products
INSERT INTO products (id, name, volume, units_per_pallet, unit_price) VALUES
    ('550e8400-e29b-41d4-a716-446655440020', 'Djurdjura Water 5.5L', '5.5L', 212, 65.00),
    ('550e8400-e29b-41d4-a716-446655440021', 'Djurdjura Water 1.5L', '1.5L', 112, 45.00);

-- Insert transport tariffs
INSERT INTO transport_tariffs (city, price, driver_type, region_id) VALUES
    ('Biskra', 31000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('Ouled Djellal', 28000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('El Mghair', 25000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('Oued Souf', 32000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001'),
    ('Tebessa', 35000.00, 'factory', '550e8400-e29b-41d4-a716-446655440001');

-- Insert sample clients
INSERT INTO clients (id, name, phone, address, region_id, contact_person, rc_number) VALUES
    ('550e8400-e29b-41d4-a716-446655440030', 'Biskra Water Distributor', '+213 33 123 456', '123 Main Street, Biskra', '550e8400-e29b-41d4-a716-446655440001', 'Ahmed Benali', '001234567'),
    ('550e8400-e29b-41d4-a716-446655440031', 'Ouled Djellal Commerce', '+213 33 234 567', '456 Commerce Avenue, Ouled Djellal', '550e8400-e29b-41d4-a716-446655440001', 'Fatima Zohra', '002345678'),
    ('550e8400-e29b-41d4-a716-446655440032', 'El Mghair Market', '+213 33 345 678', '789 Market Square, El Mghair', '550e8400-e29b-41d4-a716-446655440001', 'Mohamed Khelil', '003456789'),
    ('550e8400-e29b-41d4-a716-446655440033', 'Oued Souf Store', '+213 33 456 789', '321 Store Street, Oued Souf', '550e8400-e29b-41d4-a716-446655440001', 'Samir Mennacer', '004567890'),
    ('550e8400-e29b-41d4-a716-446655440034', 'Tebessa Trading', '+213 33 567 890', '654 Trading Center, Tebessa', '550e8400-e29b-41d4-a716-446655440001', 'Yasmine Bouzid', '005678901');

-- Insert sample orders
INSERT INTO orders (id, client_id, region_id, assigned_to, status, total_price, product_5_5L_pallets, product_1_5L_pallets, truck_type, truck_capacity, delivery_date, notes) VALUES
    ('550e8400-e29b-41d4-a716-446655440040', '550e8400-e29b-41d4-a716-446655440030', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 'pending', 125000.00, 11, 11, 'factory', 22, '2024-12-30', 'Urgent delivery required'),
    ('550e8400-e29b-41d4-a716-446655440041', '550e8400-e29b-41d4-a716-446655440031', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 'in_progress', 200000.00, 8, 2, 'factory', 24, '2024-12-28', 'Regular delivery'),
    ('550e8400-e29b-41d4-a716-446655440042', '550e8400-e29b-41d4-a716-446655440032', '550e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440013', 'delivered', 100000.00, 4, 1, 'factory', 22, '2024-12-25', 'Completed successfully');

-- Enable Row Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

-- Simplified policies to avoid recursion (for demo purposes)
CREATE POLICY "Allow all operations for demo" ON users FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON clients FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON orders FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON notifications FOR ALL USING (true);
CREATE POLICY "Allow all operations for demo" ON activity_logs FOR ALL USING (true);

-- Create a function to get user by email (for authentication)
CREATE OR REPLACE FUNCTION get_user_by_email(user_email TEXT)
RETURNS TABLE (
    id UUID,
    name VARCHAR(100),
    email VARCHAR(255),
    role user_role,
    region_id UUID,
    status user_status
) AS $$
BEGIN
    RETURN QUERY
    SELECT u.id, u.name, u.email, u.role, u.region_id, u.status
    FROM users u
    WHERE u.email = user_email AND u.status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
