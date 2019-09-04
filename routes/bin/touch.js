'use strict';
const path = require('path');

class UwotCmdTouch extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/touch/execute');
		
		}
		var userFs, pathTo;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' !== typeof userFs || 'function' !== typeof userFs.cmd) {
			
				throw new TypeError('invalid user fileSystem');
			
			}
			pathTo = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && null !== args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
			if (null === pathTo) {
			
				throw new TypeError('invalid path passed to bin/touch/execute');
			
			}
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'touch',
			[pathTo],
			(error, touched) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('boolean' !== typeof touched || !touched) {
				
					return callback(new Error('invalid path'), pathTo);
				
				}
				else {
				
					executeResult.output.content.push('touched: ' + userFs.dissolvePath(pathTo));
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

var touch = new UwotCmdTouch(
	{
		name:				'touch',
		description:		'The touch utility sets the modification and access times of files.  If any file does not exist, it is created with default permissions.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/touch')
);

module.exports = touch;
