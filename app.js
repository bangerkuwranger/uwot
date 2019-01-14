var path = require('path');
const globalSetupHelper = require('./helpers/globalSetup');

// global.appRoot = path.resolve(__dirname);

// if ('function' != typeof global.tryParseJSON) {
// 
// 	global.tryParseJSON = function tryParseJSON(jsonString) {
// 
// 		try {
// 
// 			var jsonObj = JSON.parse(jsonString);
// 			if (jsonObj && typeof jsonObj === "object") {
// 
// 				return jsonObj;
// 
// 			}
// 
// 		}
// 		catch (e) { }
// 		return false;
// 
// 	};
// 
// }
// if ('undefined' == typeof global.UwotBin) {
// 	global.UwotBin = {};
// }
// if ('undefined' == typeof global.UwotThemes) {
// 	global.UwotThemes = {};
// }
// global.UwotCliOps = [
// 	"clear",
// 	"history",
// 	"echo",
// 	"login",
// 	"logout",
// 	"exit"
// ];
// global.UwotVersion = require('./package.json').version;
// var isPre = global.UwotVersion.indexOf('-');
// if (-1 !== isPre) {
// 
// 	var preVersion = global.UwotVersion.substring(isPre+1);
// 	global.UwotVersion = global.UwotVersion.substring(0, isPre);
// 	if (preVersion.indexOf('alpha') !== -1) {
// 	
// 		global.UwotVersion += 'a';
// 	
// 	}
// 	else if (preVersion.indexOf('beta') !== -1) {
// 	
// 		global.UwotVersion += 'b';
// 	
// 	}
// 	
// }
// 
// const sessionHours = 12;
// 
// var etcProd = path.resolve(__dirname, 'etc', 'prod');
// var etcDev = path.resolve(__dirname, 'etc', 'dev');

globalSetupHelper.initConstants();

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fs = require('fs');
var fileLog = require('./middleware/logging');
var session = require('express-session');
var nedbSessionStore = require('nedb-session-store')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var compass = require('node-compass');
// var uwotconfig = require('./config');
// var uwotusers = require('./users');
// var cmd = require('./cmd');
// var binLoader = require('./helpers/binLoader');
// var themeLoader = require('./helpers/themeLoader');

var index = require('./routes/index');

var app = express();

// var configPath = app.get('env') === 'development' ? path.resolve(etcDev, 'config.json') : path.resolve(etcProd, 'config.json');
// global.UwotConfig = new uwotconfig(configPath);
// global.UwotUsers = new uwotusers();

globalSetupHelper.initEnvironment();

// load local themes if enabled
// if (global.UwotConfig.get('themes', 'useLocal')) {
// 
// 	themeLoader.loadLocalPath();
// 
// }

// app.set(
// 	'exports',
// 	{
// 		UwotCmd: cmd
// 	}
// );

globalSetupHelper.initExports();

globalSetupHelper.initThemes();

var currentThemeName = 'string' == typeof process.env.UWOT_THEME ? process.env.UWOT_THEME : global.Uwot.Config.get('themes', 'defaultTheme');
app.set ('uwot_theme', currentThemeName);
var themePath = path.join(global.Uwot.Constants.appRoot, 'default' === currentThemeName ? 'public' : currentThemeName);



// create reserved command list from ops
// global.UwotReserved = Array.from(global.UwotCliOps);


// add sudo. it's special.
global.Uwot.Constants.Reserved.push('sudo');
global.Uwot.Bin.sudo = {
	command: {
		name: 'sudo',
		description: 'Allows user to run commands with elevated privileges.',
		requiredArguments: [],
		optionalArguments: []
	},
	options: [],
	path: global.Uwot.Constants.appRoot,
	execute: function execute(args, options, callback, isSudo) {
	
		return callback(
			false,
			{
				content: ['sudo what? sudo please...'],
				color: 'magenta'
			}
		);
	
	},
	help: function help(cb) {
	
		return cb(false, 'sudo <command>' + "\r\n" + 'Either you can or you can\'t. There is no "maybe" in sudo.');
	
	},
	matchOpt: function matchOpt(opt) {
	
		return {
			name: '',
			isOpt: false,
			isLong: false,
			isDefined: false,
			hasArgs: false,
			reqArgs: [],
			optArgs: [],
			assignedArg: ''
		};
	
	}
};
// need to load bins from paths
// load locals if enabled
// if (global.UwotConfig.get('binpath', 'useLocal')) {
// 
// 	binLoader.loadLocalPath();
// 
// }

// TBD
// load externals if enabled

// then add to reserved list
// global.UwotReserved.push(...Object.keys(global.UwotBin));
globalSetupHelper.initBins();


// set up sessions
const sessionMs = global.Uwot.Constants.sessionHours * 3600000;
var sessionArgs = {
	cookie: {
		sameSite: true,
		secure: true,
		maxAge: sessionMs,		
		httpOnly: false
	},
	resave: false,
	saveUninitialized: false,
	name: 'session',
	proxy: true,
	secret: 'thq_uwot'
}
if ("development" === global.process.env.NODE_ENV) {

	sessionArgs.cookie.secure = false; // serve secure cookies in prod only
	sessionArgs.proxy = false;
	sessionArgs.cookie.sameSite = false;

}
else {

	app.set('trust proxy', 1);

}
sessionArgs.store = new nedbSessionStore({
	filename: global.Uwot.Constants.appRoot + '/var/nedb/session.db'
});
app.use(session(sessionArgs));

// view engine setup
app.set('views', path.join(global.Uwot.Constants.appRoot, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(themePath, 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(compass({ config_file: app.get('env') === 'development' ? path.resolve(global.Uwot.Constants.etcDev, 'config.rb') : path.resolve(global.Uwot.Constants.etcProd, 'config.rb')}));

if (app.get('env') === 'development') {
	app.use(fileLog.info);
}

app.use(express.static(path.join(global.Uwot.Constants.appRoot, 'public')));

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
