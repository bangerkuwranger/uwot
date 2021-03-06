'use strict';
const path = require('path');
var themeLoaderHelper = require('../../helpers/themeLoader');

class UwotCmdTheme extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	execute(args, options, app, user, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/theme/execute');
		
		}
		if ('function' !== typeof app || 'function' !== typeof app.get) {
		
			return callback(new TypeError('invalid app instance passed to bin/theme/execute'));
		
		}
		var saveTheme = false;
		var themeName = '';
		var executeResult = {
			output: ''
		};
		if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
		
			themeName = 'object' === typeof args[0] && null !== args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : themeName;
			if (themeName === '') {
			
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
			else {
			
				if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
					for (let i = 0; i < options.length; i++) {
				
						if ('object' === typeof options[i] && null !== options[i] && 'string' === typeof options[i].name && (options[i].name === "s" || options[i].name === "save")) {
				
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
						};
			
					}
			
				}
				if (themeLoaderHelper.isValidTheme(themeName)) {
			
					executeResult.redirect = '/?theme=' + encodeURIComponent(themeName);
					executeResult.outputType = 'object';
					return callback(false, executeResult);
			
				}
				else {
			
					return callback(new Error('invalid theme'), null);
			
				}
			
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
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/theme/help');
		
		}
		var themeList = this.outputValidThemes();
		super.help(function(error, helpOutput) {
		
			if (error) {
			
				return callback(error, null);
			
			}
			else if ('object' === typeof helpOutput && null !== helpOutput) {
			
				helpOutput.content.push(themeList);
				return callback(false, helpOutput);
			
			}
			else {
			
				themeList.content.unshift({content: '*** Help system currently unavailable. ***', isBold: true});
				return callback(false, themeList);
			
			}
		
		}.bind(this));
	
	}
	
	outputValidThemes() {
	
		var themeArray = themeLoaderHelper.isValidTheme();
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

}

var theme = new UwotCmdTheme(
	{
		name:				'theme',
		description:		'Changes the theme for the console window.',
		requiredArguments:	['themeName'],
		optionalArguments:	[]
	},
	[
		{
			description: 		'Save theme selection for future sessions for this user.',
			shortOpt: 			's',
			longOpt: 			'save',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/theme')
);

module.exports = theme;
