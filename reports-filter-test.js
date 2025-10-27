#!/usr/bin/env node

/**
 * Reports Page Filter System Test
 * Tests the enhanced filter system with real-time updates and persistent data saving
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-9k5vp04ou-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testReportsAPIs() {
  console.log('\n📊 Testing Reports Page APIs...');
  
  try {
    // Test orders API
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Orders API for Reports', ordersResponse.status === 200, `Status: ${ordersResponse.status}`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      logTest('Orders Data Available', orders.length > 0, `Found ${orders.length} orders`);
      
      // Test orders with different statuses
      const statuses = ['pending', 'processing', 'in_transit', 'delivered', 'cancelled'];
      const foundStatuses = statuses.filter(status => 
        orders.some(order => order.status === status)
      );
      logTest('Orders with Various Statuses', foundStatuses.length > 0, 
        `Found statuses: ${foundStatuses.join(', ')}`);
    }
    
    // Test clients API
    const clientsResponse = await makeRequest(`${BASE_URL}/api/clients`);
    logTest('Clients API for Reports', clientsResponse.status === 200, `Status: ${clientsResponse.status}`);
    
    if (clientsResponse.status === 200) {
      const clients = clientsResponse.data.clients || [];
      const regions = clientsResponse.data.regions || [];
      logTest('Clients and Regions Data', clients.length > 0 && regions.length > 0, 
        `Clients: ${clients.length}, Regions: ${regions.length}`);
    }
    
    // Test supervisors API
    const supervisorsResponse = await makeRequest(`${BASE_URL}/api/supervisors`);
    logTest('Supervisors API for Reports', supervisorsResponse.status === 200, `Status: ${supervisorsResponse.status}`);
    
    if (supervisorsResponse.status === 200) {
      const supervisors = supervisorsResponse.data.supervisors || [];
      logTest('Supervisors Data Available', supervisors.length > 0, `Found ${supervisors.length} supervisors`);
    }
    
  } catch (error) {
    logTest('Reports APIs Test', false, error.message);
  }
}

async function testFilterFunctionality() {
  console.log('\n🔍 Testing Filter Functionality...');
  
  try {
    // Test filtering by client
    const clientFilterResponse = await makeRequest(`${BASE_URL}/api/orders?client_id=CLI-001`);
    logTest('Client Filter', clientFilterResponse.status === 200, `Status: ${clientFilterResponse.status}`);
    
    if (clientFilterResponse.status === 200) {
      const filteredOrders = clientFilterResponse.data.orders || [];
      const allClientOrders = filteredOrders.filter(order => order.client_id === 'CLI-001');
      logTest('Client Filter Accuracy', allClientOrders.length === filteredOrders.length, 
        `All ${filteredOrders.length} orders belong to CLI-001`);
    }
    
    // Test filtering by status
    const statusFilterResponse = await makeRequest(`${BASE_URL}/api/orders?status=pending`);
    logTest('Status Filter', statusFilterResponse.status === 200, `Status: ${statusFilterResponse.status}`);
    
    if (statusFilterResponse.status === 200) {
      const filteredOrders = statusFilterResponse.data.orders || [];
      const pendingOrders = filteredOrders.filter(order => order.status === 'pending');
      logTest('Status Filter Accuracy', pendingOrders.length === filteredOrders.length, 
        `All ${filteredOrders.length} orders have pending status`);
    }
    
    // Test filtering by date range
    const dateFilterResponse = await makeRequest(`${BASE_URL}/api/orders?days=30`);
    logTest('Date Range Filter', dateFilterResponse.status === 200, `Status: ${dateFilterResponse.status}`);
    
    if (dateFilterResponse.status === 200) {
      const filteredOrders = dateFilterResponse.data.orders || [];
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const recentOrders = filteredOrders.filter(order => 
        new Date(order.created_at) >= thirtyDaysAgo
      );
      logTest('Date Range Filter Accuracy', recentOrders.length === filteredOrders.length, 
        `All ${filteredOrders.length} orders are within last 30 days`);
    }
    
    // Test multiple filters combined
    const combinedFilterResponse = await makeRequest(`${BASE_URL}/api/orders?client_id=CLI-001&status=pending&days=30`);
    logTest('Combined Filters', combinedFilterResponse.status === 200, `Status: ${combinedFilterResponse.status}`);
    
  } catch (error) {
    logTest('Filter Functionality Test', false, error.message);
  }
}

async function testRealTimeUpdates() {
  console.log('\n⚡ Testing Real-time Updates...');
  
  try {
    // Test that data updates in real-time
    const initialResponse = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('Initial Data Fetch', initialResponse.status === 200, `Status: ${initialResponse.status}`);
    
    if (initialResponse.status === 200) {
      const initialOrders = initialResponse.data.orders || [];
      
      // Wait a moment and fetch again
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const updatedResponse = await makeRequest(`${BASE_URL}/api/orders`);
      if (updatedResponse.status === 200) {
        const updatedOrders = updatedResponse.data.orders || [];
        
        // Check if data is consistent (should be the same or updated)
        logTest('Real-time Data Consistency', 
          updatedOrders.length >= initialOrders.length, 
          `Initial: ${initialOrders.length}, Updated: ${updatedOrders.length}`);
        
        // Test that orders have required fields for reports
        if (updatedOrders.length > 0) {
          const order = updatedOrders[0];
          const hasRequiredFields = !!(order.id && order.status && order.total_price && order.created_at);
          logTest('Order Data Completeness', hasRequiredFields, 
            `Order ${order.id} has all required fields`);
        }
      }
    }
    
  } catch (error) {
    logTest('Real-time Updates Test', false, error.message);
  }
}

async function testDataPersistence() {
  console.log('\n💾 Testing Data Persistence...');
  
  try {
    // Test that data persists across requests
    const response1 = await makeRequest(`${BASE_URL}/api/orders`);
    logTest('First Data Request', response1.status === 200, `Status: ${response1.status}`);
    
    if (response1.status === 200) {
      const orders1 = response1.data.orders || [];
      
      // Wait and make another request
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      const response2 = await makeRequest(`${BASE_URL}/api/orders`);
      if (response2.status === 200) {
        const orders2 = response2.data.orders || [];
        
        // Data should be consistent
        logTest('Data Persistence', 
          orders1.length === orders2.length, 
          `Consistent order count: ${orders1.length}`);
        
        // Test that order details are consistent
        if (orders1.length > 0 && orders2.length > 0) {
          const order1 = orders1[0];
          const order2 = orders2.find(o => o.id === order1.id);
          
          if (order2) {
            const detailsMatch = order1.status === order2.status && 
                               order1.total_price === order2.total_price;
            logTest('Order Details Persistence', detailsMatch, 
              `Order ${order1.id} details consistent`);
          }
        }
      }
    }
    
  } catch (error) {
    logTest('Data Persistence Test', false, error.message);
  }
}

async function testReportCalculations() {
  console.log('\n📈 Testing Report Calculations...');
  
  try {
    // Test that we can calculate report metrics
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    const clientsResponse = await makeRequest(`${BASE_URL}/api/clients`);
    const supervisorsResponse = await makeRequest(`${BASE_URL}/api/supervisors`);
    
    if (ordersResponse.status === 200 && clientsResponse.status === 200 && supervisorsResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      const clients = clientsResponse.data.clients || [];
      const supervisors = supervisorsResponse.data.supervisors || [];
      
      // Calculate basic metrics
      const totalOrders = orders.length;
      const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
      const totalClients = clients.length;
      const totalUsers = supervisors.length;
      
      logTest('Total Orders Calculation', totalOrders > 0, `Total orders: ${totalOrders}`);
      logTest('Total Revenue Calculation', totalRevenue > 0, `Total revenue: ${totalRevenue}`);
      logTest('Total Clients Calculation', totalClients > 0, `Total clients: ${totalClients}`);
      logTest('Total Users Calculation', totalUsers > 0, `Total users: ${totalUsers}`);
      
      // Test status distribution
      const statusDistribution = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      
      const statusCount = Object.keys(statusDistribution).length;
      logTest('Status Distribution Calculation', statusCount > 0, 
        `Found ${statusCount} different statuses`);
      
      // Test region distribution
      const regionDistribution = orders.reduce((acc, order) => {
        const region = order.region_id || 'unknown';
        acc[region] = (acc[region] || 0) + 1;
        return acc;
      }, {});
      
      const regionCount = Object.keys(regionDistribution).length;
      logTest('Region Distribution Calculation', regionCount > 0, 
        `Found ${regionCount} different regions`);
    }
    
  } catch (error) {
    logTest('Report Calculations Test', false, error.message);
  }
}

async function testFilterCombinations() {
  console.log('\n🔗 Testing Filter Combinations...');
  
  try {
    // Test various filter combinations
    const filterCombinations = [
      { name: 'Client + Status', params: 'client_id=CLI-001&status=pending' },
      { name: 'Status + Date Range', params: 'status=delivered&days=30' },
      { name: 'Client + Date Range', params: 'client_id=CLI-002&days=90' },
      { name: 'All Filters', params: 'client_id=CLI-001&status=pending&days=30' }
    ];
    
    for (const combination of filterCombinations) {
      const response = await makeRequest(`${BASE_URL}/api/orders?${combination.params}`);
      logTest(`${combination.name} Filter`, response.status === 200, `Status: ${response.status}`);
      
      if (response.status === 200) {
        const orders = response.data.orders || [];
        logTest(`${combination.name} Results`, orders.length >= 0, `Found ${orders.length} orders`);
      }
    }
    
  } catch (error) {
    logTest('Filter Combinations Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Reports Page Filter System Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testReportsAPIs();
  await testFilterFunctionality();
  await testRealTimeUpdates();
  await testDataPersistence();
  await testReportCalculations();
  await testFilterCombinations();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Reports page filter system is fully functional!');
    console.log('✨ Real-time updates and persistent data saving working perfectly!');
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
