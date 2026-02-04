import {ParamsMapping} from "../core/builder";
import type Service from "../core/service";
import {castToMetaDescriptor, isNullOrEmpty} from "../core/common";

type PathVariablesParamsMapping = Omit<ParamsMapping, 'key'> & { key?: string };

export default function PathVariables(keyOrMapping?: string | PathVariablesParamsMapping) {
    return function <T extends Service>(_target: T, propertyKey: string, descriptor: PropertyDescriptor) {
        const metaDescriptor = castToMetaDescriptor(descriptor);
        const builder = metaDescriptor.builder;
        if (builder) {
            if (typeof keyOrMapping === 'string' || keyOrMapping === undefined || isNullOrEmpty(keyOrMapping)) {
                builder.pathVariable({
                    // key 为空使用数据源本体
                    key: typeof keyOrMapping === 'string' ? keyOrMapping : '',
                    required: false,
                    value: undefined
                });
            } else {
                builder.pathVariable({
                    ...keyOrMapping,
                    key: typeof keyOrMapping.key === 'string' ? keyOrMapping.key : '',
                    required: false
                });
            }
        }
    }
}