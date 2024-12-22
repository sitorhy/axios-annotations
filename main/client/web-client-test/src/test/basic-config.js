import {Config} from "axios-annotations";

const config = new Config();

config.host = "localhost";
config.port = 8888;
config.protocol = "http";
config.prefix = "/test";

export default config;