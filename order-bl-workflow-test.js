#!/usr/bin/env node

/**
 * Order Creation and BL Number Workflow Test
 * Tests that orders are automatically saved to database and BL numbers are only assigned by Operations Team
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

async function testOrderCreationAutoSave() {
  console.log('\n💾 Testing Order Creation Auto-Save...');
  
  try {
    // Test order creation
    const testOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 150000,
      product_5_5L_pallets: 10,
      product_1_5L_pallets: 5,
      truck_type: 'factory',
      truck_capacity: 20,
      delivery_date: '2024-12-30',
      notes: 'Test order for auto-save verification',
      created_by: 'demo-mahmoud@djurdjura.dz'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: testOrder
    });
    
    logTest('Order Creation', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      logTest('Order ID Generation', !!createdOrder.id, 
        `Order ID: ${createdOrder.id}`);
      
      logTest('Order Status - Pending', createdOrder.status === 'pending', 
        `Status: ${createdOrder.status}, Expected: pending`);
      
      logTest('BL Number - Not Auto-Generated', createdOrder.bl_number === null, 
        `BL Number: ${createdOrder.bl_number}, Expected: null`);
      
      logTest('Approval Fields - Not Set', !createdOrder.approved_by && !createdOrder.approved_at, 
        `Approved by: ${createdOrder.approved_by}, Approved at: ${createdOrder.approved_at}`);
      
      logTest('Order Saved to Database', !!createdOrder.created_at && !!createdOrder.updated_at, 
        `Created at: ${createdOrder.created_at}, Updated at: ${createdOrder.updated_at}`);
      
      return createdOrder;
    }
    
    return null;
  } catch (error) {
    logTest('Order Creation Auto-Save Test', false, error.message);
    return null;
  }
}

async function testOrderApprovalWithBLNumber(testOrder) {
  console.log('\n📋 Testing Order Approval with BL Number...');
  
  if (!testOrder) {
    logTest('Order Approval Test', false, 'No test order available');
    return;
  }
  
  try {
    // Test order approval with BL number
    const blNumber = `BL-MANUAL-${Date.now()}`;
    const approveResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        bl_number: blNumber,
        approved_by: 'USR-004',
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('Order Approval', approveResponse.status === 200, 
      `Status: ${approveResponse.status}, Expected: 200`);
    
    if (approveResponse.status === 200) {
      const approvedOrder = approveResponse.data.order;
      
      logTest('Status Updated to Processing', approvedOrder.status === 'processing', 
        `Status: ${approvedOrder.status}, Expected: processing`);
      
      logTest('BL Number Assigned', approvedOrder.bl_number === blNumber, 
        `BL Number: ${approvedOrder.bl_number}, Expected: ${blNumber}`);
      
      logTest('Approval Tracking', !!approvedOrder.approved_by && !!approvedOrder.approved_at, 
        `Approved by: ${approvedOrder.approved_by}, Approved at: ${approvedOrder.approved_at}`);
      
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

async function testBLNumberValidation() {
  console.log('\n🔒 Testing BL Number Validation...');
  
  try {
    // Test approval without BL number (should fail)
    const approveWithoutBLResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        // No BL number provided
        approved_by: 'USR-004',
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('Approval Without BL Number - Rejected', approveWithoutBLResponse.status === 400, 
      `Status: ${approveWithoutBLResponse.status}, Expected: 400`);
    
    if (approveWithoutBLResponse.status === 400) {
      logTest('BL Number Required Error', approveWithoutBLResponse.data.error.includes('BL number'), 
        `Error: ${approveWithoutBLResponse.data.error}`);
    }
    
    // Test BL number update
    const blUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
      method: 'PATCH',
      body: {
        action: 'update_bl_number',
        bl_number: `BL-UPDATE-${Date.now()}`,
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('BL Number Update', blUpdateResponse.status === 200, 
      `Status: ${blUpdateResponse.status}, Expected: 200`);
    
    if (blUpdateResponse.status === 200) {
      const updatedOrder = blUpdateResponse.data.order;
      
      logTest('BL Number Updated', !!updatedOrder.bl_number, 
        `BL Number: ${updatedOrder.bl_number}`);
      
      logTest('BL Update Tracking', !!updatedOrder.bl_updated_by && !!updatedOrder.bl_updated_at, 
        `Updated by: ${updatedOrder.bl_updated_by}, Updated at: ${updatedOrder.bl_updated_at}`);
    }
    
  } catch (error) {
    logTest('BL Number Validation Test', false, error.message);
  }
}

async function testOperationsTeamPermissions() {
  console.log('\n👥 Testing Operations Team Permissions...');
  
  try {
    // Test Operations Team can approve orders
    const opsApproveResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        bl_number: `BL-OPS-${Date.now()}`,
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('Operations Team Approval Permission', opsApproveResponse.status === 200, 
      `Status: ${opsApproveResponse.status}, Expected: 200`);
    
    // Test Supervisor cannot approve orders
    const supervisorApproveResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
      method: 'PATCH',
      body: {
        action: 'approve',
        bl_number: `BL-SUPERVISOR-${Date.now()}`,
        user_role: 'supervisor',
        user_id: 'demo-mahmoud@djurdjura.dz'
      }
    });
    
    logTest('Supervisor Approval Permission - Denied', supervisorApproveResponse.status === 403, 
      `Status: ${supervisorApproveResponse.status}, Expected: 403`);
    
    // Test Operations Team can update BL numbers
    const opsBLUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
      method: 'PATCH',
      body: {
        action: 'update_bl_number',
        bl_number: `BL-OPS-UPDATE-${Date.now()}`,
        user_role: 'operations',
        user_id: 'USR-004'
      }
    });
    
    logTest('Operations Team BL Update Permission', opsBLUpdateResponse.status === 200, 
      `Status: ${opsBLUpdateResponse.status}, Expected: 200`);
    
  } catch (error) {
    logTest('Operations Team Permissions Test', false, error.message);
  }
}

async function testOrderStatusWorkflow() {
  console.log('\n🔄 Testing Order Status Workflow...');
  
  try {
    const statuses = [
      { status: 'in_progress', description: 'In Progress' },
      { status: 'in_transit', description: 'In Transit' },
      { status: 'delivered', description: 'Delivered' }
    ];
    
    for (const statusUpdate of statuses) {
      const statusResponse = await makeRequest(`${BASE_URL}/api/orders/ORD-001`, {
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
        const updatedOrder = statusResponse.data.order;
        
        logTest(`Status Change - ${statusUpdate.description}`, updatedOrder.status === statusUpdate.status, 
          `Status: ${updatedOrder.status}, Expected: ${statusUpdate.status}`);
        
        logTest(`Status Notification - ${statusUpdate.description}`, !!statusResponse.data.notification, 
          'Notification created for Supervisor');
      }
    }
    
  } catch (error) {
    logTest('Order Status Workflow Test', false, error.message);
  }
}

async function testDatabasePersistence() {
  console.log('\n💾 Testing Database Persistence...');
  
  try {
    // Test that orders persist in the database
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders`);
    
    logTest('Orders Database Access', ordersResponse.status === 200, 
      `Status: ${ordersResponse.status}, Expected: 200`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      logTest('Orders Persist in Database', orders.length > 0, 
        `Found ${orders.length} orders in database`);
      
      // Check that orders have proper database fields
      const sampleOrder = orders[0];
      
      logTest('Order Database Fields', !!sampleOrder.created_at && !!sampleOrder.updated_at, 
        `Created at: ${sampleOrder.created_at}, Updated at: ${sampleOrder.updated_at}`);
      
      logTest('Order ID Persistence', !!sampleOrder.id, 
        `Order ID: ${sampleOrder.id}`);
      
      logTest('Order Status Persistence', !!sampleOrder.status, 
        `Status: ${sampleOrder.status}`);
    }
    
  } catch (error) {
    logTest('Database Persistence Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Order Creation and BL Number Workflow Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  const testOrder = await testOrderCreationAutoSave();
  await testOrderApprovalWithBLNumber(testOrder);
  await testBLNumberValidation();
  await testOperationsTeamPermissions();
  await testOrderStatusWorkflow();
  await testDatabasePersistence();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All order creation and BL number workflow tests passed!');
    console.log('✨ Orders are automatically saved to database and BL numbers are only assigned by Operations Team!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of tests passed!');
    console.log('✨ The order creation and BL number workflow is highly functional!');
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
