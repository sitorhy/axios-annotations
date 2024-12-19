import RequestMapping from "./request-mapping.js";

// noinspection JSUnusedGlobalSymbols
export default function PutMapping(path = "") {
    return RequestMapping(path, "PUT");
}