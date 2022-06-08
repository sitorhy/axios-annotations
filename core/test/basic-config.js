import Config from "../core/config";
import CachePlugin from "../lib/plugins/cache";

const config = new Config();

config.host = "localhost";
config.port = 8888;
config.protocol = "http";
config.prefix = "/test";

config.plugins = [
    CachePlugin()
];

export default config;