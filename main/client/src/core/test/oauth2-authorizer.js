import Authorizer from "../plugins/auth/authorizer";
import OAuth2Service from "./oauth2-service";

export default class OAuth2Authorizer extends Authorizer {
    async refreshSession(session) {
        console.log('refreshing')
        const oauthService = new OAuth2Service();
        return await oauthService.refreshToken(session);
    }

    async onAuthorizedDenied(error) {

    }
}