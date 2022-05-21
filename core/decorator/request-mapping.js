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
                        data.then(asyncData => {
                            const query = this.querystring(name, asyncData);
                            const body = this.body(name, asyncData);
                            const headersMap = this.headers(name);
                            const headers = {};
                            for (const h in headersMap) {
                                const value = headersMap[h];
                                if (typeof value === "function") {
                                    headers[h] = value.apply(undefined, arguments);
                                } else {
                                    headers[h] = value;
                                }
                            }
                            this.request(method, `${path}${query ? '?' + query : ''}`, body, {
                                headers
                            }).then(resolve).catch(reject);
                        });
                    });
                } else {
                    const query = this.querystring(name, data);
                    const body = this.body(name, data);
                    const headersMap = this.headers(name);
                    const headers = {};
                    for (const h in headersMap) {
                        const value = headersMap[h];
                        if (typeof value === "function") {
                            headers[h] = value.apply(undefined, arguments);
                        } else {
                            headers[h] = value;
                        }
                    }
                    return this.request(method, `${path}${query ? '?' + query : ''}`, body, {
                        headers
                    });
                }
            };
        }
    };
}