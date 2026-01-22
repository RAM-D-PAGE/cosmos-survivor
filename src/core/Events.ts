/**
 * Game Events Definitions
 * กำหนด events ทั้งหมดที่ใช้ในเกม
 * ทำให้ type-safe และง่ายต่อการใช้งาน
 */

/**
 * Event Types - กำหนด events หลักของเกม
 */
export enum GameEventType {
    // Player Events
    PLAYER_DAMAGED = 'player:damaged',
    PLAYER_HEALED = 'player:healed',
    PLAYER_LEVEL_UP = 'player:level_up',
    PLAYER_DIED = 'player:died',
    PLAYER_DASH = 'player:dash',
    EXP_GAINED = 'player:exp_gained',

    // Enemy Events
    ENEMY_SPAWNED = 'enemy:spawned',
    ENEMY_KILLED = 'enemy:killed',
    ENEMY_DAMAGED = 'enemy:damaged',
    BOSS_SPAWNED = 'boss:spawned',
    BOSS_DEFEATED = 'boss:defeated',

    // Game State Events
    GAME_STARTED = 'game:started',
    GAME_PAUSED = 'game:paused',
    GAME_RESUMED = 'game:resumed',
    GAME_OVER = 'game:over',
    GAME_RESTARTED = 'game:restarted',

    // Upgrade Events
    UPGRADE_ACQUIRED = 'upgrade:acquired',
    WEAPON_INSTALLED = 'weapon:installed',
    SKILL_EQUIPPED = 'skill:equipped',
    CARD_SELECTED = 'card:selected',

    // Zone/Map Events
    ZONE_CHANGED = 'zone:changed',
    ZONE_COMPLETED = 'zone:completed',

    // UI Events
    MENU_OPENED = 'ui:menu_opened',
    MENU_CLOSED = 'ui:menu_closed',
    UPGRADE_MENU_OPENED = 'ui:upgrade_menu_opened',
}

/**
 * Event Data Types - กำหนด structure ของข้อมูลในแต่ละ event
 */
export interface PlayerDamagedEvent {
    damage: number;
    remainingHp: number;
    maxHp: number;
    source?: string; // 'enemy', 'projectile', 'collision', etc.
}

export interface PlayerHealedEvent {
    amount: number;
    newHp: number;
    maxHp: number;
}

export interface PlayerLevelUpEvent {
    newLevel: number;
    exp: number;
    expToNextLevel: number;
}

export interface ExpGainedEvent {
    amount: number;
    newExp: number;
    expToNextLevel: number;
}

export interface EnemyKilledEvent {
    enemyType: string;
    position: { x: number; y: number };
    expGained: number;
    isElite: boolean;
}

export interface EnemySpawnedEvent {
    enemyType: string;
    position: { x: number; y: number };
    isElite: boolean;
}

export interface UpgradeAcquiredEvent {
    upgradeName: string;
    upgradeType: 'weapon' | 'skill' | 'card';
    rarity?: string;
}

export interface ZoneChangedEvent {
    zoneNumber: number;
    zoneName: string;
    difficulty: number;
}

/**
 * Event Payload Union Type
 */
export type GameEventPayload = 
    | PlayerDamagedEvent
    | PlayerHealedEvent
    | PlayerLevelUpEvent
    | ExpGainedEvent
    | EnemyKilledEvent
    | EnemySpawnedEvent
    | UpgradeAcquiredEvent
    | ZoneChangedEvent
    | Record<string, any>; // Fallback for other events

/**
 * Typed Event Handler
 */
export type GameEventHandler<T extends GameEventPayload = GameEventPayload> = (data: T) => void;
