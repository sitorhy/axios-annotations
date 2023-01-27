import {forward, isNullOrEmpty, normalizePath} from "./common";
import URLSearchParamsParser from "./parser";
import Config, {config} from "./config";

export const ConfigMapping = {
    requestHeaders(rules, args = []) {
        const headers = {};
        if (rules) {
            for (const h in rules) {
                const value = rules[h];
                if (typeof value === "function") {
                    headers[h] = value.apply(undefined, args);
                } else {
                    headers[h] = value;
                }
            }
        }
        return headers;
    },

    axiosConfig(options, args) {
        const config = {};
        (options || []).forEach(o => {
            if (typeof o === "function") {
                Object.assign(config, o.apply(undefined, args));
            } else {
                Object.assign(config, o);
            }
        });
        return config;
    },

    querystring(features, rules, data) {
        if (!data) {
            return "";
        }
        if (rules) {
            const encoder = URLSearchParamsParser.decode(data);
            for (const key in data) {
                const value = data[key];
                const rule = rules[key];
                if (rule) {
                    if (!rule.body) {
                        if (!rule.required) {
                            if (isNullOrEmpty(value)) {
                                if (URLSearchParamsParser.has(encoder, key)) {
                                    URLSearchParamsParser.delete(encoder, key);
                                }
                            }
                        } else {
                            if (isNullOrEmpty(value)) {
                                if (!URLSearchParamsParser.has(encoder, key)) {
                                    URLSearchParamsParser.append(encoder, key, "");
                                }
                            }
                        }
                    } else {
                        URLSearchParamsParser.delete(encoder, key);
                    }
                } else {
                    if (features && features.ignoreResidualParams === true) {
                        URLSearchParamsParser.delete(encoder, key);
                    }
                }
            }

            for (const key in rules) {
                const rule = rules[key];
                if (rule && !rule.body && rule.required && !URLSearchParamsParser.has(encoder, key)) {
                    URLSearchParamsParser.append(encoder, key, "");
                }
            }

            return URLSearchParamsParser.encode(encoder);
        } else {
            if (features && features.ignoreResidualParams === true) {
                return "";
            } else {
                const encoder = URLSearchParamsParser.decode(data);
                return URLSearchParamsParser.encode(encoder);
            }
        }
    },

    body(rules, data) {
        if (rules) {
            for (const r in rules) {
                const rule = rules[r];
                if (rule.body === true) {
                    return !isNullOrEmpty(data) ? data[r] : undefined;
                }
            }
        }

        return null;
    }
};

export default class Service {
    _path = "";
    _config = config;
    _headers = {};
    _params = {};
    _configs = {};
    _for = {};
    _features = {}

    constructor(path = null) {
        if (!this._path && path) {
            this._path = path;
        }
        if (typeof Object.getPrototypeOf === "function") {
            if (Object.getPrototypeOf(this)._path) {
                this._path = Object.getPrototypeOf(this)._path;
            }
            if (Object.getPrototypeOf(this)._config) {
                this._config = Object.getPrototypeOf(this)._config;
            }
        } else {
            if (this.__proto__._path) {
                this._path = this.__proto__._path;
            }
            if (this.__proto__._config) {
                this._config = this.__proto__._config;
            }
        }

        if (this.config && this.config.plugins && this.config.plugins.length) {
            for (const plugin of this.config.plugins) {
                plugin(this.config);
            }
        }
    }

    get config() {
        return this._config;
    }

    set config(value) {
        this._config = value;
    }

    get path() {
        return this._path;
    }

    set path(value) {
        this._path = value;
    }

    params(id, name, config = {required: false}) {
        if (!this._params || !this._params[id] || !Object.hasOwnProperty.call(this._params[id], name)) {
            const cfg = Object.assign({
                required: false,
                body: false
            }, config);

            const root = this._params || {};
            const rules = this._params ? (this._params[id] || {}) : {};
            const rule = rules[name] || {};

            if (cfg.body === true) {
                for (const r in rules) {
                    const rule = rules[r];
                    rule.body = false;
                }
            }

            this._params =
                Object.assign(
                    root,
                    {
                        [id]: Object.assign(
                            rules,
                            {
                                [name]: Object.assign(
                                    rule,
                                    cfg
                                )
                            }
                        )
                    }
                );
        }
    }

    headers(id, header, value) {
        const root = this._headers || {};
        Object.assign(root, {
            [id]: Object.assign(
                root[id] || {},
                {
                    [header]: value
                }
            )
        });
    }

    for(id, registration) {
        if (arguments.length === 1) {
            return this._for[id];
        }
        Object.assign(this._for, {
            [id]: registration
        });
    }

    features(id, options) {
        if (arguments.length === 1) {
            return this._features[id];
        }
        Object.assign(this._features, {
            [id]: options
        });
    }

    configs(id, options) {
        const root = this._configs || {};
        Object.assign(root, {
            [id]: (root[id] || []).concat(options)
        });
    }

    pathVariable(path, data) {
        let p = path || "";
        const matchers = p.match(/{\w+}/g);
        if (Array.isArray(matchers)) {
            matchers.forEach(m => {
                const field = m.substring(1, m.length - 1);
                p = p.replaceAll(`\{${field}\}`, data[field]);
            });
        }
        return p;
    }

    createRequestConfig(id, path, data, headerArgs = [], configArgs = []) {
        const query = ConfigMapping.querystring(this._features[id], this._params[id], data);
        const body = ConfigMapping.body(this._params[id], data);
        const headers = ConfigMapping.requestHeaders(this._headers[id], headerArgs);
        const config = ConfigMapping.axiosConfig(this._configs[id], configArgs);
        const p = `${path}${query ? ((path.lastIndexOf("?") >= 0 ? "&" : "?") + query) : ""}`;
        Object.assign(config, {
            headers: Object.assign(headers, config.headers || null)
        });
        return {
            path: p,
            body,
            config,
            query
        }
    }

    request(method, path, data = {}, config = {}) {
        const url = path.indexOf("http") >= 0 ? path : this.config.baseURL + normalizePath(`/${this.path || ""}/${path}`);
        return this.config.axios.request(Object.assign({
                method,
                url,
                data
            }, config
        ));
    }

    requestWith(method, path = "") {
        const _params = {};
        const _configs = [];
        const _headers = {};
        const _features = {};
        let _withConfig = this.config;
        const controller = {
            with(registration) {
                const c = Config.forName(registration);
                if (c) {
                    _withConfig = c;
                }
                return controller;
            },
            param: (key, required = false) => {
                const rule = _params[key] || {};
                Object.assign(
                    _params,
                    {
                        [key]: Object.assign(
                            rule,
                            {required, body: false}
                        )
                    }
                );
                return controller;
            },
            ignoreResidualParams(ignore = true) {
                Object.assign(_features, {
                    ignoreResidualParams: ignore === true
                });
                return controller;
            },
            header: (header, value) => {
                Object.assign(
                    _headers,
                    {
                        [header]: value
                    }
                );
                return controller;
            },
            body: (key) => {
                const rule = _params[key] || {};
                for (const r in _params) {
                    const rule = _params[r];
                    rule.body = false;
                }
                Object.assign(
                    _params,
                    {
                        [key]: Object.assign(
                            rule,
                            {required: false, body: true}
                        )
                    }
                );
                return controller;
            },
            config: (cfg) => {
                _configs.push(cfg);
                return controller;
            },
            send: (data = {}) => {
                const query = ConfigMapping.querystring(_features, _params, data);
                const body = ConfigMapping.body(_params, data);
                const headers = ConfigMapping.requestHeaders(_headers, [data]);
                const config = ConfigMapping.axiosConfig(_configs, [data]);
                Object.assign(config, {
                    headers: Object.assign(headers, config.headers || null)
                });
                if (_withConfig) {
                    return forward(_withConfig.axios, _withConfig.origin, _withConfig.prefix, this.path, path, method, query, body, config);
                } else {
                    const p = `${this.pathVariable(path || "", data)}${query ? ((path.lastIndexOf("?") >= 0 ? "&" : "?") + query) : ""}`;
                    return this.request(method, p, body, config);
                }
            }
        };
        return controller;
    }
}