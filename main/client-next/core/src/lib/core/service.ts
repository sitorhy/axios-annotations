import axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";
import {config} from "./config";

export default class Service {
    config = config;
    path = '';

    constructor() {
        // 获取被加入切面的方法
        const methodsToBind = Object.getPrototypeOf(this).__decoratedMethods;

        if (methodsToBind && Array.isArray(methodsToBind)) {
            for (const methodName of methodsToBind) {
                if (typeof (this as any)[methodName] === 'function') {
                    (this as any)[methodName] = (this as any)[methodName].bind(this);
                }
            }
        }
    }

    async request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) {
        return axios.request<T, R, D>(config);
    }
}