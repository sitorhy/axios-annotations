import config from "./basic-config";

import Service from "../core/service";
import RequestMapping from "../decorator/request-mapping";
import RequestConfig from "../decorator/request-config";
import RequestParam from "../decorator/request-param";
import RequestBody from "../decorator/request-body";
import RequestHeader from "../decorator/request-header";
import IgnoreResidualParams from "../decorator/ignore-residual-params";
import Config from "../lib/core/config";
import GetMapping from "../lib/decorator/get-mapping";
import RequestWith from "../lib/decorator/request-with";

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