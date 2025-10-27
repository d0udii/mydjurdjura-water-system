#!/usr/bin/env node

/**
 * Operations Team Management Capabilities Test
 * Tests full management capabilities over all approved and pending orders
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-5r8byvr9q-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testOperationsTeamOrderViewing() {
  console.log('\n👁️ Testing Operations Team Order Viewing...');
  
  try {
    // Test viewing all orders as operations team
    const response = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&user_id=USR-004`);
    
    logTest('Operations Team Order Access', response.status === 200, 
      `Status: ${response.status}, Expected: 200`);
    
    if (response.status === 200) {
      const orders = response.data.orders || [];
      
      logTest('Orders Data Available', orders.length > 0, 
        `Found ${orders.length} orders`);
      
      // Test filtering by status
      const pendingResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&status=pending`);
      if (pendingResponse.status === 200) {
        const pendingOrders = pendingResponse.data.orders || [];
        const allPending = pendingOrders.every(order => order.status === 'pending');
        
        logTest('Status Filtering', allPending, 
          `Filtered ${pendingOrders.length} pending orders`);
      }
      
      // Test filtering by assigned_to
      const assignedResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&assigned_to=USR-004`);
      if (assignedResponse.status === 200) {
        const assignedOrders = assignedResponse.data.orders || [];
        const allAssigned = assignedOrders.every(order => order.assigned_to === 'USR-004');
        
        logTest('Assigned To Filtering', allAssigned, 
          `Filtered ${assignedOrders.length} assigned orders`);
      }
    }
    
  } catch (error) {
    logTest('Operations Team Order Viewing Test', false, error.message);
  }
}

async function testOrderApprovalRejection() {
  console.log('\n✅ Testing Order Approval and Rejection...');
  
  try {
    // First, get a pending order
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&status=pending`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      if (orders.length > 0) {
        const testOrder = orders[0];
        
        // Test order approval
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
          const approvedOrder = approveResponse.data.order;
          
          logTest('Approval Status Update', approvedOrder.status === 'processing', 
            `Status: ${approvedOrder.status}, Expected: processing`);
          
          logTest('BL Number Generation', !!approvedOrder.bl_number, 
            `BL Number: ${approvedOrder.bl_number}`);
          
          logTest('Approval Tracking', !!approvedOrder.approved_by && !!approvedOrder.approved_at, 
            `Approved by: ${approvedOrder.approved_by}`);
        }
        
        // Test order rejection
        const rejectResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'reject',
            rejection_reason: 'Test rejection',
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        logTest('Order Rejection', rejectResponse.status === 200, 
          `Status: ${rejectResponse.status}, Expected: 200`);
        
        if (rejectResponse.status === 200) {
          const rejectedOrder = rejectResponse.data.order;
          
          logTest('Rejection Status Update', rejectedOrder.status === 'rejected', 
            `Status: ${rejectedOrder.status}, Expected: rejected`);
          
          logTest('Rejection Tracking', !!rejectedOrder.rejected_by && !!rejectedOrder.rejected_at, 
            `Rejected by: ${rejectedOrder.rejected_by}`);
          
          logTest('Rejection Reason', !!rejectedOrder.rejection_reason, 
            `Reason: ${rejectedOrder.rejection_reason}`);
        }
      } else {
        logTest('Order Approval Test', false, 'No pending orders found for testing');
      }
    }
    
  } catch (error) {
    logTest('Order Approval Rejection Test', false, error.message);
  }
}

async function testBLNumberManagement() {
  console.log('\n📋 Testing BL Number Management...');
  
  try {
    // Get an order to test BL number management
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      if (orders.length > 0) {
        const testOrder = orders[0];
        
        // Test BL number update
        const blNumber = `BL-TEST-${Date.now()}`;
        const blUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'update_bl_number',
            bl_number: blNumber,
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        logTest('BL Number Update', blUpdateResponse.status === 200, 
          `Status: ${blUpdateResponse.status}, Expected: 200`);
        
        if (blUpdateResponse.status === 200) {
          const updatedOrder = blUpdateResponse.data.order;
          
          logTest('BL Number Assignment', updatedOrder.bl_number === blNumber, 
            `BL Number: ${updatedOrder.bl_number}, Expected: ${blNumber}`);
          
          logTest('BL Update Tracking', !!updatedOrder.bl_updated_by && !!updatedOrder.bl_updated_at, 
            `Updated by: ${updatedOrder.bl_updated_by}`);
        }
        
        // Test BL number validation
        const invalidBlResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'update_bl_number',
            bl_number: '', // Empty BL number
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        logTest('BL Number Validation', invalidBlResponse.status === 400, 
          `Status: ${invalidBlResponse.status}, Expected: 400`);
      } else {
        logTest('BL Number Management Test', false, 'No orders found for testing');
      }
    }
    
  } catch (error) {
    logTest('BL Number Management Test', false, error.message);
  }
}

async function testOrderTrackingUpdates() {
  console.log('\n🚚 Testing Order Tracking Updates...');
  
  try {
    // Get an order to test tracking updates
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      if (orders.length > 0) {
        const testOrder = orders[0];
        
        // Test tracking information update
        const trackingInfo = {
          location: 'Warehouse A',
          estimated_delivery: '2024-12-30',
          notes: 'Package ready for dispatch',
          driver: 'Driver Name',
          vehicle: 'Truck-001'
        };
        
        const trackingResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'update_tracking',
            tracking_info: trackingInfo,
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        logTest('Tracking Information Update', trackingResponse.status === 200, 
          `Status: ${trackingResponse.status}, Expected: 200`);
        
        if (trackingResponse.status === 200) {
          const updatedOrder = trackingResponse.data.order;
          
          logTest('Tracking Data Storage', !!updatedOrder.tracking_info, 
            'Tracking info stored');
          
          logTest('Tracking Location', updatedOrder.tracking_info.location === trackingInfo.location, 
            `Location: ${updatedOrder.tracking_info.location}`);
          
          logTest('Tracking Notes', updatedOrder.tracking_info.notes === trackingInfo.notes, 
            `Notes: ${updatedOrder.tracking_info.notes}`);
          
          logTest('Tracking Update Tracking', !!updatedOrder.tracking_info.last_updated, 
            `Last updated: ${updatedOrder.tracking_info.last_updated}`);
        }
        
        // Test status updates
        const statusUpdateResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'update_status',
            status: 'in_transit',
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        logTest('Status Update', statusUpdateResponse.status === 200, 
          `Status: ${statusUpdateResponse.status}, Expected: 200`);
        
        if (statusUpdateResponse.status === 200) {
          const statusUpdatedOrder = statusUpdateResponse.data.order;
          
          logTest('Status Change', statusUpdatedOrder.status === 'in_transit', 
            `Status: ${statusUpdatedOrder.status}, Expected: in_transit`);
        }
      } else {
        logTest('Order Tracking Updates Test', false, 'No orders found for testing');
      }
    }
    
  } catch (error) {
    logTest('Order Tracking Updates Test', false, error.message);
  }
}

async function testOrderCreation() {
  console.log('\n➕ Testing Order Creation by Operations Team...');
  
  try {
    // Test creating a new order as operations team
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
      notes: 'Order created by operations team',
      created_by: 'USR-004'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    logTest('Order Creation by Operations', createResponse.status === 201, 
      `Status: ${createResponse.status}, Expected: 201`);
    
    if (createResponse.status === 201) {
      const createdOrder = createResponse.data.order;
      
      logTest('Order ID Generation', !!createdOrder.id, 
        `Order ID: ${createdOrder.id}`);
      
      logTest('Order Status', createdOrder.status === 'pending', 
        `Status: ${createdOrder.status}, Expected: pending`);
      
      logTest('Order Assignment', createdOrder.assigned_to === newOrder.assigned_to, 
        `Assigned to: ${createdOrder.assigned_to}`);
      
      logTest('Order Creator', createdOrder.created_by === newOrder.created_by, 
        `Created by: ${createdOrder.created_by}`);
      
      // Clean up - delete the test order
      await makeRequest(`${BASE_URL}/api/orders/${createdOrder.id}`, {
        method: 'DELETE',
        body: {
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
    }
    
  } catch (error) {
    logTest('Order Creation Test', false, error.message);
  }
}

async function testOrderModificationDeletion() {
  console.log('\n✏️ Testing Order Modification and Deletion...');
  
  try {
    // First create a test order
    const newOrder = {
      client_id: 'CLI-001',
      region_id: 'REG-001',
      assigned_to: 'USR-004',
      total_price: 150000,
      product_5_5L_pallets: 10,
      product_1_5L_pallets: 10,
      truck_type: 'factory',
      truck_capacity: 20,
      delivery_date: '2024-12-31',
      notes: 'Test order for modification',
      created_by: 'USR-004'
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/orders`, {
      method: 'POST',
      body: newOrder
    });
    
    if (createResponse.status === 201) {
      const testOrder = createResponse.data.order;
      
      // Test order modification
      const editData = {
        total_price: 175000,
        notes: 'Order modified by operations team',
        delivery_date: '2025-01-01'
      };
      
      const editResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
        method: 'PATCH',
        body: {
          action: 'edit',
          ...editData,
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
      
      logTest('Order Modification', editResponse.status === 200, 
        `Status: ${editResponse.status}, Expected: 200`);
      
      if (editResponse.status === 200) {
        const editedOrder = editResponse.data.order;
        
        logTest('Price Update', editedOrder.total_price === editData.total_price, 
          `Price: ${editedOrder.total_price}, Expected: ${editData.total_price}`);
        
        logTest('Notes Update', editedOrder.notes === editData.notes, 
          `Notes: ${editedOrder.notes}`);
        
        logTest('Edit Tracking', !!editedOrder.edited_by && !!editedOrder.edited_at, 
          `Edited by: ${editedOrder.edited_by}`);
      }
      
      // Test order deletion
      const deleteResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
        method: 'DELETE',
        body: {
          user_role: 'operations',
          user_id: 'USR-004'
        }
      });
      
      logTest('Order Deletion', deleteResponse.status === 200, 
        `Status: ${deleteResponse.status}, Expected: 200`);
      
      if (deleteResponse.status === 200) {
        const deletedOrder = deleteResponse.data.order;
        
        logTest('Deletion Status', deletedOrder.status === 'deleted', 
          `Status: ${deletedOrder.status}, Expected: deleted`);
        
        logTest('Deletion Tracking', !!deletedOrder.deleted_by && !!deletedOrder.deleted_at, 
          `Deleted by: ${deletedOrder.deleted_by}`);
      }
    } else {
      logTest('Order Modification Deletion Test', false, 'Failed to create test order');
    }
    
  } catch (error) {
    logTest('Order Modification Deletion Test', false, error.message);
  }
}

async function testPermissionValidation() {
  console.log('\n🔒 Testing Permission Validation...');
  
  try {
    // Test operations team permissions
    const operationsResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&user_id=USR-004`);
    logTest('Operations Team Access', operationsResponse.status === 200, 
      `Status: ${operationsResponse.status}`);
    
    // Test supervisor permissions (should be limited)
    const supervisorResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=supervisor&user_id=demo-mahmoud@djurdjura.dz`);
    logTest('Supervisor Access', supervisorResponse.status === 200, 
      `Status: ${supervisorResponse.status}`);
    
    if (supervisorResponse.status === 200) {
      const supervisorOrders = supervisorResponse.data.orders || [];
      const operationsOrders = operationsResponse.data.orders || [];
      
      logTest('Supervisor Order Limitation', supervisorOrders.length <= operationsOrders.length, 
        `Supervisor: ${supervisorOrders.length}, Operations: ${operationsOrders.length}`);
    }
    
    // Test unauthorized access
    const unauthorizedResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=client&user_id=CLI-001`);
    logTest('Unauthorized Access Handling', unauthorizedResponse.status >= 400, 
      `Status: ${unauthorizedResponse.status}, Expected: 400+`);
    
  } catch (error) {
    logTest('Permission Validation Test', false, error.message);
  }
}

async function testNotificationSystem() {
  console.log('\n🔔 Testing Notification System...');
  
  try {
    // Test that notifications are created for order actions
    const ordersResponse = await makeRequest(`${BASE_URL}/api/orders?user_role=operations&status=pending`);
    
    if (ordersResponse.status === 200) {
      const orders = ordersResponse.data.orders || [];
      
      if (orders.length > 0) {
        const testOrder = orders[0];
        
        // Approve order and check for notification
        const approveResponse = await makeRequest(`${BASE_URL}/api/orders/${testOrder.id}`, {
          method: 'PATCH',
          body: {
            action: 'approve',
            approved_by: 'USR-004',
            user_role: 'operations',
            user_id: 'USR-004'
          }
        });
        
        if (approveResponse.status === 200) {
          logTest('Approval Notification', !!approveResponse.data.notification, 
            'Notification created for approval');
          
          const notification = approveResponse.data.notification;
          
          logTest('Notification Content', notification.title === 'Order Approved', 
            `Title: ${notification.title}`);
          
          logTest('Notification Recipient', notification.user_id === testOrder.created_by, 
            `Recipient: ${notification.user_id}`);
          
          logTest('Notification Order Link', notification.order_id === testOrder.id, 
            `Order ID: ${notification.order_id}`);
        }
      } else {
        logTest('Notification System Test', false, 'No pending orders found for testing');
      }
    }
    
  } catch (error) {
    logTest('Notification System Test', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Operations Team Management Capabilities Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testOperationsTeamOrderViewing();
  await testOrderApprovalRejection();
  await testBLNumberManagement();
  await testOrderTrackingUpdates();
  await testOrderCreation();
  await testOrderModificationDeletion();
  await testPermissionValidation();
  await testNotificationSystem();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All Operations Team management tests passed!');
    console.log('✨ Full management capabilities are working perfectly!');
  } else if (testResults.passed / testResults.total >= 0.9) {
    console.log('\n🎉 Excellent! Over 90% of tests passed!');
    console.log('✨ Operations Team management is highly functional!');
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
