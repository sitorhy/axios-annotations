export default function AuthorizationPlugin(options = {}) {
    const pluginOptions = Object.assign(
        {
            sessionKey: "$_SESSION"
        },
        {
            getSession: async function () {
                if (sessionStorage) {
                    const str = sessionStorage.getItem(this.sessionKey);
                    if (str) {
                        return JSON.parse(str);
                    }
                } else if (typeof wx !== "undefined" && wx.getStorageSync) {
                    return wx.getStorageSync(this.sessionKey);
                }
                return null;
            },
            storageSession: async function (session, data) {
                if (sessionStorage) {
                    sessionStorage.setItem(this.sessionKey, JSON.stringify(Object.assign({}, session, data)));
                } else if (typeof wx !== "undefined" && wx.setStorageSync) {
                    wx.setStorageSync(this.sessionKey, Object.assign({}, session, data));
                }
            },
            invalidateSession: async function () {
                if (sessionStorage) {
                    sessionStorage.removeItem(this.sessionKey);
                    this.onSessionInvalidated();
                } else if (typeof wx !== "undefined" && wx.removeStorageSync) {
                    wx.removeStorageSync(this.sessionKey);
                    this.onSessionInvalidated();
                }
            },
            refreshSession: async function () {

            },
            checkSession: function (request, response) {

            },
            onAccessDenied: function () {

            },
            onSessionInvalidated: function () {

            }
        }, options);

    return function (config) {
        config.axios.interceptors.response.use(function (response) {
            console.log(response)
            return response;
        }, function (exception) {

            const {
                config,
                code,
                message,
                request,
                response
            } = exception;
            const {status} = response;
            console.log(exception)
            console.log(status)
            return Promise.reject(exception);
        });

        config.axios.interceptors.request.use(function (request) {
            return request;
        });
    }
}