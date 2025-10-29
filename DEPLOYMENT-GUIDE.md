# 🚀 Deployment Guide - Djurdjura Water System

## ✅ Pre-Deployment Checklist

- [x] Code cleaned up (test files removed)
- [x] .gitignore updated
- [x] Code committed to GitHub
- [x] Repository pushed to GitHub
- [x] Environment variables documented

## 🌐 Vercel Deployment

### Option 1: Automatic Deployment via Vercel Dashboard (Recommended)

1. **Go to Vercel Dashboard**
   - Visit: https://vercel.com
   - Sign in with GitHub

2. **Import Project**
   - Click "Add New Project"
   - Select repository: `d0udii/mydjurdjura-water-system`
   - Click "Import"

3. **Configure Project**
   - Framework Preset: **Next.js** (auto-detected)
   - Build Command: `npm run build` (default)
   - Output Directory: `.next` (default)
   - Install Command: `npm install` (default)

4. **Add Environment Variables**
   Add these in Vercel Dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   NODE_ENV=production
   ```

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete
   - Your app will be live at: `https://your-project.vercel.app`

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI globally (if not installed)
npm install -g vercel

# Login to Vercel
vercel login

# Deploy to production
npm run deploy
# OR
vercel --prod
```

### Option 3: Automatic Deployment (GitHub Integration)

If you've connected your GitHub repo to Vercel:
- Every push to `main` branch automatically deploys
- Pull requests create preview deployments
- No manual steps needed!

## 🔧 Environment Variables Setup

### Required Variables in Vercel Dashboard:

1. **Go to**: Project Settings → Environment Variables

2. **Add these variables**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```

3. **Apply to**: Production, Preview, Development (all environments)

## 📝 Post-Deployment Steps

1. **Verify Deployment**
   - Visit your Vercel URL
   - Test login functionality
   - Verify all pages load correctly

2. **Test CRUD Operations**
   - Create a test order
   - Create a test client
   - Verify data persists

3. **Check Logs**
   - Go to Vercel Dashboard → Deployments
   - Check logs for any errors
   - Monitor function logs

4. **Setup Custom Domain** (Optional)
   - Go to Settings → Domains
   - Add your custom domain
   - Configure DNS records

## 🔍 Troubleshooting

### Build Fails
- Check environment variables are set
- Verify all dependencies are in package.json
- Check build logs in Vercel dashboard

### Runtime Errors
- Check function logs in Vercel dashboard
- Verify Supabase connection
- Check environment variables are correct

### Database Connection Issues
- Verify Supabase URL and keys are correct
- Check Supabase project is active
- Verify RLS policies allow access

## 📊 Current Deployment Status

- **Repository**: https://github.com/d0udii/mydjurdjura-water-system
- **Branch**: main
- **Last Commit**: fccca92
- **Status**: Ready for deployment

## 🎯 Quick Deploy Command

```bash
# If Vercel CLI is installed
vercel --prod

# Or use npm script
npm run deploy
```

---

**Your application is now ready for production deployment!** 🚀
