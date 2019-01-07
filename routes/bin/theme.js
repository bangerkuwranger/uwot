'use strict';
const path = require('path');
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../../middleware/denyAllOthers');
const UwotCmd = require('../../cmd');
if ('undefined' == typeof global.appRoot) {
	global.appRoot = path.resolve('../../');
}
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}

class UwotCmdTheme extends UwotCmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	// TBD
	// Help function, return current theme/theme list if no args
	execute(args, options, callback, isSudo) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/theme/execute');
		
		}
		var saveTheme = false;
		var themeName = '';
		var executeResult = {
			output: ''
		};
		if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
		
			themeName = 'object' == typeof args[0] && 'string' == typeof args[0].text ? args[0].text.trim() : themeName;
			if (themeName === '') {
			
				return super.execute(args, options, callback, isSudo);
			
			}
			if ('object' == typeof options && Array.isArray(options) && options.length > 0) {
		
				for (let i = 0; i < options.length; i++) {
				
					if ('object' == typeof options[i] && 'string' == typeof options[i].name && (options[i].name === "s" || options[i].name === "save")) {
				
						saveTheme = true;
						i = options.length;
				
					}
			
				}
				if (saveTheme) {
			
					var now = new Date();
					var oneYearLater = new Date(now.getFullYear() + 1, now.getMonth(), now.getDate());
					executeResult.cookies = {
						uwotSavedTheme: {
							value: themeName,
							expiry: oneYearLater
						}
					}
			
				}
			
			}
			executeResult.redirect = '/?theme=' + encodeURIComponent(themeName);
			executeResult.outputType = 'object';
			return callback(false, executeResult);
		
		}
		else {
		
			return super.execute(args, options, callback, isSudo);
		
		}
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}

};

var theme = new UwotCmdTheme (
	{
		name:				'theme',
		description:		'Changes the theme for the console window.',
		requiredArguments:	['themeName'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'save theme selection for future sessions for this user',
			shortOpt: 			's',
			longOpt: 			'save',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.appRoot, 'routes/bin/theme')
);

module.exports = theme;
