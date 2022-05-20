import axios from "axios";

export default class PendingQueue {
    _queue = [];
    _authorizer = null;
    _axios = axios.create();

    /**
     * @param {Authorizer} authorizer
     */
    constructor(authorizer) {
        this._authorizer = authorizer;
    }

    async resend(request, retries = 3) {
        for (let i = 0; i < retries; ++i) {
            const session = await this._authorizer.getSession();
            try {
                this._authorizer.withAuthentication(request, session);
                return await this._axios.request(request);
            } catch (e) {
                if (i >= retries) {
                    throw e;
                }
            }
        }
    }

    push(request) {
        return new Promise((resolve, reject) => {
            this._queue.push({request, resolve, reject});
        });
    }

    async pop() {
        const {request, resolve, reject} = this._queue.shift();
        try {
            resolve(await this.resend(request));
        } catch (e) {
            reject(e);
        }
    }

    get size() {
        return this._queue.length;
    }
}