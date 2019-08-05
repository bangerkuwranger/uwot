const Url = require('url');

function executeRuntime(runtime) {

	return new Promise(function(resolve, reject) {
	
		runtime.executeCommands(function(runtimeResults) {
		
			if (runtimeResults instanceof Error) {
			
				return reject(runtimeResults)
			
			}
			return resolve(runtimeResults);
		
		});
		
	
	});

}

module.exports = function(args) {

	return function(req, res, next) {

		// default response assigned to res.uwotObj
		res.uwotObj = {
			output: {
				color: 'yellow',
				content: 'Invalid Request'
			}
		};
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd) {

			// check that cmd was parsed to AST
			if ('object' === typeof req.uwot && 'object' === typeof req.uwot.cmdAst && null !== req.uwot.cmdAst)  {
	
				// add ast ansi obj to output content array if in dev
				if ("development" === global.process.env.NODE_ENV) {
		
					// empty output obj and its content
					res.uwotObj.output = {content: []};
					res.uwotObj.output.content.push({content: 'CMD Verified. AST: ', color: 'cyan'}, {tag:'br'}, {tag:'br'}, JSON.stringify(req.uwot.cmdAst), {tag:'br'}, {tag:'br'});
		
				}
				// TBD
				// take req.body.cwd and apply it to user's filesystem if it is not a match to current vcwd.
				// check that runtime and exes were generated from parsed AST, begin processing if so
				if ('object' === typeof req.uwot.runtime && null !== req.uwot.runtime && 'object' === typeof req.uwot.runtime.exes) {
			
					// if in dev mode, generate exes as ansi objs and push to output.content
					if ("development" === global.process.env.NODE_ENV) {
			
						res.uwotObj.output.content.push({content: 'EXES: ', color: 'cyan'}, {tag:'br'});
						for (let i = 0; i < req.uwot.runtime.exes.size; i++) {
			
							res.uwotObj.output.content.push({tag:'br'}, JSON.stringify(req.uwot.runtime.exes.get(i)));
							if ((i + 1) >= req.uwot.runtime.exes.size) {
					
								res.uwotObj.output.content.push({tag:'br'}, {tag:'br'});
					
							}
			
						}

					}
					else {
					
						// empty output obj and its content since it wasn't done prior to runtime check
						res.uwotObj.output = {content: []};
					
					}
					// execute the commands in the runtime exes; this is where deferred execution happens
					// results must be an object
					executeRuntime(req.uwot.runtime).then((results) => {
					
						if ('object' === typeof results) {
				
							// results.output must be a non-empty array
							if ('object' === typeof results.output && Array.isArray(results.output) && results.output.length > 0) {
				
								// process output lines from results.output to push to res.uwotObj.output.content array
								results.output.forEach(function(ol) {
					
									// only push ol if it is an object with prop content that is an array with first element either an object or string beginning with 'operation'
									if ('object' === typeof ol && 
									'object' === typeof ol.content && 
									Array.isArray(ol.content) && 
									('object' === typeof ol.content[0] || 
										('string' === typeof ol.content[0] && 
										!ol.content[0].startsWith('operation'))
										)
									) {
						
										res.uwotObj.output.content.push(ol, {tag:'br'});
						
									}
					
								});
				
							}
							// process operations to response object operations array
							res.uwotObj.operations = [];
							// first check that runtime results.operations is a non-empty array
							if ('object' === typeof results.operations && Array.isArray(results.operations) && results.operations.length > 0) {
			
								// then loop through operations, building final operations in req.body.operations
								for (let i = 0; i < results.operations.length; i++) {
			
	// 									res.uwotObj.output.content.push({tag:'br'}, JSON.stringify(results.operations[i]));
									// if element is an array, map its elements to an array of objects in req.body.operations
									if ('object' === typeof results.operations[i] && Array.isArray(results.operations[i])) {
				
										req.body.operations = results.operations[i].map((x) => ({ name: x.name, args: 'object' === typeof x.args ? x.args : [] }));
				
									}
									// if element is a non-null, non-array object, assign to req.body.operations and validate args
									else if ('object' === typeof results.operations[i] && null !== results.operations[i]) {
				
										req.body.operations = results.operations[i];
										req.body.operations.args = 'object' === typeof req.body.operations.args ? req.body.operations.args : [];
				
									}
									// if req.body.operations is a string, push string to operations
									if ('string' === typeof req.body.operations) {
	
										res.uwotObj.operations.push(req.body.operations);
	
									}
									// this is typical situation... non-null obj should be in req.body.operations now: 
									// if it is an array, tack its elements onto our empty res.uwotObj.operations; 
									// if not, push the whole object to res.uwotObj.operations and we're done here
									else if ('object' === typeof req.body.operations && null !== req.body.operations) {
	
										if (Array.isArray(req.body.operations)) {
					
											res.uwotObj.operations = res.uwotObj.operations.concat(req.body.operations);
					
										}
										else {
					
											res.uwotObj.operations.push(req.body.operations);
					
										}
	
									}
			
								}
				
							}
							// if there are any cookies to set in userland... add them to res.uwotObj
							if ('object' === typeof results.cookies && null !== results.cookies) {
				
								res.uwotObj.cookies = results.cookies;
				
							}
							// if there are any user redirects, add them to res.uwotObj
							if ('string' === typeof results.redirect) {
				
								res.uwotObj.redirect = Url.parse(results.redirect, global.Uwot.Config.getConfigServerOrigin());
				
							}
							// if the runtime results return the current working directory for VFS
							// (which it always SHOULD)
							// add that to our res.uwotObj
							if ('string' === typeof results.cwd) {
				
								res.uwotObj.cwd = results.cwd;
				
							}
							// if runtime didn't include the CWD for some reason, get it here
							else {
						
								// get user id from res.locals
								var uid = req.isAuthenticated() && 'object' === typeof res.locals && 'string' === typeof res.locals.userId && '' !== res.locals.userId ? res.locals.userId : null;
								// get the filesystem for response user
								var userFs = global.Uwot.FileSystems[uid];
								// double check that the FS is instantiated, then get the VFS CWD and add it to res.uwotObj
								if('object' === typeof userFs && null !== userFs && 'function' === typeof userFs.getVcwd) {
					
									res.uwotObj.cwd = userFs.getVcwd();
					
								}
				
							}
							return res.ansi(res.uwotObj, res);
						
						}
						else {
						
							res.uwotObj.error = new Error('invalid results returned');
							return res.ansi(res.uwotObj);
						
						}
						
					}).catch((e) => {
					
						res.uwotObj.error = e;
						return res.ansi(res.uwotObj, res);
					
					});
					
					
		
				}
				else {
				
					return res.ansi(res.uwotObj, res);
				
				}
	
			}
			// catch empty cmd and return a <br>
			else if ('' === req.body.cmd) {
	
				res.uwotObj.output = {tag: 'br'};
				return res.ansi(res.uwotObj, res);
	
			}
			// not parsed to AST but not empty, so just let user know we heard it
			// but no further processing
			else {
	
				res.uwotObj.output = {
					content: ['CMD Verified: ', req.body.cmd, {tag:'br'}]
				};
				return res.ansi(res.uwotObj, res);
	
			}
	
		}
		else {
		
			res.ansi(res.uwotObj);
		
		}
		// Finally. res.uwotObj should have everything the frontend needs to process response, so we parse output prop to html and send the whole ball o' wax to the user as JSON
		// parse res.uwotObj.output to html string from ansi objects, and respond with res.uwotObj encoded as JSON
		
	};

};

Object.defineProperty(module.exports, 'executeRuntime', {
	writable: true,
	value: executeRuntime
});
