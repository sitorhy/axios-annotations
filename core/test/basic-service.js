import config from "./basic-config";

import {Service} from "../core/service";
import RequestMapping from "../decorator/request-mapping";
import RequestConfig from "../decorator/request-config";
import RequestParam from "../decorator/request-param";
import RequestBody from "../decorator/request-body";
import RequestHeader from "../decorator/request-header";

@RequestConfig(config)
export default class BasicTestService extends Service {

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
    @RequestHeader("Content-Type", "application/json")
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