import {isNullOrEmpty} from "./common.js";

const URLSearchParamsParser = {
    /**
     * Converting encoder object to query string. <br/>
     * Refer to the URLSearchParams description for more details <br/>
     * https://developer.mozilla.org/en-US/docs/Web/API/URLSearchParams
     * @param encoder
     */
    encode: function (encoder: URLSearchParams | Record<string, any>): string {
        if (typeof URLSearchParams === "undefined") {
            // URLSearchParams 将空值 null 转为 "null"
            return Object.entries(encoder).reduce((arr: string[], [key, value = undefined]) => {
                if (Array.isArray(value)) {
                    value.forEach(i => {
                        arr.push(`${key}=${encodeURIComponent(i === null ? "null" : (i === undefined ? "" : i))}`);
                    });
                } else {
                    arr.push(`${key}=${encodeURIComponent(value === null ? "null" : (value === undefined ? "" : value))}`);
                }
                return arr;
            }, []).join("&");
        } else {
            // typeof URLSearchParams
            return encoder.toString();
        }
    },

    /**
     * returns a new URLSearchParams object
     * @param params
     */
    decode: function (params: string[][] | Record<string, any> | string | URLSearchParams): URLSearchParams | Record<string, any> {
        if (typeof URLSearchParams === "undefined") {
            return Object.assign({}, params) as Record<string, any>;
        } else {
            return new URLSearchParams(params as string[][] | Record<string, string> | string | URLSearchParams);
        }
    },

    has(encoder: URLSearchParams | Record<string, any>, key: string) {
        if (typeof URLSearchParams === "undefined") {
            return (key in encoder);
        } else {
            return (encoder as URLSearchParams).has(key);
        }
    },

    delete: function (encoder: URLSearchParams | Record<string, any>, key: string) {
        if (typeof URLSearchParams === "undefined") {
            if (encoder) {
                delete (encoder as Record<string, any>)[key];
            }
        } else {
            (encoder as URLSearchParams).delete(key);
        }
    },

    get: function (encoder: URLSearchParams | Record<string, any>, key: string) {
        if (typeof URLSearchParams === "undefined") {
            return encoder ? (encoder as Record<string, any>)[key] : undefined;
        } else {
            return (encoder as URLSearchParams).get(key);
        }
    },

    append: function (encoder: URLSearchParams | Record<string, any>, key: string, value: any) {
        if (typeof URLSearchParams === "undefined") {
            if (encoder) {
                const v = (encoder as Record<string, any>)[key];
                if (isNullOrEmpty(v)) {
                    (encoder as Record<string, any>)[key] = value;
                } else {
                    (encoder as Record<string, any>)[key] = [].concat(v).concat(value);
                }
            }
        } else {
            (encoder as URLSearchParams).append(key, value);
        }
    }
};

export default URLSearchParamsParser;