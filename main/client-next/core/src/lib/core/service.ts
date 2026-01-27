import axios, {AxiosRequestConfig, AxiosResponse, Method} from "axios";

export default class Service {

    async request<T = any, R = AxiosResponse<T>, D = any>(config: AxiosRequestConfig<D>) {
        return axios.request<T, R, D>(config);
    }

    async requestWith() {

    }
}