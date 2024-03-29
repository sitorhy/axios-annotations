import Config from "./config";
import {AxiosPromise, AxiosRequestConfig} from "axios";
import {AbortControllerAdapter} from "../decorator/abort-source";

export interface RequestController {
    ignoreResidualParams: (ignore?: boolean) => RequestController;

    param: (key: string, required?: boolean) => RequestController;

    header: (header: string, value: string | ((...args: any[]) => string)) => RequestController;

    body: (key: string) => RequestController;

    config: (config: Partial<AxiosRequestConfig>) => RequestController;

    send: (data?: Record<string, any>) => AxiosPromise<any>;

    with: (registration: string) => RequestController;

    abort: (abortController: (AbortController | AbortControllerAdapter) | ((...args: any[]) => (AbortControllerAdapter | AbortController))) => RequestController;
}

export default class Service {
    constructor(path?: string);

    config: Config;

    path: string;

    request(method: string, path: string, data?: any, config?: Partial<AxiosRequestConfig>): AxiosPromise<any>;

    requestWith(method: string, path?: string): RequestController;
}
