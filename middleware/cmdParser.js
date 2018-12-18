const bashParser = require('bash-parser');
const minimist = require('minimist');
const sanitize = require('../helpers/valueConversion');
const filesystem = require('../filesystem');
const commandTypes = [
	'LogicalExpression',
	'Pipeline',
	'Command',
	'Function',
	'Subshell',
	'For',
	'Case',
	'if',
	'While',
	'Until'
];

module.exports = function(args) {

	return function(req, res, next) {
	
		if ('object' === typeof req.body && 'string' === typeof req.body.cmd && '' !== req.body.cmd) {
	
			req.body.cmdAst = bashParser(req.body.cmd);
			var cmdString = req.body.cmd.trim();
			var cmdArray = cmdString.split(' ');
			if (cmdArray.some(r=> global.UwotCliOps.includes(r))) {
		
				if (cmdArray.length === 1) {
				
					req.body.operations = cmdString;
				
				}
				else {
				
					//simple parsing, won't do args and any non-ops words get skipped
					req.body.operations = cmdArray;
				
				}
		
			}
	
		}
		next();
	
	};

}



function parseCommandNode(astCmd, output, input) {

	if ('object' !== typeof astCmd || -1 === commandTypes.indexOf(astCmd.type)) {
	
		throw new TypeError('invalid ast command node passed to parseCommandNode');
	
	}
	else {
	
		output = 'undefined' != typeof output ? output : null;
		input = 'undefined' != typeof input ? input : null;
		switch(astCmd.type) {
		
			case 'Pipeline':
				return parsePipeline(astCmd);
				break;
			case 'LogicalExpression':
				return parseConditional(astCmd.type, [astCmd.left, astCmd.right], {op: 'string' == typeof astCmd.op ? astCmd.op : 'and'});
				break;
			case 'Function':
				break;
			case 'Subshell':
				break;
			case 'For':
				break;
			case 'Case':
				break;
			case 'If':
				var args = {clause: astCmd.clause};
				if ('object' == typeof astCmd.else) {
				
					args.else = astCmd.else;
				
				}
				return parseConditional(astCmd.type, astCmd.then, args);
				break;
			case 'While':
				break;
			case 'Until':
				break;
			case 'Command':
			default:
				return parseCommand(astCmd, output, input);
		
		}
	
	}

}

function parseCommand(astCommand, output, input) {

	var exe = {isOp: false, type: 'Command'};
	exe.name = sanitize.cleanString(astCommand.name.text);
	if ('string' == typeof exe.name && '' !== exe.name) {
	
		if (-1 !== global.UwotCliOps.indexOf(exe.name)) {
		
			exe.isOp = true;
			return exe;
		
		}
		else if (-1 !== global.UwotReserved.indexOf(exe.name)) {
		
			exe.input = 'undefined' != typeof input ? input : null;
			exe.output = 'undefined' != typeof output ? output : null;
			var args = [];
			if ('object' == typeof astCommand.prefix) {
		
				args = args.concat(astCommand.prefix);
		
			}
			if ('object' == typeof astCommand.suffix) {
		
				args = args.concat(astCommand.suffix);
		
			}
			if (0 < args.length) {
		
				var cIdx = 0;
				var eom = false;
				exe.args = [];
				exe.opts = [];
				for (let argIdx = 0; argIdx < args.length; argIdx++) {
				
					
					if (!eom) {
					
						var optMatch = global.UwotBin[exe.name].matchOpt(args[cIdx]);
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
								
									reqCount = optMatch.reqArgs.length;
									if ('object' == thisOpt.args) {
									
										reqCount = reqCount - thisOpt.args.length;
									
									}
									cIdx++;
									var eoa = false;
									for (let oArgIdx = cIdx; oArgIdx < reqCount; oArgIdx++) {
									
										thisOpt.args.push(args[oArgIdx]);
										cIdx++;
									
									} 
								
								}
								exe.opts.push(thisOpt)
							
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
					else {
					
						exe.args.push(args[cIdx]);
						cIdx++;
					
					}
				
				}
		
			}
			return exe;
		
		}
		else {
		
			return {error: new Error('command not found')}
		
		}
	
	}
	else {
	
		return {error: new Error('command is not a string')};
	
	}

}

function parseLoop(loopType, loopNodes) {

	var loopExe = {};
	
	return loopExe;

}

// TBD
// execute map and return conditional result as static exe instead of returning exes
function parseConditional(condType, condNodes, condArgs) {

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
			condExe.left = parseCommandNode(condNodes[0]);
			condExe.right = parseCommandNode(condNodes[1]);
		
		}
	
	}
	else if (condType == 'If') {
	
		if ('object' !== typeof condArgs || 'object' !== typeof condArgs.clause || !Array.isArray(condArgs.clause) || 'object' !== typeof condNodes || !Array.isArray(condNodes)) {
		
			throw new TypeError('condArgs.clause and condNodes passed to parseConditional must be arrays');
		
		}
		else {
			
			condExe.name = 'If';
			condExe.clause = parseCommandNode(condArgs.clause);
			condExe.then = parseCommandNode(condNodes);
			if ('object' == typeof condArgs.else && Array.isArray(condArgs.else)) {
			
				condExe.else = parseCommandNode(condArgs.else);
			
			}
		
		}
	
	}
	return condExe;

}

function parseFunction (fName, fBody, fRedirect) {

	if (global.UwotConfig.get('users', 'allowShellFunctions')) {
	
		var fExe;
	
		return fExe;
	
	}
	// TBD
	// check if user is logged in, if allowGuestShellFunctions, etc.
	// add functions to session functions if not in global reserved names.
	else {
	
		return;
	
	}

}

// TBD
// execute map and return piped result as static exe instead of returning exes
function parsePipeline(astCommands) {

	if ('object' != typeof astCommands || !Array.isArray(astCommands)) {
	
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
			pipeExes.set(i, parseCommandNode(astCommands[i], output, input));
		
		}
		return pipeExes;
	
	}

}

function outputLine(output, type) {

	var outLine;
	type = 'string' == typeof type ? type : 'ansi';
	if (string !== typeof output && type !== 'object') {
	
		var outputString = JSON.stringify(output);
	
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
		else if ('object' == typeof output && 'object' == output.content && Array.isArray(output.content)) {
		
			outLine.content.push(output);
		
		}
		else {
		
			outLine.content.push(outputString);
		
		}
		outLine.content.push("\r\n");
	
	}
	else if ('object' === type) {
	
		outLine = 'object' == typeof output ? output : {content: output};
	
	}
	else {
	
		outLine = outputString;
	
	}
	return outLine;

}

function executeMap(exeMap, outputType) {

	outputType = 'string' == typeof outputType ? outputType : 'ansi';
	if ('object' !== typeof exeMap && !(exeMap instanceof Map)) {
	
		return [outputLine(new TypeError('exeMap passed to executeMap must be an instance of Map'), outputType)];
	
	}
	else {
	
		var results = {
			output: [],
			operations: []
		};
		var promiseMap = new Map();
		for (let i = exeMap.size; i > 0; i--) {
		
			if ('object' !== typeof exe || null === exe) {
			
				results.output.push(outputLine(new TypeError('exe with index ' + key + ' is invalid'), outputType));
			
			}
			else {
			
				if (exe.isOp) {
				
					results.operations.push(exe.name);
				
				}
				else {
				
					if (null === exe.input) {
					
						if (null === exe.output) {
						
							try {
							
								global.UwotBin[exe.name].execute(exe.args, exe.opts, function(error, result) {
								
									if (error) {
									
										results.output.push(outputLine(error, outputType));
									
									}
									else {
									
										resutls.output.push(outputLine(result, outputType));
									
									}
								
								})
							
							}
							catch(e) {
							
								results.output.push(outputLine(e, outputType));
							
							}
						
						}
						else if ('string' == typeof exe.output) {
						
							//attempt to output to file using synchronous user filesystem
						
						}
						else if ('number' == typeof exe.output) {
						
							//attempt to output to map[exe.output]
						
						}
						else {
						
							results.output.push(outputLine(new TypeError('exe with index ' + key + ' has invalid output'), outputType));
						
						}
					
					}
				
				}
			
			}
		
		}
	
	}

}

class UwotRuntimeCmds {

	constructor(ast) {
	
		if ('object' !== typeof ast || ast.type !== 'Script' || 'object' !== typeof ast.commands || !(Array.isArray(ast.commands))) {
		
			throw new TypeError('invalid ast node passed to buildCommands');
		
		}
		else {
		
			this.ast = ast;
		
		}
		
	
	}
	
	buildCommands() {
	
		this.exes = new Map();
		for (let i = 0; i < this.ast.commands.length; i++) {
		
			this.exes.set(i, parseCommandNode(ast.commands[i]));
		
		}

	}

}

