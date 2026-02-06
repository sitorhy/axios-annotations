import type {AxiosInstance, AxiosResponse, AxiosError, InternalAxiosRequestConfig} from 'axios';
import PendingQueue from "./queue";
import Authorizer from "./authorizer";
import Config from "../../core/config";
import type {ConfigPlugin} from "../../core/config";

export {default as Authorizer} from "./authorizer";
export {default as SessionStorage} from "./storage";

export type BasicSession = {
    access_token?: string;
    accessToken?: string;
    token?: string;

    refreshToken?: string;
    refresh_token?: string;
} & Record<string, any>;

export default function AuthorizationPlugin(
    authorizer: Authorizer,
    options?: {
        minTryRetryInterval: number;
        maxTryRetryInterval: number;
        retryTimes: number;
    }
): ConfigPlugin {
    return function (axios: AxiosInstance, config: Config) {
        let unauthorized: boolean = false;
        let expiredSession: BasicSession | null = null;
        const queue = new PendingQueue(
            authorizer,
            config,
            options?.minTryRetryInterval || 3000,
            options?.maxTryRetryInterval || 5000,
            options?.retryTimes || 3
        );

        axios.interceptors.response.use(i => {
            if (expiredSession) {
                // Previously requests sent have been rejected, record and release it (will be resending)
                // 会话过期加入过期队列，但未确认 refreshToken 是否失效
                authorizer.sessionHistory.add(expiredSession);
                expiredSession = null;
            }
            return i;
        }, async function (e: AxiosError) {
            const {response} = e;
            // HTTP Code = 401 ?
            if (!authorizer.checkResponse(response as AxiosResponse)) {
                // Yes, is first time 401 occurred ?
                if (!unauthorized) {
                    unauthorized = true;
                    // get current session (expired)
                    const session = await authorizer.getSession();
                    // is the refresh token expired and must be logged in again ?
                    if (authorizer.sessionHistory.isDeprecated(session)) {
                        // Yes, just throw the 401 error
                        // 此处触发说明 expiredSession 已被赋值被纳入过期队列, 且说明 refreshSession 刷新失败抛异常（refreshToken作废）
                        try {
                            // You may override this method for home page redirecting.
                            await authorizer.onAuthorizedDenied(e);
                            authorizer.sessionHistory.clean();
                        } catch (e5) {
                            throw e;
                        } finally {
                            unauthorized = false;
                            // 全部 reject 掉, 即抛出原始异常
                            queue.clear();
                        }
                    }
                    expiredSession = session;

                    // later 401 request will be put in resending queue until new accessToken generated.

                    // is accessToken of current expired session equal to request one ?
                    // Y: the request need to resend, put it in the queue.
                    // N: the session must have been updated, just resend the 401 request.
                    if (!authorizer.checkSession(e.config as InternalAxiosRequestConfig, session)) {
                        try {
                            // waiting for next accessToken refresh, on the server side, updates are synchronized.
                            // Note:
                            // even if the refreshing request send few times, the server side will only return the same token.
                            // 翻译：有效期内多次的刷新请求服务端应该保持 accessToken 不变，客户端不需要线程同步
                            await authorizer.storageSession(await authorizer.refreshSession(session));
                        } catch (e2) {
                            // invalid refresh_token
                            // 此处触发一般就是 refreshSession 刷新返回 401 / 500 等，非标准返回值需要自行抛出异常
                            // 作废会话，一般就是 refreshToken 失效
                            authorizer.sessionHistory.deprecate(session);
                            try {
                                await authorizer.onAuthorizedDenied(e2);
                                authorizer.sessionHistory.clean();
                            } catch (e3) {
                                throw e;
                            } finally {
                                unauthorized = false;
                                // cancel all requests resending.
                                // clear 就是 全部 reject 掉
                                queue.clear();
                            }
                        }
                    }
                    unauthorized = false;

                    // the accessToken refreshed, send the request itself and startup resending queue cleaning.
                    // 清空 else 分支积压的请求（重发）
                    (() => {
                        while (queue.size) {
                            queue.pop();
                        }
                    })();
                    try {
                        // 重发当前请求，当前请求没有压入队列需要单独处理
                        return await queue.resend(e);
                    } catch (e4) {
                        // 500 502 503 ...
                        throw e4;
                    }
                } else {
                    // No, 401 request occurred, put in to resending queue itself and waiting.
                    return (await queue.push(e));
                }
            } else {
                // HTTP Code = 500 503 502 ... just throw it
                throw e;
            }
        });

        axios.interceptors.request.use(async function (request) {
            const session = await authorizer.getSession();
            authorizer.withAuthentication(request, session);
            return request;
        });
    }
}