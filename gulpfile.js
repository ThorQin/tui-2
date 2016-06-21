var gulp = require('gulp'),
	connect = require('gulp-connect'),
    less = require('gulp-less'),
    ts = require('gulp-typescript'),
    sourcemaps = require('gulp-sourcemaps'),
    autoprefixer = require('gulp-autoprefixer'),
    cssnano = require('gulp-cssnano'),
    uglify = require('gulp-uglify'),
    rename = require('gulp-rename'),
	async = require('async'),
	zip = require('gulp-zip'),
    rimraf = require('rimraf');

gulp.task('watch', function () {
	gulp.watch(['src/**/*.ts'], ['ts']);
	gulp.watch(['src/less/*.less'], ['less']);
});

var tsProject = ts.createProject('tsconfig.json', {
    typescript: require('typescript')
});

gulp.task('ts', function () {
	async.series([
		function (cb) {
			var tsResult = tsProject.src()
			.pipe(sourcemaps.init())
			.pipe(ts(tsProject));
			tsResult.js.pipe(sourcemaps.write('.', { sourceRoot: 'src' }))
			.pipe(gulp.dest('.'))
			.on('end', cb);
		},
		function (cb) {
			gulp.src('dist/tui2.js')
			.pipe(rename('tui2.min.js'))
			.pipe(uglify())
			.pipe(gulp.dest('dist'))
			.on('end', cb);
		},
		function (cb) {
			gulp.src('src/**/*.ts')
			.pipe(gulp.dest('dist/src'))
			.on('end', cb);;
		}
	]);
});

gulp.task('less', function () {
	async.series([
		function (cb) {
			gulp.src('src/less/tui2.less')
			.pipe(sourcemaps.init())
			.pipe(less())
			.pipe(autoprefixer({browsers: ["last 2 versions", "ie >= 8"]}))
			.pipe(cssnano({ safe:true }))
			.pipe(sourcemaps.write('.', { sourceRoot: '../src/less' }))
			.pipe(gulp.dest('dist/css'))
			.on('end', cb);
		},
		function (cb) {
			gulp.src('src/less/*.less')
			.pipe(gulp.dest('dist/src/less'))
			.on('end', cb);
		}
	]);
});

gulp.task('clean', function (cb) {
	rimraf('dist', cb);
});

// START A SERVER TO DEBUG
gulp.task('run', ['ts', 'less', 'watch'], function () {
	connect.server({
		root: ['test', 'dist', 'depends'],
		port: 8000,
		livereload: false
	});
});

// DO PACKAGE
gulp.task('package', ['ts', 'less'], function (cb) {
	async.series([
		function (cb) {
			gulp.src('depends/**')
			.pipe(gulp.dest('dist/depends'))
			.on('end', cb);
		}, 
		function (cb) {
			gulp.src('lang/**')
			.pipe(gulp.dest('dist'))
			.on('end', cb);
		}, 
		function (cb) {
			gulp.src('dist/**')
			.pipe(zip('tui2.zip'))
			.pipe(gulp.dest('dist'))
			.on('end', function(){
				rimraf('dist/depends', cb);
			});;
		}
	]);
});


gulp.task('default', ['ts', 'less']);
