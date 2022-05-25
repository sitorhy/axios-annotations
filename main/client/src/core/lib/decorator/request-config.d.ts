import {AxiosPromise, AxiosRequestConfig} from "axios";
import Config from "../core/config";
import Service from "../core/service";

export default function RequestConfig(config: Config): (() => Service);

export default function RequestConfig(config: Partial<AxiosRequestConfig>): (() => AxiosPromise<any>);