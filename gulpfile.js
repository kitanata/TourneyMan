'use strict';

const gulp = require("gulp");
const del = require('del');
const sourcemaps = require("gulp-sourcemaps");
const babel = require("gulp-babel");
const less = require('gulp-less');
const concat = require("gulp-concat");
//var uglify = require("gulp-uglify");
const runSequence = require('run-sequence');
const spawn = require('child_process').spawn;
const Mocha = require('mocha');
const through = require('through2');

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

gulp.task('test', function() {
  require('babel-core/register');

  let mocha = new Mocha({
    reporter: 'nyan'
  });

  let unhandledRejectionExitCode = 0;

  process.on("unhandledRejection", (reason, promise) => {
    unhandledRejectionExitCode = 1;
    throw reason;
  });

  process.prependListener("exit", (code) => {
    if (code === 0) {
      process.exit(unhandledRejectionExitCode);
    }
  });

  return gulp
  .src([
    'spec/**/*_spec.js'
  ], {read: false})
  .pipe(through.obj((file, encoding, callback) => {
    callback(null, mocha.addFile(file.path));
  })).on('finish', () => {
    return mocha.run();
  });
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

gulp.task('default', function(done) {
  runSequence('clean', 'build', 'electron', done);
});
