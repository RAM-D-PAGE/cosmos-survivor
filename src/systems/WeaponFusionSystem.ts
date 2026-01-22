/**
 * Weapon Fusion System
 * ระบบรวมอาวุธ 2 ชิ้นเป็น 1
 */

export interface FusionRecipe {
    id: string;
    name: string;
    nameTH?: string;
    description: string;
    descriptionTH?: string;
    weapon1Types: string[]; // Weapon types that can be fused
    weapon2Types: string[];
    resultType: string;
    resultName: string;
    resultColor: string;
    damageMultiplier: number; // Multiplier for combined damage
    fireRateMultiplier: number;
    rangeMultiplier: number;
    cost: number; // Coins required
}

export class WeaponFusionSystem {
    private game: any;
    public fusionRecipes: FusionRecipe[] = [];

    constructor(game: any) {
        this.game = game;
        this.initializeRecipes();
    }

    /**
     * Initialize fusion recipes
     */
    private initializeRecipes(): void {
        this.fusionRecipes = [
            {
                id: 'FUSION_ORBITAL_TURRET',
                name: 'Orbital Turret',
                nameTH: 'ป้อมปืนโคจร',
                description: 'Fuse ORBITAL + TURRET = Powerful orbiting turret',
                descriptionTH: 'รวม ORBITAL + TURRET = ป้อมปืนโคจรทรงพลัง',
                weapon1Types: ['ORBITAL'],
                weapon2Types: ['TURRET'],
                resultType: 'ORBITAL_TURRET',
                resultName: 'Orbital Turret',
                resultColor: '#00ffff',
                damageMultiplier: 1.5,
                fireRateMultiplier: 1.2,
                rangeMultiplier: 1.3,
                cost: 100
            },
            {
                id: 'FUSION_SEEKER_EXPLOSIVE',
                name: 'Seeker Missile',
                nameTH: 'มิสไซล์ตามเป้า',
                description: 'Fuse SEEKER + EXPLOSIVE = Homing explosive missiles',
                descriptionTH: 'รวม SEEKER + EXPLOSIVE = มิสไซล์ระเบิดตามเป้า',
                weapon1Types: ['SEEKER'],
                weapon2Types: ['EXPLOSIVE'],
                resultType: 'SEEKER_MISSILE',
                resultName: 'Seeker Missile',
                resultColor: '#ff4400',
                damageMultiplier: 1.8,
                fireRateMultiplier: 0.9,
                rangeMultiplier: 1.5,
                cost: 150
            },
            {
                id: 'FUSION_FREEZE_POISON',
                name: 'Toxic Freeze',
                nameTH: 'แช่แข็งพิษ',
                description: 'Fuse FREEZE + POISON = Freezing poison shots',
                descriptionTH: 'รวม FREEZE + POISON = กระสุนแช่แข็งพิษ',
                weapon1Types: ['FREEZE'],
                weapon2Types: ['POISON'],
                resultType: 'TOXIC_FREEZE',
                resultName: 'Toxic Freeze',
                resultColor: '#00ff88',
                damageMultiplier: 1.3,
                fireRateMultiplier: 1.1,
                rangeMultiplier: 1.2,
                cost: 120
            },
            {
                id: 'FUSION_LASER_BEAM',
                name: 'Laser Beam',
                nameTH: 'ลำแสงเลเซอร์',
                description: 'Fuse LASER + BEAM = Continuous piercing laser',
                descriptionTH: 'รวม LASER + BEAM = เลเซอร์ทะลุต่อเนื่อง',
                weapon1Types: ['LASER'],
                weapon2Types: ['BEAM'],
                resultType: 'LASER_BEAM',
                resultName: 'Laser Beam',
                resultColor: '#ff00ff',
                damageMultiplier: 2.0,
                fireRateMultiplier: 1.0,
                rangeMultiplier: 1.8,
                cost: 200
            },
            {
                id: 'FUSION_SHOTGUN_MINIGUN',
                name: 'Gatling Shotgun',
                nameTH: 'ปืนสั้นแกตลิ่ง',
                description: 'Fuse SHOTGUN + MINIGUN = Rapid spread fire',
                descriptionTH: 'รวม SHOTGUN + MINIGUN = ยิงกระจายเร็ว',
                weapon1Types: ['SHOTGUN'],
                weapon2Types: ['MINIGUN'],
                resultType: 'GATLING_SHOTGUN',
                resultName: 'Gatling Shotgun',
                resultColor: '#ffff00',
                damageMultiplier: 1.4,
                fireRateMultiplier: 1.6,
                rangeMultiplier: 1.1,
                cost: 180
            },
            {
                id: 'FUSION_HEALER_ORBITAL',
                name: 'Healing Orbital',
                nameTH: 'โคจรรักษา',
                description: 'Fuse HEALER + ORBITAL = Healing orbital drone',
                descriptionTH: 'รวม HEALER + ORBITAL = ดรอนโคจรรักษา',
                weapon1Types: ['HEALER'],
                weapon2Types: ['ORBITAL'],
                resultType: 'HEALING_ORBITAL',
                resultName: 'Healing Orbital',
                resultColor: '#00ff00',
                damageMultiplier: 0.8, // Lower damage, but heals
                fireRateMultiplier: 1.5,
                rangeMultiplier: 1.2,
                cost: 130
            },
            {
                id: 'FUSION_SNIPER_EXPLOSIVE',
                name: 'Explosive Sniper',
                nameTH: 'สไนเปอร์ระเบิด',
                description: 'Fuse SNIPER + EXPLOSIVE = High damage explosive shots',
                descriptionTH: 'รวม SNIPER + EXPLOSIVE = กระสุนระเบิดดาเมจสูง',
                weapon1Types: ['SNIPER'],
                weapon2Types: ['EXPLOSIVE'],
                resultType: 'EXPLOSIVE_SNIPER',
                resultName: 'Explosive Sniper',
                resultColor: '#ff8800',
                damageMultiplier: 2.5,
                fireRateMultiplier: 0.7,
                rangeMultiplier: 1.6,
                cost: 250
            },
            {
                id: 'FUSION_ORBIT_BLADE_MISSILE',
                name: 'Blade Missile',
                nameTH: 'มิสไซล์ดาบ',
                description: 'Fuse ORBIT_BLADE + MISSILE = Spinning blade missiles',
                descriptionTH: 'รวม ORBIT_BLADE + MISSILE = มิสไซล์ดาบหมุน',
                weapon1Types: ['ORBIT_BLADE'],
                weapon2Types: ['MISSILE'],
                resultType: 'BLADE_MISSILE',
                resultName: 'Blade Missile',
                resultColor: '#aa00ff',
                damageMultiplier: 1.7,
                fireRateMultiplier: 1.0,
                rangeMultiplier: 1.4,
                cost: 220
            }
        ];
    }

    /**
     * Check if two weapons can be fused
     */
    canFuse(weapon1: any, weapon2: any): FusionRecipe | null {
        if (!weapon1 || !weapon2) return null;
        if (weapon1 === weapon2) return null; // Can't fuse with itself

        const type1 = weapon1.config?.type || weapon1.type;
        const type2 = weapon2.config?.type || weapon2.type;

        for (const recipe of this.fusionRecipes) {
            const match1 = recipe.weapon1Types.includes(type1) && recipe.weapon2Types.includes(type2);
            const match2 = recipe.weapon1Types.includes(type2) && recipe.weapon2Types.includes(type1);
            
            if (match1 || match2) {
                return recipe;
            }
        }

        return null;
    }

    /**
     * Fuse two weapons into one
     */
    fuseWeapons(weapon1: any, weapon2: any): boolean {
        const recipe = this.canFuse(weapon1, weapon2);
        if (!recipe) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "CANNOT FUSE THESE WEAPONS!",
                '#ff0000'
            );
            return false;
        }

        // Check if player has enough coins
        if (this.game.stateManager.coins < recipe.cost) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                `NEED ${recipe.cost} COINS!`,
                '#ff0000'
            );
            return false;
        }

        // Get weapon stats
        const dmg1 = weapon1.damage || weapon1.config?.damage || 10;
        const dmg2 = weapon2.damage || weapon2.config?.damage || 10;
        const fr1 = weapon1.config?.fireRate || weapon1.fireRate || 1.0;
        const fr2 = weapon2.config?.fireRate || weapon2.fireRate || 1.0;
        const range1 = weapon1.config?.range || weapon1.range || 300;
        const range2 = weapon2.config?.range || weapon2.range || 300;

        // Calculate fused stats
        const avgDamage = (dmg1 + dmg2) / 2;
        const avgFireRate = (fr1 + fr2) / 2;
        const avgRange = (range1 + range2) / 2;

        const fusedDamage = Math.floor(avgDamage * recipe.damageMultiplier);
        const fusedFireRate = avgFireRate * recipe.fireRateMultiplier;
        const fusedRange = Math.floor(avgRange * recipe.rangeMultiplier);

        // Remove old weapons
        const index1 = this.game.weaponSystem.activeWeapons.indexOf(weapon1);
        const index2 = this.game.weaponSystem.activeWeapons.indexOf(weapon2);
        
        if (index1 !== -1) this.game.weaponSystem.activeWeapons.splice(index1, 1);
        if (index2 !== -1 && index2 !== index1) {
            const adjustedIndex = index2 > index1 ? index2 - 1 : index2;
            this.game.weaponSystem.activeWeapons.splice(adjustedIndex, 1);
        }

        // Create fused weapon config
        const fusedConfig = this.game.weaponSystem.createConfig(
            recipe.resultType,
            fusedDamage,
            fusedFireRate,
            fusedRange,
            recipe.resultColor,
            recipe.resultName
        );

        // Install fused weapon
        this.game.weaponSystem.installWeapon(fusedConfig);

        // Deduct coins
        this.game.stateManager.coins -= recipe.cost;
        if (this.game.ui) {
            this.game.ui.updateCoins(this.game.stateManager.coins);
        }

        // Visual effect
        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `FUSED: ${recipe.resultName}!`,
            recipe.resultColor
        );
        this.game.spawnParticles(this.game.player.x, this.game.player.y, 30, recipe.resultColor);
        this.game.audio?.playUpgrade?.();

        return true;
    }

    /**
     * Get all available fusion recipes
     */
    getAvailableRecipes(): FusionRecipe[] {
        return this.fusionRecipes;
    }

    /**
     * Get recipe by ID
     */
    getRecipe(recipeId: string): FusionRecipe | undefined {
        return this.fusionRecipes.find(r => r.id === recipeId);
    }
}
