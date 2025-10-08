import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PatchMapping<M = undefined>(path = "") {
    return RequestMapping<M>(path, "PATCH") as MethodDecorator;
}