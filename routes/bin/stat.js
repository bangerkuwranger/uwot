'use strict';
const path = require('path');

class UwotCmdStat extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/stat/execute');
		
		}
		var userFs, pathTo, format = null;
		var isVerbose = false;
		var appendFtc = false;
		try {
		
			userFs = global.Uwot.FileSystems[user._id];
			pathTo = 'object' === typeof args && Array.isArray(args) && args.length > 0 && 'object' === typeof args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : null;
		
		}
		catch(e) {
		
			return callback(e, null);
		
		}
		if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
			for (let i = 0; i < options.length; i++) {
			
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && (options[i].name === "v" || options[i].name === "verbose")) {
			
					isVerbose = true;
			
				}
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && options[i].name === "F") {
			
					appendFtc = true;
			
				}
				if ('object' === typeof options[i] && 'string' === typeof options[i].name && (options[i].name === "f" || options[i].name === "format")) {
			
					format = 'object' === typeof options[i].args && Array.isArray(options[i].args) && 'string' === typeof options[i].args[0] ? options[i].args[0] : null;
			
				}
		
			}
		
		}
		var executeResult = {
			output: {content: []}
		};
		userFs.cmd(
			'stat',
			[pathTo, isVerbose, appendFtc, format],
			(error, stats) => {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('string' !== typeof stats) {
				
					return callback(new Error('invalid path'), pathTo);
				
				}
				else {
				
					
					executeResult.output.content.push(super.parsePre(stats));
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

var stat = new UwotCmdStat(
	{
		name:				'stat',
		description:		'Display file status. Does not support filesystem status or output options.',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Display information using the specified format. Supported format placeholders: %A - human readable VFS permissions,  %b - blocks allocated, %B - block size in bytes, %e - ls style file type character, %f - file type character, %F - file type, %h - number of hard links, %N - file name, %s - size in bytes, %U - human readable VFS owner, %w - birth time in Ms since Epoch, %W - human readable birth time, %x - last access time in Ms since Epoch, %X - human readable last access time, %y - last modification time in Ms since Epoch, %Y - human readable last modification time.',
			shortOpt: 			'f',
			longOpt: 			'format',
			requiredArguments:	['format'],
			optionalArguments:	[]
		},
		{
			description: 		'Append filetype end character to file name.',
			shortOpt: 			'F',
			longOpt: 			'',
			requiredArguments:	[],
			optionalArguments:	[]
		},
		{
			description: 		'Display information in verbose format. Other flags will be ignored.',
			shortOpt: 			'v',
			longOpt: 			'verbose',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/stat')
);

module.exports = stat;
