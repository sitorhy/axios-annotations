import RequestMapping from "./request-mapping";

// noinspection JSUnusedGlobalSymbols
export default function DeleteMapping(path = "") {
    return RequestMapping(path, "DELETE");
}