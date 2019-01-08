'use strict';
var fs = require('fs');
var path = require('path');
var sanitize = require('./helpers/valueConversion');
if ('undefined' == typeof global.UwotBin) {
	global.UwotBin = {};
}

class UwotCmdCommand {

	constructor(
		name,
		description,
		requiredArguments,
		optionalArguments
	) {
	
		this.name = sanitize.stringNoSpaces(sanitize.cleanString(name), 'us');
		this.description = sanitize.cleanString(description);
		this.requiredArguments = sanitize.arrayOfStringsOrEmpty(requiredArguments);
		this.optionalArguments = sanitize.arrayOfStringsOrEmpty(optionalArguments);
	
	}

}

class UwotCmdOption {

	constructor(
		description,
		shortOpt,
		longOpt,
		requiredArguments,
		optionalArguments
	) {
	
		this.description = sanitize.cleanString(description);
		this.shortOpt = sanitize.cleanString(shortOpt, 1);
		this.longOpt = sanitize.stringNoSpaces(sanitize.cleanString(longOpt), 'us');
		this.requiredArguments = sanitize.arrayOfStringsOrEmpty(requiredArguments);
		this.optionalArguments = sanitize.arrayOfStringsOrEmpty(optionalArguments);
	
	}

}


class UwotCmd {

	/**
	 * 
	 * command
	 * {
	 *		name: 'string',
	 * 		description: 'string',
	 * 		requiredArguments: [
	 *			(string)arg1,
	 *			...
	 *		],
	 *		optionalArguments: [
	 *			(string)optArg1,
	 *			...
	 *		]
	 * }
	 *
	 * options [
	 *  	(UwotCmdOption)option1,
	 *		...
	 * ]
	 *
	 * (string)path //note: absolute path from root expected UNLESS
	 *				// cmd is being added from an external pkg, 
	 *				// then path can be the pkg name as arg of require()
	 */
	constructor(
		command,
		options,
		path
	) {
	
		try {
		
			this.command = new UwotCmdCommand(
				command.name,
				command.description,
				command.requiredArguments,
				command.optionalArguments
			);
		
		}
		catch(e) {
		
			e.message = 'Invalid Command format. ' + e.message;
			throw e;
		
		}
		
		try {
		
			this.options = [];
			for (let i = 0; i < options.length; i++) {
			
				this.options[i] = new UwotCmdOption(
					options[i].description,
					options[i].shortOpt,
					options[i].longOpt,
					options[i].requiredArguments,
					options[i].optionalArguments
				);
			
			}
		
		}
		catch(e) {
		
			e.message = 'Invalid Options format. ' + e.message;
			throw e;
		
		}
		this.path = sanitize.cleanString(path);
		
	}
	
	// just says what it's sent. shouldn't be used outside of testing...
	// subclasses should implement their own logic.
	execute(args, options, callback, isSudo) {
	
		var executeString = 'executed: ' + this.command.name;
		var helpString = false;
		if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
		
			for (let i = 0; i < args.length; i++) {
			
				executeString += ' ' + args[i].toString();
		
			}
		
		}
		if ('object' != typeof options || !Array.isArray(options) || options.length < 1) {
		
			return callback(false, executeString);
		
		}
		for (let i = 0; i < this.options.length; i++) {
		
			executeString += ' ' + options[i].toString();
			if (options[i].name && options[i].name === 'h') {
			
				helpString = true;
			
			}
			if ((i+1) >= options.length) {
			
				if (!helpString) {
				
					return callback(false, executeString);
				
				}
				else {
				
					this.help(function(error, helpStr) {
					
						return callback(error, helpStr);
					
					});
				
				}
			
			}
		
		}
	}
	
	// generic help message for help command (can be used for -h or --help if defined in execute)
	// subclasses can call this or not if rewriting this function.
	help(callback) {
	
		var outString = this.command.name;		
		for (let i = 0; i < this.command.requiredArguments.length; i++) {
		
			outString += ' <' + this.command.requiredArguments[i] + '>';
		
		}
		for (let i = 0; i < this.command.optionalArguments.length; i++) {
		
			outString += ' [' + this.command.optionalArguments[i] + ']';
		
		}
		if (this.options.length > 0) {
		
			outString += ' [--options]';
		
		}
		outString += "\r\n";
		outString += this.command.description;
		outString += "\r\n";
		if (this.options.length < 1) {
		
			return callback(false, this.parsePre(outString));
		
		}
		outString += 'Options:';
		outString += "\r\n";
		for (let i = 0; i < this.options.length; i++) {
		
			outString += '    -' + this.options[i].shortOpt + ', --' + this.options[i].longOpt + ' ';
			for (let j = 0; j < this.options[i].requiredArguments.length; j++) {
			
				outString += ' <' + this.options[i].requiredArguments[j] + '>';
			
			}
			for (let j = 0; j < this.options[i].optionalArguments.length; j++) {
			
				outString += ' [' + this.options[i].optionalArguments[j] + ']';
			
			}
			outString += "\r\n";
			outString += '       ' + this.options[i].description;
			outString += "\r\n";
			if ((i+1) >= this.options.length) {
			
				var cmdTitleNode = {content: this.command.name + ': ', isBold: true};
				var outArray = this.parsePre(outString);
				outArray.content.unshift(cmdTitleNode);
				return callback(false, outArray);
			
			}
		
		}
	
	}
	
	matchOpt(opt) {
	
		var matchResult = {
			name: '',
			isOpt: false,
			isLong: false,
			isDefined: false,
			hasArgs: false,
			reqArgs: [],
			optArgs: [],
			assignedArg: ''
		};
		if ('string' != typeof opt || '' === opt) {
		
			throw new TypeError('invalid opt string passed to matchOpt')
		
		}
		else {
		
			opt = opt.trim();
			if ('-' === opt.substring(0, 1)) {
		
				matchResult.isOpt = true;
				var thisOpt = opt.slice(1);
				matchResult.isLong = '-' === thisOpt.substring(0, 1);
				if (matchResult.isLong) {
			
					thisOpt = thisOpt.slice(1);
			
				}
				var thisOptArr = thisOpt.split('=');
				if (2 < thisOptArr.length) {
			
					matchResult.name = thisOptArr.shift();
					matchResult.assignedArg = thisOptArr.toString();
			
				}
				else if (1 < thisOptArr.length) {
			
					matchResult.name = thisOptArr[0];
					matchResult.assignedArg = thisOptArr[1];
			
				}
				else if (0 < thisOptArr.length) {
			
					matchResult.name = thisOptArr[0];
			
				}
				else {
			
					return matchResult;
			
				}
				if (this.options.length < 1) {
			
					return matchResult;
			
				}
				else {
			
					var matchIdx = null;
					for (let i = 0; i < this.options.length; i++) {
				
						var theOpt = this.options[i];
						if (matchResult.name === theOpt.shortOpt || (matchResult.isLong && theOpt.longOpt === matchResult.name)) {
						
							matchIdx = i;
							i = this.options.length;
						
						}
				
					}
					if (null !== matchIdx) {
					
						matchResult.isDefined = true;
						var matchedOpt = this.options[matchIdx];
						if (matchedOpt.requiredArguments.length > 0) {
						
							matchResult.hasArgs = true;
							matchResult.reqArgs = matchedOpt.requiredArguments;
						
						}
						if (matchedOpt.optionalArguments.length > 0) {
						
							matchResult.hasArgs = true;
							matchResult.optArgs = matchedOpt.optionalArguments;
						
						}
						return matchResult;
					
					}
					else {
					
						return matchResult;
					
					}
			
				}
		
			}
			else {
			
				return matchResult;
			
			}
		
		}
	
	}
	
	parsePre(preString) {
	
		if ('string' !== typeof preString) {
		
			return preString;
		
		}
		var output = {content: []};
		var crArray = preString.split(/[\n\r]/g);
		for (let i = 0; i < crArray.length; i++) {
		
			if ('' !== crArray[i]) {
			
				var thisNode = {content: []};
				var spaceArray = crArray[i].replace(/\t/g, '    ').split(' ');
				for (let j = 0; j < spaceArray.length; j++) {
			
					if ('' == spaceArray[j]) {
				
						thisNode.content.push({tag: 'span', content: '&nbsp;'})
				
					}
					else {
				
						thisNode.content.push({content: this.escapeHtml(spaceArray[j])});
						if ((j + 1) < spaceArray.length && '' !== spaceArray[j+1]) {
					
							thisNode.content.push({tag: 'span', content: '&nbsp;'});
					
						}
					
					}
			
				}
				if ((i+1) < crArray.length) {
			
					thisNode.content.push({tag: 'br'});
			
				}
				output.content.push(thisNode);
			
			}
		
		}
		return output;
	
	}
	
	escapeHtml(str) {
	
		if ('string' !== typeof str) {
		
			return str;
			
		}
		return str.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#039;");
		
	 }

}

module.exports = UwotCmd;
