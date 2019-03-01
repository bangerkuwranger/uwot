'use strict';
const sanitize = require('./valueConversion');

const VALID_FLAG_TYPES = [
	'boolean',
	'string',
	'json'
];

class Flag {

	constructor(
		flagString,
		type,
		name,
		defaultVal
	) {
	
		if ('string' !== typeof flagString) {
		
			throw new TypeError('invalid flagString');
		
		}
		this.flagString = sanitize.cleanString(flagString);
		var cleantype = sanitize.cleanString(type);
		if (-1 === VALID_FLAG_TYPES.indexOf(cleantype)) {
		
			throw new TypeError('invalid flag type');
		
		}
		this.type = cleantype;
		this.name = sanitize.cleanString(name);
		switch(this.type) {
		
			case 'boolean':
				this.defaultVal = 'boolean' !== typeof defaultVal ? false : defaultVal;
				break;
			case 'string':
				this.defaultVal = 'string' === typeof defaultVal ? defaultVal : '';
				break;
			case 'json':
				this.defaultVal = 'object' === typeof defaultVal ? defaultVal : {};
				break;
		
		}
	
	}
	
	parseFromString(stringValue) {
	
		var parsed = [this.flagString];
		if ('string' !== typeof stringValue) {
		
			throw new TypeError('stringValue must be a string');
		
		}
		else {
		
			stringValue = sanitize.cleanString(stringValue, 1024);
			var flagIdx = stringValue.indexOf('=') - 1;
			var isAssignment = flagIdx >= 0;
			var flagLength = this.flagString.length;
			var flagValue;
			if (!isAssignment) {
			
				flagValue = stringValue;
			
			}
			else {
					
				flagValue = stringValue.substring(flagIdx + flagLength + 1).trim();
			
			}
			if (flagValue.length < 1) {
			
				flagValue = this.defaultVal;
			
			}
			switch(this.type) {
			
				case 'string':
					parsed.push(flagValue.toString());
					break;
				case 'json':
					var flagValueObj = global.Uwot.Constants.tryParseJSON(flagValue);
					parsed.push(!flagValueObj ? {value: flagValue} : flagValueObj === '' ? this.defaultVal : flagValueObj);
					break;
				case 'boolean':
					if (!isAssignment && stringValue.trim() === this.flagString) {
						parsed.push(true);
						break;
					}
				default:
					parsed.push(-1 !== flagIdx && false !== flagValue && 'false' !== flagValue);
			
			}
			return parsed;
		
		}
	
	}
	
}

class FlagSet{

	constructor(
		flags
	) {
	
		if ('object' !== typeof flags || !Array.isArray(flags)) {
		
			throw new TypeError('flags must be an array');
		
		}
		else {
		
			this.flags = new Map();
			this.invalidFlags = [];
			this.flagErrors = [];
			for (let i = 0; i < flags.length; i++) {
			
				if ('object' === typeof flags[i] && null !== flags[i]) {
				
					if ('string' === typeof flags[i].flagString && '' === flags[i].flagString) {
					
						this.invalidFlags.push(flags[i]);
					
					}
					else {
					
						try {
					
							this.flags.set(flags[i].flagString, new Flag(flags[i].flagString, flags[i].type, flags[i].name, flags[i].defaultVal));
					
						}
						catch(e) {
					
							this.invalidFlags.push(flags[i]);
							this.flagErrors.push(e);
					
						}
					
					}
				
				}
				else {
				
					this.invalidFlags.push(flags[i]);
				
				}
			
			}
		
		}
	
	}
	
	// TBD
	addFlag(flagObj) {
	
		throw new Error('this function is not yet implemented');
	
	}
	
	// TBD
	removeFlag(flagString) {
	
		throw new Error('this function is not yet implemented');
	
	}
	
	// TBD
	parseFlags(flagsToParse) {
	
		var parsed = new Map();
		if ('string' === typeof flagsToParse) {
		
			//split into strings by flags in this.flags
			//for each flag string match to valid flag
			//loop through all valid flags
				//if string exists to be parsed for valid flag
					//parsed.set(...this.flags.get(validFlag).parseFromString(flagstringval))
				//else
					//parsed.set(...this.flags.get(validFlag).parseFromString())
		
		}
		else if ('object' === typeof flagsToParse) {
		
			//if null
				//loop through valid strings
					//parsed.set(...this.flags.get(validFlag).parseFromString())
			//if Array
				//loop through valid strings
					//match to array members
					//if match
						//parsed.set(...this.flags.get(validFlag).parseFromString(flagstringval))
					//else
					//parsed.set(...this.flags.get(validFlag).parseFromString())
			//if Map
				//same as array but w/ map methods
			//else
				//same as array but match to enum/own object properties
		
		}
		return parsed;
	
	}

}

module.exports = FlagSet;
