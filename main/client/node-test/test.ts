import {
    Service,
    Config,
    RequestConfig,
    RequestBody,
    RequestMapping,
    RequestHeader,
    RequestParam,
    Expect,
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
    postMessage(message: string, from: string) {
        return Expect<string>({
            body: message,
            from
        });
    }
}

async function run() {
    const { data: responseMsg } = await new BasicTestService().postMessage("Hello", "nodejs");
    console.log(responseMsg);
}

run().then(r => {
   // ignore
});