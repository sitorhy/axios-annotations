import Service from "../core/service";

export default function RequestWith(configName: string) {
    return function (_target: Function, name: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                (this as Service).for(name, configName);
                return fn.apply(this, arguments);
            };
        }
    };
}