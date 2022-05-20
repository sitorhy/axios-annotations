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

    async resend(error, retries = 3) {
        for (let i = 0; i < retries; ++i) {
            const session = await this._authorizer.getSession();
            if (this._authorizer.sessionHistory.isDeprecated(session)) {
                // without re-login again, residual invalid session
                throw error;
            }
            try {
                this._authorizer.withAuthentication(error.config, session);
                return await this._axios.request(error.config);
            } catch (e) {
                if (i >= retries - 1) {
                    throw e;
                }
            }
        }
    }

    push(error) {
        return new Promise((resolve, reject) => {
            this._queue.push({error, resolve, reject});
        });
    }

    async pop() {
        const {error, resolve, reject} = this._queue.shift();
        try {
            resolve(await this.resend(error));
        } catch (e) {
            reject(e);
        }
    }

    clear() {
        this._queue.splice(0).forEach(({error, reject}) => {
            reject(error);
        });
    }

    get size() {
        return this._queue.length;
    }
}