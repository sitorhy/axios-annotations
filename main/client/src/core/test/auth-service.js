import config from "./auth-config";

import Service from "../core/service";
import RequestConfig from "../decorator/request-config";
import RequestMapping from "../decorator/request-mapping";
import RequestBody from "../decorator/request-body";
import RequestHeader from "../decorator/request-header";

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