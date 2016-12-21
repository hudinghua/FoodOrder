var gulp = require('gulp'),
	jshint = require('gulp-jshint'),
	sass = require('gulp-sass'),
	minifycss = require('gulp-minify-css'),
	//imagemin = require('gulp-imagemin'),
	//pngcrush = require('imagemin-pngcrush'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	autoprefix = require('gulp-autoprefixer'),
	rename = require('gulp-rename'),
	notify = require('gulp-notify');
	//spritesmith = require('gulp.spritesmith')

gulp.task('sass',function(){
	gulp.src(['./public/css/sass/*.scss','./public/css/sass/*/*.scss'])
		.pipe(sass({
			sourcemap: true
		}))
		.pipe(concat('fb.css'))
		.pipe(autoprefix({
			browsers: ['last 2 versions','Android >= 4.0']
		}))
		.pipe(gulp.dest('./public/css/'))
		.pipe(rename({basename: 'fb.min'}))
		.pipe(minifycss())
		.pipe(gulp.dest('./public/css/'))
		.pipe(notify({message:'sass task ok!'}));
});

gulp.task('jshint',function(){
	gulp.src(['./public/js/*.js','./public/js/*/*.js'])
		.pipe(jshint())
		.pipe(jshint.reporter('default'))
		.pipe(notify({message:'jshint task ok!'}));
});

gulp.task('build',function(){
	gulp.src('./public/js/app/*.js')
		.pipe(concat('appCtrl.js'))
		//.pipe(uglify())
		.pipe(gulp.dest('./public/build/js/app'));
	gulp.src('./public/js/floor/*.js')
		.pipe(concat('floor.js'))
		//.pipe(uglify())
		.pipe(gulp.dest('./public/build/js/floor'));
	gulp.src('./public/js/order/*.js')
		.pipe(concat('order.js'))
		//.pipe(uglify())
		.pipe(gulp.dest('./public/build/js/order'));
	
});
/*gulp.task('img',function(){
	gulp.src('./public/img/*.{gif,jpg,png,svg}')
		.pipe(imagemin())
		.pipe(spritesmith({
			imgName: 'sprite.png',
		    cssName: 'sprite.css'
		}))
		.pipe(gulp.dest('./public/build/images'))
		.pipe(notify({message:'img task ok!'}));
});*/

gulp.task('default',function(){
	gulp.run('sass','jshint','build');
	gulp.watch(['./public/css/sass/*.scss','./public/css/sass/*/*.scss'],function(){
		gulp.run('sass');
	});
	gulp.watch(['./public/js/*/*.js'],function(){
		gulp.run('jshint','build');
	});
});