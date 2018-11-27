var path = require('path');
global.appRoot = path.resolve(__dirname);
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}

var etcProd = path.resolve(__dirname, 'etc', 'prod');
var etcDev = path.resolve(__dirname, 'etc', 'dev');

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fileLog = require('./middleware/logging');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compass = require('node-compass');
var cmd = require('./cmd');

var index = require('./routes/index');

var app = express();
var themeName = 'string' == typeof process.env.UWOT_THEME ? process.env.UWOT_THEME : 'default';
app.set ('uwot_theme', themeName);
var themePath = path.join(global.appRoot, 'default' === themeName ? 'public' : themeName);

app.set(
	'exports',
	{
		UwotCmd: cmd
	}
);

// view engine setup
app.set('views', path.join(global.appRoot, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(themePath, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compass({ config_file: app.get('env') === 'development' ? path.resolve(etcDev, 'config.rb') : path.resolve(etcProd, 'config.rb')}));
app.use(express.static(path.join(global.appRoot, 'public')));

app.use(fileLog.error)

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
