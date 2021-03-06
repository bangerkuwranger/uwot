'use strict';
const path = require('path');
const config = require('./config');

var configProd = path.resolve(__dirname, 'etc', 'prod', 'config.json');
var configDev = path.resolve(__dirname, 'etc', 'dev', 'config.json');
const validEnv = [
	'development',
	'production',
	'dev',
	'prod'
];
const noCbCos = [
	'get',
	'getCats',
	'isArrayKey'
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
				if ('string' === typeof env && -1 !== validEnv.indexOf(env)) {
				
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
			if (!this.useDev && !this.useProd) {
			
				throw new Error('no valid environments.');
			
			}
		
		}
	
	}
	
	performConfigOperation(operation, args, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to performConfigOperation.');
		
		}
		else if ('string' !== typeof operation || 'object' !== typeof args || null === args || !(Array.isArray(args))) {
		
			return callback(new TypeError('invalid arguments passed to performConfigOperation.'), null);
		
		}
		else {
		
			if (this.useDev && this.useProd) {
			
				if (!this.prodConfig) {
				
					this.prodConfig = new config(configProd);
				
				}
				if (!this.devConfig) {
				
					this.devConfig = new config(configDev);
				
				}
				if (-1 !== noCbCos.indexOf(operation)) {
				
					return this.prodConfig[operation](...args);
				
				}
				else {
				
					var self = this;
					this.devConfig[operation](...args, function(error) {
					
						if (error) {
						
							return callback(error, null);
						
						}
						else {
						
							args.push(callback);
							return self.prodConfig[operation](...args);
						
						}
					
					}); 
				
				}
			
			}
			else if (this.useDev) {
			
				if (!this.devConfig) {
				
					this.devConfig = new config(configDev);
				
				}
				if (-1 !== noCbCos.indexOf(operation)) {
				
					return callback(false, this.devConfig[operation](...args));
				
				}
				else {
				
					args.push(callback);
					return this.devConfig[operation](...args);
				
				}
			
			}
			else if (this.useProd) {
			
				if (!this.prodConfig) {
				
					this.prodConfig = new config(configProd);
				
				}
				if (-1 !== noCbCos.indexOf(operation)) {
				
					return callback(false, this.prodConfig[operation](...args));
				
				}
				else {
				
					args.push(callback);
					return this.prodConfig[operation](...args);
				
				}
			
			}
			else {
			
				return callback(new Error('no valid environments.'), null);
			
			}
		
		}
	
	}
	
	// does reset array values
	resetCat(cat, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to resetCat.');
		
		}
		else {
		
			var self = this;
			this.performConfigOperation('get', [cat, null, false], function(error, catVals) {
				var catKeys = Object.keys(catVals);
				let i = 0;
				catKeys.forEach((key) => {
			
					self.performConfigOperation('resetToDefault', [cat, key], function(error, isSaved) {
			
						if (error) {
					
							return callback(error, false);
					
						}
						else if (!isSaved) {
					
							return callback(new Error('unable to reset value for ' + cat + ':' + key), false);
					
						}
						else if (++i >= catKeys.length) {
					
							return callback(false, true);
					
						}
			
					});
				
				});
			
			});
		
		}
	
	}
	
	// does not set array values for config.arrayKeys.
	// values should be a Map object.
	setCat(cat, values, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to setCat.');
		
		}
		else if ('string' !== typeof cat || 'object' !== typeof values || !(values instanceof Map)) {
		
			return callback(new TypeError('invalid args passed to setCat.'), false);
		
		}
		else {
		
			this.performConfigOperation('updateCatStrVals', [cat, values], function(error, savedKeys) {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if (savedKeys.length < 1) {
				
					return callback(new Error('no values were changed'), false);
				
				}
				else {
				
					return callback(false, savedKeys);
				
				}
			
			});	
		
		}
	
	}
	
	addArrayValue(cat, key, value, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to resetCat.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key ||'undefined' === typeof value) {
		
			return callback(new TypeError('invalid args passed to addArrayValue.'), false);
		
		}
		else {
		
			return this.performConfigOperation('addArrVal', [cat, key, value], callback);
		
		}
	
	}
	
	removeArrayIndex(cat, key, index, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to removeArrayIndex.');
		
		}
		else if ('string' !== typeof cat || 'string' !== typeof key || 'number' !== typeof index) {
		
			return callback(new TypeError('invalid args passed to removeArrayIndex.'), false);
		
		}
		else {
		
			return this.performConfigOperation('removeArrIdx', [cat, key, parseInt(index)], callback);
		
		}
	
	}
	
	listCats(callback) {
	
		
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to listCats.');
		
		}
		return this.performConfigOperation('getCats', [], callback);
	
	}
	
	listCat(cat, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to listCat.');
		
		}
		return this.performConfigOperation('get', [cat, null, false], callback);
	
	}
	
	listArrayValues(cat, key, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to listArrayValues.');
		
		}
		return this.performConfigOperation('get', [cat, key, false], callback);
	
	}

}

module.exports = UwotSetup;
