import {AxiosPromise} from "axios";

export default function PatchMapping(path: string): (() => AxiosPromise<any>);