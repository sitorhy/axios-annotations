# Axios Annotations

Quick Configuration Framework without Typescript using axios.<br/>

声明式`API`配置工具。

## Quick Overview

+ Step 1：继承服务类`Service`
+ Step 2：注解路径和参数
+ Step 3：构建服务实例，调用接口

### Basic Usage

备胎，如果开发环境不支持装饰器。

```javascript
import {config, Service} from "axios-annotations"

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

    path(id) {
        return this.requestWith("GET", "/path3/{id}")
            .send({
                id
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

剩下自由发挥，自行管理服务实例。

```javascript
const ApiCommon = {
    test: new TestService()
};

// 调用接口
ApiCommon.test.get("a","b",null);
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

`vue-cli`、`vite`等脚手架已默认支持装饰器，微信小程序说明请拉到末尾。
<br>接口方法只需要处理和返回参数，并注解参数类型，框架根据注解分拆参数并注入`HTTP`请求。

```javascript
import {
  Service,
  equestConfig,
  equestParam,
  equestMapping,
  RequestBody,
  RequestHeader,
  IgnoreResidualParams
} from "axios-annotations";

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
        const defaultValue = {p1: "0x123456"};
        return Object.assign(defaultValue, {p1, p2: str2});
    }

    @RequestMapping("/path", "GET")
    @IgnoreResidualParams(false)
    getDefault() {
        return {
            p1: "p1",
            p2: "p2",
            p3: "p3"
        }
    }
}
```

调用接口：

```javascript
const ApiCommon = {
    test: new TestService()
};

// 调用API
ApiCommon.test.get("a","b",null);
```



如果不爽部分IDE的`non-promise inspection info`下划线，也可以给方法加上`async`。

### QueryString Encoding

`key-values pair`转查询串算法，运行环境不支持`URLSearchParams`时使用默认算法，也可以自定义。
<br>
使用第三方库,`qs`,`querystring`,`url-search-params-polyfill`等，不同运行环境下可能有差异。

```javascript
import qs from "qs";
import {URLSearchParamsParser} from "axios-annotations";

if (typeof URLSearchParams === "undefined") {
    URLSearchParamsParser.encode = function (encoder) {
        return qs.stringify(encoder);
    }
}
```

## Configuration

### Custom Config

配置服务链接，框架自带默认配置对象`config`，建议自行创建，使用`@RequestConfig`注入`Service`。

```javascript
import {
    Config,
    RequestConfig,
    RequestMapping
} from "axios-annotations";

const config = new Config({
    host: "localhost",
    port: 8086,
    protocol: "http",
    prefix: "/api",
    plugins: []
});

@RequestConfig(config)
@RequestMapping("/test")
export default class TestService extends Service {
    @RequestMapping("/{id}", "GET") 
    foo(id) {
        return {id};
    }
}
```

### Default Config

All Services inject this by default.

```javascript
import {config} from "axios-annotations";

config.host = "192.168.137.1";
config.port = 8080;
// ...
```

### Register Config

注册配置，用途：<br>

+ 不需要 `export` 导出，使用 `Config.forName(name:string)` 获取。
+ 部分特殊请求可能需要绕开自身配置，使用`@RequestWith(configName: string)`注解方法，请求将使用指定配置进行构建。

```javascript
new Config({
    protocol: "http",
    host: "localhost", 
    port: 9999, 
    prefix: "/auth"
}).register("withoutAuth");
```

```javascript
@RequestConfig(new Config({
    protocol: "http",
    host: "localhost", 
    port: 8888,
    prefix: "/prefix"
}))
@RequestMapping("/oauth") 
class AuthService extends Service {
    @PostMapping("/login")
    @RequestWith("withoutAuth") 
    login() {
        // http://localhost:9999/auth/oauth/login
        return {usename: "0x123456", password: "123456"};
    }
    
    @GetMapping("/foo")
    bar() {
        // http://localhost:8888/prefix/oauth/foo
        return {};
    }
}
```

## Abort
小程序端第三方库可能没有实现请求取消接口。
### 静态注入

静态注入的`AbortController`取消请求为一次性，仅调试用途。

```javascript
const controller = new AbortController();
// ...
class AuthService extends Service {
    // ...
    @RequestConfig({
      signal: controller.signal
    })
    bar() {
        // ....
        return {};
    }
}

// 取消请求
controller.abort()
```

或者：

```javascript
const controller = new AbortController();

// ...
class AuthService extends Service {
  // ...
  @AbortSource(controller) 
  bar() {
    // ....
    return {};
  }
}

new AuthService().bar().then(() => {

}).catch(e => {
  console.log(axios.isCancel(e));
});

// 取消请求
controller.abort()
```

兼容旧版 `CancelToken` `(deprecated)`:
```javascript
const CancelToken = axios.CancelToken;

const controller = new AbortControllerAdapter(CancelToken);

// ...
class AuthService extends Service {
  // ...
  @AbortSource(controller) 
  bar() {
    // ....
    return {};
  }
}


new AuthService().bar().then(() => {
    // ...
}).catch(e => {
  console.log(axios.isCancel(e));
});

// 取消请求
controller.signal.onabort = () => {
    console.log("aborted");  
};
controller.abort("cancel test")
```

### 动态创建中断源
不确定中断时机，自由发挥。
```javascript
// 自定义中断逻辑
class AbortSourceManager {
    // ...
    
    create () {
        return AbortController();
    }
    
    abortAll () {
        // ...
    }
}

const manager = new AbortSourceManager();

// ...
class AuthService extends Service {
    // ...
    @RequestConfig((...args)=>{
        console.log(args);
        const controller = manager.create();
        return {
          // ...
          signal: controller.signal
        };
    })
    bar() {
        // ....
        return {};
    }
}
```


## Plugin

### Custom Plugin

插件函数接收配置对象为参数，出于扩展性考虑，通常由高阶函数返回。

插件在`Config`对象的`axios`实例创建时注入，建议在`Config`构造函数配置。

```typescript
import {Config} from "axios-annotations"
import type {AxiosInstance} from "axios";

export function ToastPlugin(fnToast) {
    return function (config: Config, axios: AxiosInstance) {
        axios.interceptors.response.use(function (e) {
            return Promise.resolve(e);
        }, function (e) {
            fnToast(e);
            return Promise.reject(e);
        });

        axios.interceptors.request.use(function (e) {
            return Promise.resolve(e);
        });
    }
}
```

配置插件：

```javascript
new Config({
    plugins: [
        ToastPlugin(function (e) {
        	if (typeof wx !== "undefined") {
                wx.showToast({
                    icon: "none",
                    title: `[${e.response.status}]` + ' ' + e.config.url
                });
            }
        })
    ]
})
```



### <text style="color:red;">Auth Plugin</text>

可选的内置插件，适配需要身份认证的服务，以`Spring Security`作为后端实现为例。
<br>
Basic Usage for Auth Plugin.
<br>
Take the case of `Spring Security OAtuh2.0`。

```javascript
// DevServer Proxy Config
const authCfg = new Config({
    host: "localhost",
    port: 8080,
    protocol: "http",
    prefix: "/api"
});

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
实现`Authorizer`类。至少需要实现方法`refreshSession`、`onAuthorizedDenied`。如果需要调用`invalidateSession`，还需要重载`onSessionInvalidated`。

```javascript
import {Authorizer} from "axios-annotations/plugins/auth";

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
        if (!res || !res.data) {
            throw new Error("Seession Unknow Error");
        }
        const nextSession = res.data;
        return nextSession;
    }

    async onAuthorizedDenied(error) {
        // refresh_token invalid (HTTP 401 default)，you should re-loign or logout here.
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

    // 调用 invalidateSession() 清除持久化的认证信息后触发该回调
    onSessionInvalidated() {
        // session cleaned, redirect to login page.
        router.redirect("/login");
    }
}
```

如果是浏览器环境，持久化的认证信息默认存储在`sessionStorage`，默认键值`$_SESSION`，可以通过`window.sessionStorage.getItem("$_SESSION")`验证。
<br>

假如是`React Native`环境则需要自行实现持久化方案：

```javascript
import AsyncStorage from '@react-native-async-storage/async-storage';
import {SessionStorage} from "axios-annotations/plugins/auth";

export default class RNSessionStorage extends SessionStorage {
    async set(key, value) {
        const jsonValue = JSON.stringify(value);
        // key: default "$_SESSION"
        await AsyncStorage.setItem(key, jsonValue);
    }

    async get(key) {
        // key: default "$_SESSION"
    }

    async remove(key) {
        // key: default "$_SESSION"
    }
}
```

然后替换掉`Authorizer`存储器，如果通过重载`getSession`和`storageSession`实现验证信息存取，可以忽略掉`sessionStorage`和`sessionKey`，此时`sessionStorage`和`sessionKey`不会被调用。

```javascript
export default class OAuth2Authorizer extends Authorizer {
    constructor() {
        super();
        this.sessionStorage = new RNSessionStorage();
    }
}
```

在需要鉴权的服务配置上设置插件：

```javascript
// config.js
import {Config} from "axios-annotations";
import {AuthorizationPlugin} from "axios-annotations/plugins/auth";

const _authorizer = new OAuth2Authorizer();

const config = new Config({
    host: "localhost",
    port: 8080,
    protocol: "http",
    prefix: "/api",
    plugins: [
        AuthorizationPlugin(_authorizer)
    ]
});

// export it in order to save or read the grant result
// 导出authorizer对象，方便读取或保存认证信息
export const authorizer = _authorizer;

// service.js
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
> + body: (key) : RequestController
>   + key : string `标记参数中请求体`
> + config: (cfg) : RequestController
>   + cfg : `AxiosRequestConfig`
>
> + send: (data) : AxiosPromise<any>
>   + data : object `参数键值对`
> + with: (name) : RequestController
>   + name : string `config name : 已注册配置名称`

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

+ name : string `方法返回值属性，默认为 body，不能与 RequestParam name 参数重复，如果重复 RequestBody 请使用别名`,
```javascript
class TestService extends Service {
  @RequestMapping("/foo", "POST")
  @RequestHeader("Content-Type", "text/plain")
  @RequestParam("str", true)
  @RequestParam("strRepeat", true)
  foo(str) {
    return {
      p2: str,
      strRepeat: str // 如果请求体与查询串冲突
    };
  }
}
```

#### IgnoreResidualParams(ignore?)
+ ignore : boolean `拼接 QueryString 时是否忽略没有声明的参数`

#### RequestConfig(config)
+ axiosConfig: Config - class decorator，注解类，传入框架配置对象，注意不是 AxiosConfig。
+ axiosConfig: AxiosConfig | (...args:any[]) => AxiosConfig - method decorator，注解方法，注解方法时可根据请求参数构造配置对象。

```javascript
// GET /foo?p1=p1&p2=p2&p3=p3
class TestService extends Service {
    @RequestMapping("/foo", "GET")
    @RequestParam("p1", true)
    foo(token) {
        return {
            p1: "p1",
            p2: "p2", 
            p3: "p3"
        };
    }
}
```
该注解对请求体没有影响。
```javascript
// GET /foo?p1=p1
class TestService extends Service {
    @RequestMapping("/foo", "GET")
    @RequestParam("p1", true)
    @IgnoreResidualParams()
    foo(token) {
        return {
            p1: "p1",
            p2: "p2", 
            p3: "p3"
        };
    }
}
```

### Authorizer (Optional Plugin)

鉴权插件。

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
+ storageSession(session: Session): Promise<void> `存储授权信息`
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

### 微信小程序配置

更新开发工具以支持装饰器语法。

小程序`Typescript`环境不支持装饰器编译，但是`Javascript`环境可以。把涉及到`API`配置的`*.ts`文件扩展名改为`*.js`，绕过蹩脚的`TS`编译，本地配置勾选上`将JS编译成ES5`，正常引入即可。<br/>

> 开发工具BUG：`TS`环境`npm`构建失败
>
> 找到`project.config.json`文件，`setting`下面添加如下配置：
>
> ```json
> {
>     "packNpmManually": true,
>     "packNpmRelationList": [
>       {
>         "packageJsonPath": "./package.json",
>         "miniprogramNpmDistDir": "./miniprogram/"
>       }
>     ]
> }
> ```
>
> 开发工具`项目`→`重新打开此项目`，然后构建`npm`。

**安装第三方`axios`实现：**

+ 备胎1，使用适配器，`axios-miniprogram-adapter`

  `axios`需要降级，版本再高就得报错：

  ```shell
  npm install axios@0.26.1
  npm install axios-miniprogram-adapter
  ```
  
  开发工具如果编译报错 `module is not defined`， 在`app.js`头部补充缺失组件的声明：
  
  ```javascript
  import {
      Config,
      URLSearchParamsParser,
      AbortControllerAdapter,
      Service,
      AbortSource,
      DeleteMapping,
      GetMapping,
      IgnoreResidualParams,
      PatchMapping,
      PostMapping,
      PutMapping,
      RequestBody,
      RequestConfig,
      RequestHeader,
      RequestMapping,
      RequestParam,
      RequestWith
  } from "axios-annotations";
  ```
+ 备胎2，使用第三方实现，不限于`axios-miniprogram`

  ```shell
  npm install axios-miniprogram
  ```
  
  实现`AxiosStaticInstanceProvider`并配置，如果`IDE`警告`provide`返回类型，可忽略掉：
  
  ```javascript
  import mpAxios from 'axios-miniprogram';
  
  class ThirdAxiosStaticInstanceProvider extends AxiosStaticInstanceProvider {
      provide() {
          return mpAxios;
      }
  }
  
  const config = new Config({
      plugins: [],
      protocol: "http",
      host: "localhost",
      port: 8888,
      prefix: "/test",
      axiosProvider: new ThirdAxiosStaticInstanceProvider(),
  });
  ```
  
  
