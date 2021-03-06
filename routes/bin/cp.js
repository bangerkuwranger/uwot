'use strict';
const path = require('path');

class UwotCmdCp extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/cp/execute');
		
		}
		var userFs, source, target;
		var noOverwrite = false;
		var isRecursive = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' !== typeof userFs || 'function' !== typeof userFs.cmd) {
			
				throw new TypeError('invalid user fileSystem');
			
			}
			source = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && null !== args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
			target = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[1] && null !== args[1] && 'string' === typeof args[1].text ? args[1].text.trim() : null;
			if (null === source || null === target) {
			
				throw new TypeError('invalid source/target for bin/cp/execute');
			
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
			
				if ('object' === typeof options[i] && null !== options[i] && 'string' === typeof options[i].name && (options[i].name === "n" || options[i].name === "noclobber")) {
			
					noOverwrite = true;
			
				}
				if ('object' === typeof options[i] && null !== options[i] && 'string' === typeof options[i].name && (options[i].name === "R" || options[i].name === "recursive")) {
			
					isRecursive = true;
			
				}
			
			}
		
		}
		userFs.cmd(
			'cp',
			[source, target, noOverwrite, isRecursive],
			(error, isCopied) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('boolean' !== typeof isCopied || !isCopied) {
				
					return callback(new Error('invalid copy'), [source, target]);
				
				}
				else {
				
					try {
					
						executeResult.output.content.push('copied ' + userFs.dissolvePath(source) + ' to ' + userFs.dissolvePath(target));
						return callback(false, executeResult);
					
					}
					catch(e) {
					
						return callback(e);
					
					}
				
				}
			
			},
			isSudo
		);
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}

}

var cp = new UwotCmdCp(
	{
		name:				'cp',
		description:		'Copy files. The cp utility copies the contents of the source to the target.',
		requiredArguments:	['source', 'target'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Do not overwrite an existing file.',
			shortOpt: 			'n',
			longOpt: 			'noclobber',
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Recursive copy. If source designates a directory, cp copies the directory and the entire subtree connected at that point.  If the source path ends in a "/", the contents of the directory are copied rather than the directory itself.',
			shortOpt: 			'R',
			longOpt: 			'recursive',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/cp')
);

module.exports = cp;
