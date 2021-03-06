'use strict';
const path = require('path');
const fs = require('fs-extra');
const nconf = require('nconf');
const sanitize = require('./helpers/valueConversion');
const fileLog = require('./logger').all;
const confDefaults = function() {

	return {
		server: {
			siteName: 'UWOT',
			showVersion: true,
			domain: 'localhost',
			secure: false,
			port: '80',
			transport: 'http',
			pubDir: path.resolve(global.Uwot.Constants.appRoot + '/fs/var/www/html'),
			userDir: path.resolve(global.Uwot.Constants.appRoot + '/fs/home')
		},
		users: {
			allowGuest: false,
			sudoFullRoot: false,
			createHome: false,
			homeWritable: false,
			allowShellFunctions: false,
			allowGuestShellFunctions: false,
			allowRootUser: false,
			authenticatedSessionExpiry: global.Uwot.Constants.sessionHours * 3600000,
			instanceSessionExpiry: global.Uwot.Constants.sessionHours * 3600000
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
			showTheme: true,
			external: [],
			allowUserSwitch: false,
			defaultTheme: 'default'
		}
	};

};

class ExternalBinPath{

	constructor(
		pathName,
		dirPath,
		isSudoOnly
	) {
	
		if ('object' === typeof pathName && null !== pathName && 'undefined' === typeof dirPath && 'undefined' === typeof isSudoOnly) {
		
			var argsObj = Object.assign(pathName);
			pathName = argsObj.hasOwnProperty('pathName') ? argsObj.pathName : null;
			dirPath = argsObj.hasOwnProperty('dirPath') ? argsObj.dirPath : null;
			isSudoOnly = argsObj.hasOwnProperty('isSudoOnly') ? argsObj.isSudoOnly : true;
		
		}
		this.pathName = sanitize.cleanString(pathName, 255);
		this.dirPath = sanitize.cleanString(dirPath, 1024);
		this.isSudoOnly = sanitize.cleanBool(isSudoOnly);
		var pathFiles = this.getPathFiles();
		if (pathFiles instanceof Error) {
		
			throw pathFiles;
		
		}
		else {
		
			this.pathFiles = pathFiles;
		
		}
	
	}
	
	getPathFiles() {
		
		var dirPathStats;
		try {
			
			dirPathStats = fs.statSync(this.dirPath);
		
		}
		catch(error) {
		
			return error;
		
		}
		if (!dirPathStats.isDirectory()) {
			
			return new Error('this.dirPath is not a directory');
			
		}
		else {
			
			var fileList = [];
			var dirFiles;
			try {
			
				dirFiles = fs.readdirSync(this.dirPath);
			
			}						
			catch(error) {
	
				return error;
	
			}
			if (dirFiles.length < 1) {
			
				return fileList;
			
			}
			else {
			
				var fileLength = dirFiles.length, j = 0;
				for (let i = 0; i < fileLength; i++) {
				
					if (dirFiles[i].endsWith('.js')) {
					
						fileList.push(path.resolve(this.dirPath, dirFiles[i]));
					
					}
					if (++j >= fileLength) {
					
						return fileList;
					
					}
				
				}
			
			}
		
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

}

class ExternalTheme{

	constructor(
		name,
		path
	) {
	
		if ('object' === typeof name && null !== name && 'undefined' === typeof path) {
		
			var argsObj = Object.assign(name);
			name = argsObj.hasOwnProperty('name') ? argsObj.name : null;
			path = argsObj.hasOwnProperty('path') ? argsObj.path : null;
		
		}
		this.name = sanitize.cleanString(name, 255);
		this.path = sanitize.cleanString(path, 1024);
	
	}
	
	getGeneric() {
	
		return {
			name: this.name,
			path: this.path
		};	
	
	}

}

class ReverseProxyBin{

	constructor(
		name,
		localFileLocation,
		url,
		isLocal,
		isConsole
	) {
	
		if ('object' === typeof name && null !== name && 'undefined' === typeof localFileLocation && 'undefined' === typeof url && 'undefined' === typeof isLocal && 'undefined' === typeof isConsole) {
		
			var argsObj = Object.assign(name);
			name = argsObj.hasOwnProperty('name') ? argsObj.name : null;
			localFileLocation= argsObj.hasOwnProperty('localFileLocation') ? argsObj.localFileLocation : null;
			url = argsObj.hasOwnProperty('url') ? argsObj.url : null;
			isLocal = argsObj.hasOwnProperty('isLocal') ? argsObj.isLocal : false;
			isConsole = argsObj.hasOwnProperty('isConsole') ? argsObj.isConsole : false;
		
		}
		this.name = sanitize.cleanString(name, 255);
		this.localFileLocation = sanitize.cleanString(localFileLocation, 1024);
		this.url = sanitize.cleanString(url, 1024);
		this.isLocal = 'undefined' === typeof isLocal ? false : sanitize.cleanBool(isLocal);
		this.isConsole = 'undefined' === typeof isConsole ? false : sanitize.cleanBool(isConsole);
	
	}
	
	getGeneric() {
	
		return {
			name: this.name,
			localFileLocation: this.localFileLocation,
			url: this.url,
			isLocal: this.isLocal,
			isConsole: this.isConsole
		};
	
	}

}

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
		return -1 === idx ? false : true;
	
	}

}


// merges all string values of two maps into a single new Map
// new values take precedence, and keeps values for keys only in new Map
function mergeMaps(oldMap, newMap, catName) {

	if ('object' !== typeof oldMap || !(oldMap instanceof Map) || 'object' !== typeof newMap || !(newMap instanceof Map)) {
	
		throw new TypeError('oldMap and newMap args must be instances of Map for mergeMaps');
	
	}
	else if ('string' !== typeof catName || -1 === Object.keys(confDefaults()).indexOf(catName)) {
	
		throw new TypeError('invalid category name passed to mergeMaps');
	
	}
	else {
	
		var finalMap = new Map();
		oldMap.forEach(function (oldVal, oldKey) {
		
			if (!isArrayKey(catName + ':' + oldKey)) {
			
				if ('undefined' !== typeof newMap.get(oldKey)) {
				
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

	if ('object' !== typeof arrayOfObjs || null === arrayOfObjs || !(Array.isArray(arrayOfObjs))) {
	
		throw new TypeError('first argument must be an array of objects.');
	
	}
	else if (!(isArrayKey(arrayKey))) {
	
		throw new Error('config setting "' + arrayKey + '" does not accept array values.');
	
	}
	else {
	
		var invalidMembers = 0;
		var newArray = [];
		let ObjClass = arrayMemberClassMap.get(arrayKey);
		let useGenericObj = 'undefined' === typeof returnClassObj || !returnClassObj || 'false' === returnClassObj || 0 === returnClassObj;
		for (let i=0; i<arrayOfObjs.length; i++) {
		
			let thisObjArgs = arrayOfObjs[i];
			
			//need to either read through an array or pull constructor args and remap. dumb.
			var thisObj;
			var isInvalid = false;
			if ('object' !== typeof thisObjArgs || null === thisObjArgs) {
			
				isInvalid = true;
			
			}
			else if (Array.isArray(thisObjArgs)) {
			
				thisObj = new ObjClass(...thisObjArgs);
			
			}
			else {
			
				try{
				
					thisObj = new ObjClass(thisObjArgs);
				
				}
				catch(e) {
				
					isInvalid = true;
				
				}
			
			}
			if (isInvalid) {
			
				invalidMembers++;
			
			}
			else if (useGenericObj && 'function' === typeof thisObj.getGeneric) {
			
				let genericObj = thisObj.getGeneric();
				newArray.push(genericObj);
			
			}
			else {
			
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

class UwotConfigBase {

	constructor(
		filePath
	) {
	
		this.filePath = sanitize.cleanString(filePath, 255);
		nconf.file(
			'local',
			this.filePath
		);
		nconf.defaults(confDefaults());
		this.nconf = nconf;
		this.utilities = {
			mergeMaps,
			isArrayKey,
			arrayMembersToClass
		};
	
	}
	
	getVal(cat, key, excludeArrays) {
	
		if ('string' !== typeof cat) {
		
			return undefined;
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' === typeof catVal && null !== catVal && 'string' === typeof key) {
			
				var confVal = catVal[key];
				if ('string' === typeof confVal) {
				
					if ('true' === confVal.trim().toLowerCase()) {
					
						return true;
					
					}
					else if ('false' === confVal.trim().toLowerCase()) {
					
						return false;
					
					}
					else {
					
						return confVal.trim();	
					
					}
				
				}
				return confVal;	
			
			}
			else if ('object' === typeof catVal && null !== catVal) {
			
				if ('undefined' === typeof excludeArrays || excludeArrays) {
			
					arrayKeys.forEach(function(ak) {
				
						let thisAk = ak.split(':', 2);
						if (cat === thisAk[0]) {
					
							delete catVal[thisAk[1]];
					
						}
				
					});
			
				}
				var catKeys = Object.keys(catVal);
				catKeys.forEach(function(key) {
				
					if ('string' === typeof catVal[key]) {
					
						if ('true' === catVal[key].trim().toLowerCase()) {
						
							catVal[key] = true;
						
						}
						else if ('false' === catVal[key].trim().toLowerCase()) {
						
							catVal[key] = false;
						
						}
					
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
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to updateCatStrVals.');
		
		}
		else if ('string' !== typeof cat || 'object' !== typeof values || !(values instanceof Map)) {
		
			return callback(new TypeError('invalid args passed to updateCatStrVals.'), false);
		
		}
		else if (-1 === this.getCats().indexOf(cat)) {
		
			return callback(new RangeError('invalid category passed to updateCatStrVals.'), false);
		
		}
		else {
		
			var savedKeys = [];
			var i = 0;
			var currentVals, updatedVals;
			try {
			
				currentVals = new Map(Object.entries(this.getVal(cat, null, false)));
				updatedVals = this.utilities.mergeMaps(currentVals, values, cat);
				
			}
			catch(e) {
			
				return callback(e, null);
			
			}
			updatedVals.forEach(function(val, key) {
			
				var newVal;
				if ('true' === val.toString().trim().toLowerCase()) {
				
					newVal = true;
				
				}
				else if ('false' === val.toString().trim().toLowerCase()) {
				
					newVal = false;
				
				}
				else {
				
					newVal = val.toString().trim();
				
				}
				if (newVal !== currentVals.get(key)) {
				
					nconf.set(cat + ':' + key, newVal);
					savedKeys.push(key);
				
				}
				if (++i >= updatedVals.size) {
				
					nconf.save(null, function(error, isSaved) {
					
						if (error) {
						
							return callback(error, savedKeys);
						
						}
						else if (!isSaved) {
						
							return callback(false, false);
						
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
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to setStrVal.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key || 'string' !== typeof value) {
		
			return callback(new TypeError('invalid args passed to setStrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' === typeof catVal && null !== catVal) {
			
				var valIsSet = false;
				if ('true' === value.toString().trim().toLowerCase()) {
				
					valIsSet = nconf.set(cat + ':' + sanitize.cleanString(key), true);
				
				}
				else if ('false' === value.toString().trim().toLowerCase()) {
				
					valIsSet = nconf.set(cat + ':' + sanitize.cleanString(key), false);
				
				}
				else {
				
					valIsSet = nconf.set(cat + ':' + sanitize.cleanString(key), sanitize.cleanString(value));
				
				}
				if (!valIsSet) {
				
					return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
				
				}
				else {
				
					return nconf.save(null, callback);
				
				}
			
			}
			else {
			
				return callback(new RangeError('invalid cat passed to setStrVal.'), false);
			
			}

		}
	
	}
	
	setArrVal(cat, key, value, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to setArrVal.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key || 'object' !== typeof value || null === value || !(Array.isArray(value))) {
		
			return callback(new TypeError('invalid args passed to setArrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			var valIsSet;
			if ('object' === typeof catVal && null !== catVal) {
			
				try {
				
					valIsSet = nconf.set(cat + ':' + sanitize.cleanString(key), this.utilities.arrayMembersToClass(value, cat + ':' + sanitize.cleanString(key)));
				
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
			
				return callback(new RangeError('invalid cat passed to setArrVal.'), false);
			
			}

		}
	
	}
	
	addArrVal(cat, key, value, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to addArrVal.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key || 'string' !== typeof value) {
		
			return callback(new TypeError('invalid args passed to addArrVal.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			var newObj = global.Uwot.Constants.tryParseJSON(sanitize.cleanString(value, 1024));
			if ('object' === typeof catVal && null !== catVal) {
			
				var currArr = catVal[key];
				if ('object' !== typeof currArr || !(Array.isArray(currArr))) {
				
					return callback(new TypeError('value for ' + cat + ':' + key + ' is not an array.'), false);
				
				}
				else if (!newObj || 'object' !== typeof newObj) {
				
					return callback(new TypeError('new value for ' + cat + ':' + key + ' is not a JSON encoded object.'), false);
				
				}
				else {
					
					var newValue;
					var updatedArr;
					try {
						newValue = this.utilities.arrayMembersToClass([newObj], cat + ':' + key);
						updatedArr = currArr.concat(newValue);
					}
					catch(e) {
					
						return callback(e, newObj);
					
					}
					if (nconf.set(cat + ':' + sanitize.cleanString(key), updatedArr)) {
				
						return nconf.save(null, callback);
				
					}
					else {
					
						return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
					
					}
				
				}
			
			}
			else {
			
				return callback(new RangeError('invalid cat passed to addArrVal.'), false);
			
			}

		}
	
	}
	
	removeArrIdx(cat, key, index, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to setArrVal.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key || 'number' !== typeof index || isNaN(parseInt(index))) {
		
			return callback(new TypeError('invalid args passed to removeArrIdx.'), false);
		
		}
		else {
		
			var catVal = nconf.get(cat);
			if ('object' === typeof catVal && null !== catVal) {
			
				var currArr = catVal[key];
				if ('object' !== typeof currArr || !(Array.isArray(currArr))) {
				
					return callback(new TypeError('value for ' + cat + ':' + key + ' is not an array.'), false);
				
				}
				else if(currArr[index] === undefined) {
				
					return callback(false, false);
				
				}
				else {
				
					currArr.splice(index, 1);
					if (nconf.set(cat + ':' + sanitize.cleanString(key), currArr)) {
					
						return nconf.save(null, callback);
					
					}
					else {
					
						return callback(new Error('unable to set value for ' + cat + ':' + key + '.'), false);
					}
				
				}
			
			}
			else {
			
				return callback(new RangeError('invalid cat passed to removeArrIdx.'), false);
			
			}

		}
	
	}
	
	resetToDefault(cat, key, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to resetToDefault.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key) {
		
			return callback(new TypeError('invalid args passed to resetToDefault.'), false);
		
		}
		else {
		
			var localCatVals = nconf.stores.local.get(cat);
			if ('object' === typeof localCatVals && 'undefined' !== typeof localCatVals[key]) {
			
				nconf.stores.local.clear(cat + ':' + key);
				return nconf.save(null, callback);
			
			}
			else {
			
				return callback(false, true);
			
			}
		
		}
	
	}
	
	isArrayKey(keyString) {
	
		return this.utilities.isArrayKey(keyString);
	
	}
	
	getConfigServerOrigin() {
	
		let cnfTransport, cnfPort, cnfDomain, cnfSecure;
		let serverCnf = this.nconf.get('server');
		let defaults = confDefaults();
		cnfTransport = 'object' === typeof serverCnf &&null !== serverCnf && 'string' === typeof serverCnf.transport ? serverCnf.transport : defaults.server.transport;
		cnfDomain = 'object' === typeof serverCnf && null !== serverCnf && 'string' === typeof serverCnf.domain ? serverCnf.domain : defaults.server.domain;
		cnfPort = 'object' === typeof serverCnf && null !== serverCnf && 'string' === typeof serverCnf.port ? serverCnf.port : defaults.server.port.toString();
		cnfSecure = 'object' === typeof serverCnf && null !== serverCnf && ('string' === typeof serverCnf.transport || 'boolean' === typeof serverCnf.transport) ? sanitize.cleanBool(serverCnf.secure) : false;
		if ('boolean' === typeof cnfSecure && cnfSecure) {
			cnfPort = '443';
			cnfTransport = 'https';
		}
		var confOrigin = cnfTransport + '://' + cnfDomain;
		if ((cnfPort === '80' && cnfTransport === 'http') || (cnfPort === '443' & cnfTransport === 'https')) {
	
			confOrigin += '/';
		
		}
		else {
		
			confOrigin += ':' + cnfPort + '/';
	
		}
		return confOrigin;
	
	}

}

module.exports = UwotConfigBase;
