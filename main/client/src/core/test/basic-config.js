import {Config} from "../core/config";
import AuthorizationPlugin from "../plugins/auth/index";

const config = new Config();

config.plugins = [
  //  AuthorizationPlugin()
];

config.host = "localhost";
config.port = 8888;
config.protocol = "http";
config.prefix = "/test";

export default config;