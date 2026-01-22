/**
 * Skill Mastery System
 * ระบบ level up skills เพื่อเพิ่มพลัง
 */

export interface SkillMastery {
    skillId: string;
    level: number;
    experience: number;
    experienceToNext: number;
}

export interface MasteryBonus {
    level: number;
    damageMultiplier: number;
    cooldownReduction: number;
    radiusMultiplier: number;
    durationMultiplier: number;
}

export class SkillMasterySystem {
    private readonly game: any;
    public masteries: Map<string, SkillMastery> = new Map();
    private readonly masteryBonuses: Map<number, MasteryBonus> = new Map();

    constructor(game: any) {
        this.game = game;
        this.initializeMasteryBonuses();
        this.loadMasteryData();
    }

    /**
     * Initialize mastery level bonuses
     */
    private initializeMasteryBonuses(): void {
        // Each level provides:
        // - 5% damage increase
        // - 2% cooldown reduction
        // - 3% radius increase
        // - 2% duration increase
        for (let level = 1; level <= 50; level++) {
            this.masteryBonuses.set(level, {
                level: level,
                damageMultiplier: 1 + (level * 0.05),
                cooldownReduction: level * 0.02,
                radiusMultiplier: 1 + (level * 0.03),
                durationMultiplier: 1 + (level * 0.02)
            });
        }
    }

    /**
     * Get mastery for a skill
     */
    getMastery(skillId: string): SkillMastery {
        if (!this.masteries.has(skillId)) {
            this.masteries.set(skillId, {
                skillId: skillId,
                level: 0,
                experience: 0,
                experienceToNext: 100
            });
        }
        return this.masteries.get(skillId)!;
    }

    /**
     * Add experience to a skill
     */
    addExperience(skillId: string, amount: number): void {
        const mastery = this.getMastery(skillId);
        mastery.experience += amount;

        // Check for level up
        while (mastery.experience >= mastery.experienceToNext && mastery.level < 50) {
            mastery.experience -= mastery.experienceToNext;
            mastery.level++;
            mastery.experienceToNext = Math.floor(100 * Math.pow(1.2, mastery.level));

            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                `${skillId} MASTERY LEVEL ${mastery.level}!`,
                '#ffd700'
            );
        }

        this.saveMasteryData();
    }

    /**
     * Get mastery bonuses for a skill
     */
    getMasteryBonus(skillId: string): MasteryBonus | null {
        const mastery = this.getMastery(skillId);
        if (mastery.level === 0) return null;
        return this.masteryBonuses.get(mastery.level) || null;
    }

    /**
     * Apply mastery bonuses to a skill
     */
    applyMasteryBonuses(skill: any): void {
        const bonus = this.getMasteryBonus(skill.id || skill.name);
        if (!bonus) return;

        // Apply damage multiplier
        if (skill.damage) {
            skill.damage = Math.floor(skill.damage * bonus.damageMultiplier);
        }
        if (skill.damagePerSec) {
            skill.damagePerSec = skill.damagePerSec * bonus.damageMultiplier;
        }

        // Apply cooldown reduction
        if (skill.cooldown) {
            skill.cooldown = Math.max(1, skill.cooldown * (1 - bonus.cooldownReduction));
        }

        // Apply radius multiplier
        if (skill.radius) {
            skill.radius = Math.floor(skill.radius * bonus.radiusMultiplier);
        }

        // Apply duration multiplier
        if (skill.duration) {
            skill.duration = skill.duration * bonus.durationMultiplier;
        }
    }

    /**
     * Level up a skill manually (using coins or items)
     */
    levelUpSkill(skillId: string, cost: number = 50): boolean {
        const mastery = this.getMastery(skillId);

        if (mastery.level >= 50) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "MAX LEVEL REACHED!",
                '#ff0000'
            );
            return false;
        }

        if (this.game.stateManager.coins < cost) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                `NEED ${cost} COINS!`,
                '#ff0000'
            );
            return false;
        }

        // Level up
        mastery.level++;
        mastery.experience = 0;
        mastery.experienceToNext = Math.floor(100 * Math.pow(1.2, mastery.level));

        // Deduct coins
        this.game.stateManager.coins -= cost;
        if (this.game.ui) {
            this.game.ui.updateCoins(this.game.stateManager.coins);
        }

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `${skillId} LEVEL ${mastery.level}!`,
            '#00ff00'
        );

        this.saveMasteryData();
        return true;
    }

    /**
     * Save mastery data to localStorage
     */
    saveMasteryData(): void {
        const data = Array.from(this.masteries.entries()).map(([id, mastery]) => ({
            skillId: id,
            level: mastery.level,
            experience: mastery.experience,
            experienceToNext: mastery.experienceToNext
        }));

        try {
            localStorage.setItem('cosmos_skill_mastery', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save mastery data:', e);
        }
    }

    /**
     * Load mastery data from localStorage
     */
    loadMasteryData(): void {
        try {
            const dataStr = localStorage.getItem('cosmos_skill_mastery');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            data.forEach((item: any) => {
                this.masteries.set(item.skillId, {
                    skillId: item.skillId,
                    level: item.level || 0,
                    experience: item.experience || 0,
                    experienceToNext: item.experienceToNext || 100
                });
            });
        } catch (e) {
            console.error('Failed to load mastery data:', e);
        }
    }

    /**
     * Get all masteries
     */
    getAllMasteries(): SkillMastery[] {
        return Array.from(this.masteries.values());
    }

    /**
     * Reset mastery (for testing)
     */
    reset(): void {
        this.masteries.clear();
        this.saveMasteryData();
    }
}
