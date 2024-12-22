import config from "./auth-config";

import {
    Service,
    RequestConfig,
    RequestMapping,
    RequestBody,
    RequestHeader, RequestParam
} from "axios-annotations";

@RequestConfig(config)
@RequestMapping("/auth")
export default class AuthTestService extends Service {

    channel1(marker) {
        return this.requestWith("GET", "/channel1")
            .param("marker", true)
            .send({marker});
    }

    @RequestMapping("/channel2", "POST")
    @RequestBody("body")
    @RequestParam("marker", false)
    @RequestHeader("Content-Type", "text/plain")
    channel2(marker) {
        return {marker, body: marker};
    }
}