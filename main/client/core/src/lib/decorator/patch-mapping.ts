import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PatchMapping(path = "") {
    return RequestMapping(path, "PATCH");
}