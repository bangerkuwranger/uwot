'use strict';
const path = require('path');

class UwotCmdLs extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/ls/execute');
		
		}
		var userFs, pathTo;
		var longForm = false;
		var showInvisible = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			pathTo = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && 'string' === typeof args[0].text ? userFs.resolvePath(args[0].text.trim()) : userFs.getCwd();
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		var executeResult = {
			output: {content: []}
		};
		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "a") {
			
					showInvisible = true;
			
				}
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "l") {
			
					longForm = true;
			
				}
		
			}
		
		}
		userFs.cmd(
			'ls',
			[pathTo, showInvisible, longForm],
			(error, resArr) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('object' !== typeof resArr || !Array.isArray(resArr) || resArr.length < 1) {
				
					return callback(false, executeResult);
				
				}
				else {
				
					var i;
					executeResult.outputType = 'object';
					if (longForm) {
					
						for (i = 0; i < resArr.length; i++) {
						
							var lineObj = super.parsePre(resArr[i]);
							executeResult.output.content.push(lineObj, {tag: 'br'});
							if ((i + 1) >= resArr.length) {
							
								return callback(false, executeResult);
							
							}
						
						}
					
					}
					else {
					
						i = 0;
						executeResult.output = {tag: 'div', content: [], classes: ['autoColContainer']};
						resArr.forEach((fileName) => {
						
							executeResult.output.content.push({content: fileName, classes: ['autoColElement']});
							if (++i >= resArr.length) {
							
								return callback(false, executeResult);
							
							}
						
						});
					
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

var ls = new UwotCmdLs(
	{
		name:				'ls',
		description:		'List directory contents.',
		requiredArguments:	[],
		optionalArguments:	['path']
	},
	[
		{
			description: 		'List in long format.',
			shortOpt: 			'l',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Include directory entries whose names begin with a dot (.).',
			shortOpt: 			'a',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/ls')
);

module.exports = ls;
