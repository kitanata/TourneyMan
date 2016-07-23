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
var KarmaServer = require('karma').Server;

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

let appFiles = [
    'app/index.html',
    'app/templates/*.html',
    'app/css/*.less',
    'app/css/*.css',
    'app/**/*.js',
    'spec/*.js',
];

gulp.task('watch', function () {
  // Reload renderer process
  livereload.listen();

  gulp.watch(appFiles, ['rebuild']);
});

gulp.task('watch_tests', function() {
});

gulp.task("vendorjs", function() {
  return gulp.src([
    "node_modules/pouchdb/dist/pouchdb.js",
    "node_modules/jquery/dist/jquery.js",
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
    .pipe(livereload());
});

gulp.task("html", function() {
  return gulp.src([
    "app/index.html",
    "app/templates/*.html",
  ]).pipe(concat("index.html"))
    .pipe(gulp.dest("dist"))
    .pipe(livereload())
});

gulp.task("styles", function() {
  return gulp.src([
      "vendor/css/*.css",
      "app/css/*.css"
    ])
    .pipe(concat("app.css"))
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

gulp.task('copy_tests', function() {
  return gulp.src([
    "spec/**",
    ])
    .pipe(gulp.dest("dist/spec"));
});

gulp.task('copy_helpers', function() {
  return gulp.src([
    "node_modules/jasmine-fixture/dist/jasmine-fixture.js",
    "node_modules/jasmine-jquery/lib/jasmine-jquery.js",
    "spec/helpers/*.js",
    ])
    .pipe(gulp.dest("dist/spec/helpers"));
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

gulp.task('jasmine', function(done) {
  new KarmaServer({
    configFile: __dirname + '/karma.conf.js',
    singleRun: true
  }, function() {
    done();
  }).start();
});

gulp.task('test_once', function(done) {
  runSequence('clean', 'build', 'copy_tests', 'copy_helpers', 'prep_fixtures', 'jasmine', done);
});

gulp.task('test', ['test_once'], function(done) {
  // Reload renderer process
  gulp.watch(appFiles, ['test_once']);
});

gulp.task('build', function(done) {
  runSequence(['vendorjs', 'javascript', "html", 'styles', 'copy_files'], done);
});

gulp.task('rebuild', function(done) {
  runSequence('clean', 'build', 'reload', done);
});

gulp.task('default', function(done) {
  runSequence('clean', 'build', 'test_once', 'electron', 'watch', done);
});
