const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load environment variables
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local')
  console.error('Please ensure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function seedDatabase() {
  try {
    console.log('🌱 Starting database seeding...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'seed-dummy-data.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Split by semicolon and execute each statement
    const statements = sqlContent
      .split(';')
      .map(stmt => stmt.trim())
      .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'))
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`)
    
    let successCount = 0
    let errorCount = 0
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]
      
      if (statement.length === 0) continue
      
      try {
        const { error } = await supabase.rpc('exec_sql', { sql: statement })
        
        if (error) {
          console.error(`❌ Error in statement ${i + 1}:`, error.message)
          errorCount++
        } else {
          successCount++
          console.log(`✅ Statement ${i + 1} executed successfully`)
        }
      } catch (err) {
        console.error(`❌ Exception in statement ${i + 1}:`, err.message)
        errorCount++
      }
    }
    
    console.log('\n📊 Seeding Summary:')
    console.log(`✅ Successful: ${successCount}`)
    console.log(`❌ Errors: ${errorCount}`)
    
    if (errorCount === 0) {
      console.log('\n🎉 Database seeding completed successfully!')
      
      // Verify data was inserted
      console.log('\n🔍 Verifying data insertion...')
      
      const tables = ['regions', 'products', 'transport_tariffs', 'clients', 'users', 'orders', 'bl_numbers', 'notifications', 'activity_logs']
      
      for (const table of tables) {
        try {
          const { data, error } = await supabase.from(table).select('*', { count: 'exact' })
          if (error) {
            console.error(`❌ Error counting ${table}:`, error.message)
          } else {
            console.log(`📋 ${table}: ${data.length} records`)
          }
        } catch (err) {
          console.error(`❌ Exception counting ${table}:`, err.message)
        }
      }
    } else {
      console.log('\n⚠️  Database seeding completed with errors. Please check the logs above.')
    }
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
    process.exit(1)
  }
}

// Alternative method using direct SQL execution
async function seedDatabaseDirect() {
  try {
    console.log('🌱 Starting database seeding (direct method)...')
    
    // Read the SQL file
    const sqlPath = path.join(__dirname, '..', 'database', 'seed-dummy-data.sql')
    const sqlContent = fs.readFileSync(sqlPath, 'utf8')
    
    // Execute the entire SQL content
    const { data, error } = await supabase.rpc('exec', { sql: sqlContent })
    
    if (error) {
      console.error('❌ Error executing SQL:', error)
      return
    }
    
    console.log('✅ SQL executed successfully')
    console.log('🎉 Database seeding completed!')
    
  } catch (error) {
    console.error('💥 Fatal error during seeding:', error)
  }
}

// Run the seeding
if (require.main === module) {
  seedDatabase().catch(console.error)
}

module.exports = { seedDatabase, seedDatabaseDirect }
