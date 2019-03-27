'use strict';
const path = require('path');
const EOL = require('os').EOL;

class UwotCmdCat extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/cat/execute');
		
		}
		var userFs, pathArr = [];
		var isNumbered = false;
		var numberAll = false;
		var separator = EOL;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
			
				pathArr = args.map((arg) => {
			
					if ('object' === typeof arg && 'string' === typeof arg.text) {
					
						return arg.text.trim();
					
					}
					else {
					
						return '';
					
					}
			
				});
			
			}
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "b") {
			
					isNumbered = true;
			
				}
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "n") {
			
					numberAll = true;
					isNumbered = true;
			
				}
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && (options[i].name === "p" || options[i].name === "sep")) {
			
					separator = 'object' === typeof options[i].args && Array.isArray(options[i].args) && 'string' === typeof options[i].args[0] ? options[i].args[0] : '';
			
				}
		
			}
		
		}
		pathArr.push(separator);
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'cat',
			pathArr,
			(error, concatString) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('string' !== typeof concatString) {
				
					return callback(new Error('invalid paths'), null);
				
				}
				else {
				
					var concatLineArr = concatString.split(EOL);
					let lineNo = 1;
					let lineIdx = 0;
					concatLineArr.forEach(function(lineString) {
					
						if (isNumbered) {
						
							if (lineString.trim().length < 1 && !numberAll) {
							
								executeResult.output.content.push({tag: 'br'});
							
							}
							else {
							
								executeResult.output.content.push({tag: 'div', content: lineNo + '&nbsp;'.repeat(8 - lineNo.toString().length) + lineString});
								lineNo++;
							
							}
						
						}
						else if (lineString.trim().length < 1) {
						
							executeResult.output.content.push({tag: 'br'});
						
						}
						else {
						
							executeResult.output.content.push({tag: 'div', content: lineString});
						
						}
						if (++lineIdx >= concatLineArr.length) {
						
							return callback(false, executeResult);
						
						}
					
					});

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

var cat = new UwotCmdCat(
	{
		name:				'cat',
		description:		'Concatenate and print files. The cat utility reads files sequentially, writing them to the output.  The file operands are processed in command-line order. Dash stdin and sockets are NOT supported.',
		requiredArguments:	['file'],
		optionalArguments:	['moreFiles']
	},
	[
		{
			description: 		'Number the non-blank output lines, starting at 1, for all lines combined.',
			shortOpt: 			'b',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Number all output lines, starting at 1, for all lines combined.',
			shortOpt: 			'n',
			longOpt: 			null,
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description:		'Define the separator between concatenated files. Using this flag without an argument results in no separator being used. Without this flag, separator is server-os EOL character.',
			shortOpt:			'p',
			longOpt:			'sep',
			requiredArguments:	['separator'],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/cat')
);

module.exports = cat;
