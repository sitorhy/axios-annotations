import Service, {AxiosConfigOptionMappingType} from "../core/service";
import {Config} from "../index";

// noinspection JSUnusedGlobalSymbols
export default function RequestConfig(config: AxiosConfigOptionMappingType | Config) {
    return function (target: Function, name: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function () {
                (this as Service).configs(name, config as AxiosConfigOptionMappingType);
                return fn.apply(this, arguments);
            };
        } else {
            target.prototype._config = config;
        }
    };
}