import {
    Service,
    Config,
    RequestConfig,
    RequestBody,
    RequestMapping,
    RequestHeader,
    RequestParam,
} from "axios-annotations";

const config = new Config({
    plugins: [],
    protocol: "http",
    host: "localhost",
    port: 8888,
    prefix: "/test"
});

@RequestConfig(config)
export default class BasicTestService extends Service {

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
}