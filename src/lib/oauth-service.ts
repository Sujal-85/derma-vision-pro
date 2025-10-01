import { supabase, isSupabaseConfigured } from '@/integrations/supabase/client';
import { OAUTH_CONFIG, GOOGLE_TOKEN_URL, MICROSOFT_TOKEN_URL } from './oauth-config';

// OAuth callback handler for Google
export const handleGoogleCallback = async (code: string) => {
  try {
    // Exchange code for token
    const tokenResponse = await fetch(GOOGLE_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.google.clientId,
        client_secret: import.meta.env.VITE_GOOGLE_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.google.redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();
    
    // Get user info from Google
    const userResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Google');
    }

    const userInfo = await userResponse.json();

    // Sign in with Supabase using Google OAuth
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'google',
      token: tokenData.id_token,
      nonce: 'random-nonce', // In production, use a proper nonce
    });

    if (error) {
      throw error;
    }

    return { data, userInfo };
  } catch (error) {
    console.error('Google OAuth error:', error);
    throw error;
  }
};

// OAuth callback handler for Microsoft
export const handleMicrosoftCallback = async (code: string) => {
  try {
    // Exchange code for token
    const tokenResponse = await fetch(MICROSOFT_TOKEN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: OAUTH_CONFIG.microsoft.clientId,
        client_secret: import.meta.env.VITE_MICROSOFT_CLIENT_SECRET || '',
        code,
        grant_type: 'authorization_code',
        redirect_uri: OAUTH_CONFIG.microsoft.redirectUri,
        scope: OAUTH_CONFIG.microsoft.scope,
      }),
    });

    if (!tokenResponse.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const tokenData = await tokenResponse.json();

    // Get user info from Microsoft Graph
    const userResponse = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: {
        Authorization: `Bearer ${tokenData.access_token}`,
      },
    });

    if (!userResponse.ok) {
      throw new Error('Failed to get user info from Microsoft');
    }

    const userInfo = await userResponse.json();

    // Sign in with Supabase using Microsoft OAuth
    const { data, error } = await supabase.auth.signInWithIdToken({
      provider: 'azure',
      token: tokenData.id_token,
      nonce: 'random-nonce', // In production, use a proper nonce
    });

    if (error) {
      throw error;
    }

    return { data, userInfo };
  } catch (error) {
    console.error('Microsoft OAuth error:', error);
    throw error;
  }
};

// Direct OAuth sign-in methods using Supabase
export const signInWithGoogle = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    // Show setup instructions instead of throwing error
    alert(`🚀 OAuth Setup Required

To use Google OAuth authentication:

1. Go to https://supabase.com/
2. Create a new project
3. Get your project URL and anon key
4. Create a .env file with:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
5. Enable Google provider in Supabase dashboard
6. Restart your development server

For detailed instructions, see: OAUTH_SETUP_GUIDE.md`);
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};

export const signInWithMicrosoft = async () => {
  if (!isSupabaseConfigured() || !supabase) {
    // Show setup instructions instead of throwing error
    alert(`🚀 OAuth Setup Required

To use Microsoft OAuth authentication:

1. Go to https://supabase.com/
2. Create a new project
3. Get your project URL and anon key
4. Create a .env file with:
   VITE_SUPABASE_URL=https://your-project-ref.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key-here
5. Enable Azure provider in Supabase dashboard
6. Restart your development server

For detailed instructions, see: OAUTH_SETUP_GUIDE.md`);
    return;
  }

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: 'azure',
    options: {
      redirectTo: `${window.location.origin}/auth/callback`,
    },
  });

  if (error) {
    throw error;
  }

  return data;
};
