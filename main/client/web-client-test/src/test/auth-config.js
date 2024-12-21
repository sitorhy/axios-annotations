import {Config} from "axios-annotations";
import {AuthorizationPlugin} from "axios-annotations/plugins/auth";
import OAuth2Authorizer from "./oauth2-authorizer";

const oAuth2Authorizer = new OAuth2Authorizer();

const config = new Config({
    host: "localhost",
    port: 8082,
    protocol: "http",
    prefix: "/api",
    plugins: [
        AuthorizationPlugin(oAuth2Authorizer)
//    , LogPlugin((e) => console.log(e))
    ]
});

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

export const authorizer = oAuth2Authorizer;
export default config;