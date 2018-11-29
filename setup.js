'use strict';
const path = require('path');
const fileLog = require('./logger').all;
const config = require('./config');
const sanitize = require('./helpers/valueConversions');

var configProd = path.resolve(__dirname, 'etc', 'prod', 'config.json');
var configDev = path.resolve(__dirname, 'etc', 'dev', 'config.json');
const validEnv = [
	'development',
	'production',
	'dev',
	'prod'
];

class UwotSetup {

	constructor(
		environments
	) {
	
		if ('object' !== typeof environments || null === environments || !(Array.isArray(environments)) || environments.length < 1 ) {
		
			throw new TypeError('environments must be a nonempty array of strings.');
		
		}
		else {
		
			this.useDev = false;
			this.useProd = false;
			for (let i=0; i<environments.length; i++) {
			
				let env = environments[i];
				if ('string' == typeof env && -1 != validEnv.indexOf(env)) {
				
					switch(env) {
					
						case 'dev':
						case 'development':
							this.useDev = true;
							break;
						case 'prod':
						case 'production':
							this.useProd = true;
					
					}
				
				}
			
			}
			if (!useDev && !useProd) {
			
				throw new Error('no valid environments.');
			
			}
		
		}
	
	}
	// does reset array values
	resetCat(cat, callback) {
	
		
	
	}
	
	// does not set array values for config.arrayKeys
	setCat(cat, values, callback) {
	
		
	
	}
	
	addArrayValue(cat, key, value, callback) {
	
		
	
	}
	
	removeArrayIndex(cat, key, index, callback) {
	
	
	
	}
	
	

};

module.exports = UwotSetup;
