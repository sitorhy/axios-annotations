const gulp = require("gulp");
const fs = require("fs");
const path = require("path");
const uglify = require("gulp-uglify");
const babel = require("gulp-babel");

const LIB_HOME = path.join("core");

function copyFile(location, targetSubDir) {
    const dir = path.dirname(location);
    const dest = [
        `main/client/src/${targetSubDir}/`.replace(/\\/g, "/")
    ];
    const index = dir.indexOf(targetSubDir);
    if (index >= 0) {
        const iDir = index + targetSubDir.length;
        const sub = dir.substring(iDir + 1);
        dest.forEach(i => {
            gulp.src(location, {
                base: dir
            }).pipe(gulp.dest(i + sub));
        });
    }
}

function deleteFile(location, targetSubDir) {
    const dest = [
        `main/client/src/${targetSubDir}/`.replace(/\\/g, "/")
    ];
    dest.forEach(i => {
        fs.unlink(i + location, function () {
            console.log(`unlink "${location}"`);
        });
    });
}

gulp.task("deploy", async () => {
    gulp.src(LIB_HOME + "/**/*.js", {
        base: LIB_HOME
    }).pipe(gulp.dest(`main/client/src/core/`));
});

gulp.task("dev", gulp.series(["deploy"], async () => {
    const libWatcher = gulp.watch(LIB_HOME);
    libWatcher.on("change", function (location, stats) {
        copyFile(location, "core");
    });

    libWatcher.on("add", function (location, stats) {
        copyFile(location, "core");
    });

    libWatcher.on("unlink", function (location, stats) {
        deleteFile(location, "core");
    });
}));

gulp.task("build", async () => {
    const miniprogram = "lib";
    if (!fs.existsSync("dist")) {
        fs.mkdirSync("dist");
    }
    const info = JSON.parse(fs.readFileSync("package.json"));
    const {
        name,
        version,
        repository,
        author,
        license,
        keywords
    } = info;

    ["lib/core", "lib/decorator", "lib/plugins", "lib/plugins/auth", "./"].forEach(dir => {
        gulp.src(`core/${dir}/*.js`)
            .pipe(babel({
                presets: ["@babel/env"],
                comments: false
            }))
            .pipe(uglify())
            .pipe(gulp.dest(`dist/${dir}`));
    });

    gulp.src("LICENSE")
        .pipe(gulp.dest("dist"));

    gulp.src("README.md")
        .pipe(gulp.dest("dist"));

    gulp.src("core/**/tsconfig.json")
        .pipe(gulp.dest(`dist`));

    ["lib/core", "lib/decorator", "lib/plugins", "lib/plugins/auth", "./"].forEach(dir => {
        gulp.src(`core/${dir}/*.d.ts`)
            .pipe(gulp.dest(`dist/${dir}`));
    });

    ["core", "decorator", "plugins", "plugins/auth", "./"].forEach(dir => {
        gulp.src(`core/${dir}/*.js`)
            .pipe(gulp.dest(`dist/${dir}`));
    });

    fs.writeFileSync("dist/package.json", JSON.stringify({
        name,
        version,
        repository,
        author,
        license,
        miniprogram,
        keywords
    }, null, 2), {
        flag: "w"
    });
});
