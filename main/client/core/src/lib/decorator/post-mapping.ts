import RequestMapping from "./request-mapping.js";

// noinspection JSUnusedGlobalSymbols
export default function PostMapping(path = "") {
    return RequestMapping(path, "POST");
}