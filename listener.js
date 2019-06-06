'use strict';
var express = require('express');
var router = express.Router();
var path = require('path');
var Datastore = require('nedb-core');
var uid = require('uid-safe');
var sanitize = require('./helpers/valueConversion');
const processRequest = require('./middleware/requestProcessor');
const denyAllOthers = require('./middleware/denyAllOthers');
const defaultUwotListenerOptions = {
	type:			'default',
	parser:			'cmdParser',
	parserPath:		path.join(global.Uwot.Constants.appRoot, 'middleware/cmdParser'),
	output:			'ansi',
	outputPath:		path.join(global.Uwot.Constants.appRoot, 'middleware/ansi'),
	routerPath:		path.join(global.Uwot.Constants.appRoot, 'routers/path'),
	routeUriPath:	'/bin',		//path relative to /listeners or /path.........
	cmdSet: 		global.Uwot.Constants.reserved
};

const STATUS_DISABLED = 'disabled';
const STATUS_ENABLED = 'enabled';

class UwotListener {

	constructor(name, instanceSessionId, options) {
	
		if ('string' !== typeof name) {
		
			throw new TypeError('invalid name passed to UwotCliListener contstructor');
		
		}
		else if ('string' !== typeof instanceSessionId) {
		
			throw new TypeError('invalid instanceSessionId passed to UwotCliListener contstructor');
		
		}
		else {
		
			if ('object' !== typeof global.Uwot.Listeners) {
			
				global.Uwot.Listeners = {};
			
			}
			if ('object' !== typeof global.Uwot.Listeners[instanceSessionId]) {
			
				global.Uwot.Listeners[instanceSessionId] = {};
			
			}
			if ('object' === typeof global.Uwot.Listeners[instanceSessionId][name]) {
			
				throw new Error ('listener name "' + name + '" not unique for isid "' + instanceSessionId + '"');
			
			}
			else {
			
				this.name = name;
				if ('object' === typeof options && null !== options) {
				
					options = Object.assign({}, defaultUwotListenerOptions);
				
				}
				this.type = 'string' === typeof options.type && -1 !== global.Uwot.Constants.listenerTypes.indexOf(options.type) ? options.type : defaultUwotListenerOptions.type;
				if (this.type === 'default' && (this.name !== 'default' || 'object' === typeof global.Uwot.Listeners[instanceSessionId]['default'])) {
				
					throw new Error('default listener already exists for isid "' + instanceSessionId + '"');
				
				}
				this.parser = 'string' === typeof options.parser  && -1 !== global.Uwot.Constants.listenerParserTypes.indexOf(options.parser) ? options.parser : defaultUwotListenerOptions.parser;
				this.parserPath = 'string' === typeof options.parserPath ? sanitize.cleansString(options.parserPath) : defaultUwotListenerOptions.parserPath;
				this.output = 'string' === typeof options.output  && -1 !== global.Uwot.Constants.listenerOutputTypes.indexOf(options.output) ? options.output : defaultUwotListenerOptions.output;
				this.outputPath = 'string' === typeof options.outputPath ? sanitize.cleansString(options.outputPath) : defaultUwotListenerOptions.outputPath;
				this.routerPath = 'string' === typeof options.routerPath ? sanitize.cleansString(options.routerPath) : defaultUwotListenerOptions.routerPath;
				this.routeUriPath = 'string' === typeof options.routeUriPath ? sanitize.cleansString(options.routeUriPath) : defaultUwotListenerOptions.routeUriPath;
				this.cmdSet = 'object' === typeof cmdSet && Array.isArray(cmdSet) ? cmdSet : defaultUwotListenerOptions.cmdSet;
				if ('additional' === this.type) {
				
					// TBD
					// verify that each cmdSet entry is unique from global.Uwot.Constants.reserved
					// reroute calls to those commands via this listener

				}
				var cmdFile = require(this.routerPath);
				var parserMiddleware;
				switch(this.parser) {
				
					case 'internal':
						parserMiddleware = cmdFile[this.parserPath];
						break;
					case 'external':
						parserMiddleware = require(this.parserPath);
						break;
					default:
						parserMiddleware = require(this.parserPath);
				
				}
				var outputMiddleware;
				switch(this.output) {
				
					case 'internal':
						outputMiddleware = cmdFile[this.outputPath];
						break;
					case 'external':
						outputMiddleware = require(this.outputPath);
						break;
					default:
						outputMiddleware = require(this.outputPath);
				
				}
				this.router = router;
				var self = this;
				this.router.post('/', function(req, res, next) {
				
					if (self.status !== STATUS_ENABLED) {
					
						denyAllOthers(req,res, next);
					
					}
					else {
					
						next();
					
					}
				
				}, parserMiddleware(), outputMiddleware(), processRequest());
				this.router.all('/', denyAllOthers());
				if ('default' === this.type) {
				
					this.status = STATUS_ENABLED;
				
				}
				else {
				
					this.status = STATUS_DISABLED;
				
				}
						
			}
		
		}
	
	}
	
	enable() {

		if ('default' !== this.type) {
		
			this.status = STATUS_ENABLED;
		
		};
		return true;

	}
	
	disable() {
	
		if ('default' !== this.type) {
		
			this.status = STATUS_DISABLED;
		
		};
		return true;
	
	}

}

module.exports = UwotListener;
