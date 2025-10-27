#!/bin/bash

# Djurdjura Water Distribution System - Supabase Setup Script
# This script helps you set up Supabase for production use

echo "🌊 Setting up Supabase for Djurdjura Water Distribution System"
echo "=============================================================="

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "   npm install -g supabase"
    echo "   or visit: https://supabase.com/docs/guides/cli"
    exit 1
fi

echo "✅ Supabase CLI found"

# Check if user is logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Please login to Supabase first:"
    echo "   supabase login"
    exit 1
fi

echo "✅ Supabase CLI authenticated"

# Create new Supabase project
echo ""
echo "🚀 Creating new Supabase project..."
echo "Project name: djurdjura-water-system"
echo "Database password: (will be generated)"

# Create the project
PROJECT_OUTPUT=$(supabase projects create djurdjura-water-system --region us-east-1 --plan free 2>&1)
echo "$PROJECT_OUTPUT"

# Extract project ID and database password
PROJECT_ID=$(echo "$PROJECT_OUTPUT" | grep -o 'Created project [a-z0-9-]*' | cut -d' ' -f3)
DB_PASSWORD=$(echo "$PROJECT_OUTPUT" | grep -o 'DB Password: [a-zA-Z0-9]*' | cut -d' ' -f3)

if [ -z "$PROJECT_ID" ]; then
    echo "❌ Failed to create project. Please try again."
    exit 1
fi

echo ""
echo "✅ Project created successfully!"
echo "Project ID: $PROJECT_ID"
echo "Database Password: $DB_PASSWORD"

# Get project URL and API keys
echo ""
echo "🔑 Getting project credentials..."
PROJECT_INFO=$(supabase projects api-keys --project-ref $PROJECT_ID)

# Extract API URL and keys
API_URL="https://$PROJECT_ID.supabase.co"
ANON_KEY=$(echo "$PROJECT_INFO" | grep -A 1 "anon" | tail -n 1 | tr -d ' ')
SERVICE_KEY=$(echo "$PROJECT_INFO" | grep -A 1 "service_role" | tail -n 1 | tr -d ' ')

echo "API URL: $API_URL"
echo "Anon Key: $ANON_KEY"
echo "Service Key: $SERVICE_KEY"

# Create .env.local file
echo ""
echo "📝 Creating environment file..."
cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$API_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY

# Application Settings
NEXT_PUBLIC_APP_NAME="Djurdjura Water Distribution System"
NEXT_PUBLIC_APP_VERSION="2.0.0"
NEXT_PUBLIC_ENABLE_ANALYTICS="true"
NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"
NEXT_PUBLIC_ENABLE_REAL_TIME="true"

# Security Settings
NEXT_PUBLIC_ENABLE_SECURITY_AUDIT="true"
NEXT_PUBLIC_ENABLE_AI_INSIGHTS="true"

# Mobile App Settings
NEXT_PUBLIC_MOBILE_APP_ENABLED="true"
NEXT_PUBLIC_PWA_ENABLED="true"
EOF

echo "✅ Environment file created: .env.local"

# Run the database schema
echo ""
echo "🗄️ Setting up database schema..."
supabase db reset --project-ref $PROJECT_ID --db-url "postgresql://postgres:$DB_PASSWORD@db.$PROJECT_ID.supabase.co:5432/postgres" < database/supabase-schema.sql

if [ $? -eq 0 ]; then
    echo "✅ Database schema applied successfully!"
else
    echo "❌ Failed to apply database schema. Please run it manually:"
    echo "   supabase db reset --project-ref $PROJECT_ID"
fi

# Create Vercel environment variables
echo ""
echo "🚀 Setting up Vercel environment variables..."
if command -v vercel &> /dev/null; then
    vercel env add NEXT_PUBLIC_SUPABASE_URL production <<< "$API_URL"
    vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production <<< "$ANON_KEY"
    vercel env add SUPABASE_SERVICE_ROLE_KEY production <<< "$SERVICE_KEY"
    echo "✅ Vercel environment variables added!"
else
    echo "⚠️ Vercel CLI not found. Please add these environment variables manually in Vercel dashboard:"
    echo "   NEXT_PUBLIC_SUPABASE_URL=$API_URL"
    echo "   NEXT_PUBLIC_SUPABASE_ANON_KEY=$ANON_KEY"
    echo "   SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY"
fi

echo ""
echo "🎉 Supabase setup completed!"
echo ""
echo "📋 Next steps:"
echo "1. Update your local .env.local file with the credentials above"
echo "2. Restart your development server: npm run dev"
echo "3. Test the application with the demo accounts"
echo "4. Deploy to Vercel with the new environment variables"
echo ""
echo "🔐 Demo accounts (password: password123):"
echo "   admin@djurdjura.dz"
echo "   hamouch@djurdjura.dz"
echo "   mahmoud@djurdjura.dz"
echo "   operations@djurdjura.dz"
echo ""
echo "🌐 Supabase Dashboard: https://supabase.com/dashboard/project/$PROJECT_ID"
echo "📊 Database URL: postgresql://postgres:$DB_PASSWORD@db.$PROJECT_ID.supabase.co:5432/postgres"
echo ""
echo "✅ Your Djurdjura Water Distribution System is now connected to Supabase!"
