# Setup Guide

No API keys needed except Supabase (free). Geocoding uses OpenStreetMap — no account required.

## 1. Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a free account + new project
2. In your project dashboard, go to **SQL Editor** and run the full contents of `supabase/schema.sql`
3. Go to **Project Settings → API** and copy:
   - **Project URL** → `EXPO_PUBLIC_SUPABASE_URL`
   - **anon public** key → `EXPO_PUBLIC_SUPABASE_ANON_KEY`

## 2. Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your Supabase URL and anon key
```

## 3. Run the app

```bash
npx expo start
```

- Press `i` → iOS Simulator
- Press `a` → Android Emulator
- Scan the QR code with the **Expo Go** app on your phone

## 4. Deploy to the web (optional, free via Vercel)

```bash
npx expo export --platform web
npx vercel deploy dist/
```

Anyone with the URL can then open the app in their browser.
