import config from "./auth-config";

import {
    Service,
    RequestConfig,
    RequestMapping,
    RequestBody,
    RequestHeader
} from "build";

@RequestConfig(config)
@RequestMapping("/auth")
export default class AuthTestService extends Service {

    channel1(marker) {
        return this.requestWith("GET", "/channel1")
            .param("marker", true)
            .send({marker});
    }

    @RequestMapping("/channel2", "POST")
    @RequestBody("marker")
    @RequestHeader("Content-Type", "text/plain")
    channel2(marker) {
        return {marker};
    }
}