export class AudioSystem {
    public ctx: AudioContext;
    private masterVolume: number;
    private sfxVolume: number;
    public enabled: boolean;
    private lastPlayed: Map<string, number> = new Map();

    constructor() {
        this.ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        this.masterVolume = 0.3;
        this.sfxVolume = 1.0;
        this.enabled = true;
    }

    private canPlay(key: string, cooldown: number): boolean {
        const now = this.ctx.currentTime;
        const last = this.lastPlayed.get(key) || 0;
        if (now - last < cooldown) return false;
        this.lastPlayed.set(key, now);
        return true;
    }

    setMasterVolume(value: number): void {
        this.masterVolume = Math.max(0, Math.min(1, value));
    }

    setSfxVolume(value: number): void {
        this.sfxVolume = Math.max(0, Math.min(1, value));
    }

    playShoot(): void {
        if (!this.enabled) return;
        // Limit shoot sound to every 0.08s to avoid machine gun distortion
        if (!this.canPlay('shoot', 0.08)) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'square';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playDash(): void {
        if (!this.enabled) return;
        if (!this.canPlay('dash', 0.2)) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.2);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.2);
    }

    playHit(): void {
        if (!this.enabled) return;
        if (!this.canPlay('hit', 0.1)) return; // 0.1s limit for hits

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(150, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(50, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playExplosion(): void {
        if (!this.enabled) return;
        if (!this.canPlay('explosion', 0.15)) return; // 0.15s limit for explosions

        // Simple noise logic
        const bufferSize = this.ctx.sampleRate * 0.5; // 0.5 seconds
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);

        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1;
        }

        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;

        const gain = this.ctx.createGain();
        noise.connect(gain);
        gain.connect(this.ctx.destination);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        noise.start();
    }

    playLevelUp(): void {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(400, this.ctx.currentTime);
        osc.frequency.setValueAtTime(600, this.ctx.currentTime + 0.1);
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime + 0.2);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume, this.ctx.currentTime);
        gain.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.6);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.6);
    }

    playGem(): void {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1200, this.ctx.currentTime + 0.1);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.1);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.1);
    }

    playClick(): void {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(400, this.ctx.currentTime + 0.05);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.05);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.05);
    }

    playSkill(): void {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(200, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(800, this.ctx.currentTime + 0.15);
        osc.frequency.exponentialRampToValueAtTime(200, this.ctx.currentTime + 0.3);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.5, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.3);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.3);
    }

    playMystical(): void {
        if (!this.enabled) return;
        const osc1 = this.ctx.createOscillator();
        const osc2 = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(this.ctx.destination);

        osc1.type = 'sine';
        osc2.type = 'triangle';
        osc1.frequency.setValueAtTime(300, this.ctx.currentTime);
        osc2.frequency.setValueAtTime(450, this.ctx.currentTime);
        osc1.frequency.exponentialRampToValueAtTime(600, this.ctx.currentTime + 0.5);
        osc2.frequency.exponentialRampToValueAtTime(900, this.ctx.currentTime + 0.5);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.5);

        osc1.start();
        osc2.start();
        osc1.stop(this.ctx.currentTime + 0.5);
        osc2.stop(this.ctx.currentTime + 0.5);
    }

    playSlash(): void {
        if (!this.enabled) return;
        if (!this.canPlay('slash', 0.05)) return;

        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(800, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.15);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.4, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.15);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.15);
    }

    playFreeze(): void {
        if (!this.enabled) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.type = 'sine';
        osc.frequency.setValueAtTime(1000, this.ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(100, this.ctx.currentTime + 0.4);

        gain.gain.setValueAtTime(this.masterVolume * this.sfxVolume * 0.3, this.ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, this.ctx.currentTime + 0.4);

        osc.start();
        osc.stop(this.ctx.currentTime + 0.4);
    }
}
