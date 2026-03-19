# Family Budget — Setup Guide

## 1. Create Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click **Add project** → name it "family-budget" → continue
3. Disable Google Analytics (optional) → **Create project**

## 2. Enable Authentication

1. In Firebase Console → **Authentication** → **Get started**
2. Under **Sign-in method** → enable **Email/Password**
3. Go to **Users** tab → **Add user**:
   - Add Dillon's email + password
   - Add Madeline's email + password
4. Set display names (important — the app uses this for auto-category selection):
   - After creating each user, click on them and set **Display name** to `Dillon` or `Madeline`

## 3. Enable Firestore

1. Firebase Console → **Firestore Database** → **Create database**
2. Choose **Start in production mode** → select a region → **Done**
3. Go to **Rules** tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}
```

4. Click **Publish**

## 4. Get Firebase Config Keys

1. Firebase Console → **Project Settings** (gear icon) → **Your apps**
2. Click **Add app** → choose Web (</>)
3. Register app (name: "Family Budget Web") → **Register app**
4. Copy the `firebaseConfig` object — you'll need these values

## 5. Set Up Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

Edit `.env.local`:
```
VITE_FIREBASE_API_KEY=AIzaSy...
VITE_FIREBASE_AUTH_DOMAIN=family-budget-xxxxx.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=family-budget-xxxxx
VITE_FIREBASE_STORAGE_BUCKET=family-budget-xxxxx.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abc...
```

## 6. Install & Run Locally

```bash
cd outputs/family-budget
npm install
npm run dev
```

Open http://localhost:5173

## 7. Generate PWA Icons

Convert the `public/icon.svg` to PNG:
- Visit https://realfavicongenerator.net or https://favicon.io
- Upload `public/icon.svg`
- Download the generated PNGs
- Save as `public/icon-192.png` and `public/icon-512.png`
- Also save as `public/apple-touch-icon.png` (180×180)

## 8. Deploy to Vercel

1. Push your code to GitHub (make sure `.env.local` is in `.gitignore` — it is by default)
2. Go to [vercel.com](https://vercel.com) → **New Project** → import your repo
3. In **Environment Variables**, add all 6 `VITE_FIREBASE_*` variables
4. Click **Deploy** → done!

## 9. Install as PWA on iPhone

1. Open the Vercel URL in Safari on iPhone
2. Tap the **Share** button → **Add to Home Screen**
3. Tap **Add** — the app will appear on your home screen like a native app

## Notes

- Both Dillon and Madeline log in with their own accounts but share all data
- The app auto-selects the matching budget category (Dillon/Madeline) based on who's logged in
- Budget limits set in Settings sync instantly for both users
- The app works offline — last loaded data shows when there's no connection
