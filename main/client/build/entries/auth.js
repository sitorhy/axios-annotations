import commonjs from "@rollup/plugin-commonjs";
import typescript from "@rollup/plugin-typescript";
import json from "@rollup/plugin-json";
import {nodeResolve} from "@rollup/plugin-node-resolve";

// oauth2插件默认入口
export default {
    input: 'plugins/auth/index.ts',
    output: [
        {
            file: 'dist/plugins/auth/index.js',
        }
    ],
    external: ["../../lib/plugins/auth"],
    plugins: [
        commonjs(),
        json(),
        typescript(),
        nodeResolve()
    ]
}