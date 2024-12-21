import type {AxiosStatic} from "axios";

export default class AxiosStaticInstanceProvider {
    __instance: AxiosStatic | null = null;

    async provide(): Promise<AxiosStatic> {
        // require is synchronous but only for cjs
        const lib = await import("axios");
        return lib.default;
    }

    async get(): Promise<AxiosStatic> {
        this.__instance = await this.provide();
        return this.__instance;
    }
}