import Config from "../core/config";
import AuthorizationPlugin from "../plugins/auth/index";
import OAuth2Authorizer from "./oauth2-authorizer";

const config = new Config();
config.host = "localhost";
config.port = 8082;
config.protocol = "http";
config.prefix = "/api";

const oAuth2Authorizer = new OAuth2Authorizer();

function LogPlugin(fnToast) {
    return function (config) {
        config.axios.interceptors.response.use(function (e) {
            fnToast(e);
            return Promise.resolve(e);
        }, function (e) {
            return Promise.reject(e);
        });

        config.axios.interceptors.request.use(function (e) {
            return Promise.resolve(e);
        });
    }
}


config.plugins = [
    AuthorizationPlugin(oAuth2Authorizer)
//    , LogPlugin((e) => console.log(e))
];

export const authorizer = oAuth2Authorizer;
export default config;