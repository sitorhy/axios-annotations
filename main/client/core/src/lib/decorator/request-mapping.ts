import Config from "../core/config";
import {forward, mapToDefaultMethod} from "../core/common";
import Service from "../core/service";
import type {AxiosPromise} from "axios";

type DecoratorTargetType<M> = M extends string ? MethodDecorator : ClassDecorator;
type DecoratorMethodType = (...args: any[]) => AxiosPromise;
type DescriptorType<M> = M extends string ? TypedPropertyDescriptor<DecoratorMethodType> : void;

export default function RequestMapping<M = undefined>(path: string, method?: M | string): DecoratorTargetType<M> {
    return function (target: Function, name: string, descriptor: DescriptorType<M>) {
        if (!descriptor) {
            // 注解类
            target.prototype._path = path;
        } else {
            // 不可能为空
            const fn: DecoratorMethodType = descriptor.value as DecoratorMethodType;

            descriptor.value = function (...args: any[]) {
                const data: Promise<any> | any = fn.apply(this, args) || {};
                if (typeof (this as Service).for !== "function") {
                    throw new Error("Make sure your service inherited \"core/Service\".");
                }
                // 当前方法是否重定向到其他配置
                const withConfigName = (this as Service).for(name);
                // 根据名称获取配置
                const withConfig: Config | null = Config.forName(withConfigName || "");
                if (data && data.then && typeof data.then === "function") {
                    return new Promise((resolve, reject) => {
                        data.then((d: any) => {
                            const {
                                path: p,
                                body,
                                config,
                                query
                            } = (this as Service).createRequestConfig(name, (this as Service).pathVariable(path || "", d), d, args, args);
                            if (withConfig) {
                                withConfig.requestAxiosInstance().then(axios => {
                                    forward(axios, withConfig.origin, withConfig.prefix, (this as Service).path, path, mapToDefaultMethod(method, "GET"), query, body, config).then(resolve).catch(reject);
                                });
                            } else {
                                (this as Service).request(mapToDefaultMethod(method, "GET"), p, body, config).then(resolve).catch(reject);
                            }
                        });
                    });
                } else {
                    const {
                        path: p,
                        body,
                        config,
                        query
                    } = (this as Service).createRequestConfig(name, (this as Service).pathVariable(path || "", data), data, args, args);

                    if (withConfig) {
                        return new Promise((resolve, reject) => {
                            withConfig.requestAxiosInstance().then(axios => {
                                return forward(axios, withConfig.origin, withConfig.prefix, (this as Service).path, path, mapToDefaultMethod(method, "GET"), query, body, config).then(resolve).catch(reject);
                            });
                        });
                    } else {
                        return (this as Service).request(mapToDefaultMethod(method, "GET"), p, body, config);
                    }
                }
            };
        }
    } as DecoratorTargetType<M>;
}