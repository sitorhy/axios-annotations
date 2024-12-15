import config from "./basic-config";

import {
    Service,
    RequestMapping,
    RequestConfig,
    RequestParam,
    RequestBody,
    RequestHeader,
    IgnoreResidualParams,
    Config,
    GetMapping,
    RequestWith
} from "build";

new Config("http", "localhost", 8082, "/pic").register("picConfig");

@RequestConfig(config)
@RequestMapping("")
export default class BasicTestService extends Service {

    @RequestParam("word", true)
    @RequestMapping("/hello", "GET")
    @IgnoreResidualParams()
    hello(word) {
        return {
            word,
            param1: "附加参数1",
            param2: "附加参数2"
        };
    }

    /*
    hello(word) {
        return this.requestWith("GET", "/hello")
            .param("word", true)
            .ignoreResidualParams(false)
            .send({
                word,
                param1: "附加参数1",
                param2: "附加参数2"
            });
    }
     */

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
    pic() {
        return null;
    }
}