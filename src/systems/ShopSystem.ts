/**
 * Shop System
 * ระบบร้านค้าสำหรับใช้เหรียญซื้ออัพเกรด
 */

export interface ShopItem {
    id: string;
    name: string;
    nameTH?: string;
    description: string;
    descriptionTH?: string;
    price: number;
    category: 'UPGRADE' | 'SKILL' | 'WEAPON' | 'CONSUMABLE' | 'PERMANENT';
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'GOD';
    icon?: string;
    apply: (game: any) => void;
    maxPurchases?: number; // -1 for unlimited
    currentPurchases?: number;
}

export class ShopSystem {
    private game: any;
    private shopItems: ShopItem[] = [];
    private purchasedItems: Map<string, number> = new Map();

    constructor(game: any) {
        this.game = game;
        this.initializeShopItems();
    }

    public getPurchasedCount(itemId: string): number {
        return this.purchasedItems.get(itemId) || 0;
    }

    /**
     * Initialize all shop items
     */
    private initializeShopItems(): void {
        this.shopItems = [
            // ============= UPGRADE ITEMS =============
            {
                id: 'SHOP_DAMAGE_BOOST',
                name: 'Damage Boost',
                nameTH: 'เพิ่มดาเมจ',
                description: 'Permanently increase damage by 20',
                descriptionTH: 'เพิ่มดาเมจถาวร 20',
                price: 50,
                category: 'UPGRADE',
                rarity: 'COMMON',
                maxPurchases: 10,
                apply: (game) => {
                    game.player.damage += 20;
                    game.spawnFloatingText(game.player.x, game.player.y, "+20 DMG", '#ff0000');
                }
            },
            {
                id: 'SHOP_HP_BOOST',
                name: 'HP Boost',
                nameTH: 'เพิ่ม HP',
                description: 'Permanently increase max HP by 50',
                descriptionTH: 'เพิ่ม HP สูงสุดถาวร 50',
                price: 50,
                category: 'UPGRADE',
                rarity: 'COMMON',
                maxPurchases: 10,
                apply: (game) => {
                    game.player.maxHp += 50;
                    game.player.hp += 50;
                    game.spawnFloatingText(game.player.x, game.player.y, "+50 HP", '#00ff00');
                }
            },
            {
                id: 'SHOP_SPEED_BOOST',
                name: 'Speed Boost',
                nameTH: 'เพิ่มความเร็ว',
                description: 'Permanently increase speed by 30',
                descriptionTH: 'เพิ่มความเร็วถาวร 30',
                price: 50,
                category: 'UPGRADE',
                rarity: 'COMMON',
                maxPurchases: 10,
                apply: (game) => {
                    game.player.maxSpeed += 30;
                    game.spawnFloatingText(game.player.x, game.player.y, "+30 SPD", '#00ffff');
                }
            },
            {
                id: 'SHOP_FIRE_RATE_BOOST',
                name: 'Fire Rate Boost',
                nameTH: 'เพิ่มอัตราการยิง',
                description: 'Permanently increase fire rate by 0.5',
                descriptionTH: 'เพิ่มอัตราการยิงถาวร 0.5',
                price: 75,
                category: 'UPGRADE',
                rarity: 'UNCOMMON',
                maxPurchases: 8,
                apply: (game) => {
                    game.player.baseFireRate += 0.5;
                    game.spawnFloatingText(game.player.x, game.player.y, "+0.5 FR", '#ffff00');
                }
            },
            {
                id: 'SHOP_CRIT_BOOST',
                name: 'Critical Boost',
                nameTH: 'เพิ่มคริติคอล',
                description: 'Permanently increase crit chance by 5%',
                descriptionTH: 'เพิ่มโอกาสคริติคอลถาวร 5%',
                price: 100,
                category: 'UPGRADE',
                rarity: 'RARE',
                maxPurchases: 5,
                apply: (game) => {
                    game.player.critChance = (game.player.critChance || 0) + 0.05;
                    game.spawnFloatingText(game.player.x, game.player.y, "+5% CRIT", '#ff00ff');
                }
            },

            // ============= SKILL ITEMS =============
            {
                id: 'SHOP_SKILL_SLOT',
                name: 'Skill Slot',
                nameTH: 'ช่องสกิล',
                description: 'Unlock an additional skill slot',
                descriptionTH: 'ปลดล็อคช่องสกิลเพิ่มเติม',
                price: 200,
                category: 'PERMANENT',
                rarity: 'EPIC',
                maxPurchases: 2,
                apply: (game) => {
                    game.skillSystem.maxSkills += 1;
                    game.spawnFloatingText(game.player.x, game.player.y, "SKILL SLOT +1", '#ff00ff');
                }
            },
            {
                id: 'SHOP_SKILL_COOLDOWN_REDUCE',
                name: 'Skill Cooldown Reduction',
                nameTH: 'ลดคูลดาวน์สกิล',
                description: 'Reduce all skill cooldowns by 10%',
                descriptionTH: 'ลดคูลดาวน์สกิลทั้งหมด 10%',
                price: 150,
                category: 'PERMANENT',
                rarity: 'RARE',
                maxPurchases: 5,
                apply: (game) => {
                    game.player.skillCooldownReduction = (game.player.skillCooldownReduction || 0) + 0.1;
                    game.spawnFloatingText(game.player.x, game.player.y, "-10% CD", '#00ffff');
                }
            },

            // ============= WEAPON ITEMS =============
            {
                id: 'SHOP_WEAPON_SLOT',
                name: 'Weapon Slot',
                nameTH: 'ช่องอาวุธ',
                description: 'Unlock an additional weapon slot',
                descriptionTH: 'ปลดล็อคช่องอาวุธเพิ่มเติม',
                price: 250,
                category: 'PERMANENT',
                rarity: 'EPIC',
                maxPurchases: 3,
                apply: (game) => {
                    game.weaponSystem.maxWeapons += 1;
                    game.spawnFloatingText(game.player.x, game.player.y, "WEAPON SLOT +1", '#00ff00');
                }
            },
            {
                id: 'SHOP_WEAPON_UPGRADE',
                name: 'Weapon Upgrade',
                nameTH: 'อัพเกรดอาวุธ',
                description: 'Upgrade all active weapons by 1 level',
                descriptionTH: 'อัพเกรดอาวุธทั้งหมด 1 ระดับ',
                price: 100,
                category: 'WEAPON',
                rarity: 'RARE',
                maxPurchases: -1,
                apply: (game) => {
                    game.weaponSystem.activeWeapons.forEach((w: any) => {
                        game.weaponSystem.upgradeWeapon(w);
                    });
                    game.spawnFloatingText(game.player.x, game.player.y, "ALL WEAPONS +1", '#ffff00');
                }
            },

            // ============= CONSUMABLE ITEMS =============
            {
                id: 'SHOP_FULL_HEAL',
                name: 'Full Heal Potion',
                nameTH: 'ยาฟื้นฟูเต็ม',
                description: 'Restore 100% HP immediately',
                descriptionTH: 'ฟื้นฟู HP 100% ทันที',
                price: 30,
                category: 'CONSUMABLE',
                rarity: 'COMMON',
                maxPurchases: -1,
                apply: (game) => {
                    game.player.hp = game.player.maxHp;
                    game.spawnFloatingText(game.player.x, game.player.y, "FULL HEAL", '#00ff00');
                }
            },
            {
                id: 'SHOP_EXP_BOOST',
                name: 'EXP Boost',
                nameTH: 'เพิ่ม EXP',
                description: 'Gain 500 EXP immediately',
                descriptionTH: 'ได้รับ EXP 500 ทันที',
                price: 40,
                category: 'CONSUMABLE',
                rarity: 'COMMON',
                maxPurchases: -1,
                apply: (game) => {
                    game.addExp(500);
                    game.spawnFloatingText(game.player.x, game.player.y, "+500 EXP", '#ffff00');
                }
            },
            {
                id: 'SHOP_REROLL',
                name: 'Reroll Token',
                nameTH: 'โทเค็นรีโรล',
                description: 'Reroll upgrade choices (can use during level up)',
                descriptionTH: 'รีโรลตัวเลือกอัพเกรด (ใช้ได้ตอนเลเวลอัพ)',
                price: 25,
                category: 'CONSUMABLE',
                rarity: 'COMMON',
                maxPurchases: -1,
                apply: (game) => {
                    // Store reroll token
                    game.rerollTokens = (game.rerollTokens || 0) + 1;
                    game.spawnFloatingText(game.player.x, game.player.y, "+1 REROLL", '#00ffff');
                }
            },
            {
                id: 'SHOP_LUCKY_BOX',
                name: 'Lucky Box',
                nameTH: 'กล่องโชคดี',
                description: 'Random rare card or skill',
                descriptionTH: 'การ์ดหรือสกิลหายากแบบสุ่ม',
                price: 150,
                category: 'CONSUMABLE',
                rarity: 'RARE',
                maxPurchases: -1,
                apply: (game) => {
                    // 50% chance for card, 50% for skill
                    if (Math.random() < 0.5) {
                        const card = game.cardSystem.generateCard();
                        card.apply(game);
                    } else {
                        const skills = Object.keys(game.skillSystem.skillDefinitions);
                        const randomSkill = skills[Math.floor(Math.random() * skills.length)];
                        game.skillSystem.equipSkill(randomSkill);
                    }
                    game.spawnFloatingText(game.player.x, game.player.y, "LUCKY BOX!", '#ff00ff');
                }
            },

            // ============= PERMANENT UPGRADES =============
            {
                id: 'SHOP_STARTING_BONUS',
                name: 'Starting Bonus',
                nameTH: 'โบนัสเริ่มเกม',
                description: 'Start each run with +100 HP and +10 Damage',
                descriptionTH: 'เริ่มเกมแต่ละครั้งด้วย HP +100 และดาเมจ +10',
                price: 500,
                category: 'PERMANENT',
                rarity: 'LEGENDARY',
                maxPurchases: 1,
                apply: (game) => {
                    // This would be saved to player profile
                    game.player.hasStartingBonus = true;
                    game.spawnFloatingText(game.player.x, game.player.y, "PERMANENT BONUS!", '#ffff00');
                }
            },
            {
                id: 'SHOP_COIN_MULTIPLIER',
                name: 'Coin Multiplier',
                nameTH: 'ตัวคูณเหรียญ',
                description: 'Earn 25% more coins from enemies',
                descriptionTH: 'ได้รับเหรียญเพิ่ม 25% จากศัตรู',
                price: 300,
                category: 'PERMANENT',
                rarity: 'EPIC',
                maxPurchases: 1,
                apply: (game) => {
                    game.player.coinMultiplier = (game.player.coinMultiplier || 1) + 0.25;
                    game.spawnFloatingText(game.player.x, game.player.y, "+25% COINS", '#ffaa00');
                }
            },
        ];
    }

    /**
     * Get available shop items (filtered by max purchases)
     */
    getAvailableItems(): ShopItem[] {
        return this.shopItems.filter(item => {
            const purchases = this.purchasedItems.get(item.id) || 0;
            if (item.maxPurchases === -1) return true;
            return purchases < item.maxPurchases;
        });
    }

    /**
     * Purchase an item
     */
    purchaseItem(itemId: string): boolean {
        const item = this.shopItems.find(i => i.id === itemId);
        if (!item) return false;

        const purchases = this.purchasedItems.get(itemId) || 0;
        if (item.maxPurchases !== -1 && purchases >= item.maxPurchases) {
            return false; // Already maxed out
        }

        if (this.game.stateManager.coins < item.price) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "NOT ENOUGH COINS!",
                '#ff0000'
            );
            return false;
        }

        // Deduct coins
        this.game.stateManager.coins -= item.price;
        this.game.ui?.updateCoins(this.game.stateManager.coins);

        // Apply item effect
        item.apply(this.game);

        // Track purchase
        this.purchasedItems.set(itemId, purchases + 1);

        return true;
    }

    /**
     * Get item by ID
     */
    getItem(itemId: string): ShopItem | undefined {
        return this.shopItems.find(i => i.id === itemId);
    }

    /**
     * Reset shop (for new game)
     */
    reset(): void {
        this.purchasedItems.clear();
    }

    /**
     * Get all shop items
     */
    getAllItems(): ShopItem[] {
        return this.shopItems;
    }
}
