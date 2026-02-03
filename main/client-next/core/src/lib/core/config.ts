import AxiosStaticInstanceProvider from "./provider";
import type {AxiosInstance, AxiosStatic} from "axios";

export type ConfigPlugin = (axios: AxiosInstance, config: Config) => void;
export type PartialConstructorString = string | null;
export type PartialConstructorNumber = number | null;
export type PartialPluginConstructorPlugins = ConfigPlugin[] | null;

const _global_configs: Array<{ name: string; config: unknown }> = [];

export default class Config {
    private _host: string = "localhost";
    private _port: number = 8080;
    private _protocol: string = "http";
    private _prefix: string = "";
    private _axiosProvider: AxiosStaticInstanceProvider= new AxiosStaticInstanceProvider();
    private _axios: AxiosInstance | null = null;
    private _plugins: PartialPluginConstructorPlugins = null;

    constructor(
        options?: {
            protocol?: PartialConstructorString;
            host?: PartialConstructorString;
            port?: PartialConstructorNumber;
            prefix?: PartialConstructorString;
            plugins?: PartialPluginConstructorPlugins,
            axiosProvider?: AxiosStaticInstanceProvider,
        }
    ) {
        if (options?.axiosProvider) {
            this._axiosProvider = options?.axiosProvider;
        }
        this.init(
            options?.protocol || null,
            options?.host || null,
            options?.port || null,
            options?.prefix || null,
            options?.plugins || null
        );
    }

    static forName(name: string): Config | null {
        const c = (_global_configs).find(i => i.name === name);
        if (c) {
            return c.config as Config;
        } else {
            return null;
        }
    }

    init(
        protocol: PartialConstructorString,
        host: PartialConstructorString,
        port: PartialConstructorNumber,
        prefix: PartialConstructorString,
        plugins: PartialPluginConstructorPlugins
    ): void {
        if (port) {
            this.port = port;
        }
        if (protocol) {
            this.protocol = protocol;
        }
        if (host) {
            this.host = host;
        }
        if (prefix) {
            this.prefix = prefix;
        }
        if (Array.isArray(plugins)) {
            this._plugins = plugins;
        }
    }


    get host(): string {
        return this._host;
    }

    set host(value: string) {
        this._host = value;
    }

    get port(): number {
        return this._port;
    }

    set port(value: number) {
        this._port = value;
    }

    get protocol(): string {
        return this._protocol;
    }

    set protocol(value: string) {
        this._protocol = value;
    }

    get prefix(): string {
        return this._prefix;
    }

    set prefix(value: string) {
        this._prefix = value;
    }

    /**
     * default value: <br/>
     * http://localhost:8080
     */
    get origin(): string {
        const port = (this.protocol === "https" && String(this.port) === "443") || (this.protocol === "http" && String(this.port) === "80") ? "" : this.port;
        return `${this.protocol}://${this.host}${port ? ":" + port : ""}`;
    }

    /**
     * if prefix = "/a" <br/>
     * return "http://localhost:8080/a"
     */
    get baseURL() {
        return `${this.origin}${this.prefix}`;
    }

    get plugins(): PartialPluginConstructorPlugins{
        return this._plugins;
    }

    set plugins(value: PartialPluginConstructorPlugins) {
        this._plugins = value;
    }

    get axiosProvider(): AxiosStaticInstanceProvider {
        return this._axiosProvider;
    }

    set axiosProvider(value: AxiosStaticInstanceProvider) {
        this._axiosProvider = value;
    }

    /**
     * register config global and return self.
     * @param name
     * @return {Config} config self
     */
    register(name: string): Config {
        const c = _global_configs.find(i => i.config === this);
        if (c) {
            c.name = name;
        } else {
            _global_configs.push({name, config: this});
        }
        return this;
    }

    // noinspection JSUnusedGlobalSymbols
    /**
     * remove self from global config store.
     * @return {Config} - config self
     */
    unregister(): Config {
        const index = _global_configs.findIndex(i => i.config === this);
        if (index >= 0) {
            _global_configs.splice(index, 1);
        }
        return this;
    }

    // 创建 axios 实例
    async requestAxiosInstance(): Promise<AxiosInstance> {
        if (this._axios) {
            return this._axios;
        }
        try {
            this._axios = ((await this._axiosProvider.get()) as AxiosStatic).create();
        } catch (e) {
            throw e;
        }
        // 插件注入
        if (this._plugins && this._plugins.length) {
            for (const plugin of this._plugins) {
                plugin(this._axios as AxiosInstance, this);
            }
        }
        return this._axios;
    }
}

export const config = new Config();