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
	
	execute(args, options, callback) {
	
		return super.execute(args, options, callback);
	
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
			shortOpt: 			'-s',
			longOpt: 			'--save',
			requiredArguments:	[],
			optionalArguments:	[]
		}
	],
	path.resolve(global.appRoot, 'routes/bin/theme')
);

module.exports = theme;
