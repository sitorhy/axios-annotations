import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function GetMapping<M = undefined>(path = "") {
    return RequestMapping<M>(path, "GET") as MethodDecorator;
}