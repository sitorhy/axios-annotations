import Config from "./config";
import {AxiosPromise, AxiosRequestConfig} from "axios";

export interface RequestController {
    param: (key: string, required?: boolean) => RequestController;

    header: (header: string, value: string | ((...args: any[]) => string)) => RequestController;

    body: (key: string) => RequestController;

    config: (config: Partial<AxiosRequestConfig>) => RequestController;

    send: (data: Record<string, any>) => AxiosPromise<any>;
}

export default class Service {
    constructor(path?: string);

    config: Config;

    path: string;

    request(method: string, path: string, data?: any, config?: Partial<AxiosRequestConfig>): AxiosPromise<any>;

    requestWith(method: string, path: string): RequestController;
}