import axios from "axios";

function random(min, max) {
    return (Math.random() * (max - min + 1) | 0) + min;
}

function sleep(time) {
    return new Promise(resolve => {
        let t = setTimeout(() => {
            clearTimeout(t);
            t = undefined;
            resolve();
        }, time);
    });
}

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
            if (i > 0) {
                await sleep(random(3000, 5000));
            }
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
        throw error;
    }

    push(error) {
        return new Promise((resolve, reject) => {
            this._queue.push({error, resolve, reject});
        });
    }

    pop() {
        const {error, resolve, reject} = this._queue.shift();
        this.resend(error).then(resolve).catch(reject);
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