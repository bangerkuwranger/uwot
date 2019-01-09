'use strict';
const path = require('path');
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../../middleware/denyAllOthers');
const UwotCmd = require('../../cmd');
const filesystem = require('../../filesystem')
if ('undefined' == typeof global.appRoot) {
	global.appRoot = path.resolve('../../');
}
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}
const validBuiltins = [
	'cd',
	'pwd',
	'help',
	'printf'
];

class UwotCmdBuiltin extends UwotCmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
		
		// Super don't do this; these are other commands that don't have an assoc. file
		// TBD
		// add each builtin directly to global.UwotBin 
	
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
			
				return global.UwotBin[biName].execute(biArgs, biOpts, app, callback);
			
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
					
						helpOutput.content.unshift({content:[{content:'Current Theme: '}, {content: app.get('uwot_theme'), isBold: true}, {tag: 'br'}, {tag: 'br'}]});
						return callback(false, helpOutput);
					
					}
				
				}.bind(this));
		
		}
	
	}
	
	help(callback) {
	
		super.help(function(error, helpOutput) {
		
			var themeList = this.outputValidThemes();
			if (error) {
			
				return callback(error, null);
			
			}
			else if ('object' == typeof helpOutput && null !== helpOutput) {
			
				helpOutput.content.push(themeList);
				return callback(false, helpOutput);
			
			}
			else {
			
				themeList.content.unshift({output: '*** Help system currently unavailable. ***', isBold: true});
				return callback(false, themeList)
			
			}
		
		}.bind(this));
	
	}
	
	outputValidThemes() {
	
		var themeArray = validateTheme();
		var validThemeOutput = {content:[{tag: 'div', content: 'List of valid themeNames:', isBold: true}, {content:[], tag: 'ul'}]};
		for (let i = 0; i < themeArray.length; i++) {
		
			validThemeOutput.content[1].content.push(
				{
					content: themeArray[i],
					tag: 'li'
				}
			);
		
		}
		return validThemeOutput;
	
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
	path.resolve(global.appRoot, 'routes/bin/builtin')
);

module.exports = builtin;
