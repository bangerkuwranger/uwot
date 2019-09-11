// handles active exclusive listeners only

var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../middleware/denyAllOthers');
const ListenerError = require('../helpers/UwotListenerError');
const requestProcessor = require('../middleware/requestProcessor');
var ansiOutput = require('../output/ansi');

const sendAsAnsi = function(body, res) {

	return res.json(ansiOutput(body));

};

router.post('/:isid/:lname', function(req, res, next) {

	var reqIsid, reqLname, denied = false;
	// if isid is invalid, reject request
	if ('string' !== typeof req.params.isid) {
	
		denied = new ListenerError('', {type: 'NOISID', reason: 'ISID not in request path'});
		return res.json(denied);
	
	}
	// if listener name is invalid, reject request
	else if ('string' !== typeof req.params.lname) {
	
		denied = new ListenerError('', {type: 'NOLNAME', reason: 'Listener Name not in request path'});
		return res.json(denied);
	
	}
	// if no nonce, reject request
	else if ('object' !== typeof req.body || 'string' !== typeof req.body.nonce) {
	
		denied = new ListenerError('', {type: 'NONONCE', reason: 'Nonce not in request body', isid: req.params.isid, lname: req.params.lname});
		return res.json(denied);
	
	}
	else {
	
		reqIsid = req.params.isid;
		reqLname = req.params.lname;
	
	}
	// if nonce is invalid, reject request
	var nv = nonceHandler.verify(reqIsid + '-listener-' + reqLname, req.body.nonce);
	if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
	
		denied = new ListenerError('Invalid Nonce', {type: 'NONCEINV', isid: reqIsid, lname: reqLname, reason: nv.message});
		return res.json(denied);
	
	}
	// otherwise, get listener and continue processing request
	else {
	
		if ('object' !== typeof req.uwot) {
		
			req.uwot = {};
		
		}
		if ('object' !== typeof req.uwot.listeners || !(Array.isArray(req.uwot.listeners))) {
		
			req.uwot.listeners = {};
		
		}
		// deny if not an exclusive listener
		if ('string' !== typeof global.Uwot.Listeners[reqIsid][reqLname].type || 'exclusive' !== global.Uwot.Listeners[reqIsid][reqLname].type) {
		
			denied = new ListenerError('', {type: 'NOTEXCL', isid: reqIsid, lname: reqLname});
			return res.json(denied);
		
		}
		else {
		
			res.locals.instanceSessionId = reqIsid;
			req.uwot.listeners[reqLname] = (global.Uwot.Listeners[reqIsid][reqLname]);
			var args = {
				cmd: req.body.cmd,
				isAuthenticated: req.isAuthenticated(),
				userId: 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null,
				app: 'function' === typeof req.app ? req.app : null,
				isid: reqIsid
			};
			global.Uwot.Listeners[reqIsid][reqLname].handler(args).then((resultObj) => {
			
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

}, requestProcessor());

router.all('/', denyAllOthers());

module.exports = router;
