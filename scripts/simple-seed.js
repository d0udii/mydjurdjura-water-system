const { createClient } = require('@supabase/supabase-js')

// Use the Supabase credentials directly
const supabaseUrl = 'https://rfnkkqcqftrbmrcimpfl.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbmtrcWNxZnRyYm1yY2ltcGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDExNywiZXhwIjoyMDc3MTM2MTE3fQ.ydJ0RlI00a59DAWvGBDf41W4Q0JQPB0FNagCYn_rkJI'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  console.log('🌱 Seeding database with dummy data...')
  
  try {
    // 1. Add more regions
    console.log('📍 Adding regions...')
    const { error: regionsError } = await supabase
      .from('regions')
      .upsert([
        { id: 'region-2', name: 'Tizi Ouzou', responsible: 'Ahmed Benali' },
        { id: 'region-3', name: 'Bejaia', responsible: 'Fatima Zohra' },
        { id: 'region-4', name: 'Boumerdes', responsible: 'Omar Khelil' }
      ])
    
    if (regionsError) console.error('Regions error:', regionsError)
    else console.log('✅ Regions added')

    // 2. Add more products
    console.log('📦 Adding products...')
    const { error: productsError } = await supabase
      .from('products')
      .upsert([
        { id: 'prod-2', name: 'Water Bottle 1.5L', volume: 1.5, units_per_pallet: 24, unit_price: 25.00 },
        { id: 'prod-3', name: 'Water Bottle 0.5L', volume: 0.5, units_per_pallet: 48, unit_price: 15.00 },
        { id: 'prod-4', name: 'Water Jug 5L', volume: 5.0, units_per_pallet: 4, unit_price: 75.00 },
        { id: 'prod-5', name: 'Water Jug 10L', volume: 10.0, units_per_pallet: 2, unit_price: 120.00 }
      ])
    
    if (productsError) console.error('Products error:', productsError)
    else console.log('✅ Products added')

    // 3. Add transport tariffs
    console.log('🚚 Adding transport tariffs...')
    const { error: tariffsError } = await supabase
      .from('transport_tariffs')
      .upsert([
        { id: 'tariff-2', city: 'Tizi Ouzou', price: 150.00, region_id: 'region-2' },
        { id: 'tariff-3', city: 'Bejaia', price: 200.00, region_id: 'region-3' },
        { id: 'tariff-4', city: 'Boumerdes', price: 120.00, region_id: 'region-4' },
        { id: 'tariff-5', city: 'Azazga', price: 180.00, region_id: 'region-1' },
        { id: 'tariff-6', city: 'Mekla', price: 160.00, region_id: 'region-1' }
      ])
    
    if (tariffsError) console.error('Tariffs error:', tariffsError)
    else console.log('✅ Transport tariffs added')

    // 4. Add more clients
    console.log('👥 Adding clients...')
    const { error: clientsError } = await supabase
      .from('clients')
      .upsert([
        { 
          id: 'client-2', 
          name: 'Restaurant Le Palmier', 
          phone: '+213 555 123 456', 
          address: '123 Avenue de la République, Tizi Ouzou', 
          region_id: 'region-2', 
          contact_person: 'Mohamed Boudiaf', 
          rc_number: 'RC123456789', 
          status: 'active' 
        },
        { 
          id: 'client-3', 
          name: 'Hotel Les Pins', 
          phone: '+213 555 234 567', 
          address: '456 Boulevard de l\'Indépendance, Bejaia', 
          region_id: 'region-3', 
          contact_person: 'Aicha Benali', 
          rc_number: 'RC234567890', 
          status: 'active' 
        },
        { 
          id: 'client-4', 
          name: 'Café Central', 
          phone: '+213 555 345 678', 
          address: '789 Rue de la Paix, Boumerdes', 
          region_id: 'region-4', 
          contact_person: 'Karim Ouali', 
          rc_number: 'RC345678901', 
          status: 'active' 
        },
        { 
          id: 'client-5', 
          name: 'Boulangerie Moderne', 
          phone: '+213 555 456 789', 
          address: '321 Place du Marché, Tizi Ouzou', 
          region_id: 'region-2', 
          contact_person: 'Fatima Zohra', 
          rc_number: 'RC456789012', 
          status: 'active' 
        },
        { 
          id: 'client-6', 
          name: 'Supermarket Express', 
          phone: '+213 555 567 890', 
          address: '654 Avenue des Martyrs, Bejaia', 
          region_id: 'region-3', 
          contact_person: 'Omar Khelil', 
          rc_number: 'RC567890123', 
          status: 'active' 
        }
      ])
    
    if (clientsError) console.error('Clients error:', clientsError)
    else console.log('✅ Clients added')

    // 5. Add more users
    console.log('👤 Adding users...')
    const { error: usersError } = await supabase
      .from('users')
      .upsert([
        { 
          id: 'user-2', 
          name: 'Ahmed Benali', 
          email: 'ahmed.benali@djurdjura.dz', 
          password: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: 'region-2', 
          status: 'active', 
          approved: true 
        },
        { 
          id: 'user-3', 
          name: 'Fatima Zohra', 
          email: 'fatima.zohra@djurdjura.dz', 
          password: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: 'region-3', 
          status: 'active', 
          approved: true 
        },
        { 
          id: 'user-4', 
          name: 'Omar Khelil', 
          email: 'omar.khelil@djurdjura.dz', 
          password: '$2b$10$rQZ8K9vL2mN3oP4qR5sT6uV7wX8yZ9aB0cD1eF2gH3iJ4kL5mN6oP7qR8sT9uV', 
          role: 'regional_manager', 
          region_id: 'region-4', 
          status: 'active', 
          approved: true 
        }
      ])
    
    if (usersError) console.error('Users error:', usersError)
    else console.log('✅ Users added')

    // 6. Add orders
    console.log('📋 Adding orders...')
    const { error: ordersError } = await supabase
      .from('orders')
      .upsert([
        { 
          id: 'order-1', 
          client_id: 'client-1', 
          product_id: 'prod-1', 
          quantity: 10, 
          unit_price: 50.00, 
          total_amount: 500.00, 
          status: 'pending', 
          order_date: new Date().toISOString(), 
          delivery_date: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: 'order-2', 
          client_id: 'client-2', 
          product_id: 'prod-2', 
          quantity: 5, 
          unit_price: 25.00, 
          total_amount: 125.00, 
          status: 'confirmed', 
          order_date: new Date().toISOString(), 
          delivery_date: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: 'order-3', 
          client_id: 'client-3', 
          product_id: 'prod-3', 
          quantity: 20, 
          unit_price: 15.00, 
          total_amount: 300.00, 
          status: 'in_transit', 
          order_date: new Date().toISOString(), 
          delivery_date: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: 'order-4', 
          client_id: 'client-4', 
          product_id: 'prod-4', 
          quantity: 3, 
          unit_price: 75.00, 
          total_amount: 225.00, 
          status: 'delivered', 
          order_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), 
          delivery_date: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() 
        },
        { 
          id: 'order-5', 
          client_id: 'client-5', 
          product_id: 'prod-5', 
          quantity: 2, 
          unit_price: 120.00, 
          total_amount: 240.00, 
          status: 'delivered', 
          order_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), 
          delivery_date: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() 
        }
      ])
    
    if (ordersError) console.error('Orders error:', ordersError)
    else console.log('✅ Orders added')

    // 7. Add BL numbers
    console.log('📄 Adding BL numbers...')
    const { error: blError } = await supabase
      .from('bl_numbers')
      .upsert([
        { id: 'bl-1', bl_number: 'BL2024001', order_id: 'order-1', status: 'active' },
        { id: 'bl-2', bl_number: 'BL2024002', order_id: 'order-2', status: 'active' },
        { id: 'bl-3', bl_number: 'BL2024003', order_id: 'order-3', status: 'active' },
        { id: 'bl-4', bl_number: 'BL2024004', order_id: 'order-4', status: 'active' },
        { id: 'bl-5', bl_number: 'BL2024005', order_id: 'order-5', status: 'active' }
      ])
    
    if (blError) console.error('BL numbers error:', blError)
    else console.log('✅ BL numbers added')

    // 8. Add notifications
    console.log('🔔 Adding notifications...')
    const { error: notifError } = await supabase
      .from('notifications')
      .upsert([
        { 
          id: 'notif-1', 
          user_id: 'user-1', 
          title: 'New Order Received', 
          message: 'Order #order-1 has been received from Restaurant Le Palmier', 
          type: 'order', 
          read: false 
        },
        { 
          id: 'notif-2', 
          user_id: 'user-2', 
          title: 'Order Confirmed', 
          message: 'Order #order-2 has been confirmed and is ready for processing', 
          type: 'order', 
          read: false 
        },
        { 
          id: 'notif-3', 
          user_id: 'user-3', 
          title: 'Delivery Scheduled', 
          message: 'Order #order-3 is scheduled for delivery tomorrow', 
          type: 'delivery', 
          read: false 
        },
        { 
          id: 'notif-4', 
          user_id: 'user-4', 
          title: 'Order Delivered', 
          message: 'Order #order-4 has been successfully delivered', 
          type: 'delivery', 
          read: true 
        }
      ])
    
    if (notifError) console.error('Notifications error:', notifError)
    else console.log('✅ Notifications added')

    // 9. Add activity logs
    console.log('📝 Adding activity logs...')
    const { error: logsError } = await supabase
      .from('activity_logs')
      .upsert([
        { 
          id: 'log-1', 
          user_id: 'user-1', 
          user_name: 'Admin User', 
          action: 'CREATE', 
          entity_type: 'Client', 
          entity_id: 'client-2', 
          entity_name: 'Restaurant Le Palmier', 
          old_values: {}, 
          new_values: { name: 'Restaurant Le Palmier', phone: '+213 555 123 456' } 
        },
        { 
          id: 'log-2', 
          user_id: 'user-2', 
          user_name: 'Ahmed Benali', 
          action: 'CREATE', 
          entity_type: 'Order', 
          entity_id: 'order-2', 
          entity_name: 'Order #order-2', 
          old_values: {}, 
          new_values: { client_id: 'client-2', product_id: 'prod-2', quantity: 5 } 
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
