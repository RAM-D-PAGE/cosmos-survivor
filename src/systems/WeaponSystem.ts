import { AutoWeapon } from '../entities/AutoWeapon'; // This will be migrated later, temporary any

export interface WeaponConfig {
    type: string;
    damage: number;
    fireRate: number;
    range: number;
    color: string;
    name: string;
}

export class WeaponSystem {
    private game: any;
    public activeWeapons: any[]; // AutoWeapon[]
    public maxWeapons: number;

    // Procedural Definitions
    private types = ['ORBITAL', 'TURRET', 'HEALER', 'DECOY'];
    private elements = [
        { name: 'Plasma', color: '#00f0ff' },
        { name: 'Laser', color: '#ff0055' },
        { name: 'Void', color: '#aa00ff' },
        { name: 'Nano', color: '#00ff88' }, // For Healer
        { name: 'Holo', color: '#88aaff' }   // For Decoy
    ];

    constructor(game: any) {
        this.game = game;
        this.activeWeapons = [];
        this.maxWeapons = 6; // Increased for more fun
    }

    generateWeapon(): any {
        const type = this.types[Math.floor(Math.random() * this.types.length)];

        // Check if we already have this type of weapon
        const existing = this.activeWeapons.find(w => w.config.type === type);
        if (existing) {
            return this.createWeaponLevelUp(existing);
        }

        const element = this.elements[Math.floor(Math.random() * this.elements.length)];

        // Random Stats
        const damage = Math.floor(Math.random() * 10) + 5;
        const fireRate = (Math.random() * 2) + 0.5; // 0.5 to 2.5
        const range = Math.floor(Math.random() * 200) + 200; // 200 - 400

        const name = `${element.name} ${this.getTypeName(type)}`;

        return {
            id: `wep_${Date.now()}`,
            name: name,
            description: `<b>New Drone</b><br>Type: ${type}<br>Dmg: ${damage} | Rate: ${fireRate.toFixed(1)}`,
            type: type, // Needed for UpgradeSystem checks
            damage: damage,
            fireRate: fireRate,
            range: range,
            color: element.color,
            apply: (game: any) => {
                game.weaponSystem.installWeapon(game.weaponSystem.createConfig(type, damage, fireRate, range, element.color, name));
                // Log Upgrade
                game.acquiredUpgrades.push({
                    name: name,
                    color: element.color
                });
            }
        };
    }

    getTypeName(type: string): string {
        switch (type) {
            case 'ORBITAL': return 'Drone';
            case 'TURRET': return 'Turret';
            case 'HEALER': return 'Bot';
            case 'DECOY': return 'Holo';
            default: return 'Unit';
        }
    }

    createWeaponLevelUp(weapon: any): any {
        return {
            id: `lvlup_${weapon.config.name}_${Date.now()}`,
            name: `Level Up: ${weapon.config.name}`,
            description: `<b>Upgrade Drone Level</b><br>Level ${weapon.level} -> ${weapon.level + 1}<br><span style="color:#ffff00">Stats Improved!</span>`,
            color: weapon.config.color,
            apply: (g: any) => {
                this.upgradeWeapon(weapon);
                g.acquiredUpgrades.push({
                    name: `Lvl ${weapon.level}: ${weapon.config.name}`,
                    color: weapon.config.color
                });
            }
        };
    }

    upgradeWeapon(weapon: any): void {
        weapon.level++;
        weapon.damage = Math.floor(weapon.damage * 1.2);
        weapon.config.damage = weapon.damage;

        // Visual or stat boost based on type
        if (weapon.config.type === 'HEALER') {
            weapon.config.fireRate *= 1.1; // Faster heals
        } else {
            weapon.config.fireRate *= 1.1; // Faster shots
        }

        // Refresh internal stats
        weapon.initStats();

        this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "DRONE LEVEL UP!", "#ffff00");
    }

    createConfig(type: string, damage: number, fireRate: number, range: number, color: string, name: string): WeaponConfig {
        return { type, damage, fireRate, range, color, name };
    }

    installWeapon(config: WeaponConfig): void {
        if (this.activeWeapons.length >= this.maxWeapons) {
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "Weapon Slots Full!", "#ff0000");
            return;
        }

        const weapon = new AutoWeapon(this.game, this.game.player, config);
        // Distribute angles if orbital
        if (config.type === 'ORBITAL') {
            weapon.angle = (Math.PI * 2 / (this.activeWeapons.length + 1)) * this.activeWeapons.length;
        }

        this.activeWeapons.push(weapon);
        this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "Weapon Installed!", "#00ff00");
    }

    update(dt: number): void {
        this.activeWeapons.forEach(w => w.update(dt));
    }

    draw(ctx: CanvasRenderingContext2D): void {
        this.activeWeapons.forEach(w => w.draw(ctx));
    }

    reset(): void {
        this.activeWeapons = [];
        this.maxWeapons = 4; // Reset to base slots
    }
}
