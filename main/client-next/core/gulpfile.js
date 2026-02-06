import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import swc from "gulp-swc";
import {existsSync, mkdirSync} from "node:fs";
import {execSync} from "node:child_process";

const polyfill = process.env.npm_config_polyfill === "true";

// --- 配置 ---
const cjsSwcOptions = {
    module: { type: 'commonjs' },
    env: Object.assign({ targets: "dead" }, polyfill ? { mode: "usage", coreJs: "3.39.0" } : null)
};

const esmSwcOptions = {
    module: { type: 'es6' },
    env: Object.assign({ targets: "dead" }, polyfill ? { mode: "usage", coreJs: "3.39.0" } : null)
};

const tsOptionsCjs = {
    target: "es5",
    declaration: true,
    module: "commonjs",
    lib: ["DOM", "ESNext"],
    downlevelIteration: true,
    moduleResolution: "node",
};

const tsOptionsEsm = {
    ...tsOptionsCjs,
    target: "es5",
    module: "esnext",
};

// --- 任务 ---

// CJS 编译任务 (输出到 dist/)
gulp.task("compile:cjs", function () {
    const tsResult = gulp.src("./src/**/*.ts").pipe(gulpTypescript(tsOptionsCjs));

    // 编译 CJS 并输出到 dist/
    tsResult.js
        .pipe(swc(cjsSwcOptions))
        .pipe(gulp.dest("./dist"));
    
    // 将类型声明文件输出到 dist/
    return tsResult.dts.pipe(gulp.dest("./dist"));
});

// ESM 编译任务 (输出到 dist/es/)
gulp.task("compile:esm", function () {
    const tsResult = gulp.src("./src/**/*.ts").pipe(gulpTypescript(tsOptionsEsm));
    tsResult.js
        .pipe(swc(esmSwcOptions))
        .pipe(gulp.dest("./dist/es"));
    return tsResult.dts.pipe(gulp.dest("./dist/es"));
});

// 顶层编译任务，并行执行 CJS 和 ESM 编译
gulp.task("compile", gulp.parallel("compile:cjs", "compile:esm", function(done) {
    // 复制其他非 ts 文件
    if (!existsSync("./dist")) {
        mkdirSync("./dist");
    }
    gulp.src("./src/lib/core/core-expect/*").pipe(gulp.dest("./dist/lib/core/core-expect"));
    gulp.src("./src/lib/core/core-expect/*").pipe(gulp.dest("./dist/es/lib/core/core-expect"));
    done();
}));

gulp.task("deploy", async function () {
    gulp.src("./dist/**/*").pipe(gulp.dest("../release"));
    gulp.src("../../../README.md").pipe(gulp.dest("../release"));
    gulp.src("../../../LICENSE").pipe(gulp.dest("../release"));
});

gulp.task("build", gulp.series([
    async function () {
        const currentWorkingDir = process.cwd();
        execSync("gulp compile", {
            cwd: currentWorkingDir,
        });
    },
    "deploy",
]));
