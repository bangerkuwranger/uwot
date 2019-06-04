var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const denyAllOthers = require('../middleware/denyAllOthers');

router.post('/get', function(req, res, next) {

	// default response assigned to resObj
	var resObj = {
		output: {
			color: 'yellow',
			content: 'Invalid Request'
		}
	};

	// verify form nonce
	if ('object' === typeof req.body && 'string' === typeof req.body.nonce) {
	
		var nv = nonceHandler.verify('index-get', req.body.nonce);
		if (nv && 'object' !== typeof nv) {
		
			if ('string' === typeof req.body.listener) {
			
				// get details for specific listener
			
			}
			else {
			
				// get current listener(s)
			
			}
		
		}
		else if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
		
			resObj.output = {
				color: 'yellow',
				content: 'Invalid Request -' + nv.message
			};
	
		}
	
	}
	else {
	
		resObj.output = {
			color: 'yellow',
			content: 'Invalid Request - Reload'
		};

	}
	// Finally. resObj should have everything the frontend needs to process response, so we parse output prop to html and send the whole ball o' wax to the user as JSON
		// parse resObj.output to html string from ansi objects, and respond with resObj encoded as JSON
	return res.ansi(resObj);

});

router.all('/get', denyAllOthers());

router.post('/set', function(req, res, next) {

	// default response assigned to resObj
	var resObj = {
		output: {
			color: 'yellow',
			content: 'Invalid Request'
		}
	};

	// verify form nonce
	if ('object' === typeof req.body && 'string' === typeof req.body.nonce) {
	
		var nv = nonceHandler.verify('index-get', req.body.nonce);
		if (nv && 'object' !== typeof nv) {
		
			if ('string' === typeof req.body.listener) {
			
				// get details for specific listener
			
			}
			else {
			
				// get current listener(s)
			
			}
		
		}
		else if ('object' === typeof nv && false === nv.status && 'string' === typeof nv.message) {
		
			resObj.output = {
				color: 'yellow',
				content: 'Invalid Request -' + nv.message
			};
	
		}
	
	}
	else {
	
		resObj.output = {
			color: 'yellow',
			content: 'Invalid Request - Reload'
		};

	}
	// Finally. resObj should have everything the frontend needs to process response, so we parse output prop to html and send the whole ball o' wax to the user as JSON
		// parse resObj.output to html string from ansi objects, and respond with resObj encoded as JSON
	return res.ansi(resObj);

});

router.all('/set', denyAllOthers());

router.all('/', denyAllOthers());

module.exports = router;
