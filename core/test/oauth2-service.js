import {Config} from "../core/config";
import {Service} from "../core/service";
import RequestConfig from "../decorator/request-config";
import RequestMapping from "../decorator/request-mapping";
import RequestParam from "../decorator/request-param";

const config = new Config();
config.host = "localhost";
config.port = 8080;
config.protocol = "http";
config.prefix = "/api";

@RequestConfig(config)
@RequestMapping("/oauth")
export default class OAuth2Service extends Service {
    @RequestMapping("/token", "GET")
    @RequestParam("grant_type", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", false)
    @RequestParam("client_secret", false)
    @RequestParam("username", false)
    @RequestParam("password", false)
    token() {
        return {
            grant_type: "password",
            scope: "all",
            client_id: "client_1",
            client_secret: "123456",
            username: "admin",
            password: "123456"
        };
    }

    @RequestMapping("/token")
    @RequestParam("grant_type", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", false)
    @RequestParam("client_secret", false)
    @RequestParam("username", false)
    @RequestParam("password", false)
    refreshToken(session) {
        return {
            grant_type: "refresh_token",
            refresh_token: session.refresh_token,
            scope: "all",
            client_id: "client_1",
            client_secret: "123456"
        };
    }
}