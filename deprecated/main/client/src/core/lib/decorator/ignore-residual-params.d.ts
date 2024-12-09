import {AxiosPromise} from "axios";

export default function IgnoreResidualParams(ignore?: boolean): (() => AxiosPromise<any>);