// OAuth Configuration for Google and Microsoft
export const OAUTH_CONFIG = {
  google: {
    clientId: import.meta.env.VITE_GOOGLE_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_GOOGLE_REDIRECT_URI || `${window.location.origin}/auth/callback/google`,
    scope: 'openid email profile',
  },
  microsoft: {
    clientId: import.meta.env.VITE_MICROSOFT_CLIENT_ID || '',
    redirectUri: import.meta.env.VITE_MICROSOFT_REDIRECT_URI || `${window.location.origin}/auth/callback/microsoft`,
    authority: 'https://login.microsoftonline.com/common',
    scope: 'openid email profile',
  }
};

// Google OAuth URLs
export const GOOGLE_OAUTH_URL = 'https://accounts.google.com/oauth/authorize';
export const GOOGLE_TOKEN_URL = 'https://oauth2.googleapis.com/token';

// Microsoft OAuth URLs
export const MICROSOFT_OAUTH_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize';
export const MICROSOFT_TOKEN_URL = 'https://login.microsoftonline.com/common/oauth2/v2.0/token';

// Generate OAuth URLs
export const generateGoogleAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.google.clientId,
    redirect_uri: OAUTH_CONFIG.google.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.google.scope,
    access_type: 'offline',
    prompt: 'consent',
  });
  
  return `${GOOGLE_OAUTH_URL}?${params.toString()}`;
};

export const generateMicrosoftAuthUrl = () => {
  const params = new URLSearchParams({
    client_id: OAUTH_CONFIG.microsoft.clientId,
    redirect_uri: OAUTH_CONFIG.microsoft.redirectUri,
    response_type: 'code',
    scope: OAUTH_CONFIG.microsoft.scope,
    response_mode: 'query',
  });
  
  return `${MICROSOFT_OAUTH_URL}?${params.toString()}`;
};
