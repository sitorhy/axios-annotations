import RequestMapping from "./request-mapping.js";

// noinspection JSUnusedGlobalSymbols
export default function PatchMapping(path = "") {
    return RequestMapping(path, "PATCH");
}