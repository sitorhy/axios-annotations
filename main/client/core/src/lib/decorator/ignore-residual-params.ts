import Service from "../core/service.js";

// noinspection JSUnusedGlobalSymbols
export default function IgnoreResidualParams(ignore?: boolean) {
    return function (_target: Function, method: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                const cfg = Object.assign((this as Service).features(method) || {}, {
                    ignoreResidualParams: ignore !== false,
                });
                (this as Service).features(method, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}