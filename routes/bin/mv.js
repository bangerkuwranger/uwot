'use strict';
const path = require('path');

class UwotCmdMv extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/mv/execute');
		
		}
		var userFs, source, target, noOverwrite = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			source = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
			target = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[1] && 'string' === typeof args[1].text ? args[1].text.trim() : null;
			if (null === source || null === target) {
			
				throw new TypeError('invalid source/target for bin/mv/execute');
			
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
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "n") {
			
					noOverwrite = true;
			
				}
			
			}
		
		}
		userFs.cmd(
			'mv',
			[source, target, noOverwrite],
			(error, isMoved) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('boolean' !== typeof isMoved || !isMoved) {
				
					return callback(new Error('invalid move'), [source, target]);
				
				}
				else {
				
					executeResult.output.content.push('moved ' + userFs.dissolvePath(source) + ' to ' + userFs.dissolvePath(target));
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

var mv = new UwotCmdMv(
	{
		name:				'mv',
		description:		'Move files. The mv utility renames the file named by the source operand to the destination path named by the target operand.',
		requiredArguments:	['source', 'target'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Do not overwrite an existing file.',
			shortOpt: 			'n',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/mv')
);

module.exports = mv;
