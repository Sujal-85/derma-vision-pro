// Supabase Configuration
// This file helps manage Supabase configuration and provides fallbacks

export const SUPABASE_CONFIG = {
  // Primary configuration from environment variables
  url: import.meta.env.VITE_SUPABASE_URL || import.meta.env.SUPABASE_URL,
  // Vite only exposes variables prefixed with VITE_ to the client
  anonKey: import.meta.env.VITE_SUPABASE_ANON_KEY || import.meta.env.SUPABASE_PUBLISHABLE_KEY,
  
  // Fallback configuration - using a working Supabase project for development
  fallback: {
    url: "https://pitdhkkrzxbkwqfzrhyu.supabase.co", // Original project URL
    anonKey: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBpdGRoa2tyenhia3dxZnpyaHl1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUwNzY2ODEsImV4cCI6MjA3MDY1MjY4MX0.WTpGkE9bh5IUpD3tQYx58gWeXZTQstnlMVHcl3HQdfg", // Original anon key
  }
};

// Get the effective configuration
export const getSupabaseConfig = () => {
  const url = SUPABASE_CONFIG.url || SUPABASE_CONFIG.fallback.url;
  const anonKey = SUPABASE_CONFIG.anonKey || SUPABASE_CONFIG.fallback.anonKey;
  
  if (!url || !anonKey) {
    console.warn('⚠️ Supabase configuration not properly set. Please configure your environment variables or update the fallback configuration.');
    return null;
  }
  
  // Check if using fallback configuration
  if (url === SUPABASE_CONFIG.fallback.url && anonKey === SUPABASE_CONFIG.fallback.anonKey) {
    console.info('ℹ️ Using fallback Supabase configuration. For production, please set up your own Supabase project.');
  }
  
  return { url, anonKey };
};

// Check if Supabase is properly configured
export const isSupabaseConfigured = () => {
  const config = getSupabaseConfig();
  return config !== null;
};
