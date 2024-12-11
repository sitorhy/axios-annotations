import Config from "../core/config";
import {forward} from "../core/common";
import Service from "../core/service";

export default function RequestMapping(path: string, method?: string) {
    return function(target: Function, name:string , descriptor:PropertyDescriptor) {
        if (!descriptor) {
            target.prototype._path = path;
        } else {
            if (!method) {
                method = "GET";
            }
            const fn = descriptor.value;

            descriptor.value = function (...args: any[]) {
                const data = fn.apply(this, args) || {};
                if (typeof (this as Service).for !== "function") {
                    throw new Error("Make sure your service inherited \"core/Service\".");
                }
                const registration = (this as Service).for(name);
                const withConfig = registration ? Config.forName(registration) : null;
                if (data && data.then && typeof data.then === "function") {
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