# 装饰器可用性

下表总结了各个装饰器的使用范围。

| 装饰器 | 可用范围 | 描述 |
| :--- | :--- | :--- |
| `@RequestConfig` | 类 / 方法 | 设置请求配置（例如 `timeout`, `headers`）。 |
| `@RequestMapping` | 类 / 方法 | 定义 URL 路径和 HTTP 请求方法。 |
| `@RequestWith` | 方法 | 覆盖或扩展特定于方法的配置。 |
| `@RequestBody` | 方法 | 标记一个参数作为请求体。 |
| `@RequestHeader` | 方法 | 标记一个参数作为请求头发送。 |
| `@RequestParam` | 方法 | 标记一个参数作为 URL 查询参数发送。 |

---

# Authorizer 方法调用流程

以下流程图描述了在会话过期和认证流程中, `AuthorizationPlugin` 是如何调用 `Authorizer` 接口的各个方法的。

```mermaid
graph TD
    subgraph "响应拦截器 (处理401错误)"
        A("收到 401 响应") --> B{"检查 Refresh Token 是否也已过期?<br/>authorizer.sessionHistory.isDeprecated()"};
        B -- "是" --> C["调用 authorizer.onAuthorizedDenied()<br/>(e.g., 跳转登录页)"];
        B -- "否" --> D["尝试刷新 Token<br/>authorizer.refreshSession()"];
        D --> E{"刷新是否成功?"};
        E -- "否" --> F["标记 Session 不可再刷新<br/>authorizer.sessionHistory.deprecate()"];
        F --> C;
        E -- "是" --> G["存储新的 Session<br/>authorizer.storageSession()"];
    end

    subgraph "请求拦截器 (为请求附加身份验证)"
        H("发送新请求或重发请求") --> I["获取当前 Session<br/>authorizer.getSession()"];
        I --> J["将 Session 信息附加到请求头<br/>authorizer.withAuthentication()"];
    end

    G -.-> H;
```
