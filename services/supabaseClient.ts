import { createClient } from '@supabase/supabase-js';

// Hardcoded Supabase credentials as import.meta.env is not available in this execution environment.
const supabaseUrl = 'https://eddgclibxzaifmhjymim.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZGdjbGlieHphaWZtaGp5bWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDI2NTcsImV4cCI6MjA3MTcxODY1N30.TqeF2cekqQZKhjvhwNKAiElEGFrBOUlgmbBOW1vJEns';


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
For local development, create a .env.local file with VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.
For Vercel deployment, set these as environment variables in your project settings.`
  );
}

// Initialize with placeholder values if not configured.
// This allows the app to load without crashing, and network errors will be
// prevented by checking 'isSupabaseConfigured' before making any API calls.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.co', 
  supabaseAnonKey || 'placeholder'
);