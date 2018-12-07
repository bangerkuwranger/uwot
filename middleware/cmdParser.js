const bashParser = require('bash-parser');
const minimist = require('minimist');
const sanitize = require('../helpers/valueConversion');

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

function buildCommand(astCommand) {

	if ('object' !== typeof astCommand || 'Command' !== astCommand.type) {
	
		throw new TypeError('invalid ast command node passed to buildCommand');
	
	}
	else if ('object' !== typeof astCommand.name || 'Word' !== astCommand.name.type) {
	
		return {};
	
	}
	else {
	
		
	
	}

}

class UwotRuntimeCmd {

	constructor(
		name,
		args
	) {
	
		this.name = sanitize.cleanString(name);
		
	
	}

}
