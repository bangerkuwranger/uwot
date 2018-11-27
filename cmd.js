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
		this.requiredArguments = sanitize.arrayOfObjectsOrEmpty(requiredArguments);
		this.optionalArguments = sanitize.arrayOfObjectsOrEmpty(optionalArguments);
	
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
		this.requiredArguments = sanitize.arrayOfObjectsOrEmpty(requiredArguments);
		this.optionalArguments = sanitize.arrayOfObjectsOrEmpty(optionalArguments);
	
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
		
		try {
		
			this.path = sanitize.cleanString(path);
			global.UwotBin[this.command.name] = require(this.path);
		
		}
		catch(e) {
		
			e.message = 'Could not load command "' + this.command.name + '" to globals. ' + e.message;
			throw e;
		
		}
		
	}
	
	// just says what it's sent. shouldn't be used outside of testing...
	// subclasses should implement their own logic.
	execute(args, options, callback) {
	
		var executeString = 'executed: ' + this.command.name;
		for (let i = 0; i < args.length; i++) {
		
			executeString += ' ' + args[i];
		
		}
		if (options.length < 1) {
		
			return callback(false, executeString);
		
		}
		for (let i = 0; i < this.options.length; i++) {
		
			executeString += ' ' + options[i];
			if ((i+1) >= options.length) {
			
				return callback(false, executeString);
			
			}
		
		}
	}
	
	// generic help message for -h or --help
	// subclasses can call this or not if rewriting this function.
	help(callback) {
	
		var outString = this.command.name;		
		for (let i = 0; i < this.command.required.length; i++) {
		
			outString += ' <' + this.command.required[i] + '>';
		
		}
		for (let i = 0; i < this.command.optional.length; i++) {
		
			outString += ' [' + this.command.optional[i] + ']';
		
		}
		if (this.options.length > 0) {
		
			outString += ' [--options]';
		
		}
		outString += "\r\n";
		outString += this.command.description;
		outString += "\r\n";
		if (this.options.length < 1) {
		
			return callback(false, outString);
		
		}
		for (let i = 0; i < this.options.length; i++) {
		
			outString += '-' + this.options[i].shortOpt + ', --' + this.options[i].longOpt + ' ';
			for (let j = 0; j < this.options[i].required.length; j++) {
			
				outString += ' <' + this.options[i].required[j] + '>';
			
			}
			for (let j = 0; j < this.options[i].optional.length; j++) {
			
				outString += ' [' + this.options[i].optional[j] + ']';
			
			}
			outString += ' ' + this.options[i].description;
			outString += "\r\n";
			if ((i+1) >= this.options.length) {
			
				return callback(false, outString);
			
			}
		
		}
	
	}

}

module.exports = UwotCmd;
