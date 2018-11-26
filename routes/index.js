var express = require('express');
var router = express.Router();
const binRouter = require('./path');
const nonceHandler = require('node-timednonce');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const UserModel = require('../users');

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
    			var users = new UserModel();
    			users.findByName(username, function(error, userObj) {
    			
    				if (error) {
    				
    					return callback(error, username);
    				
    				}
    				else if (!userObj) {
    				
    					return callback(null, false, { message: 'Incorrect username.' });
    				
    				}
    				else {
    				
    					users.validate(userObj._id, password, function(error, pwIsValid) {
    					
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
    
    	res.locals.user = 'undefined' != typeof req.user.user_name ? req.user.user_name : '';
    	res.locals.userId = 'undefined' != typeof req.user.id ? req.user.id : 0;
        next();
    
    }
   //  else if (req.path.indexOf('/login') > -1 || req.path.indexOf('/logout') > -1) {
//     
//     	next();
//     
//     }
	next();
    
    
});


/* GET home page. */
router.get('/', function(req, res, next) {
	
	var respValues = {
		title: 'WOT 1.0.0a', 
		theme: 'default',
		nonce: nonceHandler.create( 'index-get', 300000 )
	};
	if ('object' === typeof req.query && 'string' === typeof req.query.theme) {
	
		var themeName = decodeURIComponent(req.query.theme).trim();
		respValues.title +=  ' - ' + themeName + ' theme';
		respValues.theme = themeName;
	
	}
	res.render('index', respValues);
});

router.use('/bin', binRouter);

router.post('/login', 
	passport.authenticate('local', {session: true}), 
	function(req, res, next) {
	
		if (error) {
		
			res.json({error: error, user: null});
		
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


module.exports = router;
