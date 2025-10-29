-- Fix RLS Policies to Prevent Infinite Recursion
-- Run this in Supabase SQL Editor to fix the infinite recursion issue

-- Drop existing problematic policies
DROP POLICY IF EXISTS "Allow all operations for demo" ON users;
DROP POLICY IF EXISTS "Allow all operations for demo" ON products;
DROP POLICY IF EXISTS "Allow all operations for demo" ON clients;
DROP POLICY IF EXISTS "Allow all operations for demo" ON orders;
DROP POLICY IF EXISTS "Allow all operations for demo" ON notifications;
DROP POLICY IF EXISTS "Allow all operations for demo" ON activity_logs;
DROP POLICY IF EXISTS "Allow all operations for demo" ON transport_tariffs;
DROP POLICY IF EXISTS "Allow all operations for demo" ON bl_numbers;

-- Create simple policies that don't cause recursion
-- For users table - avoid checking users table in policies
CREATE POLICY "Allow all operations for users" ON users 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For products table - simple policy without user checks
CREATE POLICY "Allow all operations for products" ON products 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For clients table
CREATE POLICY "Allow all operations for clients" ON clients 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For orders table
CREATE POLICY "Allow all operations for orders" ON orders 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For notifications table
CREATE POLICY "Allow all operations for notifications" ON notifications 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For activity_logs table
CREATE POLICY "Allow all operations for activity_logs" ON activity_logs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For transport_tariffs table
CREATE POLICY "Allow all operations for transport_tariffs" ON transport_tariffs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- For bl_numbers table
CREATE POLICY "Allow all operations for bl_numbers" ON bl_numbers 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

-- Also ensure regions table has proper policy
DROP POLICY IF EXISTS "Allow all operations for demo" ON regions;
CREATE POLICY "Allow all operations for regions" ON regions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
