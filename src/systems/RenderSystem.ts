export class RenderSystem {
    private game: any;
    private ctx: CanvasRenderingContext2D;
    private canvas: HTMLCanvasElement;

    constructor(game: any) {
        this.game = game;
        this.ctx = game.ctx;
        this.canvas = game.canvas;
    }

    draw(): void {
        // Clear Screen
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);

        // Precompute per-frame pulse (avoid multiple Date.now calls per enemy)
        const pulse = 1 + Math.sin(Date.now() * 0.01) * 0.1;

        // Apply Camera/Shake
        this.ctx.save();

        // Screen Shake (use pre-calculated values from Game.ts to avoid duplicate calculation)
        const shakeX = this.game.shakeX || 0;
        const shakeY = this.game.shakeY || 0;

        // Camera Transform
        const camX = this.game.camera ? -this.game.camera.x : 0;
        const camY = this.game.camera ? -this.game.camera.y : 0;

        this.ctx.translate(camX + shakeX, camY + shakeY);

        // 1. Draw Starfield (Background)
        // 1. Draw Background (Chunks)
        if (this.game.backgroundSystem) this.game.backgroundSystem.draw(this.ctx);

        // Calculate view bounds for culling
        const viewLeft = -camX - shakeX;
        const viewRight = viewLeft + this.canvas.width;
        const viewTop = -camY - shakeY;
        const viewBottom = viewTop + this.canvas.height;
        const margin = 100; // Draw margin to prevent pop-in

        // STOP HERE if we are in Main Menu (don't draw entities)
        if (this.game.stateManager.isMenu()) {
            this.ctx.restore();
            return;
        }

        // 2. Draw Gems (with culling)
        this.game.gems.forEach((gem: any) => {
            if (gem.x >= viewLeft - margin && gem.x <= viewRight + margin &&
                gem.y >= viewTop - margin && gem.y <= viewBottom + margin) {
                this.drawGem(gem);
            }
        });

        // 3. Draw Projectiles (with culling)
        this.game.projectiles.forEach((proj: any) => {
            if (proj.x >= viewLeft - margin && proj.x <= viewRight + margin &&
                proj.y >= viewTop - margin && proj.y <= viewBottom + margin) {
                this.drawProjectile(proj);
            }
        });

        // 4. Draw Enemies (with culling)
        this.game.enemies.forEach((enemy: any) => {
            if (enemy.x >= viewLeft - enemy.radius - margin &&
                enemy.x <= viewRight + enemy.radius + margin &&
                enemy.y >= viewTop - enemy.radius - margin &&
                enemy.y <= viewBottom + enemy.radius + margin) {
                this.drawEnemy(enemy, pulse);
            }
        });

        // 5. Draw Player
        if (this.game.player) this.drawPlayer(this.game.player);

        // 6. Draw Particles
        this.game.particlePool.forEachActive((p: any) => this.drawParticle(p));

        // 7. Draw Floating Texts
        this.game.floatingTexts.forEach((ft: any) => this.drawFloatingText(ft));

        // 8. Draw Skill Effects (from SkillSystem)
        if (this.game.skillSystem) this.game.skillSystem.draw(this.ctx);

        // 9. Draw Weapons (e.g. Drones/Turrets) only when not paused
        if (this.game.weaponSystem && this.game.stateManager.isPlaying()) this.game.weaponSystem.draw(this.ctx);

        this.ctx.restore();

        // UI Overlay (if any drawn on canvas)
        this.drawUIOverlay();
    }

    // --- Entity Draw Methods (Moved from Entities) ---

    drawPlayer(player: any): void {
        this.ctx.save();
        this.ctx.translate(player.x, player.y);
        this.ctx.rotate(player.angle);

        // Player Triangle
        this.ctx.fillStyle = '#fff';
        this.ctx.beginPath();
        this.ctx.moveTo(15, 0);
        this.ctx.lineTo(-10, 10);
        this.ctx.lineTo(-5, 0);
        this.ctx.lineTo(-10, -10);
        this.ctx.closePath();
        this.ctx.fill();

        // Spiked Hull Visual
        if (player.collisionDamage > 0) {
            this.ctx.strokeStyle = '#ff0000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.moveTo(20, 0);
            this.ctx.lineTo(10, 5); // Spike
            this.ctx.stroke();
        }

        this.ctx.restore();
    }

    drawEnemy(enemy: any, pulse: number): void {
        this.ctx.save();
        this.ctx.translate(enemy.x, enemy.y);

        // Flash if hit
        if (enemy.flashTimer > 0) {
            this.ctx.globalAlpha = 0.5;
            this.ctx.fillStyle = '#ffffff';
        } else {
            this.ctx.fillStyle = enemy.color;
        }

        // Apply freeze visual
        if (enemy.frozen) {
            this.ctx.filter = 'hue-rotate(180deg)';
        }

        // Apply ghost alpha
        if (enemy.type === 'ghost') {
            this.ctx.globalAlpha = enemy.alpha || 0.8;
        }

        // Pulse effect (precomputed per frame)
        this.ctx.scale(pulse, pulse);

        this.ctx.strokeStyle = enemy.color;
        this.ctx.lineWidth = 3;
        this.ctx.beginPath();

        // Shape based on type
        this.drawEnemyShape(this.ctx, enemy);

        this.ctx.stroke();
        this.ctx.fillStyle = enemy.color + '44';
        this.ctx.fill();

        // Draw shield for shielder
        if (enemy.type === 'shielder' && enemy.shield > 0) {
            this.ctx.strokeStyle = '#0088ff88';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, enemy.radius + 10, 0, Math.PI * 2 * (enemy.shield / enemy.shieldMax));
            this.ctx.stroke();
        }

        // Draw doom mark
        if (enemy.doomed) {
            this.ctx.strokeStyle = '#660000';
            this.ctx.lineWidth = 2;
            this.ctx.beginPath();
            this.ctx.arc(0, 0, enemy.radius + 5, 0, Math.PI * 2);
            this.ctx.stroke();
        }

        this.ctx.restore();

        // Draw health bar with HP%
        if (enemy.maxHealth > 0) {
            const barWidth = enemy.radius * 2;
            const barHeight = 4;
            const pct = Math.max(0, enemy.health / enemy.maxHealth);
            const hpPercent = Math.round(pct * 100);

            // Background
            this.ctx.fillStyle = '#330000';
            this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth, barHeight);

            // HP bar color based on percentage
            let barColor = '#ff0000';
            if (hpPercent <= 15) barColor = '#aa00ff'; // Execute range - purple
            else if (hpPercent <= 30) barColor = '#ff4400'; // Low HP - orange

            this.ctx.fillStyle = barColor;
            this.ctx.fillRect(enemy.x - barWidth / 2, enemy.y - enemy.radius - 10, barWidth * pct, barHeight);

            // HP% text (show only if not full HP)
            if (pct < 1) {
                this.ctx.font = '10px Arial';
                this.ctx.fillStyle = hpPercent <= 15 ? '#ff00ff' : '#ffffff';
                this.ctx.textAlign = 'center';
                this.ctx.fillText(`${hpPercent}%`, enemy.x, enemy.y - enemy.radius - 14);
            }
        }
    }

    drawEnemyShape(ctx: CanvasRenderingContext2D, enemy: any): void {
        switch (enemy.type) {
            case 'shooter':
                ctx.moveTo(15, 0);
                ctx.lineTo(-10, 10);
                ctx.lineTo(-10, -10);
                ctx.closePath();
                break;

            case 'dasher':
                ctx.moveTo(10, 0);
                ctx.lineTo(-10, 5);
                ctx.lineTo(-10, -5);
                ctx.closePath();
                break;

            case 'tank':
                ctx.rect(-enemy.radius / 2, -enemy.radius / 2, enemy.radius, enemy.radius);
                break;

            case 'swarmer':
                ctx.moveTo(8, 0);
                ctx.lineTo(-5, 4);
                ctx.lineTo(-5, -4);
                ctx.closePath();
                break;

            case 'duplicator':
                // Diamond shape
                ctx.moveTo(0, -enemy.radius);
                ctx.lineTo(enemy.radius, 0);
                ctx.lineTo(0, enemy.radius);
                ctx.lineTo(-enemy.radius, 0);
                ctx.closePath();
                break;

            case 'adaptive':
                // Hexagon
                for (let i = 0; i < 6; i++) {
                    const angle = (Math.PI / 3) * i;
                    const rx = Math.cos(angle) * enemy.radius;
                    const ry = Math.sin(angle) * enemy.radius;
                    if (i === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                }
                ctx.closePath();
                break;

            case 'bomber':
                // Spiky circle
                for (let i = 0; i < 8; i++) {
                    const angle = (Math.PI / 4) * i;
                    const r = i % 2 === 0 ? enemy.radius : enemy.radius * 0.6;
                    const rx = Math.cos(angle) * r;
                    const ry = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                }
                ctx.closePath();
                break;

            case 'teleporter':
                // Star shape
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const r = enemy.radius;
                    const rx = Math.cos(angle) * r;
                    const ry = Math.sin(angle) * r;
                    if (i === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                }
                ctx.closePath();
                break;

            case 'shielder':
                // Pentagon
                for (let i = 0; i < 5; i++) {
                    const angle = (Math.PI * 2 / 5) * i - Math.PI / 2;
                    const rx = Math.cos(angle) * enemy.radius;
                    const ry = Math.sin(angle) * enemy.radius;
                    if (i === 0) ctx.moveTo(rx, ry);
                    else ctx.lineTo(rx, ry);
                }
                ctx.closePath();
                break;

            case 'healer':
                // Plus sign
                const w = enemy.radius * 0.4;
                ctx.rect(-w, -enemy.radius, w * 2, enemy.radius * 2);
                ctx.rect(-enemy.radius, -w, enemy.radius * 2, w * 2);
                break;

            case 'swarm_mother':
                // Large circle with inner circles
                ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
                break;

            case 'ghost':
                // Wavy ghost shape
                ctx.moveTo(0, -enemy.radius);
                ctx.quadraticCurveTo(enemy.radius, -enemy.radius / 2, enemy.radius, 0);
                ctx.quadraticCurveTo(enemy.radius, enemy.radius, 0, enemy.radius);
                ctx.quadraticCurveTo(-enemy.radius, enemy.radius, -enemy.radius, 0);
                ctx.quadraticCurveTo(-enemy.radius, -enemy.radius / 2, 0, -enemy.radius);
                break;

            default:
                ctx.arc(0, 0, enemy.radius, 0, Math.PI * 2);
        }
    }

    drawProjectile(proj: any): void {
        this.ctx.save();
        this.ctx.translate(proj.x, proj.y);
        this.ctx.rotate(proj.angle);

        this.ctx.fillStyle = proj.isEnemy ? '#ff0000' : '#ffff00';
        this.ctx.beginPath();
        this.ctx.arc(0, 0, 4, 0, Math.PI * 2);
        this.ctx.fill();

        this.ctx.restore();
    }

    drawGem(gem: any): void {
        this.ctx.save();
        this.ctx.translate(gem.x, gem.y);
        this.ctx.fillStyle = gem.color;

        // Diamond Shape
        this.ctx.beginPath();
        this.ctx.moveTo(0, -5);
        this.ctx.lineTo(5, 0);
        this.ctx.lineTo(0, 5);
        this.ctx.lineTo(-5, 0);
        this.ctx.closePath();
        this.ctx.fill();

        this.ctx.restore();
    }

    drawParticle(p: any): void {
        this.ctx.save();
        this.ctx.globalAlpha = p.life;
        this.ctx.fillStyle = p.color;
        this.ctx.beginPath();
        this.ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        this.ctx.fill();
        this.ctx.restore();
    }

    drawFloatingText(ft: any): void {
        this.ctx.save();
        this.ctx.globalAlpha = ft.alpha;
        this.ctx.fillStyle = ft.color;
        this.ctx.font = `bold ${ft.fontSize || 24}px "Rajdhani", Arial`;
        this.ctx.strokeStyle = 'black';
        this.ctx.lineWidth = 3;
        this.ctx.shadowColor = 'black';
        this.ctx.shadowBlur = 4;

        this.ctx.strokeText(ft.text, ft.x, ft.y);
        this.ctx.fillText(ft.text, ft.x, ft.y);
        this.ctx.restore();
    }

    drawUIOverlay(): void {
        // Any canvas-based UI (not DOM) goes here
        // e.g., Cursor crosshair
        const mouse = this.game.input.getMousePosition();
        this.ctx.strokeStyle = '#00f0ff';
        this.ctx.lineWidth = 2;
        this.ctx.beginPath();
        this.ctx.arc(mouse.x, mouse.y, 10, 0, Math.PI * 2);
        this.ctx.stroke();

        this.drawBossIndicators();
    }

    drawBossIndicators(): void {
        const padding = 50;
        const width = this.canvas.width;
        const height = this.canvas.height;
        const camera = this.game.camera;


        this.game.enemies.forEach((enemy: any) => {
            if (!enemy.isElite) return; // Only show for Elites/Bosses

            // Check if off-screen
            const screenX = enemy.x - camera.x;
            const screenY = enemy.y - camera.y;

            const isOffScreen = screenX < -enemy.radius || screenX > width + enemy.radius ||
                screenY < -enemy.radius || screenY > height + enemy.radius;

            if (isOffScreen) {
                // Calculate angle from center of screen (player position effectively relative to camera) to enemy
                const centerX = width / 2;
                const centerY = height / 2;
                const dx = screenX - centerX;
                const dy = screenY - centerY;
                const angle = Math.atan2(dy, dx);

                let indicatorX = centerX;
                let indicatorY = centerY;

                // Handle vertical/horizontal separately to avoid division by zero
                if (dx === 0) {
                    // straight up/down
                    indicatorX = centerX;
                    indicatorY = dy > 0 ? height - padding : padding;
                } else if (dy === 0) {
                    // straight left/right
                    indicatorX = dx > 0 ? width - padding : padding;
                    indicatorY = centerY;
                } else {
                    // General case using slopes
                    const m = dy / dx;
                    if (Math.abs(dx) * height > Math.abs(dy) * width) {
                        // Intersects vertical edges
                        if (dx > 0) {
                            indicatorX = width - padding;
                        } else {
                            indicatorX = padding;
                        }
                        indicatorY = centerY + (indicatorX - centerX) * m;
                    } else {
                        // Intersects horizontal edges
                        if (dy > 0) {
                            indicatorY = height - padding;
                        } else {
                            indicatorY = padding;
                        }
                        indicatorX = centerX + (indicatorY - centerY) / m;
                    }
                }

                // Clamp inside bounds
                indicatorX = Math.max(padding, Math.min(width - padding, indicatorX));
                indicatorY = Math.max(padding, Math.min(height - padding, indicatorY));

                // Draw Arrow
                this.ctx.save();
                this.ctx.translate(indicatorX, indicatorY);
                this.ctx.rotate(angle);

                this.ctx.fillStyle = enemy.color;
                this.ctx.beginPath();
                this.ctx.moveTo(10, 0);
                this.ctx.lineTo(-10, 10);
                this.ctx.lineTo(-10, -10);
                this.ctx.closePath();
                this.ctx.fill();

                // "BOSS" text
                this.ctx.rotate(-angle); // Reset rotation for text
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = 'bold 12px Rajdhani';
                this.ctx.textAlign = 'center';

                const label = (enemy.type.includes('boss') || enemy.type === 'secret') ? "BOSS" : "ELITE";
                this.ctx.fillText(label, 0, 20);

                this.ctx.restore();
            }
        });
    }
}
