import {AxiosPromise} from "axios";

export default function RequestWith(config: string): (() => AxiosPromise<any>);