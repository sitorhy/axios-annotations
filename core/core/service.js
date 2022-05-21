import {isNullOrEmpty, normalizePath} from "./common";
import URLSearchParamsParser from "./parser";
import config from "./config";

export class Service {
    _path = "";
    _config = config;
    _headers = {};
    _params = {};

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
        const staticHeaders = root[id] || {};
        const staticValue = staticHeaders[header];
        if (!isNullOrEmpty(value)) {
            if (staticValue !== value) {
                Object.assign(root, {
                    [id]: Object.assign(
                        staticHeaders || {},
                        {
                            [header]: value
                        }
                    )
                });
            }
        } else if (isNullOrEmpty(header)) {
            return staticHeaders;
        } else {
            return staticValue;
        }
    }

    querystring(id, data) {
        const rules = this._params && this._params[id] ? this._params[id] : null;
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
                    URLSearchParamsParser.delete(encoder, key);
                }
            }

            return URLSearchParamsParser.encode(encoder);
        }

        return "";
    }

    body(id, data) {
        const rules = this._params && this._params[id] ? this._params[id] : null;
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

    createRequestConfig(method, path, data = {}, config = {}) {
        const url = path.indexOf("http") >= 0 ? path : this.config.baseURL + normalizePath(`/${this.path || ""}/${path}`);
        return Object.assign({
                method,
                url,
                data
            }, config
        );
    }

    request(method, path, data = {}, config = {}) {
        return this.config.axios.request(this.createRequestConfig(method, path, data, config));
    }
}