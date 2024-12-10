import {AxiosRequestConfig, CancelTokenSource, Method} from "axios";
import {forward, isNullOrEmpty, normalizePath} from "./common";
import URLSearchParamsParser from "./parser";
import Config, {config} from "./config";

export type HeaderMappingValueType = string | ((...args: any[]) => string);
export type AxiosConfigOptionMappingType = keyof AxiosRequestConfig | ((...args: any[]) => (keyof AxiosRequestConfig));
export type AbortControllerGenerator = ((...args: any[]) => (AbortController & { source: CancelTokenSource }));
export type QueryStringEncodeFeatures = {
    ignoreResidualParams?: boolean;
    abortController?: (AbortController & { source: CancelTokenSource }) | AbortControllerGenerator;
};
export type RequestParamEncodeRule = {
    body?: boolean;
    required?: boolean;
};

export const ConfigMapping = {
    requestHeaders(rules: Record<string, HeaderMappingValueType>, args: any[] = []): Record<string, string> {
        const headers: Record<string, string> = {};
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

    axiosConfig<D = any>(options: AxiosConfigOptionMappingType[], args: any[]): AxiosRequestConfig<D> {
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

    querystring(features: QueryStringEncodeFeatures | null, rules: Record<string, RequestParamEncodeRule>, data: Record<string, any>) {
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

    /**
     * 从参数对象中提取 body 所属字段
     * @param rules
     * @param data
     */
    body(rules: Record<string, RequestParamEncodeRule>, data: Record<string, any>) {
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

// noinspection JSUnusedGlobalSymbols
export default class Service {
    _path: string = "";
    _config: Config = config;
    _headers: Record<string, Record<string, HeaderMappingValueType>> = {};
    _params: Record<string, Record<string, RequestParamEncodeRule>> = {};
    _configs: Record<string, AxiosConfigOptionMappingType[]> = {};
    _for: Record<string, Config> = {};
    _features: Record<string, QueryStringEncodeFeatures> = {}

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
            if (Object.getPrototypeOf(this)._path) {
                this._path = Object.getPrototypeOf(this)._path;
            }
            if (Object.getPrototypeOf(this)._config) {
                this._config = Object.getPrototypeOf(this)._config;
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

    params(id: string, name: string, config: RequestParamEncodeRule = {required: false}) {
        if (!this._params || !this._params[id] || !Object.hasOwnProperty.call(this._params[id], name)) {
            const cfg: RequestParamEncodeRule = Object.assign({
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

    headers(id: string, header: string, value: HeaderMappingValueType) {
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

    for(id: string, registration?: Config) {
        if (arguments.length === 1) {
            return this._for[id];
        }
        Object.assign(this._for, {
            [id]: registration
        });
    }

    abort(id: string, abortController: AbortController) {
        const cfg = Object.assign(this.features(id) || {}, {
            abortController
        });
        this.features(id, cfg);
    }

    features(id: string, options?: QueryStringEncodeFeatures) {
        if (arguments.length === 1) {
            return this._features[id];
        }
        Object.assign(this._features, {
            [id]: options
        });
    }

    configs(id: string, options: AxiosConfigOptionMappingType[]) {
        const root = this._configs || {};
        Object.assign(root, {
            [id]: (root[id] || []).concat(options)
        });
    }

    pathVariable(path: string, data: Record<string, any>) {
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

    createRequestConfig(id: string, path: string, data: Record<string, any>, headerArgs: any[] = [], configArgs: AxiosConfigOptionMappingType[] = []) {
        const query = ConfigMapping.querystring(this._features[id], this._params[id], data);
        const body = ConfigMapping.body(this._params[id], data);
        const headers = ConfigMapping.requestHeaders(this._headers[id], headerArgs);
        const config = ConfigMapping.axiosConfig(this._configs[id], configArgs);
        const p = `${path}${query ? ((path.lastIndexOf("?") >= 0 ? "&" : "?") + query) : ""}`;
        if (this._features && this._features[id] && this._features[id].abortController) {
            const abortController = this._features[id].abortController;
            let __abortControllerInst;
            if (typeof abortController === "function") {
                __abortControllerInst = (abortController as AbortControllerGenerator).apply(undefined, configArgs);
            } else {
                __abortControllerInst = abortController;
            }
            if (__abortControllerInst) {
                if (__abortControllerInst.source) {
                    config.cancelToken = __abortControllerInst.source.token;
                } else {
                    config.signal = __abortControllerInst.signal;
                }
            }
        }
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

    request<D = any>(method: Method, path: string, data: Record<string, any> = {}, config: AxiosRequestConfig<D> = {}) {
        const url = path.indexOf("http") >= 0 ? path : this.config.baseURL + normalizePath(`/${this.path || ""}/${path}`);
        return this.config.axios.request(Object.assign({
                method,
                url,
                data
            }, config
        ));
    }

    requestWith(method: Method, path: string = "") {
        const _params: Record<string, RequestParamEncodeRule> = {};
        const _configs: AxiosConfigOptionMappingType[] = [];
        const _headers: Record<string, HeaderMappingValueType> = {};
        const _features: QueryStringEncodeFeatures = {};
        let _withConfig = this.config;
        const controller = {
            with(registration: string) {
                const c = Config.forName(registration);
                if (c) {
                    _withConfig = c;
                }
                return controller;
            },
            param: (key: string, required = false) => {
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
            abort(abortController: (AbortController & { source: CancelTokenSource }) | AbortControllerGenerator) {
                Object.assign(_features, {
                    abortController
                });
                return controller;
            },
            ignoreResidualParams(ignore: boolean = true) {
                Object.assign(_features, {
                    ignoreResidualParams: ignore
                });
                return controller;
            },
            header: (header: string, value: HeaderMappingValueType) => {
                Object.assign(
                    _headers,
                    {
                        [header]: value
                    }
                );
                return controller;
            },
            body: (key: string) => {
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
            config: (cfg: AxiosConfigOptionMappingType) => {
                _configs.push(cfg);
                return controller;
            },
            send: (data: Record<string, any> = {}) => {
                const query = ConfigMapping.querystring(_features, _params, data);
                const body = ConfigMapping.body(_params, data);
                const headers = ConfigMapping.requestHeaders(_headers, [data]);
                const config = ConfigMapping.axiosConfig(_configs, [data]);
                const abortController = _features.abortController;
                Object.assign(config, {
                    headers: Object.assign(headers, config.headers || null)
                });
                if (abortController) {
                    let __abortControllerInst;
                    if (typeof abortController === "function") {
                        __abortControllerInst = abortController.apply(undefined, [data]);
                    } else {
                        __abortControllerInst = abortController;
                    }
                    if (__abortControllerInst) {
                        if (__abortControllerInst.source) {
                            config.cancelToken = __abortControllerInst.source.token;
                        } else {
                            config.signal = __abortControllerInst.signal;
                        }
                    }
                }
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
