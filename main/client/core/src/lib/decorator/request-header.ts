import Service, {HeaderMappingValueType} from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function RequestHeader(header: string, value: HeaderMappingValueType): MethodDecorator {
    return function (_target: Function, method: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            descriptor.value = function (...args: any[]) {
                (this as Service).headers(method, header, value);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}