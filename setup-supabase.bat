@echo off
echo 🌊 Setting up Supabase for Djurdjura Water Distribution System
echo ==============================================================

REM Check if Supabase CLI is installed
where supabase >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Supabase CLI is not installed. Please install it first:
    echo    npm install -g supabase
    echo    or visit: https://supabase.com/docs/guides/cli
    pause
    exit /b 1
)

echo ✅ Supabase CLI found

REM Check if user is logged in
supabase projects list >nul 2>nul
if %errorlevel% neq 0 (
    echo ❌ Please login to Supabase first:
    echo    supabase login
    pause
    exit /b 1
)

echo ✅ Supabase CLI authenticated

echo.
echo 🚀 Creating new Supabase project...
echo Project name: djurdjura-water-system

REM Create the project
supabase projects create djurdjura-water-system --region us-east-1 --plan free

if %errorlevel% neq 0 (
    echo ❌ Failed to create project. Please try again.
    pause
    exit /b 1
)

echo.
echo ✅ Project created successfully!
echo.
echo 📋 Manual setup required:
echo 1. Go to https://supabase.com/dashboard
echo 2. Find your new project: djurdjura-water-system
echo 3. Go to Settings ^> API
echo 4. Copy the Project URL and API keys
echo 5. Create .env.local file with the credentials
echo.
echo 🔐 Demo accounts (password: password123):
echo    admin@djurdjura.dz
echo    hamouch@djurdjura.dz
echo    mahmoud@djurdjura.dz
echo    operations@djurdjura.dz
echo.
echo 📝 Example .env.local file:
echo    NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
echo    NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
echo    SUPABASE_SERVICE_ROLE_KEY=your-service-key
echo.
echo ✅ Supabase project created! Please complete the manual setup above.
pause
