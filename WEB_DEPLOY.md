# 🌐 Web Deployment Guide - Speed Rhyme

Deploy the Speed Rhyme app to the web using Vercel in under 5 minutes.

---

## 🚀 Quick Deploy to Vercel

### Option 1: One-Click Deploy (Easiest)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/YOUR_USERNAME/Rhyming-Viral-Game-TikTok)

1. Click the button above
2. Connect your GitHub account
3. Add environment variables:
   - `EXPO_PUBLIC_SUPABASE_URL`
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY`
4. Click "Deploy"
5. Wait 2-3 minutes
6. Your app is live! 🎉

---

### Option 2: Vercel CLI (Advanced)

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? (Your account)
# - Link to existing project? No
# - Project name? speed-rhyme-viral
# - Directory? ./
# - Override settings? No

# Production deployment
vercel --prod
```

---

## 🔧 Web-Specific Features

### What Works on Web ✅
- ✅ All UI and animations (Reanimated works on web!)
- ✅ Browse challenges and leaderboards
- ✅ Create challenges
- ✅ Profile stats and badges
- ✅ **Web Speech API** for voice recording (Chrome/Edge only)
- ✅ Score reveals with confetti
- ✅ Sharing (via Web Share API)

### Web Adaptations 🔄
- **Haptics**: Uses Vibration API (mobile browsers only)
- **Sounds**: Web Audio API (beeps instead of audio files)
- **Recording**: Web Speech API instead of expo-av
- **Platform Detection**: Automatic fallbacks for native features

### Browser Requirements 🌐
- **Best Experience**: Chrome or Edge (for speech recognition)
- **Also Works**: Firefox, Safari (limited speech recognition)
- **Mobile Browsers**: Full support including vibration

---

## 📱 Testing Locally

```bash
# Start web dev server
npm run web

# Build for production
npm run build:web

# Preview production build
npx serve dist
```

Open: http://localhost:8081 or http://localhost:3000

---

## 🔐 Environment Variables

Add these to your Vercel project:

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables

2. Add:
   ```
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ```

3. Apply to: Production, Preview, Development

4. Redeploy to apply changes

---

## 🎨 Web-Specific Customizations

### PWA Support (Progressive Web App)

The web version can be installed as a PWA on mobile devices:

1. Visit the site on mobile
2. Tap "Add to Home Screen"
3. App installs like a native app
4. Works offline (with limitations)

### Custom Domain

```bash
# Add custom domain
vercel domains add yourdomain.com

# Configure DNS
# Add CNAME record: www -> cname.vercel-dns.com
# Add A record: @ -> 76.76.21.21
```

---

## 🔍 Web vs Mobile Differences

| Feature | Mobile (Expo) | Web (Browser) |
|---------|--------------|---------------|
| **Recording** | expo-av | Web Speech API |
| **Haptics** | expo-haptics | Vibration API |
| **Sounds** | expo-av | Web Audio API |
| **Animations** | Reanimated | Reanimated (CSS) |
| **Performance** | Native | JavaScript |
| **Offline** | Full support | Limited |
| **Install** | App Store | PWA |

---

## 🚨 Known Limitations on Web

1. **Speech Recognition**:
   - Only works in Chrome/Edge
   - Requires HTTPS (doesn't work on http://)
   - Requires microphone permission
   - Less accurate than native

2. **Haptics**:
   - Only vibration on mobile browsers
   - No haptics on desktop
   - iOS Safari has limited support

3. **Sounds**:
   - Simple beeps instead of audio files
   - No background audio

4. **Performance**:
   - Slightly slower animations
   - Higher battery usage on mobile browsers

---

## 📊 Web Analytics (Optional)

Add Vercel Analytics:

```bash
npm install @vercel/analytics

# In app/_layout.tsx:
import { Analytics } from '@vercel/analytics/react';

export default function RootLayout() {
  return (
    <>
      {/* Your existing layout */}
      <Analytics />
    </>
  );
}
```

Then enable in Vercel Dashboard → Analytics

---

## 🔄 Continuous Deployment

Vercel auto-deploys on git push:

1. **Production**: Deploys from `main` branch
2. **Preview**: Deploys from PRs and other branches
3. **Instant Rollbacks**: One-click in dashboard

```bash
# Push to deploy
git add .
git commit -m "Update web app"
git push origin main

# Vercel auto-builds and deploys
# Check: your-project.vercel.app
```

---

## 🎯 Web Performance Optimization

### 1. Enable Compression

Already configured in `vercel.json`:
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        { "key": "X-Content-Type-Options", "value": "nosniff" }
      ]
    }
  ]
}
```

### 2. Optimize Images

```bash
# Use optimized image formats
npm install sharp

# Configure in metro.config.js
# (Already configured)
```

### 3. Code Splitting

Expo Router automatically code-splits by route:
- Each screen is a separate chunk
- Faster initial load
- Better caching

---

## 🐛 Web Debugging

### Check Browser Console

```javascript
// Enable detailed logs
localStorage.debug = '*';

// Check speech recognition support
if ('webkitSpeechRecognition' in window) {
  console.log('Speech recognition supported');
}

// Check vibration support
if ('vibrate' in navigator) {
  console.log('Vibration supported');
}
```

### Common Web Issues

**Speech recognition not working:**
- Ensure HTTPS (not HTTP)
- Use Chrome or Edge
- Grant microphone permission
- Check browser console for errors

**Animations stuttering:**
- Disable browser extensions
- Close other tabs
- Try in incognito mode
- Check GPU acceleration

**Supabase errors:**
- Verify environment variables
- Check CORS settings in Supabase
- Confirm RLS policies allow web access

---

## 📈 Web-Specific Metrics

Monitor in Vercel Dashboard:

- **Lighthouse Score**: Aim for 90+
- **Core Web Vitals**:
  - LCP (Largest Contentful Paint): < 2.5s
  - FID (First Input Delay): < 100ms
  - CLS (Cumulative Layout Shift): < 0.1
- **Bundle Size**: Track in Analytics

---

## 🎉 You're Live!

Your Speed Rhyme web app is now accessible at:

```
https://your-project.vercel.app
```

### Share Your Web App

1. **Mobile**: Full experience with PWA
2. **Desktop**: Browse, view leaderboards
3. **Any Device**: Create challenges, view stats

### Next Steps

- [ ] Add custom domain
- [ ] Enable Vercel Analytics
- [ ] Set up preview deployments
- [ ] Configure error monitoring
- [ ] Add SEO metadata
- [ ] Create social share cards

---

**The web version complements the mobile app perfectly!** 🌐📱

Users can:
- Try the game instantly (no app install)
- Share links directly
- Access on any device
- Install as PWA on mobile
