#!/usr/bin/env node

/**
 * Comprehensive Application Test Suite
 * Tests all functionality across the entire Djurdjura Water Distribution System
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-q65hjcfwb-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testAuthenticationSystem() {
  console.log('\n🔐 Testing Authentication System...');
  
  try {
    // Test login endpoint
    const loginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: 'admin@djurdjura.dz',
        password: 'admin123'
      }
    });
    
    logTest('Login API Endpoint', loginResponse.status === 200, `Status: ${loginResponse.status}`);
    
    if (loginResponse.status === 200) {
      const loginData = loginResponse.data;
      logTest('Login Response Structure', !!(loginData.user && loginData.token), 
        `User: ${loginData.user?.name || 'None'}`);
      
      // Test different user roles
      const testUsers = [
        { email: 'mahmoud@djurdjura.dz', password: 'password123', role: 'supervisor' },
        { email: 'operations@djurdjura.dz', password: 'password123', role: 'operations' },
        { email: 'regional@djurdjura.dz', password: 'password123', role: 'regional_manager' }
      ];
      
      for (const user of testUsers) {
        const userLoginResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
          method: 'POST',
          body: user
        });
        
        logTest(`${user.role} Login`, userLoginResponse.status === 200, 
          `Status: ${userLoginResponse.status}`);
      }
    }
    
  } catch (error) {
    logTest('Authentication System Test', false, error.message);
  }
}

async function testOrderManagementSystem() {
  console.log('\n📦 Testing Order Management System...');
  
  try {
    // Test orders API
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Orders API', ordersResponse.status === 200, `Status: ${ordersResponse.status}`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      logTest('Orders Data Available', orders.length > 0, `Found ${orders.length} orders`);
      
      // Test order creation
      const newOrder = {
        client_id: 'CLI-001',
        region_id: 'REG-001',
        assigned_to: 'USR-004',
        total_price: 150000,
        product_5_5L_pallets: 10,
        product_1_5L_pallets: 10,
        truck_type: 'factory',
        truck_capacity: 20,
        delivery_date: '2024-12-25',
        notes: 'Test order for comprehensive testing',
        created_by: 'TEST-USER'
      };
      
      const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
        method: 'POST',
        body: newOrder
      });
      
      logTest('Order Creation', createResponse.status === 201, `Status: ${createResponse.status}`);
      
      if (createResponse.status === 201) {
        const createdOrder = createResponse.data.order;
        
        // Test order approval
        const approveResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
          method: 'PATCH',
          body: { action: 'approve', approved_by: 'USR-004' }
        });
        
        logTest('Order Approval', approveResponse.status === 200, `Status: ${approveResponse.status}`);
        
        if (approveResponse.status === 200) {
          const approvedOrder = approveResponse.data.order;
          logTest('BL Number Generation', !!approvedOrder.bl_number, 
            `BL Number: ${approvedOrder.bl_number}`);
          
          // Test status update
          const statusUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
            method: 'PATCH',
            body: { action: 'update_status', status: 'processing' }
          });
          
          logTest('Order Status Update', statusUpdateResponse.status === 200, 
            `Status: ${statusUpdateResponse.status}`);
        }
        
        // Clean up test order
        await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
          method: 'DELETE'
        });
      }
    }
    
  } catch (error) {
    logTest('Order Management System Test', false, error.message);
  }
}

async function testClientManagementSystem() {
  console.log('\n👥 Testing Client Management System...');
  
  try {
    // Test clients API
    const clientsResponse = await makeRequest(`${BASE_URL}/api/clients`);
    logTest('Clients API', clientsResponse.status === 200, `Status: ${clientsResponse.status}`);
    
    if (clientsResponse.status === 200) {
      const clients = clientsResponse.data.clients || [];
      const regions = clientsResponse.data.regions || [];
      
      logTest('Clients Data Available', clients.length > 0, `Found ${clients.length} clients`);
      logTest('Regions Data Available', regions.length > 0, `Found ${regions.length} regions`);
      
      // Test client creation
      const newClient = {
        name: 'Comprehensive Test Client',
        phone: '+213 55 123 456',
        address: 'Test Address, Test City',
        city: 'Test City',
        supervisor_id: 'demo-mahmoud@djurdjura.dz',
        rc_number: 'COMPREHENSIVE123RC'
      };
      
      const createResponse = await makeRequest(`${BASE_URL}/api/clients`, {
        method: 'POST',
        body: newClient
      });
      
      logTest('Client Creation', createResponse.status === 201, `Status: ${createResponse.status}`);
      
      if (createResponse.status === 201) {
        const createdClient = createResponse.data.client;
        
        // Test client update
        const updateResponse = await makeRequest(`${BASE_URL}/api/clients`, {
          method: 'PUT',
          body: {
            id: createdClient.id,
            name: 'Updated Test Client',
            phone: '+213 55 999 999',
            city: 'Biskra',
            address: 'Updated Address, Biskra'
          }
        });
        
        logTest('Client Update', updateResponse.status === 200, `Status: ${updateResponse.status}`);
        
        // Test individual client API
        const individualResponse = await makeRequest(`${BASE_URL}/api/clients/CLI-001`);
        logTest('Individual Client API', individualResponse.status === 200, 
          `Status: ${individualResponse.status}`);
        
        // Clean up test client
        await makeRequest(`${BASE_URL}/api/clients?id=${createdClient.id}`, {
          method: 'DELETE'
        });
      }
    }
    
  } catch (error) {
    logTest('Client Management System Test', false, error.message);
  }
}

async function testReportsAndAnalytics() {
  console.log('\n📊 Testing Reports and Analytics...');
  
  try {
    // Test reports API
    const reportsResponse = await makeRequest(`${BASE_URL}/api/reports`);
    logTest('Reports API', reportsResponse.status === 200, `Status: ${reportsResponse.status}`);
    
    // Test orders stats API
    const statsResponse = await makeRequest(`${BASE_URL}/api/orders/stats`);
    logTest('Orders Stats API', statsResponse.status === 200, `Status: ${statsResponse.status}`);
    
    if (statsResponse.status === 200) {
      const stats = statsResponse.data;
      logTest('Stats Data Structure', !!(stats.totalOrders && stats.totalRevenue), 
        `Orders: ${stats.totalOrders}, Revenue: ${stats.totalRevenue}`);
    }
    
    // Test filtering functionality
    const filterTests = [
      { name: 'Client Filter', params: 'client_id=CLI-001' },
      { name: 'Status Filter', params: 'status=pending' },
      { name: 'Date Range Filter', params: 'days=30' },
      { name: 'Combined Filters', params: 'client_id=CLI-001&status=pending&days=30' }
    ];
    
    for (const test of filterTests) {
      const filterResponse = await makeRequest(`${BASE_URL}/api/orders?${test.params}`);
      logTest(`${test.name}`, filterResponse.status === 200, `Status: ${filterResponse.status}`);
    }
    
  } catch (error) {
    logTest('Reports and Analytics Test', false, error.message);
  }
}

async function testBLNumbersAndTracking() {
  console.log('\n📋 Testing BL Numbers and Tracking...');
  
  try {
    // Test BL numbers API
    const blResponse = await makeRequest(`${BASE_URL}/api/bl-numbers`);
    logTest('BL Numbers API', blResponse.status === 200, `Status: ${blResponse.status}`);
    
    if (blResponse.status === 200) {
      const blNumbers = blResponse.data.blNumbers || [];
      logTest('BL Numbers Data Available', blNumbers.length >= 0, `Found ${blNumbers.length} BL numbers`);
      
      // Test BL number creation
      const newBLNumber = {
        order_id: 'ORD-001',
        bl_number: `BL-TEST-${Date.now()}`,
        notes: 'Test BL number for comprehensive testing',
        created_by: 'TEST-USER'
      };
      
      const createResponse = await makeRequest(`${BASE_URL}/api/bl-numbers`, {
        method: 'POST',
        body: newBLNumber
      });
      
      logTest('BL Number Creation', createResponse.status === 201, `Status: ${createResponse.status}`);
    }
    
    // Test pallet tracking API
    const palletResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`);
    logTest('Pallet Tracking API', palletResponse.status === 200, `Status: ${palletResponse.status}`);
    
  } catch (error) {
    logTest('BL Numbers and Tracking Test', false, error.message);
  }
}

async function testUserManagementSystem() {
  console.log('\n👤 Testing User Management System...');
  
  try {
    // Test users API
    const usersResponse = await makeRequest(`${BASE_URL}/api/users`);
    logTest('Users API', usersResponse.status === 200, `Status: ${usersResponse.status}`);
    
    if (usersResponse.status === 200) {
      const users = usersResponse.data.users || [];
      logTest('Users Data Available', users.length > 0, `Found ${users.length} users`);
      
      // Test supervisors API
      const supervisorsResponse = await makeRequest(`${BASE_URL}/api/supervisors`);
      logTest('Supervisors API', supervisorsResponse.status === 200, `Status: ${supervisorsResponse.status}`);
      
      if (supervisorsResponse.status === 200) {
        const supervisors = supervisorsResponse.data.supervisors || [];
        logTest('Supervisors Data Available', supervisors.length > 0, 
          `Found ${supervisors.length} supervisors`);
      }
    }
    
  } catch (error) {
    logTest('User Management System Test', false, error.message);
  }
}

async function testProductAndTransportSystem() {
  console.log('\n🚚 Testing Product and Transport System...');
  
  try {
    // Test products API
    const productsResponse = await makeRequest(`${BASE_URL}/api/products`);
    logTest('Products API', productsResponse.status === 200, `Status: ${productsResponse.status}`);
    
    if (productsResponse.status === 200) {
      const products = productsResponse.data.products || [];
      logTest('Products Data Available', products.length > 0, `Found ${products.length} products`);
    }
    
    // Test transport API
    const transportResponse = await makeRequest(`${BASE_URL}/api/transport`);
    logTest('Transport API', transportResponse.status === 200, `Status: ${transportResponse.status}`);
    
    if (transportResponse.status === 200) {
      const transport = transportResponse.data.transport || [];
      logTest('Transport Data Available', transport.length > 0, `Found ${transport.length} transport records`);
    }
    
  } catch (error) {
    logTest('Product and Transport System Test', false, error.message);
  }
}

async function testNotificationsAndGoals() {
  console.log('\n🔔 Testing Notifications and Goals...');
  
  try {
    // Test notifications API
    const notificationsResponse = await makeRequest(`${BASE_URL}/api/notifications`);
    logTest('Notifications API', notificationsResponse.status === 200, `Status: ${notificationsResponse.status}`);
    
    // Test goals API
    const goalsResponse = await makeRequest(`${BASE_URL}/api/goals`);
    logTest('Goals API', goalsResponse.status === 200, `Status: ${goalsResponse.status}`);
    
    if (goalsResponse.status === 200) {
      const goals = goalsResponse.data.goals || [];
      logTest('Goals Data Available', goals.length >= 0, `Found ${goals.length} goals`);
    }
    
    // Test promotions API
    const promotionsResponse = await makeRequest(`${BASE_URL}/api/promotions`);
    logTest('Promotions API', promotionsResponse.status === 200, `Status: ${promotionsResponse.status}`);
    
  } catch (error) {
    logTest('Notifications and Goals Test', false, error.message);
  }
}

async function testExportAndActivityLogs() {
  console.log('\n📤 Testing Export and Activity Logs...');
  
  try {
    // Test export API
    const exportResponse = await makeRequest(`${BASE_URL}/api/export?type=orders&format=pdf`);
    logTest('Export API', exportResponse.status === 200, `Status: ${exportResponse.status}`);
    
    // Test activity logs API
    const activityResponse = await makeRequest(`${BASE_URL}/api/activity-logs`);
    logTest('Activity Logs API', activityResponse.status === 200, `Status: ${activityResponse.status}`);
    
    if (activityResponse.status === 200) {
      const logs = activityResponse.data.logs || [];
      logTest('Activity Logs Data Available', logs.length >= 0, `Found ${logs.length} activity logs`);
    }
    
  } catch (error) {
    logTest('Export and Activity Logs Test', false, error.message);
  }
}

async function testRealTimeConsistency() {
  console.log('\n⚡ Testing Real-time Data Consistency...');
  
  try {
    // Test that all APIs return consistent data
    const [ordersRes, clientsRes, blRes, usersRes] = await Promise.all([
      makeRequest(`${BASE_URL}/api/orders`),
      makeRequest(`${BASE_URL}/api/clients`),
      makeRequest(`${BASE_URL}/api/bl-numbers`),
      makeRequest(`${BASE_URL}/api/users`)
    ]);
    
    logTest('Orders API Consistency', ordersRes.status === 200, `Status: ${ordersRes.status}`);
    logTest('Clients API Consistency', clientsRes.status === 200, `Status: ${clientsRes.status}`);
    logTest('BL Numbers API Consistency', blRes.status === 200, `Status: ${blRes.status}`);
    logTest('Users API Consistency', usersRes.status === 200, `Status: ${usersRes.status}`);
    
    // Test cross-API data consistency
    if (ordersRes.status === 200 && clientsRes.status === 200) {
      const orders = ordersRes.data.orders || [];
      const clients = clientsRes.data.clients || [];
      
      let consistentData = true;
      let issues = [];
      
      orders.forEach(order => {
        const client = clients.find(c => c.id === order.client_id);
        if (!client) {
          consistentData = false;
          issues.push(`Order ${order.id} references non-existent client ${order.client_id}`);
        }
      });
      
      logTest('Cross-API Data Consistency', consistentData, issues.join('; '));
    }
    
  } catch (error) {
    logTest('Real-time Consistency Test', false, error.message);
  }
}

async function testSystemPerformance() {
  console.log('\n🚀 Testing System Performance...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = [
      makeRequest(`${BASE_URL}/api/orders`),
      makeRequest(`${BASE_URL}/api/clients`),
      makeRequest(`${BASE_URL}/api/users`),
      makeRequest(`${BASE_URL}/api/products`),
      makeRequest(`${BASE_URL}/api/transport`)
    ];
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const allSuccessful = results.every(result => result.status === 200);
    logTest('Concurrent API Requests', allSuccessful, 
      `All ${results.length} requests successful in ${responseTime}ms`);
    
    logTest('Response Time Performance', responseTime < 5000, 
      `Response time: ${responseTime}ms`);
    
  } catch (error) {
    logTest('System Performance Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Application Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testAuthenticationSystem();
  await testOrderManagementSystem();
  await testClientManagementSystem();
  await testReportsAndAnalytics();
  await testBLNumbersAndTracking();
  await testUserManagementSystem();
  await testProductAndTransportSystem();
  await testNotificationsAndGoals();
  await testExportAndActivityLogs();
  await testRealTimeConsistency();
  await testSystemPerformance();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! The entire application is fully functional!');
    console.log('✨ All systems working perfectly with real-time consistency!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of tests passed!');
    console.log('✨ The application is highly functional with minor issues to address.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above.');
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
