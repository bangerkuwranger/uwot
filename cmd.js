'use strict';
var path = require('path');
var sanitize = require('./helpers/valueConversion');
const EOL = require('os').EOL;
const Listener = require('./listener');
const isidListenerHelper = require('./helpers/isidListener');

class UwotCmdCommand {

	constructor(
		name,
		description,
		requiredArguments,
		optionalArguments
	) {
	
		this.name = sanitize.stringNoSpaces(sanitize.cleanString(name, 255), 'cc');
		this.description = sanitize.cleanString(description, 1024);
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
	
		this.description = sanitize.cleanString(description, 255);
		this.shortOpt = sanitize.cleanString(shortOpt, 1);
		this.longOpt = sanitize.stringNoSpaces(sanitize.cleanString(longOpt), 'cc');
		this.requiredArguments = sanitize.arrayOfStringsOrEmpty(requiredArguments);
		this.optionalArguments = sanitize.arrayOfStringsOrEmpty(optionalArguments);
	
	}

}

class UwotListenerSettings {

	constructor(settingsObj) {
	
		this.name = sanitize.stringNoSpaces(sanitize.cleanString(settingsObj.name, 255), 'cc');
		this.options = {};
		if ('string' === typeof settingsObj.type) {
		
			var cleanType = sanitize.cleanString(settingsObj.type, 10);
			if (-1 !== global.Uwot.Constants.listenerTypes.indexOf(cleanType)) {
			
				this.options.type = cleanType;
			
			}
		
		}
		if ('string' === typeof settingsObj.parser) {
		
			var cleanParser = sanitize.cleanString(settingsObj.parser, 10);
			if (-1 !== global.Uwot.Constants.listenerParserTypes.indexOf(cleanParser)) {
			
				this.options.parser = cleanParser;
			
			}
		
		}
		if ('string' === typeof settingsObj.output) {
		
			var cleanOutput = sanitize.cleanString(settingsObj.output, 10);
			if (-1 !== global.Uwot.Constants.listenerOutputTypes.indexOf(cleanOutput)) {
			
				this.options.output = cleanOutput;
			
			}
		
		}
		if ('string' === typeof settingsObj.parserPath) {
		
			this.options.parserPath = sanitize.cleanString(settingsObj.parserPath, 1024);
		
		}
		if ('string' === typeof settingsObj.outputPath) {
		
			this.options.outputPath = sanitize.cleanString(settingsObj.outputPath, 1024);
		
		}
		if ('string' === typeof settingsObj.routerPath) {
		
			this.options.routerPath = sanitize.cleanString(settingsObj.routerPath, 1024);
		
		}
		if ('string' === typeof settingsObj.routeUriPath) {
		
			this.options.routeUriPath = sanitize.cleanString(settingsObj.routeUriPath, 255);
		
		}
		if ('object' === typeof settingsObj.cmdSet && Array.isArray(settingsObj.cmdSet)) {
		
			this.options.cmdSet = sanitize.arrayOfStringsOrEmpty(settingsObj.cmdSet, true);
		
		}
		else {
		
			this.options.cmdSet = [];
		
		}
	
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
	 * 
	 * (UwotListenerSettings)listenerSettings
	 */
	constructor(
		command,
		options,
		path,
		listenerSettings
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
		if ('object' === typeof listenerSettings && null !== listenerSettings) {
		
			try {
			
				this.listenerSettings = new UwotListenerSettings(listenerSettings);
			
			}
			catch(e) {
		
				e.message = 'Invalid listenerSettings format. ' + e.message;
				throw e;
		
			}
		
		}
		else {
		
			this.listenerSettings = false;
		
		}
		
	}
	
	// just says what it's sent. shouldn't be used outside of testing...
	// subclasses should implement their own logic.
	execute(args, options, app, user, callback, isSudo, isid) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to execute.');
		
		}
		else {
		
			var executeString = 'executed: ' + this.command.name;
			var helpString = false;
			if ('object' === typeof args && Array.isArray(args) && args.length > 0) {
		
				for (let i = 0; i < args.length; i++) {
			
					executeString += ' ';
					executeString += 'string' === typeof args[i].text ?  args[i].text : JSON.stringify(args[i]);
		
				}
		
			}
			if ('object' !== typeof options || !Array.isArray(options) || options.length < 1) {
		
				return callback(false, executeString);
		
			}
			for (let i = 0; i < this.options.length; i++) {
		
				//fails on non-defined options
				executeString += 'boolean' === typeof options[i].isLong && options[i].isLong ? ' --' : ' -';
				
				executeString += options[i].name.toString();
				if (options[i].name && (options[i].name === 'h' || options[i].name === 'help')) {
			
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
	}
	
	// generic help message for help command (can be used for -h or --help if defined in execute)
	// subclasses can call this or not if rewriting this function.
	help(callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to help.');
		
		}
		else {
		
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
			outString += EOL;
			outString += this.command.description;
			outString += EOL;
			if (this.options.length < 1) {
		
				let cmdTitleNode = {content: this.command.name + ': ', isBold: true};
				let outArray = this.parsePre(outString);
				outArray.content.unshift(cmdTitleNode);
				return callback(false, outArray);
		
			}
			outString += 'Options:';
			outString += EOL;
			for (let i = 0; i < this.options.length; i++) {
		
				outString += '    -' + this.options[i].shortOpt;
				outString += this.options[i].longOpt === null || this.options[i].longOpt === '' ? ' ' : ', --' + this.options[i].longOpt + ' ';
				for (let j = 0; j < this.options[i].requiredArguments.length; j++) {
			
					outString += ' <' + this.options[i].requiredArguments[j] + '>';
			
				}
				for (let j = 0; j < this.options[i].optionalArguments.length; j++) {
			
					outString += ' [' + this.options[i].optionalArguments[j] + ']';
			
				}
				outString += EOL;
				outString += '       ' + this.options[i].description;
				outString += EOL;
				if ((i+1) >= this.options.length) {
			
					let cmdTitleNode = {content: this.command.name + ': ', isBold: true};
					let outArray = this.parsePre(outString);
					outArray.content.unshift(cmdTitleNode);
					return callback(false, outArray);
			
				}
		
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
		if ('string' !== typeof opt || '' === opt) {
		
			throw new TypeError('invalid opt string passed to matchOpt');
		
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
			
					//empty array; will never happen since error thrown for empty string &
					// even empty string will result in positive integer length...
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
			
					if ('' === spaceArray[j]) {
				
						thisNode.content.push({tag: 'span', content: '&nbsp;'});
				
					}
					else {
				
						thisNode.content.push({content: global.Uwot.Constants.escapeHtml(spaceArray[j])});
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
	
	argsObjToNameArray(argsObj) {
	
		if ('object' !== typeof argsObj || !Array.isArray(argsObj)) {
		
			return argsObj;
		
		}
		else {
		
			let i = 0;
			var nameArray = [];
			argsObj.forEach(function(argNode) {
			
				if ('object' === typeof argNode && 'string' === typeof argNode.text && 'Word' === argNode.type) {
				
					nameArray.push(argNode.text);
				
				}
				if (++i >= argsObj.length) {
				
					return nameArray;
				
				}
			
			});
			return nameArray;
		
		}
	
	}
	
	registerListener(isid) {
	
		if ('string' !== typeof isid || !this.listenerSettings) {
		
			return false;
		
		}
		else {
		
			var globalListeners = isidListenerHelper.ensureGlobalListener(isid);
			if ('object' === typeof globalListeners[this.listenerSettings.name]) {
			
				return new Error('listener name "' + name + '" not unique for isid "' + isid + '"');
			
			}
			else {
			
				try {
				
					globalListeners[this.listenerSettings.name] = new Listener(this.listenerSettings.name, isid, this.listenerSettings.options);
					return true;
				
				}
				catch(e) {
				
					return e;
				
				}
			
			}
		
		}
	
	}
	
	enableListener(isid) {
	
		var isRegistered = false;
		if ('string' !== typeof isid || !this.listenerSettings) {
		
			return false;
		
		}
		var globalListeners = isidListenerHelper.ensureGlobalListener(isid);
		if ('object' !== typeof globalListeners[this.listenerSettings.name]) {
		
			isRegistered = this.registerListener(isid);
		
		}
		if (!isRegistered) {
		
			return new Error('could not register listener ' + this.listenerSettings.name + ' for id ' + isid);
		
		}
		else if (isRegistered instanceof Error) {
		
			isRegistered.message = 'could not register listener ' + this.listenerSettings.name + ' for id ' + isid + ': ' + isRegistered.message;
			return isRegistered;
		
		}
		else {
		
			globalListeners[this.listenerSettings.name].enable();
			if (this.listenerSettings.type === 'exclusive') {
			
				isidListenerHelper.enableExclusiveState(isid);
			
			}
			return global.Uwot.Listeners[isid][this.listenerSettings.name].status;
		
		}
	
	}
	
	disableListener(isid) {
	
		var isRegistered = false;
		if ('string' !== typeof isid || !this.listenerSettings) {
		
			return false;
		
		}
		var globalListeners = isidListenerHelper.ensureGlobalListener(isid);
		if ('object' !== typeof globalListeners[this.listenerSettings.name]) {
		
			isRegistered = this.registerListener(isid);
		
		}
		if (!isRegistered) {
		
			return new Error('could not register listener ' + this.listenerSettings.name + ' for id ' + isid);
		
		}
		else if (isRegistered instanceof Error) {
		
			isRegistered.message = 'could not register listener ' + this.listenerSettings.name + ' for id ' + isid + ': ' + isRegistered.message;
			return isRegistered;
		
		}
		else {
		
			globalListeners[this.listenerSettings.name].disable();
			if (this.listenerSettings.type === 'exclusive') {
			
				isidListenerHelper.disableExclusiveState(isid);
			
			}
			return global.Uwot.Listeners[isid][this.listenerSettings.name].status;
		
		}
	
	}

}

module.exports = UwotCmd;
