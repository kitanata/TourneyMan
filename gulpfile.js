'use strict';

var gulp = require("gulp");
var del = require('del');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
//var uglify = require("gulp-uglify");
var runSequence = require('run-sequence');

var electron = require('electron-connect').server.create({
  'verbose': true,
});

gulp.task('electron', function() {
  // Start browser process
  electron.start();
});

gulp.task('reload', function() {
  // Reload Electron
  electron.reload();
});

gulp.task('restart', function() {
  electron.restart();
});

gulp.task('watch', function () {
  // Reload renderer process
  gulp.watch([
      'index.html',
      'app/**/*.js',
      'static/**/*'
  ], ['build', 'reload']);
});

gulp.task("vendorjs", function() {
  return gulp.src([
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
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"));
});

gulp.task("styles", function() {
  return gulp.src(["app/css/*.css"])
    .pipe(concat("all.css"))
    .pipe(gulp.dest("dist"));
});

gulp.task('copy_index', function() {
  return gulp.src("index.html")
    .pipe(gulp.dest("dist"));
});

gulp.task('clean', function() {
  return del([
    'dist/*',
  ]);
});

gulp.task('build', function() {
  return runSequence('clean', 'vendorjs', 'buildjs', 'styles', 'copy_index');
});

gulp.task('default', ['build', 'electron', 'watch']);
