/**
 * Stat Preset System
 * ระบบบันทึก/โหลด build configurations
 */

export interface StatPreset {
    id: string;
    name: string;
    description?: string;
    createdAt: number;
    data: {
        // Player stats
        damage?: number;
        maxHp?: number;
        maxSpeed?: number;
        fireRate?: number;
        critChance?: number;
        // Active skills
        skills?: string[];
        // Active weapons
        weapons?: Array<{
            type: string;
            damage: number;
            fireRate: number;
            range: number;
            color: string;
            name: string;
        }>;
        // Cards/Upgrades
        upgrades?: string[];
    };
}

export class StatPresetSystem {
    private game: any;
    public presets: Map<string, StatPreset> = new Map();
    public maxPresets: number = 10;

    constructor(game: any) {
        this.game = game;
        this.loadPresets();
    }

    /**
     * Save current build as a preset
     */
    savePreset(name: string, description?: string): boolean {
        if (this.presets.size >= this.maxPresets) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "MAX PRESETS REACHED!",
                '#ff0000'
            );
            return false;
        }

        const preset: StatPreset = {
            id: `preset_${Date.now()}`,
            name: name,
            description: description,
            createdAt: Date.now(),
            data: {
                damage: this.game.player?.damage,
                maxHp: this.game.player?.maxHp,
                maxSpeed: this.game.player?.maxSpeed,
                fireRate: this.game.player?.baseFireRate,
                critChance: this.game.player?.critChance,
                skills: this.game.skillSystem?.activeSkills.map((s: any) => s.id || s.name) || [],
                weapons: this.game.weaponSystem?.activeWeapons.map((w: any) => ({
                    type: w.config?.type || w.type,
                    damage: w.damage || w.config?.damage,
                    fireRate: w.config?.fireRate || w.fireRate,
                    range: w.config?.range || w.range,
                    color: w.config?.color || w.color,
                    name: w.config?.name || w.name
                })) || [],
                upgrades: this.game.stateManager?.acquiredUpgrades.map((u: any) => u.name) || []
            }
        };

        this.presets.set(preset.id, preset);
        this.savePresets();

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `PRESET SAVED: ${name}!`,
            '#00ff00'
        );

        return true;
    }

    /**
     * Load a preset
     */
    loadPreset(presetId: string): boolean {
        const preset = this.presets.get(presetId);
        if (!preset) {
            this.game.spawnFloatingText(
                this.game.player.x,
                this.game.player.y,
                "PRESET NOT FOUND!",
                '#ff0000'
            );
            return false;
        }

        // Apply player stats (if in a safe state)
        if (this.game.player) {
            if (preset.data.damage !== undefined) {
                this.game.player.damage = preset.data.damage;
            }
            if (preset.data.maxHp !== undefined) {
                this.game.player.maxHp = preset.data.maxHp;
                this.game.player.hp = Math.min(this.game.player.hp, this.game.player.maxHp);
            }
            if (preset.data.maxSpeed !== undefined) {
                this.game.player.maxSpeed = preset.data.maxSpeed;
            }
            if (preset.data.fireRate !== undefined) {
                this.game.player.baseFireRate = preset.data.fireRate;
            }
            if (preset.data.critChance !== undefined) {
                this.game.player.critChance = preset.data.critChance;
            }
        }

        // Note: Skills and weapons would need to be applied during game setup
        // This is a simplified version - full implementation would require
        // more complex state management

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            `PRESET LOADED: ${preset.name}!`,
            '#00ffff'
        );

        return true;
    }

    /**
     * Delete a preset
     */
    deletePreset(presetId: string): boolean {
        if (!this.presets.has(presetId)) {
            return false;
        }

        this.presets.delete(presetId);
        this.savePresets();

        this.game.spawnFloatingText(
            this.game.player.x,
            this.game.player.y,
            "PRESET DELETED!",
            '#ffaa00'
        );

        return true;
    }

    /**
     * Get all presets
     */
    getAllPresets(): StatPreset[] {
        return Array.from(this.presets.values()).sort((a, b) => b.createdAt - a.createdAt);
    }

    /**
     * Get preset by ID
     */
    getPreset(presetId: string): StatPreset | undefined {
        return this.presets.get(presetId);
    }

    /**
     * Export preset as JSON string
     */
    exportPreset(presetId: string): string | null {
        const preset = this.presets.get(presetId);
        if (!preset) return null;
        return JSON.stringify(preset, null, 2);
    }

    /**
     * Import preset from JSON string
     */
    importPreset(jsonString: string): boolean {
        try {
            const preset = JSON.parse(jsonString) as StatPreset;
            if (!preset.id || !preset.name || !preset.data) {
                return false;
            }

            // Generate new ID if importing
            preset.id = `preset_${Date.now()}`;
            preset.createdAt = Date.now();

            if (this.presets.size >= this.maxPresets) {
                return false;
            }

            this.presets.set(preset.id, preset);
            this.savePresets();

            return true;
        } catch (e) {
            console.error('Failed to import preset:', e);
            return false;
        }
    }

    /**
     * Save presets to localStorage
     */
    savePresets(): void {
        const data = Array.from(this.presets.values());

        try {
            localStorage.setItem('cosmos_stat_presets', JSON.stringify(data));
        } catch (e) {
            console.error('Failed to save presets:', e);
        }
    }

    /**
     * Load presets from localStorage
     */
    loadPresets(): void {
        try {
            const dataStr = localStorage.getItem('cosmos_stat_presets');
            if (!dataStr) return;

            const data = JSON.parse(dataStr);
            data.forEach((preset: StatPreset) => {
                this.presets.set(preset.id, preset);
            });
        } catch (e) {
            console.error('Failed to load presets:', e);
        }
    }

    /**
     * Reset presets
     */
    reset(): void {
        this.presets.clear();
        this.savePresets();
    }
}
