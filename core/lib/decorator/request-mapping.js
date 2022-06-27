import Config from "../core/config";
import {forward} from "../core/common";

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
                const registration = this.for(name);
                const withConfig = registration ? Config.forName(registration) : null;
                if (data && Object.hasOwnProperty.call(data, "then") && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then(d => {
                            const {
                                path: p,
                                body,
                                config,
                                query
                            } = this.createRequestConfig(name, this.pathVariable(path || "", d), d, args, args);
                            if (withConfig) {
                                forward(withConfig.axios, withConfig.origin, withConfig.prefix, this.path, path, method, query, body, config).then(resolve).catch(reject);
                            } else {
                                this.request(method, p, body, config).then(resolve).catch(reject);
                            }
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config,
                        query
                    } = this.createRequestConfig(name, this.pathVariable(path || "", data), data, args, args);
                    if (withConfig) {
                        return forward(withConfig.axios, withConfig.origin, withConfig.prefix, this.path, path, method, query, body, config);
                    } else {
                        return this.request(method, p, body, config);
                    }
                }
            };
        }
    };
}