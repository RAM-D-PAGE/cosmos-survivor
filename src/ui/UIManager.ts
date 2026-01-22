import { CONFIG } from '../core/Config';
import { Game } from '../core/Game';
import { sanitize, buildSkillHtml } from '../core/Sanitizer';

export class UIManager {
    public currentLocale: 'EN' | 'TH' = 'EN';
    private game: Game;
    private uiExpBar: HTMLElement | null;
    private uiExpText: HTMLElement | null;
    private uiGameTimer: HTMLElement | null;
    private uiZoneBar: HTMLElement | null;
    private uiZoneLabel: HTMLElement | null;
    private uiHpBar: HTMLElement | null;
    private uiHpText: HTMLElement | null;
    private uiEnergyBar: HTMLElement | null;
    private uiUpgradeMenu: HTMLElement | null;
    private uiCardContainer: HTMLElement | null;
    private uiMainMenu: HTMLElement | null;
    private uiGameOver: HTMLElement | null;
    private tooltip: HTMLElement | null;

    constructor(game: any) {
        this.game = game;

        this.uiExpBar = document.getElementById('exp-bar-fill');
        this.uiExpText = document.getElementById('exp-text');
        this.uiGameTimer = document.getElementById('game-timer');
        this.uiZoneBar = document.getElementById('zone-progress-bar');
        this.uiZoneLabel = document.getElementById('zone-progress-label');

        this.uiHpBar = document.getElementById('hp-bar-fill');
        this.uiHpText = document.getElementById('hp-text');
        this.uiEnergyBar = document.getElementById('energy-bar-fill');

        this.uiUpgradeMenu = document.getElementById('upgrade-menu');
        this.uiCardContainer = document.getElementById('card-container');
        this.uiMainMenu = document.getElementById('main-menu');
        this.uiGameOver = document.getElementById('game-over-screen');

        this.tooltip = document.getElementById('tooltip');

        this.setupEventListeners();
    }

    setupEventListeners(): void {
        console.log("[UI] Setting up event listeners...");
        const getBtn = (id: string) => {
            const el = document.getElementById(id);
            if (!el) console.warn(`[UI] Button not found: ${id}`);
            return el;
        };

        // Force pointer events for menu manually just in case CSS fails
        if (this.uiMainMenu) {
            this.uiMainMenu.style.pointerEvents = 'auto';
            this.uiMainMenu.style.zIndex = '1000';
            console.log("[UI] Main Menu pointer-events set to auto");
        }

        getBtn('restart-btn')?.addEventListener('click', () => {
            console.log("[UI] Restart Clicked");
            this.game.restart();
        });
        getBtn('quit-btn')?.addEventListener('click', () => location.reload());

        getBtn('start-btn')?.addEventListener('click', () => {
            console.log("[UI] Start Clicked");
            this.showDifficultySelect();
        });

        getBtn('submit-score-btn')?.addEventListener('click', () => this.game.submitScore());

        getBtn('pause-btn')?.addEventListener('click', () => this.game.togglePause());
        getBtn('resume-btn')?.addEventListener('click', () => this.game.togglePause());
        getBtn('manage-skills-btn')?.addEventListener('click', () => this.showSkillManagePanel());


        this.setupDifficultyButtons();

        getBtn('open-leaderboard-btn')?.addEventListener('click', () => {
            console.log("[UI] Leaderboard Clicked");
            this.game.showLeaderboard(false);
        });
        getBtn('close-leaderboard-btn')?.addEventListener('click', () => this.showMainMenu());

        // Skill Management
        getBtn('close-skill-manage-btn')?.addEventListener('click', () => this.hideSkillManagePanel());
        this.setupSkillManagePanel();

        // Settings Panel
        getBtn('open-settings-btn')?.addEventListener('click', () => this.showSettingsPanel());
        getBtn('close-settings-btn')?.addEventListener('click', () => this.hideSettingsPanel());
        getBtn('open-help-btn')?.addEventListener('click', () => this.showHelpPanel());
        getBtn('close-help-btn')?.addEventListener('click', () => this.hideHelpPanel());
        this.setupSettingsPanel();

        // Shop System
        getBtn('open-shop-btn')?.addEventListener('click', () => this.showShop());
        getBtn('close-shop-btn')?.addEventListener('click', () => this.hideShop());

        // MultiPlayer System
        getBtn('start-multiplayer-btn')?.addEventListener('click', () => this.showMultiPlayerMenu());
        getBtn('create-room-btn')?.addEventListener('click', () => this.createRoom());
        getBtn('join-room-btn')?.addEventListener('click', () => this.joinRoom());
        getBtn('close-multiplayer-btn')?.addEventListener('click', () => this.hideMultiPlayerMenu());

        // Login System
        getBtn('login-btn')?.addEventListener('click', () => this.showLoginModal());
        getBtn('logout-btn')?.addEventListener('click', () => {
            this.game.loginSystem.logout();
            this.updateLoginState();
        });

        const handleAuth = async (isRegister: boolean) => {
            const userIn = document.getElementById('login-username-input') as HTMLInputElement;
            const passIn = document.getElementById('login-password-input') as HTMLInputElement;
            const msgEl = document.getElementById('login-msg');

            if (!userIn || !passIn) return;
            const username = userIn.value.trim();
            const password = passIn.value.trim();

            if (username.length < 3 || password.length < 3) {
                if (msgEl) msgEl.innerText = "Too short (min 3 chars)";
                return;
            }

            if (msgEl) msgEl.innerText = "Processing...";

            let result;
            if (isRegister) {
                result = await this.game.loginSystem.register(username, password);
            } else {
                result = await this.game.loginSystem.login(username, password);
            }

            if (result.success) {
                if (isRegister) {
                    if (msgEl) {
                        msgEl.innerText = "Registered! Please Login.";
                        msgEl.style.color = "#00ff00";
                    }
                } else {
                    this.hideLoginModal();
                    this.updateLoginState();
                }
            } else {
                if (msgEl) {
                    msgEl.innerText = result.message || "Error";
                    msgEl.style.color = "#ff0000";
                }
            }
        };

        getBtn('confirm-login-btn')?.addEventListener('click', () => handleAuth(false));
        getBtn('register-btn')?.addEventListener('click', () => handleAuth(true));
        getBtn('cancel-login-btn')?.addEventListener('click', () => this.hideLoginModal());
        getBtn('google-login-btn')?.addEventListener('click', () => {
            this.game.loginSystem.loginWithGoogle();
        });

        // TikTok Integration
        getBtn('link-tiktok-btn')?.addEventListener('click', () => this.handleTikTokLink());

        // Initial Login Item Check
        this.updateLoginState();
    }

    updateLoginState(): void {
        const loginBtn = document.getElementById('login-btn');
        const logoutBtn = document.getElementById('logout-btn');
        const userDisplay = document.getElementById('user-display');
        const tiktokBtn = document.getElementById('link-tiktok-btn');

        if (this.game.loginSystem.isLoggedIn) {
            if (loginBtn) loginBtn.classList.add('hidden');
            if (logoutBtn) logoutBtn.classList.remove('hidden');
            if (userDisplay) {
                userDisplay.innerText = `PILOT: ${this.game.loginSystem.username}`;
                userDisplay.classList.remove('hidden');
            }
            if (tiktokBtn) tiktokBtn.classList.remove('hidden');
        } else {
            if (loginBtn) loginBtn.classList.remove('hidden');
            if (logoutBtn) logoutBtn.classList.add('hidden');
            if (userDisplay) userDisplay.classList.add('hidden');
            if (tiktokBtn) tiktokBtn.classList.add('hidden'); // Only logged in users can link? Or optional. Let's hide to encourage login.
        }
    }

    showLoginModal(): void {
        const modal = document.getElementById('login-modal');
        const msg = document.getElementById('login-msg');
        const userIn = document.getElementById('login-username-input') as HTMLInputElement;
        const passIn = document.getElementById('login-password-input') as HTMLInputElement;

        if (userIn) userIn.value = '';
        if (passIn) passIn.value = '';
        if (msg) msg.innerText = '';

        if (modal) modal.classList.remove('hidden');
        if (this.uiMainMenu) this.uiMainMenu.classList.add('hidden');
    }

    hideLoginModal(): void {
        const modal = document.getElementById('login-modal');
        if (modal) modal.classList.add('hidden');

        // Restore Main Menu if we are not in-game (checking if HUD is hidden is a good proxy)
        const hud = document.getElementById('hud');
        if (hud && hud.classList.contains('hidden')) {
            if (this.uiMainMenu) this.uiMainMenu.classList.remove('hidden');
        }
    }

    handleTikTokLink(): void {
        const btn = document.getElementById('link-tiktok-btn');
        if (btn) btn.innerText = "Linking...";

        // Simulate API call
        setTimeout(() => {
            this.game.unlockTikTokReward();
            if (btn) {
                btn.innerText = "TikTok Linked!";
                (btn as HTMLButtonElement).disabled = true;
            }
            alert("TikTok Account Linked! You received the 'TikTok Follower' Drone!");
        }, 1500);
    }

    setupSettingsPanel(): void {
        // Language buttons
        document.getElementById('lang-en-btn')?.addEventListener('click', () => {
            this.setLanguage('EN');
        });
        document.getElementById('lang-th-btn')?.addEventListener('click', () => {
            this.setLanguage('TH');
        });

        // Volume sliders
        const masterVol = document.getElementById('master-volume') as HTMLInputElement;
        const masterVolVal = document.getElementById('master-volume-val');
        masterVol?.addEventListener('input', () => {
            const val = parseInt(masterVol.value);
            if (masterVolVal) masterVolVal.innerText = `${val}%`;
            this.game.audio.setMasterVolume(val / 100);
            localStorage.setItem('cosmos_master_volume', masterVol.value);
        });

        const sfxVol = document.getElementById('sfx-volume') as HTMLInputElement;
        const sfxVolVal = document.getElementById('sfx-volume-val');
        sfxVol?.addEventListener('input', () => {
            const val = parseInt(sfxVol.value);
            if (sfxVolVal) sfxVolVal.innerText = `${val}%`;
            this.game.audio.setSfxVolume(val / 100);
            localStorage.setItem('cosmos_sfx_volume', sfxVol.value);
        });

        // Toggle buttons
        document.getElementById('shake-toggle-btn')?.addEventListener('click', (e) => {
            const btn = e.target as HTMLButtonElement;
            const isOn = btn.classList.toggle('active');
            btn.innerText = isOn ? 'ON' : 'OFF';
            this.game.screenShakeEnabled = isOn;
            localStorage.setItem('cosmos_screen_shake', isOn ? '1' : '0');
        });

        document.getElementById('dmg-numbers-toggle-btn')?.addEventListener('click', (e) => {
            const btn = e.target as HTMLButtonElement;
            const isOn = btn.classList.toggle('active');
            btn.innerText = isOn ? 'ON' : 'OFF';
            this.game.damageNumbersEnabled = isOn;
            localStorage.setItem('cosmos_damage_numbers', isOn ? '1' : '0');
        });

        document.getElementById('fps-toggle-btn')?.addEventListener('click', (e) => {
            const btn = e.target as HTMLButtonElement;
            const isOn = btn.classList.toggle('active');
            btn.innerText = isOn ? 'ON' : 'OFF';
            this.game.showFps = isOn;
            this.toggleFpsCounter(isOn);
            this.game.showFps = isOn;
            this.toggleFpsCounter(isOn);
            localStorage.setItem('cosmos_show_fps', isOn ? '1' : '0');
        });

        document.getElementById('delay-toggle-btn')?.addEventListener('click', (e) => {
            const btn = e.target as HTMLButtonElement;
            const isOn = btn.classList.toggle('active');
            btn.innerText = isOn ? 'ON' : 'OFF';
            this.game.resumeCountdownEnabled = isOn;
            localStorage.setItem('cosmos_resume_delay', isOn ? '1' : '0');
        });

        document.getElementById('open-settings-btn')?.addEventListener('click', () => {
            this.showSettingsPanel();
        });
        document.getElementById('pause-settings-btn')?.addEventListener('click', () => {
            this.showSettingsPanel();
        });

        document.getElementById('close-settings-btn')?.addEventListener('click', () => {
            this.hideSettingsPanel();
        });

        // Load saved settings
        this.loadSavedSettings();
    }

    loadSavedSettings(): void {
        // Language
        const savedLang = localStorage.getItem('cosmos_language') || 'EN';
        this.setLanguage(savedLang as 'EN' | 'TH');

        // Volumes
        const masterVolSlider = document.getElementById('master-volume') as HTMLInputElement;
        const savedMaster = localStorage.getItem('cosmos_master_volume');
        if (savedMaster && masterVolSlider) {
            masterVolSlider.value = savedMaster;
            const val = document.getElementById('master-volume-val');
            if (val) val.innerText = `${savedMaster}%`;
        }

        const sfxVolSlider = document.getElementById('sfx-volume') as HTMLInputElement;
        const savedSfx = localStorage.getItem('cosmos_sfx_volume');
        if (savedSfx && sfxVolSlider) {
            sfxVolSlider.value = savedSfx;
            const val = document.getElementById('sfx-volume-val');
            if (val) val.innerText = `${savedSfx}%`;
        }

        // Toggles
        const shakeBtn = document.getElementById('shake-toggle-btn');
        const savedShake = localStorage.getItem('cosmos_screen_shake');

        if (shakeBtn && savedShake === '0') {
            shakeBtn.classList.remove('active');
            shakeBtn.innerText = 'OFF';
            this.game.screenShakeEnabled = false;
        } else {
            // Default ON
            if (shakeBtn) {
                shakeBtn.classList.add('active');
                shakeBtn.innerText = 'ON';
            }
            this.game.screenShakeEnabled = true;
        }

        const delayBtn = document.getElementById('delay-toggle-btn');
        const savedDelay = localStorage.getItem('cosmos_resume_delay');
        if (delayBtn) {
            if (savedDelay === '0') {
                delayBtn.classList.remove('active');
                delayBtn.innerText = 'OFF';
                this.game.resumeCountdownEnabled = false;
            } else {
                // Default ON
                delayBtn.classList.add('active');
                delayBtn.innerText = 'ON';
                this.game.resumeCountdownEnabled = true;
            }
        }
        const dmgBtn = document.getElementById('dmg-numbers-toggle-btn');
        const savedDmg = localStorage.getItem('cosmos_damage_numbers');
        if (dmgBtn && savedDmg === '0') {
            dmgBtn.classList.remove('active');
            dmgBtn.innerText = 'OFF';
            this.game.damageNumbersEnabled = false;
        }

        const fpsBtn = document.getElementById('fps-toggle-btn');
        const savedFps = localStorage.getItem('cosmos_show_fps');
        if (fpsBtn && savedFps === '1') {
            fpsBtn.classList.add('active');
            fpsBtn.innerText = 'ON';
            this.game.showFps = true;
            this.toggleFpsCounter(true);
        }
    }

    setLanguage(lang: 'EN' | 'TH'): void {
        localStorage.setItem('cosmos_language', lang);

        // Update button states
        const enBtn = document.getElementById('lang-en-btn');
        const thBtn = document.getElementById('lang-th-btn');
        if (enBtn) enBtn.classList.toggle('active', lang === 'EN');
        if (thBtn) thBtn.classList.toggle('active', lang === 'TH');

        // Apply translations (simplified for now - just update key UI elements)
        this.applyLocale(lang);
    }

    applyLocale(lang: 'EN' | 'TH'): void {
        const t = lang === 'TH' ? {
            play: 'เริ่มเกม',
            leaderboard: 'ตารางคะแนน',
            settings: 'ตั้งค่า',
            close: 'ปิด',
            resume: 'เล่นต่อ',
            restart: 'เริ่มใหม่',
            language: 'ภาษา',
            masterVolume: 'เสียงหลัก',
            sfxVolume: 'เสียงเอฟเฟกต์',
            screenShake: 'สั่นหน้าจอ',
            damageNumbers: 'ตัวเลขความเสียหาย',
            showFps: 'แสดง FPS',
            skillManagement: 'จัดการสกิล',
        } : {
            play: 'PLAY',
            leaderboard: 'LEADERBOARD',
            settings: 'SETTINGS',
            close: 'CLOSE',
            resume: 'RESUME',
            restart: 'RESTART',
            language: 'Language',
            masterVolume: 'Master Volume',
            sfxVolume: 'SFX Volume',
            screenShake: 'Screen Shake',
            damageNumbers: 'Damage Numbers',
            showFps: 'Show FPS',
            skillManagement: 'SKILL MANAGEMENT',
        };

        // Apply to data-locale elements
        document.querySelectorAll('[data-locale]').forEach((el) => {
            const key = (el as HTMLElement).dataset.locale as keyof typeof t;
            if (t[key]) {
                el.textContent = t[key];
            }
        });
    }

    toggleFpsCounter(show: boolean): void {
        let fpsEl = document.getElementById('fps-counter');
        if (show && !fpsEl) {
            fpsEl = document.createElement('div');
            fpsEl.id = 'fps-counter';
            fpsEl.innerText = 'FPS: --';
            document.body.appendChild(fpsEl);
        } else if (!show && fpsEl) {
            fpsEl.remove();
        }
    }

    showSettingsPanel(): void {
        document.getElementById('settings-panel')?.classList.remove('hidden');
        this.uiMainMenu?.classList.add('hidden');
        // Hide Pause Menu if open
        document.getElementById('skills-menu')?.classList.add('hidden');
    }

    hideSettingsPanel(): void {
        document.getElementById('settings-panel')?.classList.add('hidden');

        if (this.game.isPaused && this.game.gameState === 'PLAYING') {
            // Return to Pause Menu (Skills Menu) if paused in game
            document.getElementById('skills-menu')?.classList.remove('hidden');
        } else {
            // If HUD is hidden, we assume we are at Main Menu state, so restore it
            const hud = document.getElementById('hud');
            if (hud && hud.classList.contains('hidden')) {
                this.uiMainMenu?.classList.remove('hidden');
            }
        }
    }

    // Skill icon mapping using emoji (expanded)
    getSkillIcon(skillId: string): string {
        const icons: Record<string, string> = {
            'BLACK_HOLE': '🕳️',
            'METEOR_SHOWER': '☄️',
            'TIME_STOP': '⏱️',
            'DOOM': '💀',
            'LIGHTNING_STORM': '⚡',
            'DIVINE_SHIELD': '🛡️',
            'SOUL_HARVEST': '👻',
            'FIREBALL': '🔥',
            'ICEBALL': '❄️',
            'POISON_CLOUD': '☠️',
            'SHOCKWAVE': '💥',
            'GRAVITY_WELL': '🌌',
            'PHOENIX_REBIRTH': '🌟',
            'CLONE_ARMY': '👥',
            'ARMAGEDDON': '🌋',
            'TIME_REVERSAL': '⏪',
            'INFINITE_POWER': '💪',
            'CHAIN_EXPLOSION': '💣',
            'BLADE_STORM': '⚔️',
            'MIRROR_IMAGE': '🪞',
            'HEAL_AURA': '💚',
            'SPEED_BOOST': '⏩',
            'ACID_SPRAY': '🧪',
            'FROST_NOVA': '🥶',
            'THUNDER_CLAP': '⚡',
            'SHIELD_BASH': '🛡️',
            'SLOW_FIELD': '🐌',
            'QUICK_HEAL': '⛑️',
            'MINI_EXPLOSION': '💥',
            'PLASMA_BURST': '🔵',
            'VOID_SLASH': '🗡️',
            'ELECTRIC_FIELD': '🔌',
            'EXPLOSIVE_SHOT': '🎯',
            'ICE_SPIKE': '🧊',
            'POISON_DART': '🗡️',
            'MAGNETIC_PULL': '🧲',
            'DIMENSION_RIFT': '🌀',
            'CHRONO_FIELD': '⏳',
            'SOUL_BIND': '🔗',
            'COSMIC_ANNIHILATION': '🌠',
            'INFINITY_LOOP': '♾️',
            'QUANTUM_OVERDRIVE': '⚛️',
            'VOID_ERASURE': '🕳️',
            'BEAM_ERASURE': '🔦',
            'CLOUD_PIERCING': '🌫️',
            'DASH_SLASH': '💨',
        };
        return icons[skillId] || '✨';
    }

    private selectedSwapSlot: number = -1;
    private draggedSlot: number = -1;

    setupSkillManagePanel(): void {
        // Use delegation for better dynamic handling
        const container = document.getElementById('skill-manage-panel');
        if (!container) return;

        container.addEventListener('dragstart', (e: any) => {
            if (e.target && e.target.classList && (e.target.classList.contains('slot-manage') || e.target.classList.contains('bag-slot'))) {
                const slotIndex = parseInt(e.target.dataset.slot || '0');
                this.draggedSlot = slotIndex;
                e.target.classList.add('dragging');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', slotIndex.toString());
                }
            }
        });

        container.addEventListener('dragend', (e: any) => {
            if (e.target) e.target.classList.remove('dragging');
            this.draggedSlot = -1;
        });

        container.addEventListener('dragover', (e: any) => {
            e.preventDefault();
            if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
            if (e.target && e.target.classList && (e.target.classList.contains('slot-manage') || e.target.classList.contains('bag-slot'))) {
                e.target.classList.add('drag-over');
            }
        });

        container.addEventListener('dragleave', (e: any) => {
            if (e.target) e.target.classList.remove('drag-over');
        });

        container.addEventListener('drop', (e: any) => {
            e.preventDefault();
            // Find closest slot
            const targetEl = e.target.closest('.slot-manage, .bag-slot');
            if (targetEl) {
                targetEl.classList.remove('drag-over');
                const targetIndex = parseInt(targetEl.dataset.slot || '0');
                if (this.draggedSlot !== -1 && this.draggedSlot !== targetIndex) {
                    this.swapSkills(this.draggedSlot, targetIndex);
                }
            }
            this.draggedSlot = -1;
        });

        container.addEventListener('click', (e: any) => {
            const targetEl = e.target.closest('.slot-manage, .bag-slot');
            if (targetEl) {
                const slotIndex = parseInt(targetEl.dataset.slot || '0');
                if (this.selectedSwapSlot === -1) {
                    this.selectedSwapSlot = slotIndex;
                    targetEl.classList.add('selected');
                } else if (this.selectedSwapSlot === slotIndex) {
                    this.selectedSwapSlot = -1;
                    targetEl.classList.remove('selected');
                } else {
                    this.swapSkills(this.selectedSwapSlot, slotIndex);
                    this.selectedSwapSlot = -1;
                    // proper toggle remove
                    container.querySelectorAll('.selected').forEach((el: any) => el.classList.remove('selected'));
                }
            }
        });
    }

    swapSkills(a: number, b: number): void {
        if (!this.game.skillSystem) return;

        const active = this.game.skillSystem.activeSkills;
        const bag = this.game.skillSystem.bagSkills;

        const getSkill = (idx: number) => {
            if (idx < 100) return active[idx];
            return bag[idx - 100];
        };

        const setSkill = (idx: number, val: any) => {
            if (idx < 100) active[idx] = val;
            else bag[idx - 100] = val;
        };

        const skillA = getSkill(a);
        const skillB = getSkill(b);

        // Allow swapping (swap values logic)
        // Note: activeSkills usually should check maxSkills but here we are just swapping slots.
        // If swapping from bag to active (and active is full/defined), it's a swap.
        // If swapping from bag to active (and active is empty/undefined), it's a move.
        // Arrays might have holes if we use direct assignment, but TS array is flexible.
        // Cleaner to use splice or direct assignment logic.

        // Logic:
        // 1. Remove A from source
        // 2. Insert B into source A
        // 3. Put A into source B
        // Wait, Array indices...

        setSkill(a, skillB);
        setSkill(b, skillA);

        // Cleanup undefined from active if they became empty? 
        // No, activeSkills is likely expected to be compact (length-based) in Update loop?
        // Game.ts/SkillSystem.ts update loop uses `activeSkills.forEach` or index loop.
        // `forEach` skips empty slots if array is sparse. 
        // `activeSkills[index]` access is used.
        // Ideally we should filter out undefined from activeSkills to keep it clean, 
        // but Swapping specific slots (Key 1, Key 2, Key 3) implies fixed slots.
        // If I move Skill 1 to Bag, Slot 1 becomes empty.
        // SkillSystem update loop: `this.activeSkills[index]`
        // So yes, sparse is fine for active slots if we treat them as fixed slots 0,1,2.

        // But `activeSkills` is declared as array. `push` was used.
        // We should treat it as fixed 3 slots now.
        // Or re-pack active skills? 
        // Let's just swap. If undefined is in active, `tryActivateSkill` checks `if (!skill) return`. Safe.

        this.updateSkillManagePanel();
        this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "Skills Swapped!", "#00f0ff");
        this.game.audio.playClick();
    }

    showSkillManagePanel(): void {
        document.getElementById('skill-manage-panel')?.classList.remove('hidden');
        this.game.isPaused = true;
        this.updateSkillManagePanel();
    }

    hideSkillManagePanel(): void {
        document.getElementById('skill-manage-panel')?.classList.add('hidden');
        this.selectedSwapSlot = -1;
        this.game.isPaused = false;
        document.querySelectorAll('.selected').forEach(s => s.classList.remove('selected'));
    }

    updateSkillManagePanel(): void {
        const active = this.game.skillSystem ? this.game.skillSystem.activeSkills : [];
        const bag = this.game.skillSystem ? this.game.skillSystem.bagSkills : [];

        // Update Active Slots (0-2)
        for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`slot-${i}-skill`);
            const slotEl = document.querySelector(`.slot-manage[data-slot="${i}"]`) as HTMLElement;
            if (el && slotEl) {
                const skill = active[i];
                // Use buildSkillHtml to safely construct HTML with colors/icons
                if (skill) {
                    const icon = this.getSkillIcon(skill.id || skill.name);
                    el.innerHTML = buildSkillHtml(icon, skill.name, skill.color);
                    el.style.color = sanitize(skill.color);
                    slotEl.style.borderColor = sanitize(skill.color);
                } else {
                    el.innerHTML = '<span style="color:#666;">Empty</span>';
                    el.style.color = '#666';
                    slotEl.style.borderColor = '#444';
                }
            }
        }

        // Update Bag (100+)
        const bagGrid = document.getElementById('skill-bag-grid');
        if (bagGrid) {
            bagGrid.innerHTML = '';
            // Render existing bag items + 1 empty slot for convenience? Or just render items.
            // If bag is empty, render placeholder.
            if (bag.length === 0) {
                bagGrid.innerHTML = '<span style="color:#666; width:100%; text-align:center;">Empty Bag</span>';
            }

            bag.forEach((skill: any, index: number) => {
                const slotId = 100 + index;
                const div = document.createElement('div');
                div.className = 'bag-slot';
                div.dataset.slot = slotId.toString();
                div.draggable = true;
                div.style.cssText = `
                    width: 60px; height: 60px; border: 1px solid ${skill.color};
                    border-radius: 5px; display: flex; align-items: center; justify-content: center;
                    background: rgba(0,0,0,0.5); cursor: grab; font-size: 24px;
                `;
                div.innerText = this.getSkillIcon(skill.id || skill.name);
                div.title = skill.name;
                bagGrid.appendChild(div);
            });

            // Should we add an empty slot to drag TO if we want to unequip?
            // "Drag from active to bag" appends to bag.
            // But swap requires index.
            // If I drag Active -> Bag, I swap with NEW bag item? No.
            // Let's add an explicit "New Slot" at the end of bag to allow unequip.
            const emptySlotId = 100 + bag.length;
            const emptyDiv = document.createElement('div');
            emptyDiv.className = 'bag-slot';
            emptyDiv.dataset.slot = emptySlotId.toString();
            emptyDiv.style.cssText = `
                width: 60px; height: 60px; border: 1px dashed #444;
                border-radius: 5px; display: flex; align-items: center; justify-content: center;
                color: #444;
            `;
            emptyDiv.innerText = '+';
            bagGrid.appendChild(emptyDiv);
        }
    }

    updateCoins(amount: number): void {
        const el = document.getElementById('coin-display');
        if (el) el.innerText = Math.floor(amount).toString();
    }

    setupDifficultyButtons(): void {
        const diffSelect = document.getElementById('difficulty-select');
        if (!diffSelect) return;

        // Clear existing buttons and create dynamically from CONFIG
        const container = diffSelect.querySelector('.diff-container') || diffSelect;
        container.innerHTML = '';

        const difficulties = Object.keys(CONFIG.DIFFICULTY);

        // Create row containers for layout (4 per row)
        let currentRow: HTMLDivElement | null = null;

        difficulties.forEach((diff, index) => {
            const cfg = CONFIG.DIFFICULTY[diff as keyof typeof CONFIG.DIFFICULTY];
            if (!cfg) return;

            // Create new row every 4 buttons
            if (index % 4 === 0) {
                currentRow = document.createElement('div');
                currentRow.className = 'diff-row';
                currentRow.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; justify-content: center; flex-wrap: wrap;';
                container.appendChild(currentRow);
            }

            const btn = document.createElement('button');
            btn.className = 'diff-btn glow-btn';
            btn.dataset.diff = diff;
            btn.textContent = cfg.name;
            btn.style.cssText = `
                border-color: ${cfg.color};
                color: ${cfg.color};
                min-width: 120px;
                padding: 10px 15px;
                font-size: 14px;
            `;

            btn.addEventListener('click', () => this.game.selectDifficulty(diff));
            btn.addEventListener('mouseenter', () => {
                btn.style.backgroundColor = cfg.color + '33';
                btn.style.boxShadow = `0 0 15px ${cfg.color}`;
            });
            btn.addEventListener('mouseleave', () => {
                btn.style.backgroundColor = 'transparent';
                btn.style.boxShadow = 'none';
            });

            currentRow?.appendChild(btn);
        });
    }

    showMainMenu(): void {
        this.hideAllOverlays();
        this.uiMainMenu?.classList.remove('hidden');

        document.getElementById('start-btn')?.classList.remove('hidden');
        document.getElementById('open-leaderboard-btn')?.classList.remove('hidden');
        document.getElementById('auth-corner')?.classList.remove('hidden');
    }

    showDifficultySelect(): void {
        const diffSelect = document.getElementById('difficulty-select');
        if (diffSelect) {
            diffSelect.classList.remove('hidden');
            this.uiMainMenu?.classList.add('hidden');
        }
    }

    hideDifficultySelect(): void {
        document.getElementById('difficulty-select')?.classList.add('hidden');
    }

    showGameHUD(): void {
        this.uiMainMenu?.classList.add('hidden');
        document.getElementById('hud')?.classList.remove('hidden');
        document.getElementById('dash-indicator')?.classList.remove('hidden');
        document.getElementById('skills-bar')?.classList.remove('hidden');
        document.getElementById('manage-skills-btn')?.classList.remove('hidden');
        document.getElementById('pause-btn-container')?.classList.remove('hidden');
        document.getElementById('auth-corner')?.classList.add('hidden');
        this.uiGameOver?.classList.add('hidden');
    }

    hideAllOverlays(): void {
        document.getElementById('leaderboard')?.classList.add('hidden');
        document.getElementById('difficulty-select')?.classList.add('hidden');
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('dash-indicator')?.classList.add('hidden');
        document.getElementById('skills-bar')?.classList.add('hidden');
        document.getElementById('manage-skills-btn')?.classList.add('hidden');
        document.getElementById('pause-btn-container')?.classList.add('hidden');
        this.uiUpgradeMenu?.classList.add('hidden');
        this.uiGameOver?.classList.add('hidden');
    }

    togglePauseMenu(isPaused: boolean): void {
        const menu = document.getElementById('skills-menu');
        if (menu) {
            if (isPaused) {
                menu.classList.remove('hidden');
                this.updateSkillsMenu();
            } else {
                menu.classList.add('hidden');
            }
        }
    }

    // Handle Tab when overlays are open to resume correctly
    handleGlobalTabToggle(): void {
        const overlays = [
            'settings-panel', 'skills-menu', 'shop-panel', 'upgrade-menu', 'leaderboard', 'login-modal'
        ];
        const anyOpen = overlays.some(id => !document.getElementById(id)?.classList.contains('hidden'));

        if (anyOpen) {
            // Close settings if open
            this.hideSettingsPanel();
            // Close skills menu (pause menu)
            document.getElementById('skills-menu')?.classList.add('hidden');
            // Resume game if it was paused
            if (this.game.gameState === 'PAUSED') {
                this.game.stateManager.setState('PLAYING');
            } else {
                // Otherwise toggle pause normally
                this.game.togglePause();
            }
        } else {
            this.game.togglePause();
        }
    }

    showUpgradeMenu(choices: any[]): void {
        if (!this.uiCardContainer) return;
        this.uiCardContainer.innerHTML = '';

        choices.forEach(choice => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <h3 style="color:${choice.color}">${choice.name}</h3>
                <p>${choice.description}</p>
                ${choice.maxStacks ? `<div class="stack-badge" style="border-color:${choice.color}">${choice.stackCount || 0}/${choice.maxStacks}</div>` : ''}
            `;

            card.style.borderColor = choice.color;
            card.style.boxShadow = `0 0 5px ${choice.color}40`;

            card.addEventListener('mouseenter', () => {
                card.style.boxShadow = `0 0 20px ${choice.color}`;
                card.style.transform = 'translateY(-5px)';
            });
            card.addEventListener('mouseleave', () => {
                card.style.boxShadow = `0 0 5px ${choice.color}40`;
                card.style.transform = 'translateY(0)';
            });

            card.addEventListener('click', () => {
                this.game.handleUpgradePicked(choice);
            });

            this.uiCardContainer!.appendChild(card);
        });

        // Always render reroll button and bind to stateManager coins
        const existing = document.getElementById('reroll-btn-container');
        if (existing) existing.remove();

        const container = document.createElement('div');
        container.id = 'reroll-btn-container';
        container.style.marginTop = '20px';

        const btn = document.createElement('button');
        btn.className = 'glow-btn';
        btn.innerText = 'REROLL (10 COINS)';
        btn.style.fontSize = '16px';
        btn.style.padding = '10px 30px';

        const coins = this.game.stateManager?.coins ?? this.game.coins ?? 0;
        if (coins < 10) {
            btn.style.borderColor = '#550000';
            btn.style.color = '#aa0000';
            btn.style.boxShadow = 'none';
            btn.style.cursor = 'not-allowed';
        }

        btn.onclick = () => {
            const coinsNow = this.game.stateManager ? this.game.stateManager.coins : this.game.coins;
            if (coinsNow >= 10) {
                if (this.game.stateManager) this.game.stateManager.coins -= 10; else this.game.coins -= 10;
                this.game.audio.playClick();
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "-10 COINS", "#ffaa00");
                this.game.rerollUpgrades();
                this.updateCoins(this.game.stateManager ? this.game.stateManager.coins : this.game.coins);
            } else {
                this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "NOT ENOUGH COINS!", "#ff0000");
            }
        };

        container.appendChild(btn);
        this.uiUpgradeMenu?.appendChild(container);

        this.uiUpgradeMenu?.classList.remove('hidden');
    }

    closeUpgradeMenu(): void {
        this.uiUpgradeMenu?.classList.add('hidden');
    }

    updateSkillsMenu(): void {
        let contentDiv = document.querySelector('.skills-content');
        if (!contentDiv) return;

        contentDiv.innerHTML = '';
        const isTH = this.game.ui?.currentLocale === 'TH';

        const col1 = document.createElement('div');
        col1.className = 'column';
        col1.innerHTML = `<h3>${isTH ? 'สถานะยาน' : 'Ship Stats'}</h3>`;
        const statsUl = document.createElement('ul');
        statsUl.id = 'skills-list-stats';

        const p = this.game.player;
        const stats = [
            { label: isTH ? 'ดาเมจ' : 'Damage', val: Math.round(p.damage) },
            { label: isTH ? 'อัตรายิง' : 'Fire Rate', val: `${p.fireRate.toFixed(1)}/s` },
            { label: isTH ? 'กระสุน' : 'Projectiles', val: p.projectileCount },
            { label: isTH ? 'HP สูงสุด' : 'Max HP', val: Math.round(p.maxHp) },
            { label: isTH ? 'ฟื้นฟู HP' : 'HP Regen', val: `${p.hpRegen.toFixed(1)}/s` },
            { label: isTH ? 'ความเร็ว' : 'Speed', val: Math.round(p.maxSpeed) },
            { label: isTH ? 'แม่เหล็ก' : 'Magnet', val: `${Math.round(p.pickupRange)}px` },
            { label: isTH ? 'คริ' : 'Crit Chance', val: `${Math.round((p.critChance || 0) * 100)}%` },
            { label: isTH ? 'ทะลุ' : 'Piercing', val: p.piercing || 0 },
            { label: isTH ? 'ดีดกระสุน' : 'Ricochet', val: p.ricochet || 0 },
            { label: isTH ? 'ดูดเลือด' : 'Life Steal', val: `${Math.round((p.lifeSteal || 0) * 100)}%` },
            { label: isTH ? 'คูณดาเมจ' : 'Damage Mult', val: (p.damageMultiplier || 1).toFixed(2) + 'x' },
            { label: isTH ? 'เกราะ' : 'Armor', val: `${Math.round((p.armor || 0) * 100)}%` },
            { label: isTH ? 'ต้านทานดาเมจ' : 'Damage Reduction', val: `${Math.round((p.damageReduction || 0) * 100)}%` },
            { label: isTH ? 'ขนาดกระสุน' : 'Projectile Size', val: (p.projectileSize || 1).toFixed(2) + 'x' },
            { label: isTH ? 'ระเบิด' : 'Explosive', val: p.explosiveProjectiles ? (isTH ? 'ใช่' : 'ON') : (isTH ? 'ไม่' : 'OFF') },
            { label: isTH ? 'ติดตาม' : 'Homing', val: p.homingProjectiles ? (isTH ? 'ใช่' : 'ON') : (isTH ? 'ไม่' : 'OFF') },
        ];

        stats.forEach(s => {
            const li = document.createElement('li');
            li.innerHTML = `<span>${s.label}</span> <span style="color:var(--primary-color); font-weight:bold;">${s.val}</span>`;
            li.style.borderLeftColor = '#fff';
            statsUl.appendChild(li);
        });
        col1.appendChild(statsUl);

        const col2 = document.createElement('div');
        col2.className = 'column';
        col2.innerHTML = `<h3>${isTH ? 'บันทึกอัพเกรด' : 'Upgrade Log'}</h3>`;
        const logUl = document.createElement('ul');
        logUl.id = 'skills-list-log';

        [...this.game.acquiredUpgrades].reverse().forEach((upg: any) => {
            const li = document.createElement('li');
            li.innerHTML = `<span style="color:${upg.color}">${upg.name}</span>`;
            li.style.borderLeftColor = upg.color;
            logUl.appendChild(li);
        });
        col2.appendChild(logUl);

        contentDiv.appendChild(col1);
        contentDiv.appendChild(col2);
    }

    update(_dt: number): void {
        const setText = (el: HTMLElement | null, txt: string) => { if (el && el.innerText !== txt) el.innerText = txt; };

        // Use stateManager for authoritative EXP values
        const level = this.game.stateManager?.level ?? this.game.level;
        const exp = this.game.stateManager?.exp ?? this.game.exp;
        const expNext = this.game.stateManager?.expToNextLevel ?? this.game.expToNextLevel;
        setText(this.uiExpText, `LVL ${level} [${Math.floor(exp)} / ${expNext} XP]`);

        const expPct = Math.min(expNext > 0 ? (exp / expNext) * 100 : 0, 100);
        if (this.uiExpBar) this.uiExpBar.style.width = `${expPct}%`;

        const totalSeconds = Math.floor(this.game.mapSystem.totalTime || 0);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        setText(this.uiGameTimer, `${mins}:${secs}`);

        if (this.game.mapSystem.currentZoneData) {
            const zoneTime = this.game.mapSystem.timerValue;
            const zoneDuration = this.game.mapSystem.currentZoneData.duration;
            const zonePct = Math.min((zoneTime / zoneDuration) * 100, 100);
            if (this.uiZoneBar) this.uiZoneBar.style.width = `${zonePct}%`;

            let label = `ZONE ${this.game.mapSystem.zoneCount + 1}`;
            let color = "white";
            if (this.game.mapSystem.isWaitingForKill) {
                label = "STAGE BOSS DETECTED";
                color = "#ff0000";
            } else if (this.game.mapSystem.isMiniBossSpawned && zonePct < 100 && zonePct > 50) {
                label = "MINI BOSS ACTIVE";
                color = "#ff00aa";
            } else {
                const debuff = this.game.mapSystem.currentZoneData.debuff;
                if (debuff && debuff !== 'NONE') {
                    label += ` [${debuff}]`;
                    color = "#ffaa00";
                }
            }
            setText(this.uiZoneLabel, label);
            if (this.uiZoneLabel) this.uiZoneLabel.style.color = color;

            const zoneNameEl = document.getElementById('current-zone-name');
            if (zoneNameEl) {
                const zoneName = this.game.mapSystem.currentZoneData.name || "UNKNOWN SECTOR";
                if (zoneNameEl.innerText !== zoneName) zoneNameEl.innerText = zoneName;
            }
        }

        // Update Buffs
        this.updateBuffs();

        const p = this.game.player;
        if (p) {
            const hpPct = (p.hp / p.maxHp) * 100;
            if (this.uiHpBar) this.uiHpBar.style.width = `${Math.max(0, hpPct)}%`;
            setText(this.uiHpText, `${Math.ceil(p.hp)} / ${p.maxHp}`);

            const enPct = (p.energy / p.maxEnergy) * 100;
            if (this.uiEnergyBar) this.uiEnergyBar.style.width = `${Math.max(0, enPct)}%`;

            this.updateDash(p);
        }

        this.updateSkillsBar();
        this.updateInventory();
    }

    updateDash(player: any): void {
        const dashChargesDiv = document.getElementById('dash-charges');
        const dashText = document.getElementById('dash-text');

        if (dashChargesDiv) {
            dashChargesDiv.innerHTML = '';
            for (let i = 0; i < player.dashCount; i++) {
                const pip = document.createElement('div');
                pip.className = 'dash-pip' + (i < player.dashCharges ? ' active' : '');
                dashChargesDiv.appendChild(pip);
            }
        }

        if (dashText) {
            if (player.dashCharges < player.dashCount) {
                const timeLeft = Math.max(0, player.dashCooldownTimer).toFixed(1);
                dashText.innerText = `CD: ${timeLeft}s`;
                dashText.style.color = '#ffaa00';
            } else {
                dashText.innerText = 'READY';
                dashText.style.color = '#00f0ff';
            }
        }
    }

    updateSkillsBar(): void {
        const skillsBar = document.getElementById('skills-bar');
        if (!skillsBar) return;

        const activeSkills = this.game.skillSystem ? this.game.skillSystem.activeSkills : [];
        const slots = [document.getElementById('skill-0'), document.getElementById('skill-1'), document.getElementById('skill-2')];

        slots.forEach((slot, index) => {
            if (!slot) return;
            const skill = activeSkills[index];
            if (skill) {
                const cdRemaining = Math.max(0, skill.currentCooldown);
                const cdPercent = skill.cooldown > 0 ? (cdRemaining / skill.cooldown) : 0;
                const fillHeight = Math.max(0, cdPercent * 100);
                const isReady = cdRemaining <= 0;

                slot.style.borderColor = skill.color;
                slot.style.boxShadow = isReady ? `0 0 15px ${skill.color}` : 'none';

                // Skill Icon (Emoji)
                const skillIcon = this.getSkillIcon(skill.id || skill.name);
                const cooldownText = isReady ? '' : `<div style="position:absolute; bottom:4px; font-size:14px; font-weight:bold; color:#fff; text-shadow:0 0 3px #000;">${cdRemaining.toFixed(1)}s</div>`;

                slot.innerHTML = `
                    <div style="font-size:${isReady ? '28px' : '20px'}; text-shadow:0 0 ${isReady ? '8px' : '3px'} ${skill.color}; transition:all 0.2s;">
                        ${skillIcon}
                    </div>
                    <div class="skill-key" style="position:absolute; top:2px; left:4px; font-size:10px; color:#fff; font-weight:bold;">${index + 1}</div>
                    ${cooldownText}
                    <div class="cooldown-overlay" style="height:${fillHeight}%; background:linear-gradient(to top, rgba(0,0,0,0.8) 0%, rgba(50,50,50,0.6) 100%); width:100%; position:absolute; bottom:0; left:0; pointer-events:none;"></div>
                `;

                // Ready state glow effect
                slot.style.opacity = isReady ? '1.0' : '0.6';
                slot.style.background = isReady ? `radial-gradient(circle, ${skill.color}22 0%, transparent 70%)` : 'transparent';

                // Enable click to activate
                slot.onclick = () => {
                    if (this.game.skillSystem) this.game.skillSystem.tryActivateSkill(index);
                };

                // Skill tooltip on hover
                const descTH = skill.descriptionTH || skill.description || '';
                const cdText = skill.cooldown ? `คูลดาวน์: ${skill.cooldown}วิ` : '';
                const dmgText = skill.damage ? `ดาเมจ: ${skill.damage}` : '';
                const tooltipContent = `<b style="color:${skill.color}">${skill.name}</b><br>${descTH}<br><span style="color:#aaa">${dmgText}${dmgText && cdText ? ' | ' : ''}${cdText}</span>`;

                (slot as HTMLElement).onmouseenter = (e) => this.showTooltip(e, tooltipContent);
                (slot as HTMLElement).onmouseleave = () => this.hideTooltip();
                (slot as HTMLElement).onmousemove = (e) => this.moveTooltip(e);
            } else {
                slot.style.borderColor = '#444';
                slot.style.background = 'transparent';
                slot.style.boxShadow = 'none';
                slot.innerHTML = `<div class="skill-key" style="position:absolute; top:2px; left:4px; font-size:10px; color:#555;">${index + 1}</div>`;
                slot.onclick = null;
                (slot as HTMLElement).onmouseenter = null;
                (slot as HTMLElement).onmouseleave = null;
            }
        });
    }

    updateInventory(): void {
        if (!this.game.weaponSystem) return;

        const panel = document.getElementById('inventory-panel');
        if (!panel) return;

        const system = this.game.weaponSystem;

        const currentSlots = panel.children.length;
        if (system.maxWeapons > currentSlots) {
            for (let i = currentSlots; i < system.maxWeapons; i++) {
                const div = document.createElement('div');
                div.className = 'inv-slot';
                div.id = `slot-${i}`;
                panel.appendChild(div);
            }
        }

        for (let i = 0; i < system.maxWeapons; i++) {
            let slot = document.getElementById(`slot-${i}`);
            if (!slot) continue;

            const wep = system.activeWeapons[i];
            const type = wep ? wep.type : 'empty';
            const currentType = slot.getAttribute('data-type');

            if (currentType !== type) {
                slot.setAttribute('data-type', type);
                if (wep) {
                    slot.classList.add('filled');
                    slot.innerHTML = wep.type === 'ORBITAL' ? 'Orb' : 'Trt';
                    slot.style.borderColor = wep.color;
                    slot.style.boxShadow = `0 0 10px ${wep.color}`;
                } else {
                    slot.classList.remove('filled');
                    slot.innerHTML = '';
                    slot.style.borderColor = 'rgba(255, 255, 255, 0.3)';
                    slot.style.boxShadow = 'none';
                }
            }

            if (wep) {
                const fireRateStr = wep.fireRate ? wep.fireRate.toFixed(1) : '?';
                slot.onmouseenter = (e) => this.showTooltip(e, `<b>${wep.name}</b><br>ประเภท: ${wep.type}<br>ดาเมจ: ${Math.round(wep.damage || 0)}<br>อัตรา: ${fireRateStr}/วิ`);
                slot.onmouseleave = () => this.hideTooltip();
                slot.onmousemove = (e) => this.moveTooltip(e);
            } else {
                slot.onmouseenter = null;
                slot.onmouseleave = null;
                slot.onmousemove = null;
            }
        }
    }

    showTooltip(e: MouseEvent, text: string): void {
        if (!this.tooltip) return;
        this.tooltip.innerHTML = text;
        this.moveTooltip(e);
        this.tooltip.classList.remove('hidden');
    }

    moveTooltip(e: MouseEvent): void {
        if (!this.tooltip) return;

        const tooltipRect = this.tooltip.getBoundingClientRect();
        const viewportWidth = window.innerWidth;
        const viewportHeight = window.innerHeight;

        let x = e.clientX + 15;
        let y = e.clientY + 15;

        // Keep tooltip within right edge
        if (x + tooltipRect.width > viewportWidth - 10) {
            x = e.clientX - tooltipRect.width - 15;
        }

        // Keep tooltip within bottom edge
        if (y + tooltipRect.height > viewportHeight - 10) {
            y = e.clientY - tooltipRect.height - 15;
        }

        // Ensure not off left/top
        x = Math.max(10, x);
        y = Math.max(10, y);

        this.tooltip.style.left = x + 'px';
        this.tooltip.style.top = y + 'px';
    }

    hideTooltip(): void {
        this.tooltip?.classList.add('hidden');
    }

    showGameOver(finalScore: number): void {
        this.uiGameOver?.classList.remove('hidden');
        const scoreEl = document.getElementById('final-score');
        if (scoreEl) scoreEl.innerText = `SCORE: ${finalScore}`;

        const input = document.getElementById('player-name-input') as HTMLInputElement;
        if (input) input.value = '';

        const btn = document.getElementById('submit-score-btn');
        if (btn) btn.style.display = 'inline-block';
    }

    hideSubmitButton(): void {
        const btn = document.getElementById('submit-score-btn');
        if (btn) btn.style.display = 'none';
    }

    updateLeaderboardList(scores: any[], fromGameOver: boolean): void {
        const list = document.getElementById('score-list');
        if (!list) return;
        list.innerHTML = '';

        if (scores.length === 0) {
            list.innerHTML = '<li style="color:#aaa">No scores recorded yet.</li>';
            return;
        }

        scores.forEach((s, i) => {
            const li = document.createElement('li');
            li.style.color = i === 0 ? '#ff00ea' : '#fff';
            li.style.listStyle = 'none';
            li.style.padding = '5px 0';
            li.style.fontSize = '18px';

            const diffConfig = (CONFIG.DIFFICULTY as any)[s.difficulty];
            const diffName = diffConfig?.name || s.difficulty || 'ปกติ';
            const color = diffConfig?.color || '#fff';

            // XSS Protection: Escape name
            const div = document.createElement('div');
            div.innerText = s.name;
            const safeName = div.innerHTML;

            li.innerHTML = `<b>${i + 1}. ${safeName}</b> <span style="color:${color}">[${diffName}]</span> - ${s.score} <span style="font-size:12px; color:#888">(LVL ${s.level})</span>`;
            list.appendChild(li);
        });

        const restartBtn = document.getElementById('leaderboard-restart-btn');
        if (restartBtn) {
            restartBtn.style.display = fromGameOver ? 'block' : 'none';
            if (fromGameOver) {
                restartBtn.onclick = () => {
                    document.getElementById('leaderboard')?.classList.add('hidden');
                    this.game.restart();
                };
            }
        }

        document.getElementById('leaderboard')?.classList.remove('hidden');
        if (!fromGameOver) {
            this.uiMainMenu?.classList.add('hidden');
        }
    }

    updateBuffs(): void {
        const container = document.getElementById('active-buffs-container');
        if (!container) return;

        // Collect active buffs
        const buffs: { name: string, color: string }[] = [];

        // Player State Buffs
        if (this.game.player.hasBerserker && this.game.player.hp < this.game.player.maxHp * 0.3) {
            buffs.push({ name: 'BERSERK', color: '#ff0000' });
        }
        if (this.game.player.isInvulnerable) {
            buffs.push({ name: 'SHIELDED', color: '#ffff00' });
        }

        // Skill System Effects
        if (this.game.skillSystem) {
            // Access private activeEffects if necessary (using any cast for now)
            const effects = (this.game.skillSystem as any).activeEffects || [];
            effects.forEach((eff: any) => {
                if (eff.type === 'DIVINE_SHIELD') {
                    // Already handled
                } else if (eff.type === 'SELF_BUFF') {
                    buffs.push({ name: 'BUFF', color: '#00ff00' });
                }
            });
        }

        // Hazard Debuffs from MapSystem
        if (this.game.mapSystem && this.game.mapSystem.currentZoneData) {
            const hazard = this.game.mapSystem.currentZoneData.debuff;
            // hazard is a string like 'SLOW', 'CORROSION', etc.
            if (hazard && hazard !== 'NONE') {
                let name = hazard;
                if (hazard === 'SLOW') name = 'SLOW';
                else if (hazard === 'CORROSION') name = 'CORRODE';
                else if (hazard === 'INTERFERENCE') name = 'JAM';

                buffs.push({ name: name, color: '#ff00aa' });
            }
        }

        container.innerHTML = '';
        buffs.forEach(b => {
            const div = document.createElement('div');
            div.className = 'buff-icon';
            div.style.borderColor = b.color;
            div.style.color = b.color;
            div.innerText = b.name;
            container.appendChild(div);
        });
    }

    // Shop Methods
    showShop(): void {
        document.getElementById('shop-panel')?.classList.remove('hidden');
        this.uiMainMenu?.classList.add('hidden');
        // Pause game when opening shop
        this.game.isPaused = true;
        this.populateShop();
    }

    hideShop(): void {
        document.getElementById('shop-panel')?.classList.add('hidden');

        // Resume countdown if enabled in settings
        if (this.game.resumeCountdownEnabled) {
            let count = 3;
            const countdownEl = document.createElement('div');
            countdownEl.style.position = 'absolute';
            countdownEl.style.top = '50%';
            countdownEl.style.left = '50%';
            countdownEl.style.transform = 'translate(-50%, -50%)';
            countdownEl.style.fontSize = '80px';
            countdownEl.style.fontFamily = 'Rajdhani, sans-serif';
            countdownEl.style.color = '#fff';
            countdownEl.style.textShadow = '0 0 20px #00f0ff';
            countdownEl.style.zIndex = '2000';
            countdownEl.innerText = count.toString();
            document.body.appendChild(countdownEl);

            const interval = setInterval(() => {
                count--;
                if (count > 0) {
                    countdownEl.innerText = count.toString();
                    this.game.audio.playClick();
                } else {
                    clearInterval(interval);
                    if (document.body.contains(countdownEl)) {
                        document.body.removeChild(countdownEl);
                    }
                    this.game.isPaused = false;
                }
            }, 1000);
        } else {
            this.game.isPaused = false;
        }

        if (this.game.gameState === 'MENU') {
            this.showMainMenu();
        }
    }

    populateShop(): void {
        const container = document.getElementById('shop-items-container');
        if (!container) return;
        container.innerHTML = '';

        const items = this.game.shopSystem.getAllItems();
        items.forEach((item: any) => {
            const el = document.createElement('div');
            el.className = 'shop-item';

            const purchases = this.game.shopSystem.getPurchasedCount(item.id);
            const maxPurchases = item.maxPurchases ?? -1;
            const isSoldOut = maxPurchases !== -1 && purchases >= maxPurchases;

            const name = this.currentLocale === 'TH' ? (item.nameTH || item.name) : item.name;
            const desc = this.currentLocale === 'TH' ? (item.descriptionTH || item.description) : item.description;

            el.innerHTML = `
                <h3>${name}</h3>
                <p>${desc}</p>
                <div class="price">💰 ${item.price}</div>
                <button class="glow-btn" ${isSoldOut ? 'disabled' : ''} style="${isSoldOut ? 'background:#333;border-color:#555;color:#888' : ''}">
                    ${isSoldOut ? (this.currentLocale === 'TH' ? 'หมดแล้ว' : 'SOLD OUT') : (this.currentLocale === 'TH' ? 'ซื้อ' : 'BUY')}
                </button>
            `;

            if (isSoldOut) {
                el.style.opacity = '0.6';
            } else {
                const btn = el.querySelector('button');
                btn?.addEventListener('click', () => {
                    if (this.game.shopSystem.purchaseItem(item.id)) {
                        this.updateShopCoinDisplay();
                        this.populateShop();
                    }
                });
            }

            container.appendChild(el);
        });

        this.updateShopCoinDisplay();
    }

    updateShopCoinDisplay(): void {
        const el = document.getElementById('shop-coin-display');
        // Handle case where stateManager might be missing in type def but present in runtime
        const coins = this.game.stateManager ? this.game.stateManager.coins : 0;
        if (el) el.innerText = coins.toString();
    }

    // MultiPlayer Methods
    showMultiPlayerMenu(): void {
        document.getElementById('multiplayer-menu')?.classList.remove('hidden');
        this.uiMainMenu?.classList.add('hidden');
    }

    hideMultiPlayerMenu(): void {
        document.getElementById('multiplayer-menu')?.classList.add('hidden');
        this.showMainMenu();
    }

    createRoom(): void {
        console.log("[UI] Create Room Clicked");
        if (this.game.multiPlayerSystem) {
            const name = this.game.loginSystem?.username || `Guest_${Math.floor(Math.random() * 1000)}`;
            this.game.multiPlayerSystem.createRoom(name);
        }
    }

    joinRoom(): void {
        const input = document.getElementById('join-room-input') as HTMLInputElement;
        const roomId = input?.value;
        if (roomId && this.game.multiPlayerSystem) {
            const name = this.game.loginSystem?.username || `Guest_${Math.floor(Math.random() * 1000)}`;
            this.game.multiPlayerSystem.joinRoom(roomId, name);
        }
    }

    // Help Panel Methods
    showHelpPanel(): void {
        this.uiMainMenu?.classList.add('hidden');
        document.getElementById('help-panel')?.classList.remove('hidden');
    }

    hideHelpPanel(): void {
        document.getElementById('help-panel')?.classList.add('hidden');
        this.showMainMenu();
    }
}
