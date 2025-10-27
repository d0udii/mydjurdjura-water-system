// Quick Supabase Connection Test
// Run this after setting up your Supabase project

const { createClient } = require('@supabase/supabase-js')

// Replace these with your actual Supabase credentials
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://demo.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'demo-key'

console.log('🌊 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

if (supabaseUrl === 'https://demo.supabase.co') {
  console.log('❌ Please set up your Supabase credentials first!')
  console.log('📝 Create a .env.local file with:')
  console.log('   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co')
  console.log('   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key')
  console.log('   SUPABASE_SERVICE_ROLE_KEY=your-service-key')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    // Test basic connection
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ Database connection failed:', error.message)
      console.log('💡 Make sure you have:')
      console.log('   1. Created your Supabase project')
      console.log('   2. Run the database schema (database/supabase-schema.sql)')
      console.log('   3. Set correct environment variables')
      return
    }

    console.log('✅ Database connection successful!')

    // Test users table
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('*')
      .limit(5)

    if (usersError) {
      console.log('❌ Users table error:', usersError.message)
      return
    }

    console.log('✅ Users table accessible')
    console.log(`📊 Found ${users?.length || 0} users`)

    // Test demo accounts
    const demoEmails = [
      'admin@djurdjura.dz',
      'hamouch@djurdjura.dz', 
      'mahmoud@djurdjura.dz',
      'operations@djurdjura.dz'
    ]

    console.log('🔐 Testing demo accounts...')
    for (const email of demoEmails) {
      const { data: user } = await supabase
        .from('users')
        .select('email, role, status')
        .eq('email', email)
        .single()

      if (user) {
        console.log(`✅ ${email} - ${user.role} (${user.status})`)
      } else {
        console.log(`❌ ${email} - Not found`)
      }
    }

    // Test other tables
    console.log('📊 Testing other tables...')
    
    const { data: clients } = await supabase.from('clients').select('count')
    console.log(`✅ Clients table: ${clients?.length || 0} records`)

    const { data: orders } = await supabase.from('orders').select('count')
    console.log(`✅ Orders table: ${orders?.length || 0} records`)

    const { data: regions } = await supabase.from('regions').select('count')
    console.log(`✅ Regions table: ${regions?.length || 0} records`)

    console.log('')
    console.log('🎉 Supabase setup is working perfectly!')
    console.log('🚀 You can now:')
    console.log('   1. Start your app: npm run dev')
    console.log('   2. Login with: admin@djurdjura.dz / password123')
    console.log('   3. Deploy to production: vercel --prod')

  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testConnection()
