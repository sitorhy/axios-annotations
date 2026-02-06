import type {AxiosPromise} from 'axios';

export default function Expect<T, D = AxiosPromise<T>>(params: any): D;
export {};
