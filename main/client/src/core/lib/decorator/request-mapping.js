import Config from "../core/config";

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
                const cname = this.for(name);
                const thisConfig = cname ? (Config.forName(cname) || this) : this;
                const data = fn.apply(thisConfig, args) || {};
                if (data && Object.hasOwnProperty.call(data, "then") && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then(d => {
                            const {
                                path: p,
                                body,
                                config
                            } = thisConfig.createRequestConfig(name, thisConfig.pathVariable(path || "", d), d, args, args);
                            thisConfig.request(method, p, body, config).then(resolve).catch(reject);
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config
                    } = thisConfig.createRequestConfig(name, thisConfig.pathVariable(path || "", data), data, args, args);
                    return thisConfig.request(method, p, body, config);
                }
            };
        }
    };
}