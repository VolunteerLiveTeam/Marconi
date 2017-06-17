var gulp = require("gulp");
var babel = require("gulp-babel");
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var gutil = require('gutil');
var plumber = require('gulp-plumber');

gulp.task("default", function () {
    return gulp.task('build');
});


gulp.task("build", function () {
    return gulp.src("src/**/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist"));
});


gulp.task("watch", function () {
    return watch("src/*/**.js", {ignoreInitial: false})
        .on("change", function (file) {
            gulp.src(file)
                .pipe(plumber())
                .pipe(babel())
                .pipe(gulp.dest("dist"));

        });
});

gulp.task("buildwatch", function () {
    return runSequence([
        'build',
        'watch'
    ]);
});