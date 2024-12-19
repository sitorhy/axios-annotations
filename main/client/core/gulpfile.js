import gulp from "gulp";
import gulpTypescript from "gulp-typescript";
import filter from "gulp-filter";
import swc from "gulp-swc";
import * as fs from "node:fs";

// Any options to configure swc: https://swc.rs/docs/configuring-swc
const swcOptions = {
    env: {
        targets: "dead",
        // mode: "usage",
        // coreJs: "3.39.0"
    }
};

gulp.task("compile", async function () {
    if (!fs.existsSync("./dist")) {
        fs.mkdirSync("./dist");
    }

    const entries = gulp.src("./src/**/*.ts").pipe(gulpTypescript({
        target: "es5",
        declaration: true,
        lib: ["DOM", "ESNext"],
        outDir: "./dist"
    }));

    entries.pipe(filter(["**/*.d.ts"])).pipe(gulp.dest("./dist"));
    entries.pipe(filter(["**/*.js", "!**/*.d.ts"])).pipe(swc(swcOptions)).pipe(gulp.dest("./dist"));
});

gulp.task("deploy", async function () {
    gulp.src("./dist/**/*").pipe(gulp.dest("../release"));
    gulp.src("../../../README.md").pipe(gulp.dest("../release"));
    gulp.src("../../../LICENSE").pipe(gulp.dest("../release"));
});

gulp.task("build", gulp.series(["compile", "deploy"]));
