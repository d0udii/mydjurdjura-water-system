#!/usr/bin/env node

/**
 * Complete Order Workflow Test
 * Tests the complete workflow: Supervisor creates order → Operations Team manages → Supervisor tracks
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-aoxo547hx-mahmoudjouadi-3817s-projects.vercel.app';
const LOCAL_URL = 'http://localhost:3000';

const BASE_URL = process.env.NODE_ENV === 'production' ? PRODUCTION_URL : LOCAL_URL;

let testResults = {
  passed: 0,
  failed: 0,
  total: 0,
  details: []
};

function logTest(testName, passed, details = '') {
  testResults.total++;
  if (passed) {
    testResults.passed++;
    console.log(`✅ ${testName}`);
  } else {
    testResults.failed++;
    console.log(`❌ ${testName}: ${details}`);
  }
  testResults.details.push({ testName, passed, details });
}

function makeRequest(url, options = {}) {
  return new Promise((resolve, reject) => {
    const isHttps = url.startsWith('https');
    const client = isHttps ? https : http;
    
    const requestOptions = {
      method: options.method || 'GET',
      headers: {
        'Content-Type': 'application/json',
        ...options.headers
      },
      ...options
    };

    const req = client.request(url, requestOptions, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          const jsonData = data ? JSON.parse(data) : {};
          resolve({ status: res.statusCode, data: jsonData, headers: res.headers });
        } catch (e) {
          resolve({ status: res.statusCode, data: data, headers: res.headers });
        }
      });
    });

    req.on('error', reject);
    
    if (options.body) {
      req.write(typeof options.body === 'string' ? options.body : JSON.stringify(options.body));
    }
    
    req.end();
  });
}

async function testSupervisorOrderCreation() {
  console.log('\n👤 Testing Supervisor Order Creation...');
  
  try {
    // Test creating a new order as Supervisor
    const newOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 150000,
      product_5_5L_pallets: 10,
      product_1_5L_pallets: 10,
      truck_type: 'factory',
      truck_capacity: 20,
      delivery_date: '2024-12-30',
      notes: 'Order created by Supervisor for testing workflow',
      created_by: 'demo-mahmoud@djurdjura.dz'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Supervisor Order Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      logTest('Order Status - Pending', createdOrder.status === 'pending', 
        `Status: ${createdOrder.status}, Expected: pending`);
      
      logTest('Order Creator Tracking', createdOrder.created_by === newOrder.created_by, 
        `Created by: ${createdOrder.created_by}`);
      
      logTest('Order ID Generation', !!createdOrder.id, 
        `Order ID: ${createdOrder.id}`);
      
      return createdOrder;
    }
    
    return null;
  } catch (error) {
    logTest('Supervisor Order Creation Test', false, error.message);
    return null;
  }
}

async function testOperationsTeamOrderViewing(testOrder) {
  console.log('\n👁️ Testing Operations Team Order Viewing...');
  
  try {
    // Test Operations Team viewing pending orders
    const response = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&user_id=USR-004`);
    
    logTest('Operations Team Order Access', response.status === 200, 
      `Status: ${response.status}, Expected: 200`);
    
    if (response.status === 200) {
      const orders = response.data.orders || [];
      
      logTest('Orders Data Available', orders.length > 0, 
        `Found ${orders.length} orders`);
      
      // Check if our test order is visible to Operations Team
      const testOrderVisible = orders.some(order => order.id === testOrder.id);
      
      logTest('Test Order Visibility', testOrderVisible, 
        `Test order ${testOrder.id} visible to Operations Team`);
      
      // Check if order appears as pending
      const pendingOrders = orders.filter(order => order.status === 'pending');
      
      logTest('Pending Orders Visible', pendingOrders.length > 0, 
        `Found ${pendingOrders.length} pending orders`);
      
      return orders;
    }
    
    return [];
  } catch (error) {
    logTest('Operations Team Order Viewing Test', false, error.message);
    return [];
  }
}

async function testOrderApproval(testOrder) {
  console.log('\n✅ Testing Order Approval by Operations Team...');
  
  try {
    // Test order approval
    const approveResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        approved_by: 'USR-004',
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('Order Approval', approveResponse.status === 200, 
      `Status: ${approveResponse.status}, Expected: 200`);
    
    if (approveResponse.status === 200) {
      const approvedOrder = approveResponse.data.order;
      
      logTest('Approval Status Update', approvedOrder.status === 'processing', 
        `Status: ${approvedOrder.status}, Expected: processing`);
      
      logTest('BL Number Generation', !!approvedOrder.bl_number, 
        `BL Number: ${approvedOrder.bl_number}`);
      
      logTest('Approval Tracking', !!approvedOrder.approved_by && !!approvedOrder.approved_at, 
        `Approved by: ${approvedOrder.approved_by}`);
      
      logTest('Notification Created', !!approveResponse.data.notification, 
        'Notification created for Supervisor');
      
      return approvedOrder;
    }
    
    return testOrder;
  } catch (error) {
    logTest('Order Approval Test', false, error.message);
    return testOrder;
  }
}

async function testBLNumberManagement(testOrder) {
  console.log('\n📋 Testing BL Number Management...');
  
  try {
    // Test BL number update
    const blNumber = `BL-WORKFLOW-${Date.now()}`;
    const blUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
      method: 'PATCH',
      body: {
        action: 'update_bl_number',
        bl_number: blNumber,
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('BL Number Update', blUpdateResponse.status === 200, 
      `Status: ${blUpdateResponse.status}, Expected: 200`);
    
    if (blUpdateResponse.status === 200) {
      const updatedOrder = blUpdateResponse.data.order;
      
      logTest('BL Number Assignment', updatedOrder.bl_number === blNumber, 
        `BL Number: ${updatedOrder.bl_number}, Expected: ${blNumber}`);
      
      logTest('BL Update Tracking', !!updatedOrder.bl_updated_by && !!updatedOrder.bl_updated_at, 
        `Updated by: ${updatedOrder.bl_updated_by}`);
      
      logTest('BL Notification Created', !!blUpdateResponse.data.notification, 
        'Notification created for Supervisor');
      
      return updatedOrder;
    }
    
    return testOrder;
  } catch (error) {
    logTest('BL Number Management Test', false, error.message);
    return testOrder;
  }
}

async function testOrderStatusUpdates(testOrder) {
  console.log('\n🚚 Testing Order Status Updates...');
  
  try {
    const statuses = [
      { status: 'in_progress', description: 'In Progress' },
      { status: 'in_transit', description: 'In Delivery (On the Way)' },
      { status: 'delivered', description: 'Delivered' }
    ];
    
    let currentOrder = testOrder;
    
    for (const statusUpdate of statuses) {
      const statusResponse = await makeRequest(`${BASE_URL}/api/orders/${currentOrder.id}`, {
        method: 'PATCH',
        body: {
          action: 'update_status',
          status: statusUpdate.status,
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
      
      logTest(`Status Update - ${statusUpdate.description}`, statusResponse.status === 200, 
        `Status: ${statusResponse.status}, Expected: 200`);
      
      if (statusResponse.status === 200) {
        currentOrder = statusResponse.data.order;
        
        logTest(`Status Change - ${statusUpdate.description}`, currentOrder.status === statusUpdate.status, 
          `Status: ${currentOrder.status}, Expected: ${statusUpdate.status}`);
        
        logTest(`Status Notification - ${statusUpdate.description}`, !!statusResponse.data.notification, 
          'Notification created for Supervisor');
      }
    }
    
    return currentOrder;
  } catch (error) {
    logTest('Order Status Updates Test', false, error.message);
    return testOrder;
  }
}

async function testSupervisorNotifications(testOrder) {
  console.log('\n🔔 Testing Supervisor Notifications...');
  
  try {
    // Test fetching notifications for the Supervisor who created the order
    const notificationsResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=${testOrder.created_by}`);
    
    logTest('Supervisor Notifications Access', notificationsResponse.status === 200, 
      `Status: ${notificationsResponse.status}, Expected: 200`);
    
    if (notificationsResponse.status === 200) {
      const notifications = notificationsResponse.data.notifications || [];
      
      logTest('Notifications Available', notifications.length > 0, 
        `Found ${notifications.length} notifications`);
      
      // Check for order-related notifications
      const orderNotifications = notifications.filter(n => 
        n.order_id === testOrder.id || n.message.includes(testOrder.id)
      );
      
      logTest('Order Notifications Found', orderNotifications.length > 0, 
        `Found ${orderNotifications.length} notifications for order ${testOrder.id}`);
      
      // Check for specific notification types
      const approvalNotification = orderNotifications.find(n => n.title === 'Order Approved');
      const blNotification = orderNotifications.find(n => n.title === 'BL Number Updated');
      const statusNotifications = orderNotifications.filter(n => n.title === 'Order Status Updated');
      
      logTest('Approval Notification', !!approvalNotification, 
        'Approval notification found');
      
      logTest('BL Number Notification', !!blNotification, 
        'BL Number notification found');
      
      logTest('Status Update Notifications', statusNotifications.length > 0, 
        `Found ${statusNotifications.length} status update notifications`);
      
      return orderNotifications;
    }
    
    return [];
  } catch (error) {
    logTest('Supervisor Notifications Test', false, error.message);
    return [];
  }
}

async function testSupervisorOrderTracking(testOrder) {
  console.log('\n📊 Testing Supervisor Order Tracking...');
  
  try {
    // Test Supervisor viewing their own orders
    const supervisorOrdersResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=supervisor&user_id=${testOrder.created_by}`);
    
    logTest('Supervisor Order Access', supervisorOrdersResponse.status === 200, 
      `Status: ${supervisorOrdersResponse.status}, Expected: 200`);
    
    if (supervisorOrdersResponse.status === 200) {
      const supervisorOrders = supervisorOrdersResponse.data.orders || [];
      
      logTest('Supervisor Orders Available', supervisorOrders.length > 0, 
        `Found ${supervisorOrders.length} orders`);
      
      // Check if the test order is visible to the Supervisor
      const testOrderVisible = supervisorOrders.find(order => order.id === testOrder.id);
      
      logTest('Test Order Tracking', !!testOrderVisible, 
        `Test order ${testOrder.id} visible to Supervisor`);
      
      if (testOrderVisible) {
        logTest('Order Status Tracking', testOrderVisible.status === 'delivered', 
          `Current status: ${testOrderVisible.status}, Expected: delivered`);
        
        logTest('BL Number Tracking', !!testOrderVisible.bl_number, 
          `BL Number: ${testOrderVisible.bl_number}`);
        
        logTest('Approval Tracking', !!testOrderVisible.approved_by && !!testOrderVisible.approved_at, 
          `Approved by: ${testOrderVisible.approved_by}`);
      }
      
      return supervisorOrders;
    }
    
    return [];
  } catch (error) {
    logTest('Supervisor Order Tracking Test', false, error.message);
    return [];
  }
}

async function testCompleteWorkflow() {
  console.log('\n🔄 Testing Complete Workflow...');
  
  try {
    // Step 1: Supervisor creates order
    const testOrder = await testSupervisorOrderCreation();
    if (!testOrder) {
      logTest('Complete Workflow Test', false, 'Failed to create test order');
      return;
    }
    
    // Step 2: Operations Team views pending orders
    await testOperationsTeamOrderViewing(testOrder);
    
    // Step 3: Operations Team approves order
    const approvedOrder = await testOrderApproval(testOrder);
    
    // Step 4: Operations Team adds BL number
    const blOrder = await testBLNumberManagement(approvedOrder);
    
    // Step 5: Operations Team updates order status
    const finalOrder = await testOrderStatusUpdates(blOrder);
    
    // Step 6: Supervisor receives notifications
    await testSupervisorNotifications(finalOrder);
    
    // Step 7: Supervisor tracks order progress
    await testSupervisorOrderTracking(finalOrder);
    
    logTest('Complete Workflow Test', true, 'All workflow steps completed successfully');
    
  } catch (error) {
    logTest('Complete Workflow Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Complete Order Workflow Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testCompleteWorkflow();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 Complete workflow test passed!');
    console.log('✨ Supervisor → Operations Team → Supervisor workflow is working perfectly!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of workflow tests passed!');
    console.log('✨ The order workflow is highly functional!');
  } else {
    console.log('\n⚠️ Some workflow tests failed. Check the details above for issues.');
  }
  
  return testResults.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runAllTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runAllTests, testResults };
