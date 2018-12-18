var express = require('express');
var router = express.Router();
const nonceHandler = require('node-timednonce');
const cmdParser = require('../middleware/cmdParser');
const ansiParser = require('../middleware/ansi');


router.post(
	'/',
	cmdParser(),
	ansiParser(),
	function(req, res, next) {

	var resObj = {
		output: {
			color: 'yellow',
			content: 'Invalid Request'
		}
	};
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		if ('string' == typeof req.body.nonce) {
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' != typeof nv) {
			
				if ('object' == typeof req.body.cmdAst) {
				
					resObj.output = {
						content: ['CMD Verified: ', {tag:'br'}, JSON.stringify(req.body.cmdAst)]
					};
				
				}
				else if ('' === req.body.cmd) {
				
					resObj.output = {
						content: {tag:'br'}
					}
				
				}
				else {
				
					resObj.output = {
						content: 'CMD Verified: ' + req.body.cmd
					};
				
				}
				if ('string' === typeof req.body.operations) {
				
					resObj.operations = req.body.operations;
				
				}
				else if ('object' == typeof req.body.operations && null !== req.body.operations) {
				
					resObj.operations = req.body.operations;
				
				}
				
			
			}
			else if ('object' == typeof nv && false === nv.status && 'string' == typeof nv.message) {
			
				resObj.output = {
					color: 'yellow',
					content: 'Invalid Request -' + nv.message
				}
			
			}
			
		}
		else {
		
			resObj.output = {
				color: 'yellow',
				content: 'Invalid Request - Reload'
			};
		
		}
		
	}
	return res.ansi(resObj);

});

if ('object' == typeof global.UwotBin && Object.keys(global.UwotBin).length > 0) {

	var binPathKeys = Object.keys(global.UwotBin);
	for (let i = 0; i < binPathKeys.length; i++) {
	
		router.post('/' + binPathKeys[i], function(req, res, next) {
		
			global.UwotBin[binPathKeys[i]].execute(req.body.args, req.body.options, function(error, results) {
			
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

router.all('/', function (req, res, next) {

	var denied = '';
	if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {
	
		denied += req.body.cmd.trim() + ': '; 
	
	}
	denied += '<span class="ansi fg-red">Permission Denied</span>';
	return res.json(denied);

});

module.exports = router;
