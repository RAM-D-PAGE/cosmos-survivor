type EventCallback = (data: any) => void;

export class EventManager {
    private listeners: Map<string, EventCallback[]>;

    constructor() {
        this.listeners = new Map();
    }

    on(event: string, callback: EventCallback): () => void {
        if (!this.listeners.has(event)) {
            this.listeners.set(event, []);
        }
        this.listeners.get(event)!.push(callback);

        // Return unsubscribe function
        return () => this.off(event, callback);
    }

    off(event: string, callback: EventCallback): void {
        if (!this.listeners.has(event)) return;

        const callbacks = this.listeners.get(event)!;
        const index = callbacks.indexOf(callback);
        if (index !== -1) {
            callbacks.splice(index, 1);
        }
    }

    emit(event: string, data?: any): void {
        if (!this.listeners.has(event)) return;

        this.listeners.get(event)!.forEach(callback => {
            try {
                callback(data);
            } catch (err) {
                console.error(`Error in EventListener for '${event}':`, err);
            }
        });
    }

    clear(): void {
        this.listeners.clear();
    }
}
