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
                    if (!authorizer.checkSession(e.config, session)) {
                        try {
                            await authorizer.storageSession(await authorizer.refreshSession(session));
                        } catch (e2) {
                            await authorizer.onAuthorizedDenied(e2);
                            throw e2;
                        }
                    }
                    (() => {
                        while (queue.size) {
                            queue.pop();
                        }
                    })();
                    return queue.resend(e.config);
                } else {
                    return await queue.push(e.config);
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