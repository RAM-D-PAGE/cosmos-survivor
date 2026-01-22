import { CONFIG } from '../core/Config';
import { getSupabase } from '../core/SupabaseClient';

export class LoginSystem {
    private game: any;
    public username: string | null = null;
    public isLoggedIn: boolean = false;
    private sb: any = null; // Supabase client instance

    constructor(game: any) {
        this.game = game;
        this.sb = getSupabase();
        this.loadSession();
    }

    async login(email: string, password: string): Promise<{ success: boolean, message?: string }> {
        if (!this.sb) return { success: false, message: 'Supabase not initialized' };

        try {
            const { data, error } = await this.sb.auth.signInWithPassword({
                email: email,
                password: password,
            });

            if (error) throw error;

            if (data.user) {
                // Use email prefix as username
                this.username = data.user.email?.split('@')[0] || 'Unknown';
                this.isLoggedIn = true;
                this.game.spawnFloatingText(this.game.canvas.width / 2, this.game.canvas.height / 2, `Welcome, ${this.username}!`, '#00ff00');
                return { success: true };
            }
        } catch (e: any) {
            console.error(e);
            return { success: false, message: e.message || 'Login failed' };
        }
        return { success: false, message: 'Unknown error' };
    }

    async register(email: string, password: string): Promise<{ success: boolean, message?: string }> {
        if (!this.sb) return { success: false, message: 'Supabase not initialized' };

        try {
            const { data, error } = await this.sb.auth.signUp({
                email: email,
                password: password,
            });

            if (error) throw error;

            return { success: true, message: 'Check email confirmation!' };
        } catch (e: any) {
            console.error(e);
            return { success: false, message: e.message || 'Registration failed' };
        }
    }

    async loginWithGoogle(): Promise<void> {
        if (!this.sb) return;
        try {
            const { data, error } = await this.sb.auth.signInWithOAuth({
                provider: 'google',
            });
            if (error) throw error;
        } catch (e) {
            console.error(e);
        }
    }

    async logout(): Promise<void> {
        if (this.sb) await this.sb.auth.signOut();
        this.username = null;
        this.isLoggedIn = false;
        this.game.spawnFloatingText(this.game.canvas.width / 2, this.game.canvas.height / 2, "Logged Out", '#ff0000');
    }

    async loadSession(): Promise<void> {
        if (!this.sb) return;

        // Check active session
        const { data: { session } } = await this.sb.auth.getSession();

        if (session?.user) {
            this.username = session.user.email?.split('@')[0] || 'Survivor';
            this.isLoggedIn = true;
            console.log(`[AUTH] Session restored for ${this.username}`);
        } else {
            console.log("[AUTH] No active session");
        }

        // Listen for auth changes
        this.sb.auth.onAuthStateChange((event: any, session: any) => {
            if (event === 'SIGNED_IN' && session?.user) {
                this.username = session.user.email?.split('@')[0];
                this.isLoggedIn = true;
                if (this.game.ui && this.game.ui.updateLoginState) {
                    this.game.ui.updateLoginState();
                }
            } else if (event === 'SIGNED_OUT') {
                this.username = null;
                this.isLoggedIn = false;
                if (this.game.ui && this.game.ui.updateLoginState) {
                    this.game.ui.updateLoginState();
                }
            }
        });
    }
}
