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
import {localConfig} from "./config";

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
        value: function (source) {
            return source.num1 + source.num2;
        }
    })
    @RequestParam("num1")
    @RequestParam("num2")
    @RequestParam({
        key: 'sum',
        value: function (source) {
            return source.num1 + source.num2;
        }
    })
    @RequestParam("num3", true)
    @RequestParam("num4", false)
    @RequestConfig(function (source) {
        return {};
    })
    getPackageConfig(params) {
        return Expect({
            "Custom-Header": "header-value-from-source",
            num1: 100,
            num2: 200,
            ...params,
        });
    }

    @RequestMapping("/files/package_graph.json", "POST")
    @RequestBody()
    @RequestConfig(function (source) {
        return {};
    })
    getPackageGraph(params) {
        return Expect({
            body: {
                version: '3.x',
                description: '示例数据'
            },
            ...params
        });
    }

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
    @RequestConfig(function (source) {
        return {};
    })
    getProductInfo(params) {
        return Expect({
            ...params
        });
    }

    @RequestMapping("/files/{fileName}?a={a}&c={c}&e={e}", "GET")
    @PathVariables()
    @PathVariables({
        value: function (source) {
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
    @RequestConfig(function (source) {
        return {};
    })
    getFileInfo(params) {
        return Expect({
            ...params,
            d: 400,
            pathVariablesKey: {
                e: 500
            }
        });
    }
}