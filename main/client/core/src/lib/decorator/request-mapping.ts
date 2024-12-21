import Config from "../core/config";
import {forward} from "../core/common";
import Service from "../core/service";

export default function RequestMapping(path: string, method?: string) {
    return function (target: Function, name: string, descriptor: PropertyDescriptor) {
        if (!descriptor) {
            target.prototype._path = path;
        } else {
            const fn = descriptor.value;

            descriptor.value = function (...args: any[]) {
                const data: Promise<any> | any = fn.apply(this, args) || {};
                if (typeof (this as Service).for !== "function") {
                    throw new Error("Make sure your service inherited \"core/Service\".");
                }
                // 当前方法是否重定向到其他配置
                const withConfigName = (this as Service).for(name);
                // 根据名称获取配置
                const withConfig: Config | null = Config.forName(withConfigName || "");
                if (data && data.then && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then((d: any) => {
                            const {
                                path: p,
                                body,
                                config,
                                query
                            } = (this as Service).createRequestConfig(name, (this as Service).pathVariable(path || "", d), d, args, args);
                            if (withConfig) {
                                withConfig.requestAxiosInstance().then(axios => {
                                    forward(axios, withConfig.origin, withConfig.prefix, (this as Service).path, path, method || "GET", query, body, config).then(resolve).catch(reject);
                                });
                            } else {
                                (this as Service).request(method || "GET", p, body, config).then(resolve).catch(reject);
                            }
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config,
                        query
                    } = (this as Service).createRequestConfig(name, (this as Service).pathVariable(path || "", data), data, args, args);

                    if (withConfig) {
                        return new Promise((resolve, reject) => {
                            withConfig.requestAxiosInstance().then(axios => {
                                return forward(axios, withConfig.origin, withConfig.prefix, (this as Service).path, path, method || "GET", query, body, config).then(resolve).catch(reject);
                            });
                        });
                    } else {
                        return (this as Service).request(method || "GET", p, body, config);
                    }
                }
            };
        }
    };
}