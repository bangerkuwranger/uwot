'use strict';
const path = require('path');
const validUrl = require('valid-url');
const sanitize = require('../../helpers/valueConversion');
const ansi = require('../../output/ansi');
const remoteHtml = require('../../helpers/consoleHtml');
const browseErrorHelper = require('../../helpers/htmlBrowseErrors');

var listenerSettings = {
	name: 'browse',
	type: 'exclusive',
	output: 'internal',
	outputPath: 'outputBrowse',
	cmdPath: path.join(global.Uwot.Constants.appRoot, 'routes/bin/browse.js'),
	routeUriPath: '/listeners',
	cmdSet: [
		'quit',
		'go',
		'nogo'
	]
};

const GUI_CLASS_STRING = 'class="uwotGui-html"';

const getArgsMapArr = function(cmdName) {

	if ('string' !== typeof cmdName || -1 === listenerSettings.cmdSet.indexOf(cmdName)) {
	
		return new Error('invalid cmd name');
	
	}
	else if ('go' === cmdName) {
	
		return [
			{
				name: 'path',
				cleanFn: (str) => {
				
					return sanitize.cleanString(str, 1024,  null);
				
				}
			},
			{
				name: 'isGui',
				cleanFn: (bool) => {
					
					return sanitize.cleanBool(bool, false);
				
				}
			},
			{
				name: 'msg',
				cleanFn: (str) => {
					
					return sanitize.cleanString(str, 255, false);
				
				}
			}
		];
	
	}
	else if ('nogo' === cmdName) {
	
		return [
			{
				name: 'path',
				cleanFn: (str) => {
				
					return sanitize.cleanString(str, 1024,  null);
				
				}
			},
			{
				name: 'isGui',
				cleanFn: (bool) => {
					
					return sanitize.cleanBool(bool, false);
				
				}
			},
			{
				name: 'msg',
				cleanFn: (str) => {
					
					return sanitize.cleanString(str, 255, false);
				
				}
			}
		];
	
	}

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
				output: {
					content: [{content: 'no content found', classes: ['browseOutput']}]
				},
				outputType: 'object'
			};
			var isGui = false;
			var pathArgs = {
				isGui,
				isSudo,
				user
			};
			// attempt to load data
			try {
			
				this.getPathContent(sanitize.cleanString(args[0].text, 1024, null), pathArgs, (error, pathData) => {
			
					if (error) {
					
						return callback(error);
					
					}
					else if ('string' !== typeof pathData || '' === pathData) {
					
						return callback(false, executeResult);
					
					}
					else {
					
						executeResult.output.content[0].content = pathData;
						if (-1 !== pathData.indexOf(GUI_CLASS_STRING)) {
						
							isGui = true;
						
						}
						executeResult.cookies = {
							uwotBrowseCurrentPath: {
								value: args[0].text
							},
							uwotBrowseCurrentType: {
								value: isGui ? 'gui' : 'cli'
							},
							uwotBrowseCurrentStatus: {
								value: 'active'
							}
						};
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
				
				});
			
			}
			catch(e) {
			
				return callback(e);
			
			}
		
		}
	
	}
	
	handler(bin, args, options, app, user, callback, isSudo, isid) {
	
		// throw TypeError if callback is invalid
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/handler');
		
		}
		else if ('string' !== typeof bin || -1 === this.listenerSettings.options.cmdSet.indexOf(bin)) {
		
			return callback(new TypeError('invalid cmd passed to bin/browse/handler'));
		
		}
		else if ('quit' === bin) {
		
			if ('string' !== typeof isid || '' === isid) {
			
				return callback(new TypeError('invalid isid passed to bin/browse/handler'));
			
			}
			else {
			
				return this.quit(isid, callback);
			
			}
		
		}
		else if ('object' !== typeof args || !(Array.isArray(args)) || args.length < 1) {
		
			return callback(new TypeError('invalid args passed to bin/browse/handler'));
		
		}
		else {
		
			var argsObj = {
				isGui: false,
				isSudo,
				user
			};
			var argsMapArr = getArgsMapArr(bin);
			for(let i = 0; i < argsMapArr.length; i++) {
			
				let argMap = argsMapArr[i];
				let thisArg = args[i];
				if ('object' === typeof argMap && null !== argMap && 'object' === typeof thisArg && null !== thisArg && 'string' === typeof thisArg.text) {
					
					argsObj[argMap.name] = argMap.cleanFn(thisArg.text);
				
				}
				if ((i + 1) >= args.length) {
				
					switch(bin) {
					
						case 'go':
							return this.go(argsObj, callback);
						case 'nogo':
							return this.nogo(argsObj, callback);
			
					}
				
				}
			
			}
		
		}
	}
	
	help(callback) {
	
		super.help(callback);
	
	}
	
	outputBrowse(obj) {
	
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
	
	go(args, callback) {
	
		var argPath;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/handler/go');
		
		}
		else if ('object' !== typeof args || args === null) {
		
			return callback(new TypeError('invalid args passed to bin/browse/go'));
		
		}
		else if ('string' !== typeof args.path || '' === args.path) {
		
			return callback(new TypeError('invalid path passed to bin/browse/go'));
		
		}
		else {
		
			argPath = args.path;
			delete args.path;
			var goResult = {
				output: {
					content: [{content: 'no content found', classes: ['browseOutput']}]
				},
				outputType: 'object',
				cookies: {
					uwotBrowseCurrentPath: {
						value: args.path
					},
					uwotBrowseCurrentType: {
						value: args.isGui ? 'gui' : 'cli'
					},
					uwotBrowseCurrentStatus: {
						value: 'active'
					}
				},
				additional: {
					browseOpts: {
						loadContent: true
					}
				}
			};
			if ('string' === typeof args.msg && '' !== args.msg) {
		
				goResult.additional.browseOpts.msg = args.msg;
		
			}
			try {
			
				this.getPathContent(argPath, args, function(error, pathContent) {
				
					if (error) {
					
						goResult.output.content[0].content = error.message;
						return callback(false, goResult);
					
					}
					else if ('string' !== typeof pathContent || '' === pathContent) {
					
						return callback(false, goResult);
					
					}
					else {
					
						goResult.output.content[0].content = pathContent;
						// TBD
						// should be pulling this value from the user cookie after initial execute callback
						// currently just do the same isGui check on content
						if (-1 !== pathContent.indexOf(GUI_CLASS_STRING)) {
						
							goResult.cookies.uwotBrowseCurrentType.value = 'gui';
						
						}
						return callback(false, goResult);
						
					
					}
				
				});
			
			}
			catch(e) {
			
				goResult.output.content[0].content = e.message;
				return callback(false, goResult);
			
			}
		
		}
	
	}
	
	nogo(args, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/handler/nogo');
		
		}
		else {
		
			var nogoResult = {
				outputType: 'object',
				cookies: {
					uwotBrowseCurrentPath: {
						value: args.path
					},
					uwotBrowseCurrentType: {
						value: args.isGui ? 'gui' : 'cli'
					},
					uwotBrowseCurrentStatus: {
						value: 'active'
					}
				},
				additional: {
					browseOpts: {
						loadContent: false
					}
				}
			};
			if ('object' === typeof args && null !== args && 'string' === typeof args.msg && '' !== args.msg) {
		
				nogoResult.additional.browseOpts.msg = args.msg;
		
			}
			return callback(false, nogoResult);
		
		}
	
	}
	
	getPathContent(pth, args, callback) {
	
		// cb must be a function
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/browse/getPathContent');
		
		}
		// pth must be a non-empty string
		else if ('string' !== typeof pth || '' === pth) {
		
			return callback(new TypeError('invalid pth passed to bin/browse/getPathContent'));
		
		}
		// args must be a non-null object
		else if ('object' !== typeof args || null === args) {
		
			return callback(new TypeError('invalid args passed to bin/browse/getPathContent'));
		
		}
		else {
		
			// if isLocal arg not set, check if pth is valid uri and set true if not
			if ('boolean' !== typeof args.isLocal) {
			
				args.isLocal = validUrl.isUri(pth) ? false : true;
			
			}
			// if isSudo arg not set, default to false
			args.isSudo = 'boolean' === typeof args.isSudo && true === args.isSudo;
			// make sure user object is valid
			if ('object' !== typeof args.user || null === args.user || 'string' !== typeof args.user._id) {
				
				return callback(TypeError('invalid user'));
				
			}
			// if isLocal, load local data from VFS and process with remoteHtml
			if (args.isLocal) {
			
				var userFs;
				try {
			
				
					userFs = global.Uwot.FileSystems[args.user._id];
					if ('object' !== typeof userFs || 'function' !== typeof userFs.pFile) {
			
						throw new TypeError('invalid user fileSystem');
			
					}
			
				}
				catch(e) {
			
					return callback(e);
			
				}
				// read file at pth with userFs
				return userFs.pFile('read', [pth], args.isSudo).then((fileData) => {
				
					// return result of remoteHtml.locadForConsole on read data to cb
					return remoteHtml.loadForConsole(fileData, callback);
				
				})
				// return error to cb if read returns an error
				.catch((e) => {
				
					if ('string' === typeof e.code) {
					
						var respCode = browseErrorHelper.getErrIntFromSysCode(e.code);
						var htmlError = browseErrorHelper.getHtmlForError(respCode);
						if (htmlError instanceof Error && htmlError.message === 'invalid browser Error') {
						
							return callback(e);
						
						}
						else {
						
							return callback(false, htmlError);
						
						}
					
					}
					return callback(e);
				
				});
			
			}
			// otherwise, use remoteHtml to retrieve data and process
			else {
			
				// get main html
				remoteHtml.getRemoteResources(pth)
				.then((resultHtml) => {
				
					// add head element content and return result to cb
					return remoteHtml.loadForConsole(resultHtml, callback);
				
				})
				// catch error retrieving data from remote resource and return to cb
				.catch((e) => {
				
					if ('string' === typeof e.code) {
					
						var respCode = browseErrorHelper.getErrIntFromSysCode(e.code);
						var htmlError = browseErrorHelper.getHtmlForError(respCode);
						if (htmlError instanceof Error && htmlError.message === 'invalid browser Error') {
						
							return callback(e);
						
						}
						else {
						
							return callback(false, htmlError);
						
						}
					
					}
					return callback(e);
				
				});
			
			}
			
		}
	
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
