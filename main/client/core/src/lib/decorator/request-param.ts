import Service, {RequestParamEncodeRule} from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function RequestParam(name: string, required?: boolean): MethodDecorator {
    return function (_target: Function, method: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            const cfg: RequestParamEncodeRule = Object.assign({
                required: false,
                body: false
            }, {
                required: required === true
            });
            descriptor.value = function (...args: any[]) {
                (this as Service).params(method, name, cfg);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}