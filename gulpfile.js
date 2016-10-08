'use strict';

var gulp = require("gulp");
var del = require('del');
var sourcemaps = require("gulp-sourcemaps");
var babel = require("gulp-babel");
var less = require('gulp-less');
var concat = require("gulp-concat");
//var uglify = require("gulp-uglify");
var runSequence = require('run-sequence');
var spawn = require('child_process').spawn;

gulp.task('electron', function(done) {
  // Start browser process
  var electron = spawn('electron', ['dist']);
  done();
});

let appFiles = [
    'app/index.html',
    'app/templates/*.html',
    'app/css/*.less',
    'app/css/*.css',
    'app/**/*.js',
    'spec/*.js',
];

gulp.task("vendorjs", function() {
  return gulp.src([
    "node_modules/es6-promise/dist/es6-promise.js",
    "node_modules/pouchdb/dist/pouchdb.js",
    "node_modules/jquery/dist/jquery.js",
    "node_modules/validate.js/validate.js",
    "node_modules/chance/dist/chance.min.js",
    "vendor/js/*.js",
    ])
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest("dist"));
});

gulp.task("javascript", function () {
  return gulp.src([
    "app/framework/*.js",
    "app/models/*.js",
    "app/views/*.js",
    "app/router.js",
    "app/app.js",
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("dist"))
});

gulp.task("html", function() {
  return gulp.src([
    "app/index.html",
    "app/templates/*.html",
  ]).pipe(concat("index.html"))
    .pipe(gulp.dest("dist"))
});

gulp.task("vendorcss", function() {
  return gulp.src([
    "vendor/css/*.css",
  ])
    .pipe(concat("vendor.css"))
    .pipe(gulp.dest("dist"))
});

gulp.task("styles", function() {
  return gulp.src([
    "app/css/*.less"
  ])
    .pipe(less())
    .pipe(concat("app.css"))
    .pipe(gulp.dest("dist"))
});

gulp.task('copy_files', function() {
  return gulp.src([
    "app/templates/index.html",
    "app/main.js",
    "app/assets/**/*",
    "package.json",
    ])
    .pipe(gulp.dest("dist"))
});

gulp.task('prep_fixtures', function() {
  return gulp.src([
    "app/templates/*.html",
    ])
    .pipe(gulp.dest("dist/spec/fixtures"));
});

gulp.task('clean', function() {
  return del([
    'dist/*',
  ]);
});

gulp.task('build', function(done) {
  runSequence(['vendorjs', 'javascript', "html", 'vendorcss', 'styles', 'copy_files'], done);
});

gulp.task('default', function(done) {
  runSequence('clean', 'build', 'electron', done);
});
