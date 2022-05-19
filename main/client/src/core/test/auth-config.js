import {Config} from "../core/config";
import AuthorizationPlugin from "../plugins/auth";

const config = new Config();

config.plugins = [
    AuthorizationPlugin()
];

config.host = "localhost";
config.port = 8080; // 浏览器跨域不会返回状态码
config.protocol = "http";
config.prefix = "/api";

export default config;