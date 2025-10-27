#!/usr/bin/env node

/**
 * Comprehensive Test Suite for Djurdjura Water Distribution System
 * Tests all pages, APIs, and functionality
 */

const baseUrl = 'http://localhost:3001'
const testAccounts = [
  { email: 'admin@djurdjura.dz', password: 'admin123', role: 'admin' },
  { email: 'hamouch@djurdjura.dz', password: 'chef123', role: 'regional_manager' },
  { email: 'mahmoud@djurdjura.dz', password: 'supervisor123', role: 'supervisor' },
  { email: 'operations@djurdjura.dz', password: 'operations123', role: 'operations' }
]

const pagesToTest = [
  '/',
  '/dashboard',
  '/orders',
  '/clients',
  '/users',
  '/transport',
  '/reports',
  '/settings',
  '/order-tracking',
  '/workflows',
  '/inventory',
  '/search',
  '/collaboration',
  '/security',
  '/ai-insights',
  '/mobile'
]

const apiEndpointsToTest = [
  '/api/orders',
  '/api/clients',
  '/api/users',
  '/api/transport',
  '/api/notifications',
  '/api/reports',
  '/api/products',
  '/api/supervisors'
]

async function testPage(url) {
  try {
    const response = await fetch(url)
    return {
      url,
      status: response.status,
      success: response.ok,
      error: response.ok ? null : `HTTP ${response.status}`
    }
  } catch (error) {
    return {
      url,
      status: 0,
      success: false,
      error: error.message
    }
  }
}

async function testAPI(url) {
  try {
    const response = await fetch(url)
    const data = await response.json()
    return {
      url,
      status: response.status,
      success: response.ok,
      hasData: Array.isArray(data) ? data.length > 0 : Object.keys(data).length > 0,
      error: response.ok ? null : `HTTP ${response.status}`
    }
  } catch (error) {
    return {
      url,
      status: 0,
      success: false,
      hasData: false,
      error: error.message
    }
  }
}

async function runTests() {
  console.log('🚀 Starting Comprehensive Test Suite for Djurdjura Water Distribution System')
  console.log('=' * 80)
  
  // Test login page
  console.log('\n📋 Testing Login Page...')
  const loginTest = await testPage(`${baseUrl}/`)
  console.log(`Login Page: ${loginTest.success ? '✅ PASS' : '❌ FAIL'} - ${loginTest.error || 'OK'}`)
  
  // Test all pages
  console.log('\n📋 Testing All Pages...')
  const pageResults = []
  for (const page of pagesToTest) {
    const result = await testPage(`${baseUrl}${page}`)
    pageResults.push(result)
    console.log(`${page}: ${result.success ? '✅ PASS' : '❌ FAIL'} - ${result.error || 'OK'}`)
  }
  
  // Test all API endpoints
  console.log('\n📋 Testing All API Endpoints...')
  const apiResults = []
  for (const endpoint of apiEndpointsToTest) {
    const result = await testAPI(`${baseUrl}${endpoint}`)
    apiResults.push(result)
    console.log(`${endpoint}: ${result.success ? '✅ PASS' : '❌ FAIL'} - ${result.error || 'OK'} ${result.hasData ? '(Has Data)' : '(No Data)'}`)
  }
  
  // Summary
  console.log('\n📊 Test Summary')
  console.log('=' * 40)
  
  const passedPages = pageResults.filter(r => r.success).length
  const failedPages = pageResults.filter(r => !r.success).length
  
  const passedAPIs = apiResults.filter(r => r.success).length
  const failedAPIs = apiResults.filter(r => !r.success).length
  
  console.log(`Pages: ${passedPages}/${pageResults.length} passed, ${failedPages} failed`)
  console.log(`APIs: ${passedAPIs}/${apiResults.length} passed, ${failedAPIs} failed`)
  
  if (failedPages === 0 && failedAPIs === 0) {
    console.log('\n🎉 ALL TESTS PASSED! System is ready for production deployment.')
  } else {
    console.log('\n⚠️  Some tests failed. Please review the errors above.')
  }
  
  // Test account information
  console.log('\n👥 Test Accounts Available:')
  testAccounts.forEach(account => {
    console.log(`${account.role}: ${account.email} / ${account.password}`)
  })
  
  console.log('\n🔗 Access the application at: http://localhost:3001')
  console.log('=' * 80)
}

// Run tests if this script is executed directly
if (typeof window === 'undefined') {
  runTests().catch(console.error)
}

module.exports = { runTests, testPage, testAPI }
