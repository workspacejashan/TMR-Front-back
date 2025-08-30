// FIX: Replaced the non-resolving vite/client type reference with a manual definition
// for ImportMetaEnv to provide types for environment variables and resolve TypeScript errors.
interface ImportMetaEnv {
    readonly VITE_SUPABASE_URL: string;
    readonly VITE_SUPABASE_ANON_KEY: string;
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
