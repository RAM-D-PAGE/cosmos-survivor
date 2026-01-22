export class Input {
    keys: Record<string, boolean>;
    mouse: { x: number; y: number; isDown: boolean };

    previousKeys: Record<string, boolean>;

    constructor() {
        this.keys = {};
        this.previousKeys = {};
        this.mouse = { x: 0, y: 0, isDown: false };

        window.addEventListener('keydown', (e: KeyboardEvent) => this.onKeyDown(e));
        window.addEventListener('keyup', (e: KeyboardEvent) => this.onKeyUp(e));
        window.addEventListener('mousemove', (e: MouseEvent) => this.onMouseMove(e));
        window.addEventListener('mousedown', (e: MouseEvent) => this.onMouseDown(e));
        window.addEventListener('mouseup', (e: MouseEvent) => this.onMouseUp(e));
        window.addEventListener('blur', () => this.reset());
        window.addEventListener('contextmenu', (e: MouseEvent) => {
            e.preventDefault();
            this.reset();
        });
    }

    reset(): void {
        this.keys = {};
        this.previousKeys = {};
        this.mouse.isDown = false;
    }

    update(): void {
        this.previousKeys = { ...this.keys };
    }

    onKeyDown(e: KeyboardEvent): void {
        this.keys[e.code] = true;
    }

    onKeyUp(e: KeyboardEvent): void {
        this.keys[e.code] = false;
    }

    onMouseMove(e: MouseEvent): void {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;
    }

    onMouseDown(e: MouseEvent): void {
        if (e.button === 0) { // Left click
            this.mouse.isDown = true;
        }
    }

    onMouseUp(e: MouseEvent): void {
        if (e.button === 0) {
            this.mouse.isDown = false;
        }
    }

    isKeyPressed(code: string): boolean {
        return !!this.keys[code];
    }

    isKeyJustPressed(code: string): boolean {
        return !!this.keys[code] && !this.previousKeys[code];
    }

    getMousePosition(): { x: number; y: number } {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    isMouseDown(): boolean {
        return this.mouse.isDown;
    }
}
