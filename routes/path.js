var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const cmdParser = require('../middleware/cmdParser');

const operations = [
	"clear",
	"history"
];

router.post('/', cmdParser(), function(req, res, next) {

	var resObj = {
		output: '<span class="ansi fg-yellow">Invalid Request</span>',
		operation: null
	};
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		if ('string' == typeof req.body.nonce) {
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' != typeof nv) {
			
				if ('object' == typeof req.body.cmdAst) {
				
					resObj.output = 'CMD Verified: ' + "\n\r" + JSON.stringify(req.body.cmdAst);
				
				}
				else {
				
					resObj.output = 'CMD Verified: ' + req.body.cmd;
				
				}
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

if ('object' == typeof global.UwotBin && Object.keys(global.UwotBin).length > 0) {

	var binPathKeys = Object.keys(global.UwotBin);
	for (let i = 0; i < binPathKeys.length; i++) {
	
		router.use('/' + binPathKeys[i], global.UwotBin[binPathKeys[i]]);
	
	}

}

router.all('/', function (req, res, next) {

	var denied = '';
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		denied += req.body.cmd.trim() + ': '; 
	
	}
	denied += '<span class="ansi fg-red">Permission Denied</span>';
	return res.json(denied);

});

module.exports = router;
