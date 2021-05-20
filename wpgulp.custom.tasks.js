/**jshint esversion: 6 */ 

// install
// npm install --save-dev gulp-cache gulp-imagemin imagemin-pngquant imagemin-pngcrush imagemin-zopfli imagemin-mozjpeg imagemin-giflossy gulp-image-resize
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
const webp = require('gulp-webp');

// CSS related plugins.
const remember = require( 'gulp-remember' ); //  Adds all the files it has ever seen back into the stream.
const plumber = require( 'gulp-plumber' ); // Prevent pipe breaking caused by errors from gulp plugins.

// Utility related plugins.
const rename = require( 'gulp-rename' ); // Renames files E.g. style.css -> style.min.css.
const lineec = require( 'gulp-line-ending-corrector' ); // Consistent Line Endings for non UNIX systems. Gulp Plugin for Line Ending Corrector (A utility that makes sure your files have consistent line endings).
const filter = require( 'gulp-filter' ); // Enables you to work on a subset of the original files by filtering them using a glob.
const sourcemaps = require( 'gulp-sourcemaps' ); // Maps code in a compressed file (E.g. style.css) back to it’s original position in a source file (E.g. structure.scss, which was later combined with other css files to generate style.css).
const notify = require( 'gulp-notify' ); // Sends message notification to you.
const browserSync = require( 'browser-sync' ).create(); // Reloads browser and injects CSS. Time-saving synchronized browser testing.
const wpPot = require( 'gulp-wp-pot' ); // For generating the .pot file.
const sort = require( 'gulp-sort' ); // Recommended to prevent unnecessary changes in pot-file.
const beep = require( 'beepbeep' );

const errorHandler = r => {
	notify.onError( '\n\n❌  ===> ERROR: <%= error.message %>\n' )( r );
	beep();

	// this.emit('end');
};

//compress all images

module.exports = customTasks;

function customTasks(config) {
	gulp.task('imagemin', gulp.parallel(imageminOptimize));
	gulp.task('webp', gulp.parallel(convertToWebP));
	gulp.task('compressWebp', gulp.parallel(convertToWebP));

	function imageminOptimize() {
		return gulp.src([config.imgSRC])
			.pipe(cache(imagemin([
				//png
				imageminPngquant({
					speed: 1,
					quality: [0.7, 0.9], //lossy settings
					strip: true,
					floyd: 1,
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
			.pipe(gulp.dest(config.imgDST))
			.pipe( notify({ message: '\n\n✅  ===> IMAGEMIN — completed!\n', onLast: true }) );
	}

	function convertToWebP() {
		return gulp.src([config.imgSRC])
			.pipe(webp({method: 6}))
			.pipe(gulp.dest(config.imgDST))
			.pipe(notify({ message: '\n\n✅  ===> CONVERT TO WEBP — completed!\n', onLast: true }));
	}
	
	function compressThenConvertWebp() {
		return gulp.src([config.imgSRC])
			.pipe(cache(imagemin([
				//png
				imageminPngquant({
					speed: 1,
					quality: [0.7, 0.9], //lossy settings
					strip: true,
					floyd: 1,
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
			.pipe(webp({method: 6}))
			.pipe(gulp.dest(config.imgDST))
			.pipe(notify({ message: '\n\n✅  ===> CONVERT TO WEBP — completed!\n', onLast: true }));
	}
}