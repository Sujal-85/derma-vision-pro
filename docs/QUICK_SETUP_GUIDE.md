# Quick Setup Guide for OAuth Authentication

## Current Issue
The Supabase project URL `pitdhkkrzxbkwqfzrhyu.supabase.co` is not accessible, which is causing the OAuth authentication to fail.

## Solutions

### Option 1: Use Environment Variables (Recommended)
Create a `.env` file in your project root with your own Supabase project:

```env
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### Option 2: Update Fallback Configuration
Edit `src/lib/supabase-config.ts` and replace the fallback values:

```typescript
fallback: {
  url: "https://your-project-ref.supabase.co", // Your Supabase project URL
  anonKey: "your-anon-key-here", // Your Supabase anon key
}
```

## How to Get Supabase Credentials

1. Go to [Supabase](https://supabase.com/)
2. Create a new project or use an existing one
3. Go to Settings → API
4. Copy your Project URL and anon/public key

## OAuth Provider Setup

### Google OAuth
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create OAuth 2.0 credentials
3. Add redirect URI: `http://localhost:5173/auth/callback`

### Microsoft OAuth
1. Go to [Azure Portal](https://portal.azure.com/)
2. Create app registration
3. Add redirect URI: `http://localhost:5173/auth/callback`

## Environment Variables Template

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Google OAuth (Optional)
VITE_GOOGLE_CLIENT_ID=your-google-client-id
VITE_GOOGLE_CLIENT_SECRET=your-google-client-secret

# Microsoft OAuth (Optional)
VITE_MICROSOFT_CLIENT_ID=your-microsoft-client-id
VITE_MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret
```

## Testing

1. Set up your environment variables
2. Restart the development server: `npm run dev`
3. Navigate to `/auth`
4. Test OAuth buttons (they should work if Supabase is configured)

## Current Status

✅ OAuth UI implemented with Google and Microsoft buttons
✅ OAuth service functions created
✅ Auth callback handling implemented
✅ Error handling for missing configuration
❌ Supabase configuration needs to be updated

The OAuth implementation is complete and ready to use once you configure your Supabase project!

