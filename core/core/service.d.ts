import Config from "./config";
import {AxiosPromise, AxiosRequestConfig} from "axios";

export declare interface ArgumentMappingRule {
    required: boolean;
    body: boolean;
}

export default class Service {
    constructor(path?: string);

    config: Config;

    path: string;

    params(id: string, name: string, config: ArgumentMappingRule);

    headers(id: string, header: string, value: (() => string) | string);

    querystring(id: string, data: Record<string, any>) ;

    body(id: string, data: Record<string, any>);

    createRequestConfig(method: string, path: string, data: any, config: Partial<AxiosRequestConfig>): AxiosRequestConfig;

    request(method: string, path: string, data: any, config: Partial<AxiosRequestConfig>): AxiosPromise;
}