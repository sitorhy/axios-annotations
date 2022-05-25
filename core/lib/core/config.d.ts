import {AxiosInstance} from "axios";

export type ConfigPluginHandler = (...args: any[]) => ((config: Config) => void);

export default class Config {
    host: string;

    port: number | null | string;

    protocol: string;

    prefix: string;

    origin: string;

    baseURL: string;

    axios: AxiosInstance;

    plugins: ConfigPluginHandler[];
}

export const config: Config;