import Service from "../core/service";

export default function RequestMapping(path: string, method: string): (() => Promise<any>);
export default function RequestMapping(path: string): (() => Service);