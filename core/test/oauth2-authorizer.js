import Authorizer from "../plugins/auth/authorizer";
import OAuth2Service from "./oauth2-service";

export default class OAuth2Authorizer extends Authorizer {
    _sessionRefreshCallback = null;
    _reLoginAuto = false;

    get sessionRefreshCallback() {
        return this._sessionRefreshCallback;
    }

    set sessionRefreshCallback(value) {
        this._sessionRefreshCallback = value;
    }

    get reLoginAuto() {
        return this._reLoginAuto;
    }

    set reLoginAuto(value) {
        this._reLoginAuto = value;
    }

    async refreshSession(session) {
        const oauthService = new OAuth2Service();

        let res;
        try {
            console.log(`refreshing ${session.access_token} at ${new Date().toLocaleTimeString()}`);
            res = await oauthService.refreshToken(session);
        } catch (e) {
            throw e;
        }

        const nextSession = res.data;
        if (typeof this.sessionRefreshCallback === "function") {
            this.sessionRefreshCallback(nextSession);
        }

        console.log('access_token refreshed.');
        console.log(nextSession);

        return nextSession;
    }

    async onAuthorizedDenied(error) {
        if (this.reLoginAuto) {
            const res = await new OAuth2Service().token();
            if (res && res.data) {
                const nextSession = res.data;
                await this.storageSession(nextSession);

                if (typeof this.sessionRefreshCallback === "function") {
                    this.sessionRefreshCallback(nextSession);
                }

                console.log('refresh_token refreshed.');
                console.log(nextSession);

                return nextSession;
            }
        }

        throw error;
    }
}