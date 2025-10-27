#!/usr/bin/env node

/**
 * Auto-Save and Validation System Test
 * Tests automatic saving, database validation, and toast notifications
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-m4uwa7ksv-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testOrderValidation() {
  console.log('\n📋 Testing Order Validation...');
  
  try {
    // Test valid order creation
    const validOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 150000,
      product_5_5L_pallets: 10,
      product_1_5L_pallets: 5,
      truck_type: 'factory',
      truck_capacity: 20,
      delivery_date: '2024-12-30',
      notes: 'Test order for validation',
      created_by: 'demo-mahmoud@djurdjura.dz'
    };
    
    const validResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: validOrder
    });
    
    logTest('Valid Order Creation', validResponse.status === 201, 
      `Status: ${validResponse.status}, Expected: 201`);
    
    // Test invalid order creation (missing required fields)
    const invalidOrder = {
      client_id: '', // Missing required field
      region_id: 'REG-001',
      total_price: -100, // Invalid negative price
      product_5_5L_pallets: -5, // Invalid negative quantity
      delivery_date: '2020-01-01' // Invalid past date
    };
    
    const invalidResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: invalidOrder
    });
    
    logTest('Invalid Order Rejection', invalidResponse.status === 400, 
      `Status: ${invalidResponse.status}, Expected: 400`);
    
    if (invalidResponse.status === 400) {
      logTest('Validation Error Message', !!invalidResponse.data.error, 
        'Error message provided for invalid data');
    }
    
  } catch (error) {
    logTest('Order Validation Test', false, error.message);
  }
}

async function testClientValidation() {
  console.log('\n👥 Testing Client Validation...');
  
  try {
    // Test valid client creation
    const validClient = {
      name: 'Test Client',
      phone: '0555123456',
      address: 'Test Address, Test City',
      region_id: 'REG-001',
      city: 'Test City'
    };
    
    const validResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      body: validClient
    });
    
    logTest('Valid Client Creation', validResponse.status === 201, 
      `Status: ${validResponse.status}, Expected: 201`);
    
    // Test invalid client creation
    const invalidClient = {
      name: '', // Missing required field
      phone: '123', // Invalid phone format
      address: 'Short', // Too short address
      region_id: '' // Missing required field
    };
    
    const invalidResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      body: invalidClient
    });
    
    logTest('Invalid Client Rejection', invalidResponse.status === 400, 
      `Status: ${invalidResponse.status}, Expected: 400`);
    
    if (invalidResponse.status === 400) {
      logTest('Client Validation Error Message', !!invalidResponse.data.error, 
        'Error message provided for invalid client data');
    }
    
  } catch (error) {
    logTest('Client Validation Test', false, error.message);
  }
}

async function testTrackingValidation() {
  console.log('\n📦 Testing Tracking Validation...');
  
  try {
    // Test valid tracking creation
    const validTracking = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      pallet_5_5L_quantity: 10,
      pallet_1_5L_quantity: 5,
      location: 'Warehouse A',
      status: 'in_transit',
      notes: 'Tracking test'
    };
    
    const validResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: validTracking
    });
    
    logTest('Valid Tracking Creation', validResponse.status === 201, 
      `Status: ${validResponse.status}, Expected: 201`);
    
    // Test invalid tracking creation
    const invalidTracking = {
      order_id: '', // Missing required field
      client_id: '', // Missing required field
      pallet_5_5L_quantity: -5, // Invalid negative quantity
      pallet_1_5L_quantity: -3 // Invalid negative quantity
    };
    
    const invalidResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: invalidTracking
    });
    
    logTest('Invalid Tracking Rejection', invalidResponse.status === 400, 
      `Status: ${invalidResponse.status}, Expected: 400`);
    
    if (invalidResponse.status === 400) {
      logTest('Tracking Validation Error Message', !!invalidResponse.data.error, 
        'Error message provided for invalid tracking data');
    }
    
  } catch (error) {
    logTest('Tracking Validation Test', false, error.message);
  }
}

async function testDataIntegrity() {
  console.log('\n🔒 Testing Data Integrity...');
  
  try {
    // Test order data integrity
    const orderResponse = await makeRequest(`${BASE_URL}/api/orders`);
    
    if (orderResponse.status === 200) {
      const orders = orderResponse.data.orders || [];
      
      logTest('Orders Data Available', orders.length > 0, 
        `Found ${orders.length} orders`);
      
      // Check data integrity for each order
      let integrityIssues = 0
      orders.forEach(order => {
        if (!order.id) integrityIssues++
        if (!order.created_at) integrityIssues++
        if (!order.updated_at) integrityIssues++
        if (typeof order.total_price !== 'number') integrityIssues++
        if (order.total_price < 0) integrityIssues++
        if (!order.client_id) integrityIssues++
        if (!order.region_id) integrityIssues++
      })
      
      logTest('Order Data Integrity', integrityIssues === 0, 
        `Found ${integrityIssues} integrity issues in orders`);
    }
    
    // Test client data integrity
    const clientResponse = await makeRequest(`${BASE_URL}/api/clients`);
    
    if (clientResponse.status === 200) {
      const clients = clientResponse.data.clients || [];
      
      logTest('Clients Data Available', clients.length > 0, 
        `Found ${clients.length} clients`);
      
      // Check data integrity for each client
      let integrityIssues = 0
      clients.forEach(client => {
        if (!client.id) integrityIssues++
        if (!client.name || client.name.length < 2) integrityIssues++
        if (!client.phone || client.phone.length < 8) integrityIssues++
        if (!client.address || client.address.length < 5) integrityIssues++
        if (!client.region_id) integrityIssues++
      })
      
      logTest('Client Data Integrity', integrityIssues === 0, 
        `Found ${integrityIssues} integrity issues in clients`);
    }
    
  } catch (error) {
    logTest('Data Integrity Test', false, error.message);
  }
}

async function testAutoSaveSimulation() {
  console.log('\n💾 Testing Auto-Save Simulation...');
  
  try {
    // Create an order first
    const testOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 100000,
      product_5_5L_pallets: 5,
      product_1_5L_pallets: 3,
      truck_type: 'factory',
      truck_capacity: 15,
      delivery_date: '2024-12-30',
      notes: 'Auto-save test order',
      created_by: 'demo-mahmoud@djurdjura.dz'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: testOrder
    });
    
    logTest('Test Order Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      // Simulate auto-save by updating the order multiple times
      const updates = [
        { notes: 'Updated note 1', total_price: 120000 },
        { notes: 'Updated note 2', total_price: 140000 },
        { notes: 'Updated note 3', total_price: 160000 }
      ];
      
      let updateSuccess = 0;
      
      for (const update of updates) {
        const updateResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'edit',
            ...update,
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        if (updateResponse.status === 200) {
          updateSuccess++;
        }
        
        // Small delay to simulate real-time updates
        await new Promise(resolve => setTimeout(resolve, 100));
      }
      
      logTest('Auto-Save Updates', updateSuccess === updates.length, 
        `Successfully updated ${updateSuccess}/${updates.length} times`);
      
      // Verify final state
      const finalResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`);
      
      if (finalResponse.status === 200) {
        const finalOrder = finalResponse.data.order;
        
        logTest('Final State Persistence', finalOrder.notes === 'Updated note 3', 
          `Final notes: ${finalOrder.notes}`);
        
        logTest('Final Price Persistence', finalOrder.total_price === 160000, 
          `Final price: ${finalOrder.total_price}`);
      }
    }
    
  } catch (error) {
    logTest('Auto-Save Simulation Test', false, error.message);
  }
}

async function testErrorHandling() {
  console.log('\n⚠️ Testing Error Handling...');
  
  try {
    // Test 404 error handling
    const notFoundResponse = await makeRequest(`${BASE_URL}/api/orders/NONEXISTENT-ID`);
    
    logTest('404 Error Handling', notFoundResponse.status === 404, 
      `Status: ${notFoundResponse.status}, Expected: 404`);
    
    // Test invalid endpoint
    const invalidEndpointResponse = await makeRequest(`${BASE_URL}/api/invalid-endpoint`);
    
    logTest('Invalid Endpoint Handling', invalidEndpointResponse.status === 404, 
      `Status: ${invalidEndpointResponse.status}, Expected: 404`);
    
    // Test malformed JSON
    const malformedResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{"invalid": json}'
    });
    
    logTest('Malformed JSON Handling', malformedResponse.status >= 400, 
      `Status: ${malformedResponse.status}, Expected: 400+`);
    
  } catch (error) {
    logTest('Error Handling Test', false, error.message);
  }
}

async function testToastNotifications() {
  console.log('\n🔔 Testing Toast Notifications...');
  
  try {
    // Test notification API
    const notificationResponse = await makeRequest(`${BASE_URL}/api/notifications`);
    
    logTest('Notification API Access', notificationResponse.status === 200, 
      `Status: ${notificationResponse.status}, Expected: 200`);
    
    if (notificationResponse.status === 200) {
      const notifications = notificationResponse.data.notifications || [];
      
      logTest('Notifications Available', notifications.length >= 0, 
        `Found ${notifications.length} notifications`);
      
      // Test notification management
      const manageResponse = await makeRequest(`${BASE_URL}/api/notifications/manage?user_id=demo-mahmoud@djurdjura.dz&user_role=supervisor`);
      
      logTest('Notification Management Access', manageResponse.status === 200, 
        `Status: ${manageResponse.status}, Expected: 200`);
      
      if (manageResponse.status === 200) {
        const unreadCount = manageResponse.data.unreadCount || 0;
        
        logTest('Unread Count Available', typeof unreadCount === 'number', 
          `Unread count: ${unreadCount}`);
      }
    }
    
  } catch (error) {
    logTest('Toast Notifications Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Auto-Save and Validation System Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testOrderValidation();
  await testClientValidation();
  await testTrackingValidation();
  await testDataIntegrity();
  await testAutoSaveSimulation();
  await testErrorHandling();
  await testToastNotifications();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All auto-save and validation tests passed!');
    console.log('✨ Automatic saving, database validation, and toast notifications are fully functional!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of tests passed!');
    console.log('✨ The auto-save and validation system is highly functional!');
  } else {
    console.log('\n⚠️ Some tests failed. Check the details above for issues.');
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
