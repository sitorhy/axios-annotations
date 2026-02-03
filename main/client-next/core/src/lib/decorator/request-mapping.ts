import type {Method} from "axios";
import type Service from "../core/service";
import {castToMetaDescriptor, normalizePath} from "../core/common";

// For Class Decorator
export default function RequestMapping(path: string): <T extends {
    new(...args: any[]): Service
}>(constructor: T) => void;

// For Method Decorator
export default function RequestMapping(path: string, method: Method): (target: Service, propertyKey: string, descriptor: PropertyDescriptor) => void;

// Implementation
export default function RequestMapping(path: string, method?: Method): any {
    if (method === undefined) {
        // 装饰类的时候不要传 method
        // <T extends { new(...args: any[]): Service }> 约束构造函数类型
        return function <T extends { new(...args: any[]): Service }>(constructor: T) {
            return class extends constructor {
                // 必须有一个能接收任意参数的构造函数。
                constructor(..._args: any[]) {
                    super();
                    // 服务实例的请求前缀
                    this.path = path || '';
                }
            }
        }
    } else {
        // <T extends Service> 约束实例类型
        return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
            const originalMethod = descriptor.value;
            const metaDescriptor = castToMetaDescriptor(descriptor);
            descriptor.value = function (...args: any[]) {
                try {
                    const source = originalMethod.apply(this, args);
                    // this 指向类实例，此处强制转换
                    const service: Service = this as Service;

                    // 如果方法指定配置，则使用特定配置，否则使用服务实例的配置
                    const usingConfig = metaDescriptor.config ? metaDescriptor.config : service.config;

                    const servicePrefix = service.path;
                    const requestPath = normalizePath(`${servicePrefix}/${path}`);

                    return metaDescriptor.builder.buildWith(usingConfig, requestPath, method as Method, source);
                } catch (error) {
                    console.error(`Error in method '${propertyKey}'`, error);
                    throw error;
                }
            };
        }
    }
}