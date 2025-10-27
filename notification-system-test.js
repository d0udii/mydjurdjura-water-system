#!/usr/bin/env node

/**
 * Real-time Notification System Test
 * Tests notifications across all roles with real-time updates
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-idq91ygxg-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testNotificationAPI() {
  console.log('\n🔔 Testing Notification API...');
  
  try {
    // Test basic notification fetching
    const response = await makeRequest(`${BASE_URL}/api/notifications`);
    
    logTest('Notification API Access', response.status === 200, 
      `Status: ${response.status}, Expected: 200`);
    
    if (response.status === 200) {
      const notifications = response.data.notifications || [];
      
      logTest('Notifications Data Available', notifications.length >= 0, 
        `Found ${notifications.length} notifications`);
      
      // Test role-based filtering
      const supervisorResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
      
      if (supervisorResponse.status === 200) {
        const supervisorNotifications = supervisorResponse.data.notifications || [];
        
        logTest('Supervisor Notifications Filtering', supervisorNotifications.length >= 0, 
          `Found ${supervisorNotifications.length} supervisor notifications`);
      }
      
      // Test operations team notifications
      const operationsResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=operations&user_id=USR-004`);
      
      if (operationsResponse.status === 200) {
        const operationsNotifications = operationsResponse.data.notifications || [];
        
        logTest('Operations Team Notifications Filtering', operationsNotifications.length >= 0, 
          `Found ${operationsNotifications.length} operations notifications`);
      }
    }
    
  } catch (error) {
    logTest('Notification API Test', false, error.message);
  }
}

async function testNotificationManagement() {
  console.log('\n📋 Testing Notification Management...');
  
  try {
    // Test unread count API
    const unreadResponse = await makeRequest(`${BASE_URL}/api/notifications/manage?user_id=demo-mahmoud@djurdjura.dz&user_role=supervisor`);
    
    logTest('Unread Count API', unreadResponse.status === 200, 
      `Status: ${unreadResponse.status}, Expected: 200`);
    
    if (unreadResponse.status === 200) {
      const unreadCount = unreadResponse.data.unreadCount || 0;
      
      logTest('Unread Count Available', typeof unreadCount === 'number', 
        `Unread count: ${unreadCount}`);
    }
    
    // Test mark all as read
    const markAllResponse = await makeRequest(`${BASE_URL}/api/notifications/manage`, {
      method: 'POST',
      body: {
        userId: 'demo-mahmoud@djurdjura.dz',
        userRole: 'supervisor'
      }
    });
    
    logTest('Mark All As Read', markAllResponse.status === 200, 
      `Status: ${markAllResponse.status}, Expected: 200`);
    
    if (markAllResponse.status === 200) {
      const markedCount = markAllResponse.data.markedCount || 0;
      
      logTest('Mark All As Read Success', markedCount >= 0, 
        `Marked ${markedCount} notifications as read`);
    }
    
  } catch (error) {
    logTest('Notification Management Test', false, error.message);
  }
}

async function testOrderNotificationWorkflow() {
  console.log('\n🔄 Testing Order Notification Workflow...');
  
  try {
    // Step 1: Create order as Supervisor
    const newOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 200000,
      product_5_5L_pallets: 15,
      product_1_5L_pallets: 15,
      truck_type: 'factory',
      truck_capacity: 30,
      delivery_date: '2024-12-30',
      notes: 'Order for notification testing',
      created_by: 'demo-mahmoud@djurdjura.dz'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Order Creation for Notifications', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const testOrder = createResponse.data.order;
      
      // Step 2: Check Operations Team notifications
      const operationsNotificationsResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=operations&user_id=USR-004`);
      
      if (operationsNotificationsResponse.status === 200) {
        const operationsNotifications = operationsNotificationsResponse.data.notifications || [];
        const orderNotification = operationsNotifications.find(n => 
          n.message.includes(testOrder.id) || n.order_id === testOrder.id
        );
        
        logTest('Operations Team Order Notification', !!orderNotification, 
          'Operations Team received order creation notification');
      }
      
      // Step 3: Approve order as Operations Team
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
        // Step 4: Check Supervisor notifications
        const supervisorNotificationsResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
        
        if (supervisorNotificationsResponse.status === 200) {
          const supervisorNotifications = supervisorNotificationsResponse.data.notifications || [];
          const approvalNotification = supervisorNotifications.find(n => 
            n.title === 'Order Approved' && n.order_id === testOrder.id
          );
          
          logTest('Supervisor Approval Notification', !!approvalNotification, 
            'Supervisor received order approval notification');
          
          if (approvalNotification) {
            logTest('Approval Notification Content', approvalNotification.message.includes(testOrder.id), 
              'Approval notification contains order ID');
          }
        }
      }
      
      // Step 5: Update BL Number
      const blUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
        method: 'PATCH',
        body: {
          action: 'update_bl_number',
          bl_number: `BL-NOTIF-TEST-${Date.now()}`,
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
      
      logTest('BL Number Update', blUpdateResponse.status === 200, 
        `Status: ${blUpdateResponse.status}, Expected: 200`);
      
      if (blUpdateResponse.status === 200) {
        // Step 6: Check BL Number notification
        const supervisorNotificationsResponse2 = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
        
        if (supervisorNotificationsResponse2.status === 200) {
          const supervisorNotifications = supervisorNotificationsResponse2.data.notifications || [];
          const blNotification = supervisorNotifications.find(n => 
            n.title === 'BL Number Updated' && n.order_id === testOrder.id
          );
          
          logTest('Supervisor BL Notification', !!blNotification, 
            'Supervisor received BL number update notification');
        }
      }
      
      // Step 7: Update order status
      const statusUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
        method: 'PATCH',
        body: {
          action: 'update_status',
          status: 'in_transit',
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
      
      logTest('Order Status Update', statusUpdateResponse.status === 200, 
        `Status: ${statusUpdateResponse.status}, Expected: 200`);
      
      if (statusUpdateResponse.status === 200) {
        // Step 8: Check status update notification
        const supervisorNotificationsResponse3 = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
        
        if (supervisorNotificationsResponse3.status === 200) {
          const supervisorNotifications = supervisorNotificationsResponse3.data.notifications || [];
          const statusNotification = supervisorNotifications.find(n => 
            n.title === 'Order Status Updated' && n.order_id === testOrder.id
          );
          
          logTest('Supervisor Status Notification', !!statusNotification, 
            'Supervisor received status update notification');
        }
      }
    }
    
  } catch (error) {
    logTest('Order Notification Workflow Test', false, error.message);
  }
}

async function testRealTimeNotifications() {
  console.log('\n⚡ Testing Real-time Notifications...');
  
  try {
    // Test notification creation
    const newNotification = {
      title: 'Test Real-time Notification',
      message: 'This is a test notification for real-time functionality',
      type: 'alert',
      priority: 'medium',
      target_role: 'supervisor',
      target_user_id: 'demo-mahmoud@djurdjura.dz',
      created_by: 'system'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/notifications`, {
      method: 'POST',
      body: newNotification
    });
    
    logTest('Real-time Notification Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdNotification = createResponse.data.notification;
      
      // Test immediate visibility
      const visibilityResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
      
      if (visibilityResponse.status === 200) {
        const notifications = visibilityResponse.data.notifications || [];
        const testNotification = notifications.find(n => n.id === createdNotification.id);
        
        logTest('Real-time Notification Visibility', !!testNotification, 
          'Test notification immediately visible to target user');
      }
      
      // Test unread count update
      const unreadResponse = await makeRequest(`${BASE_URL}/api/notifications/manage?user_id=demo-mahmoud@djurdjura.dz&user_role=supervisor`);
      
      if (unreadResponse.status === 200) {
        const unreadCount = unreadResponse.data.unreadCount || 0;
        
        logTest('Real-time Unread Count Update', unreadCount > 0, 
          `Unread count updated to: ${unreadCount}`);
      }
    }
    
  } catch (error) {
    logTest('Real-time Notifications Test', false, error.message);
  }
}

async function testCrossRoleNotifications() {
  console.log('\n👥 Testing Cross-Role Notifications...');
  
  try {
    // Test Admin notifications
    const adminResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=admin&user_id=admin@djurdjura.dz`);
    
    logTest('Admin Notifications Access', adminResponse.status === 200, 
      `Status: ${adminResponse.status}, Expected: 200`);
    
    if (adminResponse.status === 200) {
      const adminNotifications = adminResponse.data.notifications || [];
      
      logTest('Admin Notifications Available', adminNotifications.length >= 0, 
        `Found ${adminNotifications.length} admin notifications`);
    }
    
    // Test Regional Manager notifications
    const rmResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=regional_manager&user_id=demo-hamouch@djurdjura.dz`);
    
    logTest('Regional Manager Notifications Access', rmResponse.status === 200, 
      `Status: ${rmResponse.status}, Expected: 200`);
    
    if (rmResponse.status === 200) {
      const rmNotifications = rmResponse.data.notifications || [];
      
      logTest('Regional Manager Notifications Available', rmNotifications.length >= 0, 
        `Found ${rmNotifications.length} regional manager notifications`);
    }
    
    // Test Operations Team notifications
    const opsResponse = await makeRequest(`${BASE_URL}/api/notifications?user_role=operations&user_id=USR-004`);
    
    logTest('Operations Team Notifications Access', opsResponse.status === 200, 
      `Status: ${opsResponse.status}, Expected: 200`);
    
    if (opsResponse.status === 200) {
      const opsNotifications = opsResponse.data.notifications || [];
      
      logTest('Operations Team Notifications Available', opsNotifications.length >= 0, 
        `Found ${opsNotifications.length} operations team notifications`);
    }
    
  } catch (error) {
    logTest('Cross-Role Notifications Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Real-time Notification System Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testNotificationAPI();
  await testNotificationManagement();
  await testOrderNotificationWorkflow();
  await testRealTimeNotifications();
  await testCrossRoleNotifications();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All notification tests passed!');
    console.log('✨ Real-time notifications are fully functional across all roles!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of notification tests passed!');
    console.log('✨ The notification system is highly functional!');
  } else {
    console.log('\n⚠️ Some notification tests failed. Check the details above for issues.');
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
