import {AxiosPromise, AxiosRequestConfig} from "axios";
import Config from "../core/config";
import Service from "../core/service";

export default function RequestBody(config: Config): (() => Service);

export default function RequestBody(config: Partial<AxiosRequestConfig>): (() => AxiosPromise<any>);