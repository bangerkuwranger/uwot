'use strict';
const path = require('path');

class UwotCmdRm extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/rm/execute');
		
		}
		var userFs, pathTo;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			pathTo = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'rm',
			[pathTo],
			(error, isRemoved) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('boolean' !== typeof isRemoved || !isRemoved) {
				
					return callback(new Error('invalid path'), pathTo);
				
				}
				else {
				
					executeResult.output.content.push('removed: ' + userFs.dissolvePath(pathTo));
					return callback(false, executeResult);
				
				}
			
			},
			isSudo
		);
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var rm = new UwotCmdRm(
	{
		name:				'rm',
		description:		'The rm utility attempts to remove the non-directory type file specified on the command line.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/rm')
);

module.exports = rm;
