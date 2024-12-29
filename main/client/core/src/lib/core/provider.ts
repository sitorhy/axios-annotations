import type {AxiosStatic} from "axios";

export default class AxiosStaticInstanceProvider<StaticType = AxiosStatic> {
    __instance: StaticType | null = null;

    async provide(): Promise<StaticType> {
        // require is synchronous but only for cjs
        const lib = await import("axios");
        return lib.default as StaticType;
    }

    async get(): Promise<StaticType> {
        if (this.__instance) {
            return this.__instance;
        }
        this.__instance = await this.provide();
        return this.__instance;
    }
}