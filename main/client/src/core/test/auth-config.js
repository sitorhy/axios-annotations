import {Config} from "../core/config";
import AuthorizationPlugin from "../plugins/auth/index";
import OAuth2Authorizer from "./oauth2-authorizer";

const config = new Config();
config.host = "localhost";
config.port = 8080;
config.protocol = "http";
config.prefix = "/api";

const oAuth2Authorizer = new OAuth2Authorizer();

config.plugins = [
    AuthorizationPlugin(oAuth2Authorizer)
];

export const authorizer = oAuth2Authorizer;
export default config;