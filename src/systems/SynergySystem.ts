/**
 * Synergy System
 * ระบบ Synergy ระหว่าง Cards/Skills/Weapons
 * ทำให้การเลือกอัพเกรดมีกลยุทธ์มากขึ้น
 */

export interface Synergy {
    id: string;
    name: string;
    nameTH?: string;
    description: string;
    descriptionTH?: string;
    requirements: string[]; // Card/Skill IDs required
    bonus: (game: any) => void;
    tier: 1 | 2 | 3; // Synergy tier
}

export class SynergySystem {
    private game: any;
    private activeSynergies: Set<string> = new Set();
    private synergies: Synergy[] = [];

    constructor(game: any) {
        this.game = game;
        this.initializeSynergies();
    }

    /**
     * Initialize all synergies
     */
    private initializeSynergies(): void {
        this.synergies = [
            // Tier 1 Synergies
            {
                id: 'FIRE_SYNERGY',
                name: 'Fire Master',
                nameTH: 'ปรมาจารย์ไฟ',
                description: 'Fire skills deal 50% more damage',
                descriptionTH: 'สกิลไฟสร้างความเสียหายเพิ่ม 50%',
                requirements: ['FIREBALL', 'EXPLOSIVE_DAMAGE'],
                tier: 1,
                bonus: (game) => {
                    game.player.fireDamageBonus = (game.player.fireDamageBonus || 0) + 0.5;
                }
            },
            {
                id: 'ICE_SYNERGY',
                name: 'Ice Master',
                nameTH: 'ปรมาจารย์น้ำแข็ง',
                description: 'Ice skills freeze longer',
                descriptionTH: 'สกิลน้ำแข็งแช่แข็งนานขึ้น',
                requirements: ['ICEBALL', 'FREEZE'],
                tier: 1,
                bonus: (game) => {
                    game.player.freezeDurationBonus = (game.player.freezeDurationBonus || 0) + 1.0;
                }
            },
            {
                id: 'SPEED_DEMON',
                name: 'Speed Demon',
                nameTH: 'ปีศาจความเร็ว',
                description: 'Speed +50%, Damage +25%',
                descriptionTH: 'ความเร็ว +50%, ดาเมจ +25%',
                requirements: ['SPEED_UP', 'SPEED_BURST'],
                tier: 1,
                bonus: (game) => {
                    game.player.maxSpeed *= 1.5;
                    game.player.damage *= 1.25;
                }
            },
            {
                id: 'TANK_BUILD',
                name: 'Tank Build',
                nameTH: 'แทงค์บิลด์',
                description: 'HP +100%, Armor +50%',
                descriptionTH: 'HP +100%, เกราะ +50%',
                requirements: ['MAX_HP_UP', 'ARMOR', 'HP_REGEN'],
                tier: 1,
                bonus: (game) => {
                    game.player.maxHp *= 2;
                    game.player.hp *= 2;
                    game.player.armor = (game.player.armor || 0) + 0.5;
                }
            },

            // Tier 2 Synergies
            {
                id: 'CRIT_MASTER',
                name: 'Crit Master',
                nameTH: 'ปรมาจารย์คริติคอล',
                description: 'Crit chance +30%, Crit damage x3',
                descriptionTH: 'โอกาสคริติคอล +30%, ดาเมจคริติคอล x3',
                requirements: ['CRITICAL_STRIKE', 'DAMAGE_UP'],
                tier: 2,
                bonus: (game) => {
                    game.player.critChance = (game.player.critChance || 0) + 0.3;
                    game.player.critMultiplier = (game.player.critMultiplier || 1) * 3;
                }
            },
            {
                id: 'VAMPIRE_BUILD',
                name: 'Vampire Build',
                nameTH: 'บิลด์ดูดเลือด',
                description: 'Lifesteal +10%, HP on kill +20',
                descriptionTH: 'ดูดเลือด +10%, HP เมื่อฆ่า +20',
                requirements: ['LIFE_STEAL', 'HEALTH_ON_KILL'],
                tier: 2,
                bonus: (game) => {
                    game.player.lifeSteal = (game.player.lifeSteal || 0) + 0.1;
                    game.player.healthOnKill = (game.player.healthOnKill || 0) + 20;
                }
            },
            {
                id: 'EXPLOSIVE_EXPERT',
                name: 'Explosive Expert',
                nameTH: 'ผู้เชี่ยวชาญระเบิด',
                description: 'Explosions deal 2x damage, +50% radius',
                descriptionTH: 'ระเบิดสร้างความเสียหาย 2 เท่า, รัศมี +50%',
                requirements: ['EXPLOSIVE_DAMAGE', 'EXPLOSION_RADIUS'],
                tier: 2,
                bonus: (game) => {
                    game.player.explosiveDamageBonus = (game.player.explosiveDamageBonus || 0) + 1.0;
                    game.player.explosionRadius = (game.player.explosionRadius || 0) * 1.5;
                }
            },

            // Tier 3 Synergies (Ultimate)
            {
                id: 'GOD_MODE',
                name: 'God Mode',
                nameTH: 'โหมดเทพ',
                description: 'All stats +100%',
                descriptionTH: 'สเตตทั้งหมด +100%',
                requirements: ['DAMAGE_UP', 'MAX_HP_UP', 'SPEED_UP', 'FIRE_RATE_UP'],
                tier: 3,
                bonus: (game) => {
                    game.player.damage *= 2;
                    game.player.maxHp *= 2;
                    game.player.hp *= 2;
                    game.player.maxSpeed *= 2;
                    game.player.baseFireRate *= 2;
                }
            },
            {
                id: 'INFINITY_LOOP',
                name: 'Infinity Loop',
                nameTH: 'ลูปอนันต์',
                description: 'Skills have no cooldown',
                descriptionTH: 'สกิลไม่มีคูลดาวน์',
                requirements: ['SKILL_COOLDOWN', 'TIME_STOP', 'DIVINE_SHIELD'],
                tier: 3,
                bonus: (game) => {
                    game.player.skillCooldownReduction = 1.0; // 100% reduction
                }
            },
        ];
    }

    /**
     * Check and activate synergies based on acquired upgrades
     */
    checkSynergies(): void {
        const acquired = this.game.acquiredUpgrades.map((u: any) => u.name).join('|');
        
        this.synergies.forEach(synergy => {
            if (this.activeSynergies.has(synergy.id)) return;

            // Check if all requirements are met
            const hasAll = synergy.requirements.every(req => {
                return this.game.acquiredUpgrades.some((u: any) => 
                    u.name.includes(req) || u.name.toLowerCase().includes(req.toLowerCase())
                );
            });

            if (hasAll) {
                this.activateSynergy(synergy);
            }
        });
    }

    /**
     * Activate a synergy
     */
    private activateSynergy(synergy: Synergy): void {
        this.activeSynergies.add(synergy.id);
        synergy.bonus(this.game);
        
        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `SYNERGY: ${synergy.name}!`,
            synergy.tier === 3 ? '#ffff00' : synergy.tier === 2 ? '#ff00ff' : '#00ffff'
        );

        this.game.events.emit('synergy:activated', {
            synergyId: synergy.id,
            synergyName: synergy.name,
            tier: synergy.tier
        });
    }

    /**
     * Get active synergies
     */
    getActiveSynergies(): string[] {
        return Array.from(this.activeSynergies);
    }

    /**
     * Reset synergies
     */
    reset(): void {
        this.activeSynergies.clear();
    }
}
