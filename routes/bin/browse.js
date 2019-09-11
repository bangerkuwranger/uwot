'use strict';
const path = require('path');
const ansi = require('../../output/ansi');
const remoteHtml = require('../../helpers/consoleHtml');

var listenerSettings = {
	name: 'browse',
	type: 'exclusive',
	output: 'internal',
	outputPath: 'outputBrowse',
	routerPath: path.join(global.Uwot.Constants.appRoot, 'routes/listeners.js'),
	routeUriPath: '/listeners',
	cmdSet: [
		'exit',
		'reload',
		'go',
		'fwd',
		'back',
		''
	]
};

class UwotCmdBrowse extends global.Uwot.Exports.Cmd {

	constructor(cmdObj, cmdOpts, cmdPath) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath,
			listenerSettings
		);
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		// throw TypeError if callback is invalid
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/execute');
		
		}
		// return TypeError if required arg is not passed
		else if ('object' !== typeof args || !Array.isArray(args) || args.length < 1 || 'object' !== typeof args[0] || null === args[0] || 'string' !== typeof args[0].text) {
		
			return callback(new TypeError('invalid path passed to browse'), '');
		
		}
		// return Error if isid is invalid
		
		// enter logic to start console with req arg andset up exclusive listener
		else {
		
			
			
			// try to enable Listener for isid
			
			// return error to cb if enableListener returns an Error
			
			// return output to cb if enableListener completes without error
			
			// return error to cb if enableListener throws an Error
			return callback(false, false);
		
		}
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}
	
	outputBrowse(args) {
	
		return function(res, req, next) {
		
			res.ansi = function outputAnsiOrConsole(obj) {
			
				this.json(ansi(obj));
			
			};
			next();
		
		};
	
	}
	
	exit() {
	
		return;
	
	}
	
	reload() {
	
		return;
	
	}
	
	go(uri) {
	
		return;
	
	}
	
	fwd() {
	
		return;
	
	}
	
	back() {
	
		return;
	
	}

}

var browse = new UwotCmdBrowse(
	{
		name:				'browse',
		description:		'Open selected html file in internal browsing environment',
		requiredArguments:	['path'],
		optionalArguments:	[]
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/browse'),
	listenerSettings
);

module.exports = browse;
