export class Particle {
    public x: number = 0;
    public y: number = 0;
    public color: string = '#ffffff';
    public size: number = 1;
    public speed: number = 0;
    public angle: number = 0;
    public velocity: { x: number, y: number } = { x: 0, y: 0 };
    public lifeTime: number = 1;
    public life: number = 1;
    public alpha: number = 1;
    public markedForDeletion: boolean = false;

    constructor(x: number, y: number, color: string) {
        this.reset(x, y, color);
    }

    reset(x: number, y: number, color: string): void {
        this.x = x;
        this.y = y;
        this.color = color;
        this.size = Math.random() * 3 + 1;
        this.speed = Math.random() * 100 + 50;
        this.angle = Math.random() * Math.PI * 2;
        this.velocity = {
            x: Math.cos(this.angle) * this.speed,
            y: Math.sin(this.angle) * this.speed
        };
        this.lifeTime = Math.random() * 0.5 + 0.3;
        this.life = this.lifeTime;
        this.alpha = 1;
        this.markedForDeletion = false;
    }

    update(dt: number): void {
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        this.life -= dt;
        this.alpha = this.life / this.lifeTime;

        if (this.life <= 0) {
            this.markedForDeletion = true;
        }
    }
}
