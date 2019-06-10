const defaultCmdParser = require('../parser/defaultCmdParser');
const MAP_ID = 'default';

module.exports = function(args) {

	return function(req, res, next) {
	
		var defaultParserArgs = {};
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd && '' !== req.body.cmd) {
	
			// get user id from res.locals
			defaultParserArgs.isAuthenticated = req.isAuthenticated();
			defaultParserArgs.userId = req.isAuthenticated() && 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null;
			// assign runtime app reference using req.app
			defaultParserArgs.app = req.app;
			
			// ensure result maps exist in req.body
			if ('object' !== typeof req.body.cmdAstMap || !(req.body.cmdAstMap instanceof Map)) {
			
				req.body.cmdAstMap = new Map();
			
			}
			if ('object' !== typeof req.body.runtimeMap || !(req.body.runtimeMap instanceof Map)) {
			
				req.body.runtimeMap = new Map();
			
			}
			if ('object' !== typeof req.body.parseErrorMap || !(req.body.parseErrorMap instanceof Map)) {
			
				req.body.parseErrorMap = new Map();
			
			}
			
			defaultCmdParser(defaultParserArgs, function(error, results) {
			
				if (error) {
				
					req.body.parseErrorMap.set(MAP_ID, error);
					return next();
				
				}
				else {
				
					// parsed res.body.cmd to AST and assigned to req.body.cmdAstMap
					req.body.cmdAstMap.set(MAP_ID, results.cmdAst);
					// assigned runtime to req.body.runtime using parsed AST, req.app, and user
					req.body.runtimeMap.set(MAP_ID, results.runtime);
					return next();
				
				}
			
			});
	
		}
		else {
		
			next();
		
		}
	
	};

};
