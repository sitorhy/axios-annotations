import typescript from '@rollup/plugin-typescript';
import fs from "fs";
import commonjs from "@rollup/plugin-commonjs";
import json from "@rollup/plugin-json";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import gulp from "gulp";

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
        input: "lib/plugins/index.ts",
        output: {
            file: "dist/lib/plugins/index.js",
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
            (function () {
                return {
                    writeBundle() {
                        // typescript负责模块生成声明文件 rollup需要覆盖自动生成的d.ts文件
                        fs.copyFileSync("node_modules/core/dist/index.d.ts", "dist/lib/index.d.ts");
                    }
                }
            })()
        ]
    },
    {
        // 插件默认入口
        input: 'plugins/index.ts',
        output: [
            {
                file: 'dist/plugins/index.js',
                format: 'cjs',
            }
        ],
        external: ["../lib/plugins","axios"],
        plugins: [
            commonjs(),
            typescript({
                    compilerOptions: {
                        lib: ["es2021", "dom"],
                        target: "es5",
                        declaration: false,
                        emitDeclarationOnly: false,
                    }
                }
            ),
            {
                writeBundle() {
                    gulp.src("dist/**/*").pipe(gulp.dest("../release"));
                }
            }
        ]
    },
]