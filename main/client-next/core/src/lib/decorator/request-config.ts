import {AxiosRequestConfig} from "axios";
import Config from "../core/config";
import type Service from "../core/service";
import {castToMetaDescriptor} from "../core/common";
import {AxiosConfigMapper} from "../core/builder";

type ConfigType = Config | AxiosRequestConfig | AxiosConfigMapper;
type Decorator<T> = T extends Config ? ClassDecorator : PropertyDecorator;

export default function RequestConfig<T = ConfigType>(config: T): Decorator<T> {
    if (config instanceof Config) {
        return function <T extends { new(...args: any[]): Service }>(constructor: T) {
            return class extends constructor {
                constructor(..._args: any[]) {
                    super();
                    this.config = config as Config;
                }
            }
        } as Decorator<T>;
    } else {
        return function (target: Service, propertyKey: string, descriptor: PropertyDescriptor) {
            const metaDescriptor = castToMetaDescriptor(descriptor);
            metaDescriptor.builder.config(config as AxiosRequestConfig | AxiosConfigMapper);
        } as Decorator<Exclude<T, Config>>;
    }
}