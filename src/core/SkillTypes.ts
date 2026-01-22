
export enum Rarity {
    COMMON = 'COMMON',
    UNCOMMON = 'UNCOMMON',
    RARE = 'RARE',
    EPIC = 'EPIC',
    LEGENDARY = 'LEGENDARY',
    MYTHIC = 'MYTHIC',
    GOD = 'GOD'
}

export enum SkillType {
    // Control & AoE
    AOE_DOT_PULL = 'AOE_DOT_PULL',
    AOE_SCATTER = 'AOE_SCATTER',
    GLOBAL_FREEZE = 'GLOBAL_FREEZE',
    AOE_PULL_EXPLODE = 'AOE_PULL_EXPLODE',
    AOE_SCATTER_INSTANT = 'AOE_SCATTER_INSTANT',
    AOE_EXECUTE = 'AOE_EXECUTE',
    AOE_ZONE = 'AOE_ZONE',
    AOE_KNOCKBACK = 'AOE_KNOCKBACK',
    AOE_STUN = 'AOE_STUN',
    PERSISTENT_PULL = 'PERSISTENT_PULL',
    SLOW_FIELD = 'SLOW_FIELD',
    REGEN_ZONE = 'REGEN_ZONE',
    ELECTRIC_FIELD = 'ELECTRIC_FIELD',
    DIMENSION_RIFT = 'DIMENSION_RIFT',

    // Projectiles
    PROJECTILE_EXPLODE = 'PROJECTILE_EXPLODE',
    PROJECTILE_FREEZE = 'PROJECTILE_FREEZE',
    SINGLE_DELAYED = 'SINGLE_DELAYED',
    CONE_DOT = 'CONE_DOT',
    CHAIN_DETONATE = 'CHAIN_DETONATE',

    // Self & Buffs
    SELF_BUFF = 'SELF_BUFF',
    DECOY = 'DECOY',
    SUMMON_CLONES = 'SUMMON_CLONES',
    ORBIT_DAMAGE = 'ORBIT_DAMAGE',
    BUFF_SPEED = 'BUFF_SPEED',
    SELF_REVIVE = 'SELF_REVIVE',
    BLINK = 'BLINK',
    QUICK_HEAL = 'QUICK_HEAL',
    DAMAGE_MULT = 'DAMAGE_MULT',
    CLOUD_PIERCING = 'CLOUD_PIERCING', // Special

    // Ultimate / God / Anime
    SCREEN_CLEAR = 'SCREEN_CLEAR',
    REWIND = 'REWIND',
    VOID_ERASURE = 'VOID_ERASURE',
    BEAM_ERASURE = 'BEAM_ERASURE',
    DASH_SLASH = 'DASH_SLASH',
    FREEZE_AOE = 'FREEZE_AOE',
    STUN_AOE = 'STUN_AOE',
    MIRROR_IMAGE = 'MIRROR_IMAGE'
}

export interface SkillDef {
    id: string;
    name: string;
    type: SkillType | string; // Allow string for backward compatibility or extensibility
    description: string;
    descriptionEN?: string;
    descriptionTH?: string;
    cooldown: number;
    rarity: Rarity | string;
    color: string;

    // Optional Stats
    damage?: number;
    damagePerSec?: number;
    duration?: number;
    radius?: number;
    speed?: number;
    count?: number;
    strikes?: number;
    maxStacks?: number;
    knockback?: number;
    pullForce?: number;
    freezeDuration?: number;
    stunDuration?: number;
    slowPercent?: number;
    healPercent?: number;
    revivePercent?: number;
    multiplier?: number;
    speedMult?: number;
    attackRateMult?: number;
    rewindTime?: number;
    threshold?: number;
    delay?: number;

    // Complex Stats
    chainRange?: number;
    maxChains?: number;
    bladeCount?: number;
    imageCount?: number;
    cloneCount?: number;
    vineCount?: number;
    coneAngle?: number;
    range?: number;
    damageReduction?: number;
    renderStyle?: 'default' | 'slash' | 'fire' | 'dark' | 'star';

    isMystical?: boolean;
}

export interface LocalizedSkillDef extends SkillDef {
    descriptionEN?: string;
    descriptionTH?: string;
}

export interface ActiveEffect {
    type: string; // Or EffectType enum
    timer: number;
    x?: number;
    y?: number;
    update: (dt: number, game: any) => void;
    onExpire?: (game: any) => void;

    // Extended properties for various effects
    radius?: number;
    damage?: number;
    damagePerSec?: number;
    color?: string;
    angle?: number;
    speed?: number;
    dist?: number;
    info?: any;
    healTimer?: number;
    fireTimer?: number;
    attackTimer?: number;
    vineIndex?: number;
    width?: number;
    length?: number;
    explosionRadius?: number;
    freezeDuration?: number;
    slowPercent?: number;
    pullForce?: number;
}