import type {AxiosInstance, AxiosRequestConfig, AxiosResponse} from "axios";

export function normalizePath(path: string): string {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function isNullOrEmpty(param: any): boolean {
    return param === null || param === undefined || param === "";
}

export async function forward<T = any, R = AxiosResponse<T>, D = any>(
    axios: AxiosInstance,
    origin: string,
    prefix1: string,
    prefix2: string,
    path: string,
    method: string,
    query: string,
    body: D,
    config: AxiosRequestConfig<D>
): Promise<R> {
    let url = `${origin}` + normalizePath(`/${prefix1}/${prefix2}/${path}`);
    if (query) {
        if (url.lastIndexOf("?") >= 0) {
            url += "&" + query;
        } else {
            url += "?" + query;
        }
    }
    return axios.request<T, R, D>(Object.assign({
            method,
            url,
            data: body
        }, config
    ));
}

export function replaceAllStr(target: string, search: string | RegExp, replacement: string) {
    const pattern = typeof search === 'string' ? RegExp(search, 'g') : search;
    return target.replace(pattern, replacement);
}
