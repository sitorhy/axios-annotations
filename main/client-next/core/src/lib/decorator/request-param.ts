import type Service from "../core/service";
import {castToMetaDescriptor} from "../core/common";
import {ParamsMapping} from "../core/builder";

export default function RequestParam(mapping: ParamsMapping): (target: Service, propertyKey: string, descriptor: PropertyDescriptor) => void;

export default function RequestParam(key: string, required?: boolean): (target: Service, propertyKey: string, descriptor: PropertyDescriptor) => void;

// 声明查询串参数
export default function RequestParam(keyOrMapping: string | ParamsMapping, required?: boolean) {
    return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const metaDescriptor = castToMetaDescriptor(descriptor);
        const builder = metaDescriptor.builder;
        if (builder) {
            if (typeof keyOrMapping === 'string') {
                builder.param(keyOrMapping, required === true);
            } else {
                builder.param(keyOrMapping);
            }
        }
    }
}
