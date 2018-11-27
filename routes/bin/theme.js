'use strict';
const path = require('path');
var express = require('express');
var themeRouter = express.Router();
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../../middlewares/denyAllOthers');
const UwotCmd = require('../../cmd');
if ('undefined' == typeof global.appRoot) {
	global.appRoot = path.resolve('../../');
}
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}

class UwotCmdTheme extends UwotCmd {

	constructor( cmdObj ) {
	
		super(
			cmdObj.command,
			cmdObj.options,
			cmdObj.path
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
	command: {
		name: 'theme',
		description: 'Changes the theme for the console window.',
		requiredArguments: ['themeName'],
		optionalArguments: []
	},
	options: [],
	path: path.resolve(global.appRoot, 'routes/bin/theme');
);

themeRouter.post('/', function(req, res, next) {

	

});

themeRouter.all('/', denyAllOthers());

module.exports = themeRouter;
