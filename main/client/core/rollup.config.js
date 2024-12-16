import {nodeResolve} from '@rollup/plugin-node-resolve';
import typescript from "@rollup/plugin-typescript";
import commonjs from '@rollup/plugin-commonjs';
import json from "@rollup/plugin-json";
import {dts} from "rollup-plugin-dts";
import * as rimraf from "rimraf";

export default [
    // 编译打包核心库
    {
        input: "src/index.ts",
        output: {
            file: "dist/index.js",
            sourcemap: true,
            format: "umd",
            name: "index",
            globals: {
                "axios": "axios",
            },
        },
        /**
         * Axios export bugs in built: axios is not defined in browser, use 0.27.2 below or others
         */
        external: ["axios"],
        plugins: [
            commonjs(),
            nodeResolve(),
            json(),
            typescript(),
        ],
    },
    // 默认插件拆分打包
    {
        input: "src/plugins.ts",
        output: {
            file: "dist/plugins.js",
            sourcemap: true,
            format: "umd",
            name: "index",
            globals: {
                "axios": "axios",
            },
        },
        external: ["axios"],
        plugins: [
            commonjs(),
            nodeResolve(),
            json(),
            typescript(),
        ],
    },
    // 打包声明文件
    {
        input: "dist/index.d.ts",
        output: [
            {
                file: "dist/index.d.ts",
                format: "es"
            }
        ],
        plugins: [
            dts()
        ],
    },
    {
        input: "dist/plugins.d.ts",
        output: [
            {
                file: "dist/plugins.d.ts",
                format: "es"
            }
        ],
        plugins: [
            dts(),
            (function () {
                return {
                    buildEnd() {
                        // 移除合并前的声明文件
                        rimraf.sync("dist/core");
                        rimraf.sync("dist/decorator");
                        rimraf.sync("dist/plugins");
                    }
                }
            })()
        ],
    },
]