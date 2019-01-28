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
const testConfigDefaults = {
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

describe('config.js', function() {

	describe('UwotConfigBase', function() {
	
		beforeEach(function() {
		
			config = new Config(
				testConfigPathDev
			);
		
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
					
						return testConfigDefaults[key];
					
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
					
						return testConfigDefaults[key];
					
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
					
						return testConfigDefaults[key];
					
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
					
						return testConfigDefaults[key];
					
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
					
						return testConfigDefaults[key];
					
					}
					
				});
				expect(config.get('testConfCat', 'val6')).to.be.false;
				expect(config.get('testConfCat', 'val7')).to.be.false;
			
			});
			it('should return an object with all config values for category, including array values, if cat is a string, key is not a string, and excludeArrays is undefined', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(key) {
				
					return testConfigDefaults[key];
				
				});
				expect(config.get('themes', null)).to.deep.equal(testConfigDefaults['themes']);
			
			});
			it('should return an object with all config values for category, including array values, if cat is a string, key is not a string, and excludeArrays is false', function() {
			
				var getCatStub = sinon.stub(config.nconf, 'get').callsFake(function returnDefaults(key) {
				
					return testConfigDefaults[key];
				
				});
				expect(config.get('themes', null, false)).to.deep.equal(testConfigDefaults['themes']);
			
			});
		
		});
		describe('getCats', function() {
		
			it('should be a function');
			it('should return an array of all of the config category names');
		
		});
		describe('updateCatStrVals', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if values argument is not a Map object');
		
		});
		describe('setStrVal', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback argument is not a function');
			it('should return a TypeError to callback if cat argument is not a string');
			it('should return a TypeError to callback if key argument is not a string');
			it('should return a TypeError to callback if value argument is not a string');
		
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
