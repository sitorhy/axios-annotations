import Config from "../core/config";
import {normalizePath} from "../core/common";

function forward(config, prefix, path, method, data) {
    const url = path.indexOf("http") >= 0 ? path : config.baseURL + normalizePath(`/${prefix || ""}/${path}`);
    return config.axios.request(Object.assign({
            method,
            url,
            data
        }, config
    ));
}

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
                const cname = this.for[name];
                const forConfig = cname ? Config.forName(cname) : null;
                const data = fn.apply(this, args) || {};
                if (data && Object.hasOwnProperty.call(data, "then") && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then(d => {
                            const {
                                path: p,
                                body,
                                config
                            } = this.createRequestConfig(name, this.pathVariable(path || "", d), d, args, args);
                            if (forConfig) {
                                forward(forConfig, this.path, path, method, data).then(resolve).catch(reject);
                            } else {
                                this.request(method, p, body, config).then(resolve).catch(reject);
                            }
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config
                    } = this.createRequestConfig(name, this.pathVariable(path || "", data), data, args, args);
                    if (forConfig) {
                        return forward(forConfig, this.path, path, method, data);
                    } else {
                        return this.request(method, p, body, config);
                    }
                }
            };
        }
    };
}