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
				expect(config.utilities).to.have.own.property('mergeMaps').that.is.a('function');
				expect(config.utilities).to.have.own.property('isArrayKey').that.is.a('function');
				expect(config.utilities).to.have.own.property('arrayMembersToClass').that.is.a('function');
			
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
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(cat, key, arrays) {
				
					return undefined;
				
				});
				config.setStrVal('users', 'allowGuest', 'true', function(error, isSaved) {
				
					expect(error).to.be.an.instanceof(RangeError);
					expect(error.message).to.equal('invalid cat passed to setArrVal.');
					done();
				
				});
			
			})
		
		});
		describe('setArrVal', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if key argument is not a string');
			it('should return a TypeError to callback if value argument is not an Array');
		
		});
		describe('addArrVal', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if key argument is not a string');
			it('should return a TypeError to callback if value argument is not a string');
		
		});
		describe('removeArrIdx', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if key argument is not a string');
			it('should return a TypeError to callback if index argument is not parseable to an integer');
		
		});
		describe('resetToDefault', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if key argument is not a string');
			
		});
		describe('getConfigServerOrigin', function() {
		
			it('should be a function');
		
		});
	
	});
	describe('ExternalBinPath', function() {
	
		describe('constructor', function() {
		
		
		
		});
	
	});
	describe('ExternalTheme', function() {
	
		describe('constructor', function() {
		
		
		
		});
	
	});
	describe('ReverseProxyBin', function() {
	
		describe('constructor', function() {
		
		
		
		});
	
	});

});
