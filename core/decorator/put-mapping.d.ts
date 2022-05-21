import {AxiosPromise} from "axios";

export default function PutMapping(path: string): (() => AxiosPromise<any>);