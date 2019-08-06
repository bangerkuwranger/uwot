var path = require('path');
const globalSetupHelper = require('./helpers/globalSetup');

globalSetupHelper.initConstants();

var express = require('express');
var favicon = require('serve-favicon');
var logger = require('morgan');
var fileLog = require('./middleware/logging');
var session = require('express-session');
var nedbSessionStore = require('nedb-session-store')(session);
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var sassCompiler = require('./helpers/sassCompiler');

var app = express();
app.disable('x-powered-by');

globalSetupHelper.initEnvironment();

globalSetupHelper.initExports();

globalSetupHelper.initThemes();

var currentThemeName = 'string' === typeof process.env.UWOT_THEME ? process.env.UWOT_THEME : global.Uwot.Config.getVal('themes', 'defaultTheme');
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
	
		return cb(false, 'sudo &lt;command&gt; <br/> Either you can or you can\'t. There is no "maybe" in sudo.');
	
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

// create instance sessions to track listener states for any session
globalSetupHelper.initListeners(function(error, currentListenerIsids) {

	if (error) {
	
		console.error(error);
	
	}
	if (app.get('env') === 'development') {
	
		var infoOut = JSON.stringify(currentListenerIsids);
		console.log("Listeners for isids: " + infoOut);
	
	}
	return;

});

// set up sessions for authenticated users
const sessionMs = global.Uwot.Config.getVal('users', 'authenticatedSessionExpiry');
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

var sassResults = sassCompiler.renderAll();
console.log('Stylesheet Compilation: ' + sassResults.processed.length + ' files processed with ' + sassResults.errors.length + ' errors');
if (app.get('env') === 'development') {

	var sassFiles = sassResults.processed.map((pFile) => {
	
		return pFile.source;
	
	});
	console.log('SCSS Files:');
	sassFiles.forEach((fName) => {
	
		console.log(fName);
	
	});
	sassResults.errors.forEach((sassError) => {
	
		console.error(sassError);
	
	});

}

if (app.get('env') === 'development') {
	app.use(fileLog.info);
}

app.use(express.static(path.join(global.Uwot.Constants.appRoot, 'public')));

var indexRouter = require('./routes/index');

app.use('/', indexRouter);

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
