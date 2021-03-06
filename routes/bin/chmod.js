'use strict';
const path = require('path');
const systemError = require('../../helpers/systemError');

class UwotCmdChmod extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/chmod/execute');
		
		}
		var userFs, pth, allowed, userName;
		var isRecursive = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' !== typeof userFs || 'function' !== typeof userFs.cmd) {
			
				throw new TypeError('invalid user fileSystem');
			
			}
			if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
			
				pth = 'object' === typeof args[1] && 'string' === typeof args[1].text ? args[1].text.trim() : null;
				allowed = [];
				if ('object' === typeof args[0] && 'string' === typeof args[0].text) {
				
					var allowedArr = Array.from(args[0].text.trim());
					if (-1 < allowedArr.indexOf('r')) {
					
						allowed.push('r');
					
					}
					if (-1 < allowedArr.indexOf('w')) {
					
						allowed.push('w');
					
					}
					if (-1 < allowedArr.indexOf('x')) {
					
						allowed.push('x');
					
					}
				
				}
			
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
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && (options[i].name === "u" || options[i].name === "user")) {
			
					userName = 'object' === typeof options[i].args && Array.isArray(options[i].args) && 'string' === typeof options[i].args[0] ? options[i].args[0].trim() : null;
			
				}
		
			}
		
		}
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'chmod',
			[
				pth,
				allowed,
				isRecursive,
				userName
			],
			(error, result) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if (!result) {
				
					return callback(new Error('invalid path'), null);
				
				}
				else {
				
					executeResult.output.content.push('permissions updated.');
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

var chmod = new UwotCmdChmod(
	{
		name:				'chmod',
		description:		'Change allowed permissions for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory. Only the owner of a file or the super-user is permitted to change the allowed permissions of a directory. As there are no user groups, permissions are set by default for all users, or specifically for one user, specified as argument of the -u flag. Also, the permissions specified do not follow POSIX rules, but are set with a single string "rwx", where including the letter allows the action, omitting it disallows it. E.g. "" would allow nothing, "r" is read-only, etc.',
		requiredArguments:	['permissions', 'path'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Recursive permissions change. Change permissions of all subdirectories of a directory specified by path.',
			shortOpt: 			'R',
			longOpt: 			'recursive',
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Specify username that permissions should be applied to. Without an operand, this option is ignored.',
			shortOpt: 			'u',
			longOpt: 			'user',
			requiredArguments:	['username'],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/chmod')
);

module.exports = chmod;
