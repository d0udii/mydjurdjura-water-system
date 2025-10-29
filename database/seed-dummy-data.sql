-- Seed Dummy Data for Djurdjura Water System
-- This script adds sample data to all tables

-- Clear existing data (optional - comment out if you want to keep existing data)
-- DELETE FROM orders;
-- DELETE FROM clients;
-- DELETE FROM products;
-- DELETE FROM transport_tariffs;
-- DELETE FROM bl_numbers;
-- DELETE FROM notifications;
-- DELETE FROM activity_logs;

-- Insert additional regions
INSERT INTO regions (id, name, responsible, created_at, updated_at) VALUES
('region-2', 'Tizi Ouzou', 'Ahmed Benali', NOW(), NOW()),
('region-3', 'Bejaia', 'Fatima Zohra', NOW(), NOW()),
('region-4', 'Boumerdes', 'Omar Khelil', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert additional products
INSERT INTO products (id, name, volume, units_per_pallet, unit_price, created_at, updated_at) VALUES
('prod-2', 'Water Bottle 1.5L', 1.5, 24, 25.00, NOW(), NOW()),
('prod-3', 'Water Bottle 0.5L', 0.5, 48, 15.00, NOW(), NOW()),
('prod-4', 'Water Jug 5L', 5.0, 4, 75.00, NOW(), NOW()),
('prod-5', 'Water Jug 10L', 10.0, 2, 120.00, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert additional transport tariffs
INSERT INTO transport_tariffs (id, city, price, region_id, created_at, updated_at) VALUES
('tariff-2', 'Tizi Ouzou', 150.00, 'region-2', NOW(), NOW()),
('tariff-3', 'Bejaia', 200.00, 'region-3', NOW(), NOW()),
('tariff-4', 'Boumerdes', 120.00, 'region-4', NOW(), NOW()),
('tariff-5', 'Azazga', 180.00, 'region-1', NOW(), NOW()),
('tariff-6', 'Mekla', 160.00, 'region-1', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert additional clients
INSERT INTO clients (id, name, phone, address, region_id, contact_person, rc_number, status, created_at, updated_at) VALUES
('client-2', 'Restaurant Le Palmier', '+213 555 123 456', '123 Avenue de la République, Tizi Ouzou', 'region-2', 'Mohamed Boudiaf', 'RC123456789', 'active', NOW(), NOW()),
('client-3', 'Hotel Les Pins', '+213 555 234 567', '456 Boulevard de l''Indépendance, Bejaia', 'region-3', 'Aicha Benali', 'RC234567890', 'active', NOW(), NOW()),
('client-4', 'Café Central', '+213 555 345 678', '789 Rue de la Paix, Boumerdes', 'region-4', 'Karim Ouali', 'RC345678901', 'active', NOW(), NOW()),
('client-5', 'Boulangerie Moderne', '+213 555 456 789', '321 Place du Marché, Tizi Ouzou', 'region-2', 'Fatima Zohra', 'RC456789012', 'active', NOW(), NOW()),
('client-6', 'Supermarket Express', '+213 555 567 890', '654 Avenue des Martyrs, Bejaia', 'region-3', 'Omar Khelil', 'RC567890123', 'active', NOW(), NOW()),
('client-7', 'Restaurant El Djurdjura', '+213 555 678 901', '987 Rue de la Liberté, Boumerdes', 'region-4', 'Nadia Cherif', 'RC678901234', 'active', NOW(), NOW()),
('client-8', 'Café des Amis', '+213 555 789 012', '147 Avenue de l''Armée, Tizi Ouzou', 'region-2', 'Ahmed Benali', 'RC789012345', 'active', NOW(), NOW()),
('client-9', 'Hotel Kabylie', '+213 555 890 123', '258 Boulevard de la Révolution, Bejaia', 'region-3', 'Yasmine Boudiaf', 'RC890123456', 'active', NOW(), NOW()),
('client-10', 'Boulangerie du Centre', '+213 555 901 234', '369 Place de la République, Boumerdes', 'region-4', 'Hakim Ouali', 'RC901234567', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert additional users
INSERT INTO users (id, name, email, password, role, region_id, status, approved, created_at, updated_at) VALUES
('user-2', 'Ahmed Benali', 'ahmed.benali@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', 'region-2', 'active', true, NOW(), NOW()),
('user-3', 'Fatima Zohra', 'fatima.zohra@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', 'region-3', 'active', true, NOW(), NOW()),
('user-4', 'Omar Khelil', 'omar.khelil@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', 'region-4', 'active', true, NOW(), NOW()),
('user-5', 'Nadia Cherif', 'nadia.cherif@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'operations', 'region-1', 'active', true, NOW(), NOW()),
('user-6', 'Karim Ouali', 'karim.ouali@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'operations', 'region-2', 'active', true, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert BL numbers
INSERT INTO bl_numbers (id, bl_number, order_id, status, created_at, updated_at) VALUES
('bl-1', 'BL2024001', 'order-1', 'active', NOW(), NOW()),
('bl-2', 'BL2024002', 'order-2', 'active', NOW(), NOW()),
('bl-3', 'BL2024003', 'order-3', 'active', NOW(), NOW()),
('bl-4', 'BL2024004', 'order-4', 'active', NOW(), NOW()),
('bl-5', 'BL2024005', 'order-5', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert sample orders
INSERT INTO orders (id, client_id, product_id, quantity, unit_price, total_amount, status, order_date, delivery_date, created_at, updated_at) VALUES
('order-1', 'client-1', 'prod-1', 10, 50.00, 500.00, 'pending', NOW(), NOW() + INTERVAL '3 days', NOW(), NOW()),
('order-2', 'client-2', 'prod-2', 5, 25.00, 125.00, 'confirmed', NOW(), NOW() + INTERVAL '2 days', NOW(), NOW()),
('order-3', 'client-3', 'prod-3', 20, 15.00, 300.00, 'in_transit', NOW(), NOW() + INTERVAL '1 day', NOW(), NOW()),
('order-4', 'client-4', 'prod-4', 3, 75.00, 225.00, 'delivered', NOW() - INTERVAL '1 day', NOW() - INTERVAL '1 day', NOW(), NOW()),
('order-5', 'client-5', 'prod-5', 2, 120.00, 240.00, 'delivered', NOW() - INTERVAL '2 days', NOW() - INTERVAL '2 days', NOW(), NOW()),
('order-6', 'client-6', 'prod-1', 15, 50.00, 750.00, 'pending', NOW(), NOW() + INTERVAL '4 days', NOW(), NOW()),
('order-7', 'client-7', 'prod-2', 8, 25.00, 200.00, 'confirmed', NOW(), NOW() + INTERVAL '3 days', NOW(), NOW()),
('order-8', 'client-8', 'prod-3', 12, 15.00, 180.00, 'in_transit', NOW(), NOW() + INTERVAL '2 days', NOW(), NOW()),
('order-9', 'client-9', 'prod-4', 4, 75.00, 300.00, 'delivered', NOW() - INTERVAL '3 days', NOW() - INTERVAL '3 days', NOW(), NOW()),
('order-10', 'client-10', 'prod-5', 1, 120.00, 120.00, 'delivered', NOW() - INTERVAL '5 days', NOW() - INTERVAL '5 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at, updated_at) VALUES
('notif-1', 'user-1', 'New Order Received', 'Order #order-1 has been received from Restaurant Le Palmier', 'order', false, NOW(), NOW()),
('notif-2', 'user-2', 'Order Confirmed', 'Order #order-2 has been confirmed and is ready for processing', 'order', false, NOW(), NOW()),
('notif-3', 'user-3', 'Delivery Scheduled', 'Order #order-3 is scheduled for delivery tomorrow', 'delivery', false, NOW(), NOW()),
('notif-4', 'user-4', 'Order Delivered', 'Order #order-4 has been successfully delivered', 'delivery', true, NOW(), NOW()),
('notif-5', 'user-5', 'New Client Registered', 'New client Hotel Les Pins has been registered in your region', 'client', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert activity logs
INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, entity_name, old_values, new_values, created_at) VALUES
('log-1', 'user-1', 'Admin User', 'CREATE', 'Client', 'client-2', 'Restaurant Le Palmier', '{}', '{"name":"Restaurant Le Palmier","phone":"+213 555 123 456","address":"123 Avenue de la République, Tizi Ouzou","region_id":"region-2"}', NOW()),
('log-2', 'user-2', 'Ahmed Benali', 'CREATE', 'Order', 'order-2', 'Order #order-2', '{}', '{"client_id":"client-2","product_id":"prod-2","quantity":5,"total_amount":125.00}', NOW()),
('log-3', 'user-3', 'Fatima Zohra', 'UPDATE', 'Order', 'order-3', 'Order #order-3', '{"status":"pending"}', '{"status":"in_transit"}', NOW()),
('log-4', 'user-4', 'Omar Khelil', 'UPDATE', 'Order', 'order-4', 'Order #order-4', '{"status":"in_transit"}', '{"status":"delivered"}', NOW()),
('log-5', 'user-5', 'Nadia Cherif', 'CREATE', 'Product', 'prod-2', 'Water Bottle 1.5L', '{}', '{"name":"Water Bottle 1.5L","volume":1.5,"unit_price":25.00}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Update order references in BL numbers
UPDATE bl_numbers SET order_id = 'order-1' WHERE id = 'bl-1';
UPDATE bl_numbers SET order_id = 'order-2' WHERE id = 'bl-2';
UPDATE bl_numbers SET order_id = 'order-3' WHERE id = 'bl-3';
UPDATE bl_numbers SET order_id = 'order-4' WHERE id = 'bl-4';
UPDATE bl_numbers SET order_id = 'order-5' WHERE id = 'bl-5';

-- Add some additional transport tariffs for more variety
INSERT INTO transport_tariffs (id, city, price, region_id, created_at, updated_at) VALUES
('tariff-7', 'Draa El Mizan', 140.00, 'region-1', NOW(), NOW()),
('tariff-8', 'Boghni', 160.00, 'region-1', NOW(), NOW()),
('tariff-9', 'Ain El Hammam', 180.00, 'region-2', NOW(), NOW()),
('tariff-10', 'Iferhounene', 170.00, 'region-2', NOW(), NOW()),
('tariff-11', 'Akbou', 190.00, 'region-3', NOW(), NOW()),
('tariff-12', 'Souk El Tenine', 210.00, 'region-3', NOW(), NOW()),
('tariff-13', 'Boudouaou', 130.00, 'region-4', NOW(), NOW()),
('tariff-14', 'Naciria', 150.00, 'region-4', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add more clients for better data variety
INSERT INTO clients (id, name, phone, address, region_id, contact_person, rc_number, status, created_at, updated_at) VALUES
('client-11', 'Café de la Gare', '+213 555 012 345', '789 Avenue de la Gare, Tizi Ouzou', 'region-2', 'Lila Benali', 'RC012345678', 'active', NOW(), NOW()),
('client-12', 'Restaurant El Firdaous', '+213 555 123 456', '456 Rue de la Mosquée, Bejaia', 'region-3', 'Youssef Cherif', 'RC123456789', 'active', NOW(), NOW()),
('client-13', 'Boulangerie du Quartier', '+213 555 234 567', '321 Place du Souk, Boumerdes', 'region-4', 'Amina Ouali', 'RC234567890', 'active', NOW(), NOW()),
('client-14', 'Hotel El Djurdjura', '+213 555 345 678', '654 Boulevard de l''Indépendance, Tizi Ouzou', 'region-2', 'Mohamed Boudiaf', 'RC345678901', 'active', NOW(), NOW()),
('client-15', 'Café des Artistes', '+213 555 456 789', '987 Rue de la Culture, Bejaia', 'region-3', 'Fatima Zohra', 'RC456789012', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add more orders with different statuses
INSERT INTO orders (id, client_id, product_id, quantity, unit_price, total_amount, status, order_date, delivery_date, created_at, updated_at) VALUES
('order-11', 'client-11', 'prod-1', 7, 50.00, 350.00, 'pending', NOW(), NOW() + INTERVAL '5 days', NOW(), NOW()),
('order-12', 'client-12', 'prod-2', 12, 25.00, 300.00, 'confirmed', NOW(), NOW() + INTERVAL '4 days', NOW(), NOW()),
('order-13', 'client-13', 'prod-3', 25, 15.00, 375.00, 'in_transit', NOW(), NOW() + INTERVAL '3 days', NOW(), NOW()),
('order-14', 'client-14', 'prod-4', 6, 75.00, 450.00, 'delivered', NOW() - INTERVAL '4 days', NOW() - INTERVAL '4 days', NOW(), NOW()),
('order-15', 'client-15', 'prod-5', 3, 120.00, 360.00, 'delivered', NOW() - INTERVAL '6 days', NOW() - INTERVAL '6 days', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add corresponding BL numbers
INSERT INTO bl_numbers (id, bl_number, order_id, status, created_at, updated_at) VALUES
('bl-6', 'BL2024006', 'order-11', 'active', NOW(), NOW()),
('bl-7', 'BL2024007', 'order-12', 'active', NOW(), NOW()),
('bl-8', 'BL2024008', 'order-13', 'active', NOW(), NOW()),
('bl-9', 'BL2024009', 'order-14', 'active', NOW(), NOW()),
('bl-10', 'BL2024010', 'order-15', 'active', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add more notifications
INSERT INTO notifications (id, user_id, title, message, type, read, created_at, updated_at) VALUES
('notif-6', 'user-2', 'Order Status Update', 'Order #order-11 status changed to pending', 'order', false, NOW(), NOW()),
('notif-7', 'user-3', 'New Delivery Assignment', 'You have been assigned to deliver Order #order-12', 'delivery', false, NOW(), NOW()),
('notif-8', 'user-4', 'Order Completed', 'Order #order-14 has been successfully completed', 'order', true, NOW(), NOW()),
('notif-9', 'user-5', 'Client Activity', 'Client Restaurant El Firdaous placed a new order', 'client', false, NOW(), NOW()),
('notif-10', 'user-1', 'System Alert', 'High demand detected for Water Bottle 1.5L in Tizi Ouzou region', 'system', false, NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Add more activity logs
INSERT INTO activity_logs (id, user_id, user_name, action, entity_type, entity_id, entity_name, old_values, new_values, created_at) VALUES
('log-6', 'user-2', 'Ahmed Benali', 'CREATE', 'Client', 'client-11', 'Café de la Gare', '{}', '{"name":"Café de la Gare","phone":"+213 555 012 345","address":"789 Avenue de la Gare, Tizi Ouzou","region_id":"region-2"}', NOW()),
('log-7', 'user-3', 'Fatima Zohra', 'CREATE', 'Order', 'order-12', 'Order #order-12', '{}', '{"client_id":"client-12","product_id":"prod-2","quantity":12,"total_amount":300.00}', NOW()),
('log-8', 'user-4', 'Omar Khelil', 'UPDATE', 'Order', 'order-13', 'Order #order-13', '{"status":"confirmed"}', '{"status":"in_transit"}', NOW()),
('log-9', 'user-5', 'Nadia Cherif', 'UPDATE', 'Order', 'order-14', 'Order #order-14', '{"status":"in_transit"}', '{"status":"delivered"}', NOW()),
('log-10', 'user-1', 'Admin User', 'CREATE', 'Transport Tariff', 'tariff-7', 'Draa El Mizan', '{}', '{"city":"Draa El Mizan","price":140.00,"region_id":"region-1"}', NOW())
ON CONFLICT (id) DO NOTHING;

-- Verify data insertion
SELECT 'Regions' as table_name, COUNT(*) as count FROM regions
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Transport Tariffs', COUNT(*) FROM transport_tariffs
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Users', COUNT(*) FROM users
UNION ALL
SELECT 'Orders', COUNT(*) FROM orders
UNION ALL
SELECT 'BL Numbers', COUNT(*) FROM bl_numbers
UNION ALL
SELECT 'Notifications', COUNT(*) FROM notifications
UNION ALL
SELECT 'Activity Logs', COUNT(*) FROM activity_logs;
