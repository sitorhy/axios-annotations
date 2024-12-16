import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default {
    input: "lib/plugins/auth/index.ts",
    output: {
        file: "dist/lib/plugins/auth/index.js",
    },
    plugins: [
        commonjs(),
        json(),
        typescript(),
        nodeResolve()
    ]
}