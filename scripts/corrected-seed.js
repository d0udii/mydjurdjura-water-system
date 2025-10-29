const { createClient } = require('@supabase/supabase-js')

// Use the Supabase credentials directly
const supabaseUrl = 'https://rfnkkqcqftrbmrcimpfl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbmtrcWNxZnRyYm1yY2ltcGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDExNywiZXhwIjoyMDc3MTM2MTE3fQ.ydJ0RlI00a59DAWvGBDf41W4Q0JQPB0FNagCYn_rkJI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding database with dummy data...')
  
  try {
    // 1. Add more regions (using correct schema)
    console.log('📍 Adding regions...')
    const { error: regionsError } = await supabase
      .from('regions')
      .upsert([
        { name: 'Tizi Ouzou', description: 'Tizi Ouzou region management' },
        { name: 'Bejaia', description: 'Bejaia region management' },
        { name: 'Boumerdes', description: 'Boumerdes region management' }
      ])
    
    if (regionsError) console.error('Regions error:', regionsError)
    else console.log('✅ Regions added')

    // 2. Add more products (using correct schema)
    console.log('📦 Adding products...')
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        { name: 'Water Bottle 1.5L', volume: '1.5L', units_per_pallet: 24, unit_price: 25.00 },
        { name: 'Water Bottle 0.5L', volume: '0.5L', units_per_pallet: 48, unit_price: 15.00 },
        { name: 'Water Jug 5L', volume: '5L', units_per_pallet: 4, unit_price: 75.00 },
        { name: 'Water Jug 10L', volume: '10L', units_per_pallet: 2, unit_price: 120.00 }
      ])
    
    if (productsError) console.error('Products error:', productsError)
    else console.log('✅ Products added')

    // 3. Add transport tariffs (using correct schema)
    console.log('🚚 Adding transport tariffs...')
    const { error: tariffsError } = await supabase
      .from('transport_tariffs')
      .upsert([
        { city: 'Tizi Ouzou', price: 150.00, driver_type: 'local', region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id },
        { city: 'Bejaia', price: 200.00, driver_type: 'local', region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id },
        { city: 'Boumerdes', price: 120.00, driver_type: 'local', region_id: (await supabase.from('regions').select('id').eq('name', 'Boumerdes').single()).data?.id },
        { city: 'Azazga', price: 180.00, driver_type: 'factory', region_id: (await supabase.from('regions').select('id').eq('name', 'Djurdjura').single()).data?.id },
        { city: 'Mekla', price: 160.00, driver_type: 'factory', region_id: (await supabase.from('regions').select('id').eq('name', 'Djurdjura').single()).data?.id }
      ])
    
    if (tariffsError) console.error('Tariffs error:', tariffsError)
    else console.log('✅ Transport tariffs added')

    // 4. Add more clients (using correct schema)
    console.log('👥 Adding clients...')
    const { error: clientsError } = await supabase
      .from('clients')
      .upsert([
        { 
          name: 'Restaurant Le Palmier', 
          phone: '+213 555 123 456', 
          address: '123 Avenue de la République, Tizi Ouzou', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id, 
          contact_person: 'Mohamed Boudiaf', 
          status: 'active' 
        },
        { 
          name: 'Hotel Les Pins', 
          phone: '+213 555 234 567', 
          address: '456 Boulevard de l\'Indépendance, Bejaia', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id, 
          contact_person: 'Aicha Benali', 
          status: 'active' 
        },
        { 
          name: 'Café Central', 
          phone: '+213 555 345 678', 
          address: '789 Rue de la Paix, Boumerdes', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Boumerdes').single()).data?.id, 
          contact_person: 'Karim Ouali', 
          status: 'active' 
        },
        { 
          name: 'Boulangerie Moderne', 
          phone: '+213 555 456 789', 
          address: '321 Place du Marché, Tizi Ouzou', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id, 
          contact_person: 'Fatima Zohra', 
          status: 'active' 
        },
        { 
          name: 'Supermarket Express', 
          phone: '+213 555 567 890', 
          address: '654 Avenue des Martyrs, Bejaia', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id, 
          contact_person: 'Omar Khelil', 
          status: 'active' 
        }
      ])
    
    if (clientsError) console.error('Clients error:', clientsError)
    else console.log('✅ Clients added')

    // 5. Add more users (using correct schema)
    console.log('👤 Adding users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        { 
          name: 'Ahmed Benali', 
          email: 'ahmed.benali@djurdjura.dz', 
          password_hash: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id, 
          status: 'active'
        },
        { 
          name: 'Fatima Zohra', 
          email: 'fatima.zohra@djurdjura.dz', 
          password_hash: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id, 
          status: 'active'
        },
        { 
          name: 'Omar Khelil', 
          email: 'omar.khelil@djurdjura.dz', 
          password_hash: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Boumerdes').single()).data?.id, 
          status: 'active'
        }
      ])
    
    if (usersError) console.error('Users error:', usersError)
    else console.log('✅ Users added')

    // 6. Add orders (using correct schema)
    console.log('📋 Adding orders...')
    const { error: ordersError } = await supabase
      .from('orders')
      .upsert([
        { 
          client_id: (await supabase.from('clients').select('id').eq('name', 'Restaurant Le Palmier').single()).data?.id, 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id, 
          status: 'pending', 
          total_price: 500.00, 
          delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          notes: 'Regular water delivery order'
        },
        { 
          client_id: (await supabase.from('clients').select('id').eq('name', 'Hotel Les Pins').single()).data?.id, 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id, 
          status: 'in_progress', 
          total_price: 125.00, 
          delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          notes: 'Urgent delivery requested'
        },
        { 
          client_id: (await supabase.from('clients').select('id').eq('name', 'Café Central').single()).data?.id, 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Boumerdes').single()).data?.id, 
          status: 'delivered', 
          total_price: 300.00, 
          delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          notes: 'Delivered successfully'
        },
        { 
          client_id: (await supabase.from('clients').select('id').eq('name', 'Boulangerie Moderne').single()).data?.id, 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Tizi Ouzou').single()).data?.id, 
          status: 'delivered', 
          total_price: 225.00, 
          delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          notes: 'Completed delivery'
        },
        { 
          client_id: (await supabase.from('clients').select('id').eq('name', 'Supermarket Express').single()).data?.id, 
          region_id: (await supabase.from('regions').select('id').eq('name', 'Bejaia').single()).data?.id, 
          status: 'pending', 
          total_price: 240.00, 
          delivery_date: new Date(Date.now() + 4 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], 
          notes: 'Large quantity order'
        }
      ])
    
    if (ordersError) console.error('Orders error:', ordersError)
    else console.log('✅ Orders added')

    // 7. Add BL numbers (using correct schema)
    console.log('📄 Adding BL numbers...')
    const { error: blError } = await supabase
      .from('bl_numbers')
      .upsert([
        { bl_number: 'BL2024001', order_id: (await supabase.from('orders').select('id').limit(1).single()).data?.id, status: 'active' },
        { bl_number: 'BL2024002', order_id: (await supabase.from('orders').select('id').limit(1).offset(1).single()).data?.id, status: 'active' },
        { bl_number: 'BL2024003', order_id: (await supabase.from('orders').select('id').limit(1).offset(2).single()).data?.id, status: 'active' },
        { bl_number: 'BL2024004', order_id: (await supabase.from('orders').select('id').limit(1).offset(3).single()).data?.id, status: 'active' },
        { bl_number: 'BL2024005', order_id: (await supabase.from('orders').select('id').limit(1).offset(4).single()).data?.id, status: 'active' }
      ])
    
    if (blError) console.error('BL numbers error:', blError)
    else console.log('✅ BL numbers added')

    // 8. Add notifications (using correct schema)
    console.log('🔔 Adding notifications...')
    const { error: notifError } = await supabase
      .from('notifications')
      .upsert([
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'admin@djurdjura.dz').single()).data?.id, 
          title: 'New Order Received', 
          message: 'A new order has been received from Restaurant Le Palmier', 
          type: 'info', 
          is_read: false 
        },
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'ahmed.benali@djurdjura.dz').single()).data?.id, 
          title: 'Order Confirmed', 
          message: 'Order has been confirmed and is ready for processing', 
          type: 'success', 
          is_read: false 
        },
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'fatima.zohra@djurdjura.dz').single()).data?.id, 
          title: 'Delivery Scheduled', 
          message: 'Order is scheduled for delivery tomorrow', 
          type: 'info', 
          is_read: false 
        },
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'omar.khelil@djurdjura.dz').single()).data?.id, 
          title: 'Order Delivered', 
          message: 'Order has been successfully delivered', 
          type: 'success', 
          is_read: true 
        }
      ])
    
    if (notifError) console.error('Notifications error:', notifError)
    else console.log('✅ Notifications added')

    // 9. Add activity logs (using correct schema)
    console.log('📝 Adding activity logs...')
    const { error: logsError } = await supabase
      .from('activity_logs')
      .upsert([
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'admin@djurdjura.dz').single()).data?.id, 
          action_type: 'CREATE_CLIENT', 
          details: 'Created new client: Restaurant Le Palmier', 
          affected_table: 'clients', 
          affected_record_id: (await supabase.from('clients').select('id').eq('name', 'Restaurant Le Palmier').single()).data?.id
        },
        { 
          user_id: (await supabase.from('users').select('id').eq('email', 'ahmed.benali@djurdjura.dz').single()).data?.id, 
          action_type: 'CREATE_ORDER', 
          details: 'Created new order for Hotel Les Pins', 
          affected_table: 'orders', 
          affected_record_id: (await supabase.from('orders').select('id').eq('client_id', (await supabase.from('clients').select('id').eq('name', 'Hotel Les Pins').single()).data?.id).single()).data?.id
        }
      ])
    
    if (logsError) console.error('Activity logs error:', logsError)
    else console.log('✅ Activity logs added')

    console.log('\n🎉 Database seeding completed successfully!')
    
    // Verify data
    console.log('\n🔍 Verifying data...')
    const tables = ['regions', 'products', 'transport_tariffs', 'clients', 'users', 'orders', 'bl_numbers', 'notifications', 'activity_logs']
    
    for (const table of tables) {
      const { data, error } = await supabase.from(table).select('*', { count: 'exact' })
      if (!error) {
        console.log(`📋 ${table}: ${data.length} records`)
      }
    }

  } catch (error) {
    console.error('💥 Error seeding database:', error)
  }
}

seedDatabase()
