import {config} from "./config";

export default class Service {
    config = config;
    path = '';

    constructor() {
        const target = Object.getPrototypeOf(this);
        // 获取被加入切面的方法
        const methodsToBind = target.__decoratedMethods;

        if (methodsToBind && Array.isArray(methodsToBind)) {
            for (const methodName of methodsToBind) {
                if (typeof (this as any)[methodName] === 'function') {
                    (this as any)[methodName] = (this as any)[methodName].bind(this);
                }
            }
        }

        if (target.__path) {
            this.path = target.__path;
        }

        if (target.__config) {
            this.config = target.__config;
        }

        Reflect.deleteProperty(target, '__path');
        Reflect.deleteProperty(target, '__config');
        Reflect.deleteProperty(target, '__decoratedMethods');
    }
}