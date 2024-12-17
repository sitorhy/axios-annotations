import axios, {AxiosError, AxiosInstance, InternalAxiosRequestConfig} from "axios";
import Authorizer from "./authorizer";

function random(min: number, max: number): number {
    return (Math.random() * (max - min + 1) | 0) + min;
}

function sleep(time: number): Promise<void> {
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
        error: AxiosError, resolve: (arg: any) => void, reject: (arg: any) => void;
    }[] = [];
    _authorizer: Authorizer;
    _axios: AxiosInstance = axios.create();

    /**
     * @param {Authorizer} authorizer
     */
    constructor(authorizer: Authorizer) {
        this._authorizer = authorizer;
    }

    async resend(error: AxiosError, retries = 3): Promise<any> {
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
                this._authorizer.withAuthentication(error.config as InternalAxiosRequestConfig, session);
                return await this._axios.request(error.config as InternalAxiosRequestConfig);
            } catch (e) {
                if (i >= retries - 1) {
                    break;
                }
            }
        }
        throw error;
    }

    push(error: AxiosError): Promise<any> {
        return new Promise((resolve, reject) => {
            this._queue.push({error, resolve, reject});
        });
    }

    pop(): void {
        const requestSaved = this._queue.shift();
        if (!requestSaved) {
            return;
        }
        const {error, resolve, reject} = requestSaved;
        this.resend(error).then(resolve).catch(reject);
    }

    clear(): void {
        this._queue.splice(0).forEach(({error, reject}) => {
            reject(error);
        });
    }

    get size(): number {
        return this._queue.length;
    }
}