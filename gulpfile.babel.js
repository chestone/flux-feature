import del from 'del';
import gulp from 'gulp';
import {Server} from 'karma';
import uglify from 'gulp-uglify';
import webpack from 'webpack-stream';
import karmaConfig from './config/karma-config';
import webpackConfig from './config/webpack-config';

const buildDir = './dist';
const libDir = './lib';

function addbase(...args) {
  const base = [process.cwd()];
  const allArgs = [...base, ...args];
  return allArgs.join('');
}

gulp.task('clean', function() {
  return del([buildDir]);
});

gulp.task('uglify', function() {
  return gulp.src(addbase('lib/inline.js'))
    .pipe(uglify())
    .pipe(gulp.dest(buildDir));
});

gulp.task('karma', function(cb) {
  const server = new Server(karmaConfig, (code) => {
    if (cb) {
      /**
       * call the gulp `cb` only once
       */
      const gulpCb = cb;
      cb = null;
      gulpCb();
      process.exit(code);
    }
  });

  server.start();
});

gulp.task('webpack', function() {
  return gulp.src(libDir)
    .pipe(webpack(webpackConfig))
    .pipe(gulp.dest(buildDir));
});

gulp.task('build', ['clean', 'uglify', 'webpack']);
gulp.task('test', ['karma']);
gulp.task('default', ['build']);
