'use strict';
const path = require('path');
const systemError = require('../../helpers/systemError');

class UwotCmdChown extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/chown/execute');
		
		}
		var userFs, pth, userName;
		var isRecursive = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
			
				userName = 'object' === typeof args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
				pth = 'object' === typeof args[1] && 'string' === typeof args[1].text ? args[1].text.trim() : null;
			
			}
			else {
			
				throw systemError.EINVAL({syscall: 'chmod'});
			
			}
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && (options[i].name === "R" || options[i].name === 'recursive')) {
			
					isRecursive = true;
			
				}
		
			}
		
		}
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'chown',
			[
				pth,
				userName,
				isRecursive
			],
			(error, result) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if (!result) {
				
					return callback(new Error('invalid path'), null);
				
				}
				else {
				
					executeResult.output.content.push('owner updated.')
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

// TBD
// should eventually include options to do line numbering by file the stupid POSIX way. (but isn't that what diff and compare are for?)

var chown = new UwotCmdChown(
	{
		name:				'chown',
		description:		'Change owner for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory.',
		requiredArguments:	['owner', 'path'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Recursive permissions change. Change owners for all subdirectories of a directory specified by path.',
			shortOpt: 			'R',
			longOpt: 			'recursive',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/chown')
);

module.exports = chown;
