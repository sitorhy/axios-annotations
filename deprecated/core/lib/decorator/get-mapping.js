import RequestMapping from "./request-mapping";

export default function GetMapping(path = "") {
    return RequestMapping(path, "GET");
}