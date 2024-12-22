import Service, {AxiosConfigOptionMappingType} from "../core/service";
import {Config} from "../index";
import type {AxiosPromise} from "axios";

type DecoratorTargetType<D> = D extends Config ? ClassDecorator : PropertyDecorator;
type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType<M> = M extends Config ? void : TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function RequestConfig<T = AxiosConfigOptionMappingType | Config>(config: T): DecoratorTargetType<T> {
    return function (target: Function, name: string, descriptor: DescriptorType<T>) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            descriptor.value = function (...args: any[]) {
                (this as Service).configs(name, config as AxiosConfigOptionMappingType);
                return fn.apply(this, args);
            };
        } else {
            target.prototype._config = config;
        }
    } as DecoratorTargetType<T>;
}