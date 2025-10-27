const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = 'https://rfnkkqcqftrbmrcimpfl.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbmtrcWNxZnRyYm1yY2ltcGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjAxMTcsImV4cCI6MjA3NzEzNjExN30.K_2Tp3plBGq72Eb7QEAz6MmhC_hjuCIO08NieI-YOWw'

console.log('🌊 Testing Supabase Connection...')
console.log('URL:', supabaseUrl)
console.log('Key:', supabaseKey.substring(0, 20) + '...')

const supabase = createClient(supabaseUrl, supabaseKey)

async function testConnection() {
  try {
    console.log('🔍 Testing database connection...')
    
    const { data, error } = await supabase
      .from('users')
      .select('count')
      .limit(1)

    if (error) {
      console.log('❌ Database connection failed:', error.message)
      console.log('💡 You need to run the database schema first!')
      console.log('📝 Go to your Supabase dashboard → SQL Editor')
      console.log('📝 Copy and run the contents of database/supabase-schema.sql')
      return
    }

    console.log('✅ Database connection successful!')
    console.log('📊 Database is ready for data!')
    
  } catch (error) {
    console.log('❌ Unexpected error:', error.message)
  }
}

testConnection()
