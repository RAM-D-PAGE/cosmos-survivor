/**
 * Prestige System
 * ระบบ Prestige ที่ให้ผู้เล่น reset เพื่อรับ permanent bonuses
 */

export interface PrestigeBonus {
    id: string;
    name: string;
    nameTH?: string;
    description: string;
    descriptionTH?: string;
    cost: number; // Prestige points required
    maxLevel: number; // -1 for unlimited
    currentLevel: number;
    effect: (level: number) => { stat: string; value: number }; // Returns stat name and value
}

export class PrestigeSystem {
    private game: any;
    public prestigeLevel: number = 0;
    public prestigePoints: number = 0;
    public totalPrestigePoints: number = 0;
    public bonuses: Map<string, PrestigeBonus> = new Map();

    constructor(game: any) {
        this.game = game;
        this.initializeBonuses();
        this.loadPrestigeData();
    }

    /**
     * Initialize all prestige bonuses
     */
    private initializeBonuses(): void {
        const bonuses: PrestigeBonus[] = [
            {
                id: 'PRESTIGE_DAMAGE',
                name: 'Permanent Damage Boost',
                nameTH: 'เพิ่มดาเมจถาวร',
                description: 'Permanently increase base damage by 5 per level',
                descriptionTH: 'เพิ่มดาเมจพื้นฐานถาวร 5 ต่อระดับ',
                cost: 1,
                maxLevel: 50,
                currentLevel: 0,
                effect: (level) => ({ stat: 'damage', value: level * 5 })
            },
            {
                id: 'PRESTIGE_HP',
                name: 'Permanent HP Boost',
                nameTH: 'เพิ่ม HP ถาวร',
                description: 'Permanently increase max HP by 20 per level',
                descriptionTH: 'เพิ่ม HP สูงสุดถาวร 20 ต่อระดับ',
                cost: 1,
                maxLevel: 50,
                currentLevel: 0,
                effect: (level) => ({ stat: 'maxHp', value: level * 20 })
            },
            {
                id: 'PRESTIGE_SPEED',
                name: 'Permanent Speed Boost',
                nameTH: 'เพิ่มความเร็วถาวร',
                description: 'Permanently increase speed by 10 per level',
                descriptionTH: 'เพิ่มความเร็วถาวร 10 ต่อระดับ',
                cost: 1,
                maxLevel: 50,
                currentLevel: 0,
                effect: (level) => ({ stat: 'maxSpeed', value: level * 10 })
            },
            {
                id: 'PRESTIGE_EXP_GAIN',
                name: 'EXP Gain Multiplier',
                nameTH: 'ตัวคูณ EXP',
                description: 'Increase EXP gain by 5% per level',
                descriptionTH: 'เพิ่ม EXP ที่ได้รับ 5% ต่อระดับ',
                cost: 2,
                maxLevel: 20,
                currentLevel: 0,
                effect: (level) => ({ stat: 'expMultiplier', value: 1 + (level * 0.05) })
            },
            {
                id: 'PRESTIGE_COIN_GAIN',
                name: 'Coin Gain Multiplier',
                nameTH: 'ตัวคูณเหรียญ',
                description: 'Increase coin gain by 10% per level',
                descriptionTH: 'เพิ่มเหรียญที่ได้รับ 10% ต่อระดับ',
                cost: 2,
                maxLevel: 20,
                currentLevel: 0,
                effect: (level) => ({ stat: 'coinMultiplier', value: 1 + (level * 0.1) })
            },
            {
                id: 'PRESTIGE_STARTING_LEVEL',
                name: 'Starting Level',
                nameTH: 'ระดับเริ่มต้น',
                description: 'Start each run at level X (1 level per prestige level)',
                descriptionTH: 'เริ่มเกมแต่ละครั้งที่ระดับ X (1 ระดับต่อ prestige level)',
                cost: 3,
                maxLevel: 10,
                currentLevel: 0,
                effect: (level) => ({ stat: 'startingLevel', value: level })
            },
            {
                id: 'PRESTIGE_STARTING_COINS',
                name: 'Starting Coins',
                nameTH: 'เหรียญเริ่มต้น',
                description: 'Start each run with X coins (50 per level)',
                descriptionTH: 'เริ่มเกมแต่ละครั้งด้วยเหรียญ X (50 ต่อระดับ)',
                cost: 2,
                maxLevel: 20,
                currentLevel: 0,
                effect: (level) => ({ stat: 'startingCoins', value: level * 50 })
            },
            {
                id: 'PRESTIGE_CRIT_CHANCE',
                name: 'Permanent Crit Chance',
                nameTH: 'โอกาสคริติคอลถาวร',
                description: 'Permanently increase crit chance by 1% per level',
                descriptionTH: 'เพิ่มโอกาสคริติคอลถาวร 1% ต่อระดับ',
                cost: 3,
                maxLevel: 20,
                currentLevel: 0,
                effect: (level) => ({ stat: 'critChance', value: level * 0.01 })
            },
            {
                id: 'PRESTIGE_LUCK',
                name: 'Permanent Luck',
                nameTH: 'โชคถาวร',
                description: 'Permanently increase luck by 5% per level',
                descriptionTH: 'เพิ่มโชคถาวร 5% ต่อระดับ',
                cost: 2,
                maxLevel: 20,
                currentLevel: 0,
                effect: (level) => ({ stat: 'luck', value: level * 0.05 })
            },
            {
                id: 'PRESTIGE_SKILL_SLOT',
                name: 'Extra Skill Slot',
                nameTH: 'ช่องสกิลเพิ่ม',
                description: 'Unlock an additional skill slot permanently',
                descriptionTH: 'ปลดล็อคช่องสกิลเพิ่มเติมถาวร',
                cost: 5,
                maxLevel: 2,
                currentLevel: 0,
                effect: (level) => ({ stat: 'skillSlots', value: level })
            },
            {
                id: 'PRESTIGE_WEAPON_SLOT',
                name: 'Extra Weapon Slot',
                nameTH: 'ช่องอาวุธเพิ่ม',
                description: 'Unlock an additional weapon slot permanently',
                descriptionTH: 'ปลดล็อคช่องอาวุธเพิ่มเติมถาวร',
                cost: 5,
                maxLevel: 3,
                currentLevel: 0,
                effect: (level) => ({ stat: 'weaponSlots', value: level })
            }
        ];

        bonuses.forEach(bonus => {
            this.bonuses.set(bonus.id, { ...bonus });
        });
    }

    /**
     * Calculate prestige points from current run
     */
    calculatePrestigePoints(): number {
        const score = this.game.stateManager?.calculateScore() || 0;
        const level = this.game.stateManager?.level || 1;
        const enemiesKilled = this.game.stateManager?.enemiesKilled || 0;
        const coins = this.game.stateManager?.coins || 0;

        // Formula: (Score / 1000) + (Level * 0.1) + (EnemiesKilled / 100) + (Coins / 50)
        const points = Math.floor(
            (score / 1000) +
            (level * 0.1) +
            (enemiesKilled / 100) +
            (coins / 50)
        );

        return Math.max(1, points); // Minimum 1 point
    }

    /**
     * Prestige (reset game and gain points)
     */
    prestige(): boolean {
        const points = this.calculatePrestigePoints();
        
        if (points < 1) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "NOT ENOUGH PROGRESS!",
                '#ff0000'
            );
            return false;
        }

        // Add prestige points
        this.prestigePoints += points;
        this.totalPrestigePoints += points;
        this.prestigeLevel++;

        // Save prestige data
        this.savePrestigeData();

        // Show message
        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `PRESTIGE! +${points} Points`,
            '#ffd700'
        );

        return true;
    }

    /**
     * Purchase a prestige bonus
     */
    purchaseBonus(bonusId: string): boolean {
        const bonus = this.bonuses.get(bonusId);
        if (!bonus) return false;

        if (bonus.maxLevel !== -1 && bonus.currentLevel >= bonus.maxLevel) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "MAX LEVEL REACHED!",
                '#ff0000'
            );
            return false;
        }

        if (this.prestigePoints < bonus.cost) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "NOT ENOUGH PRESTIGE POINTS!",
                '#ff0000'
            );
            return false;
        }

        // Purchase
        this.prestigePoints -= bonus.cost;
        bonus.currentLevel++;

        // Apply effect
        this.applyPrestigeBonuses();

        // Save
        this.savePrestigeData();

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `${bonus.name} +1`,
            '#00ff00'
        );

        return true;
    }

    /**
     * Apply all prestige bonuses to player
     */
    applyPrestigeBonuses(): void {
        if (!this.game.player) return;

        this.bonuses.forEach(bonus => {
            if (bonus.currentLevel > 0) {
                const effect = bonus.effect(bonus.currentLevel);
                const stat = effect.stat;
                const value = effect.value;

                switch (stat) {
                    case 'damage':
                        this.game.player.damage = (this.game.player.damage || 10) + value;
                        break;
                    case 'maxHp':
                        this.game.player.maxHp = (this.game.player.maxHp || 100) + value;
                        this.game.player.hp = Math.min(this.game.player.hp, this.game.player.maxHp);
                        break;
                    case 'maxSpeed':
                        this.game.player.maxSpeed = (this.game.player.maxSpeed || 400) + value;
                        break;
                    case 'expMultiplier':
                        this.game.player.expMultiplier = (this.game.player.expMultiplier || 1) * value;
                        break;
                    case 'coinMultiplier':
                        this.game.player.coinMultiplier = (this.game.player.coinMultiplier || 1) * value;
                        break;
                    case 'startingLevel':
                        // Applied at game start
                        break;
                    case 'startingCoins':
                        // Applied at game start
                        break;
                    case 'critChance':
                        this.game.player.critChance = (this.game.player.critChance || 0) + value;
                        break;
                    case 'luck':
                        this.game.player.luck = (this.game.player.luck || 0) + value;
                        break;
                    case 'skillSlots':
                        if (this.game.skillSystem) {
                            this.game.skillSystem.maxSkills = (this.game.skillSystem.maxSkills || 3) + value;
                        }
                        break;
                    case 'weaponSlots':
                        if (this.game.weaponSystem) {
                            this.game.weaponSystem.maxWeapons = (this.game.weaponSystem.maxWeapons || 4) + value;
                        }
                        break;
                }
            }
        });
    }

    /**
     * Get starting bonuses for new game
     */
    getStartingBonuses(): { level: number; coins: number } {
        const startingLevel = this.bonuses.get('PRESTIGE_STARTING_LEVEL');
        const startingCoins = this.bonuses.get('PRESTIGE_STARTING_COINS');

        return {
            level: startingLevel?.currentLevel || 0,
            coins: startingCoins?.currentLevel * 50 || 0
        };
    }

    /**
     * Save prestige data to localStorage
     */
    savePrestigeData(): void {
        const data = {
            prestigeLevel: this.prestigeLevel,
            prestigePoints: this.prestigePoints,
            totalPrestigePoints: this.totalPrestigePoints,
            bonuses: Array.from(this.bonuses.entries()).map(([id, bonus]) => ({
                id,
                currentLevel: bonus.currentLevel
            }))
        };

        try {
            localStorage.setItem('cosmos_prestige', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save prestige data:', e);
        }
    }

    /**
     * Load prestige data from localStorage
     */
    loadPrestigeData(): void {
        try {
            const dataStr = localStorage.getItem('cosmos_prestige');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            this.prestigeLevel = data.prestigeLevel || 0;
            this.prestigePoints = data.prestigePoints || 0;
            this.totalPrestigePoints = data.totalPrestigePoints || 0;

            if (data.bonuses) {
                data.bonuses.forEach((bonusData: any) => {
                    const bonus = this.bonuses.get(bonusData.id);
                    if (bonus) {
                        bonus.currentLevel = bonusData.currentLevel || 0;
                    }
                });
            }
        } catch (e) {
            console.error('Failed to load prestige data:', e);
        }
    }

    /**
     * Get all available bonuses
     */
    getAvailableBonuses(): PrestigeBonus[] {
        return Array.from(this.bonuses.values());
    }

    /**
     * Reset prestige (for testing or reset)
     */
    reset(): void {
        this.prestigeLevel = 0;
        this.prestigePoints = 0;
        this.totalPrestigePoints = 0;
        this.bonuses.forEach(bonus => {
            bonus.currentLevel = 0;
        });
        this.savePrestigeData();
    }
}
