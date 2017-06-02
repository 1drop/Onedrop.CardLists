'use strict';

/* global require */

/* Needed gulp config */
const gulp = require('gulp');
const babel = require('gulp-babel');
const babelEnv = require('babel-preset-env');
const debug = require('gulp-debug');
const sass = require('gulp-sass');
const gulpStylelint = require('gulp-stylelint');
const cssnano = require('cssnano');
const autoprefixer = require('autoprefixer');
const uglify = require('gulp-uglify');
const rename = require('gulp-rename');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const plumber = require('gulp-plumber');
const pixrem = require('pixrem');
const postcss = require('gulp-postcss');
const eslint = require('gulp-eslint');

/*
 * Setup paths, cwd inside docker is /app/
 */
const paths = {
    watch_dir:   '.',
    sass_dir:    './Resources/Private/Scss/',
    js_dir:      './Resources/Private/JavaScript/',
    dist: {
        scripts: './Resources/Public/JavaScript/',
        styles:  './Resources/Public/Styles/'
    }
};

gulp.task('lint', function() {
    return gulp.src([paths.js_dir + '**/*.js','!node_modules/**'])
        .pipe(eslint())
        .pipe(eslint.format())
        .pipe(eslint.failAfterError());
});

/* Scripts task */
gulp.task('scripts', ['lint'], function() {
    return gulp.src(paths.js_dir + '*.js')
        .pipe(debug({title: 'Source JS files'}))
        .pipe(sourcemaps.init())
        .pipe(concat('main.js'))
        .pipe(babel({
            presets: [[babelEnv, {
                targets: {
                    browsers: ['safari >= 7', 'ie > 9', 'last 2 versions'],
                    uglify: true
                },
                modules: false,
                loose: true
            }]]
        }))
        .pipe(uglify())
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.scripts));
});

/* Sass linting */
gulp.task('lint-sass', function() {
    return gulp
        .src(paths.sass_dir + '*.scss')
        .pipe(gulpStylelint({
            reporters: [
                {formatter: 'string', console: true}
            ]
        }));
});

/* Sass task */
gulp.task('sass', ['lint-sass'], function () {
    gulp.src(paths.sass_dir + '*.scss')
        .pipe(sourcemaps.init())
        .pipe(plumber())
        .pipe(sass())
        .pipe(postcss([
            autoprefixer({browsers: ['last 2 version']}),
            cssnano({safe: true}),
            pixrem
        ]))
        .pipe(sourcemaps.write('.'))
        .pipe(gulp.dest(paths.dist.styles))
});

gulp.task('build', ['sass', 'scripts']);

/* Watch scss, js and html files, doing different things with each. */
gulp.task('default', ['sass', 'scripts'], function () {
    /* Watch scss, run the sass task on change. */
    gulp.watch([paths.sass_dir + '**/*'], ['sass']);
    /* Watch app.js file, run the scripts task on change. */
    gulp.watch([paths.js_dir + '**/*.js'], ['scripts']);
});
