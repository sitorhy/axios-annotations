import config from "./basic-config";

import Service from "../core/service";
import RequestMapping from "../decorator/request-mapping";
import RequestConfig from "../decorator/request-config";
import RequestParam from "../decorator/request-param";
import RequestBody from "../decorator/request-body";
import RequestHeader from "../decorator/request-header";
import Config from "../lib/core/config";
import GetMapping from "../lib/decorator/get-mapping";
import RequestWith from "../lib/decorator/request-with";

new Config("http", "localhost", 8082, "/pic").register("picConfig");

@RequestConfig(config)
export default class BasicTestService extends Service {

    @RequestParam("word", true)
    @RequestMapping("/hello", "GET")
    hello(word) {
        return {
            word
        };
    }

    @RequestBody()
    @RequestMapping("/message", "POST")
    @RequestHeader("Content-Type", "text/plain")
    @RequestParam("from", false)
    postMessage(message, from) {
        return {
            body: message,
            from
        }
    }

    @RequestBody("body")
    @RequestHeader("Content-Type", "application/json")
    @RequestMapping("/json", "POST")
    postJSON(message) {
        return {
            body: {
                message,
                date: Date.now()
            }
        }
    }

    @GetMapping()
    @RequestWith("picConfig")
    baiduHome() {
        return {};
    }
}