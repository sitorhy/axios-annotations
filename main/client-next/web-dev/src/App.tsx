import './App.css'
import {useEffect} from "react";
import {
    Config,
    RequestConfig,
    RequestMapping,
    RequestParam,
    RequestBody,
    RequestHeader,
    RequestWith,
    Expect,
    Service,
} from "@/lib/index";

const config = new Config({
    protocol: "http",
    host: "localhost",
    prefix: "/resources",
    port: 5173
});

const config2 = new Config({
    protocol: "http",
    host: "localhost",
    prefix: "/data",
    port: 5173
});

@RequestConfig(config)
class WatchService extends Service {

    @RequestMapping("/demo.json", "POST")
    @RequestParam("param1")
    @RequestParam("param2")
    @RequestParam({
        key: "sum",
        value: function (source: Record<string, any>) {
            return Number(source['param1']) + Number(source['param2']);
        }
    })
    @RequestParam({
        key: 'static',
        value: 'foo'
    })
    @RequestBody()
    @RequestHeader("token", true)
    @RequestHeader({
        key: 'token2',
        value: '2222'
    })
    @RequestHeader({
        key: 'token3',
        value: function () {
            return '0x123456';
        }
    })
    getJson() {
        return Expect<Record<string, any>>({
            param1: '114',
            param2: '514',
            token: '1111',
            body: {
                employees: [
                    {
                        firstName: "John",
                        lastName: "Doe"
                    }
                ]
            }
        });
    }

    @RequestWith(config2)
    @RequestMapping("/test1.json", "GET")
    @RequestConfig({
        headers: {
            'X-Source': 'class',
            'Authorization': 'Bearer token'
        }
    })
    @RequestConfig(function (source: Record<string, any>) {
        return {
            headers: {
                'Token1': '1'
            },
            params: source.params
        };
    })
    getData() {
        return Expect<Record<string, any>>({
            params: {
                'a': 1,
                'b': 2
            }
        });
    }
}

async function test() {
    console.log('config', config);

    console.log('origin', config.origin);
    console.log('baseURL', config.baseURL);

    const service = new WatchService();
    console.log('service', service);

    const response = await service.getJson();

    console.log(response.data);

    const response2 = await service.getData();

    console.log(response2.data);
}

let initFlag = false;

function App() {
    useEffect(() => {
        if (!initFlag) {
            test();
        }
        initFlag = true;
    }, []);

    return (
        <div>
            <p>Web Dev Mode</p>
        </div>
    )
}

export default App
