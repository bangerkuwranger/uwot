'use strict';
const path = require('path');
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../../middleware/denyAllOthers');
const filesystem = require('../../filesystem')

const validBuiltins = [
	'cd',
	'pwd',
	'help',
	'printf'
];

const builtinConstructorArgs = {
	cd: [
		{
			name:				'cd',
			description:		'Change working directory.',
			requiredArguments:	['directory'],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	pwd: [
		{
			name:				'pwd',
			description:		'Print working directory to console.',
			requiredArguments:	[],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	help: [
		{
			name:				'help',
			description:		'Display helpful information about builtin commands.',
			requiredArguments:	['pattern'],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	printf: [
		{
			name:				'printf',
			description:		'Write the formatted arguments to the standard output under the control of the format.',
			requiredArguments:	['format'],
			optionalArguments:	['arguments']
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	]
};

class UwotCmdCd extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, callback, isSudo) {
	
		return super.execute(args, options, app, callback, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdPwd extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, callback, isSudo) {
	
		return super.execute(args, options, app, callback, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdHelp extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, callback, isSudo) {
	
		return super.execute(args, options, app, callback, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdPrintf extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, callback, isSudo) {
	
		return super.execute(args, options, app, callback, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdBuiltin extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
		
		// Super don't do this; these are other commands that don't have an assoc. file
		// TBD
		// add each builtin directly to global.Uwot.Bin 
		global.Uwot.Bin.cd = new UwotCmdCd(...builtinConstructorArgs.cd);
		global.Uwot.Bin.pwd = new UwotCmdPwd(...builtinConstructorArgs.pwd);
		global.Uwot.Bin.help = new UwotCmdHelp(...builtinConstructorArgs.help);
		global.Uwot.Bin.printf = new UwotCmdPrintf(...builtinConstructorArgs.printf);
		
	}
	
	execute(args, options, app, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/builtin/execute');
		
		}
		var biName = '';
		var biArgs = [];
		var biOpts = [];
		var executeResult = {
			output: ''
		};
		if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
		
			biName = 'object' == typeof args[0] && 'string' == typeof args[0].text ? args[0].text.trim() : biName;
			if (biName === '') {
			
				this.help(function(error, helpOutput) {
				
					if (error) {
					
						return callback(error, null);
					
					}
					else {
					
						return callback(false, helpOutput);
					
					}
				
				}.bind(this));
			
			}
			else if(args.length > 1) {
			
				//loop through addtl args and set to biArgs for execution
			
			}
			if ('object' == typeof options && Array.isArray(options) && options.length > 0) {
		
				for (let i = 0; i < options.length; i++) {
				
					// parse options and assign to biOpts for execution of bi
			
				}
			
			}
			if (-1 !== validBuiltins.indexOf(biName)) {
			
				return global.Uwot.Bin[biName].execute(biArgs, biOpts, app, callback);
			
			}
			else {
			
				return callback(new Error('invalid builtin'), null);
			
			}
		
		}
		else {
		
			this.help(function(error, helpOutput) {
				
					if (error) {
					
						return callback(error, null);
					
					}
					else {
					
						return callback(false, helpOutput);
					
					}
				
				}.bind(this));
		
		}
	
	}
	
	help(callback) {
	
		super.help(function(error, helpOutput) {
		
			if (error) {
			
				return callback(error, null);
			
			}
			else if ('object' == typeof helpOutput && null !== helpOutput) {
			
				return callback(false, helpOutput);
			
			}
			else {
			
				return callback(false, {output: '*** Help system currently unavailable. ***', isBold: true})
			
			}
		
		}.bind(this));
	
	}
	
};

var builtin = new UwotCmdBuiltin (
	{
		name:				'builtin',
		description:		'Run builtin commands in the running uwot process. This differs from ACTUAL shells in that most logical, memory, user, and process management builtins are implemented elsewhere (e.g. login/logout) or not implemented at all.',
		requiredArguments:	['shell-builtin'],
		optionalArguments:	['shell-builtin-args']
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
);

module.exports = builtin;
