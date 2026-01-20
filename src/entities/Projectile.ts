export class Projectile {
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
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        this.timer += dt;
        if (this.timer > this.lifeTime) {
            this.markedForDeletion = true;
        }
    }
}
