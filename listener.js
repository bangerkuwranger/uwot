'use strict';
var path = require('path');
var sanitize = require('./helpers/valueConversion');
var ListenerError = require('./helpers/UwotListenerError');

const STATUS_DISABLED = 'disabled';
const STATUS_ENABLED = 'enabled';

class UwotListener {

	static get DEFAULT_UWOT_LISTENER_OPTIONS() {
	
		return {
			type:			'default',
			parser:			'cmdParser',
			parserPath:		path.join(global.Uwot.Constants.appRoot, 'parser/defaultCmdParser.js'),
			output:			'ansi',
			outputPath:		path.join(global.Uwot.Constants.appRoot, 'output/ansi.js'),
			cmdPath:		path.join(global.Uwot.Constants.appRoot, 'cmd.js'),
			routeUriPath:	'/bin',		//path relative to /listeners or /path.........
			cmdSet: 		global.Uwot.Constants.reserved
		};
	
	}
	
	constructor(name, instanceSessionId, options) {
	
		if ('string' !== typeof name) {
		
			throw new TypeError('invalid name passed to UwotListener contstructor');
		
		}
		else if ('string' !== typeof instanceSessionId) {
		
			throw new TypeError('invalid instanceSessionId passed to UwotListener contstructor');
		
		}
		else {
		
			if ('object' !== typeof global.Uwot.Listeners) {
			
				global.Uwot.Listeners = {};
			
			}
			if ('object' !== typeof global.Uwot.Listeners[instanceSessionId]) {
			
				global.Uwot.Listeners[instanceSessionId] = {};
			
			}
			if ('object' === typeof global.Uwot.Listeners[instanceSessionId][name]) {
			
				throw new Error('listener name "' + name + '" not unique for isid "' + instanceSessionId + '"');
			
			}
			else {
			
				this.name = name;
				this.isid = instanceSessionId;
				if ('object' !== typeof options || null === options) {
				
					options = Object.assign({}, UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS);
				
				}
				this.type = 'string' === typeof options.type && -1 !== global.Uwot.Constants.listenerTypes.indexOf(options.type) ? options.type : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.type;
				if (this.type === 'default' && (this.name !== 'default' || 'object' === typeof global.Uwot.Listeners[instanceSessionId]['default'])) {
				
					throw new Error('default listener already exists for isid "' + instanceSessionId + '"');
				
				}
				this.parser = 'string' === typeof options.parser  && -1 !== global.Uwot.Constants.listenerParserTypes.indexOf(options.parser) ? options.parser : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.parser;
				this.parserPath = 'string' === typeof options.parserPath ? sanitize.cleanString(options.parserPath) : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.parserPath;
				this.output = 'string' === typeof options.output  && -1 !== global.Uwot.Constants.listenerOutputTypes.indexOf(options.output) ? options.output : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.output;
				this.outputPath = 'string' === typeof options.outputPath ? sanitize.cleanString(options.outputPath) : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.outputPath;
				this.cmdPath = 'string' === typeof options.cmdPath ? sanitize.cleanString(options.cmdPath) : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.cmdPath;
				this.routeUriPath = 'string' === typeof options.routeUriPath ? sanitize.cleanString(options.routeUriPath) : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.routeUriPath;
				this.cmdSet = 'object' === typeof options.cmdSet && Array.isArray(options.cmdSet) ? options.cmdSet : UwotListener.DEFAULT_UWOT_LISTENER_OPTIONS.cmdSet;
				if ('additional' === this.type) {
				
					// TBD
					// verify that each cmdSet entry is unique from global.Uwot.Constants.reserved
					// set parser, output, and router to defaults, as additional listeners can only perform custom logic for commands, not custom parsing or output

				}
				this.cmdFile = require(this.cmdPath);
				switch(this.parser) {
				
					case 'internal':
						this.parserFunction = this.cmdFile[this.parserPath];
						break;
					case 'external':
					default:
						this.parserFunction = require(this.parserPath);
				
				}
				switch(this.output) {
				
					case 'internal':
						this.outputFunction = this.cmdFile[this.outputPath];
						break;
					case 'external':
					default:
						this.outputFunction = require(this.outputPath);
				
				}
				if ('default' === this.type) {
		
					this.status = STATUS_ENABLED;
		
				}
				else {
		
					this.status = STATUS_DISABLED;
		
				}

			}
		
		}
	
	}
	
	handler(args) {
	
		var self = this;		
		if (self.status !== STATUS_ENABLED) {

			return Promise.resolve(null);

		}
		else {

			return new Promise((resolve, reject) => {
			
				if ('string' !== typeof args.cmd) {
				
					return reject(new ListenerError('', {type: 'CMDINV', isid: self.isid, lname: self.name}));
				
				}
				else {
				
					args.cmd = sanitize.cleanString(args.cmd, 1024, '');
				
				}
				if ('function' !== typeof args.app || null === args.app) {
				
					return reject(new ListenerError('', {type: 'APPINV', isid: self.isid, lname: self.name}));
				
				}
				if ('boolean' !== typeof args.isAuthenticated || !args.isAuthenticated) {
				
					args.isAuthenticated = false;
				
				}
				args.userId = sanitize.cleanString(args.userId, 255);
				args.isid = 'string' === typeof args.isid && '' !== args.isid ? sanitize.cleanString(args.isid) : this.isid;
				args.cmdSet = self.cmdSet;
				self.parserFunction(args, function(error, parsedObj) {
				
					if (error) {
					
						return reject(error);
					
					}
					else {
					
						parsedObj.outputHandler = (outputObj) => {
						
							return new Promise((resolve, reject) => {
							
								if ('object' !== typeof outputObj || null === outputObj) {
								
									return resolve(self.outputFunction(''));
								
								}
								else {
								
									try {
									
										return resolve(self.outputFunction(outputObj));
										
									}
									catch(e) {
									
										return reject(e);
									
									}	
								
								}
							
							});
						
						};
						return resolve(parsedObj);
					
					}
				
				});
			
			});
	
		}

	}
	
	enable() {

		if ('default' !== this.type && 'cmdParser' === this.parser) {
	
			this.cmdSet.forEach((cmd) => {
			
				if ('string' === typeof cmd && -1 === global.Uwot.Constants.reserved.indexOf(cmd)) {
				
					global.Uwot.Bin[cmd] = {
						name: cmd,
						execute: (args, opts, app, user, callback, isSudo, isid) => {
						
							if ('function' !== typeof callback) {
							
								throw new TypeError('invalid callback passed to listener for ' + cmd);
							
							}
							else {
							
								return this.cmdFile.handler(cmd, args, opts, app, user, callback, isSudo, isid);
							
							}
						
						},
						// TBD
						// Support option flagss for exclusive listeners?
						matchOpt: function(optString) {
						
							return {
								name: '',
								isOpt: false,
								isLong: false,
								isDefined: false,
								hasArgs: false,
								reqArgs: [],
								optArgs: [],
								assignedArg: ''
							};
						
						}
					};
				
				}
			
			});
	
		}
		this.status = STATUS_ENABLED;
		return this.status;

	}
	
	disable() {
	
		if ('default' !== this.type && 'cmdParser' === this.parser) {
	
			this.cmdSet.forEach((cmd) => {
			
				if ('string' === typeof cmd && -1 === global.Uwot.Constants.reserved.indexOf(cmd)) {
				
					delete global.Uwot.Bin[cmd];
				
				}
			
			});
	
		}
		this.status = STATUS_DISABLED;
		return this.status;
	
	}

}

module.exports = UwotListener;
