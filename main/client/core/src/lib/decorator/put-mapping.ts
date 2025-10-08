import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PutMapping<M = undefined>(path = "") {
    return RequestMapping<M>(path, "PUT") as MethodDecorator;
}