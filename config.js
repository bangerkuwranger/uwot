'use strict';
const path = require('path');
const fs = require('fs');
const nconf = require('nconf');
const sanitize = require('./helpers/valueConversion');
const fileLog = require('./logger').all;
const confDefaults = {
	server: {
		domain: 'localhost',
		secure: false,
		port: 80,
		transport: 'http',
		pubDir: path.resolve(global.appRoot, 'fs/var/www/html'),
		userDir: path.resolve(global.appRoot, 'fs/home')
	},
	users: {
		allowGuest: false,
		sudoOutsideHome: false,
		sudoOutsidePub: false,
		createHome: false,
		homeWritable: false
	},
	binpath: {
		useLocal: true,
		useExternal: false,
		useReverseProxies: false,
		external: [],
		reverseProxies: []
	},
	themes: {
		useLocal: true,
		useExternal: false,
		external: []
	}
};
const arrayKeys = [
	'binpath:external',
	'binpath:reverseProxies',
	'themes:external'
];

const arrayMemberClassMap = new Map([
	['binpath:external', ExternalBinPath],
	['binpath:reverseProxies', ReverseProxyBin],
	['themes:external', ExternalTheme]
]);

// TBD classes to clean up input objects. should have method to output clean objects without additional properties.
class ExternalBinPath{};

class ExternalTheme{};

class ReverseProxyBin{};

function isArrayKey(keyString) {

	if ('string' !== typeof keyString || '' === keyString) {
	
		return false;
	
	}
	else {
	
		var idx = arrayKeys.indexOf(keyString);
		return -1 == idx ? false : true;
	
	}

}

// recreates array of objects with all members as associated class instances using the
// member object passed as the constructor argument.
// if a member of the array is null or not an object, it is excluded from resulting array

// TBD
// add optional arg to return array of actual class instead of clean objects
function arrayMembersToClass(
	arrayOfObjs,
	arrayKey
) {

	if ('object' != typeof arrayOfObjs || null === arrayOfObjs || !(Array.isArray(arrayOfObjs))) {
	
		throw new TypeError('first argument must be an array of objects.');
	
	}
	else if (!(isArrayKey(arrayKey))) {
	
		throw new Error('Config setting "' + arrayKey + '" does not accept array values.');
	
	}
	else {
	
		var invalidMembers = 0;
		var newArray = [];
		let objClass = arrayMemberClassMap.get(arrayKey);
		for (let i=0; i<arrayOfObjs.length; i++) {
		
			let thisObjArgs = arrayOfObjs[i];
			if ('object' !== typeof thisObjArgs || null === thisObjArgs) {
			
				invalidMembers++;
			
			}
			else {
			
				let thisObj = new objClass(thisObjArgs);
				newArray.push(thisObj);
			
			}
		
		}
		if (invalidMembers >= arrayOfObjs.length) {
		
			return [];
		
		}
		else {
		
			return newArray;
		
		}
	
	}

}

// want to see if we can abstract out the setters and only use those in setup.js. doubt it, but worth a try? probably will need to set property (as originally) or use method (private ain't a thing in targeted ES6)

// might make sense to just expose a prebuilt nconf and build logic off that. Not protecting anything that can't be accessed directly on server anyhow.
class UwotConfigBase {

	constructor(
		filePath
	) {
	
		nconf.file(
			'local',
			filePath
		);
		//yous less for saving defaults... but works well at runtime using get method, i guess?
		nconf.defaults(confDefaults);
		// var defaultKeys = Object.keys(confDefaults);
// 		for (let kidx in defaultKeys) {
// 		
// 			let val = defaultKeys[kidx];
// 			if ('type' !== val && 'undefined' == typeof nconf.stores.local.get(val)) {
// 			
// 				nconf.stores.local.set(val, nconf.stores.defaults.get(val));
// 			
// 			}
// 		
// 		}
// 		nconf.save(null, function(error) {
// 		
// 			if(error) fileLog.error(error);
// 		
// 		});
	
	}
	
	get(cat, key) {
	
		if ('string' != typeof cat) {
		
			return undefined;
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal && 'string' == typeof key) {
			
				return catVal[key];	
			
			}
			else {
			
				return catVal;
			
			}

		}
	
	}
	
	setStrVal(cat, key, value, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to setStrVal.');
		
		}
		else if ('string' != typeof cat || 'string' != typeof key || 'string' != typeof value) {
		
			return callback(new TypeError('invalid args passed to setStrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal && 'string' == typeof key) {
			
				var valIsSet = nconf.set(cat + ':' + sanitize.cleanString(key), sanitize.cleanString(value));
				if (!valIsSet) {
				
					return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
				
				}
				else {
				
					return nconf.save(null, callback);
				
				}
			
			}
			else {
			
				return callback(new Error('invalid cat passed to setArrVal.'), false);
			
			}

		}
	
	}
	
	setArrVal(cat, key, value, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to setArrVal.');
		
		}
		else if ('string' != typeof cat || 'string' != typeof key || 'object' != typeof value || null === value || !(Array.isArray(value))) {
		
			return callback(new TypeError('invalid args passed to setArrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal) {
			
				try {
				
					var valIsSet = nconf.set(cat + ':' + key.sanitize.cleanString(key), arrayMembersToClass(value, cat + ':' + key.sanitize.cleanString(key)));
				
				}
				catch(error) {
				
					return callback(error, false);
				
				}
				if (!valIsSet) {
				
					return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
				
				}
				else {
				
					return nconf.save(null, callback);
				
				}
			
			}
			else {
			
				return callback(new Error('invalid cat passed to setArrVal.'), false);
			
			}

		}
	
	}
	
	addArrVal(cat, key, value, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to setArrVal.');
		
		}
		else if ('string' != typeof cat || 'string' != typeof key || 'string' != typeof value) {
		
			return callback(new TypeError('invalid args passed to addArrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal) {
			
				var currArr = catVal[key];
				if ('object' !== typeof currArr || !(Array.isArray(currArr))) {
				
					return callback(new Error('value for ' + cat + ':' + key + ' is not an array.'), false);
				
				}
				else {
				
					var newValue = arrayMembersToClass([sanitize.cleanString(value)], cat + ':' + key);
					var updatedArr = currArr.concat(newValue);
					if (nconf.set(cat + ':' + key.sanitize.cleanString(key), )) {
				
						return nconf.save(null, callback);
				
					}
					else {
					
						return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
					
					}
				
				}
			
			}
			else {
			
				return callback(new Error('invalid cat passed to addArrVal.'), false);
			
			}

		}
	
	}
	
	removeArrIdx(cat, key, index, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to setArrVal.');
		
		}
		else if ('string' != typeof cat || 'string' != typeof key || 'number' != typeof index || isNaN(parseInt(index))) {
		
			return callback(new TypeError('invalid args passed to removeArrIdx.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal) {
			
				var currArr = catVal[key];
				if ('object' !== typeof currArr || !(Array.isArray(currArr))) {
				
					return callback(new Error('value for ' + cat + ':' + key + ' is not an array.'), false);
				
				}
				else {
				
					currArr.splice(index, 1);
					if (nconf.set(cat + ':' + key.sanitize.cleanString(key), currArr)) {
					
						return nconf.save(null, callback);
					
					}
					else {
					
						return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
					}
				
				}
			
			}
			else {
			
				return callback(new Error('invalid cat passed to removeArrIdx.'), false);
			
			}

		}
	
	}
	
	isArrayKey(keyString) {
	
		return isArrayKey(keyString);
	
	}

};

module.exports = UwotConfigBase;
