-- Clean Seed Data for Djurdjura Water System
-- This script only includes data that can be safely inserted without hardcoded IDs

-- Insert additional regions
INSERT INTO regions (name, description)
SELECT 'Tizi Ouzou', 'Tizi Ouzou region - Managed by Ahmed Benali'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Tizi Ouzou');

INSERT INTO regions (name, description)
SELECT 'Bejaia', 'Bejaia region - Managed by Fatima Zohra'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Bejaia');

INSERT INTO regions (name, description)
SELECT 'Boumerdes', 'Boumerdes region - Managed by Omar Khelil'
WHERE NOT EXISTS (SELECT 1 FROM regions WHERE name = 'Boumerdes');

-- Insert additional products
INSERT INTO products (name, volume, units_per_pallet, unit_price) 
SELECT 'Water Bottle 1.5L', '1.5L', 24, 25.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Water Bottle 1.5L');

INSERT INTO products (name, volume, units_per_pallet, unit_price) 
SELECT 'Water Bottle 0.5L', '0.5L', 48, 15.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Water Bottle 0.5L');

INSERT INTO products (name, volume, units_per_pallet, unit_price) 
SELECT 'Water Jug 5L', '5L', 4, 75.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Water Jug 5L');

INSERT INTO products (name, volume, units_per_pallet, unit_price) 
SELECT 'Water Jug 10L', '10L', 2, 120.00
WHERE NOT EXISTS (SELECT 1 FROM products WHERE name = 'Water Jug 10L');

-- Insert transport tariffs
INSERT INTO transport_tariffs (city, price, driver_type, region_id)
SELECT 'Tizi Ouzou', 150.00, 'local', id 
FROM regions 
WHERE name = 'Tizi Ouzou'
AND NOT EXISTS (SELECT 1 FROM transport_tariffs WHERE city = 'Tizi Ouzou' AND driver_type = 'local');

INSERT INTO transport_tariffs (city, price, driver_type, region_id)
SELECT 'Bejaia', 200.00, 'local', id 
FROM regions 
WHERE name = 'Bejaia'
AND NOT EXISTS (SELECT 1 FROM transport_tariffs WHERE city = 'Bejaia' AND driver_type = 'local');

INSERT INTO transport_tariffs (city, price, driver_type, region_id)
SELECT 'Boumerdes', 120.00, 'local', id 
FROM regions 
WHERE name = 'Boumerdes'
AND NOT EXISTS (SELECT 1 FROM transport_tariffs WHERE city = 'Boumerdes' AND driver_type = 'local');

INSERT INTO transport_tariffs (city, price, driver_type, region_id)
SELECT 'Azazga', 180.00, 'factory', id 
FROM regions 
WHERE name = 'Djurdjura'
AND NOT EXISTS (SELECT 1 FROM transport_tariffs WHERE city = 'Azazga' AND driver_type = 'factory');

INSERT INTO transport_tariffs (city, price, driver_type, region_id)
SELECT 'Mekla', 160.00, 'factory', id 
FROM regions 
WHERE name = 'Djurdjura'
AND NOT EXISTS (SELECT 1 FROM transport_tariffs WHERE city = 'Mekla' AND driver_type = 'factory');

-- Insert clients
INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Restaurant Le Palmier', '+213 555 123 456', '123 Avenue de la République, Tizi Ouzou', id, 'Mohamed Boudiaf', 'active'
FROM regions 
WHERE name = 'Tizi Ouzou'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Restaurant Le Palmier');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Hotel Les Pins', '+213 555 234 567', '456 Boulevard de l''Indépendance, Bejaia', id, 'Aicha Benali', 'active'
FROM regions 
WHERE name = 'Bejaia'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Hotel Les Pins');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Café Central', '+213 555 345 678', '789 Rue de la Paix, Boumerdes', id, 'Karim Ouali', 'active'
FROM regions 
WHERE name = 'Boumerdes'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Café Central');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Boulangerie Moderne', '+213 555 456 789', '321 Place du Marché, Tizi Ouzou', id, 'Fatima Zohra', 'active'
FROM regions 
WHERE name = 'Tizi Ouzou'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Boulangerie Moderne');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Supermarket Express', '+213 555 567 890', '654 Avenue des Martyrs, Bejaia', id, 'Omar Khelil', 'active'
FROM regions 
WHERE name = 'Bejaia'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Supermarket Express');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Café de la Gare', '+213 555 012 345', '789 Avenue de la Gare, Tizi Ouzou', id, 'Lila Benali', 'active'
FROM regions 
WHERE name = 'Tizi Ouzou'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Café de la Gare');

INSERT INTO clients (name, phone, address, region_id, contact_person, status)
SELECT 'Restaurant El Firdaous', '+213 555 123 456', '456 Rue de la Mosquée, Bejaia', id, 'Youssef Cherif', 'active'
FROM regions 
WHERE name = 'Bejaia'
AND NOT EXISTS (SELECT 1 FROM clients WHERE name = 'Restaurant El Firdaous');

-- Insert users
INSERT INTO users (name, email, password_hash, role, region_id, status)
SELECT 'Ahmed Benali', 'ahmed.benali@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', id, 'active'
FROM regions 
WHERE name = 'Tizi Ouzou'
AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'ahmed.benali@djurdjura.dz');

INSERT INTO users (name, email, password_hash, role, region_id, status)
SELECT 'Fatima Zohra', 'fatima.zohra@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', id, 'active'
FROM regions 
WHERE name = 'Bejaia'
AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'fatima.zohra@djurdjura.dz');

INSERT INTO users (name, email, password_hash, role, region_id, status)
SELECT 'Omar Khelil', 'omar.khelil@djurdjura.dz', '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 'regional_manager', id, 'active'
FROM regions 
WHERE name = 'Boumerdes'
AND NOT EXISTS (SELECT 1 FROM users WHERE email = 'omar.khelil@djurdjura.dz');

-- Verify data insertion
SELECT 'Regions' as table_name, COUNT(*) as count FROM regions
UNION ALL
SELECT 'Products', COUNT(*) FROM products
UNION ALL
SELECT 'Transport Tariffs', COUNT(*) FROM transport_tariffs
UNION ALL
SELECT 'Clients', COUNT(*) FROM clients
UNION ALL
SELECT 'Users', COUNT(*) FROM users;
