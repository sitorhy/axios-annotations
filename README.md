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
方法只需要返回参数，并注解参数类型。

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
    @RequestParam("p3", false) 
    get(p1, p2, p3) {
        return {p1, p2, p3};
    }

    @RequestMapping("/path2", "POST")
    @RequestParam("p1", true)
    @RequestBody("p2")
    @RequestHeader("Content-Type", "text/plain") 
    post(p1, str2) {
        return {p1, p2: str2};
    }
}
```
如果不爽部分IDE的`non-promise inspection info`下划线，也可以给方法加上`async`。


### QueryString Encoding
`key-values pair`转查询串算法，运行环境不支持`URLSearchParams`时使用默认算法，也可以自定义。
<br>
使用第三方库,`qs`,`querystring`,`url-search-params-polyfill`等，不同运行环境下可能有差异。
```javascript
import qs from "qs";
import URLSearchParamsParser from "axios-annotations/core/parser";

if (typeof URLSearchParams === "undefined") {
    URLSearchParamsParser.encode = function (encoder) {
        return qs.stringify(encoder);
    }
}
```

## Configuration

### Custom Config

```javascript
import Config from "axios-annotations/core/config";
import RequestConfig from "axios-annotations/decorator/request-config";
import RequestMapping from "axios-annotations/decorator/request-mapping";

const config = new Config();
config.host = "localhost";
config.port = 8086;
config.protocol = "http";
config.prefix = "/api";

@RequestConfig(config)
@RequestMapping("/test")
export default class TestService extends Service {

}
```

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

### <text style="color:red;">Auth Plugin</text>
可选的内置插件。
<br>
Basic Usage for Auth Plugin.
<br>
Take case of `Spring Security OAtuh2.0`。
```javascript
// DevServer Proxy Config
const authCfg = new Config();
authCfg.host = "localhost";
authCfg.port = 8080;
authCfg.protocol = "http";
authCfg.prefix = "/api";

@RequestConfig(authCfg)
@RequestMapping("/oauth")
export default class OAuth2Service extends Service {
    @GetMapping("/token")
    @RequestParam("grant_type", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", false)
    @RequestParam("client_secret", false)
    @RequestParam("username", false)
    @RequestParam("password", false)
    @RequestBody()
    token() {
        return {
            grant_type: "password",
            scope: "all",
            client_id: "client_1",
            client_secret: "123456",
            username: "admin",
            password: "123456"
        };
    }

    @GetMapping("/token")
    @RequestParam("grant_type", true)
    @RequestParam("refresh_token", true)
    @RequestParam("scope", false)
    @RequestParam("client_id", true)
    @RequestParam("client_secret", true)
    refreshToken(session) {
        return {
            grant_type: "refresh_token",
            refresh_token: session.refresh_token,
            scope: "all",
            client_id: "client_1",
            client_secret: "123456"
        };
    }
}
```
Implement Authorizer.
<br/>
实现`Authorizer`类。
```javascript
import Authorizer from "axios-annotations/plugins/auth/authorizer";

export default class OAuth2Authorizer extends Authorizer {
    async refreshSession(session) {
        // access_token invalid, could refresh access_token with refresh_token through 'password' grant type
        // access_token 过期，如果使用 password 方式认证， 可使用 refresh_token 进行刷新
        const oauthService = new OAuth2Service();
        let res;
        try {
            res = await oauthService.refreshToken(session);
        } catch (e) {
            throw e;
        }
        if(!res || !res.data){
            throw new Error("Seession Unknow Error");
        }
        const nextSession = res.data;
        return nextSession;
    }

    async onAuthorizedDenied(error) {
        // refresh_token invalid，you should re-loign or logout here.
        // refresh_token 过期触发该回调，在此进行重新登录或注销操作

        // try logout, clean session.
        // await this.invalidateSession();
        // return;
        
        const res = await new OAuth2Service().token();
        if (res && res.data) {
            const nextSession = res.data;
            
            // save session manually if try re-login
            await this.storageSession(nextSession);
            return nextSession;
        }

        throw error;
    }

    onSessionInvalidated() {
        // session cleaned, redirect to login page.
        router.redirect("/login");
    }
}
```
认证信息默认存储在`sessionStorage`。
<br>
Implement SessionStorage if store mode changed.
```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import SessionStorage from "axios-annotations/plugins/auth/storage";

export default class RNSessionStorage extends SessionStorage {
    async set(key, value) {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
    }

    async get(key) {
        // omit...
    }

    async remove(key) {
        // omit...
    }
}
```
替换掉`Authorizer`存储器。
```javascript
export default class OAuth2Authorizer extends Authorizer {
    constructor() {
        super();
        this.sessionStorage = new RNSessionStorage();
    }
}
```
在默认配置上设置插件。
```javascript
// config.js
import AuthorizationPlugin from "axios-annotations/plugins/auth/index";

// default config
const config = new Config();
config.host = "localhost";
config.port = 8080;
config.protocol = "http";
config.prefix = "/api";

const _authorizer =  new OAuth2Authorizer();

config.plugins = [
    AuthorizationPlugin(_authorizer)
];

// export it in order to save or read the grant result
export const authorizer = _authorizer;

// service.js
// the request will be authorized or not
@RequestConfig(config)
@RequestMapping("/test")
export default class TestService extends Service {
    // ...
}
```
首次登录，需要手动保存认证信息。
<br>
but you may store grant information yourself when the first time login succeed.
```javascript
import {authorizer} from "/path/config.js";

// ... Login Page
{
    methods: {
        registerApi().then(async session => {
            await authorizer.sessionStorage.storageSession(session.data);
            // redirect to other page ...
        });
    }
}
```

## API
### Service
#### request(method, path, data?, config?): AxiosPromise
+ method : string  `GET / POST / DELETE...`
+ path : string `相对路径`
+ data : Object `请求体`
+ config : Object `AxiosRequestConfig`

#### requestWith(method, path): RequestController
+ method : string `GET /POST / DELETE...`
+ path : string `相对路径`

> #### RequestController
> + param: (key, required?) : RequestController
>   + key : string  `标记查询串参数`
>   + required : boolean  `默认false，空字符串，null，undefined 将忽略`
> + header: (header, header) : RequestController
>   + header : string `url 附加参数键值`
>   + header : string | function `字符串，或者接收 send 方法参数的函数，该函数应返回合法值。`
>
> + body: (key) : RequestController
>   + key : string `标记参数中请求体`
>
> + config: (cfg) : RequestController
>   + cfg : `AxiosRequestConfig`
>
> + send: (data) : AxiosPromise<any>
>   + data : object `参数键值对` 

### Decorators
#### RequestMapping(path, method?)
+ path : string `相对路径`
+ method : string  `默认GET，注解服务类时忽略该参数`
> 注解方法时，可以使用简化形式：
> <br>
> GetMapping(path)
> <br>
> PostMapping(path)
> <br>
> PatchMapping(path)
> <br>
> PutMapping(path)
> <br>
> DeleteMapping(path)

#### RequestParam(name, required?)
+ name : string `方法返回值属性`
+ required : boolean  `是否必要参数`

#### RequestHeader(header, value)
+ header : string `请求头`
+ value : string  `字符串或函数` 
> 使用函数。
> ```javascript
>    class TestService extends Service {
>        @RequestHeader("Authorization", (token) => {
>            return `Basic ${token}`;
>        })
>        @RequestMapping("/login", "GET")
>        foo(token) {
>            return {};
>        }
>    }
>  ```

#### RequestBody(name)
+ name : string `方法返回值属性，默认为 body`


### Authorizer (Optional Plugin)
+ sessionKey : string `键值名称`
    ```javascript
    authorizer.sessionKey = "$_SESSION"; // default value
    ```
+ getSession : Promise<Session> `获取授权信息`
  ```javascript
  function onLogin(){
    authorizer.getSession().then(session => {
        // fetch other info / redirect to other page
        store.dispatch('SAVE_USER_INFO' , info);
    });
  }  
  ```
+ checkResponse(response:AxiosResponse) : boolean `检查授权是否过期`
  ```javascript
  class OAuth2Authorizer extends Authorizer {
    checkResponse(response){
        return response.stauts === 401; // default implement
    } 
  }
  ```

+ withAuthentication(request: AxiosRequestConfig, session: Session) : void `请求附加认证信息，默认附加请求头`
  ```javascript
  class OAuth2Authorizer extends Authorizer {
    withAuthentication(request, session){
        request.headers.Authorization = 'Bearer 0x123456';
    } 
  }
  ``` 
## 运行环境
部分运行环境，例如微信小程序，`axios`需要降级。<br>
微信小程序：
```shell
npm install axios@0.21.0
npm install axios-miniprogram-adapter
```
更新开发工具版本以支持装饰器语法。
