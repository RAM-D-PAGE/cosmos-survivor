import { SUPABASE_CONFIG } from './Env';

export interface Difficulty {
    name: string;
    mult: number;
    color: string;
    spawnRate: number;
    expMult: number;
}

export interface EnemyStats {
    SPEED: number;
    HP: number;
    VALUE: number;
    COLOR: string;
    RADIUS: number;
    DAMAGE: number;
    SHIELD?: number;
    HEAL_RATE?: number;
    EVASION?: number;
    SPAWN_TIME_PCT?: number;
    HP_BASE?: number;
}

export interface BossStats {
    HP_BASE: number;
    SPEED: number;
    VALUE: number;
    COLOR: string;
    RADIUS: number;
    DAMAGE: number;
    SPAWN_TIME_PCT?: number;
}

export enum SkillType {
    AOE_DOT_PULL = 'AOE_DOT_PULL',
    AOE_SCATTER = 'AOE_SCATTER',
    GLOBAL_FREEZE = 'GLOBAL_FREEZE',
    AOE_PULL_EXPLODE = 'AOE_PULL_EXPLODE',
    AOE_SCATTER_INSTANT = 'AOE_SCATTER_INSTANT',
    SELF_BUFF = 'SELF_BUFF',
    AOE_EXECUTE = 'AOE_EXECUTE',
    PROJECTILE_EXPLODE = 'PROJECTILE_EXPLODE',
    PROJECTILE_FREEZE = 'PROJECTILE_FREEZE',
    AOE_ZONE = 'AOE_ZONE',
    AOE_KNOCKBACK = 'AOE_KNOCKBACK',
    PERSISTENT_PULL = 'PERSISTENT_PULL',
    SELF_REVIVE = 'SELF_REVIVE',
    SUMMON_CLONES = 'SUMMON_CLONES',
    SCREEN_CLEAR = 'SCREEN_CLEAR',
    REWIND = 'REWIND',
    DAMAGE_MULT = 'DAMAGE_MULT',
    CHAIN_DETONATE = 'CHAIN_DETONATE',
    ORBIT_DAMAGE = 'ORBIT_DAMAGE',
    DECOY = 'DECOY',
    REGEN_ZONE = 'REGEN_ZONE',
    BUFF_SPEED = 'BUFF_SPEED',
    CONE_DOT = 'CONE_DOT',
    FREEZE_AOE = 'FREEZE_AOE',
    AOE_STUN = 'AOE_STUN',
    STUN_AOE = 'STUN_AOE',
    BLINK = 'BLINK',
    VOID_ERASURE = 'VOID_ERASURE',
    BEAM_ERASURE = 'BEAM_ERASURE',
    DASH_SLASH = 'DASH_SLASH'
}

export enum Rarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC',
    GOD = 'GOD'
}

export interface SkillDef {
    id?: string;
    name: string;
    type?: string;
    cooldown: number;
    damage?: number;
    duration?: number;
    color: string;
    rarity: Rarity;
    maxStacks?: number;
    radius?: number;
    speed?: number;
    freezeDuration?: number;
    damagePerSec?: number;
    knockback?: number;
    strikes?: number;
    count?: number;
    delay?: number;
    threshold?: number;
    isMystical?: boolean;
    description?: string;
    // New skill properties
    pullForce?: number;
    revivePercent?: number;
    cloneCount?: number;
    multiplier?: number;
    rewindTime?: number;
    chainRange?: number;
    maxChains?: number;
    bladeCount?: number;
    imageCount?: number;
    healPercent?: number;
    speedMult?: number;
    stunDuration?: number;
    coneAngle?: number;
    range?: number;
    slowPercent?: number;
    vineCount?: number;
    damageReduction?: number;
    width?: number;
}

export const CONFIG = {
    GAME: {
        DIFFICULTY_SCALING_PER_MINUTE: 0.5,
        ENEMY_SPAWN_INTERVAL: 2,
        MAX_WEAPONS: 10
    },
    SUPABASE: SUPABASE_CONFIG,
    DIFFICULTY: {
        EASY: { name: 'ง่าย', mult: 1, color: '#00ff00', spawnRate: 1.5, expMult: 1 },
        NORMAL: { name: 'ปกติ', mult: 1.5, color: '#ffffff', spawnRate: 1, expMult: 0.8 },
        HARD: { name: 'ยาก', mult: 2, color: '#ffaa00', spawnRate: 0.8, expMult: 0.7 },
        ABYSS: { name: 'นรก', mult: 3, color: '#ff0088', spawnRate: 0.6, expMult: 0.6 },
        HELL: { name: 'อเวจี', mult: 5, color: '#ff0000', spawnRate: 0.4, expMult: 0.5 },
        IMPOSSIBLE: { name: 'เป็นไปไม่ได้', mult: 10, color: '#aa00ff', spawnRate: 0.3, expMult: 0.4 },
        GOD: { name: 'ท้าทายเทพ', mult: 100, color: '#ffff00', spawnRate: 0.2, expMult: 0.3 },
        RULER: { name: 'ท้าทายผู้คุมกฏ', mult: 1000, color: '#ff00ff', spawnRate: 0.1, expMult: 0.2 }
    } as Record<string, Difficulty>,
    PLAYER: {
        BASE_SPEED: 400,
        BASE_FIRE_RATE: 5,
        BASE_DAMAGE: 10,
        BASE_HP: 100,
        DASH_SPEED: 1000,
        DASH_DURATION: 0.2,
        DASH_COOLDOWN: 3,
        DASH_COUNT: 1
    },
    ENEMY: {
        CHASER: { SPEED: 100, HP: 10, VALUE: 10, COLOR: '#ff0055', RADIUS: 20, DAMAGE: 10 },
        SHOOTER: { SPEED: 60, HP: 15, VALUE: 20, COLOR: '#aa00ff', RADIUS: 25, DAMAGE: 8 },
        DASHER: { SPEED: 250, HP: 8, VALUE: 15, COLOR: '#ffaa00', RADIUS: 15, DAMAGE: 15 },
        TANK: { SPEED: 40, HP: 50, VALUE: 50, COLOR: '#00ff00', RADIUS: 40, DAMAGE: 20 },
        SWARMER: { SPEED: 180, HP: 3, VALUE: 5, COLOR: '#00ffff', RADIUS: 10, DAMAGE: 5 },
        DUPLICATOR: { SPEED: 80, HP: 20, VALUE: 25, COLOR: '#ff88ff', RADIUS: 22, DAMAGE: 8 },
        ADAPTIVE: { SPEED: 100, HP: 35, VALUE: 40, COLOR: '#88ffff', RADIUS: 25, DAMAGE: 12 },
        BOMBER: { SPEED: 150, HP: 8, VALUE: 20, COLOR: '#ff4400', RADIUS: 18, DAMAGE: 30 },
        TELEPORTER: { SPEED: 60, HP: 15, VALUE: 25, COLOR: '#8800ff', RADIUS: 20, DAMAGE: 10 },
        SHIELDER: { SPEED: 50, HP: 25, VALUE: 35, COLOR: '#0088ff', RADIUS: 28, DAMAGE: 8, SHIELD: 30 },
        HEALER: { SPEED: 70, HP: 18, VALUE: 30, COLOR: '#00ff88', RADIUS: 22, DAMAGE: 5, HEAL_RATE: 5 },
        SWARM_MOTHER: { SPEED: 30, HP: 80, VALUE: 100, COLOR: '#ffff00', RADIUS: 45, DAMAGE: 15 },
        GHOST: { SPEED: 120, HP: 12, VALUE: 20, COLOR: '#ffffff88', RADIUS: 18, DAMAGE: 8, EVASION: 0.5 },
        SCALE_FACTOR_PER_LEVEL: 0.1
    } as Record<string, EnemyStats | number>,
    BOSS: {
        MINI: {
            HP_BASE: 500,
            SPEED: 80,
            VALUE: 500,
            COLOR: '#ff00aa',
            RADIUS: 60,
            SPAWN_TIME_PCT: 0.5,
            DAMAGE: 25
        },
        STAGE: {
            HP_BASE: 2000,
            SPEED: 40,
            VALUE: 2000,
            COLOR: '#ff0000',
            RADIUS: 120,
            SPAWN_TIME_PCT: 1,
            DAMAGE: 40
        },
        SECRET: {
            HP_BASE: 50000,
            SPEED: 90,
            VALUE: 100000,
            COLOR: '#000000', // Uses special drawing
            RADIUS: 150,
            DAMAGE: 100
        }
    },
    CHARACTERS: {
        VANGUARD: {
            NAME: 'Vanguard',
            DESCRIPTION: 'Balanced fighter equipped with an auto-turret.',
            STATS: { SPEED: 400, HP: 100, FIRE_RATE: 5 },
            STARTING_WEAPON: 'TURRET'
        },
        SPECTRE: {
            NAME: 'Spectre',
            DESCRIPTION: 'Fast and stealthy, uses orbital defenses.',
            STATS: { SPEED: 550, HP: 60, FIRE_RATE: 8 },
            STARTING_WEAPON: 'ORBITAL'
        }
    },
    MAP: {
        ZONE_DURATION: 60,
        SPAWN_DIST: 600
    },
    WEAPON: {
        ORBITAL_SPEED: 2,
        TURRET_RANGE: 300
    },

};
