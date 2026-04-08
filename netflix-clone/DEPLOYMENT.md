# Vercel Deployment Guide

## Quick Deployment (2 minutes)

### 1. Push to GitHub
```bash
git add .
git commit -m "Setup Vercel deployment"
git push origin main
```

### 2. Import Project to Vercel
1. Go to [https://vercel.com/new](https://vercel.com/new)
2. Click "Import Git Repository"
3. Select your GitHub repository
4. Vercel auto-detects Create React App settings

### 3. Add Environment Variables
In Vercel Dashboard → Project Settings → Environment Variables:

```
REACT_APP_FIREBASE_API_KEY = your_api_key_here
REACT_APP_FIREBASE_AUTH_DOMAIN = your_project.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID = your_project_id
REACT_APP_FIREBASE_STORAGE_BUCKET = your_project.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID = your_sender_id
REACT_APP_FIREBASE_APP_ID = your_app_id
```

Get these values from your [Firebase Console](https://console.firebase.google.com/)

### 4. Deploy
Click "Deploy" - that's it! 🚀

---

## What's Configured

✅ **Automatic deployments** on push to GitHub  
✅ **SPA routing** - all routes redirect to index.html  
✅ **Service Worker** - always fetches fresh version  
✅ **Build optimization** - CSS/JS splitting, minification  
✅ **Environment variables** - Firebase config secured  

---

## Post-Deployment

### Firebase Console Settings
Add your Vercel domain to Firebase Auth:

1. Go to Firebase Console → Authentication → Settings
2. Under "Authorized domains", add:
   - `your-project.vercel.app`
   - `www.your-project.vercel.app` (if using custom domain)

### Custom Domain (Optional)
1. In Vercel, go to Domains
2. Add your custom domain
3. Update Firebase Auth authorized domains with your custom URL

### Monitoring
- View logs: Vercel Dashboard → Deployments → Logs
- Check Analytics: Vercel Dashboard → Analytics
- Monitor errors: Vercel Dashboard → Error Reports

---

## Troubleshooting

### "Firebase initialization failed"
- **Issue**: Firebase API key in environment variables not loaded
- **Fix**: Confirm all env vars are set in Vercel Dashboard and trigger redeploy

### "Blank page loading"
- **Issue**: Service Worker cache issue
- **Fix**: Hard refresh (Ctrl+Shift+R) or clear browser cache

### "Authentication fails"
- **Issue**: Domain not authorized in Firebase
- **Fix**: Add vercel.app domain to Firebase Auth authorized domains

### Build fails
- **Issue**: Node version mismatch
- **Fix**: 
  1. In Vercel, go to Settings → Node.js Version
  2. Set to version 18 or higher

---

## Performance Tips

### Optimize Build
- Uses code splitting by default (route-based)
- Service Worker caches static assets
- Images lazy-loaded in MediaCard component

### Monitor Performance
- Check Vercel Analytics for Core Web Vitals
- Performance improves with geographic distribution on Vercel Edge Network

### Database & API
- Mock data included - no backend needed!
- Switch to real API: Update `src/services/api.js`
- For Firebase real-time features: Enable in console

---

## Next Steps

1. **Database**: Implement backend API (Node.js, Django, etc.)
2. **Search**: Add full-text search with Elasticsearch or MongoDB Atlas Search
3. **Videos**: Integrate video streaming (HLS, DASH)
4. **CDN**: Serve images from CDN (Vercel Edge Network, CloudFront)
5. **Analytics**: Add Google Analytics / Mixpanel tracking
