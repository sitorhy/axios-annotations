import {AxiosInstance, AxiosRequestConfig} from "axios";

declare class Config {
    constructor(protocol?: string, host?: string, port?: number, prefix?: string, plugins?: ((config: Config) => void)[]);

    static forName(name: string): Config;

    host: string;

    port: number | null | string;

    protocol: string;

    prefix: string;

    origin: string;

    baseURL: string;

    axios: AxiosInstance;

    plugins: ((config: Config) => void)[];

    register(name: string): Config;

    unregister(): Config;
}

export default function RequestConfig(config: Config | ((...args: any[]) => Partial<AxiosRequestConfig>) | Partial<AxiosRequestConfig>): ((target: any) => any);
