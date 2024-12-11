import RequestMapping from "./request-mapping";

export default function PutMapping(path = "") {
    return RequestMapping(path, "PUT");
}