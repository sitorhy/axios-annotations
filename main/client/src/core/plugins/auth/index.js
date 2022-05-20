import Authorizer from "./authorizer";

export default function AuthorizationPlugin(authorizer = new Authorizer()) {
    return function (config) {
        let refreshing = false;
        config.axios.interceptors.response.use(i => {
            return i;
        }, async function (e) {
            const {response} = e;
            if (!authorizer.checkSession(response)) {
                if (!refreshing) {
                    const session = await authorizer.getSession();
                    refreshing = true;
                } else {

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