import SessionStorage from "./storage";
import SessionHistory from "./history";

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
            const {access_token, accessToken, token} = session;
            if (access_token || accessToken || token) {
                request.headers['Authorization'] = "Bearer " + (access_token || accessToken || token);
            }
        }
    }

    checkSession(request, session) {
        const header = request.headers["Authorization"] || request.headers["authorization"];
        const jwt = header ? (header.split(" ")[1] || "") : "";
        return !this.sessionHistory.check(jwt);
    }

    checkResponse(response) {
        const {status} = response || {status: 0};
        return status !== 401;
    }

    async onAuthorizedDenied(error) {
        throw error;
    }

    onSessionInvalidated() {

    }

    async invalidateSession() {
        await this.sessionStorage.remove(this.sessionKey);
        this.onSessionInvalid();
    }
}