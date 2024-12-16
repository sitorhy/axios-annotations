import { AxiosInstance, CancelTokenSource, CancelTokenStatic, AxiosRequestConfig, AxiosResponse } from 'axios';

type ConfigPlugin = (...args: unknown[]) => (config: Config) => void;
type PartialConstructorString = string | null;
type PartialConstructorNumber = number | null;
type PartialPluginConstructorPlugin = ConfigPlugin[] | null;
declare class Config {
    private _host;
    private _port;
    private _protocol;
    private _prefix;
    _axios: AxiosInstance;
    _plugins: ConfigPlugin[];
    constructor(protocol?: PartialConstructorString, host?: PartialConstructorString, port?: PartialConstructorNumber, prefix?: PartialConstructorString, plugins?: PartialPluginConstructorPlugin);
    static forName(name: string): Config | null;
    init(protocol: PartialConstructorString, host: PartialConstructorString, port: PartialConstructorNumber, prefix: PartialConstructorString, plugins: PartialPluginConstructorPlugin): void;
    get host(): string;
    set host(value: string);
    get port(): number;
    set port(value: number);
    get protocol(): string;
    set protocol(value: string);
    get prefix(): string;
    set prefix(value: string);
    /**
     * default value: <br/>
     * http://localhost:8080
     */
    get origin(): string;
    /**
     * if prefix = "/a" <br/>
     * return "http://localhost:8080/a"
     */
    get baseURL(): string;
    get axios(): AxiosInstance;
    set axios(value: AxiosInstance);
    get plugins(): ConfigPlugin[];
    set plugins(value: ConfigPlugin[]);
    /**
     * register config global and return self.
     * @param name
     * @return {Config} config self
     */
    register(name: string): Config;
    /**
     * remove self from global config store.
     * @return {Config} - config self
     */
    unregister(): Config;
}
declare const config: Config;

declare const URLSearchParamsParser: {
    /**
     * Converting encoder object to query string. <br/>
     * Refer to the URLSearchParams description for more details <br/>
     * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
     * @param encoder
     */
    encode: (encoder: URLSearchParams | Record<string, any>) => string;
    /**
     * returns a new URLSearchParams object
     * @param params
     */
    decode: (params: string[][] | Record<string, any> | string | URLSearchParams) => URLSearchParams | Record<string, any>;
    has(encoder: URLSearchParams | Record<string, any>, key: string): boolean;
    delete: (encoder: URLSearchParams | Record<string, any>, key: string) => void;
    get: (encoder: URLSearchParams | Record<string, any>, key: string) => any;
    append: (encoder: URLSearchParams | Record<string, any>, key: string, value: any) => void;
};

type HeaderMappingValueType = string | ((...args: any[]) => string);
type AxiosConfigOptionMappingType = keyof AxiosRequestConfig | ((...args: any[]) => (keyof AxiosRequestConfig));
type AbortControllerGenerator = ((...args: any[]) => (AbortController | AbortControllerAdapter));
type QueryStringEncodeFeatures = {
    ignoreResidualParams?: boolean;
    abortController?: (AbortController | AbortControllerAdapter) | AbortControllerGenerator;
};
type RequestParamEncodeRule = {
    body?: boolean;
    required?: boolean;
};
/**
 * 兼容旧版CancelToken，包装成AbortController
 */
declare class AbortControllerAdapter {
    /**
     * {
     *     cancel: (message, config, request) => void;
     *     token: { promise, _listeners, reason: CanceledError }
     * }
     */
    _source: CancelTokenSource;
    _signal: {
        onabort?: (e: Event) => void;
        reason?: string;
        aborted: boolean;
    };
    constructor(CancelToken: CancelTokenStatic);
    /**
     * sham AbortSignal. <br/>
     * signal struct: {aborted: true, reason: string, onabort: null}  <br/>
     */
    get signal(): {
        onabort?: (e: Event) => void;
        reason?: string;
        aborted: boolean;
    };
    get source(): CancelTokenSource;
    abort(message?: string): void;
}
declare class Service {
    _path: string;
    _config: Config;
    _headers: Record<string, Record<string, HeaderMappingValueType>>;
    _params: Record<string, Record<string, RequestParamEncodeRule>>;
    _configs: Record<string, AxiosConfigOptionMappingType[]>;
    _for: Record<string, string>;
    _features: Record<string, QueryStringEncodeFeatures>;
    constructor(path?: null);
    get config(): Config;
    set config(value: Config);
    get path(): string;
    set path(value: string);
    params(id: string, name: string, config?: RequestParamEncodeRule): void;
    headers(id: string, header: string, value: HeaderMappingValueType): void;
    for(id: string, registrationName?: string): string | undefined;
    abort(id: string, abortController: (AbortController | AbortControllerAdapter | AbortControllerGenerator)): void;
    features(id: string, options?: QueryStringEncodeFeatures): QueryStringEncodeFeatures | undefined;
    configs(id: string, options: AxiosConfigOptionMappingType): void;
    /**
     * 填充路径占位符 <br/>
     * override this method to custom placeholder replacement <br>
     * default implement: data = { id: 111 }; <br/>
     * "/path/{id}" -> return "/path/111"
     * @param path
     * @param data
     */
    pathVariable(path: string, data: Record<string, any>): string;
    createRequestConfig(id: string, path: string, data: Record<string, any>, headerArgs?: any[], configArgs?: AxiosConfigOptionMappingType[]): {
        path: string;
        body: any;
        config: AxiosRequestConfig<any>;
        query: string;
    };
    request<T = any, R = AxiosResponse<T>, D = any>(method: string, path: string, data?: Record<string, any>, config?: AxiosRequestConfig<D>): Promise<R>;
    requestWith<T = any, R = AxiosResponse<T>, D = any>(method: string, path?: string): {
        with(registration: string): {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        param: (key: string, required?: boolean) => {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        abort(abortController: ((AbortController & {
            source: CancelTokenSource;
        }) | AbortControllerGenerator)): {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        ignoreResidualParams(ignore?: boolean): {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        header: (header: string, value: HeaderMappingValueType) => {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        body: (key: string) => {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        config: (cfg: AxiosConfigOptionMappingType) => {
            with(registration: string): any;
            param: (key: string, required?: boolean) => any;
            abort(abortController: ((AbortController & {
                source: CancelTokenSource;
            }) | AbortControllerGenerator)): any;
            ignoreResidualParams(ignore?: boolean): any;
            header: (header: string, value: HeaderMappingValueType) => any;
            body: (key: string) => any;
            config: (cfg: AxiosConfigOptionMappingType) => any;
            send: (data?: Record<string, any>) => (Promise<R>);
        };
        send: (data?: Record<string, any>) => (Promise<R>);
    };
}

declare function AbortSource(abortController: (AbortController | AbortControllerAdapter) | AbortControllerGenerator): <T extends Service>(_target: keyof T, method: string, descriptor: PropertyDescriptor) => void;

declare function DeleteMapping(path?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function GetMapping(path?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function IgnoreResidualParams(ignore?: boolean): (_target: Function, method: string, descriptor: PropertyDescriptor) => void;

declare function PatchMapping(path?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function PostMapping(path?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function PutMapping(path?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function RequestBody(name?: string): (_target: Function, method: string, descriptor: PropertyDescriptor) => void;

declare function RequestConfig(config: AxiosConfigOptionMappingType): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function RequestHeader(header: string, value: HeaderMappingValueType): (_target: Function, method: string, descriptor: PropertyDescriptor) => void;

declare function RequestMapping(path: string, method?: string): (target: Function, name: string, descriptor: PropertyDescriptor) => void;

declare function RequestParam(name: string, required?: boolean): (_target: Function, method: string, descriptor: PropertyDescriptor) => void;

declare function RequestWith(configName: string): (_target: Function, name: string, descriptor: PropertyDescriptor) => void;

export { AbortControllerAdapter, AbortSource, Config, DeleteMapping, GetMapping, IgnoreResidualParams, PatchMapping, PostMapping, PutMapping, RequestBody, RequestConfig, RequestHeader, RequestMapping, RequestParam, RequestWith, Service, URLSearchParamsParser, config };
