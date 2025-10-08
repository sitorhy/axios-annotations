import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PostMapping<M = undefined>(path = "") {
    return RequestMapping<M>(path, "POST") as MethodDecorator;
}