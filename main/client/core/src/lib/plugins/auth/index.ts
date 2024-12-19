import PendingQueue from "./queue.js";
import Authorizer from "./authorizer.js";
import Config from "../../core/config.js";
import {AxiosError, AxiosResponse, InternalAxiosRequestConfig} from "axios";

export {default as Authorizer} from "./authorizer.js";
export {default as SessionStorage} from "./storage.js";

export default function AuthorizationPlugin(authorizer: Authorizer) {
    return function (config: Config) {
        let unauthorized: boolean = false;
        let expiredSession: Record<string, any> | null = null;
        const queue = new PendingQueue(authorizer);

        config.axios.interceptors.response.use(i => {
            if (expiredSession) {
                // Previously requests sent have been rejected, record and release it (will be resending)
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
                        try {
                            // You may override this method for home page redirecting.
                            await authorizer.onAuthorizedDenied(e);
                            authorizer.sessionHistory.clean();
                        } catch (e5) {
                            throw e;
                        } finally {
                            unauthorized = false;
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
                            await authorizer.storageSession(await authorizer.refreshSession(session));
                        } catch (e2) {
                            // invalid refresh_token
                            authorizer.sessionHistory.deprecate(session);
                            try {
                                await authorizer.onAuthorizedDenied(e2);
                                authorizer.sessionHistory.clean();
                            } catch (e3) {
                                throw e;
                            } finally {
                                unauthorized = false;
                                // cancel all requests resending.
                                queue.clear();
                            }
                        }
                    }
                    unauthorized = false;

                    // the accessToken refreshed, send the request itself and startup resending queue cleaning.
                    (() => {
                        while (queue.size) {
                            queue.pop();
                        }
                    })();
                    try {
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

        config.axios.interceptors.request.use(async function (request) {
            const session = await authorizer.getSession();
            authorizer.withAuthentication(request, session);
            return request;
        });
    }
}