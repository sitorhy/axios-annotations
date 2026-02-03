import type Service from "../core/service";
import Config from "../core/config";
import {castToMetaDescriptor} from "../core/common";

// 重定向方法的配置
export default function RequestWith(config: Config) {
    return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const metaDescriptor = castToMetaDescriptor(descriptor);
        metaDescriptor.config = config;
    }
}