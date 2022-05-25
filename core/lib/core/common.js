export function normalizePath(path) {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function isNullOrEmpty(param) {
    return param === null || param === undefined || param === "";
}