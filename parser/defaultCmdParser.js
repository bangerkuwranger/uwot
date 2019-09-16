const bashParser = require('bash-parser');
const Runtime = require('./RuntimeCmds');

/***
* CmdParser function
* 
* In concert with an implementation of the AbstractRuntime class, a parser must provide
* a function that accepts arguments as an object (specified below) as well as a callback.
* The function should then parse the cmd string into an AST parseable and executable by
* the associated Runtime class, and instantiate that class with the AST, userId, app instance,
* and isid. Both the AST and runtime should be included as the second argument of the
* successful callback response object, and any error should be passed as the first arg.
* The callback, set by the listener, will be processed and handled by the requestProcessor
* middleware call the runtime instance's executeCommands method and return the results
* in the response.
*
***/

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
	if ('object' === typeof args && null !== args && 'string' === typeof args.cmd && '' !== args.cmd) {

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
					response.runtime = new Runtime(response.cmdAst, user, args.cmdSet).addAppInstance(args.app).addInstanceSessionId(args.isid);
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
							response.runtime = new Runtime(response.cmdAst, user, args.cmdSet).addAppInstance(args.app).addInstanceSessionId(args.isid);
							return callback(false, response);
			
						}
		
					});
			
				}
				// match found in DB; use auth user for runtime
				else {
			
					// assign new runtime to response.runtime using parsed AST, args.app, and found user
					response.runtime = new Runtime(response.cmdAst, user, args.cmdSet).addAppInstance(args.app).addInstanceSessionId(args.isid);
					return callback(false, response);
			
				}
		
			});
	
		}

	}
	else {
	
		return callback(new TypeError('invalid args passed to defaultCmdParser'));
	
	}

};
