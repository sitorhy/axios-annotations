import type {CancelTokenSource, CancelTokenStatic} from "axios";

/**
 * 兼容旧版CancelToken，包装成AbortController
 */
export default class AbortControllerAdapter {
    /**
     * {
     *     cancel: (message, config, request) => void;
     *     token: { promise, _listeners, reason: CanceledError }
     * }
     */
    _source: CancelTokenSource;

    // sham signal onabort
    _signal: {
        onabort?: (e: Event) => void;
        reason?: string;
        aborted: boolean;
    } = {
        onabort: undefined,
        reason: "",
        aborted: false,
    };

    constructor(CancelToken: CancelTokenStatic) {
        this._source = CancelToken.source();
        this._source.token.promise.then(() => {
            if (typeof this._signal.onabort === "function") {
                this._signal.onabort(new Event("abort"));
            }
            this._signal.aborted = true;
            this._signal.reason = this._source.token.reason?.message;
        });
    }

    /**
     * sham AbortSignal. <br/>
     * signal struct: {aborted: true, reason: string, onabort: null}  <br/>
     */
    get signal() {
        return this._signal;
    }

    get source() {
        return this._source;
    }

    // sham AbortController.abort(reason)
    abort(message = "") {
        if (message) {
            this._source.cancel(message);
        } else {
            this._source.cancel();
        }
    }
}