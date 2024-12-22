import Service, {AbortControllerGenerator} from "../core/service";
import {AbortControllerAdapter} from "../index";
import type {AxiosPromise} from "axios";

type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType = TypedPropertyDescriptor<DecoratorMethodType>;

// noinspection JSUnusedGlobalSymbols
export default function AbortSource(abortController: (AbortController | AbortControllerAdapter) | AbortControllerGenerator): MethodDecorator {
    return function <T extends Service>(_target: keyof T, method: string, descriptor: DescriptorType) {
        if (descriptor) {
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;
            descriptor.value = function (...args: any[]) {
                let controller = abortController;
                if (typeof abortController === "function") {
                    controller = (abortController as AbortControllerGenerator).apply(undefined, args);
                }
                (this as Service).abort(method, controller);
                return fn.apply(this, args);
            };
        }
    } as MethodDecorator;
}
