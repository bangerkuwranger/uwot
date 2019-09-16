'use strict';
const path = require('path');
const ansi = require('../../output/ansi');
const remoteHtml = require('../../helpers/consoleHtml');

var listenerSettings = {
	name: 'browse',
	type: 'exclusive',
	output: 'internal',
	outputPath: 'outputBrowse',
	cmdPath: path.join(global.Uwot.Constants.appRoot, 'routes/bin/browse.js'),
	routeUriPath: '/listeners',
	cmdSet: [
		'quit',
		'reload',
		'go',
		'fwd',
		'back',
		'select',
		'submit'
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
		
			return callback(new TypeError('invalid path passed to bin/browse/execute'), '');
		
		}
		// return Error if isid is invalid
		else if ('string' !== typeof isid) {
		
			return callback(new TypeError('invalid isid passed to bin/browse/execute'));
		
		}
		// return Error if user is invalid
		else if ('object' !== typeof user || null === user || 'string' !== typeof user._id) {
		
			return callback(new TypeError('invalid user passed to bin/browse/execute'));
		
		}
		// return error if user fileSystem is invalid
		else if ('object' !== typeof global.Uwot.FileSystems[user._id] || null == global.Uwot.FileSystems[user._id]) {
		
			return callback(new Error('invalid user fileSystem'));
		
		}
		// enter logic to start console with req arg andset up exclusive listener
		else {
			
			var executeResult = {
				output: 'test output data',
				outputType: 'object'
			}
			executeResult.cookies = {
				uwotBrowseCurrentPath: {
					value: args[0].text
				}
			};
			// TBD
			// get data for display and set to output
			
			// try to register/enable Listener for isid
			try {
			
				var lEnabled = super.enableListener(isid);
				// return error to cb if enableListener returns an Error
				if (lEnabled instanceof Error) {
				
					return callback(lEnabled);
				
				}
				// return error to cb if registerListener returns false
				else if (!lEnabled || 'enabled' !== lEnabled) {
				
					return callback(new Error('could not enable listener for bin/browse'));
				
				}
				// return output to cb if enableListener completes without error
				else {
				
					return callback(false, executeResult);
				
				}
			
			}
			// return error to cb if enableListener throws an Error
			catch(e) {
			
				return callback(e);
			
			}
			
			
			return callback(false, false);
		
		}
	
	}
	
	handler(bin, args, options, app, user, callback, isSudo, isid) {
	
		// throw TypeError if callback is invalid
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/handler');
		
		}
		else if ('string' !== typeof bin || -1 === this.listenerSettings.cmdSet) {
		
			return callback(new TypeError('invalid cmd passed to bin/browse/handler'));
		
		}
		else {
		
			switch(bin) {
			
				case 'quit':
					return this.quit(isid, callback);
					break;
				case 'reload':
				case 'go':
				case 'fwd':
				case 'back':
				case 'select':
				case 'submit':
					return callback(false, 'browse handled "' + bin + '": ');
			
			}
		
		}
		
	
	}
	
	help(callback) {
	
		super.help(callback);
	
	}
	
	outputBrowse(obj, callback) {
	
		return ansi(obj);
	
	}
	
	quit(isid, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/handler/quit');
		
		}
		else if ('string' !== typeof isid || '' === isid) {
		
			return callback(new TypeError('invalid isid passed to bin/browse/handler/quit'));
		
		}
		// try to disable Listener for isid
		try {
		
			var lDisabled = super.disableListener(isid);
			// return error to cb if enableListener returns an Error
			if (lDisabled instanceof Error) {
			
				return callback(lDisabled);
			
			}
			// return error to cb if registerListener returns false
			else if (!lDisabled || 'disabled' !== lDisabled) {
			
				return callback(new Error('could not disable listener for bin/browse'));
			
			}
			// return output to cb if enableListener completes without error
			else {
			
				return callback(false, 'thanks for browsing!');
			
			}
		
		}
		// return error to cb if disableListener throws an Error
		catch(e) {
		
			return callback(e);
		
		}
	
	}
	
	reload(callback) {
	
		return;
	
	}
	
	go(uri, callback) {
	
		return;
	
	}
	
	fwd(callback) {
	
		return;
	
	}
	
	back(callback) {
	
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
