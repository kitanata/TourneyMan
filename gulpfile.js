'use strict';

var gulp = require("gulp");
var del = require('del');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var concat = require("gulp-concat");
//var uglify = require("gulp-uglify");

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
    "node_modules/core-js/client/shim.min.js",
    "node_modules/zone.js/dist/zone.js",
    "node_modules/reflect-metadata/Reflect.js",
    "node_modules/rxjs/bundles/Rx.umd.js",
    "node_modules/@angular/core/bundles/core.umd.js",
    "node_modules/@angular/common/bundles/common.umd.js",
    "node_modules/@angular/compiler/bundles/compiler.umd.js",
    "node_modules/@angular/platform-browser/bundles/platform-browser.umd.js",
    "node_modules/@angular/platform-browser-dynamic/bundles/platform-browser-dynamic.umd.js"
    ])
    .pipe(concat("angular2.min.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("buildjs", function () {
  return gulp.src([
    "app/**/*.js",
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("all.js"))
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

gulp.task('build', ['clean', 'vendorjs', 'buildjs', 'styles', 'copy_index']);

gulp.task('default', ['build', 'electron', 'watch']);
