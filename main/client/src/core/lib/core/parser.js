import {isNullOrEmpty} from "./common";

const URLSearchParamsParser = {
    encode: function (encoder) {
        if (typeof URLSearchParams === "undefined") {
            // URLSearchParams 将空值 null 转为 "null"
            return Object.entries(encoder).reduce((arr, [key, value = undefined]) => {
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
            return encoder.toString();
        }
    },

    decode: function (params) {
        if (typeof URLSearchParams === "undefined") {
            return Object.assign({}, params);
        } else {
            return new URLSearchParams(params);
        }
    },

    has(encoder, key) {
        if (typeof URLSearchParams === "undefined") {
            return (key in encoder);
        } else {
            return encoder.has(key);
        }
    },

    delete: function (encoder, key) {
        if (typeof URLSearchParams === "undefined") {
            if (encoder) {
                delete encoder[key];
            }
        } else {
            encoder.delete(key);
        }
    },

    get: function (encoder, key) {
        if (typeof URLSearchParams === "undefined") {
            return encoder ? encoder[key] : undefined;
        } else {
            return encoder.get(key);
        }
    },

    append: function (encoder, key, value) {
        if (typeof URLSearchParams === "undefined") {
            if (encoder) {
                const v = encoder[key];
                if (isNullOrEmpty(v)) {
                    encoder[key] = value;
                } else {
                    encoder[key] = [].concat(v).concat(value);
                }
            }
        } else {
            encoder.append(key, value);
        }
    }
};

export default URLSearchParamsParser;