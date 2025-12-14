# 🚀 Quick Start Guide - Speed Rhyme

Get the app running in **under 10 minutes**.

---

## Step 1: Install Dependencies (2 min)

```bash
cd Rhyming-Viral-Game-TikTok
npm install
```

If you see peer dependency warnings, ignore them (Expo manages this).

---

## Step 2: Supabase Setup (5 min)

### A. Create Project

1. Go to [supabase.com](https://supabase.com)
2. Click **"New Project"**
3. Fill in:
   - Name: `speed-rhyme-dev`
   - Database Password: (save this!)
   - Region: (closest to you)
4. Wait ~2 minutes for provisioning

### B. Run Database Schema

1. In Supabase Dashboard → **SQL Editor**
2. Click **"New Query"**
3. Copy/paste contents of `supabase/schema.sql`
4. Click **"Run"**
5. Should see: `Success. No rows returned`

### C. Get API Credentials

1. Go to **Settings** → **API**
2. Copy:
   - **Project URL** (looks like: `https://xxx.supabase.co`)
   - **anon public** key (long JWT token)

### D. Configure Environment

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
EXPO_PUBLIC_SUPABASE_URL=https://yourproject.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

---

## Step 3: Run the App (1 min)

```bash
npm start
```

You'll see a QR code and options:

### Option A: iOS Simulator (macOS only)

Press `i` in the terminal

### Option B: Android Emulator

Press `a` in the terminal

### Option C: Physical Device

1. Install **Expo Go** app on your phone
2. Scan the QR code with:
   - **iOS**: Camera app
   - **Android**: Expo Go app

---

## Step 4: Test the Flow

1. **Home Screen** loads with seeded challenges
2. Tap **"Classic Twister"** challenge
3. Tap the **pulsing record button**
4. After countdown, speak: _"She sells seashells by the seashore"_
5. Tap to stop
6. See your **score reveal** with animations!

---

## ✅ You're Done!

The app is now running with:
- ✅ Working database
- ✅ Real-time leaderboards
- ✅ Challenge creation
- ✅ Profile tracking
- ✅ Haptics and animations

---

## 🐛 Common Issues

### "Can't find module 'nativewind'"

```bash
rm -rf node_modules
npm install
```

### "Supabase connection failed"

- Check `.env` file exists and has correct values
- Restart Expo: `npx expo start -c`

### "Microphone permission denied"

- On iOS: Settings → Expo Go → Microphone → ✅
- On Android: Long press Expo Go → Permissions → Microphone → ✅

### Animations are laggy

- Use a **physical device** (simulators are slower)
- Ensure you're on Expo SDK 51+ with Hermes enabled

---

## 🎯 Next Steps

- **Create your first challenge** (Create tab)
- **Beat a daily challenge** to earn badges
- **Invite friends** to compete on leaderboards
- **Customize** the UI colors in `tailwind.config.js`

---

## 📚 Need More Help?

- Check `README.md` for full documentation
- Review `supabase/schema.sql` for database structure
- Explore `lib/scoring.ts` for algorithm details

**Happy building! 🎤🔥**
