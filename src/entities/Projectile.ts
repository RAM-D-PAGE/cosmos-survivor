import { ICollidable } from '../core/Types';

export class Projectile implements ICollidable {
    public x: number = 0;
    public y: number = 0;
    public angle: number = 0;
    public speed: number = 0;
    public damage: number = 0;
    public isEnemy: boolean = false;
    public radius: number = 4;
    public color: string = '#ffaa00';
    public velocity: { x: number, y: number } = { x: 0, y: 0 };
    public markedForDeletion: boolean = false;
    public lifeTime: number = 2.0;
    public timer: number = 0;

    // Special projectile properties
    public isHoming: boolean = false;
    public isExplosive: boolean = false;
    public isFreezing: boolean = false;
    public isPoison: boolean = false;
    public isPiercing: boolean = false;
    public pierceCount: number = 0;
    public maxPierce: number = 0;
    public targetEnemy: any = null; // For homing

    constructor(x: number, y: number, angle: number, speed: number, damage: number, isEnemy: boolean = false) {
        this.reset(x, y, angle, speed, damage, isEnemy);
    }

    reset(x: number, y: number, angle: number, speed: number, damage: number, isEnemy: boolean = false): void {
        this.x = x;
        this.y = y;
        this.angle = angle;

        this.speed = speed || 800;
        this.damage = damage || 10;
        this.isEnemy = isEnemy;
        this.radius = 4;
        this.color = isEnemy ? '#aa00ff' : '#ffaa00';

        this.velocity = {
            x: Math.cos(angle) * this.speed,
            y: Math.sin(angle) * this.speed
        };

        this.markedForDeletion = false;
        this.lifeTime = 2.0; // Seconds
        this.timer = 0;
    }

    update(dt: number): void {
        // Homing logic
        if (this.isHoming && !this.isEnemy) {
            // Find closest enemy
            let closest: any = null;
            let minDist = Infinity;
            const game = (window as any).game;
            
            if (game && game.enemies) {
                game.enemies.forEach((e: any) => {
                    if (e.markedForDeletion) return;
                    const dx = e.x - this.x;
                    const dy = e.y - this.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < 400 && dist < minDist) {
                        minDist = dist;
                        closest = e;
                    }
                });
            }

            if (closest) {
                const targetAngle = Math.atan2(closest.y - this.y, closest.x - this.x);
                // Smoothly rotate towards target
                let angleDiff = targetAngle - this.angle;
                while (angleDiff > Math.PI) angleDiff -= Math.PI * 2;
                while (angleDiff < -Math.PI) angleDiff += Math.PI * 2;
                
                this.angle += angleDiff * 5 * dt; // Turn rate
                this.velocity.x = Math.cos(this.angle) * this.speed;
                this.velocity.y = Math.sin(this.angle) * this.speed;
            }
        }

        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        this.timer += dt;
        if (this.timer > this.lifeTime) {
            this.markedForDeletion = true;
        }
    }
}
