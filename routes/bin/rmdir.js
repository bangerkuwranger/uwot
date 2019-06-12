'use strict';
const path = require('path');

class UwotCmdRmdir extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/rmdir/execute');
		
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
			'rmdir',
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

var rmdir = new UwotCmdRmdir(
	{
		name:				'rmdir',
		description:		'Remove directory.  The rmdir utility removes the directory entry specified by the directory argument, provided it is empty.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/rmdir')
);

module.exports = rmdir;
