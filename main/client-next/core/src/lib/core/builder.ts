import type {AxiosRequestConfig, AxiosResponse, Method} from 'axios';
import type Config from "./config";
import {deepMerge, isNullOrEmpty, normalizePath} from "./common";

export type ParamsMapper<T = any> = (params: Record<string, any>) => T;

export enum ParamsMappingType {
    // 请求头
    HEADER = 'HEADER',
    // 查询串
    PARAM = 'PARAM',
    // 请求体
    BODY = 'BODY'
}

export interface ParamsMapping<T = any> {
    key: string;
    value: T | ParamsMapper<T>;
    required?: boolean;
}

export type AxiosConfigMapper = (params: Record<string, any>) => AxiosRequestConfig;

export default class RequestBuilder {
    private _configs: (AxiosRequestConfig | AxiosConfigMapper)[] | null = null;

    private readonly _mapping: Map<ParamsMappingType, Map<string, ParamsMapping>> = new Map();

    private _addMapping(type: ParamsMappingType, mapping: ParamsMapping) {
        let scopeMapping = this._mapping.get(type);
        if (!scopeMapping) {
            scopeMapping = new Map();
            this._mapping.set(type, scopeMapping);
        }
        scopeMapping.set(mapping.key, mapping);
    }

    private _clearMapping(type: ParamsMappingType) {
        let scopeMapping = this._mapping.get(type);
        if (scopeMapping) {
            scopeMapping.clear();
        }
    }

    param(key: string, required?: boolean): this;
    param(mapping: ParamsMapping): this;
    param(keyOrMapping: string | ParamsMapping, required?: boolean): this {
        if (typeof keyOrMapping === 'string') {
            this._addMapping(ParamsMappingType.PARAM, {
                value: undefined,
                key: keyOrMapping,
                // 查询串为空默认不填充
                required: required === true
            });
        } else {
            if (isNullOrEmpty(keyOrMapping.key)) {
                throw new Error('param mapping key is required');
            }
            this._addMapping(ParamsMappingType.PARAM, {
                ...keyOrMapping,
                required: keyOrMapping.required === true
            });
        }
        return this;
    }

    header(key: string, required?: boolean): this;
    header(mapping: ParamsMapping): this;
    header(keyOrMapping: string | ParamsMapping, required?: boolean): this {
        if (typeof keyOrMapping === 'string') {
            this._addMapping(ParamsMappingType.HEADER, {
                value: undefined,
                key: keyOrMapping,
                // 请求头默认强制填充，找不到填充空字符串
                required: required !== false
            });
        } else {
            if (isNullOrEmpty(keyOrMapping.key)) {
                throw new Error('header mapping key is required');
            }
            this._addMapping(ParamsMappingType.HEADER, {
                ...keyOrMapping,
                required: keyOrMapping.required === true
            });
        }
        return this;
    }

    // 请求体只有一个规则，因为不同请求体类型无法合并，请求体自动不存在则设置 null
    body(keyOrMapping: string | ParamsMapping): this {
        this._clearMapping(ParamsMappingType.BODY);
        if (typeof keyOrMapping === 'string') {
            this._addMapping(ParamsMappingType.BODY, {
                value: undefined,
                key: keyOrMapping,
                // 请求体 required 不生效，无法给出不同类型的默认值
                required: false
            });
        } else {
            if (isNullOrEmpty(keyOrMapping.key)) {
                throw new Error('body mapping key is required');
            }
            this._addMapping(ParamsMappingType.BODY, {
                ...keyOrMapping,
                required: false
            });
        }
        return this;
    }

    config(cfg: AxiosRequestConfig | AxiosConfigMapper): this {
        if (!this._configs) {
            this._configs = [];
        }
        if (this._configs.indexOf(cfg) === -1) {
            this._configs.push(cfg);
        }
        return this;
    }

    build(config: Config, path: string, method: Method, source: Record<string, any> = {}): AxiosRequestConfig {
        const params = {};
        const headers = {};
        const url = path.indexOf("http") >= 0 ? path : config.baseURL + normalizePath(`/${path}`);
        let body = null;

        // 处理查询串
        const paramMapping = this._mapping.get(ParamsMappingType.PARAM);
        if (paramMapping) {
            for (const [key, mapping] of paramMapping) {
                if (typeof mapping.value === 'function') {
                    const mapper = mapping.value as ParamsMapper;
                    const result = mapper.call(undefined, source);
                    if (isNullOrEmpty(result)) {
                        if (mapping.required === false) {
                            continue;
                        }
                    }
                    Object.assign(params, {
                        [key]: result
                    });
                } else {
                    // 如果指定了静态值，则使用静态值
                    let value = mapping.value;
                    if (isNullOrEmpty(value)) {
                        // 没有指定静态值，查询数据源
                        value = source[key];
                    }
                    if (isNullOrEmpty(value)) {
                        if (mapping.required === false) {
                            continue;
                        } else {
                            value = '';
                        }
                    }
                    Object.assign(params, {
                        [key]: value
                    });
                }
            }
        }

        // 处理请求头
        const headerMapping = this._mapping.get(ParamsMappingType.HEADER);
        if (headerMapping) {
            for (const [key, mapping] of headerMapping) {
                if (typeof mapping.value === 'function') {
                    const mapper = mapping.value as ParamsMapper;
                    let result = mapper.call(undefined, source);
                    if (isNullOrEmpty(result)) {
                        if (mapping.required === true) {
                            result = '';
                        } else {
                            continue;
                        }
                    }
                    Object.assign(headers, {
                        [key]: result
                    });
                } else {
                    let value = mapping.value;
                    if (isNullOrEmpty(value)) {
                        value = source[key];
                    }
                    if (isNullOrEmpty(value)) {
                        if (mapping.required === false) {
                            continue;
                        } else {
                            value = '';
                        }
                    }
                    Object.assign(headers, {
                        [key]: value
                    });

                }
            }
        }

        // 处理请求体
        const bodyMapping = this._mapping.get(ParamsMappingType.BODY);
        if (bodyMapping) {
            for (const [key, mapping] of bodyMapping) {
                if (typeof mapping.value === 'function') {
                    const mapper = mapping.value as ParamsMapper;
                    let result = mapper.call(undefined, source);
                    if (result === undefined) {
                        result = null;
                    }
                    body = result;
                } else {
                    let value = mapping.value;
                    if (isNullOrEmpty(value)) {
                        value = source[key];
                    }
                    if (value === undefined) {
                        value = null;
                    }
                    body = value;
                }
            }
        }

        let mergeConfigs: AxiosRequestConfig = {
            headers: headers,
            url: url,
            method: method,
            data: body,
            params: params
        };
        if (this._configs) {
            mergeConfigs = deepMerge(
                ...(this._configs.map(cfg => deepMerge(mergeConfigs, typeof cfg === 'function' ? cfg(source) : cfg)))
            );
        }

        return mergeConfigs;
    }

    async buildWith(config: Config, path: string, method: Method, source: Record<string, any> = {}): Promise<AxiosResponse<any>> {
        const axiosInstance = await config.requestAxiosInstance();
        return axiosInstance.request(this.build(config, path, method, source));
    }
}