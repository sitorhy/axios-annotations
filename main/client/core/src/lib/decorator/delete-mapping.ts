import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function DeleteMapping<M = undefined>(path = "") {
    return RequestMapping<M>(path, "DELETE") as MethodDecorator;
}