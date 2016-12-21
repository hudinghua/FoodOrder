var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var session = require('express-session');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var ejs = require('ejs');

var configRouter = require('./routes/config');

var app = express();

// uncomment after placing your favicon in /public
app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
//数据解析器
app.use(bodyParser.json({limit: '50mb'}));
app.use(bodyParser.urlencoded({ extended: false }));
//cookie解析器
app.use(cookieParser());
//session
app.use(session({
    secret: new Date().getTime()+'',
    name: new Date().getTime()+'',
    cookie: {maxAge: 60000*60},
    resave: true,//每次请求后都重新计算时间
    saveUninitialized: true
}));

//静态文件目录
app.use(express.static(path.join(__dirname, 'public')));

//登录拦截器
/*app.use(function (req, res, next) {
  var url = req.originalUrl;
  if (url != "/login" && !req.session.userName) {
      res.render('exception');
      res.end();
  }
  next();
});*/

app.use('/', configRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    console.log(err.message);
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  console.log(err.message);
});


module.exports = app;

/** 未能try-catch Exception 处理 **/
process.on('uncaughtException', function(err){
    /** 打印错误 **/
    console.log(err);
    /** 打印错误堆栈 **/
    console.log(err.stack);
});
