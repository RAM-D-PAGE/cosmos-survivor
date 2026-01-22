import { CONFIG } from './Config';

// Declare global from CDN
declare const supabase: any;

let supabaseInstance: any = null;

export const getSupabase = () => {
    if (supabaseInstance) return supabaseInstance;

    if (typeof supabase !== 'undefined') {
        try {
            supabaseInstance = supabase.createClient(CONFIG.SUPABASE.URL, CONFIG.SUPABASE.KEY);
            console.log("[SHARED] Supabase initialized");
        } catch (e) {
            console.error("[SHARED] Supabase init failed:", e);
        }
    } else {
        console.warn("[SHARED] Supabase library not found!");
    }
    return supabaseInstance;
};
