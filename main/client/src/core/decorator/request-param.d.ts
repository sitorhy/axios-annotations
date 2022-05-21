import {AxiosPromise} from "axios";

export default function RequestParam(name: string, required?: boolean): (() => AxiosPromise<any>);