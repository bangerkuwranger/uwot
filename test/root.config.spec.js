var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');
globalSetupHelper.initConstants();

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const sanitize = require('../helpers/valueConversion');
const Config = require('../config');
var config;
const testConfigPathDev = path.resolve(global.Uwot.Constants.etcDev, 'config.json');
const testConfigDefaults = function() {
	return {
		server: {
			siteName: 'UWOT',
			showVersion: true,
			domain: 'localhost',
			secure: false,
			port: '80',
			transport: 'http',
			pubDir: path.resolve('fs/var/www/html'),
			userDir: path.resolve('fs/home')
		},
		users: {
			allowGuest: false,
			sudoFullRoot: false,
			createHome: false,
			homeWritable: false,
			allowShellFunctions: false,
			allowGuestShellFunctions: false
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

describe('config.js', function() {

	describe('UwotConfigBase', function() {
	
		var stubDefaults;
		beforeEach(function() {
		
			config = new Config(
				testConfigPathDev
			);
			stubDefaults = testConfigDefaults();
		
		});
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(Config.constructor).to.be.a('function');
			
			});
			it('should set this.filePath to the value of the filePath argument', function() {
			
				expect(config.filePath).to.equal(sanitize.cleanString(testConfigPathDev, 255));
			
			});
			it('should instantiate nconf with a filestore from this.filePath', function() {
			
				expect(config.nconf.stores.local.file).to.equal(config.filePath);
			
			});
			it('should set the utilities property to an object with properties for each utility function', function() {
			
				expect(config.utilities).to.be.an('object');
				expect(config.utilities).to.have.own.property('mergeMaps');
				expect(config.utilities).to.have.own.property('isArrayKey');
				expect(config.utilities).to.have.own.property('arrayMembersToClass');
			
			});
		
		});
		describe('utilities', function() {
		
			describe('mergeMaps', function() {
			
				it('should be a function', function() {
				
					expect(config.utilities.mergeMaps).to.be.a('function');
				
				});
				it('should throw a TypeError if the oldMap argument is not a Map object', function() {
				
					expect(config.utilities.mergeMaps).to.throw(TypeError, 'oldMap and newMap args must be instances of Map for mergeMaps');
					function passNullOldMap() {
					
						return config.utilities.mergeMaps(null, new Map(), 'users');
					
					};
					expect(passNullOldMap).to.throw(TypeError, 'oldMap and newMap args must be instances of Map for mergeMaps');
				
				});
				it('should throw a TypeError if the newMap argument is not a Map object', function() {
				
					function passNullNewMap() {
					
						return config.utilities.mergeMaps(new Map(), null, 'users');
					
					};
					function passStringNewMap() {
					
						return config.utilities.mergeMaps(new Map(), 'map', 'users');
					
					};
					expect(passNullNewMap).to.throw(TypeError, 'oldMap and newMap args must be instances of Map for mergeMaps');
					expect(passStringNewMap).to.throw(TypeError, 'oldMap and newMap args must be instances of Map for mergeMaps');
				
				});
				it('should throw a TypeError if the catName argument is not a string', function() {
				
					function passNullCat() {
					
						return config.utilities.mergeMaps(new Map(), new Map(), null);
					
					};
					expect(passNullCat).to.throw(TypeError, 'invalid category name passed to mergeMaps');
				
				});
				it('should throw a TypeError if the catName argument is not a valid config category', function() {
				
					function passInvalidCat() {
					
						return config.utilities.mergeMaps(new Map(), new Map(), 'hens');
					
					};
					expect(passInvalidCat).to.throw(TypeError, 'invalid category name passed to mergeMaps');
				
				});
				it('should return a Map object with all keys found in both oldMap and newMap set to the values in newMap', function() {
				
					var usersDefaultsObj = testConfigDefaults().users;
					var oldMap = new Map();
					var newMap = new Map();
					var testNewMap = new Map();
					var testOldMap = new Map();
					var userKeys = Object.keys(usersDefaultsObj);
					userKeys.forEach(function (key) {
					
						if (usersDefaultsObj[key]) {
						
							oldMap.set(key, true);
							newMap.set(key, false);
							testOldMap.set(key, true);
							testNewMap.set(key, false);
						
						}
						else {
						
							oldMap.set(key, false);
							newMap.set(key, true);
							testOldMap.set(key, false);
							testNewMap.set(key, true);
						
						}
					
					});
					var mergedMap = config.utilities.mergeMaps(oldMap, newMap, 'users');
					mergedMap.forEach(function(value,key) {
					
						expect(value).to.equal(testNewMap.get(key));
					
					});
				
				});
				it('should return a Map object with all keys found only in oldMap set to the values in oldMap', function() {
				
					var usersDefaultsObj = testConfigDefaults().users;
					var oldMap = new Map();
					var newMap = new Map();
					var testNewMap = new Map();
					var testOldMap = new Map();
					var userKeys = Object.keys(usersDefaultsObj);
					userKeys.forEach(function (key) {
					
						if (usersDefaultsObj[key]) {
						
							oldMap.set(key, true);
							newMap.set(key, false);
							testOldMap.set(key, true);
							testNewMap.set(key, false);
						
						}
						else {
						
							oldMap.set(key, false);
							newMap.set(key, true);
							testOldMap.set(key, false);
							testNewMap.set(key, true);
						
						}
					
					});
					newMap.delete('homeWritable');
					testNewMap.delete('homeWritable');
					var mergedMap = config.utilities.mergeMaps(oldMap, newMap, 'users');
					expect(mergedMap.get('homeWritable')).to.equal(testOldMap.get('homeWritable'));
				
				});
				it('should return a Map object with all keys found only in newMap set to the values in newMap', function() {
				
					var usersDefaultsObj = testConfigDefaults().users;
					var oldMap = new Map();
					var newMap = new Map();
					var testNewMap = new Map();
					var testOldMap = new Map();
					var userKeys = Object.keys(usersDefaultsObj);
					userKeys.forEach(function (key) {
					
						if (usersDefaultsObj[key]) {
						
							oldMap.set(key, true);
							newMap.set(key, false);
							testOldMap.set(key, true);
							testNewMap.set(key, false);
						
						}
						else {
						
							oldMap.set(key, false);
							newMap.set(key, true);
							testOldMap.set(key, false);
							testNewMap.set(key, true);
						
						}
					
					});
					oldMap.delete('homeWritable');
					testOldMap.delete('homeWritable');
					var mergedMap = config.utilities.mergeMaps(oldMap, newMap, 'users');
					expect(mergedMap.get('homeWritable')).to.equal(testNewMap.get('homeWritable'));
				
				});
				it('should not return a map containing any array key values', function() {
				
					var binpathDefaultsObj = testConfigDefaults().binpath;
					var oldMap = new Map();
					var newMap = new Map();
					var testNewMap = new Map();
					var testOldMap = new Map();
					var userKeys = Object.keys(binpathDefaultsObj);
					userKeys.forEach(function (key) {
					
						if ('boolean' != typeof binpathDefaultsObj[key]) {
						
							oldMap.set(key, binpathDefaultsObj[key]);
							newMap.set(key, binpathDefaultsObj[key]);
							testOldMap.set(key, binpathDefaultsObj[key]);
							testNewMap.set(key, binpathDefaultsObj[key]);
						
						}
						else if (binpathDefaultsObj[key]) {
						
							oldMap.set(key, true);
							newMap.set(key, false);
							testOldMap.set(key, true);
							testNewMap.set(key, false);
						
						}
						else {
						
							oldMap.set(key, false);
							newMap.set(key, true);
							testOldMap.set(key, false);
							testNewMap.set(key, true);
						
						}
					
					});
					var mergedMap = config.utilities.mergeMaps(oldMap, newMap, 'binpath');
					testNewMap.forEach(function(value,key) {
					
						if ('boolean' == typeof value) {
						
							expect(value).to.equal(mergedMap.get(key));
						
						}
						else {
						
							expect(mergedMap.get(key)).to.be.undefined;
						
						}
					
					});
				
				});
			
			});
			describe('isArrayKey', function() {
			
				it('should be a function', function() {
				
					expect(config.utilities.isArrayKey).to.be.a('function');
				
				});
				it('should return false if keyString is not a string or an empty string', function() {
				
					expect(config.utilities.isArrayKey()).to.be.false;
					expect(config.utilities.isArrayKey(null)).to.be.false;
					expect(config.utilities.isArrayKey('')).to.be.false;
				
				});
				it('should return false if keyString does not exist in the arrayKeys Array defined in config.js', function() {
				
					expect(config.utilities.isArrayKey('themes:useExternal')).to.be.false;
				
				});
				it('should return true if keyString does exist in the arrayKeys Array defined in config.js', function() {
				
					expect(config.utilities.isArrayKey('themes:external')).to.be.true;
				
				});
			
			});
			describe('arrayMembersToClass', function() {
			
				it('should be a function', function() {
				
					expect(config.utilities.arrayMembersToClass).to.be.a('function');
				
				});
				it('should throw a TypeError if the arrayOfObjs argument is not an Array', function() {
				
					expect(config.utilities.arrayMembersToClass).to.throw(TypeError, 'first argument must be an array of objects.');
				
				});
				it('should throw an Error if the arrayKey argument is not a valid array key string', function() {
				
					function passNullArrayKey() {
					
						return config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth']], null);
						
					}
					expect(passNullArrayKey).to.throw(Error, 'config setting "null" does not accept array values.')
				
				});
				it('should not return any array members that are not objects or === null', function() {
				
					var passInvalidValues = config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth'], {name: 'precience', path:'themes/precience'}, null, 'temptress'], 'themes:external');
					expect(passInvalidValues).to.be.an('array');
					expect(passInvalidValues[0]).to.deep.equal({name: 'sawtooth', path:'themes/sawtooth'});
					expect(passInvalidValues[1]).to.deep.equal({name: 'precience', path:'themes/precience'});
					expect(passInvalidValues[2]).to.be.undefined;
					expect(passInvalidValues[3]).to.be.undefined;
				
				});
				it('should not return any array members cause the class constructor to throw an error', function() {
				
					var passInvalidConstArgs = config.utilities.arrayMembersToClass([{name: 'precience', path:'themes/precience'}], 'binpath:external');
					expect(passInvalidConstArgs).to.be.an('array');
					expect(passInvalidConstArgs[0]).to.be.undefined;
				
				});
				it('should return valid members as generic objects if returnClassObj is undefined, falsey, or === "false"', function() {
				
					var passFalseReturnClass = config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth'], {name: 'precience', path:'themes/precience'}], 'themes:external', false);
					expect(passFalseReturnClass).to.be.an('array');
					expect(passFalseReturnClass[0].constructor.name).to.equal('Object');
					expect(passFalseReturnClass[1].constructor.name).to.equal('Object');
					var passZeroReturnClass = config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth'], {name: 'precience', path:'themes/precience'}], 'themes:external', 0);
					expect(passZeroReturnClass).to.be.an('array');
					expect(passZeroReturnClass[0].constructor.name).to.equal('Object');
					expect(passZeroReturnClass[1].constructor.name).to.equal('Object');
					var passFalseStringReturnClass = config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth'], {name: 'precience', path:'themes/precience'}], 'themes:external', 'false');
					expect(passFalseStringReturnClass).to.be.an('array');
					expect(passFalseStringReturnClass[0].constructor.name).to.equal('Object');
					expect(passFalseStringReturnClass[1].constructor.name).to.equal('Object');
				
				});
				it('should return valid members as instances of correct associated object if returnClassObj is true', function() {
				
					var expectExternalTheme = config.utilities.arrayMembersToClass([['sawtooth', 'themes/sawtooth'], {name: 'precience', path:'themes/precience'}], 'themes:external', true);
					expect(expectExternalTheme).to.be.an('array');
					expect(expectExternalTheme[0].constructor.name).to.equal('ExternalTheme');
					expect(expectExternalTheme[1].constructor.name).to.equal('ExternalTheme');
					var expectExternalBinPath = config.utilities.arrayMembersToClass([{pathName: 'precience', dirPath:path.resolve(global.Uwot.Constants.appRoot, 'routes/bin')}], 'binpath:external', true);
					expect(expectExternalBinPath).to.be.an('array');
					expect(expectExternalBinPath[0].constructor.name).to.equal('ExternalBinPath');
					var expectReverseProxyBin = config.utilities.arrayMembersToClass([{name: 'precience', url: 'https://www.chadacarino.com/', isLocal: false, isConsole: true}], 'binpath:reverseProxies', true);
					expect(expectReverseProxyBin).to.be.an('array');
					expect(expectReverseProxyBin[0].constructor.name).to.equal('ReverseProxyBin');
				
				});
			
			});
		
		});
		describe('get', function() {
		
			it('should be a function', function() {
			
				expect(config.get).to.be.a('function');
			
			});
			it('should return undefined if cat argument is not a string', function() {
			
				expect(config.get()).to.be.undefined;
				expect(config.get(null)).to.be.undefined;
			
			});
			it('should return the value of nconf.get("cat") if that value is not an object', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnString(key) {
				
					if (key === 'testConfCat') {
					
						return 'test nconf value';
					
					}
					else {
					
						return stubDefaults[key];
					
					}
				
				});
				expect(config.get('testConfCat')).to.equal('test nconf value');
			
			});
			it('should return the value of nconf.get(cat)[key] if nconf.get(cat) is a non-null object, key argument is a string, and nconf.get(cat)[key] is not a string', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnNotString(key) {
				
					if (key === 'testConfCat') {
					
						return {
							val1: 'test nconf value',
							val2: 'also test nconf value',
							val3: [
								'test',
								'nconf',
								'value'
							],
							val4: 'true',
							val5: true,
							val6: 'false',
							val7: false
						}
					
					}
					else {
					
						return stubDefaults[key];
					
					}
					
				});
				expect(config.get('testConfCat', 'val3')).to.be.an('array').that.includes('test', 'nconf', 'value');
				expect(config.get('testConfCat', 'val5')).to.be.true;
				expect(config.get('testConfCat', 'val7')).to.be.false;
			
			});
			it('should return the value of nconf.get(cat)[key] if nconf.get(cat) is a non-null object, key argument is a string, and nconf.get(cat)[key] is a string that does not equal "true" or "false"', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnNotString(key) {
				
					if (key === 'testConfCat') {
					
						return {
							val1: 'test nconf value',
							val2: 'also test nconf value',
							val3: [
								'test',
								'nconf',
								'value'
							],
							val4: 'true',
							val5: true,
							val6: 'false',
							val7: false
						}
					
					}
					else {
					
						return stubDefaults[key];
					
					}
					
				});
				expect(config.get('testConfCat', 'val1')).to.equal('test nconf value');
				expect(config.get('testConfCat', 'val2')).to.equal('also test nconf value');
			
			});
			it('should return true if nconf.get(cat) is a non-null object, key argument is a string, and nconf.get(cat)[key] is a string that === "true" after trim() and toLowerCase()', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnNotString(key) {
				
					if (key === 'testConfCat') {
					
						return {
							val1: 'test nconf value',
							val2: 'also test nconf value',
							val3: [
								'test',
								'nconf',
								'value'
							],
							val4: 'true',
							val5: true,
							val6: 'false',
							val7: false
						}
					
					}
					else {
					
						return stubDefaults[key];
					
					}
					
				});
				expect(config.get('testConfCat', 'val4')).to.be.true;
				expect(config.get('testConfCat', 'val5')).to.be.true;
			
			});
			it('should return true if nconf.get(cat) is a non-null object, key argument is a string, and nconf.get(cat)[key] is a string that === "false" after trim() and toLowerCase()', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnNotString(key) {
				
					if (key === 'testConfCat') {
					
						return {
							val1: 'test nconf value',
							val2: 'also test nconf value',
							val3: [
								'test',
								'nconf',
								'value'
							],
							val4: 'true',
							val5: true,
							val6: 'false',
							val7: false
						}
					
					}
					else {
					
						return stubDefaults[key];
					
					}
					
				});
				expect(config.get('testConfCat', 'val6')).to.be.false;
				expect(config.get('testConfCat', 'val7')).to.be.false;
			
			});
			it('should return an object with all config values for category, excluding array values, if cat is a string, key is not a string, and excludeArrays is undefined', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(key) {
				
					return stubDefaults[key];
				
				});
				var themesValsObjNoArrays = config.get('themes', null);
				expect(themesValsObjNoArrays).to.be.an('object').that.is.not.null;
				expect(themesValsObjNoArrays.external).to.be.undefined;
			
			});
			it('should return an object with all config values for category, excluding array values, if cat is a string, key is not a string, and excludeArrays is true', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(key) {
				
					return stubDefaults[key];
				
				});
				var themesValsObjNoArrays = config.get('themes', null, true);
				expect(themesValsObjNoArrays).to.be.an('object').that.is.not.null;
				expect(themesValsObjNoArrays.external).to.be.undefined;
			
			});
			it('should return an object with all config values for category, excluding array values, if cat is a string, key is not a string, and excludeArrays is true', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(key) {
				
					return stubDefaults[key];
				
				});
				var themesValsObjNoArrays = config.get('themes', null, false);
				expect(themesValsObjNoArrays).to.be.an('object').that.is.not.null;
				expect(themesValsObjNoArrays).to.deep.equal(testConfigDefaults().themes);
			
			});
			it('should return an object with all config values, and any strings that, after trim() and toLowerCase() === "true" or "false" should be boolean', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnNotString(key) {
				
					if (key === 'testConfCat') {
					
						return {
							val1: 'test nconf value',
							val2: 'also test nconf value',
							val3: [
								'test',
								'nconf',
								'value'
							],
							val4: 'true',
							val5: true,
							val6: 'false',
							val7: false
						}
					
					}
					else {
					
						return stubDefaults[key];
					
					}
				
				});
				var themesValsObjNoArrays = config.get('testConfCat');
				expect(themesValsObjNoArrays.val4).to.be.true;
				expect(themesValsObjNoArrays.val6).to.be.false;
			
			})
		
		});
		describe('getCats', function() {
		
			it('should be a function', function() {
			
				expect(config.getCats).to.be.a('function');
			
			});
			it('should return an array of all of the config category names', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnAllDefaults(key) {
				
					return stubDefaults;
				
				});
				var cats = Object.keys(stubDefaults);
				var testGetCats = config.getCats();
				expect(testGetCats).to.deep.equal(cats);
			
			});
		
		});
		describe('updateCatStrVals', function() {
		
			var testCatStrValueMap;
			beforeEach(function() {
			
				testCatStrValueMap = new Map();
				testCatStrValueMap.set('allowGuest', true);
				testCatStrValueMap.set('sudoFullRoot', true);
				testCatStrValueMap.set('createHome', 'true');
				testCatStrValueMap.set('homeWritable', true);
				testCatStrValueMap.set('allowShellFunctions', false);
				testCatStrValueMap.set('allowGuestShellFunctions', 'false');
			
			});
			it('should be a function', function() {
			
				expect(config.updateCatStrVals).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.updateCatStrVals).to.throw(TypeError, 'invalid callback passed to updateCatStrVals.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.updateCatStrVals(null, testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to updateCatStrVals.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if values argument is not a Map object', function(done) {
			
				config.updateCatStrVals('users', 'testCatStrValueMap', function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to updateCatStrVals.');
					config.updateCatStrVals('users', null, function(error, savedKeys) {
					
						expect(error).to.be.an.instanceof(TypeError);
						expect(error.message).to.equal('invalid args passed to updateCatStrVals.');
						done();
					
					});
				
				});
			
			});
			it('should return a RangeError to callback if category does not exist', function(done) {
			
				var getCatsStub = sinon.stub(config, 'getCats').callsFake(function returnEmptyArray(cat) {
				
					return [];
				
				});
				config.updateCatStrVals('users', testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid category passed to updateCatStrVals.');
					done();
				
				});
			
			});
			it('should return an Error to callback if an error is thrown while getting current config category values', function(done) {
			
				var getCatStub = sinon.stub(config, 'get').callsFake(function throwNewError(cat, key, arrays) {
				
					throw new Error('test nconf.get error');
				
				});
				var mergeMapsStub = sinon.stub(config.utilities, 'mergeMaps').callsFake(function throwError(current, updated, cat) {
				
					throw new Error('test mergeMaps error');
				
				});
				config.updateCatStrVals('users', testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.get error');
					done();
				
				});
			
			});
			it('should return an Error to callback if an error is thrown by mergeMaps utility', function(done) {
			
				var mergeMapsStub = sinon.stub(config.utilities, 'mergeMaps').callsFake(function throwError(current, updated, cat) {
				
					throw new Error('test mergeMaps error');
				
				});
				config.updateCatStrVals('users', testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test mergeMaps error');
					done();
				
				});
			
			});
			it('should return an Error to callback if nconf.save returns an error', function(done) {
			
				var usersDefaultsObj = testConfigDefaults().users;
				var usersKeys = Object.keys(usersDefaultsObj);
				var usersDefaultsMap = new Map();
				usersKeys.forEach(function(key) {
				
					usersDefaultsMap.set(key, usersDefaultsObj[key]);
				
				});
				var getCatStub = sinon.stub(config, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnVoid(key, value) {
				
					return;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnsError(dummy, callback) {
				
					return callback(new Error('test nconf.save error'), false);
				
				});
				config.updateCatStrVals('users', usersDefaultsMap, function(error, savedKeys) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.save error');
					done();
				
				});
			
			});
			it('should return callback(false, []) if there were no differences to save to config category between current and updated values', function(done) {
			
				var usersDefaultsObj = testConfigDefaults().users;
				var usersKeys = Object.keys(usersDefaultsObj);
				var usersDefaultsMap = new Map();
				usersKeys.forEach(function(key) {
				
					usersDefaultsMap.set(key, usersDefaultsObj[key]);
				
				});
				var getCatStub = sinon.stub(config, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnVoid(key, value) {
				
					return;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnsTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.updateCatStrVals('users', usersDefaultsMap, function(error, savedKeys) {
				
					expect(error).to.be.false;
					expect(savedKeys).to.deep.equal([]);
					done();
				
				});
			
			});
			it('should return callback(false, false) if there were differences to save to config category between current and updated values, but nconf could not save and did not throw an error', function(done) {
			
				var usersDefaultsObj = testConfigDefaults().users;
				var usersKeys = Object.keys(usersDefaultsObj);
				var usersDefaultsMap = new Map();
				usersKeys.forEach(function(key) {
				
					usersDefaultsMap.set(key, usersDefaultsObj[key]);
				
				});
				var getCatStub = sinon.stub(config, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnVoid(key, value) {
				
					return;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnsFalse(dummy, callback) {
				
					return callback(false, false);
				
				});
				config.updateCatStrVals('users', usersDefaultsMap, function(error, savedKeys) {
				
					expect(error).to.be.false;
					expect(savedKeys).to.be.false;
					done();
				
				});
			
			});
			it('should return callback(false, savedKeys) if changes were successfully saved for keys in array savedKeys', function(done) {
			
				var getCatStub = sinon.stub(config, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnVoid(key, value) {
				
					return;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnsTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.updateCatStrVals('users', testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.false;
					expect(savedKeys).to.be.an('array').that.includes('allowGuest', 'sudoFullRoot', 'createHome', 'homeWritable');
					done();
				
				});
			
			});
			it('should cast any changed values for keys with values that are strings that, after trim() and toLowerCase(), === "true" or "false" to booleans, and any other values to strings', function(done) {
			
				changedValues = {};
				var getCatStub = sinon.stub(config, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function updateChangedValues(key, value) {
				
					changedValues[key] = value;
					return;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnsTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				testCatStrValueMap.set('allowGuestShellFunctions', 0);
				config.updateCatStrVals('users', testCatStrValueMap, function(error, savedKeys) {
				
					expect(error).to.be.false;
					expect(savedKeys).to.be.an('array').that.includes('allowGuest', 'sudoFullRoot', 'createHome', 'homeWritable');
					expect(changedValues['users:createHome']).to.equal(true);
					expect(changedValues['users:allowGuestShellFunctions']).to.equal('0');
					done();
				
				});
			
			});
		
		});
		describe('setStrVal', function() {
		
			it('should be a function', function() {
			
				expect(config.setStrVal).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.setStrVal).to.throw(TypeError, 'invalid callback passed to setStrVal.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.setStrVal(null, 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setStrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if key argument is not a string', function(done) {
			
				config.setStrVal('users', null, 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setStrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if value argument is not a string', function(done) {
			
				config.setStrVal('users', 'allowGuest', true, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setStrVal.');
					done();
				
				});
			
			});
			it('should return a RangeError if cat argument does not match an existing category', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return undefined;
				
				});
				config.setStrVal('users', 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid cat passed to setStrVal.');
					done();
				
				});
			
			})
			it('should return a Error if nconf cannot set the value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return false;
				
				});
				config.setStrVal('users', 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('unable to set value for users:allowGuest.');
					done();
				
				});
			
			});
			it('should return a Error to callback if nconf cannot save the change', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnError(dummy, callback) {
				
					return callback(new Error('test nconf.save error'))
				
				});
				config.setStrVal('users', 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.save error');
					done();
				
				});
			
			});
			it('should return callback(false, true) if value was set and saved.', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.setStrVal('users', 'allowGuest', 'yes', function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.true;
					done();
				
				});
			
			});
			it('should cast value to a boolean if it is a string that, after trim() and toLowerCase(), === "true" or "false"', function(done) {
			
				var savedValues = {};
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					savedValues[key] = value;
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnError(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.setStrVal('users', 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.true;
					config.setStrVal('users', 'allowShellFunctions', 'false', function(error, isSaved) {
					
						expect(error).to.be.false;
						expect(isSaved).to.be.true;
						expect(savedValues['users:allowGuest']).to.equal(true);
						expect(savedValues['users:allowShellFunctions']).to.equal(false);
						done();
					
					});
				
				});
			
			});
		
		});
		describe('setArrVal', function() {
		
			it('should be a function', function() {
			
				expect(config.setArrVal).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.setArrVal).to.throw(TypeError, 'invalid callback passed to setArrVal.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.setArrVal(null, 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setArrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if key argument is not a string', function(done) {
			
				config.setArrVal('themes', null, ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setArrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if value argument is not an Array', function(done) {
			
				config.setArrVal('themes', 'external', 'ugly', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to setArrVal.');
					done();
				
				});
			
			});
			it('should return a RangeError if cat argument does not match an existing category', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return undefined;
				
				});
				config.setArrVal('themes', 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid cat passed to setArrVal.');
					done();
				
				});
			
			});
			it('should return an Error to callback if arrayMembersToClass throws an error', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				var arrayMembersToClassStub = sinon.stub(config.utilities, 'arrayMembersToClass').callsFake(function throwError(arr, key, returnAsClass) {
				
					throw new Error('test arrayMembersToClass error');
				
				});
				config.setArrVal('themes', 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test arrayMembersToClass error');
					done();
				
				});
			
			});
			it('should return a Error if nconf cannot set the value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return false;
				
				});
				config.setArrVal('themes', 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('unable to set value for themes:external.');
					done();
				
				});
			
			});
			it('should return a Error to callback if nconf cannot save the change', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnError(dummy, callback) {
				
					return callback(new Error('test nconf.save error'))
				
				});
				config.setArrVal('themes', 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.save error');
					done();
				
				});
			
			});
			it('should return callback(false, true) if value was set and saved.', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.setArrVal('themes', 'external', ['ugly, huge'], function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.true;
					done();
				
				});
			
			});
		
		});
		describe('addArrVal', function() {
		
			it('should be a function', function() {
			
				expect(config.addArrVal).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.addArrVal).to.throw(TypeError, 'invalid callback passed to addArrVal.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.addArrVal(null, 'external', 'sawtooth', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to addArrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if key argument is not a string', function(done) {
			
				config.addArrVal('themes', null, 'sawtooth', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to addArrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if value argument is not a string', function(done) {
			
				config.addArrVal('themes', 'external', null, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to addArrVal.');
					done();
				
				});
			
			});
			it('should return a RangeError if cat argument does not match an existing category', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return undefined;
				
				});
				config.addArrVal('themes', 'external', 'sawtooth', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid cat passed to addArrVal.');
					done();
				
				});
			
			});
			it('should return a TypeError if key does not reference an array value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: 'general'};
				
				});
				config.addArrVal('themes', 'external', 'sawtooth', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('value for themes:external is not an array.');
					done();
				
				});
			
			});
			it('should return a TypeError if value cannot be parsed from JSON to an object', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				config.addArrVal('themes', 'external', 'sawtooth', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('new value for themes:external is not a JSON encoded object.');
					done();
				
				});
			
			});
			it('should return an Error to callback if arrayMembersToClass throws an error', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				var arrayMembersToClassStub = sinon.stub(config.utilities, 'arrayMembersToClass').callsFake(function throwError(arr, key, returnAsClass) {
				
					throw new Error('test arrayMembersToClass error');
				
				});
				config.addArrVal('themes', 'external', '{"name":"sawtooth","path":"themes/sawtooth"}', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test arrayMembersToClass error');
					expect(isSaved).to.deep.equal({name:'sawtooth', path: 'themes/sawtooth'});
					done();
				
				});
			
			});
			it('should return an Error to callback if nconf cannot set the value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return false;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.addArrVal('themes', 'external', '{"name":"sawtooth","path":"themes/sawtooth"}', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('unable to set value for themes:external.');
					expect(isSaved).to.equal(false);
					done();
				
				});
			
			});
			it('should return a Error to callback if nconf cannot save the change', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnError(dummy, callback) {
				
					return callback(new Error('test nconf.save error'));
				
				});
				config.addArrVal('themes', 'external', '{"name":"sawtooth","path":"themes/sawtooth"}', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.save error');
					done();
				
				});
			
			});
			it('should return a callback(false, true) if value was successfully added to array and saved', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return stubDefaults[cat];
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.addArrVal('themes', 'external', '{"name":"sawtooth","path":"themes/sawtooth"}', function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.true;
					done();
				
				});
			
			});
		
		});
		describe('removeArrIdx', function() {
		
			it('should be a function', function() {
			
				expect(config.removeArrIdx).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.removeArrIdx).to.throw(TypeError, 'invalid callback passed to setArrVal.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.removeArrIdx(null, 'external', 0, function(error, idxRemoved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to removeArrIdx.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if key argument is not a string', function(done) {
			
				config.removeArrIdx('themes', null, 0, function(error, idxRemoved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to removeArrIdx.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if index argument is not an integer', function(done) {
			
				config.removeArrIdx('themes', 'external', '0', function(error, idxRemoved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to removeArrIdx.');
					done();
				
				});
			
			});
			it('should return a RangeError if cat argument does not match an existing category', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return undefined;
				
				});
				config.removeArrIdx('themes', 'external', 0, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid cat passed to removeArrIdx.');
					done();
				
				});
			
			});
			it('should return a TypeError if key does not reference an array value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: 'general'};
				
				});
				config.removeArrIdx('themes', 'external', 0, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(TypeError);
					expect(error.message).to.equal('value for themes:external is not an array.');
					done();
				
				});
			
			});
			it('should return callback(false,false) if index value is undefined in setting array', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: []};
				
				});
				config.removeArrIdx('themes', 'external', 0, function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.false;
					done();
				
				});
			
			});
			it('should return an Error to callback if nconf cannot set the value', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnFalse(key, value) {
				
					return false;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.removeArrIdx('themes', 'external', 0, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('unable to set value for themes:external.');
					expect(isSaved).to.equal(false);
					done();
				
				});
			
			});
			it('should return a Error to callback if nconf cannot save the change', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnError(dummy, callback) {
				
					return callback(new Error('test nconf.save error'));
				
				});
				config.removeArrIdx('themes', 'external', 0, function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(Error);
					expect(error.message).to.equal('test nconf.save error');
					done();
				
				});
			
			});
			it('should return a callback(false, true) if value was successfully added to array and saved', function(done) {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat) {
				
					return {external: [{
						"name": "juniper",
						"path": "themes/juniper"
					}]};
				
				});
				var nconfSetStub = sinon.stub(config.nconf, 'set').callsFake(function returnTrue(key, value) {
				
					return true;
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnTrue(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.addArrVal('themes', 'external', '{"name":"sawtooth","path":"themes/sawtooth"}', function(error, isSaved) {
				
					expect(error).to.be.false;
					expect(isSaved).to.be.true;
					done();
				
				});
			
			});
		
		});
		describe('resetToDefault', function() {
		
			it('should be a function', function() {
			
				expect(config.resetToDefault).to.be.a('function');
			
			});
			it('should throw a TypeError if callback argument is not a function', function() {
			
				expect(config.resetToDefault).to.throw(TypeError, 'invalid callback passed to resetToDefault.');
			
			});
			it('should return a TypeError to callback if cat argument is not a string', function(done) {
			
				config.resetToDefault(null, 'external', function(error, isReset) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to resetToDefault.');
					done();
				
				});
			
			});
			it('should return a TypeError to callback if key argument is not a string', function(done) {
			
				config.resetToDefault('themes', null, function(error, isReset) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to resetToDefault.');
					done();
				
				});
			
			});
			it('should return callback(false, true) if cat does not exist', function(done) {
			
				var nconfGetStub = sinon.stub(config.nconf.stores.local, 'get').callsFake(function returnUndefined(cat) {
				
					return undefined;
				
				});
				config.resetToDefault('themes', 'external', function(error, isReset) {
				
					expect(error).to.equal(false);
					expect(isReset).to.equal(true);
					done();
				
				});
			
			});
			it('should return callback(false, true) if cat:key does not exist', function(done) {
			
				var nconfGetStub = sinon.stub(config.nconf.stores.local, 'get').callsFake(function returnUnset(cat) {
				
					return {
						useLocal: true,
						useExternal: false,
						showTheme: true,
						allowUserSwitch: false,
						defaultTheme: 'default'
					};
				
				});
				config.resetToDefault('themes', 'external', function(error, isReset) {
				
					expect(error).to.equal(false);
					expect(isReset).to.equal(true);
					done();
				
				});
			
			});
			it('should return callback(false, false) if changes cannot be saved', function(done) {
			
				var nconfGetStub = sinon.stub(config.nconf.stores.local, 'get').callsFake(function returnDefault(cat) {
				
					return testConfigDefaults()[cat];
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnFalse(dummy, callback) {
				
					return callback(false, false);
				
				});
				config.resetToDefault('themes', 'external', function(error, isReset) {
				
					expect(error).to.equal(false);
					expect(isReset).to.equal(false);
					done();
				
				});
			
			});
			it('should return callback(false, true) if changes are saved successfully', function(done) {
			
				var nconfGetStub = sinon.stub(config.nconf.stores.local, 'get').callsFake(function returnDefault(cat) {
				
					return testConfigDefaults()[cat];
				
				});
				var nconfSaveStub = sinon.stub(config.nconf, 'save').callsFake(function returnFalse(dummy, callback) {
				
					return callback(false, true);
				
				});
				config.resetToDefault('themes', 'external', function(error, isReset) {
				
					expect(error).to.equal(false);
					expect(isReset).to.equal(true);
					done();
				
				});
			
			});
			
		});
		describe('getConfigServerOrigin', function() {
		
			it('should be a function', function() {
			
				expect(config.getConfigServerOrigin).to.be.a('function');
			
			});
			it('should return defaults if nconf.get cannot retrieve saved value', function() {
			
				var testOrigin = 'http://localhost/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnUndefined(){
				
					return undefined;
				
				});
				var udOrigin = config.getConfigServerOrigin();
				expect(udOrigin).to.equal(testOrigin);
			
			});
			it('should force transport to "https" and port to "443" if config server:secure is true', function() {
			
				var testOrigin = 'https://localhost/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaultSecure(){
				
					var defaultOrigin = testConfigDefaults().server;
					defaultOrigin.secure = true;
					return defaultOrigin;
				
				});
				expect(config.getConfigServerOrigin()).to.equal(testOrigin);
			
			});
			it('should return a string without a port if transport is http and port is 80', function() {
			
				var testOrigin = 'http://localhost/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaultSecure(){
				
					var defaultOrigin = testConfigDefaults().server;
					return defaultOrigin;
				
				});
				expect(config.getConfigServerOrigin()).to.equal(testOrigin);
			
			});
			it('should return a string without a port if transport is https and port is 443', function() {
			
				var testOrigin = 'https://localhost/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaultSecure(){
				
					var defaultOrigin = testConfigDefaults().server;
					defaultOrigin.transport = 'https';
					defaultOrigin.port = '443';
					return defaultOrigin;
				
				});
				expect(config.getConfigServerOrigin()).to.equal(testOrigin);
			
			});
			it('should return a string with a port if transport is http and port is not 80', function() {
			
				var testOrigin = 'http://localhost:8080/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaultSecure(){
				
					var defaultOrigin = testConfigDefaults().server;
					defaultOrigin.transport = 'http';
					defaultOrigin.port = '8080';
					return defaultOrigin;
				
				});
				expect(config.getConfigServerOrigin()).to.equal(testOrigin);
			
			});
			it('should return a string with a port if transport is http and port is not 80', function() {
			
				var testOrigin = 'https://localhost:8080/';
				var nconfGetStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaultSecure(){
				
					var defaultOrigin = testConfigDefaults().server;
					defaultOrigin.transport = 'https';
					defaultOrigin.port = '8080';
					return defaultOrigin;
				
				});
				expect(config.getConfigServerOrigin()).to.equal(testOrigin);
			
			});
		
		});
	
	});
	describe('ExternalBinPath', function() {
	
		describe('constructor', function() {
		
			it('should not be available outside of UwotConfigBase methods', function() {
			
				function instantiate() {
				
					return new ExternalBinPath();
				
				};
				expect(instantiate).to.throw(ReferenceError, 'ExternalBinPath is not defined');
			
			});
		
		});
	
	});
	describe('ExternalTheme', function() {
	
		describe('constructor', function() {
		
			it('should not be available outside of UwotConfigBase methods', function() {
			
				function instantiate() {
				
					return new ExternalTheme();
				
				};
				expect(instantiate).to.throw(ReferenceError, 'ExternalTheme is not defined');
			
			});
		
		});
	
	});
	describe('ReverseProxyBin', function() {
	
		describe('constructor', function() {
		
			it('should not be available outside of UwotConfigBase methods', function() {
			
				function instantiate() {
				
					return new ReverseProxyBin();
				
				};
				expect(instantiate).to.throw(ReferenceError, 'ReverseProxyBin is not defined');
			
			});
		
		});
	
	});

});
