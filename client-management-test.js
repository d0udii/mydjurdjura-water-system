#!/usr/bin/env node

/**
 * Client Management Comprehensive Test
 * Tests client details retrieval, Clients Page functionality, and supervisor/region linking
 */

const https = require('https');
const http = require('http');

const PRODUCTION_URL = 'https://djurdjura-water-system-2-81nnk0s1h-mahmoudjouadi-3817s-projects.vercel.app';
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

async function testClientDetailsRetrieval() {
  console.log('\n🔍 Testing Client Details Retrieval...');
  
  try {
    // Test individual client API endpoint
    const response = await makeRequest(`${BASE_URL}/api/clients/CLI-001`);
    logTest('Individual Client API', response.status === 200, `Status: ${response.status}`);
    
    if (response.status === 200) {
      const client = response.data;
      logTest('Client has name', !!client.name, `Name: ${client.name}`);
      logTest('Client has phone', !!client.phone, `Phone: ${client.phone}`);
      logTest('Client has address', !!client.address, `Address: ${client.address}`);
      logTest('Client has region_id', !!client.region_id, `Region ID: ${client.region_id}`);
      logTest('Client has contact_person', !!client.contact_person, `Contact: ${client.contact_person}`);
      logTest('Client has rc_number', !!client.rc_number, `RC Number: ${client.rc_number}`);
      logTest('Client has status', !!client.status, `Status: ${client.status}`);
    }
  } catch (error) {
    logTest('Client Details Retrieval', false, error.message);
  }
}

async function testClientsPageAPI() {
  console.log('\n📋 Testing Clients Page API...');
  
  try {
    // Test clients list API
    const response = await makeRequest(`${BASE_URL}/api/clients`);
    logTest('Clients List API', response.status === 200, `Status: ${response.status}`);
    
    if (response.status === 200) {
      const data = response.data;
      logTest('API returns clients array', Array.isArray(data.clients), `Clients count: ${data.clients?.length}`);
      logTest('API returns regions array', Array.isArray(data.regions), `Regions count: ${data.regions?.length}`);
      logTest('API returns supervisors array', Array.isArray(data.supervisors), `Supervisors count: ${data.supervisors?.length}`);
      
      if (data.clients && data.clients.length > 0) {
        const client = data.clients[0];
        logTest('First client has all required fields', 
          !!(client.id && client.name && client.phone && client.address && client.region_id), 
          `Client: ${client.name}`);
      }
    }
  } catch (error) {
    logTest('Clients Page API', false, error.message);
  }
}

async function testSupervisorRegionLinking() {
  console.log('\n🔗 Testing Supervisor-Region Linking...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/clients`);
    
    if (response.status === 200) {
      const data = response.data;
      const { clients, regions, supervisors } = data;
      
      // Test that each client has a valid region
      if (clients && regions) {
        let validRegionLinks = 0;
        clients.forEach(client => {
          const region = regions.find(r => r.id === client.region_id);
          if (region) validRegionLinks++;
        });
        
        logTest('Client-Region Linking', 
          validRegionLinks === clients.length, 
          `${validRegionLinks}/${clients.length} clients have valid regions`);
      }
      
      // Test that each region has a supervisor
      if (regions && supervisors) {
        let validSupervisorLinks = 0;
        regions.forEach(region => {
          const supervisor = supervisors.find(s => s.region_id === region.id);
          if (supervisor) validSupervisorLinks++;
        });
        
        logTest('Region-Supervisor Linking', 
          validSupervisorLinks === regions.length, 
          `${validSupervisorLinks}/${regions.length} regions have supervisors`);
      }
      
      // Test supervisor assignment to clients
      if (clients && supervisors) {
        let clientsWithSupervisors = 0;
        clients.forEach(client => {
          const supervisor = supervisors.find(s => s.region_id === client.region_id);
          if (supervisor) clientsWithSupervisors++;
        });
        
        logTest('Client-Supervisor Assignment', 
          clientsWithSupervisors === clients.length, 
          `${clientsWithSupervisors}/${clients.length} clients have assigned supervisors`);
      }
    }
  } catch (error) {
    logTest('Supervisor-Region Linking', false, error.message);
  }
}

async function testClientCRUDOperations() {
  console.log('\n✏️ Testing Client CRUD Operations...');
  
  try {
    // Test CREATE
    const newClient = {
      name: "Test Client",
      phone: "+213 55 123 456",
      address: "Test Address, Test City",
      city: "Test City",
      supervisor_id: "demo-mahmoud@djurdjura.dz",
      rc_number: "TEST123RC"
    };
    
    const createResponse = await makeRequest(`${BASE_URL}/api/clients`, {
      method: 'POST',
      body: newClient
    });
    
    logTest('Client Creation', createResponse.status === 201, `Status: ${createResponse.status}`);
    
    if (createResponse.status === 201) {
      const createdClient = createResponse.data.client;
      logTest('Created client has ID', !!createdClient.id, `ID: ${createdClient.id}`);
      logTest('Created client has region', !!createdClient.region_id, `Region: ${createdClient.region_id}`);
      
      // Test UPDATE
      const updateData = {
        id: createdClient.id,
        name: "Updated Test Client",
        phone: "+213 55 999 999",
        city: "Biskra", // Use a valid city from demo regions
        address: "Updated Address, Biskra"
      };
      
      const updateResponse = await makeRequest(`${BASE_URL}/api/clients`, {
        method: 'PUT',
        body: updateData
      });
      
      logTest('Client Update', updateResponse.status === 200, 
        `Status: ${updateResponse.status}, Error: ${updateResponse.data?.error || 'None'}`);
      
      // Test DELETE
      const deleteResponse = await makeRequest(`${BASE_URL}/api/clients?id=${createdClient.id}`, {
        method: 'DELETE'
      });
      
      logTest('Client Deletion', deleteResponse.status === 200, `Status: ${deleteResponse.status}`);
    }
  } catch (error) {
    logTest('Client CRUD Operations', false, error.message);
  }
}

async function testClientDataConsistency() {
  console.log('\n🔄 Testing Client Data Consistency...');
  
  try {
    const response = await makeRequest(`${BASE_URL}/api/clients`);
    
    if (response.status === 200) {
      const data = response.data;
      const { clients, regions, supervisors } = data;
      
      // Test data consistency
      let consistentData = true;
      let issues = [];
      
      clients.forEach(client => {
        // Check required fields
        if (!client.id || !client.name || !client.phone || !client.address || !client.region_id) {
          consistentData = false;
          issues.push(`Client ${client.id} missing required fields`);
        }
        
        // Check region exists
        const region = regions.find(r => r.id === client.region_id);
        if (!region) {
          consistentData = false;
          issues.push(`Client ${client.id} has invalid region ${client.region_id}`);
        }
        
        // Check supervisor exists for region
        const supervisor = supervisors.find(s => s.region_id === client.region_id);
        if (!supervisor) {
          consistentData = false;
          issues.push(`No supervisor for region ${client.region_id}`);
        }
      });
      
      logTest('Client Data Consistency', consistentData, issues.join('; '));
      
      // Test timestamp format
      let validTimestamps = true;
      clients.forEach(client => {
        if (client.created_at && !client.created_at.includes('T')) {
          validTimestamps = false;
        }
        if (client.updated_at && !client.updated_at.includes('T')) {
          validTimestamps = false;
        }
      });
      
      logTest('Client Timestamp Format', validTimestamps, 'All timestamps in ISO format');
    }
  } catch (error) {
    logTest('Client Data Consistency', false, error.message);
  }
}

async function runAllTests() {
  console.log('🚀 Starting Client Management Comprehensive Test Suite...');
  console.log(`📍 Testing against: ${BASE_URL}`);
  
  await testClientDetailsRetrieval();
  await testClientsPageAPI();
  await testSupervisorRegionLinking();
  await testClientCRUDOperations();
  await testClientDataConsistency();
  
  console.log('\n📊 Test Results Summary:');
  console.log(`✅ Passed: ${testResults.passed}`);
  console.log(`❌ Failed: ${testResults.failed}`);
  console.log(`📈 Total: ${testResults.total}`);
  console.log(`🎯 Success Rate: ${((testResults.passed / testResults.total) * 100).toFixed(1)}%`);
  
  if (testResults.failed === 0) {
    console.log('\n🎉 All tests passed! Client management is working perfectly!');
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
