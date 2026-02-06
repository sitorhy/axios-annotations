import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import swc from "gulp-swc";
import {existsSync, mkdirSync} from "node:fs";
import {execSync} from "node:child_process";
import {rimrafSync} from 'rimraf';
import rename from "gulp-rename";
import gulpIf from 'gulp-if';
import replace from 'gulp-replace';

const polyfill = process.env.npm_config_polyfill === "true";

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
    module: "esnext",
};

// --- 任务 ---

// 1. 在源文件路径中排除 expect.ts
const sourceFiles = ["./src/**/*.ts", "!./src/lib/core/core-expect/expect.ts"];

gulp.task("compile:cjs", function () {
    const tsResult = gulp.src(sourceFiles, { base: './src' })
        .pipe(gulpTypescript(tsOptionsCjs));

    tsResult.js.pipe(swc(cjsSwcOptions)).pipe(gulp.dest("./dist"));
    return tsResult.dts.pipe(gulp.dest("./dist"));
});

const IMPORT_REGEX = /from\s+['"](\.\.?\/[^'"]+)(?<!\.(js|json|vue|ts))['"]/g;

gulp.task("compile:esm", function () {
    // 同样排除 expect.ts
    const tsResult = gulp.src("./src/lib/**/*.ts", { base: './src/lib', ignore: './src/lib/core/core-expect/expect.ts' })
        .pipe(gulpTypescript(tsOptionsEsm));

    const jsStream = tsResult.js
        .pipe(swc(esmSwcOptions))
        .pipe(gulpIf(file => file.path.endsWith('.js'), replace(IMPORT_REGEX, 'from "$1.js"')))
        .pipe(gulp.dest("./dist/es"));

    tsResult.dts.pipe(gulp.dest("./dist/es"));

    return jsStream;
});

// 2. 创建一个专门处理 expect 文件的任务
gulp.task("compile:expect", function(done) {
    // CJS 版本
    gulp.src("./src/lib/core/core-expect/index.cjs.js")
        .pipe(rename("core-expect.js"))
        .pipe(gulp.dest("./dist/lib/core"));

    // ESM 版本
    gulp.src("./src/lib/core/core-expect/index.esm.js") // 假设 ESM 也使用 CJS 版本
        .pipe(rename("core-expect.js"))
        .pipe(gulp.dest("./dist/es/core"));
    done();
});

// 3. 更新顶层编译任务
gulp.task("compile", gulp.parallel(
    "compile:cjs", 
    "compile:esm", 
    "compile:expect", // 加入新任务
    function (done) {
        if (!existsSync("./dist")) mkdirSync("./dist");
        done();
    }
));

// ... (The rest of your gulpfile remains the same)

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
    return gulp.src(["../../../README.md", "../../../README_EN.md", "../../../LICENSE"])
        .pipe(gulp.dest("../release"));
});
gulp.task("deploy", gulp.parallel('deploy:dist', 'deploy:docs'));

gulp.task("build", gulp.series([
    async function () {
        const currentWorkingDir = process.cwd();
        execSync("gulp compile", { cwd: currentWorkingDir });
    },
    "build-wechat-mp",
    "deploy",
]));
