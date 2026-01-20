// Localization System for CosmosSurvivor
// Supports EN and TH languages

export type Language = 'EN' | 'TH';

export interface LocaleStrings {
    // UI
    play: string;
    leaderboard: string;
    settings: string;
    resume: string;
    restart: string;
    quit: string;
    close: string;

    // Game
    level: string;
    score: string;
    zone: string;
    time: string;
    paused: string;
    gameOver: string;
    enterName: string;
    submitScore: string;

    // Skills
    skills: string;
    skillManagement: string;
    cooldown: string;
    ready: string;

    // Settings
    language: string;
    volume: string;
    masterVolume: string;
    sfxVolume: string;
    musicVolume: string;
    screenShake: string;
    damageNumbers: string;
    showFps: string;
    on: string;
    off: string;

    // Difficulty
    easy: string;
    normal: string;
    hard: string;
    abyss: string;
    hell: string;
    impossible: string;
    godChallenge: string;
    rulerChallenge: string;

    // Skill Names
    skillBlackHole: string;
    skillMeteorShower: string;
    skillTimeStop: string;
    skillDoom: string;
    skillLightningStorm: string;
    skillDivineShield: string;
    skillSoulHarvest: string;
    skillFireball: string;
    skillIceball: string;
    skillPoisonCloud: string;
    skillShockwave: string;

    // Skill Descriptions
    descBlackHole: string;
    descMeteorShower: string;
    descTimeStop: string;
    descDoom: string;
    descLightningStorm: string;
    descDivineShield: string;
    descSoulHarvest: string;
    descFireball: string;
    descIceball: string;
    descPoisonCloud: string;
    descShockwave: string;

    // Misc
    rerollCost: string;
    weaponSlotFull: string;
    skillsSwapped: string;
    bossDefeated: string;
    newZone: string;
}

export const LOCALE_EN: LocaleStrings = {
    // UI
    play: 'PLAY',
    leaderboard: 'LEADERBOARD',
    settings: 'SETTINGS',
    resume: 'RESUME',
    restart: 'RESTART',
    quit: 'QUIT',
    close: 'CLOSE',

    // Game
    level: 'LEVEL',
    score: 'SCORE',
    zone: 'ZONE',
    time: 'TIME',
    paused: 'PAUSED',
    gameOver: 'GAME OVER',
    enterName: 'Enter your name',
    submitScore: 'SUBMIT SCORE',

    // Skills
    skills: 'SKILLS',
    skillManagement: 'SKILL MANAGEMENT',
    cooldown: 'Cooldown',
    ready: 'READY',

    // Settings
    language: 'Language',
    volume: 'Volume',
    masterVolume: 'Master Volume',
    sfxVolume: 'SFX Volume',
    musicVolume: 'Music Volume',
    screenShake: 'Screen Shake',
    damageNumbers: 'Damage Numbers',
    showFps: 'Show FPS',
    on: 'ON',
    off: 'OFF',

    // Difficulty
    easy: 'EASY',
    normal: 'NORMAL',
    hard: 'HARD',
    abyss: 'ABYSS',
    hell: 'HELL',
    impossible: 'IMPOSSIBLE',
    godChallenge: 'GOD CHALLENGE',
    rulerChallenge: 'RULER CHALLENGE',

    // Skill Names
    skillBlackHole: 'Black Hole',
    skillMeteorShower: 'Meteor Shower',
    skillTimeStop: 'Time Stop',
    skillDoom: 'Doom',
    skillLightningStorm: 'Lightning Storm',
    skillDivineShield: 'Divine Shield',
    skillSoulHarvest: 'Soul Harvest',
    skillFireball: 'Fireball',
    skillIceball: 'Ice Ball',
    skillPoisonCloud: 'Poison Cloud',
    skillShockwave: 'Shockwave',

    // Skill Descriptions
    descBlackHole: 'Creates a black hole that pulls and damages all nearby enemies',
    descMeteorShower: 'Summons meteors from the sky dealing massive AoE damage',
    descTimeStop: 'Freezes all enemies in place for a brief moment',
    descDoom: 'Marks an enemy for death, dealing massive damage after delay',
    descLightningStorm: 'Calls down multiple lightning strikes across the area',
    descDivineShield: 'Become invulnerable for a short duration',
    descSoulHarvest: 'Instantly kills all low-health enemies nearby',
    descFireball: 'Launches an explosive fireball at enemies',
    descIceball: 'Throws an ice orb that freezes enemies on impact',
    descPoisonCloud: 'Creates a toxic cloud that damages enemies over time',
    descShockwave: 'Releases a shockwave that knocks back all nearby enemies',

    // Misc
    rerollCost: 'REROLL (10 MAX HP)',
    weaponSlotFull: 'Weapon Slots Full!',
    skillsSwapped: 'Skills Swapped!',
    bossDefeated: 'BOSS DEFEATED!',
    newZone: 'NEW ZONE',
};

export const LOCALE_TH: LocaleStrings = {
    // UI
    play: 'เริ่มเกม',
    leaderboard: 'ตารางคะแนน',
    settings: 'ตั้งค่า',
    resume: 'เล่นต่อ',
    restart: 'เริ่มใหม่',
    quit: 'ออก',
    close: 'ปิด',

    // Game
    level: 'เลเวล',
    score: 'คะแนน',
    zone: 'โซน',
    time: 'เวลา',
    paused: 'หยุดชั่วคราว',
    gameOver: 'จบเกม',
    enterName: 'กรอกชื่อของคุณ',
    submitScore: 'บันทึกคะแนน',

    // Skills
    skills: 'สกิล',
    skillManagement: 'จัดการสกิล',
    cooldown: 'คูลดาวน์',
    ready: 'พร้อม',

    // Settings
    language: 'ภาษา',
    volume: 'ระดับเสียง',
    masterVolume: 'เสียงหลัก',
    sfxVolume: 'เสียงเอฟเฟกต์',
    musicVolume: 'เสียงเพลง',
    screenShake: 'สั่นหน้าจอ',
    damageNumbers: 'ตัวเลขความเสียหาย',
    showFps: 'แสดง FPS',
    on: 'เปิด',
    off: 'ปิด',

    // Difficulty
    easy: 'ง่าย',
    normal: 'ปกติ',
    hard: 'ยาก',
    abyss: 'นรก',
    hell: 'ขุมนรก',
    impossible: 'เป็นไปไม่ได้',
    godChallenge: 'ท้าทายเทพ',
    rulerChallenge: 'ท้าทายผู้คุมกฏ',

    // Skill Names
    skillBlackHole: 'หลุมดำ',
    skillMeteorShower: 'ฝนดาวตก',
    skillTimeStop: 'หยุดเวลา',
    skillDoom: 'คำสาปมรณะ',
    skillLightningStorm: 'พายุสายฟ้า',
    skillDivineShield: 'โล่ศักดิ์สิทธิ์',
    skillSoulHarvest: 'เก็บเกี่ยววิญญาณ',
    skillFireball: 'ลูกไฟ',
    skillIceball: 'ลูกน้ำแข็ง',
    skillPoisonCloud: 'กลุ่มเมฆพิษ',
    skillShockwave: 'คลื่นกระแทก',

    // Skill Descriptions
    descBlackHole: 'สร้างหลุมดำที่ดูดและสร้างความเสียหายแก่ศัตรูทั้งหมดที่อยู่ใกล้',
    descMeteorShower: 'เรียกอุกกาบาตจากท้องฟ้าสร้างความเสียหายพื้นที่มหาศาล',
    descTimeStop: 'หยุดศัตรูทั้งหมดให้อยู่กับที่ชั่วขณะ',
    descDoom: 'ประทับตราศัตรูเพื่อความตาย สร้างความเสียหายมหาศาลหลังจากดีเลย์',
    descLightningStorm: 'เรียกสายฟ้าหลายครั้งทั่วพื้นที่',
    descDivineShield: 'กลายเป็นอมตะชั่วขณะ',
    descSoulHarvest: 'สังหารศัตรูเลือดน้อยที่อยู่ใกล้ทันที',
    descFireball: 'ยิงลูกไฟระเบิดใส่ศัตรู',
    descIceball: 'ขว้างลูกน้ำแข็งที่แช่แข็งศัตรูเมื่อโดน',
    descPoisonCloud: 'สร้างกลุ่มเมฆพิษที่สร้างความเสียหายตลอดเวลา',
    descShockwave: 'ปล่อยคลื่นกระแทกผลักศัตรูทั้งหมดออกไป',

    // Misc
    rerollCost: 'สุ่มใหม่ (10 HP สูงสุด)',
    weaponSlotFull: 'ช่องอาวุธเต็ม!',
    skillsSwapped: 'สลับสกิลแล้ว!',
    bossDefeated: 'เอาชนะบอสแล้ว!',
    newZone: 'โซนใหม่',
};

// Global locale manager
class LocaleManager {
    private currentLanguage: Language = 'EN';
    private strings: LocaleStrings = LOCALE_EN;
    private listeners: (() => void)[] = [];

    get lang(): Language {
        return this.currentLanguage;
    }

    get t(): LocaleStrings {
        return this.strings;
    }

    setLanguage(lang: Language): void {
        this.currentLanguage = lang;
        this.strings = lang === 'TH' ? LOCALE_TH : LOCALE_EN;
        localStorage.setItem('cosmos_language', lang);
        this.notifyListeners();
    }

    loadSavedLanguage(): void {
        const saved = localStorage.getItem('cosmos_language') as Language | null;
        if (saved && (saved === 'EN' || saved === 'TH')) {
            this.setLanguage(saved);
        }
    }

    onLanguageChange(callback: () => void): void {
        this.listeners.push(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb());
    }
}

export const Locale = new LocaleManager();
