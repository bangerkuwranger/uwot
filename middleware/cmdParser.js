const bashParser = require('bash-parser');

module.exports = function(args) {

	return function(req, res, next) {
	
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
			req.body.cmdAst = bashParser(req.body.cmd);
		
			debugger;
			var cmdString = req.body.cmd.trim();
			if (-1 != global.UwotCliOps.indexOf(cmdString)) {
		
				req.body.operation = cmdString;
		
			}
	
		}
		next();
	
	};

}
