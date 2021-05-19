// install
// npm i gulp-cache gulp-imagemin imagemin-pngquant imagemin-zopfli imagemin-mozjpeg imagemin-giflossy gulp-gm imagemin-pngcrush -f
// node node_modules/jpegtran-bin/lib/install.js
// node node_modules/gifsicle/lib/install.js
// node node_modules/zopflipng-bin/lib/install.js
// node node_modules/mozjpeg/lib/install.js
// node node_modules/giflossy/lib/install.js
// node node_modules/pngquant-bin/lib/install.js
var gulp = require('gulp');
var cache = require('gulp-cache');
var imagemin = require('gulp-imagemin');
var imageminPngquant = require('imagemin-pngquant');
var imageminPngcrush = require('imagemin-pngcrush');
var imageminZopfli = require('imagemin-zopfli');
var imageminMozjpeg = require('imagemin-mozjpeg'); //need to run 'brew install libpng'
var imageminGiflossy = require('imagemin-giflossy');
var imageResize = require('gulp-image-resize');

//compress all images

module.exports = function (gulp, config) {
    gulp.task('imagemin', gulp.parallel(imageminOptimize));

    function imageminOptimize() {
        return gulp.src([config.imgSRC])
    
            .pipe(cache(imagemin([
                //png
                imageminPngquant({
                    speed: 1,
                    quality: [0.6, 0.85], //lossy settings
                    strip: true,
                }),
                imageminPngcrush(),
                imageminZopfli({
                    more: true
                    // iterations: 50 // very slow but more effective
                }),
                //gif
                // imagemin.gifsicle({
                //     interlaced: true,
                //     optimizationLevel: 3
                // }),
                //gif very light lossy, use only one of gifsicle or Giflossy
                imageminGiflossy({
                    optimizationLevel: 3,
                    optimize: 3, //keep-empty: Preserve empty transparent frames
                    lossy: 2
                }),
                //svg
                imagemin.svgo({
                    plugins: [{
                        removeViewBox: false
                    }]
                }),
                //jpg lossless
                imagemin.jpegtran({
                    progressive: true
                }),
                //jpg very light lossy, use vs jpegtran
                imageminMozjpeg({
                    quality: 83
                }),
            ])))
            .pipe(gulp.dest(config.imgDST));
    }
};