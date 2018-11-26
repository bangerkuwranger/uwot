var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');

const operations = [
	"clear",
	"history"
];

//to be replaced by AST parsed logic
router.post('/', function(req, res, next) {

	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		var cmdString = req.body.cmd.trim();
		if (-1 != operations.indexOf(cmdString)) {
		
			req.body.operation = cmdString;
		
		}
	
	}
	next();

});

router.post('/', function(req, res, next) {

	var resObj = {
		output: '<span class="ansi fg-yellow">Invalid Request</span>',
		operation: null
	};
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		if ('string' == typeof req.body.nonce) {
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' != typeof nv) {
			
				resObj.output = 'CMD Verified: ' + req.body.cmd;
				if ('string' === typeof req.body.operation) {
				
					resObj.operation = req.body.operation;
				}
				
			
			}
			else if ('object' == typeof nv && false === nv.status && 'string' == typeof nv.message) {
			
				resObj.output = '<span class="ansi fg-yellow">Invalid Request - ' + nv.message + '</span>';
			
			}
		}
		else {
		
			resObj.output = '<span class="ansi fg-red">Invalid Request - Reload</span>';
		
		}
	
	}
	return res.json(resObj);

});

router.all('/', function (req, res, next) {

	var denied = '';
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		denied += req.body.cmd.trim() + ': '; 
	
	}
	denied += '<span class="ansi fg-red">Permission Denied</span>';
	return res.json(denied);

});

module.exports = router;
