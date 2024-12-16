import { AxiosRequestConfig, AxiosResponse, AxiosInstance } from 'axios';

declare class SessionStorage {
    _inMemoryStorage: Record<string, any>;
    set(key: string, value: any): Promise<void>;
    get(key: string): Promise<any>;
    remove(key: string): Promise<void>;
}

/**
 * 缓存过期会话，判断请求是否过期
 */
declare class SessionHistory {
    _history: (Record<string, any> | null)[];
    _position: number;
    _size: number;
    get size(): number;
    add(session: Record<string, any>): void;
    check(jwt: string): boolean;
    deprecate(session: Record<string, any>): void;
    clean(): void;
    isDeprecated(session: Record<string, any>): boolean;
}

declare class Authorizer {
    private _sessionKey;
    private _sessionStorage;
    private _sessionHistory;
    get sessionKey(): string;
    set sessionKey(value: string);
    get sessionStorage(): SessionStorage;
    set sessionStorage(value: SessionStorage);
    get sessionHistory(): SessionHistory;
    set sessionHistory(value: SessionHistory);
    getSession(): Promise<any>;
    storageSession(session: Record<string, any>): Promise<void>;
    refreshSession(_session: Record<string, any>): Promise<any>;
    withAuthentication(request: AxiosRequestConfig, session: Record<string, any>): void;
    checkSession(request: AxiosRequestConfig, session: Record<string, any>): boolean;
    checkResponse(response: AxiosResponse): boolean;
    onAuthorizedDenied(error: unknown): Promise<void>;
    onSessionInvalidated(): void;
    invalidateSession(): Promise<void>;
}

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

declare function AuthorizationPlugin(authorizer: Authorizer): (config: Config) => void;

export { AuthorizationPlugin, Authorizer, SessionStorage };
