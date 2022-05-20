import SessionStorage from "./storage";

export default class Authorizer {
    _sessionKey = "$_SESSION";
    _sessionStorage = new SessionStorage();

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

    async getSession() {
        return await this.sessionStorage.get(this.sessionKey);
    }

    async storageSession(session) {
        await this.sessionStorage.set(this.sessionKey, session);
    }

    async refreshSession(session) {

    }

    withAuthentication(request, session) {
        if (session) {
            const {access_token, token} = session;
            if (access_token || token) {
                request.headers['Authorization'] = "Bearer " + (access_token || token);
            }
        }
    }

    checkSession(response) {
        const {status} = response || {status: 0};
        return status !== 401;
    }
}