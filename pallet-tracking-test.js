#!/usr/bin/env node

/**
 * Pallet Tracking Functionality Test
 * Tests the fixed validation, data saving, and linking functionality
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-ekv0xwg0a-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testPalletTrackingValidation() {
  console.log('\n🔍 Testing Pallet Tracking Validation...');
  
  try {
    // Test 1: Valid tracking record with zero values
    const validTrackingWithZeros = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      wooden_pallets_sent: 0,
      intercalaires_sent: 0,
      wooden_pallets_returned: 0,
      intercalaires_returned: 0,
      notes: 'Test with zero values'
    };
    
    const response1 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: validTrackingWithZeros
    });
    
    logTest('Zero Values Validation', response1.status === 201, 
      `Status: ${response1.status}, Expected: 201`);
    
    // Test 2: Valid tracking record with normal values
    const validTracking = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      wooden_pallets_sent: 10,
      intercalaires_sent: 40,
      wooden_pallets_returned: 8,
      intercalaires_returned: 32,
      wooden_pallets_good_condition: 7,
      wooden_pallets_bad_condition: 1,
      intercalaires_good_condition: 30,
      intercalaires_bad_condition: 2,
      return_date: '2024-12-25',
      notes: 'Test tracking record'
    };
    
    const response2 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: validTracking
    });
    
    logTest('Normal Values Validation', response2.status === 201, 
      `Status: ${response2.status}, Expected: 201`);
    
    // Test 3: Missing order_id
    const missingOrderId = {
      client_id: 'CLI-001',
      wooden_pallets_sent: 10,
      intercalaires_sent: 40
    };
    
    const response3 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: missingOrderId
    });
    
    logTest('Missing Order ID Validation', response3.status === 400, 
      `Status: ${response3.status}, Expected: 400`);
    
    // Test 4: Missing client_id
    const missingClientId = {
      order_id: 'ORD-001',
      wooden_pallets_sent: 10,
      intercalaires_sent: 40
    };
    
    const response4 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: missingClientId
    });
    
    logTest('Missing Client ID Validation', response4.status === 400, 
      `Status: ${response4.status}, Expected: 400`);
    
    // Test 5: Missing wooden_pallets_sent
    const missingWoodenPallets = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      intercalaires_sent: 40
    };
    
    const response5 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: missingWoodenPallets
    });
    
    logTest('Missing Wooden Pallets Validation', response5.status === 400, 
      `Status: ${response5.status}, Expected: 400`);
    
    // Test 6: Missing intercalaires_sent
    const missingIntercalaires = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      wooden_pallets_sent: 10
    };
    
    const response6 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: missingIntercalaires
    });
    
    logTest('Missing Intercalaires Validation', response6.status === 400, 
      `Status: ${response6.status}, Expected: 400`);
    
    // Test 7: Negative values
    const negativeValues = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      wooden_pallets_sent: -5,
      intercalaires_sent: 40
    };
    
    const response7 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: negativeValues
    });
    
    logTest('Negative Values Validation', response7.status === 400, 
      `Status: ${response7.status}, Expected: 400`);
    
    // Test 8: Non-existent order
    const nonExistentOrder = {
      order_id: 'NON-EXISTENT',
      client_id: 'CLI-001',
      wooden_pallets_sent: 10,
      intercalaires_sent: 40
    };
    
    const response8 = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: nonExistentOrder
    });
    
    logTest('Non-existent Order Validation', response8.status === 404, 
      `Status: ${response8.status}, Expected: 404`);
    
  } catch (error) {
    logTest('Pallet Tracking Validation Test', false, error.message);
  }
}

async function testPalletTrackingDataSaving() {
  console.log('\n💾 Testing Pallet Tracking Data Saving...');
  
  try {
    // Create a new tracking record
    const newTracking = {
      order_id: 'ORD-001',
      client_id: 'CLI-001',
      wooden_pallets_sent: 15,
      intercalaires_sent: 60,
      wooden_pallets_returned: 12,
      intercalaires_returned: 48,
      wooden_pallets_good_condition: 10,
      wooden_pallets_bad_condition: 2,
      intercalaires_good_condition: 45,
      intercalaires_bad_condition: 3,
      return_date: '2024-12-26',
      notes: 'Data saving test'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
      method: 'POST',
      body: newTracking
    });
    
    logTest('Tracking Record Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdTracking = createResponse.data.palletTracking;
      
      // Verify the record appears in the API
      const getResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`);
      if (getResponse.status === 200) {
        const trackingData = getResponse.data.palletTracking || [];
        const foundTracking = trackingData.find(t => t.id === createdTracking.id);
        
        logTest('Tracking Record Visibility', !!foundTracking, 
          foundTracking ? 'Record visible in API' : 'Record not found');
        
        // Verify all fields are saved correctly
        if (foundTracking) {
          const fieldsMatch = foundTracking.order_id === newTracking.order_id &&
                            foundTracking.client_id === newTracking.client_id &&
                            foundTracking.wooden_pallets_sent === newTracking.wooden_pallets_sent &&
                            foundTracking.intercalaires_sent === newTracking.intercalaires_sent;
          
          logTest('Tracking Record Data Integrity', fieldsMatch, 
            fieldsMatch ? 'All fields saved correctly' : 'Field mismatch');
          
          // Verify automatic linking
          const hasOrderData = !!foundTracking.order;
          const hasClientData = !!foundTracking.client;
          
          logTest('Automatic Order Linking', hasOrderData, 
            hasOrderData ? 'Order data linked' : 'Order data missing');
          
          logTest('Automatic Client Linking', hasClientData, 
            hasClientData ? 'Client data linked' : 'Client data missing');
        }
      }
    }
    
  } catch (error) {
    logTest('Pallet Tracking Data Saving Test', false, error.message);
  }
}

async function testPalletTrackingHistory() {
  console.log('\n📋 Testing Pallet Tracking History...');
  
  try {
    // Get all tracking records
    const response = await makeRequest(`${BASE_URL}/api/pallet-tracking`);
    
    logTest('Tracking History Retrieval', response.status === 200, 
      `Status: ${response.status}, Expected: 200`);
    
    if (response.status === 200) {
      const trackingData = response.data.palletTracking || [];
      
      logTest('Tracking History Data Available', trackingData.length > 0, 
        `Found ${trackingData.length} tracking records`);
      
      // Test filtering by order_id
      const orderFilterResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking?order_id=ORD-001`);
      if (orderFilterResponse.status === 200) {
        const filteredData = orderFilterResponse.data.palletTracking || [];
        const allMatchOrder = filteredData.every(t => t.order_id === 'ORD-001');
        
        logTest('Order ID Filtering', allMatchOrder, 
          `Filtered ${filteredData.length} records for ORD-001`);
      }
      
      // Test filtering by client_id
      const clientFilterResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking?client_id=CLI-001`);
      if (clientFilterResponse.status === 200) {
        const filteredData = clientFilterResponse.data.palletTracking || [];
        const allMatchClient = filteredData.every(t => t.client_id === 'CLI-001');
        
        logTest('Client ID Filtering', allMatchClient, 
          `Filtered ${filteredData.length} records for CLI-001`);
      }
      
      // Test filtering by status
      const statusFilterResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking?status=partial_return`);
      if (statusFilterResponse.status === 200) {
        const filteredData = statusFilterResponse.data.palletTracking || [];
        const allMatchStatus = filteredData.every(t => t.status === 'partial_return');
        
        logTest('Status Filtering', allMatchStatus, 
          `Filtered ${filteredData.length} records with partial_return status`);
      }
    }
    
  } catch (error) {
    logTest('Pallet Tracking History Test', false, error.message);
  }
}

async function testPalletTrackingIntegration() {
  console.log('\n🔗 Testing Pallet Tracking Integration...');
  
  try {
    // Test integration with orders API
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Orders API Integration', ordersResponse.status === 200, 
      `Status: ${ordersResponse.status}`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      const hasOrders = orders.length > 0;
      
      logTest('Orders Data Available', hasOrders, 
        `Found ${orders.length} orders`);
      
      if (hasOrders) {
        const firstOrder = orders[0];
        
        // Test creating tracking for existing order
        const trackingForExistingOrder = {
          order_id: firstOrder.id,
          client_id: firstOrder.client_id,
          wooden_pallets_sent: 5,
          intercalaires_sent: 20,
          notes: 'Integration test'
        };
        
        const integrationResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
          method: 'POST',
          body: trackingForExistingOrder
        });
        
        logTest('Order Integration', integrationResponse.status === 201, 
          `Status: ${integrationResponse.status}, Expected: 201`);
      }
    }
    
    // Test integration with clients API
    const clientsResponse = await makeRequest(`${BASE_URL}/api/clients`);
    logTest('Clients API Integration', clientsResponse.status === 200, 
      `Status: ${clientsResponse.status}`);
    
  } catch (error) {
    logTest('Pallet Tracking Integration Test', false, error.message);
  }
}

async function testPalletTrackingRealTimeUpdates() {
  console.log('\n⚡ Testing Pallet Tracking Real-time Updates...');
  
  try {
    // Get initial tracking data
    const initialResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`);
    logTest('Initial Tracking Data Fetch', initialResponse.status === 200, 
      `Status: ${initialResponse.status}`);
    
    if (initialResponse.status === 200) {
      const initialTracking = initialResponse.data.palletTracking || [];
      
      // Create a new tracking record
      const newTracking = {
        order_id: 'ORD-001',
        client_id: 'CLI-001',
        wooden_pallets_sent: 8,
        intercalaires_sent: 32,
        notes: 'Real-time update test'
      };
      
      const createResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`, {
        method: 'POST',
        body: newTracking
      });
      
      if (createResponse.status === 201) {
        const createdTracking = createResponse.data.palletTracking;
        
        // Immediately check if the record appears in the API
        const updatedResponse = await makeRequest(`${BASE_URL}/api/pallet-tracking`);
        if (updatedResponse.status === 200) {
          const updatedTracking = updatedResponse.data.palletTracking || [];
          const foundTracking = updatedTracking.find(t => t.id === createdTracking.id);
          
          logTest('Real-time Tracking Update', !!foundTracking, 
            foundTracking ? 'New tracking record visible immediately' : 'Record not found');
          
          // Verify the record count increased
          const countIncreased = updatedTracking.length > initialTracking.length;
          logTest('Tracking Count Update', countIncreased, 
            `Initial: ${initialTracking.length}, Updated: ${updatedTracking.length}`);
        }
      }
    }
    
  } catch (error) {
    logTest('Pallet Tracking Real-time Updates Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Pallet Tracking Functionality Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testPalletTrackingValidation();
  await testPalletTrackingDataSaving();
  await testPalletTrackingHistory();
  await testPalletTrackingIntegration();
  await testPalletTrackingRealTimeUpdates();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All pallet tracking tests passed!');
    console.log('✨ Validation, data saving, and linking are working perfectly!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of tests passed!');
    console.log('✨ Pallet tracking functionality is highly reliable!');
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
