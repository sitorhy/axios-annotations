import type {AxiosRequestConfig} from 'axios';
import Config from "../core/config";
import type Service from "../core/service";
import {castToMetaDescriptor} from "../core/common";
import {AxiosConfigMapper} from "../core/builder";

type ConfigType = Config | AxiosRequestConfig | AxiosConfigMapper;
type Decorator<T> = T extends Config ? ClassDecorator : PropertyDecorator;

export default function RequestConfig<T = ConfigType>(config: T): Decorator<T> {
    if (config instanceof Config) {
        // --- Class Decorator Logic ---
        return function <T extends { new(...args: any[]): Service }>(constructor: T) {
            const target = constructor.prototype;
            if (config) {
                Object.defineProperty(target, '__config', {
                    value: config,
                    enumerable: false,
                    configurable: true,
                    writable: false,
                });
            }

            return constructor;
        } as Decorator<T>;
    } else {
        // --- Method Decorator Logic ---
        return function (target: Service, propertyKey: string, descriptor: PropertyDescriptor) {
            const metaDescriptor = castToMetaDescriptor(descriptor);
            metaDescriptor.builder.config(config as AxiosRequestConfig | AxiosConfigMapper);
        } as Decorator<Exclude<T, Config>>;
    }
}
