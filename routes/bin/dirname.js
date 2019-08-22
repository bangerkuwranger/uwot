'use strict';
const path = require('path');

class UwotCmdDirname extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/dirname/execute');
		
		}
		else if ('object' !== typeof args || !Array.isArray(args) || args.length < 1 || 'object' !== typeof args[0] || null === args[0] || 'string' !== typeof args[0].text) {
		
			return callback(new TypeError('invalid path passed to dirname'), '');
		
		}
		else {
		
			return callback(false, path.dirname(args[0].text.trim()));
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var dirname = new UwotCmdDirname(
	{
		name:				'dirname',
		description:		'Return directory portion of pathname.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/dirname')
);

module.exports = dirname;
