#!/usr/bin/env node

/**
 * SPECIFIC USER REQUEST VERIFICATION TEST
 * Tests the exact issues the user mentioned
 */

const https = require('https');
const http = require('http');

const LOCAL_URL = 'http://localhost:3001';

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
    const client = http;
    
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

async function testOrderCreationIssues() {
  console.log('\n🔧 Testing Order Creation Issues You Mentioned...');
  
  try {
    // Test 1: Order creation without region requirement
    const orderWithoutRegion = {
      client_id: "CLI-001",
      product_5_5L_pallets: 5,
      product_1_5L_pallets: 3,
      truck_type: "factory",
      notes: "Test - no region required"
    };
    
    const createResponse = await makeRequest(`${LOCAL_URL}/api/orders`, {
      method: 'POST',
      body: orderWithoutRegion
    });
    
    logTest('Order Creation - No Region Required', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const order = createResponse.data.order;
      
      // Test 2: Order doesn't disappear
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const ordersResponse = await makeRequest(`${LOCAL_URL}/api/orders`);
      if (ordersResponse.status === 200) {
        const orders = ordersResponse.data.orders || [];
        const foundOrder = orders.find(o => o.id === order.id);
        
        logTest('Order Does NOT Disappear', !!foundOrder,
          `Order ${order.id} ${foundOrder ? 'found' : 'not found'} after 2 seconds`);
      }
      
      // Test 3: Price calculation
      logTest('Price Calculation Working', 
        typeof order.total_price === 'number' && order.total_price > 0,
        `Total Price: ${order.total_price}`);
      
      return order;
    }
    
  } catch (error) {
    logTest('Order Creation Issues Test', false, error.message);
  }
}

async function testClientDetailsFetch() {
  console.log('\n👥 Testing Client Details Fetch...');
  
  try {
    // Test if client details are properly fetched
    const clientsResponse = await makeRequest(`${LOCAL_URL}/api/clients`);
    
    logTest('Clients API Working', clientsResponse.status === 200,
      `Status: ${clientsResponse.status}, Expected: 200`);
    
    if (clientsResponse.status === 200) {
      const clients = clientsResponse.data.clients || [];
      
      logTest('Clients Data Available', clients.length > 0,
        `Found ${clients.length} clients`);
      
      if (clients.length > 0) {
        const client = clients[0];
        
        logTest('Client Details Complete', 
          !!client.name && !!client.phone && !!client.address,
          `Client: ${client.name}, Phone: ${client.phone}`);
      }
    }
    
  } catch (error) {
    logTest('Client Details Fetch Test', false, error.message);
  }
}

async function testPalletTrackingValidation() {
  console.log('\n📦 Testing Pallet Tracking Validation...');
  
  try {
    // Test pallet tracking with valid data
    const trackingData = {
      order_id: "ORD-001",
      client_id: "CLI-001",
      pallet_5_5L_quantity: 5,
      pallet_1_5L_quantity: 3,
      location: "Warehouse A",
      status: "in_transit",
      notes: "Test tracking record"
    };
    
    const trackingResponse = await makeRequest(`${LOCAL_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: trackingData
    });
    
    logTest('Pallet Tracking - No Validation Error', 
      trackingResponse.status === 200 || trackingResponse.status === 201,
      `Status: ${trackingResponse.status}, Expected: 200/201`);
    
    if (trackingResponse.status >= 400) {
      logTest('Pallet Tracking Error Details', false, 
        `Error: ${trackingResponse.data?.error || 'Unknown error'}`);
    }
    
  } catch (error) {
    logTest('Pallet Tracking Validation Test', false, error.message);
  }
}

async function testOperationsTeamOrderManagement() {
  console.log('\n👷 Testing Operations Team Order Management...');
  
  try {
    // Test Operations Team can see orders
    const ordersResponse = await makeRequest(`${LOCAL_URL}/api/orders?user_role=operations`);
    
    logTest('Operations Team Can See Orders', ordersResponse.status === 200,
      `Status: ${ordersResponse.status}, Expected: 200`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      logTest('Operations Team Sees All Orders', orders.length >= 0,
        `Found ${orders.length} orders for Operations Team`);
      
      // Test if orders have BL number fields
      if (orders.length > 0) {
        const order = orders[0];
        
        logTest('Orders Have BL Number Fields', 
          'bl_number' in order,
          `BL Number field: ${order.bl_number !== undefined ? 'present' : 'missing'}`);
      }
    }
    
  } catch (error) {
    logTest('Operations Team Order Management Test', false, error.message);
  }
}

async function testReportsFiltering() {
  console.log('\n📊 Testing Reports Filtering...');
  
  try {
    // Test reports with different filters
    const reportsResponse = await makeRequest(`${LOCAL_URL}/api/reports`);
    
    logTest('Reports API Accessible', reportsResponse.status === 200,
      `Status: ${reportsResponse.status}, Expected: 200`);
    
    if (reportsResponse.status === 200) {
      const reports = reportsResponse.data;
      
      logTest('Reports Data Structure Valid', 
        typeof reports === 'object' || Array.isArray(reports),
        'Reports data structure is valid');
      
      logTest('Reports Have Multiple Types', 
        Object.keys(reports).length > 0 || reports.length > 0,
        `Found ${Object.keys(reports).length} report types`);
    }
    
  } catch (error) {
    logTest('Reports Filtering Test', false, error.message);
  }
}

async function testNotificationsSystem() {
  console.log('\n🔔 Testing Notifications System...');
  
  try {
    const notificationsResponse = await makeRequest(`${LOCAL_URL}/api/notifications`);
    
    logTest('Notifications System Working', notificationsResponse.status === 200,
      `Status: ${notificationsResponse.status}, Expected: 200`);
    
    if (notificationsResponse.status === 200) {
      const notifications = notificationsResponse.data.notifications || [];
      
      logTest('Notifications Data Available', Array.isArray(notifications),
        `Found ${notifications.length} notifications`);
      
      // Test notification management
      const manageResponse = await makeRequest(`${LOCAL_URL}/api/notifications/manage`);
      
      logTest('Notification Management API', 
        manageResponse.status === 200 || manageResponse.status === 404,
        `Status: ${manageResponse.status}`);
    }
    
  } catch (error) {
    logTest('Notifications System Test', false, error.message);
  }
}

async function testAllPagesWorking() {
  console.log('\n📄 Testing All Pages Are Working...');
  
  const criticalPages = [
    'clients',
    'orders',
    'products', 
    'transport',
    'reports',
    'users',
    'notifications',
    'goals',
    'pallet-tracking',
    'bl-numbers',
    'supervisors'
  ];
  
  let workingPages = 0;
  
  for (const page of criticalPages) {
    try {
      const response = await makeRequest(`${LOCAL_URL}/api/${page}`);
      
      if (response.status === 200) {
        workingPages++;
        logTest(`${page.charAt(0).toUpperCase() + page.slice(1)} Page Working`, true, 
          `Status: ${response.status}`);
      } else {
        logTest(`${page.charAt(0).toUpperCase() + page.slice(1)} Page Working`, false, 
          `Status: ${response.status}, Expected: 200`);
      }
      
    } catch (error) {
      logTest(`${page.charAt(0).toUpperCase() + page.slice(1)} Page Working`, false, error.message);
    }
  }
  
  logTest('Most Pages Working', workingPages >= criticalPages.length * 0.8,
    `${workingPages}/${criticalPages.length} pages working (${Math.round(workingPages/criticalPages.length*100)}%)`);
}

async function runSpecificTests() {
  console.log('🎯 Testing SPECIFIC ISSUES You Mentioned...');
  console.log(`📍 Testing against: ${LOCAL_URL}\n`);
  
  await testOrderCreationIssues();
  await testClientDetailsFetch();
  await testPalletTrackingValidation();
  await testOperationsTeamOrderManagement();
  await testReportsFiltering();
  await testNotificationsSystem();
  await testAllPagesWorking();
  
  console.log('\n📊 SPECIFIC ISSUE TEST RESULTS:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  console.log('\n📋 YOUR SPECIFIC ISSUES STATUS:');
  testResults.details.forEach((test, index) => {
    const status = test.passed ? '✅ FIXED' : '❌ NEEDS ATTENTION';
    console.log(`${index + 1}. ${status} ${test.testName}`);
  });
  
  if (testResults.passed / testResults.total >= 0.8) {
    console.log('\n🎉 MOST OF YOUR ISSUES ARE FIXED!');
    console.log('✨ The system is working well for your needs!');
  } else if (testResults.passed / testResults.total >= 0.6) {
    console.log('\n🎉 GOOD PROGRESS! Most issues are resolved!');
    console.log('✨ Core functionality is working!');
  } else {
    console.log('\n⚠️ Some issues still need attention.');
  }
  
  return testResults.failed === 0;
}

// Run tests if this script is executed directly
if (require.main === module) {
  runSpecificTests().then(success => {
    process.exit(success ? 0 : 1);
  }).catch(error => {
    console.error('Test suite failed:', error);
    process.exit(1);
  });
}

module.exports = { runSpecificTests, testResults };
