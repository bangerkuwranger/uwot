const bashParser = require('bash-parser');
const Runtime = require('./RuntimeCmds');

/***
*
* args object properties
*
* (string)cmd	(required)	cmd string received from user input
* (boolean)isAuthenticated	value from PassportJS indicating whether valid user is authenticated for session 
* (string)userId	value set by PassportJS identifying authenticated user by ID
* (object)app	(required)	app instance added by ref to Runtime instance for reflection
* (string)isid	(required)	instanceSession id value passed in req.cookies
*
***/

/***
*
* response object properties
*
* (object)cmdAst	object parsed into ASTs from cmd string received from user input by bash-parser
* (object)runtime	UwotRuntimeCmds instance that contains runtime for parsed ASTs
*
***/

module.exports = function defaultCmdParser(args, callback) {
	
	if ('function' !== typeof callback) {
	
		throw new TypeError('invalid callback passed to defaultCmdParser');
	
	}
	var response = {};
	if ('object' === typeof args && 'string' === typeof args.cmd && '' !== args.cmd) {

		// get user id from args
		var uid = args.isAuthenticated && 'string' === typeof args.userId && '' !== args.userId ? args.userId : null;
		// parse args.cmd to AST and assign to response.cmdAst
		response.cmdAst = bashParser(args.cmd);
		if ('string' !== typeof uid) {
	
			// get guest if invalid/unset user id
			global.Uwot.Users.getGuest(function(error, user) {
		
				if (error) {
			
					return callback(error, null);
			
				}
				else {
			
					// probably needless, but ensure guest cannot sudo
					user.maySudo = function() { return false; };
					// assign new runtime to response.runtime using parsed AST, args.app, and guest user
					response.runtime = new Runtime(response.cmdAst, user).addAppInstance(args.app).addInstanceSessionId(args.isid);
					return callback(false, response);
			
				}
		
			});
	
		}
		else {
	
			// extra check that user still exists in DB
			global.Uwot.Users.findById(uid, function(error, user) {
		
				if (error) {
			
					return callback(error, null);
			
				}
				// if matching user not in DB, get guest user
				else if (!user) {
			
					global.Uwot.Users.getGuest(function(error, user) {
		
						if (error) {
			
							return callback(error, null);
			
						}
						else {
						
							// probably needless, but ensure guest cannot sudo
							user.maySudo = function() { return false; };
							// assign new runtime to response.runtime using parsed AST, args.app, and guest user
							response.runtime = new Runtime(response.cmdAst, user).addAppInstance(args.app);
							return callback(false, response);
			
						}
		
					});
			
				}
				// match found in DB; use auth user for runtime
				else {
			
					// assign new runtime to response.runtime using parsed AST, args.app, and found user
					response.runtime = new Runtime(response.cmdAst, user).addAppInstance(args.app);
					return callback(false, response);
			
				}
		
			});
	
		}

	}

};
