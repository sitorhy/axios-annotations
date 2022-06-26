import {AxiosInstance} from "axios";

export default class Config {
    constructor();

    constructor(protocol: string, host: string, port?: string, prefix?: string, plugins?: ((config: Config) => void)[]);

    host: string;

    port: number | null | string;

    protocol: string;

    prefix: string;

    origin: string;

    baseURL: string;

    axios: AxiosInstance;

    plugins: ((config: Config) => void)[];
}

export const config: Config;