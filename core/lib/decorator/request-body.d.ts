import {AxiosPromise} from "axios";

export default function RequestBody(name?: string): (() => AxiosPromise<any>);