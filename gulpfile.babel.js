var gulp = require("gulp");
var babel = require("gulp-babel");
var watch = require('gulp-watch');
var runSequence = require('run-sequence');
var gutil = require('gutil');

gulp.task("default", function () {
    return gulp.task('build');
});


gulp.task("build", function () {
    return gulp.src("src/*.js")
        .pipe(babel())
        .pipe(gulp.dest("dist"));
});


gulp.task("watch", function () {
    return watch("src/*.js", {ignoreInitial: false})
        .on("change", function (file) {
            var b = babel().on('error', e => {
                gutil.log(e);
                b.end();
            });

            gulp.src(file)
                .pipe(b)
                .pipe(gulp.dest("dist"));

        });
});