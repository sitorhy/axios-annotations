import RequestBuilder from "./builder";
import Config from "./config";
import type { AxiosRequestConfig } from "axios";

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

/**
 * Merges multiple Axios request configurations with specific logic for Axios.
 * - `headers` and `params` are shallowly merged.
 * - All other properties are replaced by the last provided value.
 *
 * @param sources A list of AxiosRequestConfig objects to merge.
 * @returns A new, merged AxiosRequestConfig object.
 */
export function mergeAxiosConfigs(...sources: AxiosRequestConfig[]): AxiosRequestConfig {
    // Start with an empty config
    const finalConfig: AxiosRequestConfig = {};

    // Sequentially apply all source configs. This handles the "replacement" logic for most properties.
    for (const source of sources) {
        if (source) {
            Object.assign(finalConfig, source);
        }
    }

    // Now, handle the special merge logic for 'headers' and 'params'
    const finalHeaders = {};
    const finalParams = {};

    for (const source of sources) {
        if (source?.headers) {
            Object.assign(finalHeaders, source.headers);
        }
        if (source?.params) {
            Object.assign(finalParams, source.params);
        }
    }

    // Assign the merged headers and params back to the final config
    if (Object.keys(finalHeaders).length > 0) {
        finalConfig.headers = finalHeaders;
    }
    if (Object.keys(finalParams).length > 0) {
        finalConfig.params = finalParams;
    }

    return finalConfig;
}

/**
 * 替换链接占位符，注意使用基本类型
 * Replaces placeholders in a URL with values from a data object.
 * e.g., formatUrl("http://a.com/{c}?d={e}", {c: 'x', e: 100}) -> "http://a.com/x?d=100"
 *
 * @param url The URL string with placeholders like {key}.
 * @param data The plain object data source.
 * @returns The formatted URL string.
 */
export function formatUrl(url: string, data: Record<string, any>): string {
    return url.replace(/\{([^{}]+)}/g, (match, key) => {
        // Check if the key exists in the data object
        if (Object.prototype.hasOwnProperty.call(data, key)) {
            const value = data[key];

            // Handle null, undefined, NaN
            if (value === null) return 'null';
            if (value === undefined) return 'undefined';
            if (Number.isNaN(value)) return 'NaN';

            const valueType = typeof value;

            // Handle primitive types
            if (valueType === 'string' || valueType === 'number' || valueType === 'boolean') {
                return String(value);

            }

            // Handle objects and arrays
            try {
                // 此处不应该触发 不要传奇怪的类型
                return JSON.stringify(value);
            } catch (e) {
                // 如果取出的值不是基本类型（例如数组），则直接JSON.stringify后替换，JSON转换过程抛异常则替换为 undefined
                console.error(`Error stringify value for key "${key}":`, e);
                return 'undefined'; // Replace with 'undefined' on stringify error
            }
        }

        // If key is not found in data, return the original placeholder
        return match;
    });
}


/**
 * Checks if a value is a plain object, i.e., an object created by `{}` or `new Object()`.
 * @param value The value to check.
 * @returns True if the value is a plain object, false otherwise.
 */
export function isPlainObject(value: any): value is Record<string, any> {
    if (value === null || typeof value !== 'object') {
        return false;
    }

    const proto = Object.getPrototypeOf(value);

    if (proto === null) {
        return true;
    }

    return proto === Object.prototype;
}
