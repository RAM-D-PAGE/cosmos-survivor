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
    private types = ['ORBITAL', 'TURRET'];
    private elements = [
        { name: 'Plasma', color: '#00f0ff' },
        { name: 'Laser', color: '#ff0055' },
        { name: 'Void', color: '#aa00ff' }
    ];

    constructor(game: any) {
        this.game = game;
        this.activeWeapons = [];
        this.maxWeapons = 4;
    }

    generateWeapon(): any {
        const type = this.types[Math.floor(Math.random() * this.types.length)];
        const element = this.elements[Math.floor(Math.random() * this.elements.length)];

        // Random Stats
        const damage = Math.floor(Math.random() * 10) + 5;
        const fireRate = (Math.random() * 2) + 0.5; // 0.5 to 2.5
        const range = Math.floor(Math.random() * 200) + 200; // 200 - 400

        const name = `${element.name} ${type === 'ORBITAL' ? 'Drone' : 'Turret'}`;

        return {
            id: `wep_${Date.now()}`,
            name: name,
            description: `Auto-fires ${element.name} rounds. <br>Dmg: ${damage} | Rate: ${fireRate.toFixed(1)}`,
            type: type,
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
