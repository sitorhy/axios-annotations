export class AbortControllerAdapter {
    _source = null;
    _signal = {
        aborted: false,
        reason: ""
    };

    constructor(CancelToken) {
        this._source = CancelToken.source();
    }

    get signal() {
        return this._signal;
    }

    get source() {
        return this._source;
    }

    abort(message = "") {
        if (message) {
            this._source.cancel(message);
        } else {
            this._source.cancel();
            this._signal.reason = message;
        }
        this._signal.aborted = true;
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
