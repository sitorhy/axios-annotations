import typescript from '@rollup/plugin-typescript';
import copy from 'rollup-plugin-copy';
import fs from "fs";
import * as path from "node:path";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import {nodeResolve} from "@rollup/plugin-node-resolve";

export default [
    {
        input: "lib/index.ts",
        output: {
            file: "dist/lib/index.js",
            format: "cjs",
        },
        external: ["axios"],
        plugins: [
            commonjs(),
            json(),
            typescript(),
            nodeResolve(),
        ]
    },
    {
        // 默认入口
        input: 'index.ts',
        output: [
            {
                file: 'dist/index.js',
                format: 'cjs',
            }
        ],
        external: ["./lib", "axios"],
        plugins: [
            commonjs(),
            nodeResolve(),
            json(),
            typescript({
                    compilerOptions: {
                        lib: ["es2021", "dom"],
                        target: "es5",
                        declaration: true,
                        emitDeclarationOnly: true,
                        outDir: "./dist",
                    }
                }
            ),
            copy({
                targets: [
                    {
                        src: "../../../LICENSE",
                        dest: 'dist',
                    },
                    {
                        src: "../../../README.md",
                        dest: 'dist',
                    },
                ]
            }),
            (function () {
                return {
                    buildEnd() {
                        if (!fs.existsSync('./dist')) {
                            fs.mkdirSync("./dist");
                        }
                        const pkg = path.resolve("../../../package.json");
                        const info = JSON.parse(fs.readFileSync(pkg));
                        const {
                            name,
                            version,
                            description,
                            homepage,
                            repository,
                            author,
                            license,
                            keywords
                        } = info;

                        fs.writeFileSync("dist/package.json", JSON.stringify({
                            main: "index.js",
                            name,
                            version,
                            description,
                            homepage,
                            repository,
                            author,
                            license,
                            miniprogram: "lib",
                            keywords,
                        }, null, 2), {
                            flag: "w"
                        });
                    },
                    writeBundle() {
                        fs.copyFileSync("node_modules/core/dist/index.d.ts", "dist/lib/index.d.ts");
                    }
                }
            })()
        ]
    },
]