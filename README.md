# 🎤 Speed Rhyme - Viral Tongue Twister Challenge App

A **TikTok-native mobile game** where users record themselves saying rhyming phrases at increasing speeds, get scored, share results, and compete on leaderboards. Built for maximum virality and addictiveness.

---

## 🚀 Features

### Core Gameplay
- **🎯 Record & Score**: Speak tongue twisters at high speeds and get instant accuracy scoring
- **⚡ BPM-Synced Beats**: Visual beat rings pulse in sync with metronome
- **🎨 Dramatic Score Reveals**: Count-up animations, confetti, and haptic feedback
- **🏆 Leaderboards**: Global rankings with percentile tracking
- **📊 Personal Stats**: Track your best streak, fastest BPM, and accuracy

### Viral Mechanics
- **🔥 Daily Challenges**: Fresh challenge every 24 hours
- **💪 Personal Bests**: Visual highlights when you beat your own score
- **🎉 Achievement Badges**: Unlock badges for milestones
- **📱 One-Tap Sharing**: Share results with auto-generated captions
- **👥 Challenge Creation**: Create and publish your own challenges

### UI/UX Highlights
- **Dark-mode first** with neon accent colors
- **Smooth animations** everywhere (Reanimated)
- **Haptic feedback** on every interaction
- **Sound effects** synced with actions
- **No dead screens** - constant motion and visual interest

---

## 📱 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Framework** | React Native + Expo SDK 51 |
| **Language** | TypeScript |
| **Navigation** | expo-router (file-based) |
| **Styling** | nativewind (Tailwind CSS) |
| **Animations** | Reanimated 3 + Gesture Handler |
| **Backend** | Supabase (Postgres + Auth + Storage) |
| **Audio/Recording** | expo-av (mobile), Web Speech API (web) |
| **Haptics** | expo-haptics (mobile), Vibration API (web) |
| **Sharing** | expo-sharing |
| **Web Deploy** | Vercel (static export) |

---

## 🏗️ Project Structure

```
speed-rhyme-viral/
├── app/                          # Expo Router screens
│   ├── (tabs)/                   # Tab navigation
│   │   ├── index.tsx            # Home (daily + trending challenges)
│   │   ├── create.tsx           # Create challenge screen
│   │   └── profile.tsx          # User profile & stats
│   ├── challenge/[id].tsx       # Challenge play screen (core game)
│   ├── results/[attemptId].tsx  # Score reveal screen
│   ├── leaderboard/[challengeId].tsx  # Leaderboard
│   └── _layout.tsx              # Root layout
│
├── components/                   # Reusable UI components
│   ├── Animations.tsx           # PulseRing, RecordButton
│   ├── Button.tsx               # Animated buttons with haptics
│   ├── ChallengeCard.tsx        # Challenge list item
│   ├── LeaderboardComponents.tsx # Badge, LeaderboardRow
│   └── ScoreDisplay.tsx         # Animated score counter
│
├── lib/                         # Core logic & utilities
│   ├── supabase.ts             # Supabase client
│   ├── database.types.ts       # TypeScript types from DB schema
│   ├── scoring.ts              # Levenshtein distance, accuracy calc
│   ├── haptics.ts              # Haptic feedback patterns
│   ├── sounds.ts               # Sound manager
│   └── share.ts                # Share caption generator
│
├── supabase/
│   └── schema.sql              # Database schema + RLS policies
│
├── package.json
├── tsconfig.json
├── tailwind.config.js
└── app.json
```

---

## 🛠️ Setup Instructions

### Prerequisites
- Node.js 18+ and npm/yarn
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (macOS) or Android Emulator
- Supabase account (free tier works)

### 1. Clone and Install

```bash
git clone <your-repo-url>
cd Rhyming-Viral-Game-TikTok
npm install
```

### 2. Supabase Setup

1. **Create a Supabase project** at [supabase.com](https://supabase.com)

2. **Run the schema**:
   - Open Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/schema.sql`
   - Execute the script

3. **Get your credentials**:
   - Go to Settings → API
   - Copy `Project URL` and `anon public` key

4. **Configure environment**:
   ```bash
   cp .env.example .env
   ```

   Edit `.env`:
   ```bash
   EXPO_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   EXPO_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
   ```

### 3. Run the App

```bash
# Start Expo dev server
npm start

# Run on iOS
npm run ios

# Run on Android
npm run android
```

---

## 🎮 How to Use

### Playing a Challenge

1. **Home Screen** → Tap any challenge card
2. **Challenge Screen** → Tap the pulsing record button
3. **3-2-1 Countdown** → Get ready
4. **Record** → Speak the phrase in sync with beat rings
5. **Tap to Stop** → Recording auto-processes
6. **Results** → See your score with dramatic reveal
7. **Share or Retry** → One tap to share or try again

### Creating a Challenge

1. **Create Tab** → Enter title and phrase
2. **Set Difficulty** → 1 (Easy) to 5 (Insane)
3. **Choose BPM** → 80 to 160+ BPM
4. **Pick Mode**:
   - **Fixed**: Same speed throughout
   - **Ramp**: Speed increases gradually
   - **Ladder**: 3 attempts, best score wins
5. **Publish** → Make it public or unlisted

---

## 🧠 Scoring Algorithm

```typescript
// Accuracy calculation using Levenshtein distance
accuracy = 1 - (levenshtein_distance / max(target_tokens, transcript_tokens))

// Speed bonus (up to 20 points for high BPM)
speedBonus = min(20, (bpm / baseBpm - 1) * 10)

// Final score (capped at 100)
score = round(accuracy * 80 + speedBonus)
```

**Score Tiers**:
- **90-100**: Legendary (neon green + confetti)
- **70-89**: Amazing (yellow)
- **50-69**: Good (orange)
- **0-49**: Keep going (pink)

---

## 🎨 Design Principles

### Visual Style
- **Bold typography** (font-black, 2xl-5xl sizes)
- **High-contrast neon colors** on dark backgrounds
- **Gradients everywhere** (LinearGradient)
- **Large touch targets** (min 48x48px)
- **Rounded corners** (rounded-2xl, rounded-3xl)

### Animation Rules
- **Every tap = haptic + sound**
- **Animate on**:
  - Screen transitions (FadeInDown)
  - Score reveals (count-up + scale)
  - Button presses (scale 0.95)
  - Beat hits (pulse rings)
  - Personal bests (confetti)

### Dopamine Triggers
- ✅ Instant feedback on all actions
- ✅ Visual progress indicators
- ✅ Confetti on high scores
- ✅ "Almost beat it!" messages
- ✅ Rank percentile display
- ✅ Badge unlocks
- ✅ Daily streak tracking

---

## 🗄️ Database Schema

### Tables

**profiles**
- User stats (best_streak, fastest_bpm, accuracy_average)
- Badge collection
- Auto-updated via triggers

**challenges**
- Title, phrase, difficulty, BPM, mode
- Play counts and average scores
- Public/unlisted visibility

**attempts**
- Score, accuracy, BPM completed
- Transcript and audio URL
- Auto-marked personal bests

**reports**
- User-submitted reports for moderation

### Key Features
- **RLS policies** for security
- **Automatic stat updates** via triggers
- **Personal best tracking** via triggers
- **Cascading deletes** for cleanup

---

## 📦 Build for Production

### 🌐 Web (Vercel) - Fastest to Ship

**Deploy to web in 2 minutes:**

```bash
# Build for web
npm run build:web

# Deploy to Vercel (one-time setup)
npm install -g vercel
vercel

# Future deployments
git push origin main  # Auto-deploys via Vercel
```

**Live instantly at**: `https://your-project.vercel.app`

See **[WEB_DEPLOY.md](./WEB_DEPLOY.md)** for complete web deployment guide.

**Web Features:**
- ✅ Full UI/UX with animations
- ✅ Web Speech API for recording (Chrome/Edge)
- ✅ All challenges and leaderboards
- ✅ PWA installable on mobile
- ✅ No app store approval needed

---

### 📱 Mobile Apps (iOS/Android)

### iOS

```bash
eas build --platform ios --profile production
```

**Requirements**:
- Apple Developer account
- Configure `app.json` with your bundle ID
- Set up signing credentials

### Android

```bash
eas build --platform android --profile production
```

**Requirements**:
- Google Play Developer account
- Configure `app.json` with your package name
- Generate upload keystore

---

## 🚀 Deployment Checklist

- [ ] Set up Supabase production project
- [ ] Configure environment variables
- [ ] Test on real iOS device
- [ ] Test on real Android device
- [ ] Verify microphone permissions
- [ ] Test speech recognition accuracy
- [ ] Optimize bundle size
- [ ] Add app icon and splash screen
- [ ] Configure app store metadata
- [ ] Submit to App Store & Google Play

---

## 🎯 MVP vs Future Enhancements

### ✅ MVP (Current)
- Audio-only recording
- On-device speech recognition (mock for demo)
- Manual challenge creation
- Basic leaderboards
- Share via text

### 🔮 Future (v1.5+)
- **Video recording** with selfie camera
- **Whisper API** for accurate transcription
- **Social features** (follow, comments, likes)
- **Duet mode** (challenge friends directly)
- **AR effects** during recording
- **TikTok integration** for cross-posting
- **Premium challenges** with prizes
- **Live leaderboard battles**

---

## 🐛 Troubleshooting

### Microphone not working
- Check `app.json` permissions
- Grant mic access in device settings
- Restart Expo dev server

### Animations stuttering
- Enable Hermes (default in Expo 51)
- Test on physical device (not simulator)
- Reduce `play_count` in queries

### Supabase errors
- Verify RLS policies are enabled
- Check environment variables
- Review SQL schema execution logs

### Build errors
- Clear cache: `npx expo start -c`
- Reinstall: `rm -rf node_modules && npm install`
- Update Expo: `npx expo install --fix`

---

## 📄 License

MIT License - feel free to fork and customize!

---

## 🙌 Credits

Built with ❤️ as a shippable MVP for viral mobile challenges.

**Core Technologies**:
- [Expo](https://expo.dev)
- [React Native Reanimated](https://docs.swmansion.com/react-native-reanimated/)
- [Supabase](https://supabase.com)
- [NativeWind](https://nativewind.dev)

---

## 🎉 Ready to Go Viral!

This app is designed to be **fun in under 5 seconds**, **share-worthy**, and makes users want **"one more try"**.

Run it, feel the dopamine hits, and watch it spread! 🔥
