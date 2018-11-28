'use strict';
const path = require('path');
const fs = require('fs');
const nconf = require('nconf');
const fileLog = require('./logger').all;
const confDefaults = {
	server: {
		domain: 'localhost',
		secure: false,
		port: 80
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

class ExternalBinPath{};

class ExternalTheme{};

class ReverseProxyBin{};

// want to see if we can abstract out the setters and only use those in setup.js. doubt it, but worth a try? probably will need to set property (as originally) or use method (private ain't a thing in targeted ES6)
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

};

module.exports = UwotConfigBase;
