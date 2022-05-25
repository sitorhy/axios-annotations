import axios from "axios";

export default class Config {
    _host = "localhost";
    _port = 8080;
    _protocol = "http";
    _prefix = "";
    _axios = axios.create();
    _plugins = [];

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
}

export const config = new Config();