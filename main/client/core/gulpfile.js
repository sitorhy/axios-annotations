import gulp from "gulp";
import gulpTypescript from "gulp-typescript";

gulp.task("build", async () => {
    gulp.src("./src/**/*.ts").pipe(gulpTypescript({
        target: "es5",
        declaration: true,
        lib: ["DOM", "ESNext"],
        outDir: "./dist"
    })).pipe(gulp.dest("./dist/"));
});
