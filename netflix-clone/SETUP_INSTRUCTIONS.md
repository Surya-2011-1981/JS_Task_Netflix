# SETUP_INSTRUCTIONS.md

# Complete Setup Guide for Netflix Clone

## Quick Start (5 minutes)

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

This automatically:
- ✅ Opens http://localhost:3000 in your browser
- ✅ Generates 10,000 mock media items
- ✅ Initializes IndexedDB for offline support
- ✅ Registers service worker
- ✅ Shows loading states while caching media

### 3. Sign In
Use any email/password (guest mode works too):
- Email: `test@example.com`
- Password: `password123`

**Or click "Continue as Guest"** for instant access

That's it! You now have a fully functional Netflix-like app.

---

## Detailed Configuration

### Option A: Using Mock Data (Default ✅)

The app works perfectly with built-in mock data:
- ✅ 10,000 TV shows and movies
- ✅ Realistic titles, ratings, descriptions
- ✅ Real category filtering
- ✅ Full offline support
- ✅ Zero API setup needed

No configuration required. Just run and enjoy!

### Option B: Connect Your REST API

If you have a real API:

#### 1. Update `.env`
```
REACT_APP_API_BASE_URL=https://your-api-domain.com/api
```

#### 2. Required API Endpoints

Your API should have these endpoints:

```
GET /api/media?limit=100&offset=0
Response: {
  data: [
    {
      id: 1,
      title: "Show Name",
      category: "TV Shows",
      genre: "Drama",
      rating: 8.5,
      description: "...",
      releaseYear: 2023,
      country: "USA",
      poster: "image_url",
      banner: "banner_url",
      duration: "1h 30m",
      votes: 50000
    },
    ...
  ],
  total: 10000
}

GET /api/media/search?q=query
Response: [...media items...]

GET /api/media/by-category?category=Movies
Response: [...media items...]

GET /api/media/trending?limit=20
Response: [...media items...]

GET /api/media/:id
Response: {...single media item...}
```

#### 3. Implement API Calls (optional)

Edit `src/services/api.js`:

```javascript
// Find these lines and update endpoints:

// Line 60: Get all media
export async function getAllMedia(options = {}) {
  // Change from mock to real API
  const response = await apiClient.get('/media', { params: options });
  return response.data;
}

// Line 90: Search media
export async function searchMedia(query) {
  // Change from local search to API call
  const response = await apiClient.get('/media/search', { params: { q: query } });
  return response.data;
}
```

### Option C: Firebase Authentication Setup

Optional - Guest mode works without Firebase!

#### 1. Create Firebase Project
- Go to https://firebase.google.com/console
- Click "Create Project"
- Name it "Netflix Clone"
- Click "Create"

#### 2. Enable Authentication
- In Firebase Console, go to "Authentication"
- Click "Get Started"
- Enable "Email/Password" provider
- Click "Save"

#### 3. Get Your Credentials
- Click Project Settings (gear icon)
- Copy Web App Config
- You'll see credentials like:
```javascript
const firebaseConfig = {
  apiKey: "AIzaSy...",
  authDomain: "netflix-clone-xxxx.firebaseapp.com",
  projectId: "netflix-clone-xxxx",
  ...
}
```

#### 4. Add to `.env`
```
REACT_APP_FIREBASE_API_KEY=AIzaSy...
REACT_APP_FIREBASE_AUTH_DOMAIN=netflix-clone-xxxx.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=netflix-clone-xxxx
REACT_APP_FIREBASE_STORAGE_BUCKET=netflix-clone-xxxx.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123...
```

#### 5. Restart App
```bash
npm start
```

Now users can sign up/sign in with real Firebase accounts!

---

## Testing the App

### Test Sign In
1. Click "Sign In" on landing page
2. Try:
   - **Sign Up**: Create new account
   - **Sign In**: Use any email/password
   - **Guest Mode**: Continue without account

### Test Features
- **Home Page**: Browse featured content, trending shows/movies
- **TV Shows**: Filter to TV Shows
- **Movies**: Filter to Movies  
- **Search**: Search for content (debounced 300ms)
- **Watchlist**: Add items by clicking ★ icon
- **Profile**: View watchlist and history
- **Offline**: Disconnect internet, content still available

### Test Offline Mode
1. Open DevTools (F12)
2. Go to Network tab
3. Click "Offline" checkbox
4. Browse the app - everything still works!
5. Uncheck "Offline" to reconnect
6. App auto-updates content

---

## Environment Variables

### Complete `.env` File Template

```bash
# API Configuration
REACT_APP_API_BASE_URL=https://api.example.com/v1

# Firebase Configuration (Optional)
REACT_APP_FIREBASE_API_KEY=AIzaSyDemo...
REACT_APP_FIREBASE_AUTH_DOMAIN=netflix-clone.firebaseapp.com
REACT_APP_FIREBASE_PROJECT_ID=netflix-clone
REACT_APP_FIREBASE_STORAGE_BUCKET=netflix-clone.appspot.com
REACT_APP_FIREBASE_MESSAGING_SENDER_ID=123456789
REACT_APP_FIREBASE_APP_ID=1:123456789:web:abc123...

# Feature Flags
REACT_APP_ENABLE_FIREBASE=true
REACT_APP_CACHE_EXPIRATION_HOURS=24
REACT_APP_DEBUG=false
```

---

## Troubleshooting

### Problem: "Cannot find service worker"
**Solution**: This is normal in development. Service worker works in production builds.

### Problem: IndexedDB not storing data
**Solution**: 
- This is a browser security feature
- IndexedDB only works on HTTPS or localhost
- In production, it will work fine

### Problem: Firebase auth not working
**Solution**:
- Check `.env` credentials are correct
- Verify Email/Password auth is enabled in Firebase
- Check browser console for specific errors

### Problem: Mock data not appearing
**Solution**:
- Clear browser cache (Ctrl+Shift+Delete)
- Delete Service Worker (DevTools → Application → Service Workers)
- Refresh page

### Problem: Search is slow
**Solution**:
- First load loads 10,000 items to memory
- Search happens locally, should be instant after first load
- For real API, debouncing helps with network requests

---

## Production Build

### Create Optimized Build
```bash
npm run build
```

Creates `/build` folder with:
- ✅ Minified JavaScript
- ✅ Optimized images
- ✅ Code splitting
- ✅ Service worker
- ✅ Production-ready

### Deploy to Web
The `/build` folder can be deployed to:
- **Vercel**: `vercel deploy`
- **Netlify**: Drag & drop `/build`
- **GitHub Pages**: Push to gh-pages branch
- **AWS S3**: Upload `/build` folder
- **Any static host**: Upload `/build` contents

---

## Performance Tips

### For Large Datasets
- Implement pagination (already in Category page)
- Use virtualization for very large lists
- Optimize images (use next-gen formats)
- Consider API pagination instead of loading all at once

### Browser DevTools
- Desktop: F12 or Ctrl+Shift+I
- Check Network tab for large requests
- Check Performance tab for bottlenecks
- Check Application tab for cache/storage

### Monitoring
- Lighthouse: DevTools → Lighthouse → Generate report
- Web Vitals: Check FCP, LCP, CLS metrics
- Network: Check bundle sizes

---

## Need Help?

### Check These Files for Documentation

**Understanding the structure:**
- [README.md](./README.md) - Full feature overview
- [SETUP_INSTRUCTIONS.md](./SETUP_INSTRUCTIONS.md) - This file

**For developers:**
- [src/services/api.js](./src/services/api.js) - API integration points
- [src/components/Navbar.jsx](./src/components/Navbar.jsx) - Component example
- [src/pages/HomePage.jsx](./src/pages/HomePage.jsx) - Page example
- [src/hooks/index.js](./src/hooks/index.js) - Custom hooks

**Code comments:**
- Every major function has comments
- Look for "TODO" comments for extension points
- Search for "MARK:" for important sections

---

## What's Included

✅ Full React application with routing
✅ 10,000+ mock media items
✅ Offline support with Service Worker
✅ IndexedDB caching
✅ Firebase auth integration (optional)
✅ Beautiful dark Netflix-like UI
✅ Responsive design (mobile, tablet, desktop)
✅ Smooth animations
✅ Debounced search
✅ Lazy loading
✅ Error handling
✅ Loading states
✅ Empty states
✅ Accessibility features
✅ performance optimizations
✅ Complete documentation

---

## Next Steps

1. ✅ Run `npm install`
2. ✅ Run `npm start`
3. ✅ Browse the app
4. ✅ (Optional) Setup Firebase
5. ✅ (Optional) Setup API
6. ✅ Customize theme colors
7. ✅ Deploy to production!

---

Made with ❤️ for your streaming platform needs
