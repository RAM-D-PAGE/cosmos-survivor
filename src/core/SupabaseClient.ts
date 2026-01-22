import { CONFIG } from './Config';

import { createClient, SupabaseClient } from '@supabase/supabase-js';

let supabaseInstance: SupabaseClient | null = null;

export const getSupabase = (): SupabaseClient | null => {
    if (supabaseInstance) return supabaseInstance;

    try {
        const url = CONFIG.SUPABASE.URL;
        const key = CONFIG.SUPABASE.KEY;
        if (!url || !key) {
            console.error("[SHARED] Supabase URL or KEY is missing in Config!");
            return null;
        }
        supabaseInstance = createClient(url, key);
        console.log("[SHARED] Supabase initialized");
    } catch (e) {
        console.error("[SHARED] Supabase init failed:", e);
        supabaseInstance = null;
    }
    return supabaseInstance;
};
