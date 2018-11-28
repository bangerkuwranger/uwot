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

class UwotConfigBase {

	constructor(
		filePath
	) {
	
		this.values = nconf.file(
			'local',
			filePath
		);
		this.values.defaults(confDefaults);
		var defaultKeys = Object.keys(confDefaults);
		for (let kidx in defaultKeys) {
		
			let val = defaultKeys[kidx];
			if ('type' !== val && 'undefined' == typeof this.values.stores.local.get(val)) {
			
				this.values.stores.local.set(val, this.values.stores.defaults.get(val));
			
			}
		
		}
		this.values.save(null, function(error) {
		
			if(error) fileLog.error(error);
		
		});
	
	}

};

module.exports = UwotConfigBase;
