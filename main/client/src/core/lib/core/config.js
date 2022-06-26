import axios from "axios";

const _global_configs = [];

export default class Config {
    _host = "localhost";
    _port = 8080;
    _protocol = "http";
    _prefix = "";
    _axios = axios.create();
    _plugins = [];

    constructor(protocol = null, host = null, port = null, prefix = null, plugins = null) {
        this.init(protocol, host, port, prefix, plugins);
    }

    static forName(name) {
        const c = _global_configs.find(i => i.name === name);
        if (c) {
            return c.config;
        } else {
            return null;
        }
    }

    init(protocol, host, port, prefix, plugins) {
        this.port = port;
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

    get host() {
        return this._host;
    }

    set host(value) {
        this._host = value;
    }

    get port() {
        return this._port;
    }

    set port(value) {
        this._port = value;
    }

    get protocol() {
        return this._protocol;
    }

    set protocol(value) {
        this._protocol = value;
    }

    get prefix() {
        return this._prefix;
    }

    set prefix(value) {
        this._prefix = value;
    }

    get origin() {
        return `${this.protocol}://${this.host}${this.port ? ":" + this.port : ""}`;
    }

    get baseURL() {
        return `${this.origin}${this.prefix}`;
    }

    get axios() {
        return this._axios;
    }

    set axios(value) {
        this._axios = value;
    }

    get plugins() {
        return this._plugins;
    }

    set plugins(value) {
        this._plugins = value;
    }

    register(name) {
        const c = _global_configs.find(i => i.config === this);
        if (c) {
            c.name = name;
        } else {
            _global_configs.push({name, config: this});
        }
        return this;
    }

    unregister() {
        const index = _global_configs.findIndex(i => i.config === this);
        if (index >= 0) {
            _global_configs.splice(index, 1);
        }
        return this;
    }
}

export const config = new Config();