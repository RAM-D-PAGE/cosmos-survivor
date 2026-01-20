export class FloatingText {
    public x: number;
    public y: number;
    public text: string;
    public color: string;

    public velocity: { x: number, y: number };
    public gravity: number = 500;
    public lifeTime: number = 0.8;
    public life: number;
    public alpha: number = 1;
    public markedForDeletion: boolean = false;
    public fontSize: number = 24;

    constructor(x: number, y: number, text: string, color: string) {
        this.x = x;
        this.y = y;
        this.text = text;
        this.color = color;

        this.velocity = { x: (Math.random() - 0.5) * 60, y: -150 - Math.random() * 50 };
        this.life = this.lifeTime;

        if (typeof text === 'string' && (text.includes('!') || text.length > 3)) {
            this.fontSize = 32; // Critical or message
            this.velocity.y -= 50; // Pop higher
        }
    }

    update(dt: number): void {
        this.velocity.y += this.gravity * dt;
        this.x += this.velocity.x * dt;
        this.y += this.velocity.y * dt;

        this.life -= dt;
        this.alpha = Math.pow(Math.max(0, this.life / this.lifeTime), 0.5);

        if (this.life <= 0) this.markedForDeletion = true;
    }
}
