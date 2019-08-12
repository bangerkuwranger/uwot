'use strict';
const path = require('path');

class UwotCmdBasename extends global.Uwot.Exports.Cmd {

	constructor(cmdObj, cmdOpts, cmdPath) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/basename/execute');
		
		}
		else if ('object' !== typeof args || !Array.isArray(args) || args.length < 1 || 'object' !== typeof args[0] || 'string' !== typeof args[0].text) {
		
			return callback(new TypeError('invalid path passed to basename'), '');
		
		}
		else {
		
			return callback(false, path.basename(args[0].text.trim()));
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var basename = new UwotCmdBasename(
	{
		name:				'basename',
		description:		'Return filename portion of pathname.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/basename')
);

module.exports = basename;
