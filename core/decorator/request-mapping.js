export default function RequestMapping(path, method = null) {
    return function (target, name, descriptor) {
        if (!descriptor) {
            target.prototype._path = path;
        } else {
            if (!method) {
                method = "GET";
            }
            const fn = descriptor.value;

            descriptor.value = function () {
                const data = fn.apply(this, arguments);
                if (data && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then(d => {
                            const {
                                path: p,
                                body,
                                headers
                            } = this.createRequestConfig(name, this.pathVariable(path, d), d);
                            this.request(method, p, body, {
                                headers
                            }).then(resolve).catch(reject);
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        headers
                    } = this.createRequestConfig(name, this.pathVariable(path, data), data);
                    return this.request(method, p, body, {
                        headers
                    });
                }
            };
        }
    };
}