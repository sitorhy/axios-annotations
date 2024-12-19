import Service, {RequestParamEncodeRule} from "../core/service.js";

// noinspection JSUnusedGlobalSymbols
export default function RequestBody(name: string = "body") {
    return function (_target: Function, method: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            const cfg: RequestParamEncodeRule = {
                required: false,
                body: true
            };
            descriptor.value = function () {
                (this as Service).params(method, name, cfg);
                return fn.apply(this, arguments);
            };
        }
    };
}