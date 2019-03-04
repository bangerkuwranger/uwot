var express = require('express');
var router = express.Router();
const Url = require('url');
const nonceHandler = require('node-timednonce');
const cmdParser = require('../middleware/cmdParser');
const ansiParser = require('../middleware/ansi');
const denyAllOthers = require('../middleware/denyAllOthers');


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
	
		if ('string' === typeof req.body.nonce) {
			var nv = nonceHandler.verify('index-get', req.body.nonce);
			if (nv && 'object' !== typeof nv) {
			
				if ('object' === typeof req.body.cmdAst) {
				
					resObj.output = {content: []};
					if ("development" === global.process.env.NODE_ENV) {
					
						resObj.output.content.push({content: 'CMD Verified. AST: ', color: 'cyan'}, {tag:'br'}, {tag:'br'}, JSON.stringify(req.body.cmdAst), {tag:'br'}, {tag:'br'});
					
					}
					// TBD
					// take req.body.cwd and apply it to user's filesystem if it is not a match to current vcwd.
					if ('object' === typeof req.body.runtime && 'object' === typeof req.body.runtime.exes) {
					
						if ("development" === global.process.env.NODE_ENV) {
						
							resObj.output.content.push({content: 'EXES: ', color: 'cyan'}, {tag:'br'});
							for (let i = 0; i < req.body.runtime.exes.size; i++) {
						
								resObj.output.content.push({tag:'br'}, JSON.stringify(req.body.runtime.exes.get(i)));
								if ((i + 1) >= req.body.runtime.exes.size) {
								
									resObj.output.content.push({tag:'br'}, {tag:'br'});
								
								}
						
							}

						}
						req.body.runtime.executeCommands();
						if ('object' === typeof req.body.runtime.results) {
							
							if ('object' === typeof req.body.runtime.results.output && Array.isArray(req.body.runtime.results.output) && req.body.runtime.results.output.length > 0) {
							
								req.body.runtime.results.output.forEach(function(ol) {
								
									if ('object' === typeof ol && 'object' === typeof ol.content && Array.isArray(ol.content) && ('object' === typeof ol.content[0] || ('string' === typeof ol.content[0] && !ol.content[0].startsWith('operation')))) {
									
										resObj.output.content.push(ol, {tag:'br'});
									
									}
								
								});
							
							}
							resObj.operations = [];
							if ('object' === typeof req.body.runtime.results.operations && Array.isArray(req.body.runtime.results.operations) && req.body.runtime.results.operations.length > 0) {
						
								for (let i = 0; i < req.body.runtime.results.operations.length; i++) {
						
// 									resObj.output.content.push({tag:'br'}, JSON.stringify(req.body.runtime.results.operations[i]));
									if ('object' === typeof req.body.runtime.results.operations[i] && Array.isArray(req.body.runtime.results.operations[i])) {
							
										req.body.operations = req.body.runtime.results.operations[i].map((x) => ({ name: x.name, args: 'object' === typeof x.args ? x.args : [] };));
							
									}
									else if ('object' === typeof req.body.runtime.results.operations[i] && null !== req.body.runtime.results.operations[i]) {
							
										req.body.operations = req.body.runtime.results.operations[i];
										req.body.operations.args = 'object' === typeof req.body.operations.args ? req.body.operations.args : [];
							
									}
									if ('string' === typeof req.body.operations) {
				
										resObj.operations.push(req.body.operations);
				
									}
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
							if ('object' === typeof req.body.runtime.results.cookies && null !== req.body.runtime.results.cookies) {
							
								resObj.cookies = req.body.runtime.results.cookies;
							
							}
							if ('string' === typeof req.body.runtime.results.redirect) {
							
								resObj.redirect = Url.parse(req.body.runtime.results.redirect, global.Uwot.Config.getConfigServerOrigin());
							
							}
							if ('string' === typeof req.body.runtime.results.cwd) {
							
								resObj.cwd = req.body.runtime.results.cwd;
							
							}
						
						}
					
					}
				
				}
				else if ('' === req.body.cmd) {
				
					resObj.output = {
						content: {tag:'br'}
					};
				
				}
				else {
				
					resObj.output = {
						content: ['CMD Verified: ', req.body.cmd, {tag:'br'}]
					};
				
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
		
	}
	return res.ansi(resObj);

});

if ('object' === typeof global.Uwot.Bin && Object.keys(global.Uwot.Bin).length > 0) {

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

router.all('/', denyAllOthers(req, res, next));

module.exports = router;
