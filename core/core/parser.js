import {isNullOrEmpty} from "./common";

const URLSearchParamsParser = {
    encode: function (encoder) {
        if (typeof URLSearchParams === "undefined") {
            return encoder;
        } else {
            return encoder.toString();
        }
    },

    decode: function (params) {
        return new URLSearchParams(params);
    },

    has(encoder, key) {
        if (typeof URLSearchParams === "undefined") {
            return Object.hasOwnProperty.call(encoder, key);
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