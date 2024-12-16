import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default {
    input: "lib/index.ts",
    output: {
        file: "dist/lib/index.js",
    },
    plugins: [
        commonjs(),
        json(),
        typescript(),
        nodeResolve()
    ]
}