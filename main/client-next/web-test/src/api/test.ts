import {
    Service,
    Expect,
    RequestConfig,
    RequestMapping,
    RequestHeader,
    RequestParam,
    RequestBody,
    PathVariables
} from "axios-annotations";
import {localConfig} from "./config.ts";

// 此处为基本用法
// @RequestConfig 注入服务配置
//
// @RequestHeader 注入请求头，有三种方式：
// @RequestHeader(key: string, required?: boolean)
// 从数据源中取数，默认必填，空值（null / undefined / ''）默认设置空字符串
// @RequestHeader(mapping: ParamsMapping)
// 自定义取值，设置静态值或自定义取值逻辑
//
// @RequestParam 跟 @RequestHeader 用法基本一致
// GET请求示例的最终的请求链接为：
// http://localhost:5173/files/package_config.json?num3=&sum=300&num2=200&num1=100
@RequestConfig(localConfig)
export class DemoService extends Service {
    @RequestMapping("/files/package_config.json", "GET")
    @RequestHeader("Custom-Header", true)
    @RequestHeader({
        key: "Custom-Header-2",
        value: "static-header-value",
        required: true,
    })
    @RequestHeader({
        key: "Custom-Header-3",
        value: function (source: Record<string, any>) {
            return source.num1 + source.num2;
        }
    })
    @RequestParam("num1")
    @RequestParam("num2")
    @RequestParam({
        key: 'sum',
        value: function (source: Record<string, any>) {
            return source.num1 + source.num2;
        }
    })
    @RequestParam("num3", true)
    @RequestParam("num4", false)
    getPackageConfig() {
        return Expect<Record<string, any>>({
            "Custom-Header": "header-value-from-source",
            num1: 100,
            num2: 200
        });
    }

    // 该处为POST请求示例
    // @RequestBody 只有一个参数，默认为 "body"，
    // 不同类型的请求体无法合并，多次注解请求体取值以最后执行的为准
    // @RequestBody(key?: string)
    // http://localhost:5173/files/package_graph.json
    @RequestMapping("/files/package_graph.json", "POST")
    @RequestBody()
    getPackageGraph() {
        return Expect<Record<string, any>>({
            body: {
                version: '3.x',
                description: '示例数据'
            }
        });
    }

    // 该处为POST请求示例，使用的是 @RequestBody 的扩展写法
    // @RequestBody 的自定义写法 跟 @RequestHeader / @RequestParam 基本一致
    // 不需要指定 key，value 可指定静态值或自定义逻辑
    // http://localhost:5173/files/product-info.json?random=720
    @RequestMapping("/files/product-info.json", "POST")
    @RequestParam({
        key: "random",
        value: function () {
            return (Math.random() * 1000).toFixed(0);
        }
    })
    @RequestBody({
        value: function () {
            return {
                version: '3.x',
                description: '示例数据2'
            };
        }
    })
    getProductInfo() {
        return Expect<Record<string, any>>({});
    }


    // http://localhost:5173/files/product-info.json?a=100&c=300&e=500&b=200
    @RequestMapping("/files/{fileName}?a={a}&c={c}&e={e}", "GET")
    @PathVariables()
    @PathVariables({
        value: function (source: Record<string, any>) {
            return {
                a: 100,
                c: 300,
                d: source.d
            }
        }
    })
    @PathVariables('pathVariablesKey')
    @RequestParam({
        key: 'b',
        value: 200
    })
    getFileInfo(fileName: string) {
        return Expect<Record<string, any>>({
            fileName,
            d: 400,
            pathVariablesKey: {
                e: 500
            }
        });
    }
}