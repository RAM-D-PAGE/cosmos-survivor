/**
 * Core Type Definitions for Cosmos Survivor
 * กำหนด types และ interfaces หลักของเกม
 */

// ==================== Entity Types ====================

export interface IEntity {
    x: number;
    y: number;
    radius: number;
    markedForDeletion: boolean;
    update(dt: number): void;
}

export interface ICollidable extends IEntity {
    radius: number;
}

export interface IDrawable {
    draw(ctx: CanvasRenderingContext2D): void;
}

// ==================== Game State Types ====================

export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER' | 'RESUMING';
export type CameraMode = 'LOCKED' | 'DYNAMIC';
export type DifficultyLevel = 'EASY' | 'NORMAL' | 'HARD' | 'ABYSS' | 'HELL' | 'IMPOSSIBLE' | 'GOD' | 'RULER';

// ==================== Player Types ====================

export interface PlayerStats {
    damage: number;
    fireRate: number;
    maxSpeed: number;
    projectileSpeed: number;
    projectileCount: number;
    maxHp: number;
    pickupRange: number;
    hpRegen: number;
}

export interface PlayerUpgrades {
    armor: number;
    critChance: number;
    piercing: number;
    chainCount: number;
    ricochet: number;
    lifeSteal: number;
    hasBerserker: boolean;
    berserkerBonus: number;
    collisionDamage: number;
    shieldCharges: number;
    shieldCooldown: number;
    hasSecondWind: boolean;
    secondWindHP: number;
    expBonus: number;
    luck: number;
    autoShoot: boolean;
    autoAim: boolean;
}

// ==================== Enemy Types ====================

export interface EnemyType {
    type: string;
    isElite: boolean;
    eliteModifiers: string[];
}

export interface EnemyStatus {
    frozen: boolean;
    poisoned: boolean;
    doomed: boolean;
    isPhased: boolean;
}

// ==================== Projectile Types ====================

export interface ProjectileData {
    x: number;
    y: number;
    angle: number;
    speed: number;
    damage: number;
    isEnemy: boolean;
    radius: number;
    color: string;
}

// ==================== System Types ====================

export interface IGameSystem {
    update(dt: number): void;
}

export interface IRenderSystem extends IGameSystem {
    draw(ctx: CanvasRenderingContext2D): void;
}

// ==================== Weapon Types ====================

export interface WeaponConfig {
    type: string;
    damage: number;
    fireRate: number;
    range: number;
    color: string;
    name: string;
}

// ==================== Skill Types ====================

export interface SkillDefinition {
    id: string;
    name: string;
    type: string;
    cooldown: number;
    damage?: number;
    duration?: number;
    color: string;
    rarity: 'COMMON' | 'UNCOMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'GOD';
    radius?: number;
    speed?: number;
    [key: string]: any; // For extensibility
}

export interface ActiveSkill extends SkillDefinition {
    currentCooldown: number;
}

export interface ActiveEffect {
    type: string;
    timer: number;
    update: (dt: number, game: any) => void;
    x: number;
    y: number;
    radius?: number;
    color?: string;
    [key: string]: any;
}

// ==================== Card Types ====================

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
    apply: (game: IGame, value: number) => void;
}

export interface CardRarity {
    name: string;
    multiplier: number;
    color: string;
    weight?: number;
}

// ==================== Game Interface ====================

export interface IGame {
    canvas: HTMLCanvasElement;
    ctx: CanvasRenderingContext2D;
    input: any; // Input class
    events: any; // EventManager
    renderSystem: IRenderSystem;
    ui: any; // UIManager
    audio: any; // AudioSystem
    upgradeSystem: any; // UpgradeSystem
    mapSystem: any; // MapSystem
    weaponSystem: any; // WeaponSystem
    skillSystem: any; // SkillSystem
    leaderboardSystem: any; // LeaderboardSystem
    loginSystem: any; // LoginSystem
    cardSystem: any; // CardSystem
    backgroundSystem: any; // BackgroundSystem
    player: any; // Player
    projectilePool: any; // ObjectPool<Projectile>
    particlePool: any; // ObjectPool<Particle>
    enemies: any[]; // Enemy[]
    gems: any[]; // Gem[]
    floatingTexts: any[]; // FloatingText[]
    camera: { x: number; y: number };
    difficulty: string;
    difficultyMult: number;
    gameState: GameState;
    isPaused: boolean;
    coins: number;
    exp: number;
    level: number;
    spawnProjectile(x: number, y: number, angle: number, speed: number, damage: number, isEnemy?: boolean): void;
    spawnParticles(x: number, y: number, count: number, color: string): void;
    spawnFloatingText(x: number, y: number, text: string, color: string): void;
    spawnGem(x: number, y: number, value: number): void;
    spawnCoin(x: number, y: number, value: number): void;
    addExp(amount: number): void;
    addScreenShake(duration: number, intensity: number): void;
}

// ==================== Spatial Partitioning Types ====================

export interface SpatialGridCell {
    entities: ICollidable[];
    projectiles: ProjectileData[];
}

export interface GridBounds {
    minX: number;
    maxX: number;
    minY: number;
    maxY: number;
}
