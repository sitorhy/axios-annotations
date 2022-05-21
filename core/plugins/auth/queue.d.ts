import {AxiosError} from "axios";
import Authorizer from "./authorizer";

export default class PendingQueue {
    constructor(authorizer: Authorizer);

    resend(error: AxiosError, retries?: number): Promise<any>;

    push(error: AxiosError): Promise<any>;

    pop(): void;

    clear(): void;

    size: number;
}