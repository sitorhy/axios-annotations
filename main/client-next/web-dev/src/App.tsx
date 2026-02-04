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
    Service, PathVariables,
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
    @RequestParam("param1") // 基本形式
    @RequestParam("param2") // 基本形式
    // 扩展写法（函数）
    @RequestParam({
        key: "sum",
        value: function (source: Record<string, any>) {
            return Number(source['param1']) + Number(source['param2']);
        }
    })
    // 扩展写法（静态值）
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
        // http://localhost:5173/resources/demo.json?static=foo&sum=628&param2=514&param1=114
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

    // 测试配置重定向，注意切换配置仍然会合并服务实例 @RequestMapping 声明的前缀
    // 需要将前缀提升到 Config 中
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
        // http://localhost:5173/data/test1.json?a=1&b=2
        return Expect<Record<string, any>>({
            params: {
                'a': 1,
                'b': 2
            }
        });
    }

    @RequestMapping("/{file}?a={a}", "GET")
    @PathVariables()
    @PathVariables('c')
    pathVariableTest() {
        // http://localhost:5173/resources/test2.json?a=200
        return Expect<Record<string, any>>({
            file: 'test2.json',
            c: {
                a: 200
            }
        });
    }

    @RequestMapping("/{file}?a={a}", "GET")
    @PathVariables({
        value: function () {
            return {
                file: 'test3.json',
                a: 100
            };
        }
    })
    pathVariableTest2() {
        // http://localhost:5173/resources/test3.json?a=100
        return Expect<Record<string, any>>({});
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

    const response3 = await service.pathVariableTest();

    console.log(response3.data);

    const response4 = await service.pathVariableTest2();

    console.log(response4.data);
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
