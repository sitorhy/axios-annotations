import axios, {type AxiosRequestConfig, type AxiosResponse} from "axios";
import {config} from "./config";

export default class Service {
    config = config;
    path = '';

    async request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) {
        return axios.request<T, R, D>(config);
    }
}