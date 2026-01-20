import { CONFIG } from '../core/Config';

export class UIManager {
    private game: any;
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
        const getBtn = (id: string) => document.getElementById(id);

        getBtn('restart-btn')?.addEventListener('click', () => this.game.restart());
        getBtn('quit-btn')?.addEventListener('click', () => location.reload());
        getBtn('start-btn')?.addEventListener('click', () => this.showDifficultySelect());
        getBtn('submit-score-btn')?.addEventListener('click', () => this.game.submitScore());

        getBtn('pause-btn')?.addEventListener('click', () => this.game.togglePause());
        getBtn('resume-btn')?.addEventListener('click', () => this.game.togglePause());
        getBtn('manage-skills-btn')?.addEventListener('click', () => this.showSkillManagePanel());

        this.setupDifficultyButtons();

        getBtn('open-leaderboard-btn')?.addEventListener('click', () => this.game.showLeaderboard(false));
        getBtn('close-leaderboard-btn')?.addEventListener('click', () => this.showMainMenu());

        // Skill Management
        getBtn('close-skill-manage-btn')?.addEventListener('click', () => this.hideSkillManagePanel());
        this.setupSkillManagePanel();

        // Settings Panel
        getBtn('open-settings-btn')?.addEventListener('click', () => this.showSettingsPanel());
        getBtn('close-settings-btn')?.addEventListener('click', () => this.hideSettingsPanel());
        this.setupSettingsPanel();
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
            localStorage.setItem('cosmos_show_fps', isOn ? '1' : '0');
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
    }

    hideSettingsPanel(): void {
        document.getElementById('settings-panel')?.classList.add('hidden');
    }

    // Skill icon mapping using emoji
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
            // Fallback based on name
            'Black Hole': '🕳️',
            'Meteor Shower': '☄️',
            'Time Stop': '⏱️',
            'Doom': '💀',
            'Lightning Storm': '⚡',
            'Divine Shield': '🛡️',
            'Soul Harvest': '👻',
            'FireBall': '🔥',
            'Ice Ball': '❄️',
            'Poison Cloud': '☠️',
            'Shockwave': '💥',
        };
        return icons[skillId] || '✨';
    }

    private selectedSwapSlot: number = -1;
    private draggedSlot: number = -1;

    setupSkillManagePanel(): void {
        const slots = document.querySelectorAll('.slot-manage');
        slots.forEach((slot) => {
            const slotEl = slot as HTMLElement;
            slotEl.draggable = true;

            // Drag start
            slotEl.addEventListener('dragstart', (e) => {
                const slotIndex = parseInt(slotEl.dataset.slot || '0');
                this.draggedSlot = slotIndex;
                slotEl.classList.add('dragging');
                if (e.dataTransfer) {
                    e.dataTransfer.effectAllowed = 'move';
                    e.dataTransfer.setData('text/plain', slotIndex.toString());
                }
            });

            // Drag end
            slotEl.addEventListener('dragend', () => {
                slotEl.classList.remove('dragging');
                this.draggedSlot = -1;
            });

            // Drag over (allow drop)
            slotEl.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (e.dataTransfer) e.dataTransfer.dropEffect = 'move';
                slotEl.classList.add('drag-over');
            });

            // Drag leave
            slotEl.addEventListener('dragleave', () => {
                slotEl.classList.remove('drag-over');
            });

            // Drop
            slotEl.addEventListener('drop', (e) => {
                e.preventDefault();
                slotEl.classList.remove('drag-over');
                const targetIndex = parseInt(slotEl.dataset.slot || '0');
                if (this.draggedSlot !== -1 && this.draggedSlot !== targetIndex) {
                    this.swapSkills(this.draggedSlot, targetIndex);
                }
                this.draggedSlot = -1;
            });

            // Click fallback (for mobile/touch)
            slot.addEventListener('click', () => {
                const slotIndex = parseInt(slotEl.dataset.slot || '0');
                if (this.selectedSwapSlot === -1) {
                    this.selectedSwapSlot = slotIndex;
                    slot.classList.add('selected');
                } else if (this.selectedSwapSlot === slotIndex) {
                    this.selectedSwapSlot = -1;
                    slot.classList.remove('selected');
                } else {
                    this.swapSkills(this.selectedSwapSlot, slotIndex);
                    this.selectedSwapSlot = -1;
                    document.querySelectorAll('.slot-manage').forEach(s => s.classList.remove('selected'));
                }
            });
        });
    }

    swapSkills(a: number, b: number): void {
        if (!this.game.skillSystem) return;
        const skills = this.game.skillSystem.activeSkills;
        // Allow swapping even if one slot is empty (undefined)
        const temp = skills[a];
        skills[a] = skills[b];
        skills[b] = temp;
        this.updateSkillManagePanel();
        this.game.spawnFloatingText(this.game.player.x, this.game.player.y, "Skills Swapped!", "#00f0ff");
        this.game.audio.playClick();
    }

    showSkillManagePanel(): void {
        document.getElementById('skill-manage-panel')?.classList.remove('hidden');
        this.game.isPaused = true; // Pause game while managing
        this.updateSkillManagePanel();
    }

    hideSkillManagePanel(): void {
        document.getElementById('skill-manage-panel')?.classList.add('hidden');
        this.selectedSwapSlot = -1;
        this.game.isPaused = false; // Resume game
        document.querySelectorAll('.slot-manage').forEach(s => s.classList.remove('selected'));
    }

    updateSkillManagePanel(): void {
        const skills = this.game.skillSystem ? this.game.skillSystem.activeSkills : [];
        for (let i = 0; i < 3; i++) {
            const el = document.getElementById(`slot-${i}-skill`);
            const slotEl = document.querySelector(`.slot-manage[data-slot="${i}"]`) as HTMLElement;
            if (el && slotEl) {
                const skill = skills[i];
                const icon = skill ? this.getSkillIcon(skill.id || skill.name) : '❌';
                el.innerHTML = skill
                    ? `<span style="font-size:20px; margin-right:8px;">${icon}</span>${skill.name}`
                    : '<span style="color:#666;">Empty</span>';
                el.style.color = skill ? skill.color : '#666';
                slotEl.style.borderColor = skill ? skill.color : '#444';
            }
        }
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
        this.uiGameOver?.classList.add('hidden');
    }

    hideAllOverlays(): void {
        document.getElementById('leaderboard')?.classList.add('hidden');
        document.getElementById('difficulty-select')?.classList.add('hidden');
        document.getElementById('hud')?.classList.add('hidden');
        document.getElementById('dash-indicator')?.classList.add('hidden');
        document.getElementById('skills-bar')?.classList.add('hidden');
        document.getElementById('manage-skills-btn')?.classList.add('hidden');
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

    showUpgradeMenu(choices: any[]): void {
        if (!this.uiCardContainer) return;
        this.uiCardContainer.innerHTML = '';

        choices.forEach(choice => {
            const card = document.createElement('div');
            card.className = 'skill-card';
            card.innerHTML = `
                <h3 style="color:${choice.color}">${choice.name}</h3>
                <p>${choice.description}</p>
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
                choice.apply(this.game);
                this.game.acquiredUpgrades.push({ name: choice.name, color: choice.color });
                this.game.closeUpgradeMenu();
            });

            this.uiCardContainer!.appendChild(card);
        });

        if (!document.getElementById('reroll-btn-container')) {
            const container = document.createElement('div');
            container.id = 'reroll-btn-container';
            container.style.marginTop = '20px';

            const btn = document.createElement('button');
            btn.className = 'glow-btn';
            btn.innerText = 'REROLL (10 MAX HP)';
            btn.style.fontSize = '16px';
            btn.style.padding = '10px 30px';

            btn.onclick = () => {
                const player = this.game.player;
                if (player.maxHp > 10) {
                    player.maxHp -= 10;
                    if (player.hp > player.maxHp) player.hp = player.maxHp;

                    this.game.audio.playClick();
                    this.game.spawnFloatingText(player.x, player.y, "-10 MAX HP", "#ff0000");
                    this.game.showUpgradeMenu();
                } else {
                    this.game.spawnFloatingText(player.x, player.y, "NOT ENOUGH HP!", "#ff0000");
                }
            };

            container.appendChild(btn);
            this.uiUpgradeMenu?.appendChild(container);
        }

        this.uiUpgradeMenu?.classList.remove('hidden');
    }

    closeUpgradeMenu(): void {
        this.uiUpgradeMenu?.classList.add('hidden');
    }

    updateSkillsMenu(): void {
        let contentDiv = document.querySelector('.skills-content');
        if (!contentDiv) return;

        contentDiv.innerHTML = '';

        const col1 = document.createElement('div');
        col1.className = 'column';
        col1.innerHTML = '<h3>สถานะยาน</h3>';
        const statsUl = document.createElement('ul');
        statsUl.id = 'skills-list-stats';

        const p = this.game.player;
        const stats = [
            { label: 'ดาเมจ', val: Math.round(p.damage) },
            { label: 'อัตรายิง', val: `${p.fireRate.toFixed(1)}/วิ` },
            { label: 'กระสุน', val: p.projectileCount },
            { label: 'HP สูงสุด', val: Math.round(p.maxHp) },
            { label: 'ฟื้นฟู HP', val: `${p.hpRegen.toFixed(1)}/วิ` },
            { label: 'แม่เหล็ก', val: `${Math.round(p.pickupRange)}px` }
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
        col2.innerHTML = '<h3>บันทึกอัพเกรด</h3>';
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

    update(dt: number): void {
        const setText = (el: HTMLElement | null, txt: string) => { if (el && el.innerText !== txt) el.innerText = txt; };

        const level = this.game.level;
        const exp = this.game.exp;
        const expNext = this.game.expToNextLevel;
        setText(this.uiExpText, `LVL ${level} [${Math.floor(exp)} / ${expNext} XP]`);

        const expPct = Math.min((exp / expNext) * 100, 100);
        if (this.uiExpBar) this.uiExpBar.style.width = `${expPct}%`;

        const totalSeconds = Math.floor(this.game.mapSystem.totalTime || 0);
        const mins = Math.floor(totalSeconds / 60).toString().padStart(2, '0');
        const secs = (totalSeconds % 60).toString().padStart(2, '0');
        setText(this.uiGameTimer, `${mins}:${secs}`);

        if (this.game.mapSystem.currentZone) {
            const zoneTime = this.game.mapSystem.timer;
            const zoneDuration = this.game.mapSystem.currentZone.duration;
            const zonePct = Math.min((zoneTime / zoneDuration) * 100, 100);
            if (this.uiZoneBar) this.uiZoneBar.style.width = `${zonePct}%`;

            let label = `ZONE ${this.game.mapSystem.zoneCount + 1}`;
            let color = "white";
            if (this.game.mapSystem.waitingForKill) {
                label = "STAGE BOSS DETECTED";
                color = "#ff0000";
            } else if (this.game.mapSystem.miniBossSpawned && zonePct < 100 && zonePct > 50) {
                label = "MINI BOSS ACTIVE";
                color = "#ff00aa";
            }
            setText(this.uiZoneLabel, label);
            if (this.uiZoneLabel) this.uiZoneLabel.style.color = color;

            const zoneNameEl = document.getElementById('current-zone-name');
            if (zoneNameEl) {
                const zoneName = this.game.mapSystem.currentZone.name || "UNKNOWN SECTOR";
                if (zoneNameEl.innerText !== zoneName) zoneNameEl.innerText = zoneName;

                // Optional: Update color based on zone
                // if (this.game.backgroundSystem) zoneNameEl.style.textShadow = `0 0 10px ${this.game.mapSystem.currentZone.starColor}`;
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

            const color = (CONFIG.DIFFICULTY as any)[s.difficulty]?.color || '#fff';
            li.innerHTML = `<b>${i + 1}. ${s.name}</b> <span style="color:${color}">[${s.difficulty || 'NORMAL'}]</span> - ${s.score} <span style="font-size:12px; color:#888">(LVL ${s.level})</span>`;
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
        if (this.game.mapSystem && this.game.mapSystem.currentZone) {
            const hazard = this.game.mapSystem.currentZone.debuff;
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
}
