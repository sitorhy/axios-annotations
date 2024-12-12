import Service from "../core/service";
import Config from "../core/config";

export default function RequestWith(registration: Config) {
    return function (_target: Function, name: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                (this as Service).for(name, registration);
                return fn.apply(this, arguments);
            };
        }
    };
}