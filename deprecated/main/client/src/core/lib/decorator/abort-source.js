export class AbortControllerAdapter {
    _source = null;

    constructor(CancelToken) {
        this._source = CancelToken.source();
    }

    get signal() {
        return {
            reason: this._source.token && this._source.token.reason ? (this._source.token.reason.message || "") : "",
            aborted: this._source.token && this._source.token.reason ? this._source.token.reason.code === "ERR_CANCELED" : false,
        };
    }

    get source() {
        return this._source;
    }

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
