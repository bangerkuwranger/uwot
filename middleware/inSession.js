const INSTANCE_SESSION_COOKIE_NAME = 'instanceSessionId';
const isidListenerHelper = require('../helpers/isidListener');

module.exports = function(args) {

	return function(req, res, next) {
	
		// check req for instanceSessionId
		var isidCookie = req.cookies[INSTANCE_SESSION_COOKIE_NAME];
		var uid = req.isAuthenticated() && 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null;
		var isAuthenticated = 'string' === typeof uid;
		if ('string' === typeof isidCookie) {
		
			// validate is still valid
			global.Uwot.InstanceSessions.validate(isidCookie, function(error, isValid) {
			
				if (error) {
				
					console.error(error);
					next();
				
				}
				else if (!isValid) {
				
					// if invalid and user is authenticated, renew with additional 5 min
					if (isAuthenticated) {
					
						global.Uwot.InstanceSessions.renew(isidCookie, 300000, function(error, isidCookie) {
						
							if (error) {
							
								console.error(error);
							
							}
							else {
							
								res.cookie(INSTANCE_SESSION_COOKIE_NAME, isidCookie, {maxAge: 303000});
							
							}
							next();
						
						});
					
					}
					else {
					
						// if invalid and user not authenticated, invalidate and create new
						global.Uwot.InstanceSessions.createNew(null, function(error, savedSession) {
						
							if (error) {
							
								console.error(error);
							
							}
							if ('object' === typeof savedSession && null !== savedSession && 'string' === typeof savedSession._id) {
							
								res.cookie(INSTANCE_SESSION_COOKIE_NAME, savedSession._id, {expires: new Date(savedSession.expiresAt + 3000)});
								isidListenerHelper.moveListeners(isidCookie, savedSession._id);
							
							}
							next();
						
						});
					
					}
				
				}
				else {
				
					next();
				
				}
			
			});

		}
		else {
		
			// if isid is not present, generate new isid
			global.Uwot.InstanceSessions.createNew(null, function(error, savedSession) {
			
				if (error) {
				
					console.error(error);
				
				}
				if ('object' === typeof savedSession && null !== savedSession && 'string' === typeof savedSession._id) {
				
					res.cookie(INSTANCE_SESSION_COOKIE_NAME, savedSession._id, {expires: new Date(savedSession.expiresAt + 3000)});
					isidListenerHelper.newIsidDefaultListener(savedSession._id);
				
				}
				next();
			
			});
		
		}

	};

};
