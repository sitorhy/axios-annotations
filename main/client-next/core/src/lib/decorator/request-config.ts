import {AxiosRequestConfig} from "axios";
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
            // 继承一个派生类，避免原型链污染，因此需要环境支持 ES6
            return class extends constructor {
                constructor(..._args: any[]) {
                    super(..._args);
                    this.config = config as Config;

                    // 获取被加入切面的方法
                    const methodsToBind = (constructor.prototype as any).__decoratedMethods;

                    if (methodsToBind && Array.isArray(methodsToBind)) {
                        for (const methodName of methodsToBind) {
                            if (typeof (this as any)[methodName] === 'function') {
                                (this as any)[methodName] = (this as any)[methodName].bind(this);
                            }
                        }
                    }
                }
            }
        } as Decorator<T>;
    } else {
        // --- Method Decorator Logic ---
        return function (target: Service, propertyKey: string, descriptor: PropertyDescriptor) {
            const metaDescriptor = castToMetaDescriptor(descriptor);
            metaDescriptor.builder.config(config as AxiosRequestConfig | AxiosConfigMapper);
        } as Decorator<Exclude<T, Config>>;
    }
}
