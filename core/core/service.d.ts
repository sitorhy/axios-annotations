import Config from "./config";

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

    createRequestConfig(method: string, path: string, data: Record<string, any>, config: Record<string, any>);

    request(method: string, path: string, data: Record<string, any>, config: Record<string, any>);
}