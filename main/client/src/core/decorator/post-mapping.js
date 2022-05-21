import RequestMapping from "./request-mapping";

export default function PostMapping(path) {
    return RequestMapping(path, "POST");
}