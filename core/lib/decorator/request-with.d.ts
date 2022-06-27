import {AxiosPromise} from "axios";

export default function RequestWith(registration: string): (() => AxiosPromise<any>);