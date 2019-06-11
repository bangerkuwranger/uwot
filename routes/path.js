// handles default listeners and any active additional listeners

var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const ansiParser = require('../middleware/ansi');
var ansiOutput = require('../output/ansi');
const requestProcessor = require('../middleware/requestProcessor');
const denyAllOthers = require('../middleware/denyAllOthers');

const sendAsAnsi = function(body, res) {

	return res.json(ansiOutput(body));

};

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

router.post(
	'/',
	ansiParser(),
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
		if ('object' !== req.uwot || null === req.uwot) {
		
			req.uwot = {};
		
		}
		if ('object' !== req.uwot.listeners || null === req.uwot.listeners) {
		
			req.uwot.listeners = {};
		
		}
		// check that we have an instanceSession and related listeners
		if ('string' === typeof res.locals.instanceSessionId && 'object' === typeof global.Uwot.Listeners[res.locals.instanceSessionId]) {
		
			var reqListeners = Object.keys(global.Uwot.Listeners[res.locals.instanceSessionId]);
			var hasAdditional = false;
			for (let i = 0; i < reqListeners.length; i++) {
			
				var thisListener = global.Uwot.Listeners[res.locals.instanceSessionId][reqListeners[i]];
				switch(thisListener.type) {
				
					case 'exclusive':
						if (thisListener.status === 'enabled') {
						
							// reject request if an exclusive listener is active
						
						}
						break;
					case 'default':
						req.listeners.default = thisListener;
						break;
					default:
						if (thisListener.status === 'enabled') {
						
							req.listeners[reqListeners[i]] = thisListener;
							hasAdditional = true;
						
						}
				
				}
				if ((i + 1) >= reqListeners.length) {
				
					var args = {
						cmd: req.body.cmd,
						isAuthenticated: req.isAuthenticated(),
						userId: 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null,
						app: 'function' === typeof req.app ? req.app : null
					};
					if (hasAdditional) {
						
						// run default parser
						// get outstanding cmds and match to commandSets of additional parsers
						// if unmatched commands, return error
						// else merge runtimes with each additional listener
						// set res.ansi to respond with output
					
					}
					else {
					
						req.listeners.default.handler(args).then((resultObj) => {

							if (resultObj instanceof Error) {
							
								var errorObj = {
									output: {
										color: 'red',
										content: resultObj.message
									}
								};
								return sendAsAnsi(errorObj, res);
							
							}
							req.uwot.cmdAst = resultObj.cmdAst;
							req.uwot.runtime = resultObj.runtime;
							req.uwot.outputHandler = resultObj.outputHandler;
							res.ansi = (outputObj, resp) => {

								return resultObj.outputHandler(outputObj).then((jsonOutput) => {
	
									if (jsonOutput instanceof Error) {
									
										var errorObj = {
											output: {
												color: 'red',
												content: jsonOutput.message
											}
										};
										return sendAsAnsi(errorObj, resp);
									
									}
									return resp.json(jsonOutput);
	
								}).catch((outputError) => {
	
									var errorObj = {
										output: {
											color: 'red',
											content: 'Output Error: ' + outputError.message
										}
									};
									return sendAsAnsi(errorObj, resp);
	
								});

							};
							return next();

						}).catch((parserError) => {

							var errorObj = {
								output: {
									color: 'red',
									content: 'Parser Error: ' + parserError.message
								}
							};
							return sendAsAnsi(errorObj, res);

						});
					
					}
				
				}
			
			}
		
		}

	},
	requestProcessor()

);

router.all('/', denyAllOthers());

module.exports = router;
