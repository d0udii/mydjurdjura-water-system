-- Create Simple Regions: East, West, North
-- Run this in Supabase SQL Editor

-- Step 1: Insert the 3 main regions (or update if they exist)
INSERT INTO regions (name, description)
VALUES ('East', 'Eastern region')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO regions (name, description)
VALUES ('West', 'Western region')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

INSERT INTO regions (name, description)
VALUES ('North', 'Northern region')
ON CONFLICT (name) DO UPDATE SET description = EXCLUDED.description;

-- Step 2: Get the region IDs for migration
DO $$
DECLARE
    east_id UUID;
    west_id UUID;
    north_id UUID;
BEGIN
    -- Get the IDs of our 3 regions
    SELECT id INTO east_id FROM regions WHERE name = 'East';
    SELECT id INTO west_id FROM regions WHERE name = 'West';
    SELECT id INTO north_id FROM regions WHERE name = 'North';
    
    -- Update all existing data to use one of the 3 regions
    -- Map old regions to new ones (you can customize this mapping)
    UPDATE clients SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name NOT IN ('East', 'West', 'North'));
    
    UPDATE users SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name NOT IN ('East', 'West', 'North'));
    
    UPDATE transport_tariffs SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name NOT IN ('East', 'West', 'North'));
    
    UPDATE orders SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name NOT IN ('East', 'West', 'North'));
    
    -- Delete old regions
    DELETE FROM regions WHERE name NOT IN ('East', 'West', 'North');
    
    RAISE NOTICE 'Success! Regions are now: East, West, North';
END $$;

-- Step 3: Verify
SELECT 'Your regions:' as info, id, name, description FROM regions ORDER BY name;

