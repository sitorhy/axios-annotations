import type Service from "../core/service";
import {castToMetaDescriptor} from "../core/common";
import {ParamsMapping} from "../core/builder";

export default function RequestHeader(mapping: ParamsMapping): (target: Service, propertyKey: string, descriptor: PropertyDescriptor) => void;

export default function RequestHeader(key: string, required?: boolean): (target: Service, propertyKey: string, descriptor: PropertyDescriptor) => void;

export default function RequestHeader(keyOrMapping: string | ParamsMapping, required?: boolean) {
    return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const metaDescriptor = castToMetaDescriptor(descriptor);
        const builder = metaDescriptor.builder;
        if (builder) {
            if (typeof keyOrMapping === 'string') {
                builder.header(keyOrMapping, required === true);
            } else {
                builder.header(keyOrMapping);
            }
        }
    }
}
