// Supabase Setup Helper
// This file provides instructions for setting up a new Supabase project

export const SUPABASE_SETUP_INSTRUCTIONS = `
🚀 SUPABASE SETUP REQUIRED

To use OAuth authentication, you need to set up a Supabase project:

1. Go to https://supabase.com/
2. Create a new project
3. Get your project URL and anon key from Settings → API
4. Create a .env file in your project root with:

VITE_SUPABASE_URL=https://your-project-ref.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

5. In your Supabase dashboard, go to Authentication → Providers
6. Enable Google and Azure providers
7. Add your OAuth client IDs and secrets

For detailed instructions, see: OAUTH_SETUP_GUIDE.md
`;

// Temporary working configuration for development
export const createTemporaryConfig = () => {
  // This creates a configuration that will work for basic authentication
  // OAuth will show a setup message until proper configuration is done
  return {
    url: "https://demo.supabase.co", // This won't work but prevents errors
    anonKey: "demo-key", // This won't work but prevents errors
    isTemporary: true
  };
};

