var gulp = require('gulp');
var gulpsync = require('gulp-sync')(gulp);
/* https://github.com/zont/gulp-usemin */
var usemin = require('gulp-usemin');
var uglify = require('gulp-uglify');
var htmlmin = require('gulp-htmlmin');
//var minifyCss = require('gulp-minify-css');
var cssnano = require('gulp-cssnano');
var rev = require('gulp-rev');
var gulpCopy = require('gulp-copy');
var imagemin = require('gulp-imagemin');
//var pngquant = require('imagemin-pngquant');
var ngAnnotate = require('gulp-ng-annotate');
var jsonminify = require('gulp-jsonminify');
var del = require('del');
var Q = require('q');
// https://www.npmjs.com/package/gulp-replace
var replace = require('gulp-replace');
// https://www.npmjs.com/package/gulp-concat
var concat = require('gulp-concat');
// https://www.npmjs.com/package/gulp-rename
var rename = require('gulp-rename');
var merge = require('merge-stream');
var connect = require('gulp-connect');
// https://github.com/laxa1986/gulp-angular-embed-templates
var embedTemplates = require('gulp-angular-embed-templates');


var source = __dirname + '/';
var output = __dirname + '/build/';
var paths = [];

// Dockblock
gulp.task('usemin', function() {
    return gulp.src([source + 'index.html'])
    .pipe(usemin({
        css: [ cssnano({discardComments: {removeAll: true}}), rename({ suffix: '.min' }) ],
        dnschecker: [ embedTemplates(), uglify(), rename({ suffix: '.min' }) ],
    }))
    .pipe( gulp.dest( output ) );
});

// 
gulp.task('usemin2', function() {
    return gulp.src([source + 'index.html'])
    .pipe(usemin({
        css: [],
        dnschecker: [embedTemplates()],
    }))
    .pipe( gulp.dest( output ) );
});


// Removes all compiled build files
gulp.task('clean', function() {
    return del(output + '**/*', {dot: true, force: true});
});


// Global production script 
gulp.task('build', gulpsync.sync([
    'usemin', 
    'usemin2'
]));





// server tasks
gulp.task('connect', function() {
  connect.server({
    // root: 'build',
    index: 'demo/index.html',
    port: 8000,
    livereload: true,
  });
});

gulp.task('html', function () {
  gulp.src('./build/*.html')
    .pipe(connect.reload());
});

gulp.task('watch', function () {
    gulp.watch(['./build/*.html'], ['html']);
});

gulp.task('default', ['connect', 'watch']);