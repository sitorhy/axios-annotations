import axios, {type Cancel, type CancelToken, type CancelTokenSource} from 'axios';

export class AbortEvent extends Event {
    public readonly reason: any;

    constructor(type: string, reason: any, eventInitDict?: EventInit) {
        super(type, eventInitDict);
        this.reason = reason;
    }
}

export abstract class AbortSignalAdapter {
    abstract get aborted(): boolean;

    abstract get reason(): any;

    abstract addEventListener(type: 'abort', listener: (ev: AbortEvent) => any, options?: any): void;

    abstract removeEventListener(type: 'abort', listener: (ev: AbortEvent) => any, options?: any): void;
}

export class NextAbortSignal extends AbortSignalAdapter {
    private signal: AbortSignal;
    private listenerMap = new Map<Function, Function>();

    constructor(signal: AbortSignal) {
        super();
        this.signal = signal;
    }

    get aborted(): boolean {
        return this.signal.aborted;
    }

    get reason(): any {
        return this.signal.reason;
    }

    addEventListener(type: 'abort', listener: (ev: AbortEvent) => any, options?: any): void {
        const wrapper = (nativeEvent: Event) => {
            const abortEvent = new AbortEvent('abort', this.signal.reason, {
                bubbles: nativeEvent.bubbles,
                cancelable: nativeEvent.cancelable,
                composed: nativeEvent.composed
            });
            listener(abortEvent);
        };
        this.listenerMap.set(listener, wrapper);
        this.signal.addEventListener(type, wrapper as any, options);
    }

    removeEventListener(type: 'abort', listener: (ev: AbortEvent) => any, options?: any): void {
        const wrapper = this.listenerMap.get(listener);
        if (wrapper) {
            this.signal.removeEventListener(type, wrapper as any, options);
            this.listenerMap.delete(listener);
        }
    }
}

export class CancelTokenSignalAdapter extends AbortSignalAdapter {
    private _aborted = false;
    private _reason?: Cancel;
    private listeners: ((ev: AbortEvent) => any)[] = [];

    constructor(token: CancelToken) {
        super();
        token.promise.then(cancel => {
            this._aborted = true;
            this._reason = cancel;
            const abortEvent = new AbortEvent('abort', this._reason);
            this.listeners.forEach(listener => listener(abortEvent));
        });
    }

    get aborted(): boolean {
        return this._aborted;
    }

    get reason(): any {
        return this._reason;
    }

    addEventListener(type: 'abort', listener: (ev: AbortEvent) => any, _options?: any): void {
        if (type === 'abort') {
            if (this.aborted) {
                listener(new AbortEvent(type, this._reason));
            } else {
                this.listeners.push(listener);
            }
        }
    }

    removeEventListener(type: 'abort', listener: (ev: AbortEvent) => any, _options?: any): void {
        if (type === 'abort') {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        }
    }
}

export abstract class AbortControllerAdapter {
    abstract get signal(): AbortSignalAdapter;

    abstract abort(reason?: any): void;

    abstract get source(): any;
}

export class NextAbortControllerAdapter extends AbortControllerAdapter {
    private controller: AbortController;

    constructor() {
        super();
        this.controller = new AbortController();
    }

    get signal(): AbortSignalAdapter {
        return new NextAbortSignal(this.controller.signal);
    }

    abort(reason?: any): void {
        this.controller.abort(reason);
    }

    get source() {
        return this.controller;
    }
}

export class CancelTokenAbortControllerAdapter extends AbortControllerAdapter {
    private cancelTokenSource: CancelTokenSource;
    private readonly _signal: CancelTokenSignalAdapter;

    constructor() {
        super();
        this.cancelTokenSource = axios.CancelToken.source();
        this._signal = new CancelTokenSignalAdapter(this.cancelTokenSource.token);
    }

    get signal(): AbortSignalAdapter {
        return this._signal;
    }

    abort(reason?: any): void {
        this.cancelTokenSource.cancel(reason);
    }

    get source() {
        return this.cancelTokenSource;
    }
}