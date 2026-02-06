import {
    Service,
    Config,
    RequestConfig,
    RequestMapping,
    Expect,
} from "axios-annotations";

const config = new Config({
    plugins: [],
    protocol: "http",
    host: "localhost",
    port: 5173,
    prefix: "/files"
});

@RequestConfig(config)
export default class BasicTestService extends Service {

    @RequestMapping("/package_config.json", "GET")
    getFile() {
        return Expect<Record<string, any>>({});
    }
}

async function run() {
    const { data: fileContent } = await new BasicTestService().getFile();
    console.log(fileContent);
}

run().then(r => {
   // ignore
});