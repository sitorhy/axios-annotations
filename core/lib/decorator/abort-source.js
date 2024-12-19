export class AbortControllerAdapter {
    _source = null;

    // sham signal onabort
    _signal = {
        onabort: undefined,
        reason: "",
        aborted: false,
    };

    constructor(CancelToken) {
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

export default function (abortController) {
    return function (target, method, descriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function (...args) {
                let controller = abortController;
                if (typeof abortController === "function") {
                    controller = abortController.apply(undefined, args);
                }
                this.abort(method, controller);
                return fn.apply(this, arguments);
            };
        }
    };
}
