export default function RequestMapping(path, method = null) {
    return function (target, name, descriptor) {
        if (!descriptor) {
            target.prototype._path = path;
        } else {
            if (!method) {
                method = "GET";
            }
            const fn = descriptor.value;

            descriptor.value = function (...args) {
                const data = fn.apply(this, args) || {};
                if (data && Object.hasOwnProperty.call(data, "then") && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then(d => {
                            const {
                                path: p,
                                body,
                                config
                            } = this.createRequestConfig(name, this.pathVariable(path, d), d, args, args);
                            this.request(method, p, body, config).then(resolve).catch(reject);
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config
                    } = this.createRequestConfig(name, this.pathVariable(path, data), data, args, args);
                    return this.request(method, p, body, config);
                }
            };
        }
    };
}