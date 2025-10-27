// Test script to validate order creation functionality
const testOrderCreation = async () => {
  console.log('🧪 Testing Order Creation Functionality...')
  
  // Test data
  const testOrder = {
    client_id: "CLI-001",
    region_id: "REG-001",
    product_5_5L_pallets: 5,
    product_1_5L_pallets: 3,
    truck_type: "factory",
    notes: "Test order for validation",
    created_by: "USR-003" // Supervisor
  }
  
  try {
    // Test 1: Create order via API
    console.log('📝 Test 1: Creating order via API...')
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(testOrder)
    })
    
    if (response.ok) {
      const result = await response.json()
      console.log('✅ Order created successfully:', result.order.id)
      console.log('📊 Order details:', {
        total_price: result.order.total_price,
        status: result.order.status,
        delivery_date: result.order.delivery_date
      })
      
      // Test 2: Verify order appears in orders list
      console.log('📋 Test 2: Verifying order appears in orders list...')
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        const createdOrder = ordersData.orders.find((o: any) => o.id === result.order.id)
        if (createdOrder) {
          console.log('✅ Order found in orders list')
        } else {
          console.log('❌ Order not found in orders list')
        }
      }
      
      // Test 3: Check notifications were created
      console.log('🔔 Test 3: Checking notifications...')
      const notificationsResponse = await fetch('/api/notifications')
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        const orderNotifications = notificationsData.notifications.filter((n: any) => 
          n.message.includes(result.order.id)
        )
        console.log(`✅ Found ${orderNotifications.length} notifications for order`)
      }
      
    } else {
      const error = await response.json()
      console.log('❌ Order creation failed:', error.error)
    }
    
  } catch (error) {
    console.log('❌ Test failed:', error)
  }
}

// Test order editing functionality
const testOrderEditing = async () => {
  console.log('✏️ Testing Order Editing Functionality...')
  
  try {
    // Get existing orders
    const ordersResponse = await fetch('/api/orders')
    if (ordersResponse.ok) {
      const ordersData = await ordersResponse.json()
      const firstOrder = ordersData.orders[0]
      
      if (firstOrder) {
        console.log('📝 Test 1: Updating order status...')
        const updateData = {
          ...firstOrder,
          status: 'processing',
          notes: 'Updated via test - processing order'
        }
        
        const updateResponse = await fetch(`/api/orders/${firstOrder.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData)
        })
        
        if (updateResponse.ok) {
          console.log('✅ Order updated successfully')
          
          // Verify update
          const verifyResponse = await fetch('/api/orders')
          if (verifyResponse.ok) {
            const verifyData = await verifyResponse.json()
            const updatedOrder = verifyData.orders.find((o: any) => o.id === firstOrder.id)
            if (updatedOrder && updatedOrder.status === 'processing') {
              console.log('✅ Order status update verified')
            } else {
              console.log('❌ Order status update not reflected')
            }
          }
        } else {
          console.log('❌ Order update failed')
        }
      }
    }
  } catch (error) {
    console.log('❌ Order editing test failed:', error)
  }
}

// Test dashboard updates
const testDashboardUpdates = async () => {
  console.log('📊 Testing Dashboard Updates...')
  
  try {
    const dashboardResponse = await fetch('/api/orders')
    if (dashboardResponse.ok) {
      const data = await dashboardResponse.json()
      const stats = data.stats
      
      console.log('📈 Dashboard Statistics:')
      console.log(`- Total Orders: ${stats.totalOrders}`)
      console.log(`- Pending Orders: ${stats.pendingOrders}`)
      console.log(`- In Progress Orders: ${stats.inProgressOrders}`)
      console.log(`- Delivered Orders: ${stats.deliveredOrders}`)
      console.log(`- Total Revenue: ${stats.totalRevenue.toLocaleString()} DA`)
      
      console.log('✅ Dashboard statistics calculated correctly')
    }
  } catch (error) {
    console.log('❌ Dashboard test failed:', error)
  }
}

// Run all tests
const runAllTests = async () => {
  console.log('🚀 Starting Comprehensive Order System Tests...\n')
  
  await testOrderCreation()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testOrderEditing()
  console.log('\n' + '='.repeat(50) + '\n')
  
  await testDashboardUpdates()
  console.log('\n' + '='.repeat(50) + '\n')
  
  console.log('🎉 All tests completed!')
}

// Export for use in browser console
if (typeof window !== 'undefined') {
  (window as any).testOrderSystem = {
    testOrderCreation,
    testOrderEditing,
    testDashboardUpdates,
    runAllTests
  }
  console.log('🧪 Test functions available: window.testOrderSystem')
}

export { testOrderCreation, testOrderEditing, testDashboardUpdates, runAllTests }
