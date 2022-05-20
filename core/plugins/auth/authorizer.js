import SessionStorage from "./storage";

export class SessionHistory {
    static HistorySize = 10;

    _history = new Array(SessionHistory.HistorySize);
    _position = 0;
    _size = 0;

    get size() {
        return this._size;
    }

    add(session) {
        this._history[this._position % SessionHistory.HistorySize] = session;
        this._position %= SessionHistory.HistorySize;
        this._size = this._history.reduce((s, i) => i ? s + 1 : s, 0);
    }

    check(request) {
        const header = request.headers["Authorization"] || request.headers["authorization"];
        const jwt = header ? (header.split(" ")[1] || "") : "";
        return this._history.some(session => {
            if (session) {
                const {access_token, token} = session;
                return (access_token || token) === jwt;
            }
            return false;
        });
    }
}

export default class Authorizer {
    _sessionKey = "$_SESSION";
    _sessionStorage = new SessionStorage();
    _sessionHistory = new SessionHistory();

    get sessionKey() {
        return this._sessionKey;
    }

    set sessionKey(value) {
        this._sessionKey = value;
    }

    get sessionStorage() {
        return this._sessionStorage;
    }

    set sessionStorage(value) {
        this._sessionStorage = value;
    }

    get sessionHistory() {
        return this._sessionHistory;
    }

    set sessionHistory(value) {
        this._sessionHistory = value;
    }

    async getSession() {
        const session = await this.sessionStorage.get(this.sessionKey);
        if (!this.sessionHistory.size) {
            this.sessionHistory.add(session);
        }
        return session;
    }

    async storageSession(session) {
        this.sessionHistory.add(session);
        await this.sessionStorage.set(this.sessionKey, session);
    }

    async refreshSession(session) {
        return null;
    }

    withAuthentication(request, session) {
        if (session) {
            const {access_token, token} = session;
            if (access_token || token) {
                request.headers['Authorization'] = "Bearer " + (access_token || token);
            }
        }
    }

    checkSession(request, session) {
        return !this.sessionHistory.check(request);
    }

    checkResponse(response) {
        const {status} = response || {status: 0};
        return status !== 401;
    }

    async onAuthorizedDenied(error) {

    }
}