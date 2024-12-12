import Service, {HeaderMappingValueType} from "../core/service";

// noinspection JSUnusedGlobalSymbols
export default function RequestHeader(header: string, value: HeaderMappingValueType) {
    return function (_target: Function, method: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                (this as Service).headers(method, header, value);
                return fn.apply(this, arguments);
            };
        }
    };
}