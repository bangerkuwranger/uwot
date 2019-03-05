var path = require('path');
const globalSetupHelper = require('./helpers/globalSetup');

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

var index = require('./routes/index');

var app = express();

globalSetupHelper.initEnvironment();

globalSetupHelper.initExports();

globalSetupHelper.initThemes();

var currentThemeName = 'string' === typeof process.env.UWOT_THEME ? process.env.UWOT_THEME : global.Uwot.Config.get('themes', 'defaultTheme');
app.set('uwot_theme', currentThemeName);
var themePath = path.join(global.Uwot.Constants.appRoot, 'default' === currentThemeName ? 'public' : currentThemeName);

// add sudo. it's special.
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
// then add to reserved list
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
};
if ("development" === global.process.env.NODE_ENV) {

	sessionArgs.cookie.secure = false; // serve secure cookies in prod only
	sessionArgs.proxy = false;
	sessionArgs.cookie.sameSite = false;

}
else {

	app.set('trust proxy', 1);

}
sessionArgs.store = new nedbSessionStore({
	filename: global.Uwot.Constants.appRoot + '/var/nedb/session.db',
	autoCompactInterval: (sessionMs / 6)
});
app.use(session(sessionArgs));

// create container for global FileSystems and load instances for guest and active sessions
globalSetupHelper.initFileSystems(sessionArgs.store, function(error, filesystemsReady) {

	var infoOut = JSON.stringify(filesystemsReady);
	if (error) {
	
		console.error(error);
	
	}
	if (app.get('env') === 'development') {
	
		console.log("FileSystems loaded:" + infoOut);
	
	}

});

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
