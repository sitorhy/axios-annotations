import Authorizer from "../plugins/auth/authorizer";
import OAuth2Service from "./oauth2-service";

export default class OAuth2Authorizer extends Authorizer {
    sessionRefreshCallback = null;

    async refreshSession(session) {
        console.log('access_token invalid.');
        const oauthService = new OAuth2Service();

        let res;
        try {
            res = await oauthService.refreshToken(session)
        } catch (e) {
            // refresh_token invalid.
            throw e;
        }

        const nextSession = res.data;
        if (typeof this.sessionRefreshCallback === "function") {
            this.sessionRefreshCallback(nextSession);
        }
        console.log('access_token refreshed.');
        return nextSession;
    }

    async onAuthorizedDenied(error) {
        console.log('refresh_token invalid.');

        if (window.confirm("refresh_token invalid.\r\nlogin again?")) {
            const res = await new OAuth2Service().token();
            const nextSession = res.data;
            await this.storageSession(nextSession);

            if (typeof this.sessionRefreshCallback === "function") {
                this.sessionRefreshCallback(nextSession);
            }

            console.log(nextSession)

            return nextSession;
        }

        throw error;
    }
}