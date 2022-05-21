import {AxiosPromise} from "axios";
import Service from "../core/service";

export default function RequestMapping(path: string, method: string): (() => AxiosPromise<any>);
export default function RequestMapping(path: string): (() => Service);