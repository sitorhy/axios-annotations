declare const URLSearchParamsParser: {
    encode: (encoder: object) => string;

    decode: (data: object) => object;

    has: (encoder: object, key: string) => boolean;

    delete: (encoder: object, key: string) => void;

    get: (encoder: object, key: string) => any;

    append: (encoder: object, key: string, value: any) => void;
}

export default URLSearchParamsParser;