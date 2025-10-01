# OAuth Setup Guide

## Overview
This guide explains how to set up Google and Microsoft OAuth authentication for the DermaTech AI application.

## Prerequisites
- Google Cloud Console account
- Microsoft Azure account
- Supabase project

## Google OAuth Setup

### 1. Create Google OAuth Credentials
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable the Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth 2.0 Client IDs"
5. Set application type to "Web application"
6. Add authorized redirect URIs:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)

### 2. Configure Environment Variables
Add these to your `.env` file:
```env
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Microsoft OAuth Setup

### 1. Create Microsoft App Registration
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to "Azure Active Directory" → "App registrations"
3. Click "New registration"
4. Set redirect URI to:
   - `http://localhost:5173/auth/callback` (for development)
   - `https://yourdomain.com/auth/callback` (for production)
5. Note down the Application (client) ID

### 2. Configure API Permissions
1. Go to "API permissions"
2. Add Microsoft Graph permissions:
   - `openid`
   - `email`
   - `profile`
3. Grant admin consent if required

### 3. Create Client Secret
1. Go to "Certificates & secrets"
2. Create a new client secret
3. Note down the secret value

### 4. Configure Environment Variables
Add these to your `.env` file:
```env
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
VITE_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
VITE_MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback
```

## Supabase Configuration

### 1. Enable OAuth Providers
1. Go to your Supabase project dashboard
2. Navigate to "Authentication" → "Providers"
3. Enable Google provider:
   - Toggle "Enable sign in with Google"
   - Add your Google Client ID and Client Secret
4. Enable Azure provider:
   - Toggle "Enable sign in with Azure"
   - Add your Microsoft Client ID and Client Secret
   - Set the tenant ID (use "common" for multi-tenant)

### 2. Configure Redirect URLs
In Supabase Auth settings, add these redirect URLs:
- `http://localhost:5173/auth/callback`
- `https://yourdomain.com/auth/callback`

## Environment Variables Template

Create a `.env` file in your project root with:

```env
# Supabase Configuration
SUPABASE_URL=your_supabase_url_here
SUPABASE_PUBLISHABLE_KEY=your_supabase_anon_key_here

# Google OAuth Configuration
VITE_GOOGLE_CLIENT_ID=your_google_client_id_here
VITE_GOOGLE_CLIENT_SECRET=your_google_client_secret_here
VITE_GOOGLE_REDIRECT_URI=http://localhost:5173/auth/callback

# Microsoft OAuth Configuration
VITE_MICROSOFT_CLIENT_ID=your_microsoft_client_id_here
VITE_MICROSOFT_CLIENT_SECRET=your_microsoft_client_secret_here
VITE_MICROSOFT_REDIRECT_URI=http://localhost:5173/auth/callback

# API Configuration
API_BASE_URL=http://localhost:5000
```

## Testing OAuth Integration

### 1. Start the Development Server
```bash
npm run dev
```

### 2. Test OAuth Flows
1. Navigate to `/auth`
2. Click "Google" or "Microsoft" buttons
3. Complete the OAuth flow
4. Verify successful authentication and redirect

### 3. Check Authentication State
- User should be redirected to intended destination
- Authentication state should be maintained
- User profile should be accessible

## Troubleshooting

### Common Issues

1. **"Invalid redirect URI"**
   - Ensure redirect URIs match exactly in OAuth provider settings
   - Check for trailing slashes or protocol mismatches

2. **"Client ID not found"**
   - Verify environment variables are set correctly
   - Restart development server after changing .env

3. **"Access denied"**
   - Check API permissions in OAuth provider settings
   - Ensure proper scopes are requested

4. **Supabase authentication errors**
   - Verify Supabase OAuth providers are enabled
   - Check redirect URLs in Supabase settings

### Debug Steps
1. Check browser console for errors
2. Verify network requests in DevTools
3. Check Supabase logs in dashboard
4. Validate environment variables

## Security Considerations

1. **Never commit secrets to version control**
2. **Use environment variables for all sensitive data**
3. **Implement proper CORS settings**
4. **Use HTTPS in production**
5. **Regularly rotate client secrets**

## Production Deployment

1. Update redirect URIs to production domains
2. Set up proper CORS policies
3. Use HTTPS for all OAuth flows
4. Configure proper error handling and logging
5. Test OAuth flows thoroughly before going live
