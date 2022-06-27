import {AxiosPromise} from "axios";

export default function GetMapping(path?: string): (() => AxiosPromise<any>);