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
var KarmaServer = require('karma').Server;

gulp.task('electron', function(done) {
  // Start browser process
  var electron = spawn('electron', ['build']);
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
    "node_modules/validate.js/validate.js",
    "node_modules/chance/dist/chance.min.js",
    "node_modules/fuzzy/lib/fuzzy.js",
    "node_modules/numeral/numeral.js",
    "node_modules/pouchdb/dist/pouchdb.js",
    "node_modules/pouchdb/dist/pouchdb.find.js",
    "vendor/js/lodash.js",
    "vendor/js/moment.js",
    "vendor/js/sightglass.js",
    "vendor/js/rivets.js",
    "vendor/js/jquery.js",
    "vendor/js/what-input.js",
    "vendor/js/foundation.js",
    "vendor/js/backbone.js",
    "vendor/js/joint.js",
    "vendor/js/join.shapes.devs.js"
    ])
    .pipe(concat("vendor.js"))
    .pipe(gulp.dest("build"));
});

gulp.task("javascript", function () {
  return gulp.src([
    "app/framework/*.js",
    "app/models/*.js",
    "app/views/**/*.js",
    "app/router.js",
    "app/app.js",
    ])
    .pipe(sourcemaps.init())
    .pipe(babel())
    .pipe(concat("app.js"))
    .pipe(sourcemaps.write("."))
    .pipe(gulp.dest("build"))
});

gulp.task("html", function() {
  return gulp.src([
    "app/index.html",
    "app/templates/**/*.html",
  ]).pipe(concat("index.html"))
    .pipe(gulp.dest("build"))
});

gulp.task("vendorcss", function() {
  return gulp.src([
    "vendor/css/*.css",
  ])
    .pipe(concat("vendor.css"))
    .pipe(gulp.dest("build"))
});

gulp.task("vendorfonts", function() {
  return gulp.src([
    "vendor/fonts/*",
  ]).pipe(gulp.dest("build/fonts"))
});

gulp.task("styles", function() {
  return gulp.src([
    "app/css/*.less"
  ])
    .pipe(less())
    .pipe(concat("app.css"))
    .pipe(gulp.dest("build"))
});

gulp.task('copy_files', function() {
  return gulp.src([
    "app/templates/index.html",
    "app/main.js",
    "app/assets/**/*",
    "app/package.json"
    ])
    .pipe(gulp.dest("build"))
});

gulp.task('copy_package_files', function() {
  return gulp.src([
    "icon.ico",
    "icon.icns",
    "background.png"
    ])
    .pipe(gulp.dest("build/build"))
});

gulp.task('prep_fixtures', function() {
  return gulp.src([
    "app/templates/*.html",
    ])
    .pipe(gulp.dest("build/spec/fixtures"));
});

gulp.task('clean', function() {
  return del([
    'build',
    'dist'
  ]);
});

gulp.task('build', function(done) {
  runSequence(['vendorjs', 'javascript', "html", 'vendorcss', "vendorfonts", 'styles', 'copy_files'], done);
});

gulp.task('test', function(done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js'
  }, done).start();
});

gulp.task('default', function(done) {
  runSequence('clean', 'build', 'electron', done);
});
