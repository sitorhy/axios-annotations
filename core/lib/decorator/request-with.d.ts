import {AxiosPromise} from "axios";

export default function RequestWith(configName: string): (() => AxiosPromise<any>);