'use strict';
const path = require('path');

class UwotCmdBrowse extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/execute');
		
		}
		else if ('object' !== typeof args || !Array.isArray(args) || args.length < 1 || 'object' !== typeof args[0] || 'string' !== typeof args[0].text) {
		
			return callback(new TypeError('invalid path passed to browse'), '');
		
		}
		else {
		
			return callback(false, false);
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var browse = new UwotCmdBrowse(
	{
		name:				'browse',
		description:		'Open selected html file in internal browsing environment',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/browse')
);

module.exports = browse;
