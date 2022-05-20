import config from "./auth-config";

import {Service} from "../core/service";
import RequestConfig from "../decorator/request-config";
import RequestMapping from "../decorator/request-mapping";
import RequestParam from "../decorator/request-param";
import RequestBody from "../decorator/request-body";
import RequestHeader from "../decorator/request-header";

@RequestConfig(config)
@RequestMapping("/auth")
export default class AuthTestService extends Service {

    @RequestMapping("/channel1", "GET")
    @RequestParam("marker", true)
    channel1(marker) {
        return {marker};
    }

    @RequestMapping("/channel2", "POST")
    @RequestBody("marker", true)
    @RequestHeader("Content-Type", "text/plain")
    channel2(marker) {
        return {marker};
    }
}