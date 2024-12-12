import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PutMapping(path = "") {
    return RequestMapping(path, "PUT");
}