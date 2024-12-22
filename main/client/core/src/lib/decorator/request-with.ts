import Service from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

export default function RequestWith(configName: string): MethodDecorator {
    return function (_target: Function, name: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            descriptor.value = function (...args: any[]) {
                (this as Service).for(name, configName);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}