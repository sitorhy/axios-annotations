export function normalizePath(path) {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function isNullOrEmpty(param) {
    return param === null || param === undefined || param === "";
}

export function forward(axios, origin, prefix1, prefix2, path, method, query, body, config) {
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