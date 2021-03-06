'use strict';
const path = require('path');

class UwotCmdMkdir extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/mkdir/execute');
		
		}
		var userFs, argPath, createIntermediate = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' !== typeof userFs || 'function' !== typeof userFs.cmd) {
			
				throw new TypeError('invalid user fileSystem');
			
			}
			argPath = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && null !== args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
			if (argPath === null) {
			
				throw new TypeError('invalid path passed to bin/mkdir/execute');
			
			}
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		var executeResult = {
			output: {content: []}
		};

		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && null !== options[i] && 'string' === typeof options[i].name && options[i].name === "p") {
			
					createIntermediate = true;
			
				}
			
			}
		
		}
		userFs.cmd(
			'mkdir',
			[argPath, createIntermediate],
			(error, finalPath) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('string' !== typeof finalPath || '' === finalPath) {
				
					return callback(new Error('invalid path'), argPath);
				
				}
				else {
				
					executeResult.output.content.push('mkdir success: ' + userFs.dissolvePath(finalPath));
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

var mkdir = new UwotCmdMkdir(
	{
		name:				'mkdir',
		description:		'Make directory.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Create intermediate directories as required.',
			shortOpt: 			'p',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/mkdir')
);

module.exports = mkdir;
