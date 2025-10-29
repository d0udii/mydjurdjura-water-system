-- Fix RLS Policies to Prevent Infinite Recursion
-- Run this in Supabase SQL Editor to fix the infinite recursion issue
-- This script is idempotent - can be run multiple times safely

-- Drop ALL existing policies (both old and new ones)
DROP POLICY IF EXISTS "Allow all operations for demo" ON users;
DROP POLICY IF EXISTS "Allow all operations for users" ON users;
DROP POLICY IF EXISTS "Allow all operations for demo" ON products;
DROP POLICY IF EXISTS "Allow all operations for products" ON products;
DROP POLICY IF EXISTS "Allow all operations for demo" ON clients;
DROP POLICY IF EXISTS "Allow all operations for clients" ON clients;
DROP POLICY IF EXISTS "Allow all operations for demo" ON orders;
DROP POLICY IF EXISTS "Allow all operations for orders" ON orders;
DROP POLICY IF EXISTS "Allow all operations for demo" ON notifications;
DROP POLICY IF EXISTS "Allow all operations for notifications" ON notifications;
DROP POLICY IF EXISTS "Allow all operations for demo" ON activity_logs;
DROP POLICY IF EXISTS "Allow all operations for activity_logs" ON activity_logs;
DROP POLICY IF EXISTS "Allow all operations for demo" ON transport_tariffs;
DROP POLICY IF EXISTS "Allow all operations for transport_tariffs" ON transport_tariffs;
DROP POLICY IF EXISTS "Allow all operations for demo" ON bl_numbers;
DROP POLICY IF EXISTS "Allow all operations for bl_numbers" ON bl_numbers;
DROP POLICY IF EXISTS "Allow all operations for demo" ON regions;
DROP POLICY IF EXISTS "Allow all operations for regions" ON regions;

-- Drop any other potential conflicting policies
DROP POLICY IF EXISTS "Everyone can read regions" ON regions;
DROP POLICY IF EXISTS "Only admins can modify regions" ON regions;
DROP POLICY IF EXISTS "Users can read their own data" ON users;
DROP POLICY IF EXISTS "Service role can read all users" ON users;
DROP POLICY IF EXISTS "Service role can modify users" ON users;
DROP POLICY IF EXISTS "Everyone can read clients" ON clients;
DROP POLICY IF EXISTS "Admins can modify clients" ON clients;
DROP POLICY IF EXISTS "Regional managers can modify clients in their region" ON clients;
DROP POLICY IF EXISTS "Everyone can read products" ON products;
DROP POLICY IF EXISTS "Only admins can modify products" ON products;
DROP POLICY IF EXISTS "Everyone can read transport tariffs" ON transport_tariffs;
DROP POLICY IF EXISTS "Only admins can modify transport tariffs" ON transport_tariffs;
DROP POLICY IF EXISTS "Users can read orders in their region" ON orders;
DROP POLICY IF EXISTS "Users can read orders assigned to them" ON orders;
DROP POLICY IF EXISTS "Admins can modify all orders" ON orders;
DROP POLICY IF EXISTS "Regional managers can modify orders in their region" ON orders;
DROP POLICY IF EXISTS "Operations can update assigned orders" ON orders;
DROP POLICY IF EXISTS "Users can read their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;
DROP POLICY IF EXISTS "Admins can read all activity logs" ON activity_logs;
DROP POLICY IF EXISTS "Users can read their own activity logs" ON activity_logs;
DROP POLICY IF EXISTS "System can insert activity logs" ON activity_logs;

-- Create simple policies that don't cause recursion
-- These policies allow all operations without checking users table (which causes recursion)
CREATE POLICY "Allow all operations for users" ON users 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for products" ON products 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for clients" ON clients 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for orders" ON orders 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for notifications" ON notifications 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for activity_logs" ON activity_logs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for transport_tariffs" ON transport_tariffs 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for bl_numbers" ON bl_numbers 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);

CREATE POLICY "Allow all operations for regions" ON regions 
  FOR ALL 
  USING (true) 
  WITH CHECK (true);
