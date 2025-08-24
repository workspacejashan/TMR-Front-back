import { createClient } from '@supabase/supabase-js';

const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

// Configuration is considered valid only if both variables are present.
export const isSupabaseConfigured = !!(supabaseUrl && supabaseAnonKey);


// If not configured, log a detailed warning to the console
// to guide the developer in setting up their environment correctly.
if (!isSupabaseConfigured) {
  console.warn(
    `%cSupabase credentials are not set!`, 
    'color: orange; font-weight: bold; font-size: 14px;',
    `
The application will not connect to a backend.
Please create a '.env' file in the root of your project and add your Supabase URL and Anon Key:
  
  VITE_SUPABASE_URL=https://your-project-id.supabase.co
  VITE_SUPABASE_ANON_KEY=your-public-anon-key

You can find these in your Supabase project's API settings.`
  );
}

// Initialize with placeholder values if not configured.
// This allows the app to load without crashing, and network errors will be
// prevented by checking 'isSupabaseConfigured' before making any API calls.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.co', 
  supabaseAnonKey || 'placeholder'
);
