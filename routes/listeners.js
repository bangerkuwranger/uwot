var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../middleware/denyAllOthers');
const ListenerError = require('../helpers/UwotListenerError');
var listenerObj;

router.post('/:isid/:lname', function(req, res, next) {

	var denied = false;
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
	// if nonce is invalid, reject request
	var nv = nonceHandler.verify('get-listener-' + req.params.lname, req.body.nonce);
	if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
	
		denied = new ListenerError('Invalid Nonce', {type: 'NONCEINV', isid: req.params.isid, lname: req.params.lname, reason: nv.message});
		return res.json(denied);
	
	}
	// otherwise, run handler and return results
	else {
	
		listenerObj = global.Uwot.Listeners[req.params.isid][req.params.lname];
		next();
	
	}

}, listenerObj.handler(), listenerObj.parserHandler(), listenerObj.outputHandler(), function(req, res, next) {

	var resObj = {
		cmd: req.body.cmd,
		cmdAst: req.body.cmdAst,
		runtime: req.body.runtime,
		operations: req.body.operations
	};
	return res.json(resObj);

});

router.all('/', denyAllOthers());

module.exports = router;
