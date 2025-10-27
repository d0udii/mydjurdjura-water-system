#!/usr/bin/env node

/**
 * Real-time Order Visibility Test
 * Tests that new orders appear everywhere with real-time data consistency
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-ncljgdcgo-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testOrderCreation() {
  console.log('\n🆕 Testing Order Creation...');
  
  try {
    // Create a new order
    const newOrder = {
      client_id: "CLI-001",
      region_id: "REG-001",
      product_5_5L_pallets: 5,
      product_1_5L_pallets: 3,
      truck_type: "factory",
      notes: "Test order for real-time visibility",
      created_by: "USR-001"
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Order Creation', createResponse.status === 201, `Status: ${createResponse.status}`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      logTest('Created Order has ID', !!createdOrder.id, `ID: ${createdOrder.id}`);
      logTest('Created Order has BL Number field', 'bl_number' in createdOrder, 'BL number field present');
      
      return createdOrder;
    }
  } catch (error) {
    logTest('Order Creation', false, error.message);
  }
  
  return null;
}

async function testOrderVisibilityInOrdersAPI(createdOrder) {
  console.log('\n📋 Testing Order Visibility in Orders API...');
  
  if (!createdOrder) {
    logTest('Order Visibility Test', false, 'No created order to test');
    return;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/orders`);
    
    if (response.status === 200) {
      const orders = response.data.orders || [];
      const foundOrder = orders.find(o => o.id === createdOrder.id);
      
      logTest('Order appears in Orders API', !!foundOrder, 
        foundOrder ? `Found order ${foundOrder.id}` : 'Order not found in API response');
      
      if (foundOrder) {
        logTest('Order has correct client', foundOrder.client_id === createdOrder.client_id, 
          `Client ID: ${foundOrder.client_id}`);
        logTest('Order has correct status', foundOrder.status === 'pending', 
          `Status: ${foundOrder.status}`);
        logTest('Order has BL number field', 'bl_number' in foundOrder, 
          `BL Number: ${foundOrder.bl_number || 'null'}`);
      }
    } else {
      logTest('Orders API Response', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('Order Visibility Test', false, error.message);
  }
}

async function testOrderVisibilityInBLNumbersAPI(createdOrder) {
  console.log('\n📦 Testing Order Visibility in BL Numbers API...');
  
  if (!createdOrder) {
    logTest('BL Numbers API Test', false, 'No created order to test');
    return;
  }
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/bl-numbers`);
    
    if (response.status === 200) {
      const blNumbers = response.data.blNumbers || [];
      logTest('BL Numbers API accessible', true, `Found ${blNumbers.length} BL numbers`);
      
      // Check if we can create a BL number for the order
      const blNumberData = {
        order_id: createdOrder.id,
        bl_number: `BL-TEST-${Date.now()}`,
        notes: "Test BL number for real-time visibility",
        created_by: "USR-004"
      };
      
      const createBLResponse = await makeRequest(`${BASE_URL}/api/bl-numbers`, {
        method: 'POST',
        body: blNumberData
      });
      
      logTest('BL Number Creation', createBLResponse.status === 201, 
        `Status: ${createBLResponse.status}`);
      
      if (createBLResponse.status === 201) {
        const createdBL = createBLResponse.data.blNumber;
        logTest('Created BL Number has ID', !!createdBL.id, `ID: ${createdBL.id}`);
        logTest('Created BL Number linked to order', createdBL.order_id === createdOrder.id, 
          `Order ID: ${createdBL.order_id}`);
      }
    } else {
      logTest('BL Numbers API Response', false, `Status: ${response.status}`);
    }
  } catch (error) {
    logTest('BL Numbers API Test', false, error.message);
  }
}

async function testOrderApprovalAndBLNumberGeneration(createdOrder) {
  console.log('\n✅ Testing Order Approval and BL Number Generation...');
  
  if (!createdOrder) {
    logTest('Order Approval Test', false, 'No created order to test');
    return;
  }
  
  try {
    // Approve the order
    const approveResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        approved_by: 'USR-004'
      }
    });
    
    logTest('Order Approval', approveResponse.status === 200, 
      `Status: ${approveResponse.status}`);
    
    if (approveResponse.status === 200) {
      const approvedOrder = approveResponse.data.order;
      logTest('Order has BL Number after approval', !!approvedOrder.bl_number, 
        `BL Number: ${approvedOrder.bl_number}`);
      logTest('Order status changed to processing', approvedOrder.status === 'processing', 
        `Status: ${approvedOrder.status}`);
      logTest('Order has approval timestamp', !!approvedOrder.approved_at, 
        `Approved at: ${approvedOrder.approved_at}`);
      
      // Check if BL number appears in BL numbers API
      const blResponse = await makeRequest(`${BASE_URL}/api/bl-numbers`);
      if (blResponse.status === 200) {
        const blNumbers = blResponse.data.blNumbers || [];
        const foundBL = blNumbers.find(bl => bl.bl_number === approvedOrder.bl_number);
        
        logTest('BL Number appears in BL Numbers API', !!foundBL, 
          foundBL ? `Found BL ${foundBL.bl_number}` : 'BL number not found');
      }
    }
  } catch (error) {
    logTest('Order Approval Test', false, error.message);
  }
}

async function testOrderStatusUpdates(createdOrder) {
  console.log('\n🔄 Testing Order Status Updates...');
  
  if (!createdOrder) {
    logTest('Status Update Test', false, 'No created order to test');
    return;
  }
  
  try {
    const statuses = ['processing', 'in_transit', 'delivered'];
    
    for (const status of statuses) {
      const updateResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
        method: 'PATCH',
        body: {
          action: 'update_status',
          status: status
        }
      });
      
      logTest(`Status Update to ${status}`, updateResponse.status === 200, 
        `Status: ${updateResponse.status}`);
      
      if (updateResponse.status === 200) {
        const updatedOrder = updateResponse.data.order;
        logTest(`Order status is ${status}`, updatedOrder.status === status, 
          `Actual status: ${updatedOrder.status}`);
      }
    }
  } catch (error) {
    logTest('Status Update Test', false, error.message);
  }
}

async function testRealTimeConsistency() {
  console.log('\n⚡ Testing Real-time Data Consistency...');
  
  try {
    // Test that all APIs return consistent data
    const [ordersRes, clientsRes, blRes] = await Promise.all([
      makeRequest(`${BASE_URL}/api/orders`),
      makeRequest(`${BASE_URL}/api/clients`),
      makeRequest(`${BASE_URL}/api/bl-numbers`)
    ]);
    
    logTest('Orders API accessible', ordersRes.status === 200, `Status: ${ordersRes.status}`);
    logTest('Clients API accessible', clientsRes.status === 200, `Status: ${clientsRes.status}`);
    logTest('BL Numbers API accessible', blRes.status === 200, `Status: ${blRes.status}`);
    
    if (ordersRes.status === 200 && blRes.status === 200) {
      const orders = ordersRes.data.orders || [];
      const blNumbers = blRes.data.blNumbers || [];
      
      // Check consistency between orders and BL numbers
      let consistentData = true;
      let issues = [];
      
      orders.forEach(order => {
        if (order.bl_number) {
          const blNumber = blNumbers.find(bl => bl.bl_number === order.bl_number);
          if (!blNumber) {
            consistentData = false;
            issues.push(`Order ${order.id} has BL number ${order.bl_number} but not found in BL numbers API`);
          } else if (blNumber.order_id !== order.id) {
            consistentData = false;
            issues.push(`BL number ${blNumber.bl_number} points to order ${blNumber.order_id} but order is ${order.id}`);
          }
        }
      });
      
      logTest('Data Consistency Between APIs', consistentData, issues.join('; '));
    }
  } catch (error) {
    logTest('Real-time Consistency Test', false, error.message);
  }
}

async function testOrderTrackingDashboard() {
  console.log('\n📊 Testing Order Tracking Dashboard...');
  
  try {
    // Test that orders API returns data suitable for tracking dashboard
    const response = await makeRequest(`${BASE_URL}/api/orders`);
    
    if (response.status === 200) {
      const orders = response.data.orders || [];
      
      logTest('Orders API returns tracking data', orders.length > 0, 
        `Found ${orders.length} orders`);
      
      if (orders.length > 0) {
        const order = orders[0];
        logTest('Order has tracking fields', 
          !!(order.id && order.status && order.client_id && order.created_at), 
          `Order ${order.id} has required tracking fields`);
        
        logTest('Order has client information', !!order.clients, 
          `Client: ${order.clients?.name || 'No client data'}`);
        
        logTest('Order has region information', !!order.regions, 
          `Region: ${order.regions?.name || 'No region data'}`);
      }
    }
  } catch (error) {
    logTest('Order Tracking Dashboard Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Real-time Order Visibility Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  // Create a test order
  const createdOrder = await testOrderCreation();
  
  // Test visibility across all components
  await testOrderVisibilityInOrdersAPI(createdOrder);
  await testOrderVisibilityInBLNumbersAPI(createdOrder);
  await testOrderApprovalAndBLNumberGeneration(createdOrder);
  await testOrderStatusUpdates(createdOrder);
  await testRealTimeConsistency();
  await testOrderTrackingDashboard();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Real-time order visibility is working perfectly!');
    console.log('✨ New orders now appear everywhere with real-time consistency!');
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
