import { Boss } from '../entities/Boss.js'; // Will need migration

export class MapSystem {
    private game: any;
    private timer: number;
    public zoneCount: number;

    public bossSpawned: boolean;
    public miniBossSpawned: boolean;
    public waitingForKill: boolean;
    public secretBossSpawned: boolean = false;
    private hazardTimer: number;
    private secretBossCheckTimer: number = 0;
    public totalTime: number;

    private waveExpMultiplier: number = 1;
    private waveDamageMultiplier: number = 1;

    private currentZone: any;
    private nextZone: any;

    private prefixes = [
        { name: 'Deep', color: '#050510', stars: '#ffffff', nebula: ['#101030', '#151540', '#0a0a20'] },
        { name: 'Crimson', color: '#100005', stars: '#ff8888', nebula: ['#300010', '#400015', '#200005'] },
        { name: 'Frozen', color: '#000510', stars: '#88ffff', nebula: ['#001030', '#002040', '#000a20'] },
        { name: 'Toxic', color: '#001000', stars: '#88ff88', nebula: ['#003010', '#004015', '#002005'] },
        { name: 'Golden', color: '#100500', stars: '#ffaa88', nebula: ['#301500', '#402000', '#200500'] },
        { name: 'Void', color: '#000000', stars: '#aa00ff', nebula: ['#100020', '#150030', '#050010'] },
        { name: 'Nebula', color: '#050010', stars: '#ff00aa', nebula: ['#200030', '#300040', '#100020'] }
    ];

    private roots = ['Sector', 'Expanse', 'Hive', 'Belt', 'Field', 'Zone', 'Nursery', 'Graveyard'];

    private hazards = [
        { type: 'NONE', weight: 4 },
        { type: 'SLOW', weight: 2 },
        { type: 'CORROSION', weight: 1 },
        { type: 'INTERFERENCE', weight: 1 }
    ];

    public currentZoneModifiers: any[] = [];
    public zoneDescription: string = "";
    public zoneDescriptionTH: string = "";

    constructor(game: any) {
        this.game = game;
        this.timer = 0;
        this.bossSpawned = false;
        this.miniBossSpawned = false;
        this.waitingForKill = false;
        this.hazardTimer = 0;
        this.totalTime = 0;
        this.zoneCount = 0;

        this.currentZone = this.generateZone(0);
        this.updateZoneInfo(); // Helper to sync public props

        this.nextZone = this.generateZone(1);
        if (this.game.backgroundSystem) {
            this.game.backgroundSystem.setBiome(
                this.currentZone.bgColor,
                this.currentZone.starColor,
                this.currentZone.nebulaColors
            );
        }
    }

    private updateZoneInfo(): void {
        this.zoneDescription = this.currentZone.name;
        // Mock TH description mapping or simple passthrough
        this.zoneDescriptionTH = this.currentZone.name;

        // Expose modifiers if any (mock logic for now as generateZone returns specific structure)
        this.currentZoneModifiers = [];
        if (this.currentZone.debuff !== 'NONE') {
            this.currentZoneModifiers.push({
                type: 'DEBUFF',
                name: this.currentZone.debuff
            });
        }
    }

    generateZone(depth: number): any {
        const prefix = this.prefixes[Math.floor(Math.random() * this.prefixes.length)];
        const root = this.roots[Math.floor(Math.random() * this.roots.length)];
        const name = `${prefix.name} ${root}`;

        let hazard = 'NONE';
        const hazardRoll = Math.random() * 8;
        let cumWeight = 0;
        for (const h of this.hazards) {
            cumWeight += h.weight;
            if (hazardRoll <= cumWeight) {
                hazard = h.type;
                break;
            }
        }
        if (depth === 0) hazard = 'NONE';

        let weights: any = {
            'chaser': 10, 'shooter': 0, 'dasher': 0, 'tank': 0,
            'swarmer': 0, 'duplicator': 0, 'adaptive': 0, 'bomber': 0,
            'teleporter': 0, 'shielder': 0, 'healer': 0, 'swarm_mother': 0, 'ghost': 0
        };

        if (depth > 0) { weights['shooter'] += depth * 2; weights['swarmer'] += depth * 2; }
        if (depth > 1) { weights['dasher'] += depth * 2; weights['bomber'] += depth * 1.5; }
        if (depth > 2) { weights['tank'] += depth * 1.5; weights['teleporter'] += depth * 1.5; weights['ghost'] += depth * 1; }
        if (depth > 3) { weights['duplicator'] += depth * 1.5; weights['shielder'] += depth * 1; }
        if (depth > 4) { weights['adaptive'] += depth * 1; weights['healer'] += depth * 0.8; }
        if (depth > 5) { weights['swarm_mother'] += depth * 0.5; }

        const total = Object.values(weights).reduce((a: any, b: any) => a + b, 0) as number;
        const spawnTable: any = {};
        for (const k in weights) {
            spawnTable[k] = weights[k] / total;
        }

        return {
            name: name,
            duration: 60,
            bgColor: prefix.color,
            starColor: prefix.stars,
            nebulaColors: (prefix as any).nebula,
            debuff: hazard,
            spawnTable: spawnTable
        };
    }

    update(dt: number): void {
        this.totalTime += dt;

        if (this.waitingForKill) return;

        this.timer += dt;
        this.waveExpMultiplier = 1 + (this.zoneCount * 0.15);
        this.waveDamageMultiplier = 1 + (this.zoneCount * 0.1);

        const baseSpeed = this.game.player.baseStats?.maxSpeed || 400;
        if (this.currentZone.debuff === 'SLOW') {
            this.game.player.maxSpeed = Math.max(150, this.game.player.maxSpeed * 0.5);
        }

        if (this.currentZone.debuff === 'CORROSION') {
            this.hazardTimer += dt;
            if (this.hazardTimer > 1.0) {
                this.game.player.fireRateMultiplier = 0.5;
                this.hazardTimer = 0;
            }
        } else {
            this.game.player.fireRateMultiplier = 1.0;
        }

        // Secret Boss: 0.5% chance every 10 seconds after level 10
        if (!this.secretBossSpawned && this.game.level >= 10) {
            this.secretBossCheckTimer = (this.secretBossCheckTimer || 0) + dt;
            if (this.secretBossCheckTimer >= 10) { // Every 10 seconds
                this.secretBossCheckTimer = 0;
                if (Math.random() < 0.005) { // 0.5% chance
                    this.spawnSecretBoss();
                }
            }
        }

        if (!this.miniBossSpawned && this.timer > this.currentZone.duration * 0.5) {
            this.spawnBoss('miniboss');
            this.miniBossSpawned = true;
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 150, "WARNING: MINI-BOSS DETECTED", "#ff00aa");
        }

        if (this.timer > this.currentZone.duration && !this.bossSpawned) {
            this.spawnBoss('stage_boss');
            this.bossSpawned = true;
            this.waitingForKill = true;
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 150, "WARNING: STAGE BOSS DETECTED", "#ff0000");
        }
    }

    getExpMultiplier(): number {
        return this.waveExpMultiplier || 1;
    }

    getDamageMultiplier(): number {
        return this.waveDamageMultiplier || 1;
    }

    spawnBoss(type: string): void {
        const angle = Math.random() * Math.PI * 2;
        const dist = 600;
        const x = this.game.player.x + Math.cos(angle) * dist;
        const y = this.game.player.y + Math.sin(angle) * dist;
        this.game.enemies.push(new Boss(this.game, x, y, type));
    }

    spawnSecretBoss(): void {
        this.secretBossSpawned = true;
        this.spawnBoss('secret');
        this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 200, "WARNING: ANOMALY DETECTED", "#bf00ff");
    }

    bossDefeated(): void {
        if (this.waitingForKill) {
            this.waitingForKill = false;
            this.timer = 0;
            this.zoneCount++;
            this.currentZone = this.nextZone;
            this.updateZoneInfo(); // Sync new zone info
            this.nextZone = this.generateZone(this.zoneCount + 1);
            this.bossSpawned = false;

            this.miniBossSpawned = false;
            this.game.spawnFloatingText(this.game.player.x, this.game.player.y - 100, `WARP: ${this.currentZone.name}`, '#00f0ff');

            if (this.game.backgroundSystem) {
                this.game.backgroundSystem.setBiome(
                    this.currentZone.bgColor,
                    this.currentZone.starColor,
                    this.currentZone.nebulaColors
                );
            }
        }
    }

    getCurrentZone(): any {
        return this.currentZone;
    }

    getSpawnType(): string {
        const table = this.currentZone.spawnTable;
        const roll = Math.random();
        let cumulative = 0;
        for (const [type, weight] of Object.entries(table)) {
            cumulative += (weight as number);
            if (roll <= cumulative) return type;
        }
        return 'chaser';
    }

    reset(): void {
        this.timer = 0;
        this.totalTime = 0;
        this.zoneCount = 0;
        this.bossSpawned = false;
        this.miniBossSpawned = false;
        this.secretBossSpawned = false;
        this.waitingForKill = false;
        this.hazardTimer = 0;
        this.currentZone = this.generateZone(0);
        this.nextZone = this.generateZone(1);
        if (this.game.backgroundSystem) {
            this.game.backgroundSystem.setBiome(
                this.currentZone.bgColor,
                this.currentZone.starColor,
                this.currentZone.nebulaColors
            );
        }
    }
}
