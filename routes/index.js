var express = require('express');
var router = express.Router();
const binRouter = require('./path');
const nonceHandler = require('node-timednonce');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const validateTheme = require('../helpers/themeLoader').isValidTheme;
// const UserModel = require('../users');

passport.use(

	new LocalStrategy(
	
		function(username, password, callback) {
    	
    		if ('function' !== typeof callback) {
    		
    			throw new TypeError('invalid callback passed to LocalStrategy handler.');
    		
    		}
    		else if ('string' != typeof username || 'string' !== typeof password) {
    		
    			return callback(new TypeError('invalid parameters passed to LocalStrategy handler.'), null);
    		
    		}
    		else {
    		
    			var self = this;
//     			var users = new UserModel();
    			global.UwotUsers.findByName(username, function(error, userObj) {
    			
    				if (error) {
    				
    					return callback(error, username);
    				
    				}
    				else if (!userObj) {
    				
    					return callback(null, false, { message: 'Incorrect username.' });
    				
    				}
    				else {
    				
    					global.UwotUsers.validate(userObj._id, password, function(error, pwIsValid) {
    					
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
    
    	res.locals.user = 'undefined' != typeof req.user.uName ? req.user.uName : '';
    	res.locals.userId = 'undefined' != typeof req.user._id ? req.user._id : 0;
        next();
    
    }
   //  else if (req.path.indexOf('/login') > -1 || req.path.indexOf('/logout') > -1) {
//     
//     	next();
//     
//     }
	else {
	
		next();
	
	}
    
    
});


/* GET home page. */
router.get('/', function(req, res, next) {
	
	var respValues = {
		title: global.UwotConfig.get('server', 'siteName'),
	};
	
	res.locals.nonce = nonceHandler.create( 'index-get', 300000 );
	res.locals.validOps = global.UwotCliOps ? JSON.stringify(global.UwotCliOps) : '[]';
	if (global.UwotConfig.get('server', 'showVersion')) {
	
		res.locals.uwotVersion = global.UwotVersion;
	
	}
	var themeName = 'default';
	if ('object' === typeof req.query && 'string' === typeof req.query.theme) {
	
		themeName = decodeURIComponent(req.query.theme).trim();
	
	}
	else if ('object' == typeof req.cookies && 'string' == typeof req.cookies.uwotSavedTheme) {
	
		themeName = req.cookies.uwotSavedTheme;
		
	}
	else if ('string' === typeof req.app.get('uwot_theme')) {
	
		themeName = req.app.get('uwot_theme');
	
	}
	if (!validateTheme(themeName)) {
	
		themeName == 'default';
	
	}
	if (req.app.get('uwot_theme') !== themeName) {
	
		req.app.set('uwot_theme', themeName);
	
	}
	res.locals.theme = themeName;
	res.locals.showTheme = global.UwotConfig.get('themes', 'showTheme');
	if ('object' == typeof res.locals && res.locals.login && '' !== res.locals.user) {
	
		res.locals.userName = res.locals.user;
	
	}
	if (!global.UwotConfig.get('users', 'allowGuest')) {
	
		res.locals.forceLogin = true;
	
	}
	res.render('index', respValues);
});

router.use('/bin', binRouter);

router.post(
	'/login', 
	function(req, res, next) {
	
		if ('string' == typeof req.body.nonce) {
		
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' != typeof nv) {
			
				next();
			
			}
			else if ('object' == typeof nv && false === nv.status && 'string' == typeof nv.message) {
			
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
		
			res.json({error: error.message, user: null});
		
		}
		else if (!req.user) {
		
			// failure state
			res.json({error: new Error('invalid login credentials').message, user: null});
		
		}
		else {
		
			res.json({error: false, user: req.user});
		
		}
	
	}
	
);

router.all('/login', function (req, res, next) {

	var denied = '';
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		denied += req.body.cmd.trim() + ': '; 
	
	}
	denied += '<span class="ansi fg-red">Permission Denied</span>';
	return res.json(denied);

});

router.post(
	'/logout', 
	function(req, res, next) {
	
		if ('string' == typeof req.body.nonce) {
		
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' != typeof nv) {
			
				if (!req.user) {
		
					// failure state
					res.json({error: new Error('no user session available for logout').message, user: null});
		
				}
				else {
		
					var reqUser = req.user;
					req.logout();
					res.json({error: false, user: reqUser});
		
				}
			
			}
			else if ('object' == typeof nv && false === nv.status && 'string' == typeof nv.message) {
			
				res.json({error: new Error('Invalid Request - Reload' + nv.message).message, user: null});
			
			}
		
		}
		else {
		
			res.json({error: new Error('Invalid Request - Reload').message, user: null});
		
		}
	
	}
	
);

router.all('/logout', function (req, res, next) {

	var denied = '';
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		denied += req.body.cmd.trim() + ': '; 
	
	}
	denied += '<span class="ansi fg-red">Permission Denied</span>';
	return res.json(denied);

});


module.exports = router;
