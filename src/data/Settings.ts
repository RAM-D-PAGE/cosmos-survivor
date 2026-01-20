// Game Settings System
// Manages user preferences and QoL settings

export interface GameSettings {
    language: 'EN' | 'TH';
    masterVolume: number;  // 0-1
    sfxVolume: number;     // 0-1
    musicVolume: number;   // 0-1
    screenShake: boolean;
    damageNumbers: boolean;
    showFps: boolean;
    autoPauseOnBlur: boolean;
}

const DEFAULT_SETTINGS: GameSettings = {
    language: 'EN',
    masterVolume: 0.7,
    sfxVolume: 0.8,
    musicVolume: 0.5,
    screenShake: true,
    damageNumbers: true,
    showFps: false,
    autoPauseOnBlur: true,
};

class SettingsManager {
    private settings: GameSettings;
    private listeners: ((settings: GameSettings) => void)[] = [];

    constructor() {
        this.settings = { ...DEFAULT_SETTINGS };
        this.load();
    }

    get(): GameSettings {
        return { ...this.settings };
    }

    set<K extends keyof GameSettings>(key: K, value: GameSettings[K]): void {
        this.settings[key] = value;
        this.save();
        this.notifyListeners();
    }

    setAll(settings: Partial<GameSettings>): void {
        this.settings = { ...this.settings, ...settings };
        this.save();
        this.notifyListeners();
    }

    reset(): void {
        this.settings = { ...DEFAULT_SETTINGS };
        this.save();
        this.notifyListeners();
    }

    private save(): void {
        try {
            localStorage.setItem('cosmos_settings', JSON.stringify(this.settings));
        } catch (e) {
            console.warn('Could not save settings:', e);
        }
    }

    private load(): void {
        try {
            const saved = localStorage.getItem('cosmos_settings');
            if (saved) {
                const parsed = JSON.parse(saved);
                this.settings = { ...DEFAULT_SETTINGS, ...parsed };
            }
        } catch (e) {
            console.warn('Could not load settings:', e);
        }
    }

    onChange(callback: (settings: GameSettings) => void): void {
        this.listeners.push(callback);
    }

    private notifyListeners(): void {
        this.listeners.forEach(cb => cb(this.settings));
    }
}

export const Settings = new SettingsManager();
