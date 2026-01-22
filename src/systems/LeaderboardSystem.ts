import { SUPABASE_CONFIG } from '../core/Env';
import { getSupabase } from '../core/SupabaseClient';

export class LeaderboardSystem {
    private game: any;
    private storageKey: string = 'cosmos_survivor_scores';
    private maxScores: number = 10;
    private supabase: any = null;

    constructor(game: any) {
        this.game = game;
        this.supabase = getSupabase();
    }

    async saveScore(scoreData: any): Promise<void> {
        if (this.supabase && !SUPABASE_CONFIG.URL.includes('YOUR_SUPABASE')) {
            try {
                const { error } = await this.supabase
                    .from('leaderboard')
                    .insert([
                        {
                            name: scoreData.name,
                            score: scoreData.score,
                            level: scoreData.level,
                            difficulty: scoreData.difficulty
                        }
                    ]);

                if (error) throw error;
                console.log('Score saved to Cloud');
            } catch (e) {
                console.error('Failed to save to Cloud', e);
                this.saveLocal(scoreData);
            }
        } else {
            this.saveLocal(scoreData);
        }
    }

    saveLocal(scoreData: any): void {
        const scores = this.loadLocal();
        scores.push(scoreData);
        scores.sort((a: any, b: any) => b.score - a.score);
        if (scores.length > this.maxScores) scores.length = this.maxScores;
        localStorage.setItem(this.storageKey, JSON.stringify(scores));
    }

    loadLocal(): any[] {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (e) { return []; }
    }

    async getHighScores(): Promise<any[]> {
        if (this.supabase && !SUPABASE_CONFIG.URL.includes('YOUR_SUPABASE')) {
            try {
                const { data, error } = await this.supabase
                    .from('leaderboard')
                    .select('*')
                    .order('score', { ascending: false })
                    .limit(this.maxScores);

                if (error) throw error;
                return data;
            } catch (e) {
                console.error('Failed to fetch from Cloud', e);
                return this.loadLocal();
            }
        }

        return this.loadLocal();
    }
}
