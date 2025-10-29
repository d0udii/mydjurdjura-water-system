# 🔐 **VERCEL ENVIRONMENT VARIABLES SETUP**

## ✅ **Required Environment Variables**

Add these to your Vercel project:

### **1. Go to Vercel Dashboard**
- Visit: https://vercel.com/mahmoudjouadi-3817s-projects/djurdjura-water-system-2/settings/environment-variables

### **2. Add These Variables**

#### **Production Environment Variables:**

```
NEXT_PUBLIC_SUPABASE_URL=https://rfnkkqcqftrbmrcimpfl.supabase.co
```

```
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbmtrcWNxZnRyYm1yY2ltcGZsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjE1NjAxMTcsImV4cCI6MjA3NzEzNjExN30.K_2Tp3plBGq72Eb7QEAz6MmhC_hjuCIO08NieI-YOWw
```

```
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmbmtrcWNxZnRyYm1yY2ltcGZsIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTU2MDExNywiZXhwIjoyMDc3MTM2MTE3fQ.ydJ0RlI00a59DAWvGBDf41W4Q0JQPB0FNagCYn_rkJI
```

### **3. Apply to All Environments**
- ✅ Production
- ✅ Preview
- ✅ Development

### **4. Redeploy**
After adding environment variables:
1. Go to Deployments tab
2. Click "..." on latest deployment
3. Click "Redeploy"

---

## 📋 **Quick Setup Steps**

1. **Open Vercel Dashboard**
   ```
   https://vercel.com/mahmoudjouadi-3817s-projects/djurdjura-water-system-2/settings/environment-variables
   ```

2. **Add Each Variable**
   - Click "Add New"
   - Enter variable name
   - Enter variable value
   - Select environments (Production, Preview, Development)
   - Click "Save"

3. **Redeploy Application**
   - Go to Deployments
   - Click "Redeploy" on latest deployment

---

## ✅ **Verification**

After redeploying, verify:
- ✅ Login works
- ✅ Database connection works
- ✅ CRUD operations work
- ✅ Data persists correctly

---

## 🔒 **Security Notes**

- ✅ `.env.local` is in `.gitignore` (not committed)
- ✅ Environment variables are encrypted in Vercel
- ✅ Never commit credentials to Git
- ✅ Rotate keys periodically

---

**Your Supabase credentials are now configured!** 🎉
