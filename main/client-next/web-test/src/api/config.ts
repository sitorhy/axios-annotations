import {Config} from "axios-annotations";

export const localConfig = new Config({
    protocol: 'http',
    host: 'localhost',
    port: 5173
});