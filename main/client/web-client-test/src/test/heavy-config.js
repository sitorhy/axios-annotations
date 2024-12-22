import {Config} from "axios-annotations";

const config = new Config();

config.host = "localhost";
config.port = 8888;
config.protocol = "http";

export default config;
