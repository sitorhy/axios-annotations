import RequestMapping from "./request-mapping";

export default function DeleteMapping(path = "") {
    return RequestMapping(path, "DELETE");
}