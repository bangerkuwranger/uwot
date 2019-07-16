'use-strict';

const AbstractRuntime = require('./AbstractRuntime');
const sanitize = require('../helpers/valueConversion');
const uid = require('uid-safe');
const systemError = require('../helpers/systemError');
const ansiToText = require('../output/ansiToText');

class UwotRuntimeCmds extends AbstractRuntime {

	constructor(ast, user) {
	
		// perform checks against AbstractRuntime spec
		super(ast, user);
		
		// validate ast and its top level structure before parsing; throw error if invalid/undefined
		if ('object' !== typeof ast || ast.type !== 'Script' || 'object' !== typeof ast.commands || !(Array.isArray(ast.commands))) {
		
			throw new TypeError('invalid ast node passed to buildCommands');
		
		}
		else {
		
			// assign ast & user as object props
			this.ast = ast;
			this.user = user;
			// check whether users are allowed to create shell functions by config;
			// if so, add fx property as obj prop and assign empty Map
			// if not, assign false to fx property so those function nodes will be skipped
			// (users assigning functions without being allowed will likely throw an error during execution if they then call those funcs)
			if (global.Uwot.Config.getVal('users', 'allowShellFunctions') && 'string' === typeof this.user.uName) {
			
				if ('guest' === this.user.uName && global.Uwot.Config.getVal('users', 'allowGuest') && global.Uwot.Config.getVal('users', 'allowGuestShellFunctions')) {
				
					this.fx = new Map();
				
				}
				else if ('guest' !== this.user.uName && '' !== this.user.uName) {
				
					this.fx = new Map();
				
				}
				else {
				
					this.fx = false;
				
				}
			
			}
			// begin tree traversal
			this.buildCommands();
		
		}
	
	}
	
	buildCommands() {
	
		// assign empty Map to exes prop
		this.exes = new Map();
		// begin recursive traversal for each node in ast.commands array, assigning exeMap to exes property Map
		for (let i = 0; i < this.ast.commands.length; i++) {
		
			this.exes.set(i, this.parseCommandNode(this.ast.commands[i]));
		
		}
		// also returns its exes array in case we need to use in closure somewhere rather than deferred execution
		return this.exes;

	}
	
	executeCommands(cb) {
	
		// deferred execution starts here, traversing exes Map and returning results
		// this is where the results property is set for the instance, as well
		this.executeMap(this.exes).then((results) => {
		
			this.results = results;
			return cb(results);
		
		});
		
	
	}
	
	// top level logic for sorting each command node by type, then running appropriate parsing method with proper args
	// note all parsed redirects from bourne-style interpretation by AST parser must be passed down here in order to route execution IO in subparser
	parseCommandNode(astCmd, output, input) {

		// throw error if commandNode is invalid or type is not one of the supported types
		if ('object' !== typeof astCmd || -1 === global.Uwot.Constants.commandTypes.indexOf(astCmd.type)) {
	
			throw new TypeError('invalid ast command node passed to parseCommandNode');
	
		}
		else {
	
			// default redirects to null if unset
			output = 'undefined' !== typeof output ? output : null;
			input = 'undefined' !== typeof input ? input : null;
			astCmd.id = uid.sync(24);
			// choose valid type, assign appropriate args, run subparser
			switch(astCmd.type) {
		
				case 'Pipeline':
					return this.parsePipeline(astCmd);
					break;
				case 'LogicalExpression':
					return this.parseConditional(astCmd.type, [astCmd.left, astCmd.right], {op: 'string' === typeof astCmd.op ? astCmd.op : 'and'});
					break;
				case 'Function':
					return this.parseFunction(astCmd);
					break;
				case 'Subshell':
					break;
				case 'For':
					break;
				case 'Case':
					break;
				case 'If':
					var args = {clause: astCmd.clause};
					if ('object' === typeof astCmd.else) {
				
						args.else = astCmd.else;
				
					}
					return this.parseConditional(astCmd.type, astCmd.then, args);
					break;
				case 'While':
					break;
				case 'Until':
					break;
				// default should never run, its a failsafe against inappropriate injection or broken parsing.
				// Command is recursive traversal of additional commands possibly in above node types
				case 'Command':
				default:
					return this.parseCommand(astCmd, output, input);
		
			}
	
		}
	
	}
	
	// parse base command AST node to executable obj in exeMap.
	// most simple commands just use this;
	// more complex controls will also end up calling this more than once
	// note redirects get passed here as well
	parseCommand(astCommand, output, input) {

		var exe = {isOp: false, type: 'Command', isSudo: false};
		exe.name = sanitize.cleanString(astCommand.name.text);
		exe.id = sanitize.cleanString(astCommand.id);
		var args = [];
		if ('string' === typeof exe.name && '' !== exe.name) {
	
			var eom = false;
			if ('sudo' === exe.name) {
		
				if (this.user.maySudo()) {
					exe.input = 'undefined' !== typeof input ? input : null;
					exe.output = 'undefined' !== typeof output ? output : null;
					if ('object' === typeof astCommand.suffix) {
		
						args = args.concat(astCommand.suffix);
		
					}
					if (args.length > 0) {
			
						var sudoCmdWord = args.shift();
						var sudoCmdNode = {
							type: 'Command',
							name: sudoCmdWord,
							suffix: args
						};
				
						exe = this.parseCommandNode(sudoCmdNode, exe.output, exe.input);
						exe.isSudo = true;
					
					}
			
				}
				else {
				
					exe.error = systemError.EPERM({syscall: 'fork'});
				
				}
				return exe;
		
			}
			else if (-1 !== global.Uwot.Constants.cliOps.indexOf(exe.name)) {
		
				exe.isOp = true;
				if ('object' !== typeof astCommand.suffix) {
			
					return exe;
			
				}
				else {
				
					args = args = args.concat(astCommand.suffix);
					if (0 < args.length) {
					
						exe.args = [];
						for (let argIdx = 0; argIdx < args.length; argIdx++) {
					
							if ('Word' === args[argIdx].type) {
							
								exe.args.push(args[argIdx]);
							
							}
					
						}
					
					}
					return exe;
			
				}
		
			}
			else if (-1 !== global.Uwot.Constants.reserved.indexOf(exe.name)) {
		
				exe.input = 'undefined' !== typeof input ? input : null;
				exe.output = 'undefined' !== typeof output ? output : null;
				
				if ('object' === typeof astCommand.prefix) {
		
					args = args.concat(astCommand.prefix);
		
				}
				if ('object' === typeof astCommand.suffix) {
		
					args = args.concat(astCommand.suffix);
		
				}
				if (0 < args.length) {
		
					var cIdx = 0;
					exe.args = [];
					exe.opts = [];
					for (let argIdx = 0; argIdx < args.length; argIdx++) {
				
					
						if (!eom && 'Word' === args[cIdx].type) {
					
							var optMatch = global.Uwot.Bin[exe.name].matchOpt(args[cIdx].text);
							if (optMatch.isOpt) {
					
								if (optMatch.name === '') {
							
									eom = true;
									cIdx++;
							
								}
								else if (optMatch.isDefined) {
							
									var thisOpt = {name: optMatch.name};
									if (optMatch.assignedArg !== '') {
								
										thisOpt.args = optMatch.assignedArg.split(',');
								
									}
									if (optMatch.reqArgs.length > 0) {
								
										var reqCount = optMatch.reqArgs.length;
										if ('object' === typeof thisOpt.args && Array.isArray(thisOpt.args)) {
									
											reqCount = reqCount - thisOpt.args.length;
									
										}
										cIdx++;
										for (let oArgIdx = cIdx; oArgIdx < reqCount; oArgIdx++) {
									
											thisOpt.args.push(args[oArgIdx]);
											cIdx++;
									
										} 
								
									}
									else {
									
										cIdx++;
									
									}
									exe.opts.push(thisOpt);
							
								}
								else {
							
									exe.opts.push({name: optMatch.name});
									cIdx++;
							
								}
					
							}
							else {
					
								exe.args.push(args[cIdx]);
								cIdx++;
					
							}
					
						}
						else if (args[cIdx].type === 'Redirect' && typeof args[cIdx].op.type === 'string') {
						
							var ioFile = args[cIdx].file;
							ioFile.options = {
								noclobber: true,
								append: false
							};
							switch(args[cIdx].op.type) {
							
								case 'lessgreat':
									exe.input = ioFile;
									exe.output = ioFile;
									break;
								case 'less':
									exe.input = ioFile;
									break;
								case 'great':
									exe.output = ioFile;
									break;
								case 'dgreat':
									ioFile.options.append = true;
									exe.output = ioFile;
									break;
								case 'clobber':
									ioFile.options.noclobber = false;
									exe.output = ioFile;
									break;
							
							}
						
						}
						else {
					
							exe.args.push(args[cIdx]);
							cIdx++;
					
						}
				
					}
		
				}
				return exe;
		
			}
			else {
		
				return {error: new Error(exe.name + ': command not found')};
		
			}
	
		}
		else {
	
			return {error: new Error('command is not a string')};
	
		}

	}
	
	// TBD
	parseLoop(loopType, loopNodes) {

		var loopExe = {};
	
		return loopExe;

	}
	
	// TBD
	// execute map and return conditional result as static exe instead of returning exes
	parseConditional(condType, condNodes, condArgs) {

		if ('string' !== typeof condType || ('If' !== condType && 'LogicalExpression' !== condType)) {
	
			throw new TypeError('invalid condType passed to parseConditional');
	
		}
		else if ('object' !== typeof condNodes || !Array.isArray(condNodes)) {
	
			throw new TypeError('invalid condNodes passed to parseConditional');
	
		}
		var condExe = {type: condType, isOp: false};
		if (condType === 'LogicalExpression') {
	
			if ('object' !== typeof condArgs || 'string' !== typeof condArgs.op) {
		
				throw new TypeError('condArgs.op passed to parseConditional must be a string');
		
			}
			else {
		
				condExe.name = 'LogicalExpression';
				condExe.op = ('or' === condArgs.op.toLowerCase() || '||' === condArgs.op) ? 'or' : 'and';
				condExe.left = this.parseCommandNode(condNodes[0]);
				condExe.right = this.parseCommandNode(condNodes[1]);
		
			}
	
		}
		else if (condType === 'If') {
	
			if ('object' !== typeof condArgs || 'object' !== typeof condArgs.clause || !Array.isArray(condArgs.clause) || 'object' !== typeof condNodes || !Array.isArray(condNodes)) {
		
				throw new TypeError('condArgs.clause and condNodes passed to parseConditional must be arrays');
		
			}
			else {
			
				condExe.name = 'If';
				condExe.clause = this.parseCommandNode(condArgs.clause);
				condExe.then = this.parseCommandNode(condNodes);
				if ('object' === typeof condArgs.else && Array.isArray(condArgs.else)) {
			
					condExe.else = this.parseCommandNode(condArgs.else);
			
				}
		
			}
	
		}
		return condExe;

	}
	
	// TBD
	parseFunction(fName, fBody, fRedirect) {

		// check if user is logged in, if allowGuestShellFunctions, etc. is done in constructor.
		// add functions to session functions if not in global reserved names.
		if (this.fx && this.fx instanceof Map) {
	
			var fExe;
	
			return fExe;
	
		}
		else {
	
			return;
	
		}

	}
	
	// TBD
	// execute map and return piped result as static exe instead of returning exes
	parsePipeline(astCommands) {

		if ('object' !== typeof astCommands || !Array.isArray(astCommands)) {
	
			throw new TypeError('astCommands passed to parsePipeline must be an array');
	
		}
		else {
	
			let pipeExes = new Map();
			for (let i = 0; i < astCommands.length; i++) {
		
				var input=null, output=null;
				if (0 < i) {
			
					input = i - 1;
			
				}
				if ((i+1) < astCommands.length) {
			
					output = i + 1;
			
				}
				pipeExes.set(i, this.parseCommandNode(astCommands[i], output, input));
		
			}
			return pipeExes;
	
		}

	}
	
	// TBD
	// This is getting more complex than it needs to be...
	outputLine(output, type) {

		var outLine;
		var outputString;
		type = 'string' === typeof type ? type : 'ansi';
		if ('string' !== typeof output && type !== 'object' && type !== 'ansi') {
	
			outputString = JSON.stringify(output);
	
		}
		else if (type === 'ansi' && 'object' === typeof output && !Array.isArray(output)) {
		
			outputString = JSON.stringify(output);
		
		}
		else {
	
			outputString = output;
	
		}
		if ('ansi' === type) {
	
			outLine = {content: []};
			if (output instanceof Error) {
		
				outLine.content.push({
					content: 'Error:' + "\r\n",
					color: 'red'
				});
				outLine.content.push(output.message);
		
			}
			else if ('object' === typeof output && 'object' === typeof output.content && Array.isArray(output.content)) {
		
				outLine.content.push(output);
		
			}
			else {
		
				outLine.content.push(outputString);
		
			}
			outLine.content.push({tag: 'br'});
	
		}
		else if ('object' === type) {
	
			outLine = 'object' === typeof output ? output : {content: output};
	
		}
		else {
	
			outLine = outputString;
	
		}
		return outLine;

	}

	// run deferred processing of the exe objects in the given map, outputting to a type specified in second arg.
	executeMap(exeMap, outputType) {

		// default to object with output property that is assigned objects for the ansi output parser
		outputType = 'string' === typeof outputType ? outputType : 'ansi';
		return new Promise(async (resolve, reject) => {
		
			// make sure the map is a Map
			if ('object' !== typeof exeMap && !(exeMap instanceof Map)) {
	
				resolve([this.outputLine(new TypeError('exeMap passed to executeMap must be an instance of Map'), outputType)]);
	
			}
			else {
	
				// create results container
				var results = {
					output: [],
					operations: [],
					cookies: {}
				};
				// return empty object if map has no keys
				if (exeMap.size < 1) {
		
					resolve(results);
		
				}
				// otherwise, begin iteration
				else {
		
					// j is external iterator incremented upon complete execution of a cmd
					var j = 0;
					// i is internal iterator incremented upon commencement of exeMap key processing
					for (let i = 0; i < exeMap.size; i++) {
		
						// exe is a node with cmd and metadata for processing it, including args, opts, whether it is an operation, redirect i/o, etc.
						var exe = exeMap.get(i);
						// if it's not a non-null object, it's not a valid exe. add an error to results.output array and move on to the next exe
						if ('object' !== typeof exe || null === exe) {
			
							results.output.push(this.outputLine(new TypeError('exe with index ' + i + ' is invalid'), outputType));
							j++;
							if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
			
						}
						// if exe generated an error during the AST parsing, add it to results.output and move on to the next exe
						else if ('undefined' !== typeof exe.error) {
			
							results.output.push(this.outputLine(exe.error, outputType));
							j++;
							if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
			
						}
						// still good to go? wonders may never cease... begin pre-execution logic
						else {
			
							// isOp flag indicated this node is an operation (client-side), not a command (server-side)
							// if it is true, user is logged in, guests are allowed, or the login operation is ongoing...
							// then add the whole node (arga and all) to results.operations and add a line to results.output to indicate operation was approved
							if (exe.isOp) {
				
								if (this.user.uName !== 'guest' || exe.name === 'login' || global.Uwot.Config.getVal('users', 'allowGuest')) {
					
									results.output.push(this.outputLine('operation ' + exe.name, outputType));
									results.operations.push(exe);
									j++;
									if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
								}
								// if user isn't allowed, just move on to the next. this should be a quick loop...
								else {
							
									j++;
									if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
							
								}
				
							}
							// this isn't a drill (or an operation). The node is a command, and the server is gonna have to do stuff.
							else {
				
								// ...unless user isn't allowed. check again whether
								// user is logged in or guests are allowed
								if (this.user.uName !== 'guest' || global.Uwot.Config.getVal('users', 'allowGuest')) {
					
									var inputData, outputData;
									try {
								
										inputData = await this.getInputForExe(exe.input, this.user._id);
								
									}
									catch(inputError) {
								
										results.output.push(this.outputLine(inputError, 'object'));
										j++;
										if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
								
									}
									if ('string' === typeof inputData) {
								
										exe.args.unshift(inputData);
								
									}
									try {
							
										global.Uwot.Bin[exe.name].execute(exe.args, exe.opts, this.app, this.user, async function(error, result) {
						
											if (error) {
							
												outputData = this.outputLine(error, outputType);
							
											}
											else if ('sudo' === exe.name) {
							
												outputData = result;
							
											}
											else if ('string' === typeof result.outputType && 'object' === result.outputType) {
										
												if ('string' === typeof result.redirect) {
											
													results.redirect = result.redirect;
													delete result.redirect;
											
												} 
												if ('object' === typeof result.cookies && null !== result.cookies) {
											
													var cnames = Object.keys(result.cookies);
													cnames.forEach(function(cname) {
												
														results.cookies[cname] = result.cookies[cname];
												
													});
													delete result.cookies;
											
												}
												if ('object' === typeof result.output) {
										
													outputData = this.outputLine(result.output, outputType);
										
												}
												else {
											
													outputData = this.outputLine(result, 'object');
											
												}
										
											}
											else if ('object' === typeof result.output) {
										
												outputData = this.outputLine(result.output, outputType);
										
											}
											else {
							
												outputData = this.outputLine(result, outputType);
							
											}
											if ('object' === typeof result && null !== result && 'string' === typeof result.cwd) {
										
												results.cwd = result.cwd;
										
											}
											try {
										
												var consoleOutput = await this.getConsoleOutputForExe(outputData, exe.output, this.user._id);
												results.output.push(exe.output === null ? consoleOutput : this.outputLine(consoleOutput, outputType));
												j++;
												// when execution is completed for all exe commands, we can return the results object
												if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
										
											}
											catch(outputError) {
										
												results.output.push(this.outputLine(outputError, outputType));
												j++;
												// when execution is completed for all exe commands, we can return the results object
												if (j >= exeMap.size) {
			
													// if after all of that there's no output or operations and user isn't allowed to do stuff
													// it means guests are disallowed by config and user isn't authenticated.
													// poke the user with a stick so they log in.
													if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
														results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
													}
													// return results to the caller.
													resolve(results);
			
												}
										
											}
						
										}.bind(this), exe.isSudo, this.isid);
					
									}
									catch(e) {
					
										results.output.push(this.outputLine(e, outputType));
										j++;
										// when execution is completed for all exe commands, we can return the results object
										if (j >= exeMap.size) {
			
											// if after all of that there's no output or operations and user isn't allowed to do stuff
											// it means guests are disallowed by config and user isn't authenticated.
											// poke the user with a stick so they log in.
											if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
												results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
											}
											// return results to the caller.
											resolve(results);
			
										}
					
									}
					
								}
								// if a user can't do stuff, don't do stuff and move on to the next thing they can't do
								else {
							
									j++;
									// when execution is completed for all exe commands, we can return the results object
									if (j >= exeMap.size) {
			
										// if after all of that there's no output or operations and user isn't allowed to do stuff
										// it means guests are disallowed by config and user isn't authenticated.
										// poke the user with a stick so they log in.
										if (results.output.length < 1 && results.operations.length < 1 && this.user.uName === 'guest' && !global.Uwot.Config.getVal('users', 'allowGuest')) {
			
											results.output.push(this.outputLine(new Error('config does not allow guest users. use the "login" command to begin your session.'), outputType));
			
										}
										// return results to the caller.
										resolve(results);
			
									}
							
								}
				
							}
			
						}
					
		
					}
		
				}
	
			}
		
		});

	}
	
	fileOutputConsoleString(fileName, opts, successful) {
	
		var consoleOutput = 'output to ' + fileName + ' via ';
		if (successful) {
		
			if (opts.append) {
			
				consoleOutput += 'append was successful';
			
			}
			else if (opts.noclobber) {
			
				consoleOutput += 'new file write was successful';
			
			}
			else {
			
				consoleOutput += 'file overwrite was successful';
			
			}
		
		}
		else {
		
			if (opts.append) {
			
				consoleOutput += 'append failed';
			
			}
			else if (opts.noclobber) {
			
				consoleOutput += 'new file write failed';
			
			}
			else {
			
				consoleOutput += 'file overwrite failed';
			
			}
		
		}
		return consoleOutput;
	
	}
	
	getConsoleOutputForExe(outputData, exeOutput, userId) {
	
		return new Promise((resolve, reject) => {
		
			if ('object' !== typeof exeOutput) {
		
				reject(new TypeError('invalid output object passed to getConsoleOutputForExe'));
		
			}
			else if (null === exeOutput) {
			
				resolve(outputData);
			
			}
			else if ('string' !== typeof exeOutput.text) {
		
				reject(new TypeError('invalid output filename passed to getConsoleOutputForExe'));
		
			}
			else if ('object' !== typeof exeOutput.options || null === exeOutput.options) {
		
				reject(new TypeError('invalid output options passed to getConsoleOutputForExe'));
		
			}
			else {
		
				var fsError;
				var outputText = ansiToText(outputData, 'object');
				if (exeOutput.options.append) {
			
					fsError = global.Uwot.FileSystems[this.user._id].append(exeOutput.text, outputText);
			
				}
				else {
			
					var fullPath =  global.Uwot.FileSystems[userId].resolvePath(exeOutput.text, true);
					var exists = true;
					if (fullPath instanceof Error && 'string' === typeof fullPath.code && 'ENOENT' === fullPath.code) {
				
						exists = false;
				
					}
					if (exeOutput.options.noclobber && exists) {
			
						fsError = new Error('cannot overwrite: file exists and noclobber is true');
			
					}
					else if (!exists || !exeOutput.options.noclobber) {
				
						fsError = global.Uwot.FileSystems[userId].write(exeOutput.text, outputText);
				
					}
			
				}
				if (fsError instanceof Error) {
			
					fsError.message = this.fileOutputConsoleString(exeOutput.text, exeOutput.options) + ' - ' + fsError.message;
					reject(fsError);
			
				}
				else {
			
					resolve(this.fileOutputConsoleString(exeOutput.text, exeOutput.options, true));
			
				}
		
			}
		
		});
	
	}
	
	getInputForExe(exeInput, userId) {
	
		return new Promise((resolve, reject) => {
		
			if ('object' === typeof exeInput && null !== exeInput && 'string' === typeof exeInput.type && exeInput.type === 'Word') {
			
				try {
				
					var inputData = global.Uwot.FileSystems[userId].readFile(exeInput.text);
					if (inputData instanceof Error) {
					
						reject(inputData);
					
					}
					else {
					
						resolve(inputData);
					
					}
				
				}
				catch(e) {
				
					reject(e);
				
				}
			
			}
			else if (null === exeInput) {
			
				resolve(null);
			
			}
			else {
			
				reject(new TypeError('exe input "' + exe.text + '" is invalid'));
			
			}
		
		});
	
	}

}

module.exports = UwotRuntimeCmds;
