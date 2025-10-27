#!/usr/bin/env node

/**
 * Order Persistence Test
 * Tests that newly created orders persist and don't disappear
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-kr5wh22us-mahmoudjouadi-3817s-projects.vercel.app';
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
  console.log('\n📝 Testing Order Creation...');
  
  try {
    // Create a new order
    const newOrder = {
      client_id: "CLI-001",
      region_id: "REG-001",
      product_5_5L_pallets: 5,
      product_1_5L_pallets: 3,
      truck_type: "factory",
      truck_capacity: 22,
      delivery_date: "2024-01-25",
      notes: "Test order for persistence",
      created_by: "test-user"
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Order Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      logTest('Order ID Generated', !!createdOrder.id && createdOrder.id.startsWith('ORD-'),
        `Order ID: ${createdOrder.id}`);
      
      logTest('Order Status Set', createdOrder.status === 'pending',
        `Status: ${createdOrder.status}`);
      
      logTest('Order Data Complete', 
        createdOrder.client_id === newOrder.client_id &&
        createdOrder.product_5_5L_pallets === newOrder.product_5_5L_pallets &&
        createdOrder.product_1_5L_pallets === newOrder.product_1_5L_pallets,
        `Client: ${createdOrder.client_id}, 5.5L: ${createdOrder.product_5_5L_pallets}, 1.5L: ${createdOrder.product_1_5L_pallets}`);
      
      return createdOrder;
    }
    
    return null;
    
  } catch (error) {
    logTest('Order Creation Test', false, error.message);
    return null;
  }
}

async function testOrderPersistence(createdOrder) {
  console.log('\n💾 Testing Order Persistence...');
  
  if (!createdOrder) {
    logTest('Order Persistence', false, 'No order to test persistence');
    return;
  }
  
  try {
    // Wait a moment to ensure order is saved
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Fetch all orders to check if our order is there
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    
    logTest('Orders API Access', ordersResponse.status === 200,
      `Status: ${ordersResponse.status}, Expected: 200`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      logTest('Orders Retrieved', orders.length > 0,
        `Found ${orders.length} orders`);
      
      // Check if our created order exists
      const foundOrder = orders.find(o => o.id === createdOrder.id);
      
      logTest('Created Order Found', !!foundOrder,
        `Order ${createdOrder.id} ${foundOrder ? 'found' : 'not found'} in orders list`);
      
      if (foundOrder) {
        logTest('Order Data Intact', 
          foundOrder.client_id === createdOrder.client_id &&
          foundOrder.product_5_5L_pallets === createdOrder.product_5_5L_pallets &&
          foundOrder.product_1_5L_pallets === createdOrder.product_1_5L_pallets &&
          foundOrder.notes === createdOrder.notes,
          'Order data matches creation data');
        
        logTest('Order Timestamps Present', 
          !!foundOrder.created_at && !!foundOrder.updated_at,
          `Created: ${foundOrder.created_at}, Updated: ${foundOrder.updated_at}`);
      }
    }
    
  } catch (error) {
    logTest('Order Persistence Test', false, error.message);
  }
}

async function testOrderRetrieval(createdOrder) {
  console.log('\n🔍 Testing Individual Order Retrieval...');
  
  if (!createdOrder) {
    logTest('Order Retrieval', false, 'No order to test retrieval');
    return;
  }
  
  try {
    // Fetch the specific order by ID
    const orderResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`);
    
    logTest('Individual Order API Access', orderResponse.status === 200,
      `Status: ${orderResponse.status}, Expected: 200`);
    
    if (orderResponse.status === 200) {
      const order = orderResponse.data.order;
      
      logTest('Order Retrieved by ID', !!order,
        `Order ${createdOrder.id} retrieved successfully`);
      
      if (order) {
        logTest('Order Data Complete', 
          order.id === createdOrder.id &&
          order.client_id === createdOrder.client_id &&
          order.status === createdOrder.status,
          `ID: ${order.id}, Client: ${order.client_id}, Status: ${order.status}`);
        
        logTest('Order Client Data', !!order.clients,
          `Client data: ${order.clients ? 'present' : 'missing'}`);
        
        logTest('Order Region Data', !!order.regions,
          `Region data: ${order.regions ? 'present' : 'missing'}`);
      }
    }
    
  } catch (error) {
    logTest('Order Retrieval Test', false, error.message);
  }
}

async function testOrderUpdate(createdOrder) {
  console.log('\n✏️ Testing Order Update...');
  
  if (!createdOrder) {
    logTest('Order Update', false, 'No order to test update');
    return;
  }
  
  try {
    // Update the order
    const updateData = {
      action: 'edit',
      product_5_5L_pallets: 7,
      product_1_5L_pallets: 4,
      notes: 'Updated test order',
      user_role: 'operations',
      user_id: 'USR-004'
    };
    
    const updateResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
      method: 'PATCH',
      body: updateData
    });
    
    logTest('Order Update', updateResponse.status === 200,
      `Status: ${updateResponse.status}, Expected: 200`);
    
    if (updateResponse.status === 200) {
      const updatedOrder = updateResponse.data.order;
      
      logTest('Order Updated Successfully', 
        updatedOrder.product_5_5L_pallets === 7 &&
        updatedOrder.product_1_5L_pallets === 4 &&
        updatedOrder.notes === 'Updated test order',
        `5.5L: ${updatedOrder.product_5_5L_pallets}, 1.5L: ${updatedOrder.product_1_5L_pallets}, Notes: ${updatedOrder.notes}`);
      
      logTest('Update Timestamp', updatedOrder.updated_at !== createdOrder.updated_at,
        `Updated at: ${updatedOrder.updated_at}`);
      
      // Verify the update persists
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const verifyResponse = await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`);
      
      if (verifyResponse.status === 200) {
        const verifiedOrder = verifyResponse.data.order;
        
        logTest('Update Persistence', 
          verifiedOrder.product_5_5L_pallets === 7 &&
          verifiedOrder.product_1_5L_pallets === 4,
          'Update persisted after verification');
      }
    }
    
  } catch (error) {
    logTest('Order Update Test', false, error.message);
  }
}

async function testOrderListConsistency(createdOrder) {
  console.log('\n📋 Testing Order List Consistency...');
  
  if (!createdOrder) {
    logTest('Order List Consistency', false, 'No order to test consistency');
    return;
  }
  
  try {
    // Fetch orders multiple times to ensure consistency
    const response1 = await makeRequest(`${BASE_URL}/api/orders`);
    await new Promise(resolve => setTimeout(resolve, 500));
    const response2 = await makeRequest(`${BASE_URL}/api/orders`);
    
    logTest('Multiple API Calls Success', 
      response1.status === 200 && response2.status === 200,
      `Response 1: ${response1.status}, Response 2: ${response2.status}`);
    
    if (response1.status === 200 && response2.status === 200) {
      const orders1 = response1.data.orders || [];
      const orders2 = response2.data.orders || [];
      
      logTest('Order Count Consistency', orders1.length === orders2.length,
        `Count 1: ${orders1.length}, Count 2: ${orders2.length}`);
      
      const order1 = orders1.find(o => o.id === createdOrder.id);
      const order2 = orders2.find(o => o.id === createdOrder.id);
      
      logTest('Order Presence Consistency', 
        !!order1 && !!order2,
        `Order found in both calls: ${!!order1 && !!order2}`);
      
      if (order1 && order2) {
        logTest('Order Data Consistency', 
          order1.product_5_5L_pallets === order2.product_5_5L_pallets &&
          order1.product_1_5L_pallets === order2.product_1_5L_pallets &&
          order1.notes === order2.notes,
          'Order data consistent across multiple calls');
      }
    }
    
  } catch (error) {
    logTest('Order List Consistency Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Order Persistence Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  // Test order creation
  const createdOrder = await testOrderCreation();
  
  // Test order persistence
  await testOrderPersistence(createdOrder);
  
  // Test individual order retrieval
  await testOrderRetrieval(createdOrder);
  
  // Test order update
  await testOrderUpdate(createdOrder);
  
  // Test order list consistency
  await testOrderListConsistency(createdOrder);
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All order persistence tests passed!');
    console.log('✨ Orders are now properly persisted and won\'t disappear!');
  } else if (testResults.passed / testResults.total >= 0.8) {
    console.log('\n🎉 Great! Over 80% of tests passed!');
    console.log('✨ Order persistence is working well!');
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
