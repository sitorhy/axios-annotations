import type {InternalAxiosRequestConfig, AxiosResponse} from 'axios';
import SessionStorage from "./storage";
import SessionHistory from "./history";
import {BasicSession} from "./index";

export default class Authorizer {
    private _sessionKey: string = "$_SESSION";
    private _sessionStorage: SessionStorage = new SessionStorage();
    private _sessionHistory: SessionHistory = new SessionHistory();

    get sessionKey(): string {
        return this._sessionKey;
    }

    set sessionKey(value: string) {
        this._sessionKey = value;
    }

    get sessionStorage(): SessionStorage {
        return this._sessionStorage;
    }

    set sessionStorage(value: SessionStorage) {
        this._sessionStorage = value;
    }

    get sessionHistory(): SessionHistory {
        return this._sessionHistory;
    }

    set sessionHistory(value: SessionHistory) {
        this._sessionHistory = value;
    }

    async getSession() {
        return await this.sessionStorage.get(this.sessionKey);
    }

    async storageSession(session: BasicSession | null) {
        await this.sessionStorage.set(this.sessionKey, session);
    }

    async refreshSession(_session: BasicSession): Promise<any> {
        return null;
    }

    // append auth headers
    withAuthentication(request: InternalAxiosRequestConfig, session: BasicSession) {
        if (session) {
            const {access_token, accessToken, token} = session;
            if (access_token || accessToken || token) {
                if (request.headers) {
                    request.headers['Authorization'] = "Bearer " + (access_token || accessToken || token);
                }
            }
        }
    }

    // 匹配队列中的请求头token跟会话token是否一致
    checkSession(request: InternalAxiosRequestConfig, session: BasicSession) {
        const header = (request.headers || {})["Authorization"] || (request.headers || {})["authorization"];
        const jwt = typeof header === "string" ? (header.split(" ")[1] || "") : "";
        const token = session.access_token || session.accessToken || session.token;
        if (token === jwt) {
            // request header token equal to invalid session token
            return false;
        }
        // request time is too long , token may be refreshed few times
        if (this.sessionHistory.size) {
            if (this.sessionHistory.check(jwt)) {
                return false;
            }
        }
        return true;
    }

    checkResponse(response: AxiosResponse) {
        const {status} = response || {status: 0};
        return status !== 401;
    }

    async onAuthorizedDenied(error: unknown) {
        throw error;
    }

    onSessionInvalidated() {
        return;
    }

    async invalidateSession() {
        await this.sessionStorage.remove(this.sessionKey);
        this.onSessionInvalidated();
    }
}