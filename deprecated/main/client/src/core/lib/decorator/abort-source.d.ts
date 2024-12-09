import {AxiosPromise, CancelToken} from "axios";

export class AbortControllerAdapter {
    constructor(CancelToken: CancelToken);

    abort(reason?: string): void;
}

export default function AbortSource(abortController: (AbortController | AbortControllerAdapter) | ((...args: any[]) => (AbortController | AbortControllerAdapter))): (() => AxiosPromise<any>);
