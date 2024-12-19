import RequestMapping from "./request-mapping.js";

// noinspection JSUnusedGlobalSymbols
export default function DeleteMapping(path = "") {
    return RequestMapping(path, "DELETE");
}