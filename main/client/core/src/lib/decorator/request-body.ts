import Service, {RequestParamEncodeRule} from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function RequestBody(name: string = "body"): MethodDecorator {
    return function (_target: Function, method: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            const cfg: RequestParamEncodeRule = {
                required: false,
                body: true
            };
            descriptor.value = function (...args: any[]) {
                (this as Service).params(method as string, name, cfg);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}