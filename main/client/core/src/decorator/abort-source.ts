import Service, {AbortControllerGenerator, type AbortControllerAdapter} from "../core/service";

export {AbortControllerAdapter} from '../core/service';

// noinspection JSUnusedGlobalSymbols
export default function (abortController: (AbortController | AbortControllerAdapter) | AbortControllerGenerator) {
    return function <T extends Service>(_target: keyof T, method: string, descriptor: PropertyDescriptor) {
        if (descriptor) {
            const fn = descriptor.value;
            descriptor.value = function (...args: any[]) {
                let controller = abortController;
                if (typeof abortController === "function") {
                    controller = (abortController as AbortControllerGenerator).apply(undefined, args);
                }
                (this as Service).abort(method, controller);
                return fn.apply(this, arguments);
            };
        }
    };
}
