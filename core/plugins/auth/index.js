import Authorizer from "./authorizer";
import PendingQueue from "./queue";

export default function AuthorizationPlugin(authorizer = new Authorizer()) {
    return function (config) {
        let unauthorized = false;
        const queue = new PendingQueue(authorizer);

        config.axios.interceptors.response.use(i => {
            return i;
        }, async function (e) {
            const {response} = e;
            if (!authorizer.checkResponse(response)) {
                if (!unauthorized) {
                    unauthorized = true;
                    const session = await authorizer.getSession();
                    if (authorizer.sessionHistory.isDeprecated(session)) {
                        // not need to validate invalid refresh_token
                        try {
                            await authorizer.onAuthorizedDenied(e);
                        } catch (e5) {
                            throw e;
                        } finally {
                            unauthorized = false;
                            queue.clear();
                        }
                    }
                    if (!authorizer.checkSession(e.config, session)) {
                        try {
                            await authorizer.storageSession(await authorizer.refreshSession(session));
                        } catch (e2) {
                            // invalid refresh_token
                            authorizer.sessionHistory.deprecate(session);
                            try {
                                await authorizer.onAuthorizedDenied(e2);
                            } catch (e3) {
                                throw e;
                            } finally {
                                unauthorized = false;
                                queue.clear();
                            }
                        }
                    }
                    unauthorized = false;
                    (() => {
                        while (queue.size) {
                            queue.pop();
                        }
                    })();
                    try {
                        return await queue.resend(e);
                    } catch (e4) {
                        throw e4;
                    }
                } else {
                    return await queue.push(e);
                }
            } else {
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