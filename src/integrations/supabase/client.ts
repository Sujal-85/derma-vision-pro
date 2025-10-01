import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { getSupabaseConfig, isSupabaseConfigured } from '@/lib/supabase-config';

// Get Supabase configuration
const config = getSupabaseConfig();

if (!config) {
  console.error('❌ Supabase is not properly configured. Please set up your environment variables or update the configuration.');
  console.log('📖 See OAUTH_SETUP_GUIDE.md for setup instructions.');
}

// Create Supabase client with proper configuration
export const supabase = config 
  ? createClient<Database>(config.url, config.anonKey, {
      auth: {
        storage: localStorage,
        persistSession: true,
        autoRefreshToken: true,
      }
    })
  : null;

// Export configuration status
export { isSupabaseConfigured };