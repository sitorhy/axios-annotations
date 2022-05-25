import Config from "../core/config";
import Service from "../core/service";
import RequestConfig from "../decorator/request-config";
import RequestMapping from "../decorator/request-mapping";
import RequestParam from "../decorator/request-param";
import GetMapping from "../decorator/get-mapping";
import RequestBody from "../decorator/request-body";

const config = new Config();
config.host = "localhost";
config.port = 8082;
config.protocol = "http";
config.prefix = "/api";

@RequestConfig(config)
@RequestMapping("/oauth")
export default class OAuth2Service extends Service {
    @GetMapping("/token")
    @RequestParam("grant_type", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", false)
    @RequestParam("client_secret", false)
    @RequestParam("username", false)
    @RequestParam("password", false)
    @RequestBody()
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

    @GetMapping("/token")
    @RequestParam("grant_type", true)
    @RequestParam("refresh_token", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", true)
    @RequestParam("client_secret", true)
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