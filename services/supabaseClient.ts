import { createClient } from '@supabase/supabase-js';

// --- TEMPORARY & INSECURE: Hardcoding credentials for development ---
// WARNING: This is NOT safe for production. Your keys are visible in the code.
// This is a temporary workaround because this environment does not support secrets.
const supabaseUrl = "https://eddgclibxzaifmhjymim.supabase.co";
const supabaseAnonKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVkZGdjbGlieHphaWZtaGp5bWltIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYxNDI2NTcsImV4cCI6MjA3MTcxODY1N30.TqeF2cekqQZKhjvhwNKAiElEGFrBOUlgmbBOW1vJEns";
// --- END OF INSECURE CODE ---

// const supabaseUrl = (import.meta as any).env?.VITE_SUPABASE_URL;
// const supabaseAnonKey = (import.meta as any).env?.VITE_SUPABASE_ANON_KEY;

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
Please add your Supabase URL and Anon Key directly into 'services/supabaseClient.ts'.`
  );
}

// Initialize with placeholder values if not configured.
// This allows the app to load without crashing, and network errors will be
// prevented by checking 'isSupabaseConfigured' before making any API calls.
export const supabase = createClient(
  supabaseUrl || 'https://placeholder.co', 
  supabaseAnonKey || 'placeholder'
);