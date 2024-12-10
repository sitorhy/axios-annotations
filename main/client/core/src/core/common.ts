import {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";

export function normalizePath(path: string): string {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function isNullOrEmpty(param: any): boolean {
    return param === null || param === undefined || param === "";
}

export function forward<T = any, R = AxiosResponse<T>, D = any>(axios: AxiosInstance, origin: string, prefix1: string, prefix2: string, path: string, method: string, query: string, body: D, config: AxiosRequestConfig<D>): Promise<R> {
    let url = `${origin}` + normalizePath(`/${prefix1}/${prefix2}/${path}`);
    if (query) {
        if (url.lastIndexOf("?") >= 0) {
            url += "&" + query;
        } else {
            url += "?" + query;
        }
    }
    return axios.request(Object.assign({
            method,
            url,
            data: body
        }, config
    ));
}