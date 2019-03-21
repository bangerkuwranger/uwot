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
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/mkdir/execute');
		
		}
		var userFs, pathTo, newDir, createIntermediate = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			newDir = path.basename(args[0].text.trim());
			pathTo = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && 'string' === typeof args[0].text ? path.dirname(args[0].text.trim()) : userFs.root.path;
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		var executeResult = {
			output: {content: []}
		};

		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "p") {
			
					createIntermediate = true;
			
				}
			
			}
		
		}
		userFs.cmd(
			'mkdir',
			[path.join(pathTo, newDir), createIntermediate],
			(error, finalPath) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('string' !== typeof finalPath || '' === finalPath) {
				
					return callback(new Error('invalid path'), path.join(pathTo, newDir));
				
				}
				else {
				
					return callback(false, finalPath);
				
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
