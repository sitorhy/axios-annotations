import commonjs from "@rollup/plugin-commonjs";
import {nodeResolve} from "@rollup/plugin-node-resolve";
import json from "@rollup/plugin-json";
import typescript from "@rollup/plugin-typescript";
import gulp from "gulp";
import * as fs from "node:fs";

// 核心库默认入口
export default {
    input: 'index.ts',
    output: [
        {
            file: 'dist/index.js',
        }
    ],
    external: ["./lib"],
    plugins: [
        commonjs(),
        nodeResolve(),
        json(),
        typescript({
            compilerOptions: {
                declaration: true,
                outDir: "dist",
            }
        }),
        {
            closeBundle() {
                fs.copyFileSync("./node_modules/core/dist/index.d.ts","./dist/lib/index.d.ts");
                fs.copyFileSync("./node_modules/core/dist/auth.d.ts","./dist/lib/plugins/auth/index.d.ts");

                gulp.src("./dist/**/*").pipe(gulp.dest("../release"));

                gulp.src("../../../LICENSE")
                    .pipe(gulp.dest("../release"));

                gulp.src("../../../README.md")
                    .pipe(gulp.dest("../release"));
            }
        }
    ]
}