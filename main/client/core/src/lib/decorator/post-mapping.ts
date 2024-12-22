import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function PostMapping(path = "") {
    return RequestMapping(path, "POST");
}