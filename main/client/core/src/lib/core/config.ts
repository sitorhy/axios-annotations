import axios, {AxiosInstance} from "axios";

const _global_configs: { name: string; config: Config }[] = [];

export type ConfigPlugin = (...args: unknown[]) => (config: Config) => void;
export type PartialConstructorString = string | null;
export type PartialConstructorNumber = number | null;
export type PartialPluginConstructorPlugin = ConfigPlugin[] | null;

export default class Config {
    private _host: string = "localhost";
    private _port: number = 8080;
    private _protocol: string = "http";
    private _prefix: string = "";
    _axios: AxiosInstance = axios.create();
    _plugins: ConfigPlugin[] = [];

    constructor(protocol: PartialConstructorString = null, host: PartialConstructorString = null, port: PartialConstructorNumber = null, prefix: PartialConstructorString = null, plugins: PartialPluginConstructorPlugin = null) {
        this.init(protocol, host, port, prefix, plugins);
    }

    static forName(name: string): Config | null {
        const c = _global_configs.find(i => i.name === name);
        if (c) {
            return c.config;
        } else {
            return null;
        }
    }

    init(protocol: PartialConstructorString, host: PartialConstructorString, port: PartialConstructorNumber, prefix: PartialConstructorString, plugins: PartialPluginConstructorPlugin): void {
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
            this.plugins = plugins;
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
        return `${this.protocol}://${this.host}${this.port ? ":" + this.port : ""}`;
    }

    /**
     * if prefix = "/a" <br/>
     * return "http://localhost:8080/a"
     */
    get baseURL() {
        return `${this.origin}${this.prefix}`;
    }

    get axios(): AxiosInstance {
        return this._axios;
    }

    set axios(value: AxiosInstance) {
        this._axios = value;
    }

    get plugins(): ConfigPlugin[] {
        return this._plugins;
    }

    set plugins(value: ConfigPlugin[]) {
        this._plugins = value;
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
}

export const config = new Config();