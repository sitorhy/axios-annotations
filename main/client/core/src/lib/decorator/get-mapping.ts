import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function GetMapping(path = "") {
    return RequestMapping(path, "GET");
}