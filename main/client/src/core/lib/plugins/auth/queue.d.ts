import {AxiosError, AxiosPromise} from "axios";
import Authorizer from "./authorizer";

export default class PendingQueue {
    constructor(authorizer: Authorizer);

    resend(error: AxiosError, retries?: number): AxiosPromise<any>;

    push(error: AxiosError): AxiosPromise<any>;

    pop(): void;

    clear(): void;

    size: number;
}