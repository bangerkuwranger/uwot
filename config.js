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
		port: '80',
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
		external: [],
		allowUserSwitch: false,
		defaultTheme: 'default'
	}
};

class ExternalBinPath{

	constructor(
		pathName,
		dirPath,
		isSudoOnly
	) {
	
		this.pathName = sanitize.cleanString(pathName);
		this.dirPath = sanitize.cleanString(dirPath);
		this.isSudoOnly = sanitize.cleanBool(isSudoOnly);
		this.pathFiles = [];
		this.getPathFiles(function(error, pathFiles) {
		
			if (error) {
			
				throw error;
			
			}
			else {
			
				this.pathFiles = pathFiles;
			
			}
		
		}.bind(this));
	
	}
	
	getPathFiles(callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invald callback passed to getPathFiles');
		
		}
		else {
		
			var self = this;
			self.gpsCallback = callback;
			fs.stat(this.dirPath, function(error, stats) {
			
				if (error) {
				
					return self.gpsCallback(error, null);
				
				}
				else if (!stats.isDirectory()) {
				
					return self.gpsCallback(new Error('this.dirPath is not a directory'), null);
				
				}
				else {
				
					var fileList = [];
					fs.readdir(self.pathName, function(error, files) {
											
						if (error) {
				
							return self.gpsCallback(error, null);
				
						}
						else if (files.length < 1) {
						
							return self.gpsCallback(false, fileList);
						
						}
						else {
						
							var fileLength = files.length, j = 0;
							for (let i = 0; i < fileLength; i++) {
							
								if (files[i].endsWith('.js')) {
								
									fileList.push(path.resolve(self.pathName, files[i]));
								
								}
								if (++j >= fileLength) {
								
									return self.gpsCallback(false, fileList);
								
								}
							
							}
						
						}
					
					});
				
				}
			
			});
		
		}
	
	}
	
	getGeneric() {
	
		return {
			pathName: this.pathName,
			dirPath: this.dirPath,
			isSudoOnly: this.isSudoOnly,
			pathFiles: this.pathFiles
		};
	
	}

};

class ExternalTheme{

	constructor(
		name,
		path
	) {
	
		this.name = sanitize.cleanString(name);
		this.path = sanitize.cleanString(path)
	
	}
	
	getGeneric() {
	
		return {
			name: this.name,
			path: this.path
		};	
	
	}

};

class ReverseProxyBin{

	constructor(
		name,
		url,
		isLocal,
		isConsole
	) {
	
		this.name = sanitize.cleanString(name);
		this.url = sanitize.cleanString(url, 1024);
		this.isLocal = 'undefined' == typeof isLocal ? false : sanitize.cleanBool(isLocal);
		this.isConsole = 'undefined' == typeof isConsole ? false : sanitize.cleanBool(isConsole);
	
	}
	
	getGeneric() {
	
		return {
			name: this.name,
			url: this.url,
			isLocal: this.isLocal,
			isConsole: this.isConsole
		};
	
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


function isArrayKey(keyString) {

	if ('string' !== typeof keyString || '' === keyString) {
	
		return false;
	
	}
	else {
	
		var idx = arrayKeys.indexOf(keyString);
		return -1 == idx ? false : true;
	
	}

}


// merges all string values of two maps into a single new Map
// new values take precedence, and keeps values for keys only in new Map
function mergeMaps(oldMap, newMap, catName) {

	if ('object' !== typeof oldMap || !(oldMap instanceof Map) || 'object' !== typeof newMap || !(newMap instanceof Map)) {
	
		throw new TypeError('args must be instances of Map for mergeMaps');
	
	}
	else if ('string' != typeof catName || -1 == Object.keys(confDefaults).indexOf(catName)) {
	
		throw new TypeError('invalid category name passed to mergeMaps');
	
	}
	else {
	
		var finalMap = new Map();
		oldMap.forEach(function (oldVal, oldKey) {
		
			if (!isArrayKey(catName + ':' + oldKey)) {
			
				if ('undefined' !== newMap.get(oldKey)) {
				
					finalMap.set(oldKey, newMap.get(oldKey));
					newMap.delete(oldKey);
				
				}
				else {
				
					finalMap.set(oldKey, oldVal);
				
				}
			
			}
			else {
			
				newMap.delete(oldKey);
			
			}
		
		});
		if (newMap.size > 0) {
		
			newMap.forEach(function(v, k) {
			
				if (!isArrayKey(catName + ':' + k)) {
				
					finalMap.set(k, v);
				
				}
			
			});
		
		}
		return finalMap;
	
	}

}

// recreates array of objects with all members as associated class instances using the
// member object passed as the constructor argument.
// if a member of the array is null or not an object, it is excluded from resulting array
// if returnClassObj is true, will use generic object instead of class object for members
function arrayMembersToClass(
	arrayOfObjs,
	arrayKey,
	returnClassObj
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
		let useGenericObj = 'undefined' !== typeof returnClassObj && 'false' !== returnClassObj && returnClassObj;
		for (let i=0; i<arrayOfObjs.length; i++) {
		
			let thisObjArgs = arrayOfObjs[i];
			if ('object' !== typeof thisObjArgs || null === thisObjArgs) {
			
				invalidMembers++;
			
			}
			else {
			
				let thisObj = new objClass(thisObjArgs);
				if (useGenericObj) {
				
					let genericObj = thisObj.getGeneric();
					newArray.push(genericObj);
				
				}
				else {
				
					newArray.push(thisObj);
			
				}
			
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

class UwotConfigBase {

	constructor(
		filePath
	) {
	
		nconf.file(
			'local',
			filePath
		);
		nconf.defaults(confDefaults);
	
	}
	
	get(cat, key, excludeArrays) {
	
		if ('string' != typeof cat) {
		
			return undefined;
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' == typeof catVal && null !== catVal && 'string' == typeof key) {
			
				return catVal[key];	
			
			}
			else if ('undefined' == typeof excludeArrays || excludeArrays) {
			
				arrayKeys.forEach(function(ak) {
				
					let thisAk = ak.split(':', 2);
					if (cat == thisAk[0]) {
					
						delete catVal[thisAk[1]];
					
					}
				
				});
				
				return catVal;
			
			}
			else {
			
				return catVal;
			
			}

		}
	
	}
	
	getCats() {
	
		return Object.keys(nconf.get());
	
	}
	
	// sets changed string values for existing cat in values Map object
	updateCatStrVals(cat, values, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to updateCatStrVals.');
		
		}
		else if ('string' !== typeof cat || 'object' !== typeof values || !(values instanceof Map)) {
		
			return callback(new TypeError('invalid args passed to updateCatStrVals.'), false);
		
		}
		else if (-1 === this.getCats().indexOf(cat)) {
		
			return callback(new Error('invalid category passed to updateCatStrVals.'), false);
		
		}
		else {
		
			try {
				var currentVals = new Map(Object.entries(this.get(cat, null, false)));
				var updatedVals = mergeMaps(currentVals, values, cat);
				var savedKeys = [];
				var i = 0;
			}
			catch(e) {
			
				return callback(e, null);
			
			}
			updatedVals.forEach(function(val, key) {
			
				if (val !== currentVals.get(key)) {
				
					nconf.set(cat + ':' + key, val);
					savedKeys.push(key);
				
				}
				if (++i >= updatedVals.size) {
				
					nconf.save(null, function(error, isSaved) {
					
						if (error) {
						
							return callback(error, savedKeys);
						
						}
						else {
						
							return callback(false, savedKeys);
						
						}
					
					});
				
				}
			
			});
		
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
	
	resetToDefault(cat, key, callback) {
	
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to resetToDefault.');
		
		}
		else if ('string' != typeof cat || 'string' != typeof key) {
		
			return callback(new TypeError('invalid args passed to resetToDefault.'), false);
		
		}
		else {
		
			var localCatVals = nconf.stores.local.get(cat);
			if ('object' == typeof localCatVals && 'undefined' !== typeof localCatVals[key]) {
			
				nconf.stores.local.clear(cat + ':' + key);
				return nconf.save(null, callback);
			
			}
			else {
			
				return callback(false, true);
			
			}
		
		}
	
	}
	
	isArrayKey(keyString) {
	
		return isArrayKey(keyString);
	
	}

};

module.exports = UwotConfigBase;
