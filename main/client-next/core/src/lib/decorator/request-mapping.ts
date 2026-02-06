import type {Method} from 'axios';
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
        // Class Decorator logic remains the same
        return function <T extends { new(...args: any[]): Service }>(constructor: T) {
            // 这里不用继承 extends constructor, 无法转换到 ES5
            // 获取原型对象
            const target = constructor.prototype;
            if (path) {
                Object.defineProperty(target, '__path', {
                    value: path,
                    enumerable: false,
                    configurable: true,
                    writable: false,
                });
            }
            return constructor;
        }
    } else {
        // Method Decorator logic
        return function <T extends Service>(target: T, propertyKey: string, descriptor: PropertyDescriptor) {
            // 在原型链上标记方法被替换，在 RequestConfig 中会重新绑定 this 指针。
            // target 是类的原型对象
            if (!Object.prototype.hasOwnProperty.call(target, '__decoratedMethods')) {
                Object.defineProperty(target, '__decoratedMethods', {
                    value: [],
                    enumerable: false,
                    configurable: true,
                    writable: false,
                });
            }
            (target as any).__decoratedMethods.push(propertyKey);

            const originalMethod = descriptor.value;
            const metaDescriptor = castToMetaDescriptor(descriptor);
            // 这里没有使用箭头函数，this 运行时不确定 因此后续需要重新绑定
            descriptor.value = function (...args: any[]) {
                try {
                    const source = originalMethod.apply(this, args);

                    const service: Service = this as Service;
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
