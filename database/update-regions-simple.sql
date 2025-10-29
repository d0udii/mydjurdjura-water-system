-- Simplify Regions to East, West, North
-- This script updates the regions table to have only 3 main regions

-- First, let's get the existing region IDs to preserve references
DO $$
DECLARE
    east_id UUID;
    west_id UUID;
    north_id UUID;
BEGIN
    -- Insert or update the 3 main regions
    INSERT INTO regions (name, description)
    VALUES ('East', 'Eastern region')
    ON CONFLICT (name) 
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO east_id;

    INSERT INTO regions (name, description)
    VALUES ('West', 'Western region')
    ON CONFLICT (name) 
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO west_id;

    INSERT INTO regions (name, description)
    VALUES ('North', 'Northern region')
    ON CONFLICT (name) 
    DO UPDATE SET description = EXCLUDED.description
    RETURNING id INTO north_id;

    -- Update existing clients, users, and transport_tariffs to use one of the 3 regions
    -- You can customize this mapping based on your existing data
    
    -- Example: Map existing regions to the new 3 regions
    -- Update all Tizi Ouzou, Bejaia data to East
    UPDATE clients SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Tizi Ouzou', 'Bejaia', 'Djurdjura'));
    
    UPDATE users SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Tizi Ouzou', 'Bejaia', 'Djurdjura'));
    
    UPDATE transport_tariffs SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Tizi Ouzou', 'Bejaia', 'Djurdjura'));
    
    UPDATE orders SET region_id = east_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Tizi Ouzou', 'Bejaia', 'Djurdjura'));

    -- Map Boumerdes and similar to West
    UPDATE clients SET region_id = west_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Boumerdes', 'Algiers', 'Blida'));
    
    UPDATE users SET region_id = west_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Boumerdes', 'Algiers', 'Blida'));
    
    UPDATE transport_tariffs SET region_id = west_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Boumerdes', 'Algiers', 'Blida'));
    
    UPDATE orders SET region_id = west_id 
    WHERE region_id IN (SELECT id FROM regions WHERE name IN ('Boumerdes', 'Algiers', 'Blida'));

    -- Map any remaining to North (or you can specify specific ones)
    UPDATE clients SET region_id = north_id 
    WHERE region_id NOT IN (east_id, west_id, north_id);
    
    UPDATE users SET region_id = north_id 
    WHERE region_id NOT IN (east_id, west_id, north_id) AND region_id IS NOT NULL;
    
    UPDATE transport_tariffs SET region_id = north_id 
    WHERE region_id NOT IN (east_id, west_id, north_id);
    
    UPDATE orders SET region_id = north_id 
    WHERE region_id NOT IN (east_id, west_id, north_id);

    -- Delete old regions that are no longer needed
    DELETE FROM regions WHERE name NOT IN ('East', 'West', 'North');

    RAISE NOTICE 'Regions updated successfully! Now you have: East, West, North';
END $$;

-- Verify the changes
SELECT 'Final Regions:' as status, id, name, description FROM regions ORDER BY name;
SELECT 'Clients per Region:' as status, r.name as region, COUNT(c.id) as client_count 
FROM regions r 
LEFT JOIN clients c ON c.region_id = r.id 
GROUP BY r.name;
SELECT 'Transport Tariffs per Region:' as status, r.name as region, COUNT(t.id) as tariff_count 
FROM regions r 
LEFT JOIN transport_tariffs t ON t.region_id = r.id 
GROUP BY r.name;

