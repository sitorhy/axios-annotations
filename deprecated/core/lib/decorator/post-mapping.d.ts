import {AxiosPromise} from "axios";

export default function PostMapping(path?: string): (() => AxiosPromise<any>);