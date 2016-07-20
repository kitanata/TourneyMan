'use strict';

var gulp = require("gulp");
var del = require('del');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
//var uglify = require("gulp-uglify");
var runSequence = require('run-sequence');
var livereload = require('gulp-livereload');
var spawn = require('child_process').spawn;

gulp.task('electron', function(done) {
  // Start browser process
  var electron = spawn('electron', ['dist']);
  done();

  /*electron.stdout.on('data', (data) => {
    grep.stdin.write(data);
  });

  electron.stderr.on('data', (data) => {
    console.log(`ps stderr: ${data}`);
  });

  electron.on('close', (code) => {
    if (code !== 0) {
      console.log(`ps process exited with code ${code}`);
    }
    grep.stdin.end();
  });*/
});

gulp.task('reload', function() {
  // Reload Electron
  //electron.reload();
});

gulp.task('restart', function() {
  //electron.restart();
});

gulp.task('watch', function () {
  // Reload renderer process
  livereload.listen();

  gulp.watch([
      'app/templates/*.html',
      'app/css/*.less',
      'app/css/*.css',
      'app/**/*.js',
  ], ['rebuild']);
});

gulp.task("vendorjs", function() {
  return gulp.src([ 
      "node_modules/jquery/dist/jquery.js",
      "node_modules/underscore/underscore.js",
      "node_modules/backbone/backbone.js",
    ])
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("buildjs", function () {
  return gulp.src([
    "app/namespace.js",
    "app/router.js",
    "app/models/*.js",
    "app/collections/*.js",
    "app/views/*.js",
    "app/app.js"
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"))
    .pipe(livereload());
});

gulp.task("styles", function() {
  return gulp.src(["app/css/*.css"])
    .pipe(concat("all.css"))
    .pipe(gulp.dest("dist"))
    .pipe(livereload());
});

gulp.task('copy_files', function() {
  return gulp.src([
    "app/templates/index.html",
    "app/main.js",
    "package.json",
    ])
    .pipe(gulp.dest("dist"))
    .pipe(livereload());
});

gulp.task('clean', function() {
  return del([
    'dist/*',
  ]);
});

gulp.task('build', function(done) {
  runSequence('clean', ['vendorjs', 'buildjs', 'styles', 'copy_files'], done);
});

gulp.task('rebuild', function(done) {
  runSequence('clean', 'build', 'reload', done);
});

gulp.task('default', function(done) {
  runSequence('build', 'electron', 'watch', done);
});
