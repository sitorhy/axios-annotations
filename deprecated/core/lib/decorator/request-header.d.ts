import {AxiosPromise} from "axios";

export default function RequestHeader(header: string, value: string): (() => AxiosPromise<any>);

export default function RequestHeader(header: string, value: ((...args: any[]) => string)): (() => AxiosPromise<any>);