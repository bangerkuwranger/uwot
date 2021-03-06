var express = require('express');
var router = express.Router();
const listenersRouter = require('./listeners');
const binRouter = require('./path');
const nonceHandler = require('node-timednonce');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validateTheme = require('../helpers/themeLoader').isValidTheme;
const FileSystem = require('../filesystem');
const denyAllOthers = require('../middleware/denyAllOthers');
const inSession = require('../middleware/inSession');

passport.use(

	new LocalStrategy(
	
		function(username, password, callback) {
		
			if ('function' !== typeof callback) {
			
				throw new TypeError('invalid callback passed to LocalStrategy handler.');
			
			}
			else if ('string' !== typeof username || 'string' !== typeof password) {
			
				return callback(new TypeError('invalid parameters passed to LocalStrategy handler.'), null);
			
			}
			else {
			
				global.Uwot.Users.findByName(username, function(error, userObj) {
				
					if (error) {
					
						return callback(error, username);
					
					}
					else if (!userObj) {
					
						return callback(null, false, { message: 'Incorrect username.' });
					
					}
					else {
					
						global.Uwot.Users.validate(userObj._id, password, function(error, pwIsValid) {
						
							if (error) {
							
								return callback(error, username);
							
							}
							else if (!pwIsValid) {
							
								return callback(null, false, { message: 'Incorrect password.' });
							
							}
							else {
							
								return callback(false, userObj);
							
							}
						
						});
					
					}
				
				});
			
			}
			
		}
	)
);

passport.serializeUser(function(user, done) {

	user = JSON.stringify(user);
	done(null, user);

});

passport.deserializeUser(function(user, done) {

	user = JSON.parse(user);
	done(null, user);

});

router.use(passport.initialize());
router.use(passport.session());

router.use(function (req, res, next) {

	res.locals.login = req.isAuthenticated();
	if (res.locals.login) {
	
		res.locals.user = 'undefined' !== typeof req.user.uName ? req.user.uName : '';
		res.locals.userId = 'undefined' !== typeof req.user._id ? req.user._id : 0;
		next();
	
	}
   //  else if (req.path.indexOf('/login') > -1 || req.path.indexOf('/logout') > -1) {
//	   
//		next();
//	   
//	   }
	else {
	
		next();
	
	}
	
	
});

/* GET home page. */
router.get('/', inSession(), function(req, res, next) {
	
	var respValues = {
		title: global.Uwot.Config.getVal('server', 'siteName'),
	};
	
	res.locals.nonce = nonceHandler.create( 'index-get', 300000 );
	res.locals.listenerNonce = nonceHandler.create('listener-get', 300000);
	res.locals.validOps = global.Uwot.Constants.cliOps ? JSON.stringify(global.Uwot.Constants.cliOps) : '[]';
	res.locals.validListenerTypes = global.Uwot.Constants.listenerTypes ? JSON.stringify(global.Uwot.Constants.listenerTypes) : '[]';
	if (global.Uwot.Config.getVal('server', 'showVersion')) {
	
		res.locals.uwotVersion = global.Uwot.Constants.version;
	
	}
	var themeName = 'default';
	if ('object' === typeof req.query && 'string' === typeof req.query.theme) {
	
		themeName = decodeURIComponent(req.query.theme).trim();
	
	}
	else if ('object' === typeof req.cookies && 'string' === typeof req.cookies.uwotSavedTheme) {
	
		themeName = req.cookies.uwotSavedTheme;
		
	}
	else if ('string' === typeof req.app.get('uwot_theme')) {
	
		themeName = req.app.get('uwot_theme');
	
	}
	if (!validateTheme(themeName)) {
	
		themeName = 'default';
	
	}
	if (req.app.get('uwot_theme') !== themeName) {
	
		req.app.set('uwot_theme', themeName);
	
	}
	res.locals.theme = themeName;
	res.locals.showTheme = global.Uwot.Config.getVal('themes', 'showTheme');
	if ('object' === typeof res.locals && res.locals.login && '' !== res.locals.user) {
	
		res.locals.userName = res.locals.user;
	
	}
	if (!global.Uwot.Config.getVal('users', 'allowGuest')) {
	
		res.locals.forceLogin = true;
	
	}
	if ('object' === typeof global.Uwot.Constants.listenerTypes && Array.isArray(global.Uwot.Constants.listenerTypes)) {
	
		res.locals.validUwotListenerTypes = JSON.stringify(global.Uwot.Constants.listenerTypes);
	
	}
	res.render('index', respValues);
});

router.use('/bin', inSession(), binRouter);

router.use('/listeners', inSession(), listenersRouter);

router.post(
	'/login', 
	function(req, res, next) {
	
		if ('string' === typeof req.body.nonce) {
		
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' !== typeof nv) {
			
				next();
			
			}
			else if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
			
				res.json({error: new Error('Invalid Request - Reload' + nv.message).message, user: null});
			
			}
		
		}
		else {
		
			res.json({error: new Error('Invalid Request - Reload').message, user: null});
		
		}
	
	},
	passport.authenticate('local', {session: true}), 
	function(req, res, next) {
	
		if (req.error) {
		
			res.json({error: req.error.message, user: null});
		
		}
		else if (!req.user) {
		
			// failure state
			res.json({error: new Error('invalid login credentials').message, user: null});
		
		}
		else {
		
			global.Uwot.FileSystems[req.user._id] = new FileSystem(req.user._id, req.body.cwd);
			var newCwd = global.Uwot.FileSystems[req.user._id].getVcwd();
			res.json({error: false, user: req.user, cwd: newCwd});
		
		}
	
	}
	
);

router.all('/login', denyAllOthers());

router.post(
	'/logout', 
	function(req, res, next) {
	
		if ('string' === typeof req.body.nonce) {
		
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' !== typeof nv) {
			
				if (!req.user) {
		
					// failure state
					res.json({error: new Error('no user session available for logout').message, user: null});
		
				}
				else {
		
					var reqUser = req.user;
					req.logout();
					delete global.Uwot.FileSystems[reqUser._id];
					res.json({error: false, user: reqUser});
		
				}
			
			}
			else if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
			
				res.json({error: new Error('Invalid Request - Reload' + nv.message).message, user: null});
			
			}
		
		}
		else {
		
			res.json({error: new Error('Invalid Request - Reload').message, user: null});
		
		}
	
	}
	
);

router.all('/logout', denyAllOthers());


module.exports = router;
