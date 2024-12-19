import RequestMapping from "./request-mapping.js";

// noinspection JSUnusedGlobalSymbols
export default function GetMapping(path = "") {
    return RequestMapping(path, "GET");
}