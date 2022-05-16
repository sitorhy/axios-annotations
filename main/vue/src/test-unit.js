import config from "@/service-config";

import {Service} from "@/core/core/service";
import RequestMapping from "@/core/decorator/request-mapping";
import RequestConfig from "@/core/decorator/request-config";
import RequestParam from "@/core/decorator/request-param";
import RequestBody from "@/core/decorator/request-body";
import RequestHeader from "@/core/decorator/request-header";

@RequestConfig(config)
@RequestMapping("/test")
export default class TestService extends Service {

    @RequestMapping("/hello", "GET")
    @RequestParam("word", true)
    hello(word) {
        return {
            word
        };
    }

    @RequestMapping("/message", "POST")
    @RequestParam("from", false)
    @RequestBody("body")
    @RequestHeader("Content-Type", "text/plain")
    postMessage(message, from) {
        return {
            body: message,
            from
        }
    }

    @RequestMapping("/json", "POST")
    @RequestBody("body")
    postJSON(message) {
        return {
            body: {
                message,
                date: Date.now()
            }
        }
    }
}