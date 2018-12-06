'use strict';
const path = require('path');
var express = require('express');
var themeRouter = express.Router();
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
		name: 'theme',
		description: 'Changes the theme for the console window.',
		requiredArguments: ['themeName'],
		optionalArguments: []
	},
	[],
	path.resolve(global.appRoot, 'routes/bin/theme')
);

themeRouter.post('/', function(req, res, next) {

	

});

themeRouter.all('/', denyAllOthers());

module.exports = themeRouter;
