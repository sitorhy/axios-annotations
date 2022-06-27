import RequestMapping from "./request-mapping";

export default function PatchMapping(path = "") {
    return RequestMapping(path, "PATCH");
}