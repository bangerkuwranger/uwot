'use strict';
const path = require('path');
const binLoader = require('../../helpers/binLoader');

const validBuiltins = [
	'cd',
	'pwd',
	'help',
	'printf'
];

const builtinConstructorArgs = {
	cd: [
		{
			name:				'cd',
			description:		'Change working directory.',
			requiredArguments:	['directory'],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	pwd: [
		{
			name:				'pwd',
			description:		'Print working directory to console.',
			requiredArguments:	[],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	help: [
		{
			name:				'help',
			description:		'Display helpful information about builtin commands.',
			requiredArguments:	['pattern'],
			optionalArguments:	[]
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	],
	printf: [
		{
			name:				'printf',
			description:		'Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process.',
			requiredArguments:	['format'],
			optionalArguments:	['arguments']
		},
		[],
		path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
	]
};

class UwotCmdCd extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, user, callback, isSudo, isid) {
	
		var argsArray = 'object' === typeof args ? this.argsObjToNameArray(args) : null;
		global.Uwot.FileSystems[user._id].cmd('cd', argsArray, function(error) {
		
			if (error) {
			
				callback(error, null);
			
			}
			else {
			
				var newCwd = global.Uwot.FileSystems[user._id].getVcwd();
				var executeResult = {
					output: '',
					cwd: newCwd
				};
				executeResult.output += 'changed directory to ' + newCwd;
				return callback(false, executeResult);
			
			}
		
		}, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdPwd extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, user, callback, isSudo, isid) {
	
		global.Uwot.FileSystems[user._id].cmd('pwd', [], function(error, pwdString) {
		
			if (error) {
			
				callback(error, null);
			
			}
			else {
			
				return callback(false, pwdString);
			
			}
		
		}, isSudo);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdHelp extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}

	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to help');
		
		}
		else if ('object' !== typeof args || !Array.isArray(args)) {
		
			return this.help(callback);
		
		}
		var argsArray = 'object' === typeof args ? this.argsObjToNameArray(args) : null;
		if (binLoader.isValidBin(argsArray[0])) {
		
			return global.Uwot.Bin[argsArray[0]].help(callback);
		
		}
		else {
		
			return callback(new Error('invalid command: ' + argsArray[0]));
		
		}
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
}

class UwotCmdPrintf extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
	
	}
	
	help(callback) {
	
		return super.help(callback);
	
	}
	
	stripQuotes(quotedStr) {
	
		if ('string' !== typeof quotedStr) {
		
			return quotedStr;
		
		}
		else if (quotedStr.charAt(0) === '"' && quotedStr.charAt(quotedStr.length - 1) === '"') {
		
			return quotedStr.substr(1, quotedStr.length - 2);
		
		}
		else if (quotedStr.charAt(0) === "'" && quotedStr.charAt(quotedStr.length - 1) === "'") {
		
			return quotedStr.substr(1, quotedStr.length - 2);
		
		}
		else {
		
			return quotedStr;
		
		}
	
	}
	
	unescapeString(escStr) {
	
		var finalString = escStr;
		const escChars = [
			'\\\\',
			'\\n',
			'\\r',
			'\\t',
			'\\"',
			"\\'",
			"\\?"
		];
		const escCharMap = {
			'\\\\': '&bsol;',
			'\\n': '&NewLine;',
			'\\r': '',
			'\\t': '&Tab;',
			'\\"': '&quot;',
			"\\'": '&apos;',
			"\\?": '&quest;'
		};
		escChars.forEach(function(escChar) {
		
			finalString = finalString.split(escChar).join(escCharMap[escChar]);
		
		});
		return finalString;
	
	}
	
	unsDecNum(inputStr) {
	
		return Math.abs(parseFloat(inputStr)).toString(10);
	
	}
	
	sigDecNum(inputStr) {
	
		return parseFloat(inputStr).toString(10);
	
	}
	
	unsOctNum(inputStr) {
	
		return Math.abs(parseFloat(inputStr)).toString(8);
	
	}
	
	unsHexNum(inputStr, casing) {
	
		var result = parseFloat(inputStr);
		if ('string' !== typeof casing || casing !== 'upper') {
		
			return result.toString(16);
		
		}
		else {
		
			return result.toString(16).toUpperCase();
		
		}
	
	}
	
	floatNum(inputStr) {
	
		return parseFloat(inputStr).toString(10);
	
	}
	
	doubleNum(inputStr, casing, sci) {
	
		var result = parseFloat(inputStr);
		if ('boolean' === typeof sci && sci) {
		
			return 'string' !== typeof casing || casing !== 'upper' ? result.toExponential() : result.toExponential().toUpperCase();
		
		}
		else {
		
			return result.toString(10);
		
		}
	
	}

	charStr(inputStr) {
	
		return inputStr.charAt(0);
	
	}
	
	replaceSub(subPattern, argsArray) {
	
		var sub;
		var replaceWith = '';
		switch (subPattern) {
	
			case 'b':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.unescapeString(this.stripQuotes(sub));
			
				}
				break;
			case 'i':
			case 'd':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.sigDecNum(this.stripQuotes(sub));
			
				}
				break;
			case 'o':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.unsOctNum(this.stripQuotes(sub));
			
				}
				break;
			case 'u':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.unsDecNum(this.stripQuotes(sub));
			
				}
				break;
			case 'x':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.unsHexNum(this.stripQuotes(sub));
			
				}
				break;
			case 'X':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.unsHexNum(this.stripQuotes(sub), 'upper');
			
				}
				break;
			case 'f':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.floatNum(this.stripQuotes(sub));
			
				}
				break;
			case 'g':
			case 'e':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.doubleNum(this.stripQuotes(sub), 'lower', true);
			
				}
				break;
			case 'G':
			case 'E':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.doubleNum(this.stripQuotes(sub), 'upper', true);
			
				}
				break;
			case 'c':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.charStr(this.stripQuotes(sub));
			
				}
				break;
			case 's':
				sub = argsArray.shift();
				if ('string' === typeof sub && '' !== sub) {
			
					replaceWith = this.stripQuotes(sub);
			
				}
				break;
			case '%':
				replaceWith = '&percnt;';
				break;
			default:
				return new Error('unexpected format placeholder %' + subPattern);
	
		}
		return replaceWith;
	
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to printf');
		
		}
		else if ('object' !== typeof args || !Array.isArray(args)) {
		
			return this.help(callback);
		
		}
		var argsArray = 'object' === typeof args ? this.argsObjToNameArray(args) : null;
		if ('string' === typeof argsArray[0]) {
		
			var format = argsArray.shift();
			var finalString;
			// strip single quotes if wrapped in single quotes
			// string double quotes if wrapped in double quotes
			finalString = this.stripQuotes(format);
			// replace escapes in format
			finalString = this.unescapeString(finalString);
			var hasSubs = -1 !== finalString.indexOf('%');
			if (!hasSubs) {
			
				return callback(false, finalString);
			
			}
// 			var compareString = finalString;
			// array split by placeholder char ("%")
			var charArray = Array.from(finalString);
			finalString = '';
			// each member split by space char
			// parse substitutions by following chars and perform on placeholder strings
			var phArray = [];
			var priorStr = '';
			for (let i = 0; i < charArray.length; i++) {
			
				var ch = charArray[i];
				if ('%' === ch) {
				
					phArray.push(priorStr);
					priorStr = '';
					var thisPh = charArray[i + 1];
					var thisSub = this.replaceSub(thisPh, argsArray);
					if ('string' !== typeof thisSub) {
					
						i = charArray.length;
						return callback(thisSub, null);
					
					}
					else {
					
						i++;
						phArray.push(thisSub);
					
					}
				
				}
				else {
				
					priorStr += ch;
				
				}
			
			}
			phArray.push(priorStr);
			// consolidate members to finalString
			finalString = phArray.join('');
			return callback(false, finalString);
		
		}
		else {
		
			return callback(new Error('invalid format: ' + argsArray[0]));
		
		}
	
	}
	
}

class UwotCmdBuiltin extends global.Uwot.Exports.Cmd {

	constructor( cmdObj, cmdOpts, cmdPath ) {
	
		super(
			cmdObj,
			cmdOpts,
			cmdPath
		);
		
		// Super don't do this; these are other commands that don't have an assoc. file
		// add each builtin directly to global.Uwot.Bin 
		global.Uwot.Bin.cd = new UwotCmdCd(...builtinConstructorArgs.cd);
		global.Uwot.Bin.pwd = new UwotCmdPwd(...builtinConstructorArgs.pwd);
		global.Uwot.Bin.help = new UwotCmdHelp(...builtinConstructorArgs.help);
		global.Uwot.Bin.printf = new UwotCmdPrintf(...builtinConstructorArgs.printf);
		
	}
	
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to bin/builtin/execute');
		
		}
		var biName = '';
		var biArgs = [];
		var biOpts = [];
		if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
		
			biName = 'object' === typeof args[0] && 'string' === typeof args[0].text ? args[0].text.trim() : biName;
			if (biName === '') {
			
				this.help(function(error, helpOutput) {
				
					if (error) {
					
						return callback(error, null);
					
					}
					else {
					
						return callback(false, helpOutput);
					
					}
				
				}.bind(this));
			
			}
			else if(args.length > 1) {
			
				//loop through addtl args and set to biArgs for execution
			
			}
			if ('object' === typeof options && Array.isArray(options) && options.length > 0) {
		
				for (let i = 0; i < options.length; i++) {
				
					// parse options and assign to biOpts for execution of bi
			
				}
			
			}
			if (-1 !== validBuiltins.indexOf(biName)) {
			
				return global.Uwot.Bin[biName].execute(biArgs, biOpts, app, callback);
			
			}
			else {
			
				return callback(new Error('invalid builtin'), null);
			
			}
		
		}
		else {
		
			this.help(function(error, helpOutput) {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else {
				
					return callback(false, helpOutput);
				
				}
			
			}.bind(this));
		
		}
	
	}
	
	help(callback) {
	
		super.help(function(error, helpOutput) {
		
			if (error) {
			
				return callback(error, null);
			
			}
			else if ('object' === typeof helpOutput && null !== helpOutput) {
			
				return callback(false, helpOutput);
			
			}
			else {
			
				return callback(false, {output: '*** Help system currently unavailable. ***', isBold: true});
			
			}
		
		}.bind(this));
	
	}
	
}

var builtin = new UwotCmdBuiltin(
	{
		name:				'builtin',
		description:		'Run builtin commands in the running uwot process. This differs from ACTUAL shells in that most logical, memory, user, and process management builtins are implemented elsewhere (e.g. login/logout) or not implemented at all.',
		requiredArguments:	['shell-builtin'],
		optionalArguments:	['shell-builtin-args']
	},
	[],
	path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/builtin')
);

module.exports = builtin;
