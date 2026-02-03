import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import filter from "gulp-filter";
import swc from "gulp-swc";
import {existsSync, mkdirSync} from "node:fs";
import {execSync} from "node:child_process";

const polyfill = process.env.npm_config_polyfill === "true";

// Any options to configure swc: https://swc.rs/docs/configuring-swc
const swcOptions = {
    env: Object.assign({
        targets: "dead"
    }, polyfill ? {
        mode: "usage",
        coreJs: "3.39.0"
    } : null)
};

gulp.task("compile", async function () {
    if (!existsSync("./dist")) {
        mkdirSync("./dist");
    }

    const entries = gulp.src("./src/**/*.ts").pipe(gulpTypescript({
        target: "es5",
        declaration: true,
        lib: ["DOM", "ESNext"],
        downlevelIteration: true,
        outDir: "./dist"
    }));

    gulp.src("./src/lib/core/expect.*").pipe(gulp.dest("./dist/lib/core"));

    entries.pipe(filter(["**/*.d.ts"])).pipe(gulp.dest("./dist"));
    entries.pipe(filter(["**/*.js", "!**/*.d.ts"])).pipe(swc(swcOptions)).pipe(gulp.dest("./dist"));
});

gulp.task("deploy", async function () {
    gulp.src("./dist/**/*").pipe(gulp.dest("../release"));
    gulp.src("../../../README.md").pipe(gulp.dest("../release"));
    gulp.src("../../../LICENSE").pipe(gulp.dest("../release"));
});

gulp.task("build", gulp.series([
    async function () {
        const currentWorkingDir = process.cwd();
        // 另起进程编译 立即输出文件
        execSync("gulp compile", {
            cwd: currentWorkingDir,
        });
    },
    "deploy",
]));
