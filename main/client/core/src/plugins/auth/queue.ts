import axios, {AxiosInstance} from "axios";
import Authorizer from "./authorizer";

function random(min: number, max: number) {
    return (Math.random() * (max - min + 1) | 0) + min;
}

function sleep(time: number) {
    return new Promise((resolve: (_?: any) => void) => {
        let t: number | undefined = setTimeout(() => {
            clearTimeout(t);
            t = undefined;
            resolve();
        }, time);
    });
}

export default class PendingQueue {
    _queue: {
        error: any, resolve: (...args: any[]) => void, reject: (...args: any[]) => void;
    }[] = [];
    _authorizer: Authorizer;
    _axios: AxiosInstance = axios.create();

    /**
     * @param {Authorizer} authorizer
     */
    constructor(authorizer: Authorizer) {
        this._authorizer = authorizer;
    }

    async resend(error: any, retries = 3) {
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
    }

    push(error: any) {
        return new Promise((resolve, reject) => {
            this._queue.push({error, resolve, reject});
        });
    }

    pop() {
        const requestSaved = this._queue.shift();
        if (!requestSaved) {
            return;
        }
        const {error, resolve, reject} = requestSaved;
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