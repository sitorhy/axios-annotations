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
        return await this.sessionStorage.get(this.sessionKey);
    }

    async storageSession(session) {
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
        this.onSessionInvalidated();
    }
}