import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import swc from "gulp-swc";
import {existsSync, mkdirSync} from "node:fs";
import {execSync} from "node:child_process";
import {rimrafSync} from 'rimraf';
import rename from "gulp-rename";

const polyfill = process.env.npm_config_polyfill === "true";

// --- 配置 ---
const cjsSwcOptions = {
    module: {type: 'commonjs'},
    env: Object.assign({targets: "dead"}, polyfill ? {mode: "usage", coreJs: "3.39.0"} : null)
};

const esmSwcOptions = {
    module: {type: 'es6'},
    env: Object.assign({targets: "dead"}, polyfill ? {mode: "usage", coreJs: "3.39.0"} : null)
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

gulp.task("compile:cjs", function () {
    const tsResult = gulp.src("./src/**/*.ts").pipe(gulpTypescript(tsOptionsCjs));
    tsResult.js.pipe(swc(cjsSwcOptions)).pipe(gulp.dest("./dist"));
    return tsResult.dts.pipe(gulp.dest("./dist"));
});

gulp.task("compile:esm", function () {
    const tsResult = gulp.src("./src/**/*.ts").pipe(gulpTypescript(tsOptionsEsm));
    tsResult.js.pipe(swc(esmSwcOptions)).pipe(gulp.dest("./dist/es"));
    return tsResult.dts.pipe(gulp.dest("./dist/es"));
});

gulp.task("compile", gulp.parallel("compile:cjs", "compile:esm", function (done) {
    if (!existsSync("./dist")) mkdirSync("./dist");
    gulp.src("./src/lib/core/core-expect/*").pipe(gulp.dest("./dist/lib/core/core-expect"));
    gulp.src("./src/lib/core/core-expect/*").pipe(gulp.dest("./dist/es/lib/core/core-expect"));
    done();
}));

gulp.task('wechat-mp:copy', function () {
    return gulp.src("./dist/lib/**/*")
        .pipe(gulp.dest("./dist/wechat-mp"));
});

gulp.task('wechat-mp:clean-expect', function (done) {
    rimrafSync(["./dist/wechat-mp/core/core-expect"]);
    done();
});

gulp.task('wechat-mp:rewrite-expect', function () {
    return gulp.src("./src/lib/core/core-expect/index.cjs.js")
        .pipe(rename("core-expect.js"))
        .pipe(gulp.dest("./dist/wechat-mp/core"));
});

gulp.task('build-wechat-mp', gulp.series('wechat-mp:copy', 'wechat-mp:rewrite-expect', 'wechat-mp:clean-expect'));


gulp.task('deploy:dist', function() {
    return gulp.src("./dist/**/*")
        .pipe(gulp.dest("../release"));
});

gulp.task('deploy:docs', function() {
    return gulp.src(["../../../README.md", "../../../LICENSE"])
        .pipe(gulp.dest("../release"));
});
gulp.task("deploy", gulp.parallel('deploy:dist', 'deploy:docs'));


gulp.task("build", gulp.series([
    async function () {
        const currentWorkingDir = process.cwd();
        execSync("gulp compile", { cwd: currentWorkingDir });
    },
    "build-wechat-mp",
    "deploy", // 使用新的、正确的 deploy 任务
]));
