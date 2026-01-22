export interface CardDefinition {
    id: string;
    name: string;
    nameTH?: string;
    category: 'OFFENSIVE' | 'DEFENSIVE' | 'MOBILITY' | 'UTILITY' | 'CONSUMABLE';
    description: string;
    descriptionTH?: string;
    baseValue: number;
    unit: string;
    weight: number;
    maxStacks: number;
    isMystical?: boolean;
    apply: (game: any, value: number) => void;
}

export interface CardRarity {
    name: string;
    multiplier: number;
    color: string;
    weight?: number;
}

export class CardSystem {
    private game: any;
    private cardDefinitions: Record<string, CardDefinition>;
    private rarities: CardRarity[];
    private mysticalRarity: CardRarity;
    // private _bossRarity: CardRarity; // Removed unused
    private acquiredCards: Record<string, number>;

    constructor(game: any) {
        this.game = game;

        // All card definitions organized by category
        this.cardDefinitions = {
            // === OFFENSIVE CARDS ===
            DAMAGE_UP: {
                id: 'DAMAGE_UP',
                name: 'Power Core',
                nameTH: 'แกนพลังงาน',
                category: 'OFFENSIVE',
                description: 'Increases projectile damage.',
                descriptionTH: 'เพิ่มความเสียหายกระสุน',
                baseValue: 10,
                unit: ' DMG',
                weight: 1.0,
                maxStacks: 10,
                apply: (game, value) => { game.player.damage += value; }
            },

            FIRE_RATE_UP: {
                id: 'FIRE_RATE_UP',
                name: 'Rapid Fire Module',
                nameTH: 'โมดูลยิงรัว',
                category: 'OFFENSIVE',
                description: 'Increases firing speed.',
                descriptionTH: 'เพิ่มความเร็วในการยิง',
                baseValue: 0.5,
                unit: ' shots/s',
                weight: 0.8,
                maxStacks: 8,
                apply: (game, value) => { game.player.baseFireRate += value; }
            },

            MULTISHOT: {
                id: 'MULTISHOT',
                name: 'Multishot Array',
                nameTH: 'ระบบยิงหลายทิศทาง',
                category: 'OFFENSIVE',
                description: 'Fire additional projectiles.',
                descriptionTH: 'ยิงกระสุนเพิ่มเติม',
                baseValue: 1,
                unit: ' projectile',
                weight: 0.15,
                maxStacks: 5,
                apply: (game, value) => { game.player.projectileCount += value; }
            },

            PROJECTILE_SPEED: {
                id: 'PROJECTILE_SPEED',
                name: 'Accelerator',
                nameTH: 'เครื่องเร่งความเร็ว',
                category: 'OFFENSIVE',
                description: 'Faster projectiles.',
                descriptionTH: 'เพิ่มความเร็วกระสุน',
                baseValue: 50,
                unit: '',
                weight: 0.6,
                maxStacks: 8,
                apply: (game, value) => { game.player.projectileSpeed += value; }
            },

            CRITICAL_STRIKE: {
                id: 'CRITICAL_STRIKE',
                name: 'Critical Module',
                nameTH: 'โมดูลคริติคอล',
                category: 'OFFENSIVE',
                description: 'Chance for 2x damage.',
                descriptionTH: 'เพิ่มโอกาสสร้างความเสียหาย 2 เท่า',
                baseValue: 5,
                unit: '% crit',
                weight: 0.4,
                maxStacks: 6,
                apply: (game, value) => {
                    game.player.critChance = (game.player.critChance || 0) + value / 100;
                }
            },

            PIERCING: {
                id: 'PIERCING',
                name: 'Piercing Rounds',
                nameTH: 'กระสุนเจาะเกราะ',
                category: 'OFFENSIVE',
                description: 'Projectiles pass through enemies.',
                descriptionTH: 'กระสุนทะลุศัตรู',
                baseValue: 1,
                unit: ' pierce',
                weight: 0.2,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.piercing = (game.player.piercing || 0) + value;
                }
            },

            CHAIN_LIGHTNING: {
                id: 'CHAIN_LIGHTNING',
                name: 'Chain Lightning',
                nameTH: 'สายฟ้าลูกโซ่',
                category: 'OFFENSIVE',
                description: 'Damage chains to nearby enemies.',
                descriptionTH: 'ความเสียหายชิ่งไปยังศัตรูใกล้เคียง',
                baseValue: 2,
                unit: ' chains',
                weight: 0.15,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.chainCount = (game.player.chainCount || 0) + value;
                }
            },

            RICOCHET: {
                id: 'RICOCHET',
                name: 'Ricochet',
                nameTH: 'กระสุนชิ่ง',
                category: 'OFFENSIVE',
                description: 'Projectiles bounce to new targets.',
                descriptionTH: 'กระสุนเด้งหาเป้าหมายใหม่',
                baseValue: 1,
                unit: ' bounce',
                weight: 0.2,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.ricochet = (game.player.ricochet || 0) + value;
                }
            },

            LIFE_STEAL: {
                id: 'LIFE_STEAL',
                name: 'Vampirism Module',
                nameTH: 'ดูดเลือด',
                category: 'OFFENSIVE',
                description: 'Heal a percentage of damage dealt.',
                descriptionTH: 'ฟื้นฟูเลือดจากความเสียหายที่ทำได้',
                baseValue: 3,
                unit: '% lifesteal',
                weight: 0.1, // Rare
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.lifeSteal = (game.player.lifeSteal || 0) + value / 100;
                }
            },

            BERSERKER: {
                id: 'BERSERKER',
                name: 'Berserker Mode',
                nameTH: 'โหมดบ้าคลั่ง',
                category: 'OFFENSIVE',
                description: '+50% damage when below 30% HP.',
                descriptionTH: 'ดาเมจ +50% เมื่อ HP ต่ำกว่า 30%',
                baseValue: 50,
                unit: '% dmg bonus',
                weight: 0.15,
                maxStacks: 1,
                apply: (game, value) => {
                    game.player.hasBerserker = true;
                    game.player.berserkerBonus = value / 100;
                }
            },

            RAM_DAMAGE: {
                id: 'RAM_DAMAGE',
                name: 'Spiked Hull',
                nameTH: 'เกราะหนาม',
                category: 'OFFENSIVE',
                description: 'Deal damage when colliding with enemies.',
                descriptionTH: 'สร้างความเสียหายเมื่อชนศัตรู',
                baseValue: 50,
                unit: ' damage',
                weight: 0.2,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.collisionDamage = (game.player.collisionDamage || 0) + value;
                }
            },


            // === DEFENSIVE CARDS ===
            MAX_HP_UP: {
                id: 'MAX_HP_UP',
                name: 'Hull Plating',
                nameTH: 'แผ่นเกราะเสริม',
                category: 'DEFENSIVE',
                description: 'Increases max HP.',
                descriptionTH: 'เพิ่มพลังชีวิตสูงสุด',
                baseValue: 20,
                unit: ' HP',
                weight: 0.7,
                maxStacks: 10,
                apply: (game, value) => {
                    game.player.maxHp += value;
                    game.player.hp += value;
                }
            },

            HP_REGEN: {
                id: 'HP_REGEN',
                name: 'Nanofiber Repair',
                nameTH: 'เส้นใยซ่อมแซม',
                category: 'DEFENSIVE',
                description: 'Passively regenerate HP.',
                descriptionTH: 'ฟื้นฟู HP อัตโนมัติ',
                baseValue: 2,
                unit: ' HP/s',
                weight: 0.5,
                maxStacks: 8,
                apply: (game, value) => { game.player.hpRegen += value; }
            },

            ARMOR: {
                id: 'ARMOR',
                name: 'Armor Plating',
                nameTH: 'แผ่นเกราะกันกระสุน',
                category: 'DEFENSIVE',
                description: 'Reduce damage taken.',
                descriptionTH: 'ลดความเสียหายที่ได้รับ',
                baseValue: 10,
                unit: '% reduction',
                weight: 0.4,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.armor = (game.player.armor || 0) + value / 100;
                }
            },

            SHIELD_GEN: {
                id: 'SHIELD_GEN',
                name: 'Shield Generator',
                nameTH: 'เครื่องสร้างโล่',
                category: 'DEFENSIVE',
                description: 'Absorbs one hit every 10 seconds.',
                descriptionTH: 'ป้องกันความเสียหาย 1 ครั้ง ทุก 10 วินาที',
                baseValue: 1,
                unit: ' shield',
                weight: 0.2,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.shieldCharges = (game.player.shieldCharges || 0) + value;
                    game.player.shieldCooldown = 10;
                }
            },

            SECOND_WIND: {
                id: 'SECOND_WIND',
                name: 'Second Wind',
                nameTH: 'ลมหายใจเฮือกสุดท้าย',
                category: 'DEFENSIVE',
                description: 'Revive once with 30% HP.',
                descriptionTH: 'ฟื้นคืนชีพ 1 ครั้งด้วย HP 30%',
                baseValue: 30,
                unit: '% revive HP',
                weight: 0.1,
                maxStacks: 1,
                apply: (game, value) => {
                    game.player.hasSecondWind = true;
                    game.player.secondWindHP = value / 100;
                }
            },


            // === MOBILITY CARDS ===
            SPEED_UP: {
                id: 'SPEED_UP',
                name: 'Turbo Engine',
                nameTH: 'เครื่องยนต์เทอร์โบ',
                category: 'MOBILITY',
                description: 'Increases movement speed.',
                descriptionTH: 'เพิ่มความเร็วในการเคลื่อนที่',
                baseValue: 40,
                unit: '',
                weight: 0.6,
                maxStacks: 8,
                apply: (game, value) => { game.player.maxSpeed += value; }
            },

            DASH_COUNT: {
                id: 'DASH_COUNT',
                name: 'Dash Capacitor',
                nameTH: 'ตัวเก็บประจุแดช',
                category: 'MOBILITY',
                description: 'Additional dash charge.',
                descriptionTH: 'เพิ่มจำนวนการแดช',
                baseValue: 1,
                unit: ' dash',
                weight: 0.2,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.dashCount += value;
                    game.player.dashCharges += value;
                }
            },

            DASH_DISTANCE: {
                id: 'DASH_DISTANCE',
                name: 'Extended Thrusters',
                nameTH: 'ไอพ่นระยะไกล',
                category: 'MOBILITY',
                description: 'Increases dash distance.',
                descriptionTH: 'เพิ่มระยะทางแดช',
                baseValue: 25,
                unit: '% distance',
                weight: 0.3,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.dashSpeed += game.player.dashSpeed * (value / 100);
                }
            },

            DASH_COOLDOWN: {
                id: 'DASH_COOLDOWN',
                name: 'Quick Recovery',
                nameTH: 'ฟื้นฟูฉับไว',
                category: 'MOBILITY',
                description: 'Reduces dash cooldown.',
                descriptionTH: 'ลดเวลาคูลดาวน์แดช',
                baseValue: 0.5,
                unit: 's reduction',
                weight: 0.4,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.dashCooldown = Math.max(0.5, game.player.dashCooldown - value);
                }
            },

            DASH_DEFENSE: {
                id: 'DASH_DEFENSE',
                name: 'Phase Shield',
                nameTH: 'เกราะเฟส',
                category: 'MOBILITY',
                description: 'Gain armor after dashing for 3s.',
                descriptionTH: 'ได้รับเกราะเพิ่มขึ้นหลังแดช 3 วินาที',
                baseValue: 10,
                unit: '% armor',
                weight: 0.3,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.dashArmorBonus = (game.player.dashArmorBonus || 0) + value / 100;
                    game.player.hasDashDefense = true;
                }
            },


            // === UTILITY CARDS ===
            MAGNET: {
                id: 'MAGNET',
                name: 'Tractor Beam',
                nameTH: 'ลำแสงดูดจับ',
                category: 'UTILITY',
                description: 'Increases pickup range.',
                descriptionTH: 'เพิ่มระยะการเก็บของ',

                baseValue: 100,
                unit: ' range',
                weight: 0.5,
                maxStacks: 6,
                apply: (game, value) => { game.player.pickupRange += value; }
            },
            DOUBLE_XP: {
                id: 'DOUBLE_XP',
                name: 'Experience Amplifier',
                category: 'UTILITY',
                description: 'Bonus experience gain.',
                baseValue: 25,
                unit: '% XP',
                weight: 0.3,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.expBonus = (game.player.expBonus || 0) + value / 100;
                }
            },
            LUCKY_STAR: {
                id: 'LUCKY_STAR',
                name: 'Lucky Star',
                category: 'UTILITY',
                description: 'Better rarity chances.',
                baseValue: 10,
                unit: '% luck',
                weight: 0.2,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.luck = (game.player.luck || 0) + value / 100;
                }
            },
            WEAPON_SLOT: {
                id: 'WEAPON_SLOT',
                name: 'Weapon Bay',
                nameTH: 'ช่องอาวุธ',
                category: 'UTILITY',
                description: 'Unlock additional weapon slot.',
                descriptionTH: 'ปลดล็อกช่องอาวุธเพิ่มเติม',
                baseValue: 1,
                unit: ' slot',
                weight: 0.08,
                maxStacks: 3,
                apply: (game, value) => {
                    game.weaponSystem.maxWeapons += value;
                }
            },

            SKILL_SLOT: {
                id: 'SKILL_SLOT',
                name: 'Skill Module',
                nameTH: 'ช่องสกิล',
                category: 'UTILITY',
                description: 'Unlock additional active skill slot.',
                descriptionTH: 'ปลดล็อกช่องสกิลเพิ่มเติม',
                baseValue: 1,
                unit: ' slot',
                weight: 0.06,
                maxStacks: 3,
                apply: (game, value) => {
                    game.skillSystem.maxSkills += value;
                    game.spawnFloatingText(game.player.x, game.player.y, "+1 SKILL SLOT", "#ff00ff");
                }
            },

            // === AUTOMATION (MYSTICAL) ===
            AUTO_SHOOT: {
                id: 'AUTO_SHOOT',
                name: 'A.I. Gunner',
                category: 'UTILITY',
                description: 'Your ship fires weapons automatically.',
                baseValue: 1,
                unit: '',
                weight: 0.05,
                maxStacks: 1,
                isMystical: true,
                apply: (game, _value) => {
                    game.player.autoShoot = true;
                    game.spawnFloatingText(game.player.x, game.player.y, "AUTO FIRE ONLINE", "#00f0ff");
                }
            },
            AUTO_AIM: {
                id: 'AUTO_AIM',
                name: 'Smart Targeting',
                category: 'UTILITY',
                description: 'Your ship aims at enemies automatically.',
                baseValue: 1,
                unit: '',
                weight: 0.05,
                maxStacks: 1,
                isMystical: true,
                apply: (game, _value) => {
                    game.player.autoAim = true;
                    game.spawnFloatingText(game.player.x, game.player.y, "TARGETING ONLINE", "#ff00ea");
                }
            },

            // === CONSUMABLE CARDS ===
            FULL_HEAL: {
                id: 'FULL_HEAL',
                name: 'Nanobot Swarm',
                category: 'CONSUMABLE',
                description: 'Restore 50% HP immediately.',
                baseValue: 50,
                unit: '% heal',
                weight: 0.15,
                maxStacks: 999,
                apply: (game, value) => {
                    const healAmt = game.player.maxHp * (value / 100);
                    game.player.hp = Math.min(game.player.hp + healAmt, game.player.maxHp);
                    game.spawnFloatingText(game.player.x, game.player.y, `+${Math.round(healAmt)} HP`, '#00ff00');
                }
            },
            VACUUM: {
                id: 'VACUUM',
                name: 'Singularity Pulse',
                category: 'CONSUMABLE',
                description: 'Collect all gems on screen.',
                baseValue: 1,
                unit: '',
                weight: 0.1,
                maxStacks: 999,
                apply: (game, _value) => {
                    game.gems.forEach((gem: any) => {
                        gem.magnetRange = 99999;
                        gem.speed = 1200;
                    });
                    game.spawnFloatingText(game.player.x, game.player.y, "VACUUM!", '#00f0ff');
                }
            },
            BOMB: {
                id: 'BOMB',
                name: 'Screen Nuke',
                category: 'CONSUMABLE',
                description: 'Damage all enemies on screen.',
                baseValue: 50,
                unit: ' damage',
                weight: 0.08,
                maxStacks: 999,
                apply: (game, value) => {
                    game.enemies.forEach((e: any) => {
                        if (!e.markedForDeletion) {
                            e.takeDamage(value, 'explosive');
                        }
                    });
                    game.spawnFloatingText(game.player.x, game.player.y, "BOOM!", '#ff4400');
                }
            },

            // ============= NEW OFFENSIVE CARDS =============
            EXPLOSIVE_DAMAGE: {
                id: 'EXPLOSIVE_DAMAGE',
                name: 'Explosive Rounds',
                nameTH: 'กระสุนระเบิด',
                category: 'OFFENSIVE',
                description: 'Projectiles explode on hit.',
                descriptionTH: 'กระสุนระเบิดเมื่อโดนศัตรู',
                baseValue: 1,
                unit: ' explosion',
                weight: 0.12,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.explosiveProjectiles = (game.player.explosiveProjectiles || 0) + value;
                }
            },
            BLEED_DAMAGE: {
                id: 'BLEED_DAMAGE',
                name: 'Bleeding Edge',
                nameTH: 'คมมีดเลือด',
                category: 'OFFENSIVE',
                description: 'Projectiles cause bleeding DoT.',
                descriptionTH: 'กระสุนทำให้ศัตรูเลือดไหล',
                baseValue: 5,
                unit: ' dmg/s',
                weight: 0.18,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.bleedDamage = (game.player.bleedDamage || 0) + value;
                }
            },
            PROJECTILE_SIZE: {
                id: 'PROJECTILE_SIZE',
                name: 'Heavy Rounds',
                nameTH: 'กระสุนหนัก',
                category: 'OFFENSIVE',
                description: 'Larger projectiles deal more damage.',
                descriptionTH: 'กระสุนใหญ่ขึ้นสร้างความเสียหายมากขึ้น',
                baseValue: 2,
                unit: ' size',
                weight: 0.25,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.projectileSize = (game.player.projectileSize || 1) + value;
                    game.player.damage += value * 2; // Size = damage
                }
            },
            HOMING: {
                id: 'HOMING',
                name: 'Homing Missiles',
                nameTH: 'มิสไซล์ตามเป้า',
                category: 'OFFENSIVE',
                description: 'Projectiles track enemies.',
                descriptionTH: 'กระสุนตามเป้าหมายอัตโนมัติ',
                baseValue: 1,
                unit: ' homing',
                weight: 0.08,
                maxStacks: 1,
                apply: (game, _value) => {
                    game.player.homingProjectiles = true;
                }
            },
            SPLIT_SHOT: {
                id: 'SPLIT_SHOT',
                name: 'Split Shot',
                nameTH: 'ยิงแยก',
                category: 'OFFENSIVE',
                description: 'Projectiles split on hit.',
                descriptionTH: 'กระสุนแยกเป็น 2 ลูกเมื่อโดนศัตรู',
                baseValue: 1,
                unit: ' split',
                weight: 0.1,
                maxStacks: 2,
                apply: (game, value) => {
                    game.player.splitShot = (game.player.splitShot || 0) + value;
                }
            },
            EXPLOSION_RADIUS: {
                id: 'EXPLOSION_RADIUS',
                name: 'Bigger Boom',
                nameTH: 'ระเบิดใหญ่',
                category: 'OFFENSIVE',
                description: 'Increase explosion radius.',
                descriptionTH: 'เพิ่มรัศมีการระเบิด',
                baseValue: 20,
                unit: ' radius',
                weight: 0.15,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.explosionRadius = (game.player.explosionRadius || 0) + value;
                }
            },

            // ============= NEW DEFENSIVE CARDS =============
            DAMAGE_REDUCTION: {
                id: 'DAMAGE_REDUCTION',
                name: 'Reactive Armor',
                nameTH: 'เกราะปฏิกิริยา',
                category: 'DEFENSIVE',
                description: 'Reduce all incoming damage.',
                descriptionTH: 'ลดความเสียหายที่ได้รับทั้งหมด',
                baseValue: 5,
                unit: '% reduction',
                weight: 0.3,
                maxStacks: 6,
                apply: (game, value) => {
                    game.player.damageReduction = (game.player.damageReduction || 0) + value / 100;
                }
            },
            HEALTH_ON_KILL: {
                id: 'HEALTH_ON_KILL',
                name: 'Vampiric Core',
                nameTH: 'แกนดูดเลือด',
                category: 'DEFENSIVE',
                description: 'Heal on enemy kill.',
                descriptionTH: 'ฟื้นฟู HP เมื่อฆ่าศัตรู',
                baseValue: 5,
                unit: ' HP/kill',
                weight: 0.25,
                maxStacks: 8,
                apply: (game, value) => {
                    game.player.healthOnKill = (game.player.healthOnKill || 0) + value;
                }
            },
            INVULNERABILITY_FRAME: {
                id: 'INVULNERABILITY_FRAME',
                name: 'Phase Shift',
                nameTH: 'เฟสชิฟต์',
                category: 'DEFENSIVE',
                description: 'Brief invulnerability after taking damage.',
                descriptionTH: 'อมตะชั่วคราวหลังได้รับความเสียหาย',
                baseValue: 0.5,
                unit: 's invuln',
                weight: 0.2,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.invulnFrameDuration = (game.player.invulnFrameDuration || 0) + value;
                }
            },
            REFLECT_DAMAGE: {
                id: 'REFLECT_DAMAGE',
                name: 'Thorn Shield',
                nameTH: 'โล่หนาม',
                category: 'DEFENSIVE',
                description: 'Reflect damage back to attackers.',
                descriptionTH: 'สะท้อนความเสียหายกลับไปยังผู้โจมตี',
                baseValue: 20,
                unit: '% reflect',
                weight: 0.15,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.reflectDamage = (game.player.reflectDamage || 0) + value / 100;
                }
            },
            SHIELD_OVERLOAD: {
                id: 'SHIELD_OVERLOAD',
                name: 'Shield Overload',
                nameTH: 'โล่โอเวอร์โหลด',
                category: 'DEFENSIVE',
                description: 'Shield regenerates faster.',
                descriptionTH: 'โล่ฟื้นฟูเร็วขึ้น',
                baseValue: 2,
                unit: 's faster',
                weight: 0.2,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.shieldRegenSpeed = (game.player.shieldRegenSpeed || 0) + value;
                }
            },

            // ============= NEW MOBILITY CARDS =============
            AIR_DASH: {
                id: 'AIR_DASH',
                name: 'Air Dash',
                nameTH: 'แดชกลางอากาศ',
                category: 'MOBILITY',
                description: 'Can dash in any direction mid-air.',
                descriptionTH: 'สามารถแดชได้ทุกทิศทางกลางอากาศ',
                baseValue: 1,
                unit: ' air dash',
                weight: 0.15,
                maxStacks: 1,
                apply: (game, _value) => {
                    game.player.hasAirDash = true;
                }
            },
            MOMENTUM: {
                id: 'MOMENTUM',
                name: 'Momentum',
                nameTH: 'โมเมนตัม',
                category: 'MOBILITY',
                description: 'Maintain speed after dashing.',
                descriptionTH: 'รักษาความเร็วหลังแดช',
                baseValue: 0.5,
                unit: 's duration',
                weight: 0.2,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.momentumDuration = (game.player.momentumDuration || 0) + value;
                }
            },
            WALL_CLIMB: {
                id: 'WALL_CLIMB',
                name: 'Wall Climb',
                nameTH: 'ปีนผนัง',
                category: 'MOBILITY',
                description: 'Can move along screen edges.',
                descriptionTH: 'สามารถเคลื่อนที่ตามขอบหน้าจอได้',
                baseValue: 1,
                unit: '',
                weight: 0.1,
                maxStacks: 1,
                apply: (game, _value) => {
                    game.player.canWallClimb = true;
                }
            },
            DASH_DAMAGE: {
                id: 'DASH_DAMAGE',
                name: 'Dash Strike',
                nameTH: 'แดชสไตรค์',
                category: 'MOBILITY',
                description: 'Deal damage while dashing.',
                descriptionTH: 'สร้างความเสียหายขณะแดช',
                baseValue: 30,
                unit: ' damage',
                weight: 0.25,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.dashDamage = (game.player.dashDamage || 0) + value;
                }
            },

            // ============= NEW UTILITY CARDS =============
            GEM_MULTIPLIER: {
                id: 'GEM_MULTIPLIER',
                name: 'Gem Collector',
                nameTH: 'นักสะสมอัญมณี',
                category: 'UTILITY',
                description: 'Gems worth more XP.',
                descriptionTH: 'อัญมณีให้ XP มากขึ้น',
                baseValue: 25,
                unit: '% more XP',
                weight: 0.35,
                maxStacks: 6,
                apply: (game, value) => {
                    game.player.gemMultiplier = (game.player.gemMultiplier || 1) + value / 100;
                }
            },
            COIN_MULTIPLIER: {
                id: 'COIN_MULTIPLIER',
                name: 'Treasure Hunter',
                nameTH: 'นักล่าสมบัติ',
                category: 'UTILITY',
                description: 'Coins worth more.',
                descriptionTH: 'เหรียญมีค่ามากขึ้น',
                baseValue: 20,
                unit: '% more coins',
                weight: 0.3,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.coinMultiplier = (game.player.coinMultiplier || 1) + value / 100;
                }
            },
            SKILL_COOLDOWN: {
                id: 'SKILL_COOLDOWN',
                name: 'Rapid Skills',
                nameTH: 'สกิลเร็ว',
                category: 'UTILITY',
                description: 'Reduce skill cooldowns.',
                descriptionTH: 'ลดคูลดาวน์สกิล',
                baseValue: 10,
                unit: '% faster',
                weight: 0.2,
                maxStacks: 5,
                apply: (game, value) => {
                    game.player.skillCooldownReduction = (game.player.skillCooldownReduction || 0) + value / 100;
                }
            },
            WEAPON_COOLDOWN: {
                id: 'WEAPON_COOLDOWN',
                name: 'Weapon Efficiency',
                nameTH: 'ประสิทธิภาพอาวุธ',
                category: 'UTILITY',
                description: 'Weapons fire faster.',
                descriptionTH: 'อาวุธยิงเร็วขึ้น',
                baseValue: 15,
                unit: '% faster',
                weight: 0.25,
                maxStacks: 4,
                apply: (game, value) => {
                    game.player.weaponFireRateBonus = (game.player.weaponFireRateBonus || 0) + value / 100;
                }
            },
            DOUBLE_UPGRADE: {
                id: 'DOUBLE_UPGRADE',
                name: 'Double Pick',
                nameTH: 'เลือกสอง',
                category: 'UTILITY',
                description: 'Choose 2 upgrades per level.',
                descriptionTH: 'เลือกอัพเกรด 2 อย่างต่อเลเวล',
                baseValue: 1,
                unit: ' extra pick',
                weight: 0.05,
                maxStacks: 1,
                isMystical: true,
                apply: (game, value) => {
                    game.player.extraUpgradePicks = (game.player.extraUpgradePicks || 0) + value;
                }
            },
            REROLL_COINS: {
                id: 'REROLL_COINS',
                name: 'Reroll Discount',
                nameTH: 'ส่วนลดรีโรล',
                category: 'UTILITY',
                description: 'Reroll costs less.',
                descriptionTH: 'ค่าใช้จ่ายรีโรลลดลง',
                baseValue: 25,
                unit: '% cheaper',
                weight: 0.15,
                maxStacks: 3,
                apply: (game, value) => {
                    game.player.rerollDiscount = (game.player.rerollDiscount || 0) + value / 100;
                }
            },

            // ============= NEW CONSUMABLE CARDS =============
            FULL_MANA: {
                id: 'FULL_MANA',
                name: 'Energy Boost',
                category: 'CONSUMABLE',
                description: 'Restore all energy immediately.',
                baseValue: 100,
                unit: '% energy',
                weight: 0.12,
                maxStacks: 999,
                apply: (game, _value) => {
                    game.player.energy = game.player.maxEnergy;
                    game.spawnFloatingText(game.player.x, game.player.y, "ENERGY FULL!", '#00f0ff');
                }
            },
            TIME_FREEZE: {
                id: 'TIME_FREEZE',
                name: 'Time Freeze',
                category: 'CONSUMABLE',
                description: 'Freeze all enemies for 3 seconds.',
                baseValue: 3,
                unit: 's freeze',
                weight: 0.1,
                maxStacks: 999,
                apply: (game, value) => {
                    game.enemies.forEach((e: any) => {
                        if (!e.markedForDeletion) e.freeze(value);
                    });
                    game.spawnFloatingText(game.player.x, game.player.y, "TIME FROZEN!", '#ffffff');
                }
            },
            MASS_HEAL: {
                id: 'MASS_HEAL',
                name: 'Mass Heal',
                category: 'CONSUMABLE',
                description: 'Heal 100% HP instantly.',
                baseValue: 100,
                unit: '% heal',
                weight: 0.08,
                maxStacks: 999,
                apply: (game, _value) => {
                    const healAmt = game.player.maxHp;
                    game.player.hp = game.player.maxHp;
                    game.spawnFloatingText(game.player.x, game.player.y, `+${Math.round(healAmt)} HP`, '#00ff00');
                }
            },
        };

        // Rarity definitions (7 tiers)
        this.rarities = [
            { name: 'Common', multiplier: 1, color: '#ffffff', weight: 55 },
            { name: 'Uncommon', multiplier: 1.5, color: '#00ff00', weight: 28 },
            { name: 'Rare', multiplier: 2.5, color: '#00ccff', weight: 10 },
            { name: 'Epic', multiplier: 4, color: '#a335ee', weight: 4.5 },
            { name: 'Legendary', multiplier: 7, color: '#ff8000', weight: 2 },
            { name: 'Mythic', multiplier: 12, color: '#ff00aa', weight: 0.4 },
            { name: 'God', multiplier: 20, color: '#ffff00', weight: 0.1 }
        ];

        // Special rarities (Not in standard rotation)
        this.mysticalRarity = { name: 'Mystical', multiplier: 1, color: '#ff00ea' };
        // this._bossRarity = { name: 'Boss', multiplier: 15, color: '#ff0044' };

        // Player's acquired cards (for stacking)
        this.acquiredCards = {}; // { cardId: stackCount }
    }

    generateCard(): any {
        // Roll rarity
        const luck = this.game.player.luck || 0;
        const rarity = this.rollRarity(luck);

        // Pick a card based on weights
        // Filter out maxed cards upfront
        const cardList = Object.values(this.cardDefinitions).filter(c => {
            if (c.isMystical) return false;

            // Check max stacks (SKIP CONSUMABLES from this check if they have no limit, but here they do have stacks in logic)
            // Actually, consumables like 'Heal' might not have a hard limit?
            // Existing logic checked: currentStacks >= maxStacks && category !== 'CONSUMABLE'

            const currentStacks = this.acquiredCards[c.id] || 0;
            if (c.category !== 'CONSUMABLE' && currentStacks >= c.maxStacks) {
                return false;
            }
            return true;
        });

        // Fallback: If ALL cards are maxed, return a consumable (Heal) or just coin
        if (cardList.length === 0) {
            // Return a small heal or coin reward if nothing left
            return {
                ...this.cardDefinitions['QUICK_HEAL'] || this.cardDefinitions['DAMAGE_UP'], // Fallback
                displayName: "Maxed Out Reward (Heal)",
                value: 20,
                apply: (g: any) => { g.player.hp = Math.min(g.player.maxHp, g.player.hp + 20); }
            };
        }

        const totalWeight = cardList.reduce((sum, c) => sum + c.weight, 0);

        let roll = Math.random() * totalWeight;
        let selectedCard = cardList[0];

        for (const card of cardList) {
            roll -= card.weight;
            if (roll <= 0) {
                selectedCard = card;
                break;
            }
        }

        // Check max stacks - Logic moved to filter above, so we are safe here.
        // const currentStacks = this.acquiredCards[selectedCard.id] || 0;
        // if (currentStacks >= selectedCard.maxStacks && selectedCard.category !== 'CONSUMABLE') {
        //    // Reroll if maxed
        //    return this.generateCard();
        // }

        // Calculate value with rarity multiplier
        const variance = 0.8 + Math.random() * 0.4;
        let value = selectedCard.baseValue * rarity.multiplier * variance;

        // Round nicely
        if (selectedCard.baseValue >= 1 && !selectedCard.unit.includes('%')) {
            value = Math.round(value);
        } else {
            value = Math.round(value * 10) / 10;
        }

        // Map Rarity to Tier (7 Tiers)
        const tierMap: any = {
            'Common': 'I',
            'Uncommon': 'II',
            'Rare': 'III',
            'Epic': 'IV',
            'Legendary': 'V',
            'Mythic': 'VI',
            'God': 'VII',
            'Boss': 'BOSS',
            'Mystical': '✦'
        };
        const tier = tierMap[rarity.name] || 'I';

        const isTH = this.game.ui?.currentLocale === 'TH';
        const name = isTH && selectedCard.nameTH ? selectedCard.nameTH : selectedCard.name;
        // Base description
        let desc = isTH && selectedCard.descriptionTH ? selectedCard.descriptionTH : selectedCard.description;

        // Append explicit value to description
        // e.g. "Increases projectile damage." -> "Increases projectile damage. <br> (+12 DMG)"
        if (selectedCard.category !== 'CONSUMABLE' && value > 0) {
            const color = '#00ff00';
            desc += `<br><span style="color:${color}">(+${value}${selectedCard.unit})</span>`;
        } else if (selectedCard.category === 'CONSUMABLE') {
            const color = '#00f0ff';
            // Consumables usually have fixed descriptions, but we can append value if dynamic
            // e.g. "Heal 50% HP" -> "Heal 50% HP (+500 HP)" if we wanted, but let's stick to unit for now
            desc += `<br><span style="color:${color}">(Action: ${value}${selectedCard.unit})</span>`;
        }

        return {
            ...selectedCard,
            rarity: rarity,
            value: value,
            tier: tier,
            // Combined display name
            displayName: `${rarity.name} ${name} [Tier ${tier}]`,
            // Store localized properties for UI to use raw if needed
            nameDisplay: name,
            descriptionDisplay: desc,
            description: desc, // Ensure UI uses dynamic description
            apply: (game: any) => {
                selectedCard.apply(game, value);

                if (selectedCard.category !== 'CONSUMABLE') {
                    this.acquiredCards[selectedCard.id] = (this.acquiredCards[selectedCard.id] || 0) + 1;
                }

                // Log to upgrade history
                game.acquiredUpgrades.push({
                    name: `${rarity.name} ${name} [Tier ${tier}]`,
                    color: rarity.color
                });

                // Check for synergies
                if (game.synergySystem) {
                    game.synergySystem.checkSynergies();
                }
            }
        };
    }

    generateMysticalCard(typeId: string | null = null): any {
        let cardDef = null;
        if (typeId && this.cardDefinitions[typeId]) {
            cardDef = this.cardDefinitions[typeId];
        } else {
            const mysticalCards = Object.values(this.cardDefinitions).filter(c => c.isMystical);
            cardDef = mysticalCards[Math.floor(Math.random() * mysticalCards.length)];
        }

        return {
            ...cardDef,
            rarity: this.mysticalRarity,
            value: cardDef.baseValue,
            displayName: `Mystical ${cardDef.name}`,
            apply: (game: any) => {
                cardDef.apply(game, cardDef.baseValue);
                this.acquiredCards[cardDef.id] = (this.acquiredCards[cardDef.id] || 0) + 1;
                game.acquiredUpgrades.push({
                    name: `Mystical ${cardDef.name}`,
                    color: this.mysticalRarity.color
                });
            }
        };
    }

    generateRandomUpgrade(count = 1): any[] {
        // Used for secret boss reward
        let rewards = [];
        for (let i = 0; i < count; i++) {
            // Mix of Mystical Cards and High Tier Skills
            if (Math.random() < 0.5) {
                rewards.push(this.generateMysticalCard());
            } else {
                // Or we could delegate to Game.js to get boss skill drop. 
                // For now let's just use mystical cards here
                rewards.push(this.generateMysticalCard());
            }
        }
        return rewards;
    }

    rollRarity(luckBonus = 0): CardRarity {
        // Adjust weights based on luck
        const adjustedRarities = this.rarities.map(r => ({
            ...r,
            weight: r.name === 'Common' ? (r.weight || 0) * (1 - luckBonus) : (r.weight || 0) * (1 + luckBonus)
        }));

        const totalWeight = adjustedRarities.reduce((sum, r) => sum + r.weight, 0);
        let roll = Math.random() * totalWeight;

        for (const rarity of adjustedRarities) {
            roll -= rarity.weight;
            if (roll <= 0) return rarity;
        }

        return this.rarities[0];
    }

    getCardsByCategory(category: string): CardDefinition[] {
        return Object.values(this.cardDefinitions).filter(c => c.category === category);
    }

    reset(): void {
        this.acquiredCards = {};
    }
}
