var path = require('path');
global.appRoot = path.resolve(__dirname);
if ('function' != typeof global.tryParseJSON) {

	global.tryParseJSON = function tryParseJSON(jsonString) {

		try {

			var jsonObj = JSON.parse(jsonString);
			if (jsonObj && typeof jsonObj === "object") {

				return jsonObj;

			}

		}
		catch (e) { }
		return false;

	};

}
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}
global.UwotCliOps = [
	"clear",
	"history"
];

var etcProd = path.resolve(__dirname, 'etc', 'prod');
var etcDev = path.resolve(__dirname, 'etc', 'dev');

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var fileLog = require('./middleware/logging');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compass = require('node-compass');
var uwotconfig = require('./config');
var cmd = require('./cmd');

var index = require('./routes/index');

var app = express();

var configPath = app.get('env') === 'development' ? path.resolve(etcDev, 'config.json') : path.resolve(etcProd, 'config.json');
global.UwotConfig = new uwotconfig(configPath);

var themeName = 'string' == typeof process.env.UWOT_THEME ? process.env.UWOT_THEME : global.UwotConfig.get('themes', 'defaultTheme');
app.set ('uwot_theme', themeName);
var themePath = path.join(global.appRoot, 'default' === themeName ? 'public' : themeName);

app.set(
	'exports',
	{
		UwotCmd: cmd
	}
);

// create reserved command list from ops
global.UwotReserved = Array.from(global.UwotCliOps);"#333663"
// need to load bins from paths
// load locals if enabled
if (global.UwotConfig.get('binpath', 'useLocal')) {

	var localBinPath = path.resolve(global.appRoot, 'routes/bin');
	var localBinStats = fs.statSync(localBinPath);
	if (localBinStats.isDirectory()) {
	
		var localFileList = fs.readdirSync(localBinPath);
		var localBinFiles = [];
		var localFileLength = localFileList.length;
		for (let i = 0; i < localFileLength; i++) {
	
			if (localFileList[i].endsWith('.js')) {
		
				global.UwotBin[path.parse(localFileList[i]).name] = require(path.resolve(localBinPath, localFileList[i]));
		
			}
	
		}

	}

}

// then add to reserved list
global.UwotReserved.push(...Object.keys(global.UwotBin));


// view engine setup
app.set('views', path.join(global.appRoot, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(themePath, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compass({ config_file: app.get('env') === 'development' ? path.resolve(etcDev, 'config.rb') : path.resolve(etcProd, 'config.rb')}));

if (app.get('env') === 'development') {
	app.use(fileLog.info);
}

app.use(express.static(path.join(global.appRoot, 'public')));

app.use('/', index);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

app.use(fileLog.error);

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
