# Axios Annotations

HTTP client library uses Axios without Typescript.

## Quick Overview

### Basic Usage

开发环境不支持装饰器。

```javascript
import Service from "axios-annotations/core/service";
import {config} from "axios-annotations/core/config"

config.protocol = "http";
config.host = "localhost";
config.port = 8080;
config.prefix = "/api";

export default class TestService extends Service {
    /**
     * new TestService().get("a","b",null);
     * <br>
     * http://localhost:8080/api/path?p1=a&p2=b
     * @param data1
     * @param data2
     * @returns {AxiosPromise<any>}
     */
    get(required1, required2, optional1) {
        return this.requestWith("GET", "/path")
            .param("p1", true)
            .param("p2", true)
            .param("p3", false)
            .send({
                p1: required1,
                p2: required2,
                p3: optional1
            });
    }

    post(data1, data2) {
        return this.requestWith("POST", "/path2")
            .param("p1", true)
            .body("p2")
            .send({
                p1: data1,
                p2: data2
            });
    }

    basic() {
        return this.request("POST", "/path3?p1=a&p2=b", {field1: 'c', field: 'd'},
            {
                headers: {
                    'Content-Type': 'application/json'
                }
            }
        );
    }
}
```

### Basic Usage With Decorators

使用装饰器
<br>
可能需要插件支持：
<br>
`@babel/plugin-proposal-decorators`
<br>
`@babel/plugin-proposal-class-properties`
<br>
添加配置:

```json
{
  "plugins": [
    [
      "@babel/plugin-proposal-decorators",
      {
        "legacy": true
      }
    ],
    [
      "@babel/plugin-proposal-class-properties",
      {
        "loose": true
      }
    ]
  ]
}
```

`vue-cli`等脚手架已默认支持装饰器。 
<br>
方法只需要返回参数，并注解参数类型，查询串或是请求体。

```javascript
import Service from "axios-annotations/core/service";
import RequestConfig from "axios-annotations/decorator/request-config";
import RequestParam from "axios-annotations/decorator/request-param";
import RequestMapping from "axios-annotations/decorator/request-mapping";
import RequestBody from "axios-annotations/decorator/request-body";
import RequestHeader from "axios-annotations/decorator/request-header";

@RequestMapping("/api")
export default class TestService extends Service {
    @RequestMapping("/path", "GET")
    @RequestParam("p1", true)
    @RequestParam("p2", true)
    @RequestParam("p3", false) get(p1, p2, p3) {
        return {p1, p2, p3};
    }

    @RequestMapping("/path2", "POST")
    @RequestParam("p1", true)
    @RequestBody("p2")
    @RequestHeader("Content-Type", "text/plain") post(p1, str2) {
        return {p1, p2: str2};
    }
}
```

如果不爽部分IDE的`non-promise inspection info`下划线，也可以给方法加上`async`。

## Plugin

### Custom Plugin

插件函数接收配置对象为参数，出于扩展性考虑，通常由高阶函数返回。

```javascript
import {config} from "axios-annotations/core/config"

function ToastPlugin(fnToast) {
    return function (config) {
        config.axios.interceptors.response.use(function (e) {
            return Promise.resolve(e);
        }, function (e) {
            fnToast(e);
            return Promise.reject(e);
        });

        config.axios.interceptors.request.use(function (e) {
            return Promise.resolve(e);
        });
    }
}

config.plugins = [
    ToastPlugin(function (e) {
        if (typeof wx !== "undefined") {
            wx.showToast({
                icon: "none",
                title: `[${e.response.status}]` + ' ' + e.config.url
            });
        }
    })
];
```