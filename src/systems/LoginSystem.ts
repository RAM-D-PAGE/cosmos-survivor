import { getSupabase } from '../core/SupabaseClient';
import { SupabaseClient } from '@supabase/supabase-js';

export class LoginSystem {
    private game: any;
    public username: string | null = null;
    public isLoggedIn: boolean = false;
    private sb: SupabaseClient | null = null; // Supabase client instance
    private authUnsubscribe?: () => void; // unsubscribe function for auth listener

    constructor(game: any) {
        this.game = game;
        this.sb = getSupabase();
        this.loadSession();
    }

    // Ensure we can cleanup listeners when system is disposed/restarted
    destroy(): void {
        try {
            this.authUnsubscribe?.();
        } catch {}
    }

    async login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
        // Avoid logging PII (email). Use masked or generic logs.
        console.log('[AUTH] Attempting login');
        if (!this.sb) {
            console.error('[AUTH] Supabase client is null');
            return { success: false, message: 'Supabase not initialized' };
        }

        const sanitize = (msg?: string) => msg ? 'Authentication failed' : 'Authentication error';

        try {
            const { data, error } = await this.sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) {
                console.warn('[AUTH] Login error code:', (error as any)?.status || 'unknown');
                return { success: false, message: sanitize(error.message) };
            }

            if (data.user) {
                // Use email prefix as username
                this.username = data.user.email?.split('@')[0] || 'Unknown';
                this.isLoggedIn = true;
                this.game.spawnFloatingText(this.game.canvas.width / 2, this.game.canvas.height / 2, `Welcome, ${this.username}!`, '#00ff00');

                // Allow UI to update
                this.game.ui?.updateLoginState?.();

                return { success: true };
            } else {
                console.warn('[AUTH] Login succeeded but no user data returned.');
            }
        } catch (e: any) {
            console.error('[AUTH] Exception during login');
            return { success: false, message: 'Authentication error' };
        }
        return { success: false, message: 'Unknown error' };
    }

    async register(email: string, password: string): Promise<{ success: boolean, message?: string }> {
        if (!this.sb) return { success: false, message: 'Supabase not initialized' };

        try {
            const { error } = await this.sb.auth.signUp({
                email: email,
                password: password,
            });

            if (error) {
                console.warn('[AUTH] Registration error');
                return { success: false, message: 'Registration failed' };
            }

            return { success: true, message: 'Check email confirmation!' };
        } catch (e: any) {
            console.error('[AUTH] Exception during registration');
            return { success: false, message: 'Registration failed' };
        }
    }

    async loginWithGoogle(): Promise<void> {
        if (!this.sb) return;
        try {
            const { error } = await this.sb.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (e) {
            console.error('[AUTH] OAuth error');
        }
    }

    async logout(): Promise<void> {
        if (this.sb) await this.sb.auth.signOut();
        this.username = null;
        this.isLoggedIn = false;
        this.game.spawnFloatingText(this.game.canvas.width / 2, this.game.canvas.height / 2, "Logged Out", '#ff0000');
        // Ensure UI reflects logout state
        this.game.ui?.updateLoginState?.();
    }

    async loadSession(): Promise<void> {
        if (!this.sb) return;

        // Check active session
        const { data: { session }, error } = await this.sb.auth.getSession();
        if (error) {
            console.error('[AUTH] Error loading session');
            return;
        }

        if (session?.user) {
            this.username = session.user.email?.split('@')[0] || 'Survivor';
            this.isLoggedIn = true;
            console.log('[AUTH] Session restored');
        } else {
            console.log('[AUTH] No active session');
        }

        // Listen for auth changes and keep unsubscribe for cleanup
        const { data: listener } = this.sb.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.username = session.user.email?.split('@')[0] || null;
                this.isLoggedIn = true;
                this.game.ui?.updateLoginState?.();
            } else if (event === 'SIGNED_OUT') {
                this.username = null;
                this.isLoggedIn = false;
                this.game.ui?.updateLoginState?.();
            }
        });
        this.authUnsubscribe = () => listener.subscription.unsubscribe();
    }
}
