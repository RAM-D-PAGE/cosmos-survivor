/**
 * Cosmetic Shop System
 * ระบบร้านค้าเครื่องสำอาง - ซื้อ skins, trails, effects
 */

export interface CosmeticItem {
    id: string;
    name: string;
    nameTH?: string;
    description: string;
    descriptionTH?: string;
    category: 'SKIN' | 'TRAIL' | 'EFFECT' | 'PARTICLE' | 'SOUND';
    price: number;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC';
    icon?: string;
    data: any; // Cosmetic-specific data (color, pattern, etc.)
}

export class CosmeticShopSystem {
    private game: any;
    public cosmeticItems: CosmeticItem[] = [];
    public ownedCosmetics: Set<string> = new Set();
    public equippedCosmetics: Map<string, string> = new Map(); // category -> itemId

    constructor(game: any) {
        this.game = game;
        this.initializeCosmetics();
        this.loadCosmeticData();
    }

    /**
     * Initialize all cosmetic items
     */
    private initializeCosmetics(): void {
        this.cosmeticItems = [
            // ============= SKINS =============
            {
                id: 'SKIN_DEFAULT',
                name: 'Default Skin',
                nameTH: 'สกินเริ่มต้น',
                description: 'Default player appearance',
                descriptionTH: 'รูปลักษณ์ผู้เล่นเริ่มต้น',
                category: 'SKIN',
                price: 0, // Free
                rarity: 'COMMON',
                data: { color: '#00f0ff' }
            },
            {
                id: 'SKIN_FIRE',
                name: 'Fire Skin',
                nameTH: 'สกินไฟ',
                description: 'Burning red appearance',
                descriptionTH: 'รูปลักษณ์ไฟแดง',
                category: 'SKIN',
                price: 100,
                rarity: 'UNCOMMON',
                data: { color: '#ff4400', glow: '#ff8800' }
            },
            {
                id: 'SKIN_ICE',
                name: 'Ice Skin',
                nameTH: 'สกินน้ำแข็ง',
                description: 'Frozen blue appearance',
                descriptionTH: 'รูปลักษณ์น้ำแข็งสีฟ้า',
                category: 'SKIN',
                price: 100,
                rarity: 'UNCOMMON',
                data: { color: '#00ccff', glow: '#88ffff' }
            },
            {
                id: 'SKIN_VOID',
                name: 'Void Skin',
                nameTH: 'สกินความว่างเปล่า',
                description: 'Dark purple appearance',
                descriptionTH: 'รูปลักษณ์ม่วงเข้ม',
                category: 'SKIN',
                price: 200,
                rarity: 'RARE',
                data: { color: '#aa00ff', glow: '#ff00ff' }
            },
            {
                id: 'SKIN_GOLD',
                name: 'Golden Skin',
                nameTH: 'สกินทอง',
                description: 'Prestigious golden appearance',
                descriptionTH: 'รูปลักษณ์ทองคำ',
                category: 'SKIN',
                price: 500,
                rarity: 'EPIC',
                data: { color: '#ffd700', glow: '#ffff00' }
            },
            {
                id: 'SKIN_RAINBOW',
                name: 'Rainbow Skin',
                nameTH: 'สกินสายรุ้ง',
                description: 'Colorful rainbow appearance',
                descriptionTH: 'รูปลักษณ์สีรุ้ง',
                category: 'SKIN',
                price: 1000,
                rarity: 'LEGENDARY',
                data: { color: 'rainbow', glow: 'rainbow' }
            },

            // ============= TRAILS =============
            {
                id: 'TRAIL_NONE',
                name: 'No Trail',
                nameTH: 'ไม่มีร่องรอย',
                description: 'No movement trail',
                descriptionTH: 'ไม่มีร่องรอยการเคลื่อนที่',
                category: 'TRAIL',
                price: 0,
                rarity: 'COMMON',
                data: { enabled: false }
            },
            {
                id: 'TRAIL_STANDARD',
                name: 'Standard Trail',
                nameTH: 'ร่องรอยมาตรฐาน',
                description: 'Basic movement trail',
                descriptionTH: 'ร่องรอยการเคลื่อนที่พื้นฐาน',
                category: 'TRAIL',
                price: 50,
                rarity: 'COMMON',
                data: { enabled: true, color: '#00f0ff', length: 10 }
            },
            {
                id: 'TRAIL_FIRE',
                name: 'Fire Trail',
                nameTH: 'ร่องรอยไฟ',
                description: 'Burning fire trail',
                descriptionTH: 'ร่องรอยไฟ',
                category: 'TRAIL',
                price: 150,
                rarity: 'UNCOMMON',
                data: { enabled: true, color: '#ff4400', length: 15, particles: true }
            },
            {
                id: 'TRAIL_ICE',
                name: 'Ice Trail',
                nameTH: 'ร่องรอยน้ำแข็ง',
                description: 'Frozen ice trail',
                descriptionTH: 'ร่องรอยน้ำแข็ง',
                category: 'TRAIL',
                price: 150,
                rarity: 'UNCOMMON',
                data: { enabled: true, color: '#00ccff', length: 15, particles: true }
            },
            {
                id: 'TRAIL_RAINBOW',
                name: 'Rainbow Trail',
                nameTH: 'ร่องรอยสายรุ้ง',
                description: 'Colorful rainbow trail',
                descriptionTH: 'ร่องรอยสีรุ้ง',
                category: 'TRAIL',
                price: 300,
                rarity: 'RARE',
                data: { enabled: true, color: 'rainbow', length: 20, particles: true }
            },
            {
                id: 'TRAIL_VOID',
                name: 'Void Trail',
                nameTH: 'ร่องรอยความว่างเปล่า',
                description: 'Dark void trail',
                descriptionTH: 'ร่องรอยความว่างเปล่า',
                category: 'TRAIL',
                price: 400,
                rarity: 'EPIC',
                data: { enabled: true, color: '#aa00ff', length: 25, particles: true, glow: true }
            },

            // ============= EFFECTS =============
            {
                id: 'EFFECT_NONE',
                name: 'No Effect',
                nameTH: 'ไม่มีเอฟเฟกต์',
                description: 'No special effects',
                descriptionTH: 'ไม่มีเอฟเฟกต์พิเศษ',
                category: 'EFFECT',
                price: 0,
                rarity: 'COMMON',
                data: { enabled: false }
            },
            {
                id: 'EFFECT_SPARKLES',
                name: 'Sparkles',
                nameTH: 'ประกายไฟ',
                description: 'Sparkle particles around player',
                descriptionTH: 'อนุภาคประกายรอบตัวผู้เล่น',
                category: 'EFFECT',
                price: 100,
                rarity: 'UNCOMMON',
                data: { enabled: true, type: 'sparkles', color: '#ffff00' }
            },
            {
                id: 'EFFECT_AURA',
                name: 'Energy Aura',
                nameTH: 'ออร่าพลังงาน',
                description: 'Energy aura around player',
                descriptionTH: 'ออร่าพลังงานรอบตัวผู้เล่น',
                category: 'EFFECT',
                price: 200,
                rarity: 'RARE',
                data: { enabled: true, type: 'aura', color: '#00ffff', intensity: 0.5 }
            },
            {
                id: 'EFFECT_SHADOW',
                name: 'Shadow Effect',
                nameTH: 'เอฟเฟกต์เงา',
                description: 'Dark shadow effect',
                descriptionTH: 'เอฟเฟกต์เงามืด',
                category: 'EFFECT',
                price: 300,
                rarity: 'EPIC',
                data: { enabled: true, type: 'shadow', color: '#000000', intensity: 0.7 }
            },
            {
                id: 'EFFECT_DIVINE',
                name: 'Divine Light',
                nameTH: 'แสงศักดิ์สิทธิ์',
                description: 'Divine light effect',
                descriptionTH: 'เอฟเฟกต์แสงศักดิ์สิทธิ์',
                category: 'EFFECT',
                price: 500,
                rarity: 'LEGENDARY',
                data: { enabled: true, type: 'divine', color: '#ffff00', intensity: 1.0 }
            },

            // ============= PARTICLE EFFECTS =============
            {
                id: 'PARTICLE_STANDARD',
                name: 'Standard Particles',
                nameTH: 'อนุภาคมาตรฐาน',
                description: 'Default particle effects',
                descriptionTH: 'เอฟเฟกต์อนุภาคเริ่มต้น',
                category: 'PARTICLE',
                price: 0,
                rarity: 'COMMON',
                data: { color: '#00f0ff' }
            },
            {
                id: 'PARTICLE_FIRE',
                name: 'Fire Particles',
                nameTH: 'อนุภาคไฟ',
                description: 'Fire particle effects',
                descriptionTH: 'เอฟเฟกต์อนุภาคไฟ',
                category: 'PARTICLE',
                price: 150,
                rarity: 'UNCOMMON',
                data: { color: '#ff4400', type: 'fire' }
            },
            {
                id: 'PARTICLE_ICE',
                name: 'Ice Particles',
                nameTH: 'อนุภาคน้ำแข็ง',
                description: 'Ice particle effects',
                descriptionTH: 'เอฟเฟกต์อนุภาคน้ำแข็ง',
                category: 'PARTICLE',
                price: 150,
                rarity: 'UNCOMMON',
                data: { color: '#00ccff', type: 'ice' }
            },
            {
                id: 'PARTICLE_STARS',
                name: 'Star Particles',
                nameTH: 'อนุภาคดาว',
                description: 'Star particle effects',
                descriptionTH: 'เอฟเฟกต์อนุภาคดาว',
                category: 'PARTICLE',
                price: 250,
                rarity: 'RARE',
                data: { color: '#ffff00', type: 'stars' }
            }
        ];

        // Default items are owned
        this.cosmeticItems.filter(item => item.price === 0).forEach(item => {
            this.ownedCosmetics.add(item.id);
        });
    }

    /**
     * Purchase a cosmetic item
     */
    purchaseCosmetic(itemId: string): boolean {
        const item = this.cosmeticItems.find(i => i.id === itemId);
        if (!item) return false;

        if (this.ownedCosmetics.has(itemId)) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "ALREADY OWNED!",
                '#ffaa00'
            );
            return false;
        }

        if (this.game.stateManager.coins < item.price) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                `NEED ${item.price} COINS!`,
                '#ff0000'
            );
            return false;
        }

        // Purchase
        this.game.stateManager.coins -= item.price;
        this.ownedCosmetics.add(itemId);
        
        if (this.game.ui) {
            this.game.ui.updateCoins(this.game.stateManager.coins);
        }

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `PURCHASED: ${item.name}!`,
            '#00ff00'
        );

        this.saveCosmeticData();
        return true;
    }

    /**
     * Equip a cosmetic item
     */
    equipCosmetic(itemId: string): boolean {
        const item = this.cosmeticItems.find(i => i.id === itemId);
        if (!item) return false;

        if (!this.ownedCosmetics.has(itemId)) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "NOT OWNED!",
                '#ff0000'
            );
            return false;
        }

        this.equippedCosmetics.set(item.category, itemId);
        this.saveCosmeticData();

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `EQUIPPED: ${item.name}!`,
            '#00ffff'
        );

        return true;
    }

    /**
     * Get equipped cosmetic for a category
     */
    getEquippedCosmetic(category: string): CosmeticItem | null {
        const itemId = this.equippedCosmetics.get(category);
        if (!itemId) return null;
        return this.cosmeticItems.find(i => i.id === itemId) || null;
    }

    /**
     * Get all owned cosmetics
     */
    getOwnedCosmetics(): CosmeticItem[] {
        return this.cosmeticItems.filter(item => this.ownedCosmetics.has(item.id));
    }

    /**
     * Get cosmetics by category
     */
    getCosmeticsByCategory(category: string): CosmeticItem[] {
        return this.cosmeticItems.filter(item => item.category === category);
    }

    /**
     * Save cosmetic data to localStorage
     */
    saveCosmeticData(): void {
        const data = {
            owned: Array.from(this.ownedCosmetics),
            equipped: Array.from(this.equippedCosmetics.entries())
        };

        try {
            localStorage.setItem('cosmos_cosmetics', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save cosmetic data:', e);
        }
    }

    /**
     * Load cosmetic data from localStorage
     */
    loadCosmeticData(): void {
        try {
            const dataStr = localStorage.getItem('cosmos_cosmetics');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            if (data.owned) {
                data.owned.forEach((id: string) => {
                    this.ownedCosmetics.add(id);
                });
            }
            if (data.equipped) {
                data.equipped.forEach(([category, itemId]: [string, string]) => {
                    this.equippedCosmetics.set(category, itemId);
                });
            }
        } catch (e) {
            console.error('Failed to load cosmetic data:', e);
        }
    }
}
