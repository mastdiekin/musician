var gulp         = require('gulp'),
	runSequence   = require('run-sequence'),
	webpack       = require('webpack'),
	gutil         = require('gulp-util' ),
	server        = require('browser-sync').create();
	util          = require('gulp-util');
	notify        = require('gulp-notify'),
	config        = require('./gulp/config');
	webpackConfig = require('./webpack.config').createConfig;
	sass         = require('gulp-sass'),
	concat       = require('gulp-concat'), //css-concat
	uglify       = require('gulp-uglifyjs'), //js-concat
	cssnano      = require('gulp-cssnano'), //css-min
	rename       = require('gulp-rename'),
	del          = require('del'),
	imagemin     = require('gulp-imagemin'),
	pngquant     = require('imagemin-pngquant'),
	cache        = require('gulp-cache'),
	consolidate  = require('gulp-consolidate'), //for iconfont-css || svg icons
	autoprefixer = require('gulp-autoprefixer'),
	browserify   = require('gulp-browserify'),
	notify       = require("gulp-notify"),
	gutil        = require('gulp-util' ),
	bourbon      = require('node-bourbon'),
	njkRender    = require('gulp-nunjucks-render'),
	postcss      = require('gulp-postcss'), //for sort media quaries
	mqpacker     = require('css-mqpacker'), //for sort media quaries
	svgmin       = require('gulp-svgmin'),
	svgstore     = require('gulp-svgstore'),
	Vinyl        = require('vinyl'),
	through2     = require('through2'),
	cheerio      = require('cheerio'),
	frontMatter  = require('gulp-front-matter'), //for nunjaks
	prettify     = require('gulp-prettify'),
	wait         = require('gulp-wait'),
	spritesmith  = require("gulp.spritesmith"),
	sourcemaps   = require('gulp-sourcemaps'),
	gulpif       = require('gulp-if'); //for spritesmith

var reportError = function (error) {
	var line = (error.line) ? 'LINE ' + error.line + ' -- ' : '';

	notify({
		title: 'Провал таска [' + error.plugin + ']',
		message: line + 'Посмотри консоль.',
		sound: 'Sosumi' // See: https://github.com/mikaelbr/node-notifier#all-notification-options-with-their-defaults
	}).write(error);

	gutil.beep();

	var report = '';
	var chalk = gutil.colors.white.bgRed;

	report += chalk('TASK:') + ' [' + error.plugin + ']\n';
	report += chalk('PROB:') + ' ' + error.message + '\n';
	if (error.line) { report += chalk('LINE:') + ' ' + error.line + '\n'; }
	if (error.fileName)   { report += chalk('FILE:') + ' ' + error.fileName + '\n'; }
	console.error(report);

	this.emit('end');
}

function isMax(mq) {
	return /max-width/.test(mq);
}

function isMin(mq) {
	return /min-width/.test(mq);
}

function sortMediaQueries(a, b) {
	A = a.replace(/\D/g, '');
	B = b.replace(/\D/g, '');

	if (isMax(a) && isMax(b)) {
		return B - A;
	} else if (isMin(a) && isMin(b)) {
		return A - B;
	} else if (isMax(a) && isMin(b)) {
		return 1;
	} else if (isMin(a) && isMax(b)) {
		return -1;
	}

	return 1;
}

gulp.task('sass', function(){
	return gulp.src(['app/sass/**/*.sass', '!app/sass/**/bootstrap-theme.sass', '!app/sass/lib/_bootstrap-variables.sass'])
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: config.production ? 'compact' : 'expanded',
			includePaths: require('node-bourbon').with('app/sass')
		}).on('error', reportError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(postcss([
			mqpacker({
				sort: sortMediaQueries
			})
		]).on('error', reportError))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('app/styles'))
		.pipe(server.reload({stream: true}));
});

gulp.task('bootstrap', function(){
	return gulp.src(['app/sass/**/bootstrap-theme.sass', 'app/sass/lib/_bootstrap-variables.sass'])
		.pipe(wait(50))
		.pipe(sass({
			outputStyle: 'expanded',
			includePaths: require('node-bourbon').with('app/sass')
		}).on('error', reportError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(postcss([
			mqpacker({
				sort: sortMediaQueries
			})
		]).on('error', reportError))
		.pipe(concat('bootstrap.css'))
		.pipe(cssnano({
			reduceIdents: false
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/styles/lib/'))
		.pipe(server.reload({stream: true}));
});

gulp.task('scss', function(){
	return gulp.src('app/sass/**/*.scss')
		.pipe(sourcemaps.init())
		.pipe(sass({
			outputStyle: 'expanded',
			includePaths: require('node-bourbon').with('app/sass')
		}).on('error', reportError))
		.pipe(autoprefixer(['last 15 versions', '> 1%', 'ie 8', 'ie 7'], { cascade: true }))
		.pipe(postcss([
			mqpacker({
				sort: sortMediaQueries
			})
		]).on('error', reportError))
		.pipe(server.reload({stream: true}))
		.pipe(sourcemaps.write('./maps'))
		.pipe(gulp.dest('app/styles'))
		.pipe(server.reload({stream: true}));
});

gulp.task('csslibs', function(){
	return gulp.src([
		'app/styles/style.css',
		])
		.pipe(concat('all.css'))
		.pipe(cssnano({
			reduceIdents: false
		}))
		.pipe(rename({suffix: '.min'}))
		.pipe(gulp.dest('app/styles'))
		.pipe(server.reload({stream: true}));
});

gulp.task('svg-icons', function () {
	return gulp
		.src('app/images/svg/*.svg')
		.pipe(svgmin())
		.pipe(svgstore({ 
			inlineSvg: false
		}))
		.pipe(through2.obj(function (file, encoding, cb) {
			var $ = cheerio.load(file.contents.toString(), {xmlMode: true});
			var data = $('svg > symbol').map(function () {
				var $this  = $(this);
				var size   = $this.attr('viewBox').split(' ').splice(2);
				var name   = $this.attr('id');
				var ratio  = size[0] / size[1]; // symbol width / symbol height
				var fill   = $this.find('[fill]:not([fill="currentColor"])').attr('fill');
				var stroke = $this.find('[stroke]').attr('stroke');
				return {
					name: name,
					ratio: +ratio.toFixed(2),
					fill: fill || 'initial',
					stroke: stroke || 'initial'
				};
			}).get();
			this.push(file);
			gulp.src('app/sass/helpers/generated/_sprite-svg.scss')
				.pipe(consolidate('lodash', {
					symbols: data
				}))
				.pipe(gulp.dest('app/sass/src/svg'));
			// var jsonFile = new Vinyl({
			//     path: 'metadata.json',
			//     contents: new Buffer(JSON.stringify(data))
			// });
			// this.push(jsonFile);
			cb();
		}))
		.pipe(rename({basename: 'sprite'}))
		.pipe(gulp.dest('app/images/svg/dest'));
});

gulp.task('sprite', function () {

	var spriteData = gulp.src('app/images/sprites/*.png').pipe(spritesmith({
		imgName: 'sprite.png',
		imgPath: '../images/sprite.png',
		cssName: '_sprites.sass'
	}));

	return spriteData.pipe(gulpif('*.png', gulp.dest('app/images'), gulp.dest('app/sass/helpers/generated')));
});

gulp.task('img', function() {
	return gulp.src(['app/images/**/*', '!app/images/**/*.gif', '!app/images/svg/**/**.**'])
		.pipe(cache(imagemin([
				// imagemin.gifsicle({interlaced: true}),
				imagemin.jpegtran({progressive: true}),
				imagemin.optipng(),
				imagemin.svgo([{removeViewBox: false}, {minifyStyles: false}])
				], {
					interlaced: true,
					progressive: true,
					use: [pngquant()],
					verbose: true
				}
		).on('error', reportError)))
		.pipe(gulp.dest('dist/images'));
});

// gulp.task('js', function() {
// 	return gulp.src('app/js/smoke.js')
// 		// .pipe(browserify({ debug: true })) //Если ошибка в скрипте, то не будет вылетать
// 		.pipe(uglify().on('error', onError))
// 		.pipe(rename({suffix: '.min'}))
// 		.pipe(gulp.dest('app/js/min'))
// 		.pipe(notify({ message: 'Custom scripts task complete', onLast: true }));
// });

gulp.task('nunjucks', function() {
	return gulp.src('app/pages/**/*.html')
		.pipe(frontMatter({ property: 'data' }).on('error', reportError))
		.pipe(njkRender({
				watch: false,
				trimBlocks: true,
				lstripBlocks: false
			}).on('error', reportError))
		.pipe(prettify({
			indent_size: 2,
			wrap_attributes: 'auto', // 'force'
			preserve_newlines: false,
			indent_char: ' ',
			// unformatted: [],
			end_with_newline: true
		}))
		.pipe(gulp.dest('app/'))
		.pipe(server.reload({stream: true}));
});

gulp.task('clean', function() {
	return del.sync('dist');
});

gulp.task('build-dists', function() {
	var buildGif = gulp.src([
		'app/images/**/**.**',
		])
	.pipe(gulp.dest('dist/images'))

	var buildCss = gulp.src([
		'app/styles/style.css',
		'app/styles/media.css',
		'app/styles/bootstrap.min.css',
		'app/styles/all.min.css'
		])
	.pipe(gulp.dest('dist/styles'))

	var buildAssets = gulp.src('app/assets/**/*')
	.pipe(gulp.dest('dist/assets'))

	var buildLibs = gulp.src('app/libs/**/*')
	.pipe(gulp.dest('dist/libs'))

	var buildVideo = gulp.src('app/video/**/*')
	.pipe(gulp.dest('dist/video'))

	var buildCssLib = gulp.src('app/styles/lib/**/*')
	.pipe(gulp.dest('dist/styles/lib'))

	var buildFonts = gulp.src('app/fonts/**/*')
	.pipe(gulp.dest('dist/fonts'))

	var buildJs = gulp.src('app/js/**/*')
	.pipe(gulp.dest('dist/js'))

	var buildHtml = gulp.src('app/*.html')
	.pipe(gulp.dest('dist'));
});

function build(cb) {
	runSequence(
		'sass',
		'nunjucks',
		'webpack',
		'build-dists',
		'img',
		cb
	);
}

gulp.task('build', ['clean'], function(cb) {
	config.setEnv('production');
	config.logEnv();
	build(cb);
});

gulp.task('build:dev', function(cb) {
	config.setEnv('development');
	config.logEnv();
	build(cb);
});

gulp.task('server', function() {
	server.init({
		server: {
			baseDir: !config.production ? [config.src.root] : config.dest.root,
			directory: false,
			serveStaticOptions: {
				extensions: ['html']
			}
		},
		// files: [
		//     config.src.html + '*.html',
		//     config.src.css + '*.css',
		//     config.src.img + '**/*'
		// ],
		port: util.env.port || 3000,
		logLevel: 'info', // 'debug', 'info', 'silent', 'warn'
		logConnections: false,
		logFileChanges: true,
		open: Boolean(util.env.open),
		notify: false,
		ghostMode: false,
		online: Boolean(util.env.tunnel),
		tunnel: util.env.tunnel || null
	});
});

module.exports = server;

function handler(err, stats, cb) {
	var errors = stats.compilation.errors;

	if (err) throw new gutil.PluginError('webpack', err);

	if (errors.length > 0) {
		notify.onError({
			title: 'Webpack Error',
			message: '<%= error.message %>',
			sound: 'Submarine'
		}).call(null, errors[0]);
	}

	gutil.log('[webpack]', stats.toString({
		colors: true,
		chunks: false
	}));

	server.reload();
	if (typeof cb === 'function') cb();
}

gulp.task('webpack', function(cb) {
	webpack(webpackConfig(config.env)).run(function(err, stats) {
		handler(err, stats, cb);
	});
});

gulp.task('webpack:watch', function() {
	webpack(webpackConfig(config.env)).watch({
		aggregateTimeout: 100,
		poll: false
	}, handler);
});

gulp.task('default', [
		'build:dev',
		'nunjucks',
		'watch',
		'sass',
		'bootstrap',
		'server',
	]);

gulp.task('watch', ['server', 'webpack:watch', 'svg-icons', 'csslibs'], function() {
		gulp.watch('app/pages/**/*.html', ['nunjucks']);
		gulp.watch('app/images/svg/*.svg', ['svg-icons', server.reload]);
		gulp.watch('app/images/sprites/*.png', ['sprite', server.reload]);
		gulp.watch(['app/sass/**/*.sass', '!app/sass/lib/bootstrap-theme.sass', '!app/sass/lib/_bootstrap-variables.sass'], ['sass']);
		gulp.watch(['app/sass/lib/bootstrap-theme.sass', 'app/sass/lib/_bootstrap-variables.sass'], ['bootstrap']);
		gulp.watch('app/sass/**/*.scss', ['scss', 'sass']);
		gulp.watch('app/*.html', server.reload);
});