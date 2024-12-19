import Service, {RequestParamEncodeRule} from "../core/service.js";

// noinspection JSUnusedGlobalSymbols
export default function RequestParam(name: string, required?: boolean) {
    return function (_target: Function, method: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            const cfg: RequestParamEncodeRule = Object.assign({
                required: false,
                body: false
            }, {
                required: required === true
            });
            descriptor.value = function () {
                (this as Service).params(method, name, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}