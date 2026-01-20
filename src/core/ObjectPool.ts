export class ObjectPool<T> {
    private createFn: () => T;
    private pool: T[];
    public active: T[];

    constructor(createFn: () => T, initialSize: number = 10) {
        this.createFn = createFn;
        this.pool = [];
        this.active = [];

        for (let i = 0; i < initialSize; i++) {
            this.pool.push(this.createFn());
        }
    }

    get(): T {
        let obj: T;
        if (this.pool.length > 0) {
            obj = this.pool.pop()!;
        } else {
            obj = this.createFn();
        }
        this.active.push(obj);
        return obj;
    }

    release(obj: T): void {
        const index = this.active.indexOf(obj);
        if (index !== -1) {
            this.active.splice(index, 1);
            this.pool.push(obj);
        }
    }

    // Release all active objects
    releaseAll(): void {
        this.active.forEach(obj => this.pool.push(obj));
        this.active = [];
    }

    // Helper: Iterate over active objects (replacing forEach loops)
    forEachActive(callback: (obj: T, index: number) => void): void {
        // iterate backwards to allow safe removal during iteration if needed (though release is separate)
        for (let i = this.active.length - 1; i >= 0; i--) {
            callback(this.active[i], i);
        }
    }
}
