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
const webpack = require('webpack-stream');

gulp.task('electron', function(done) {
  // Start browser process
  var electron = spawn('electron', ['build']);
  done();
});

let appFiles = [
    'src/app/index.html',
    'src/app/templates/*.html',
    'src/app/css/*.less',
    'src/app/css/*.css',
    'src/app/**/*.js',
    'spec/*.js',
];

/*gulp.task("vendorjs", function() {
  return gulp.src('src/vendor.js')
    .pipe(webpack())
    .pipe(gulp.dest('build/vendor.js'));
});*/

gulp.task("js", function () {
  return gulp.src('src/app/app.js')
    .pipe(webpack({
      target: 'web',
      devtool: 'source-map',
      output: {
        filename: 'app.js',
      },
    }
    ))
    .pipe(gulp.dest('build'));
});

gulp.task("html", function() {
  return gulp.src([
    "src/app/index.html",
    "src/app/templates/**/*.html",
  ]).pipe(concat("index.html"))
    .pipe(gulp.dest("build"))
});

gulp.task("vendorcss", function() {
  return gulp.src([
    "src/vendor/css/*.css",
  ])
    .pipe(concat("vendor.css"))
    .pipe(gulp.dest("build"))
});

gulp.task("vendorfonts", function() {
  return gulp.src([
    "src/vendor/fonts/*",
  ]).pipe(gulp.dest("build/fonts"))
});

gulp.task("styles", function() {
  return gulp.src([
    "src/app/css/*.less"
  ])
    .pipe(less())
    .pipe(concat("app.css"))
    .pipe(gulp.dest("build"))
});

gulp.task('copy_files', function() {
  return gulp.src([
    "src/app/templates/index.html",
    "src/app/main.js",
    "src/app/assets/**/*",
    "src/app/package.json",
    "icon.icns"
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
    "src/app/templates/*.html",
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
  ],{read: false})
  .pipe(through.obj((file, encoding, callback) => {
    callback(null, mocha.addFile(file.path));
  })).on('finish', () => {
    return mocha.run();
  });
});

gulp.task('clean', function() {
  return del([
    'build',
  ]);
});

gulp.task('build', function(done) {
  runSequence(['js', "html", 'vendorcss', "vendorfonts", 'styles', 'copy_files'], done);
});

gulp.task('default', function(done) {
  runSequence('clean', 'build', 'electron', done);
});
