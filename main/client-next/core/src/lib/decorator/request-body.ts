import type Service from "../core/service";
import {castToMetaDescriptor, isNullOrEmpty} from "../core/common";
import {ParamsMapping} from "../core/builder";

export default function RequestBody(keyOrMapping?: string | ParamsMapping) {
    return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const metaDescriptor = castToMetaDescriptor(descriptor);
        const builder = metaDescriptor.builder;
        if (builder) {
            if (typeof keyOrMapping === 'string' || keyOrMapping === undefined || isNullOrEmpty(keyOrMapping)) {
                builder.body(keyOrMapping || 'body');
            } else {
                builder.body(keyOrMapping);
            }
        }
    }
}