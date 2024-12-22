import Service from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function IgnoreResidualParams(ignore?: boolean): MethodDecorator {
    return function (_target: Function, method: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            descriptor.value = function (...args: any[]) {
                const cfg = Object.assign((this as Service).features(method) || {}, {
                    ignoreResidualParams: ignore !== false,
                });
                (this as Service).features(method, cfg);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}