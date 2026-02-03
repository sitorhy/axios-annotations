import RequestBuilder from "./builder";
import Config from "./config";

export function normalizePath(path: string): string {
    return path.replace(/\/+/g, "/").replace(/\/$/, "");
}

export function isNullOrEmpty(param: any): boolean {
    return param === null || param === undefined || param === "";
}

type MetaPropertyDescriptor = PropertyDescriptor & {
    builder: RequestBuilder,
    config?: Config // 重定向方法的配置
};

export function castToMetaDescriptor(descriptor: PropertyDescriptor): MetaPropertyDescriptor {
    if (!(descriptor as MetaPropertyDescriptor).builder) {
        (descriptor as MetaPropertyDescriptor).builder = new RequestBuilder();
    }
    return (descriptor as MetaPropertyDescriptor)
}

// 合并 axios 配置
export function deepMerge<T extends object>(...sources: T[]): T {
    const result: any = {};

    for (const source of sources) {
        if (!source) continue;

        for (const key in source) {
            if (Object.prototype.hasOwnProperty.call(source, key)) {
                const value = source[key as keyof T];
                if (value && typeof value === 'object' && !Array.isArray(value)) {
                    result[key] = deepMerge(result[key] || {}, value as any);
                } else {
                    result[key] = value;
                }
            }
        }
    }
    return result as T;
}