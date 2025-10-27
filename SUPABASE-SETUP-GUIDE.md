# 🗄️ Supabase Database Setup Guide

## 🚀 **Quick Setup (Recommended)**

### **Step 1: Create Supabase Project**

1. **Go to Supabase Dashboard**
   - Visit: https://supabase.com/dashboard
   - Click "New Project"
   - Choose your organization

2. **Project Settings**
   - **Name**: `djurdjura-water-system`
   - **Database Password**: Generate a strong password (save it!)
   - **Region**: Choose closest to your users
   - **Plan**: Free tier is perfect for development

3. **Wait for Setup**
   - Project creation takes 2-3 minutes
   - You'll get a project URL like: `https://your-project.supabase.co`

### **Step 2: Get API Keys**

1. **Go to Project Settings**
   - Click on your project
   - Go to "Settings" → "API"

2. **Copy the Keys**
   - **Project URL**: `https://your-project.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

### **Step 3: Set Up Database Schema**

1. **Go to SQL Editor**
   - In your Supabase dashboard
   - Click "SQL Editor" in the sidebar

2. **Run the Schema**
   - Copy the contents of `database/supabase-schema.sql`
   - Paste it into the SQL editor
   - Click "Run" to execute

3. **Verify Tables**
   - Go to "Table Editor"
   - You should see these tables:
     - `users`
     - `regions`
     - `clients`
     - `products`
     - `transport_tariffs`
     - `orders`
     - `notifications`
     - `activity_logs`

### **Step 4: Configure Environment Variables**

1. **Create `.env.local` file**
   ```bash
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
   
   # Application Settings
   NEXT_PUBLIC_APP_NAME="Djurdjura Water Distribution System"
   NEXT_PUBLIC_APP_VERSION="2.0.0"
   NEXT_PUBLIC_ENABLE_ANALYTICS="true"
   NEXT_PUBLIC_ENABLE_NOTIFICATIONS="true"
   NEXT_PUBLIC_ENABLE_REAL_TIME="true"
   ```

2. **Update Vercel Environment Variables**
   - Go to your Vercel dashboard
   - Select your project
   - Go to "Settings" → "Environment Variables"
   - Add the same variables for Production

### **Step 5: Test the Connection**

1. **Start Development Server**
   ```bash
   npm run dev
   ```

2. **Test Login**
   - Go to http://localhost:3000
   - Try logging in with: `admin@djurdjura.dz` / `password123`

3. **Check Database**
   - Go to Supabase Table Editor
   - Verify data is being created/updated

## 🔐 **Demo Accounts**

After setup, these accounts will work:

| Role | Email | Password | Access Level |
|------|-------|----------|--------------|
| **Admin** | admin@djurdjura.dz | password123 | Full system access |
| **Regional Manager** | hamouch@djurdjura.dz | password123 | Regional oversight |
| **Supervisor** | mahmoud@djurdjura.dz | password123 | Client management |
| **Operations** | operations@djurdjura.dz | password123 | Order processing |

## 🛠️ **Manual Setup (Alternative)**

If you prefer manual setup:

### **1. Install Supabase CLI**
```bash
npm install -g supabase
```

### **2. Login to Supabase**
```bash
supabase login
```

### **3. Create Project**
```bash
supabase projects create djurdjura-water-system --region us-east-1 --plan free
```

### **4. Run Setup Script**
```bash
# On Windows
setup-supabase.bat

# On Mac/Linux
chmod +x setup-supabase.sh
./setup-supabase.sh
```

## 📊 **Database Schema Overview**

### **Tables Created**
- **users**: User accounts and roles
- **regions**: Geographic regions
- **clients**: Customer information
- **products**: Product catalog
- **transport_tariffs**: Shipping costs
- **orders**: Order management
- **notifications**: Real-time notifications
- **activity_logs**: Audit trail

### **Sample Data Included**
- 4 test users with different roles
- 4 regions (East, West, North, South)
- 5 sample clients in East region
- 2 products (5.5L and 1.5L water)
- 5 transport tariffs for East region cities
- 3 sample orders

## 🔒 **Security Features**

### **Row Level Security (RLS)**
- Users can only see their own data
- Admins can see all data
- Proper access controls implemented

### **Authentication**
- Secure password hashing
- Role-based access control
- Session management

### **Data Validation**
- Type-safe database operations
- Input validation
- Error handling

## 🚀 **Production Deployment**

### **1. Update Vercel Environment Variables**
```bash
vercel env add NEXT_PUBLIC_SUPABASE_URL production
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

### **2. Deploy to Production**
```bash
vercel --prod
```

### **3. Test Production**
- Visit your production URL
- Test login with demo accounts
- Verify all features work

## 🔧 **Troubleshooting**

### **Common Issues**

1. **"Failed to connect to database"**
   - Check your environment variables
   - Verify Supabase project is active
   - Check network connectivity

2. **"User not found in database"**
   - Run the database schema again
   - Check if users table has data
   - Verify email addresses match

3. **"Permission denied"**
   - Check RLS policies
   - Verify user roles
   - Check API key permissions

### **Debug Steps**

1. **Check Supabase Dashboard**
   - Go to "Logs" to see errors
   - Check "Table Editor" for data
   - Verify "Authentication" settings

2. **Check Environment Variables**
   ```bash
   # Test locally
   echo $NEXT_PUBLIC_SUPABASE_URL
   
   # Test in Vercel
   vercel env ls
   ```

3. **Test Database Connection**
   ```bash
   # In Supabase SQL Editor
   SELECT * FROM users LIMIT 1;
   ```

## 📈 **Performance Optimization**

### **Database Indexes**
- Added indexes on frequently queried columns
- Optimized for common operations
- Automatic query optimization

### **Caching**
- Supabase handles query caching
- Real-time subscriptions optimized
- CDN for static assets

### **Monitoring**
- Built-in performance monitoring
- Query performance insights
- Error tracking and alerts

## 🎯 **Next Steps**

1. **✅ Complete Setup**: Follow the steps above
2. **✅ Test Everything**: Verify all features work
3. **✅ Deploy**: Push to production
4. **✅ Monitor**: Watch performance and usage
5. **✅ Scale**: Add more features as needed

## 🆘 **Support**

If you encounter issues:

1. **Check Supabase Status**: https://status.supabase.com
2. **Review Documentation**: https://supabase.com/docs
3. **Community Support**: https://github.com/supabase/supabase/discussions

---

**🎉 Once setup is complete, your Djurdjura Water Distribution System will have a real, persistent database that scales with your business!**
