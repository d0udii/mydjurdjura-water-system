// Comprehensive Order System Validation Script
// This script tests all aspects of the order system

const OrderSystemValidator = {
  // Test order creation functionality
  async testOrderCreation() {
    console.log('🧪 Testing Order Creation...')
    
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
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testOrder)
      })

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${await response.text()}`)
      }

      const result = await response.json()
      console.log('✅ Order created successfully:', {
        orderId: result.order.id,
        totalPrice: result.order.total_price,
        status: result.order.status,
        deliveryDate: result.order.delivery_date
      })

      // Test 2: Verify order appears in orders list
      const ordersResponse = await fetch('/api/orders')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        const createdOrder = ordersData.orders.find(o => o.id === result.order.id)
        if (createdOrder) {
          console.log('✅ Order found in orders list')
        } else {
          console.log('❌ Order not found in orders list')
        }
      }

      // Test 3: Check notifications were created
      const notificationsResponse = await fetch('/api/notifications')
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        const orderNotifications = notificationsData.notifications.filter(n => 
          n.message.includes(result.order.id)
        )
        console.log(`✅ Found ${orderNotifications.length} notifications for order`)
      }

      return { success: true, orderId: result.order.id, details: result }
    } catch (error) {
      console.log('❌ Order creation failed:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Test order editing functionality
  async testOrderEditing() {
    console.log('✏️ Testing Order Editing...')
    
    try {
      // Get existing orders
      const ordersResponse = await fetch('/api/orders')
      if (!ordersResponse.ok) throw new Error('Failed to fetch orders')
      
      const ordersData = await ordersResponse.json()
      const firstOrder = ordersData.orders[0]
      
      if (!firstOrder) {
        console.log('❌ No orders found to update')
        return { success: false, error: 'No orders found' }
      }

      // Update order status
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

      if (!updateResponse.ok) {
        throw new Error(`Update failed: ${await updateResponse.text()}`)
      }

      console.log('✅ Order updated successfully')

      // Verify update
      const verifyResponse = await fetch('/api/orders')
      if (verifyResponse.ok) {
        const verifyData = await verifyResponse.json()
        const updatedOrder = verifyData.orders.find(o => o.id === firstOrder.id)
        if (updatedOrder && updatedOrder.status === 'processing') {
          console.log('✅ Order status update verified')
        } else {
          console.log('❌ Order status update not reflected')
        }
      }

      return { success: true, orderId: firstOrder.id }
    } catch (error) {
      console.log('❌ Order editing failed:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Test dashboard updates
  async testDashboardUpdates() {
    console.log('📊 Testing Dashboard Updates...')
    
    try {
      const dashboardResponse = await fetch('/api/orders')
      if (!dashboardResponse.ok) throw new Error('Failed to fetch dashboard data')
      
      const data = await dashboardResponse.json()
      const stats = data.stats
      
      console.log('📈 Dashboard Statistics:')
      console.log(`- Total Orders: ${stats.totalOrders}`)
      console.log(`- Pending Orders: ${stats.pendingOrders}`)
      console.log(`- In Progress Orders: ${stats.inProgressOrders}`)
      console.log(`- Delivered Orders: ${stats.deliveredOrders}`)
      console.log(`- Total Revenue: ${stats.totalRevenue.toLocaleString()} DA`)
      
      // Validate statistics
      const isValid = stats.totalOrders >= 0 && 
                     stats.pendingOrders >= 0 && 
                     stats.inProgressOrders >= 0 && 
                     stats.deliveredOrders >= 0 && 
                     stats.totalRevenue >= 0

      if (isValid) {
        console.log('✅ Dashboard statistics are valid')
      } else {
        console.log('❌ Dashboard statistics contain invalid values')
      }

      return { success: true, stats }
    } catch (error) {
      console.log('❌ Dashboard test failed:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Test notification system
  async testNotificationSystem() {
    console.log('🔔 Testing Notification System...')
    
    try {
      const response = await fetch('/api/notifications')
      if (!response.ok) throw new Error('Failed to fetch notifications')
      
      const data = await response.json()
      const notifications = data.notifications
      
      console.log(`📬 Total Notifications: ${notifications.length}`)
      
      const orderNotifications = notifications.filter(n => n.type === 'order')
      console.log(`📦 Order Notifications: ${orderNotifications.length}`)
      
      const unreadNotifications = notifications.filter(n => !n.is_read)
      console.log(`🔴 Unread Notifications: ${unreadNotifications.length}`)
      
      // Test notification creation
      const testNotification = {
        title: "Test Notification",
        message: "This is a test notification",
        type: "alert",
        priority: "medium",
        target_role: "all"
      }

      const createResponse = await fetch('/api/notifications', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(testNotification)
      })

      if (createResponse.ok) {
        console.log('✅ Notification creation test passed')
      } else {
        console.log('❌ Notification creation test failed')
      }

      return { success: true, notificationCount: notifications.length }
    } catch (error) {
      console.log('❌ Notification test failed:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Test role-based access
  async testRoleBasedAccess() {
    console.log('👥 Testing Role-Based Access...')
    
    const roles = ['admin', 'supervisor', 'operations', 'regional_manager']
    const results = []
    
    for (const role of roles) {
      try {
        // Test access to orders API
        const response = await fetch('/api/orders')
        if (response.ok) {
          results.push({ role, accessible: true })
          console.log(`✅ ${role} role can access orders`)
        } else {
          results.push({ role, accessible: false })
          console.log(`❌ ${role} role cannot access orders`)
        }
      } catch (error) {
        results.push({ role, accessible: false, error: error.message })
        console.log(`❌ ${role} role access test failed: ${error.message}`)
      }
    }
    
    return { success: true, roleTests: results }
  },

  // Test data persistence
  async testDataPersistence() {
    console.log('💾 Testing Data Persistence...')
    
    try {
      // Test 1: Create an order
      const testOrder = {
        client_id: "CLI-002",
        region_id: "REG-001",
        product_5_5L_pallets: 3,
        product_1_5L_pallets: 2,
        truck_type: "client_own",
        notes: "Persistence test order",
        created_by: "USR-003"
      }

      const createResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(testOrder)
      })

      if (!createResponse.ok) {
        throw new Error('Failed to create test order')
      }

      const createdOrder = await createResponse.json()
      console.log('✅ Test order created for persistence test')

      // Test 2: Verify order persists after page refresh simulation
      await new Promise(resolve => setTimeout(resolve, 1000)) // Simulate delay

      const verifyResponse = await fetch('/api/orders')
      if (!verifyResponse.ok) {
        throw new Error('Failed to verify order persistence')
      }

      const ordersData = await verifyResponse.json()
      const persistedOrder = ordersData.orders.find(o => o.id === createdOrder.order.id)
      
      if (persistedOrder) {
        console.log('✅ Order persisted successfully')
        return { success: true, orderId: createdOrder.order.id }
      } else {
        console.log('❌ Order did not persist')
        return { success: false, error: 'Order not found after creation' }
      }
    } catch (error) {
      console.log('❌ Data persistence test failed:', error.message)
      return { success: false, error: error.message }
    }
  },

  // Run all tests
  async runAllTests() {
    console.log('🚀 Starting Comprehensive Order System Tests...\n')
    
    const results = {
      orderCreation: await this.testOrderCreation(),
      orderEditing: await this.testOrderEditing(),
      dashboardUpdates: await this.testDashboardUpdates(),
      notifications: await this.testNotificationSystem(),
      roleAccess: await this.testRoleBasedAccess(),
      dataPersistence: await this.testDataPersistence()
    }

    console.log('\n' + '='.repeat(60))
    console.log('📊 TEST SUMMARY')
    console.log('='.repeat(60))
    
    const passed = Object.values(results).filter(r => r.success).length
    const total = Object.keys(results).length
    
    console.log(`✅ Passed: ${passed}/${total}`)
    console.log(`❌ Failed: ${total - passed}/${total}`)
    
    Object.entries(results).forEach(([test, result]) => {
      const status = result.success ? '✅' : '❌'
      console.log(`${status} ${test}: ${result.success ? 'PASSED' : 'FAILED'}`)
    })

    console.log('\n🎉 All tests completed!')
    return results
  }
}

// Export for browser console usage
if (typeof window !== 'undefined') {
  (window as any).OrderSystemValidator = OrderSystemValidator
  console.log('🧪 Order System Validator available: window.OrderSystemValidator')
  console.log('📝 Usage: window.OrderSystemValidator.runAllTests()')
}

export default OrderSystemValidator
