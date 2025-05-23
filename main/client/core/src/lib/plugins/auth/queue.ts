import type {AxiosError, InternalAxiosRequestConfig} from "axios";
import Authorizer from "./authorizer";
import {Config} from "../../index";

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
    _config: Config;
    _minTryRetryInterval: number;
    _maxTryRetryInterval: number;
    _retryTimes: number;

    /**
     * @param {Authorizer} authorizer
     * @param {Config} config
     * @param {number} minTryRetryInterval
     * @param {number} maxTryRetryInterval
     * @param retryTimes
     */
    constructor(
        authorizer: Authorizer,
        config: Config,
        minTryRetryInterval: number = 3000,
        maxTryRetryInterval: number = 5000,
        retryTimes: number = 3,
    ) {
        this._authorizer = authorizer;
        this._config = config;
        this._minTryRetryInterval = minTryRetryInterval;
        this._maxTryRetryInterval = maxTryRetryInterval;
        this._retryTimes = retryTimes;
    }

    async resend(error: AxiosError, retries = 3): Promise<any> {
        for (let i = 0; i < this._retryTimes; ++i) {
            if (i > 0) {
                await sleep(random(this._minTryRetryInterval, this._maxTryRetryInterval));
            }
            const session = await this._authorizer.getSession();
            if (this._authorizer.sessionHistory.isDeprecated(session)) {
                // without re-login again, residual invalid session
                throw error;
            }
            try {
                const axios = await this._config.requestAxiosInstance();
                this._authorizer.withAuthentication(error.config as InternalAxiosRequestConfig, session);
                return axios.request(error.config as InternalAxiosRequestConfig);
            } catch (e) {
                if (i >= retries - 1) {
                    throw e;
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