/**
 * Gameplay Enhancer System
 * เพิ่ม features ที่ทำให้เกมสนุกขึ้น
 */

export class GameplayEnhancer {
    private game: any;

    // Combo System
    private comboCount: number = 0;
    private comboTimer: number = 0;
    private comboTimeLimit: number = 3; // seconds
    private maxCombo: number = 0;

    // Streak System
    private killStreak: number = 0;
    private streakTimer: number = 0;
    private streakTimeLimit: number = 5;

    // Achievement Tracking
    private achievements: Set<string> = new Set();

    constructor(game: any) {
        this.game = game;
    }

    /**
     * Update combo and streak systems
     */
    update(dt: number): void {
        // Combo timer
        if (this.comboCount > 0) {
            this.comboTimer += dt;
            if (this.comboTimer > this.comboTimeLimit) {
                this.resetCombo();
            }
        }

        // Streak timer
        if (this.killStreak > 0) {
            this.streakTimer += dt;
            if (this.streakTimer > this.streakTimeLimit) {
                this.resetStreak();
            }
        }
    }

    /**
     * Add to combo (called on enemy kill)
     */
    addCombo(): void {
        this.comboCount++;
        this.comboTimer = 0;
        if (this.comboCount > this.maxCombo) {
            this.maxCombo = this.comboCount;
        }

        // Combo bonuses
        if (this.comboCount >= 10) {
            const bonusExp = this.comboCount * 2;
            this.game.addExp(bonusExp);
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y - 50,
                `COMBO x${this.comboCount}! +${bonusExp} EXP`,
                '#ffff00'
            );
        }
    }

    /**
     * Add to kill streak
     */
    addKillStreak(): void {
        this.killStreak++;
        this.streakTimer = 0;

        // Streak bonuses
        if (this.killStreak % 10 === 0) {
            const bonusCoins = this.killStreak / 10;
            this.game.stateManager.coins += bonusCoins;
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y - 50,
                `KILL STREAK x${this.killStreak}! +${bonusCoins} Coins`,
                '#ffaa00'
            );
        }
    }

    /**
     * Reset combo
     */
    resetCombo(): void {
        this.comboCount = 0;
        this.comboTimer = 0;
    }

    /**
     * Reset streak
     */
    resetStreak(): void {
        this.killStreak = 0;
        this.streakTimer = 0;
    }

    /**
     * Get current combo
     */
    getCombo(): number {
        return this.comboCount;
    }

    /**
     * Get current streak
     */
    getStreak(): number {
        return this.killStreak;
    }

    /**
     * Get max combo achieved
     */
    getMaxCombo(): number {
        return this.maxCombo;
    }

    /**
     * Check and unlock achievements
     */
    checkAchievements(): void {
        // Example achievements
        if (this.maxCombo >= 50 && !this.achievements.has('COMBO_MASTER')) {
            this.achievements.add('COMBO_MASTER');
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                'ACHIEVEMENT: COMBO MASTER!',
                '#ffff00'
            );
        }

        if (this.killStreak >= 100 && !this.achievements.has('KILLING_SPREE')) {
            this.achievements.add('KILLING_SPREE');
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                'ACHIEVEMENT: KILLING SPREE!',
                '#ff0000'
            );
        }
    }

    /**
     * Reset all stats
     */
    reset(): void {
        this.comboCount = 0;
        this.comboTimer = 0;
        this.maxCombo = 0;
        this.killStreak = 0;
        this.streakTimer = 0;
        this.achievements.clear();
    }
}
