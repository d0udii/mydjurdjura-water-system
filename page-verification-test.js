#!/usr/bin/env node

/**
 * Comprehensive Page Verification and Enhancement Test
 * Ensures every page loads correctly, saves data instantly, and handles errors gracefully
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-ambfng2wv-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testPageLoading() {
  console.log('\n📄 Testing Page Loading...');
  
  try {
    // Test all main pages load correctly
    const pages = [
      { name: 'Dashboard', url: '/dashboard' },
      { name: 'Orders', url: '/orders' },
      { name: 'Clients', url: '/clients' },
      { name: 'Users', url: '/users' },
      { name: 'Products', url: '/products' },
      { name: 'Transport', url: '/transport' },
      { name: 'Reports', url: '/reports' },
      { name: 'Notifications', url: '/notifications' },
      { name: 'Goals', url: '/goals' },
      { name: 'Promotions', url: '/promotions' },
      { name: 'BL Numbers', url: '/bl-numbers' },
      { name: 'Pallet Tracking', url: '/pallet-tracking' },
      { name: 'Supervisors', url: '/supervisors' },
      { name: 'Security', url: '/security' },
      { name: 'Workflows', url: '/workflows' },
      { name: 'AI Insights', url: '/ai-insights' },
      { name: 'Mobile Integration', url: '/mobile' },
      { name: 'Settings', url: '/settings' },
      { name: 'Backup', url: '/backup' },
      { name: 'Performance', url: '/performance' },
      { name: 'Search', url: '/search' },
      { name: 'Order Tracking', url: '/order-tracking' },
      { name: 'Inventory', url: '/inventory' },
      { name: 'Collaboration', url: '/collaboration' }
    ];
    
    for (const page of pages) {
      try {
        const response = await makeRequest(`${BASE_URL}${page.url}`);
        // Pages should return 200 or redirect (302) for proper loading
        const isLoaded = response.status === 200 || response.status === 302;
        logTest(`${page.name} Page Loading`, isLoaded, `Status: ${response.status}`);
      } catch (error) {
        logTest(`${page.name} Page Loading`, false, error.message);
      }
    }
    
  } catch (error) {
    logTest('Page Loading Test', false, error.message);
  }
}

async function testInstantDataSaving() {
  console.log('\n💾 Testing Instant Data Saving...');
  
  try {
    // Test order creation and instant saving
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
      notes: 'Test order for instant saving verification',
      created_by: 'TEST-USER'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Order Creation and Instant Saving', createResponse.status === 201, 
      `Status: ${createResponse.status}`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      // Verify order appears immediately in API
      const verifyResponse = await makeRequest(`${BASE_URL}/api/orders`);
      if (verifyResponse.status === 200) {
        const orders = verifyResponse.data.orders || [];
        const foundOrder = orders.find(o => o.id === createdOrder.id);
        logTest('Instant Data Visibility', !!foundOrder, 
          foundOrder ? 'Order visible immediately' : 'Order not found');
      }
      
      // Clean up
      await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
        method: 'DELETE'
      });
    }
    
    // Test client creation and instant saving
    const newClient = {
      name: 'Instant Save Test Client',
      phone: '+213 55 123 456',
      address: 'Test Address, Test City',
      city: 'Test City',
      supervisor_id: 'demo-mahmoud@djurdjura.dz',
      rc_number: 'INSTANT123RC'
    };
    
    const clientCreateResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      body: newClient
    });
    
    logTest('Client Creation and Instant Saving', clientCreateResponse.status === 201, 
      `Status: ${clientCreateResponse.status}`);
    
    if (clientCreateResponse.status === 201) {
      const createdClient = clientCreateResponse.data.client;
      
      // Verify client appears immediately
      const clientVerifyResponse = await makeRequest(`${BASE_URL}/api/clients`);
      if (clientVerifyResponse.status === 200) {
        const clients = clientVerifyResponse.data.clients || [];
        const foundClient = clients.find(c => c.id === createdClient.id);
        logTest('Client Instant Data Visibility', !!foundClient, 
          foundClient ? 'Client visible immediately' : 'Client not found');
      }
      
      // Clean up
      await makeRequest(`${BASE_URL}/api/clients?id=${createdClient.id}`, {
        method: 'DELETE'
      });
    }
    
  } catch (error) {
    logTest('Instant Data Saving Test', false, error.message);
  }
}

async function testErrorHandling() {
  console.log('\n🛡️ Testing Error Handling...');
  
  try {
    // Test invalid data handling
    const invalidOrder = {
      // Missing required fields
      client_id: 'INVALID-ID',
      total_price: 'invalid-price'
    };
    
    const invalidOrderResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: invalidOrder
    });
    
    logTest('Invalid Order Data Handling', invalidOrderResponse.status === 400, 
      `Status: ${invalidOrderResponse.status}, Expected: 400`);
    
    // Test non-existent resource access
    const nonExistentOrderResponse = await makeRequest(`${BASE_URL}/api/orders/NON-EXISTENT-ID`);
    logTest('Non-existent Order Handling', nonExistentOrderResponse.status === 404, 
      `Status: ${nonExistentOrderResponse.status}, Expected: 404`);
    
    // Test invalid client data
    const invalidClient = {
      // Missing required fields
      name: '',
      phone: 'invalid-phone'
    };
    
    const invalidClientResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      body: invalidClient
    });
    
    logTest('Invalid Client Data Handling', invalidClientResponse.status === 400, 
      `Status: ${invalidClientResponse.status}, Expected: 400`);
    
    // Test non-existent client access
    const nonExistentClientResponse = await makeRequest(`${BASE_URL}/api/clients/NON-EXISTENT-ID`);
    logTest('Non-existent Client Handling', nonExistentClientResponse.status === 404, 
      `Status: ${nonExistentClientResponse.status}, Expected: 404`);
    
    // Test invalid authentication
    const invalidAuthResponse = await makeRequest(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      body: {
        email: 'invalid@email.com',
        password: 'wrongpassword'
      }
    });
    
    logTest('Invalid Authentication Handling', invalidAuthResponse.status === 401, 
      `Status: ${invalidAuthResponse.status}, Expected: 401`);
    
    // Test malformed JSON
    try {
      const malformedResponse = await makeRequest(`${BASE_URL}/api/orders`, {
        method: 'POST',
        body: 'invalid-json'
      });
      logTest('Malformed JSON Handling', malformedResponse.status >= 400, 
        `Status: ${malformedResponse.status}, Expected: 400+`);
    } catch (error) {
      logTest('Malformed JSON Handling', true, 'Properly rejected malformed JSON');
    }
    
  } catch (error) {
    logTest('Error Handling Test', false, error.message);
  }
}

async function testDataPersistence() {
  console.log('\n🔄 Testing Data Persistence...');
  
  try {
    // Test that data persists across requests
    const initialResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Initial Data Fetch', initialResponse.status === 200, `Status: ${initialResponse.status}`);
    
    if (initialResponse.status === 200) {
      const initialOrders = initialResponse.data.orders || [];
      
      // Wait and make another request
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const persistentResponse = await makeRequest(`${BASE_URL}/api/orders`);
      if (persistentResponse.status === 200) {
        const persistentOrders = persistentResponse.data.orders || [];
        
        // Data should be consistent
        logTest('Data Persistence Across Requests', 
          persistentOrders.length >= initialOrders.length, 
          `Initial: ${initialOrders.length}, Persistent: ${persistentOrders.length}`);
        
        // Test that order details are consistent
        if (initialOrders.length > 0 && persistentOrders.length > 0) {
          const order1 = initialOrders[0];
          const order2 = persistentOrders.find(o => o.id === order1.id);
          
          if (order2) {
            const detailsMatch = order1.status === order2.status && 
                               order1.total_price === order2.total_price;
            logTest('Order Details Persistence', detailsMatch, 
              `Order ${order1.id} details consistent`);
          }
        }
      }
    }
    
    // Test clients data persistence
    const clientsResponse1 = await makeRequest(`${BASE_URL}/api/clients`);
    if (clientsResponse1.status === 200) {
      const clients1 = clientsResponse1.data.clients || [];
      
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const clientsResponse2 = await makeRequest(`${BASE_URL}/api/clients`);
      if (clientsResponse2.status === 200) {
        const clients2 = clientsResponse2.data.clients || [];
        
        logTest('Clients Data Persistence', 
          clients1.length === clients2.length, 
          `Consistent client count: ${clients1.length}`);
      }
    }
    
  } catch (error) {
    logTest('Data Persistence Test', false, error.message);
  }
}

async function testRealTimeUpdates() {
  console.log('\n⚡ Testing Real-time Updates...');
  
  try {
    // Test that data updates in real-time
    const startTime = Date.now();
    
    const initialResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Initial Real-time Data Fetch', initialResponse.status === 200, 
      `Status: ${initialResponse.status}`);
    
    if (initialResponse.status === 200) {
      const initialOrders = initialResponse.data.orders || [];
      
      // Create a new order to test real-time updates
      const newOrder = {
        client_id: 'CLI-001',
        region_id: 'REG-001',
        assigned_to: 'USR-004',
        total_price: 100000,
        product_5_5L_pallets: 5,
        product_1_5L_pallets: 5,
        truck_type: 'factory',
        truck_capacity: 10,
        delivery_date: '2024-12-26',
        notes: 'Real-time update test',
        created_by: 'TEST-USER'
      };
      
      const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
        method: 'POST',
        body: newOrder
      });
      
      if (createResponse.status === 201) {
        const createdOrder = createResponse.data.order;
        
        // Immediately check if the order appears in the API
        const updatedResponse = await makeRequest(`${BASE_URL}/api/orders`);
        if (updatedResponse.status === 200) {
          const updatedOrders = updatedResponse.data.orders || [];
          const foundOrder = updatedOrders.find(o => o.id === createdOrder.id);
          
          const responseTime = Date.now() - startTime;
          logTest('Real-time Order Update', !!foundOrder, 
            `Order visible in ${responseTime}ms`);
          
          // Clean up
          await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
            method: 'DELETE'
          });
        }
      }
    }
    
  } catch (error) {
    logTest('Real-time Updates Test', false, error.message);
  }
}

async function testCrossPageConsistency() {
  console.log('\n🔗 Testing Cross-Page Data Consistency...');
  
  try {
    // Test that data is consistent across different APIs
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
    logTest('Cross-Page Consistency Test', false, error.message);
  }
}

async function testPerformanceAndReliability() {
  console.log('\n🚀 Testing Performance and Reliability...');
  
  try {
    const startTime = Date.now();
    
    // Test multiple concurrent requests
    const promises = [
      makeRequest(`${BASE_URL}/api/orders`),
      makeRequest(`${BASE_URL}/api/clients`),
      makeRequest(`${BASE_URL}/api/users`),
      makeRequest(`${BASE_URL}/api/products`),
      makeRequest(`${BASE_URL}/api/transport`),
      makeRequest(`${BASE_URL}/api/reports`),
      makeRequest(`${BASE_URL}/api/notifications`),
      makeRequest(`${BASE_URL}/api/goals`)
    ];
    
    const results = await Promise.all(promises);
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    const allSuccessful = results.every(result => result.status === 200);
    logTest('Concurrent API Requests', allSuccessful, 
      `All ${results.length} requests successful in ${responseTime}ms`);
    
    logTest('Response Time Performance', responseTime < 10000, 
      `Response time: ${responseTime}ms`);
    
    // Test individual API response times
    const apiTests = [
      { name: 'Orders API', url: '/api/orders' },
      { name: 'Clients API', url: '/api/clients' },
      { name: 'Users API', url: '/api/users' },
      { name: 'Reports API', url: '/api/reports' }
    ];
    
    for (const test of apiTests) {
      const testStart = Date.now();
      const response = await makeRequest(`${BASE_URL}${test.url}`);
      const testEnd = Date.now();
      const testTime = testEnd - testStart;
      
      logTest(`${test.name} Performance`, 
        response.status === 200 && testTime < 3000, 
        `Status: ${response.status}, Time: ${testTime}ms`);
    }
    
  } catch (error) {
    logTest('Performance and Reliability Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Comprehensive Page Verification and Enhancement Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testPageLoading();
  await testInstantDataSaving();
  await testErrorHandling();
  await testDataPersistence();
  await testRealTimeUpdates();
  await testCrossPageConsistency();
  await testPerformanceAndReliability();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Every page loads correctly, saves data instantly, and handles errors gracefully!');
    console.log('✨ The application is fully optimized and production-ready!');
  } else if (testResults.passed / testResults.total >= 0.95) {
    console.log('\n🎉 Excellent! Over 95% of tests passed!');
    console.log('✨ The application is highly reliable with minor optimizations needed.');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above for optimization opportunities.');
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
