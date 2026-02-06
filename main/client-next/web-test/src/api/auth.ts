import {RequestConfig, RequestMapping, Service, Expect, Config} from "axios-annotations";
import AuthorizationPlugin, {Authorizer, SessionStorage, type BasicSession} from "axios-annotations/plugins/auth";
import type {InternalAxiosRequestConfig} from "axios";

//// 以下是鉴权插件配置

class WebSessionStorage extends SessionStorage {
    async set(key: string, value: any): Promise<void> {
        return sessionStorage.setItem(key, JSON.stringify(value));
    }

    async get(key: string): Promise<any> {
        const str = sessionStorage.getItem(key);
        if (str) {
            return JSON.parse(str);
        } else {
            return null;
        }
    }

    async remove(key: string): Promise<void> {
        return sessionStorage.removeItem(key);
    }
}

class LocalAuthorizer extends Authorizer {
    constructor() {
        super();
        this.sessionStorage = new WebSessionStorage();
    }

    // 刷新 access_token，这里直接返回修改后的 session 对象即可
    async refreshSession(session: BasicSession): Promise<any> {
        try {
            const response = await new OAuthService().refreshToken({
                refresh_token: session.refresh_token || ''
            });
            console.log(`刷新 ${JSON.stringify(response.data)}`);
            // 此处组装新的 session 对象
            return {
                ...response.data
            };
        } catch (e) {
            // 刷新失败返回 null 即可
            console.error(e);
            return null;
        }
    }

    // 附加 session 字段到请求头
    withAuthentication(request: InternalAxiosRequestConfig, session: BasicSession) {
        // 这里使用默认实现，如果 refreshSession 返回 null, withAuthentication 的逻辑不会执行
        super.withAuthentication(request, session);
        // console.log(request.headers);
    }

    // 会话刷新过程抛出异常
    // refresh_token 失效，约等于 refreshSession 返回 null
    async onAuthorizedDenied(error: unknown): Promise<void> {
        console.error(error); // 这个是 refreshSession 抛出的异常

        // 删除会话信息
        // 调用 invalidateSession 触发 onSessionInvalidated
        await this.invalidateSession();
    }

    onSessionInvalidated() {
        // 跳转回登录页/首页
        window.history.replaceState({}, document.title, window.location.pathname);
    }
}

export const authorizer = new LocalAuthorizer();

const oauthConfig = new Config({
    protocol: 'http',
    host: 'localhost',
    port: 8080
});

const testConfig = new Config({
    protocol: 'http',
    host: 'localhost',
    port: 8080,
    plugins: [
        AuthorizationPlugin(authorizer)
    ]
});

@RequestConfig(oauthConfig)
export class OAuthService extends Service {
    // 随机字符串
    generateVerifier() {
        const array = new Uint32Array(56);
        window.crypto.getRandomValues(array);
        return Array.from(array, dec => ('0' + dec.toString(16)).slice(-2)).join('');
    }

    async getCodeChallenge(verifier: string) {
        const encoder = new TextEncoder();
        const data = encoder.encode(verifier);
        // 使用浏览器原生 Web Crypto API 进行 SHA-256 加密
        const digest = await window.crypto.subtle.digest('SHA-256', data);

        // Base64Url 编码 (注意：不是普通的 Base64)
        return btoa(String.fromCharCode(...new Uint8Array(digest)))
            .replace(/\+/g, '-')
            .replace(/\//g, '_')
            .replace(/=+$/, '');
    }

    // 根据 code 换取 accessToken 和 refreshToken
    @RequestMapping('/oauth2/token', 'POST')
    @RequestConfig(function (source) {
        const {signal, ...data} = source;
        return {
            headers: {
                'Authorization': 'Basic ' + btoa('test-client:test-secret'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            signal: signal,
            data,
        }
    })
    getToken(params: {
        code_verifier: string;
        code: string;
        redirect_uri: string;
        signal?: AbortSignal
    }) {
        return Expect<{
            access_token: string;
            refresh_token: string;
        }>({
            signal: params.signal,
            grant_type: 'authorization_code',
            code: params.code,
            client_id: 'test-client',
            redirect_uri: params.redirect_uri, // 必须与第一步完全一致
            code_verifier: params.code_verifier
        });
    }

    // 刷新 accessToken
    @RequestMapping('/oauth2/token', 'POST')
    @RequestConfig(function (source) {
        const {signal, ...data} = source;
        return {
            headers: {
                'Authorization': 'Basic ' + btoa('test-client:test-secret'),
                'Content-Type': 'application/x-www-form-urlencoded'
            },
            signal: signal,
            data,
        }
    })
    refreshToken(params: {
        refresh_token: string;
        signal?: AbortSignal
    }) {
        return Expect<{
            "access_token": string;
            "refresh_token": string;
            "scope": string;
            "token_type": string;
            "expires_in": number;
        }>({
            signal: params.signal,
            grant_type: 'refresh_token',
            refresh_token: params.refresh_token,
            client_id: 'test-client'
        });
    }
}

// 测试服务
@RequestConfig(testConfig)
export class AuthTestService extends Service {
    @RequestMapping("/api_1", "GET")
    api_1() {
        return Expect<Record<string, any>>({});
    }

    @RequestMapping("/api_2", "GET")
    api_2() {
        return Expect<Record<string, any>>({});
    }

    @RequestMapping("/api_3", "GET")
    api_3() {
        return Expect<Record<string, any>>({});
    }
}