var express = require('express');
var router = express.Router();
const Url = require('url');
const nonceHandler = require('node-timednonce');
const cmdParser = require('../middleware/cmdParser');
const ansiParser = require('../middleware/ansi');
const requestProcessor = require('../middleware/requestProcessor');
const denyAllOthers = require('../middleware/denyAllOthers');
const request = require('request-promise-native');

function sendToListeners(listeners, req) {

	return new Promise((resolve, reject) => {
	
		req.nonces = {};
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
		
			if (listeners.length === 1) {
		
				var onlyListener = listeners[0];
				if (onlyListener.status !== 'enabled') {
				
					reject('disabled');
				
				}
				else {
				
					req.nonces[onlyListener.name] = nonceHandler.create( 'get-listener-' + onlyListener.name, 10000 );
					var opts = {
						uri: global.Uwot.Config.getConfigServerOrigin() + 'listeners/' + onlyListener.instanceSessionId + '/' + onlyListener.name,
						body: {
							nonce: req.nonces[onlyListener.name],
							cmd: req.cmd
						},
						json: true
					};
					request.post(opts).then((response) => {
					
						if ('object' === typeof req.listenerResponses && Array.isArray(req.listenerResponses)) {
						
							req.listenerResponses.push(response);
						
						}
						else {
						
							req.listenerResponses = [response];
						
						}
						resolve(req.listenerResponses);
					
					}).catch((e) => {
					
						reject('e');
					
					});
				
				}
				
		
			}
			else {
		
				var thisListener = listeners.shift();
				if ('object' !== typeof req.listenerResponses || Array.isArray(req.listenerResponses)) {
				
					req.listenerResponses = [];
				
				}
				if (thisListener.status !== 'enabled') {
				
					reject('disabled');
				
				}
				else {
				
					req.nonces[thisListener.name] = nonceHandler.create( 'get-listener-' + thisListener.name, 10000 );
					var opts = {
						uri: global.Uwot.Config.getConfigServerOrigin() + 'listeners/' + thisListener.instanceSessionId + '/' + thisListener.name,
						body: {
							nonce: req.nonces[thisListener.name],
							cmd: req.cmd
						},
						json: true
					};
					request.post(opts).then((response) => {
					
						req.listenerResponses.push(response);
						sendToListeners(listeners, req).then((result) => {
						
							return resolve(req.listenerResponses);
						
						});
					
					}).catch((e) => {
					
						reject('e');
					
					});
				
				}
					
			}
	
		}
		else {
	
			reject('cmdempty');
	
		}
	
	});

};

router.post(
	'/',
	function(req, res, next) {

		// default response assigned to resObj
		var resObj = {
			output: {
				color: 'yellow',
				content: 'Invalid Request'
			}
		};
		var nv;
		// verify form nonce
		if ('string' !== typeof req.body.nonce) {
		
			// if nonce not present in req, assing invalid nonce response to resObj
			resObj.output = {
				color: 'yellow',
				content: 'Invalid Request - Reload'
			};
		
		}
		else {
		
			nv = nonceHandler.verify('index-get', req.body.nonce);
		
		}
		if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
	
			// return nonce error if not verified
			resObj.output = {
				color: 'yellow',
				content: 'Invalid Request -' + nv.message
			};
			if ('function' !== typeof res.ansi) {
			
				return ansiParser(req, res, function(req, res, next) {
			
					return res.ansi(resObj);
			
				});
			
			}
			else {
			
				return res.ansi(resObj);
			
			}
	
		}
		res.locals.instanceSessionId = ('object' === typeof req.cookies && 'string' === typeof req.cookies.instanceSessionId) ?
			req.cookies.instanceSessionId :
			'';
		req.body.uwotListeners = ('' !== res.locals.instanceSessionId &&'object' === typeof global.Uwot.Listeners && 'object' === typeof global.Uwot.Listeners[res.locals.instanceSessionId]) ?
			global.Uwot.Listeners[res.locals.instanceSessionId] :
			{};
		// check that we have an instanceSession and related listeners
		if ('string' === typeof res.locals.instanceSessionId && 'object' === typeof global.Uwot.Listeners[res.locals.instanceSessionId]) {
		
			var reqListeners = Object.keys(global.Uwot.Listeners[res.locals.instanceSessionId]);
			var dListener, eListener, aListeners = [];
			for (let i = 0; i < reqListeners.length; i++) {
			
				var thisListener = global.Uwot.Listeners[res.locals.instanceSessionId][reqListeners[i]];
				switch(thisListener.type) {
				
					case 'exclusive':
						if (thisListener.status === 'enabled') {
						
							eListener = thisListener;
						
						}
						break;
					case 'default':
						dListener = thisListener;
						break;
					default:
						if (thisListener.status === 'enabled') {
						
							aListeners.push(thisListener);
						
						}
				
				}
				if ((i + 1) >= reqListeners.length) {
				
					if ('object' === typeof eListener) {
					
						listeners = [eListener];
						sendToListeners([eListener], req, res, next);
					
					}
					else if (aListeners.length > 0) {
					
						aListeners.push(dListener);
						listeners = aListeners;
						return sendToListeners(req, res, next);
					
					}
					else {
					
						listeners = [dListener];
						return sendToListeners(req, res, next);
					
					}
				
				}
			
			}
		
		}
		// if no valid listeners for a valid isid can be found, process the old way, likely returning an error msg
		else if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
		
			// check that cmd was parsed to AST
			if ('object' === typeof req.body.cmdAst) {
		
				// empty output obj and its content
				resObj.output = {content: []};
				// add ast ansi obj to output content array if in dev
				if ("development" === global.process.env.NODE_ENV) {
			
					resObj.output.content.push({content: 'CMD Verified. AST: ', color: 'cyan'}, {tag:'br'}, {tag:'br'}, JSON.stringify(req.body.cmdAst), {tag:'br'}, {tag:'br'});
			
				}
				// TBD
				// take req.body.cwd and apply it to user's filesystem if it is not a match to current vcwd.
				// check that runtime and exes were generated from parsed AST, begin processing if so
				if ('object' === typeof req.body.runtime && 'object' === typeof req.body.runtime.exes) {
				
					// if in dev mode, generate exes as ansi objs and push to output.content
					if ("development" === global.process.env.NODE_ENV) {
				
						resObj.output.content.push({content: 'EXES: ', color: 'cyan'}, {tag:'br'});
						for (let i = 0; i < req.body.runtime.exes.size; i++) {
				
							resObj.output.content.push({tag:'br'}, JSON.stringify(req.body.runtime.exes.get(i)));
							if ((i + 1) >= req.body.runtime.exes.size) {
						
								resObj.output.content.push({tag:'br'}, {tag:'br'});
						
							}
				
						}

					}
					// execute the commands in the runtime exes; this is where deferred execution happens
					req.body.runtime.executeCommands();
					// results must be an object
					if ('object' === typeof req.body.runtime.results) {
					
						// results.output must be a non-empty array
						if ('object' === typeof req.body.runtime.results.output && Array.isArray(req.body.runtime.results.output) && req.body.runtime.results.output.length > 0) {
					
							// process output lines from results.output to push to resObj.output.content array
							req.body.runtime.results.output.forEach(function(ol) {
						
								// only push ol if it is an object with prop content that is an array with first element either an object or string beginning with 'operation'
								if ('object' === typeof ol && 
								'object' === typeof ol.content && 
								Array.isArray(ol.content) && 
								('object' === typeof ol.content[0] || 
									('string' === typeof ol.content[0] && 
									!ol.content[0].startsWith('operation'))
									)
								) {
							
									resObj.output.content.push(ol, {tag:'br'});
							
								}
						
							});
					
						}
						// process operations to response object operations array
						resObj.operations = [];
						// first check that runtime results.operations is a non-empty array
						if ('object' === typeof req.body.runtime.results.operations && Array.isArray(req.body.runtime.results.operations) && req.body.runtime.results.operations.length > 0) {
				
							// then loop through operations, building final operations in req.body.operations
							for (let i = 0; i < req.body.runtime.results.operations.length; i++) {
				
// 									resObj.output.content.push({tag:'br'}, JSON.stringify(req.body.runtime.results.operations[i]));
								// if element is an array, map its elements to an array of objects in req.body.operations
								if ('object' === typeof req.body.runtime.results.operations[i] && Array.isArray(req.body.runtime.results.operations[i])) {
					
									req.body.operations = req.body.runtime.results.operations[i].map((x) => ({ name: x.name, args: 'object' === typeof x.args ? x.args : [] }));
					
								}
								// if element is a non-null, non-array object, assign to req.body.operations and validate args
								else if ('object' === typeof req.body.runtime.results.operations[i] && null !== req.body.runtime.results.operations[i]) {
					
									req.body.operations = req.body.runtime.results.operations[i];
									req.body.operations.args = 'object' === typeof req.body.operations.args ? req.body.operations.args : [];
					
								}
								// if req.body.operations is a string, push string to operations
								if ('string' === typeof req.body.operations) {
		
									resObj.operations.push(req.body.operations);
		
								}
								// this is typical situation... non-null obj should be in req.body.operations now: 
								// if it is an array, tack its elements onto our empty resObj.operations; 
								// if not, push the whole object to resObj.operations and we're done here
								else if ('object' === typeof req.body.operations && null !== req.body.operations) {
		
									if (Array.isArray(req.body.operations)) {
						
										resObj.operations = resObj.operations.concat(req.body.operations);
						
									}
									else {
						
										resObj.operations.push(req.body.operations);
						
									}
		
								}
				
							}
					
						}
						// if there are any cookies to set in userland... add them to resObj
						if ('object' === typeof req.body.runtime.results.cookies && null !== req.body.runtime.results.cookies) {
					
							resObj.cookies = req.body.runtime.results.cookies;
					
						}
						// if there are any user redirects, add them to resObj
						if ('string' === typeof req.body.runtime.results.redirect) {
					
							resObj.redirect = Url.parse(req.body.runtime.results.redirect, global.Uwot.Config.getConfigServerOrigin());
					
						}
						// if the runtime results return the current working directory for VFS
						// (which it always SHOULD)
						// add that to our resObj
						if ('string' === typeof req.body.runtime.results.cwd) {
					
							resObj.cwd = req.body.runtime.results.cwd;
					
						}
						// if runtime didn't include the CWD for some reason, get it here
						else {
							
							// get user id from res.locals
							var uid = req.isAuthenticated() && 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null;
							// get the filesystem for response user
							var userFs = global.Uwot.FileSystems[uid];
							// double check that the FS is instantiated, then get the VFS CWD and add it to resObj
							if('object' === typeof userFs && null !== userFs && 'function' === typeof userFs.getVcwd) {
						
								resObj.cwd = userFs.getVcwd();
						
							}
					
						}
				
					}
			
				}
		
			}
			// catch empty cmd and return a <br>
			else if ('' === req.body.cmd) {
		
				resObj.output = {
					content: {tag:'br'}
				};
		
			}
			// not parsed to AST but not empty, so just let user know we heard it
			// but no further processing
			else {
		
				resObj.output = {
					content: ['CMD Verified: ', req.body.cmd, {tag:'br'}]
				};
		
			}
			if ('function' !== typeof res.ansi) {
			
				return ansiParser(req, res, function(req, res, next) {
			
					return res.ansi(resObj);
			
				});
			
			}
			else {
			
				return res.ansi(resObj);
			
			}
		
		}
		if ('function' !== res.ansi) {
		
			return ansiParser(req, res, function(req, res, next) {
			
				return res.ansi(resObj);
			
			});
		
		}
		else {
		
			return res.ansi(resObj);
		
		}

	}

);

// check if Bins are loaded to global
if ('object' === typeof global.Uwot.Bin && Object.keys(global.Uwot.Bin).length > 0) {

	// assign route for each Bin to path /bin/[binName]
	var binPathKeys = Object.keys(global.Uwot.Bin);
	for (let i = 0; i < binPathKeys.length; i++) {
	
		router.post('/' + binPathKeys[i], function(req, res, next) {
		// TBD
		// get/set req.session.vfsCwd
			global.Uwot.Bin[binPathKeys[i]].execute(req.body.args, req.body.options, req.app, function(error, results) {
			
				if (error) {
				
					return res.json(error);
				
				}
				else {
				
					return res.json(results);
				
				}
			
			});
		
		});
	
	}

}

router.all('/', denyAllOthers());

module.exports = router;
