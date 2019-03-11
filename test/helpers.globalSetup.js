var fs = require('fs');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
var filesystemLoader = require('../helpers/filesystemLoader');

var gsh = require('../helpers/globalSetup');

const expectedLocalThemes = [
	'beard',
	'bind',
	'borg',
	'bot',
	'cac',
	'clone',
	'clone_dark',
	'default'
];

const expectedLocalBins = [
	'builtin',
	'theme'
];

const getFileSystemsIds = function() {

	return ['cvaxgHlVg5o5iEYy'];

}

describe('globalSetup.js', function() {

	it('should create global.Uwot object and all properties as empty objects, if objects do not already exist, upon first require', function() {
	
		expect(global.Uwot).to.be.an('object').that.is.not.null;
		expect(global.Uwot).to.have.property('Constants').that.is.not.null;
		expect(global.Uwot).to.have.property('Config').that.is.not.null;
		expect(global.Uwot).to.have.property('Users').that.is.not.null;
		expect(global.Uwot).to.have.property('Exports').that.is.not.null;
		expect(global.Uwot).to.have.property('Themes').that.is.not.null;
		expect(global.Uwot).to.have.property('Bin').that.is.not.null;
		expect(global.Uwot).to.have.property('FileSystems').that.is.not.null;

	});
	describe('uninitialize()', function() {
	
		it('should be a function', function() {
		
			expect(gsh.uninitialize).to.be.a('function');
		
		});
		it('should remove the global.Uwot object and all its properties from the global object', function() {
		
			gsh.uninitialize();
			expect(global.Uwot).to.be.undefined;
		
		});
	
	});
	describe('initGlobalObjects()', function() {
	
		it('should be a function', function() {
		
			expect(gsh.initGlobalObjects).to.be.a('function');
		
		});
		it('should create global.Uwot object and all properties as empty objects, if objects do not already exist.', function() {
	
			gsh.uninitialize();
			gsh.initGlobalObjects();
			expect(global.Uwot).to.be.an('object').that.is.not.null;
			expect(global.Uwot).to.have.property('Constants').that.deep.equals({});
			expect(global.Uwot).to.have.property('Config').that.deep.equals({});
			expect(global.Uwot).to.have.property('Users').that.deep.equals({});
			expect(global.Uwot).to.have.property('Exports').that.deep.equals({});
			expect(global.Uwot).to.have.property('Themes').that.deep.equals({});
			expect(global.Uwot).to.have.property('Bin').that.deep.equals({});
	
		});
	
	});
	describe('initConstants()', function() {
	
		beforeEach(function() {
		
			global.Uwot.Constants = {};
			gsh.initConstants();
		
		});
		after(function() {
		
			global.Uwot.Constants = {};
			gsh.initConstants();
		
		});
		it('should be a function', function() {
		
			expect(gsh.initConstants).to.be.a('function');
		
		});
		it('should assign a string to global.Uwot.Constants.appRoot that is path to directory containing app.js', function() {
		
			expect(global.Uwot.Constants.appRoot).to.be.a('string');
		
		});
		it('should assign a function that returns either false or parsed JSON object given a string to global.Uwot.Constants.tryParseJSON', function() {
		
			expect(global.Uwot.Constants.tryParseJSON).to.be.a('function');
		
		});
		it('should assign an array of valid frontend operation names to global.Uwot.Constants.cliOps', function() {
		
			expect(global.Uwot.Constants.cliOps).to.be.an('array').that.is.not.empty;
		
		});
		it('should initialize array of reserved command names with contents of global.Uwot.Constants.cliOps and assign to global.Uwot.Constants.reserved', function() {
		
			expect(global.Uwot.Constants.reserved).to.be.an('array').that.deep.equals(global.Uwot.Constants.cliOps);
		
		});
		it('should assign a string to global.Uwot.Constants.version that includes the version number from package.json, and either "a" if prerelease alpha or "b" if prerelease beta', function() {
		
			expect(global.Uwot.Constants.version).to.be.a('string');
		
		});
		it('should assign a number to global.Uwot.Constants.sessionHours representing the login session lifetime in hours', function() {
		
			expect(global.Uwot.Constants.sessionHours).to.be.a('number');
		
		});
		it('should assign a string to global.Uwot.Constants.etcDev with the path to the dev config directory', function() {
		
			expect(global.Uwot.Constants.etcDev).to.be.a('string').that.includes('etc/dev');
		
		});
		it('should assign a string to global.Uwot.Constants.etcProd with the path to the production config directory', function() {
		
			expect(global.Uwot.Constants.etcProd).to.be.a('string').that.includes('etc/prod');
		
		});
		it('should return the initialized global.Uwot.Constants object', function() {
		
			var returnedConsts = gsh.initConstants();
			expect(returnedConsts).to.deep.equal(global.Uwot.Constants);
		
		});
	
	});
	describe('initEnvironment()', function() {
	
		var initialEnv;
		before(function() {
		
			initialEnv = global.process.env.NODE_ENV;
		
		});
		beforeEach(function() {
		
			global.Uwot.Config = {};
			global.Uwot.Users = {};
			gsh.initEnvironment();
		
		});
		after(function() {
		
			global.process.env.NODE_ENV = initialEnv;
			global.Uwot.Config = {};
			global.Uwot.Users = {};
			gsh.initEnvironment();
		
		});
		it('should be a function', function() {
		
			expect(gsh.initEnvironment).to.be.a('function');
		
		});
		it('should select a configPath based on global.process.env.NODE_ENV', function() {
		
			global.process.env.NODE_ENV = 'development';
			global.Uwot.Config = {};
			gsh.initEnvironment();
			expect(global.Uwot.Config.filePath).to.equal(path.resolve(global.Uwot.Constants.etcDev, 'config.json'));
			global.process.env.NODE_ENV = 'production';
			global.Uwot.Config = {};
			gsh.initEnvironment();
			expect(global.Uwot.Config.filePath).to.equal(path.resolve(global.Uwot.Constants.etcProd, 'config.json'));
			global.process.env.NODE_ENV = initialEnv;
		
		});
		it('should instantiate a UwotConfig instance and assign it to global.Uwot.Config', function() {
		
			expect(global.Uwot.Config.constructor.name).to.equal('UwotConfigBase');
		
		});
		it('should instantiate a UwotUsers instance and assign it to global.Uwot.Users', function() {
		
			expect(global.Uwot.Users.constructor.name).to.equal('UwotUsers');
		
		});
	
	});
	describe('initExports()', function() {
	
		before(function() {
		
			global.Uwot.Cmd = {};
			global.Uwot.Theme = {};
			gsh.initExports();
		
		});
		it('should be a function', function() {
		
			expect(gsh.initExports).to.be.a('function');
		
		});
		it('should assign the UwotCmd class function to global.Uwot.Exports.Cmd', function() {
		
			expect(global.Uwot.Exports.Cmd).to.be.a('function');
			expect(global.Uwot.Exports.Cmd.name).to.equal('UwotCmd');
		
		});
		it('should assign the UwotTheme class function to global.Uwot.Exports.Theme', function() {
		
			expect(global.Uwot.Exports.Theme).to.be.a('function');
			expect(global.Uwot.Exports.Theme.name).to.equal('UwotTheme');
		
		});
		it('should return the global.Uwot.Exports object', function() {
		
			global.Uwot.Cmd = {};
			global.Uwot.Theme = {};
			var testExports = gsh.initExports();
			expect(testExports).to.be.an('object');
			expect(testExports).to.have.own.property('Cmd').that.is.a('function');
			expect(testExports).to.have.own.property('Theme').that.is.a('function');
		
		});
	
	});
	describe('initThemes()', function() {
	
		before(function() {
		
			if ('object' !== typeof global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
			
				gsh.initConstants();
			
			}
			if ('object' !== typeof global.Uwot.Config || 'function' !== typeof global.Uwot.Config.get) {
			
				gsh.initEnvironment();
			
			}
		
		});
		it('should be a function', function() {
		
			expect(gsh.initThemes).to.be.a('function');
		
		});
		it('should return the global.Uwot.Themes object', function() {
		
			global.Uwot.Themes = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueLocalOnly(cat, key) {
			
				if (cat !== 'themes' || key !== 'useLocal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
			var testLocalThemes = gsh.initThemes();
			expect(testLocalThemes).to.be.an('object').that.deep.equals(global.Uwot.Themes);
			configGetStub.restore();
		
		});
		it('should run loadLocalPath() from themeLoader helper if config "themes:useLocal" is "true"', function() {
		
			global.Uwot.Themes = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueLocalOnly(cat, key) {
			
				if (cat !== 'themes' || key !== 'useLocal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
			var testLocalThemes = gsh.initThemes();
			expect(testLocalThemes).to.be.an('object').that.is.not.null;
			expect(Object.keys(testLocalThemes)).to.include(...expectedLocalThemes);
			configGetStub.restore();
		
		});
		it('should run loadExternalPath() from themeLoader helper if config "themes:useExternal" is "true"', function() {
		
			global.Uwot.Themes = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueExternalOnly(cat, key) {
			
				if (cat !== 'themes' || key !== 'useExternal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
// 			var testLocalThemes = gsh.initThemes();
// 			expect(testLocalThemes).to.be.an('object').that.is.not.null;
// 			expect(Object.keys(testLocalThemes)).to.include(...expectedLocalThemes);

			// method loadExternalPath() not implemented yet
			expect(gsh.initThemes).to.throw(Error, 'this function is not yet implemented');

			configGetStub.restore();
		
		});
	
	});
	describe('initBins()', function() {
	
		before(function() {
		
			if ('object' !== typeof global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
			
				gsh.initConstants();
			
			}
			if ('object' !== typeof global.Uwot.Config || 'function' !== typeof global.Uwot.Config.get) {
			
				gsh.initEnvironment();
			
			}
		
		});
		it('should be a function', function() {
		
			expect(gsh.initBins).to.be.a('function');
		
		});
		it('should add keys from global.Uwot.Bin to the global.Uwot.Constants.reserved array', function() {
		
			global.Uwot.Bin = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueLocalOnly(cat, key) {
			
				if (cat !== 'binpath' || key !== 'useLocal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
			var testLocalBins = gsh.initBins();
			expect(global.Uwot.Constants.reserved).to.be.an('array').that.includes(...expectedLocalBins);
			configGetStub.restore();
		
		});
		it('should return the global.Uwot.Bin object', function() {
		
			global.Uwot.Bin = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueLocalOnly(cat, key) {
			
				if (cat !== 'binpath' || key !== 'useLocal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
			var testLocalBins = gsh.initBins();
			expect(testLocalBins).to.be.an('object').that.deep.equals(global.Uwot.Bin);
			configGetStub.restore();
		
		});
		it('should run loadLocalPath() from binLoader helper if config "binpath:useLocal" is "true"', function() {
		
			global.Uwot.Bin = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueLocalOnly(cat, key) {
			
				if (cat !== 'binpath' || key !== 'useLocal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
			var testLocalBins = gsh.initBins();
			expect(testLocalBins).to.be.an('object').that.is.not.null;
			expect(Object.keys(testLocalBins)).to.include(...expectedLocalBins);
			configGetStub.restore();
		
		});
		it('should run loadExternalPath() from binLoader helper if config "binpath:useExternal" is "true"', function() {
		
			global.Uwot.Bin = {};
			var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnTrueExternalOnly(cat, key) {
			
				if (cat !== 'binpath' || key !== 'useExternal') {
				
					return false;
				
				}
				else {
				
					return true;
				
				}
			
			});
// 			var testLocalBins = gsh.initBins();
// 			expect(testLocalBins).to.be.an('object').that.is.not.null;
// 			expect(Object.keys(testLocalBins)).to.include(...expectedExternalThemes);

			// method loadExternalPath() not implemented yet
			expect(gsh.initBins).to.throw(Error, 'this function is not yet implemented');

			configGetStub.restore();
		
		});
	
	});
	describe('initFileSystems(sessionStore, callback)', function() {
	
		before(function() {
		
			// if ('object' !== typeof global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
// 			
// 				gsh.initConstants();
// 			
// 			}
// 			if ('object' !== typeof global.Uwot.Config || 'function' !== typeof global.Uwot.Config.get) {
// 			
// 				gsh.initEnvironment();
// 			
// 			}
		
		});
		it('should be a function', function() {
		
			expect(gsh.initFileSystems).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			expect(gsh.initFileSystems).to.throw(TypeError, 'invalid callback passed to initFileSystems');
		
		});
		it('should return an object to the second callback arg that includes a GUEST property that is false if filesystemLoader.loadGuest returns an error', function(done) {
		
			var loadGuestStub = sinon.stub(filesystemLoader, 'loadGuest').returns(new Error('test loadGuest Error'));
			var loadActiveSessionFilesystemsStub = sinon.stub(filesystemLoader, 'loadActiveSessionFilesystems').callsFake(function returnIdsToCallback(sessionStore, cb) {
			
				return cb(false, getFileSystemsIds());
			
			});
			gsh.initFileSystems(null, function(error, savedFsObj) {
			
				expect(savedFsObj).to.be.an('object').with.property('GUEST').that.is.false;
				loadGuestStub.restore();
				loadActiveSessionFilesystemsStub.restore();
				done();
			
			});
		
		});
		it('should return the error returned by filesystemLoader.loadGuest as the first callback arg if it returns an error and loadActiveSessionFilesystems does not', function(done) {
		
			var loadGuestStub = sinon.stub(filesystemLoader, 'loadGuest').returns(new Error('test loadGuest error'));
			var loadActiveSessionFilesystemsStub = sinon.stub(filesystemLoader, 'loadActiveSessionFilesystems').callsFake(function returnIdsToCallback(sessionStore, cb) {
			
				return cb(false, getFileSystemsIds());
			
			});
			gsh.initFileSystems(null, function(error, savedFsObj) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test loadGuest error');
				loadGuestStub.restore();
				loadActiveSessionFilesystemsStub.restore();
				done();
			
			});
		
		});
		it('should return an object to the second callback arg that includes a GUEST property that is true if  filesystemLoader.loadGuest executes without error', function(done) {
		
			var loadGuestStub = sinon.stub(filesystemLoader, 'loadGuest').returns(true);
			var loadActiveSessionFilesystemsStub = sinon.stub(filesystemLoader, 'loadActiveSessionFilesystems').callsFake(function returnIdsToCallback(sessionStore, cb) {
			
				return cb(false, getFileSystemsIds());
			
			});
			gsh.initFileSystems(null, function(error, savedFsObj) {
			
				expect(error).to.be.false;
				expect(savedFsObj).to.be.an('object').with.property('GUEST').that.is.true;
				loadGuestStub.restore();
				loadActiveSessionFilesystemsStub.restore();
				done();
			
			});
		
		});
		it('should return the error returned by filesystemLoader.loadActiveSessionFilesystems as the first callback arg if it returns an error', function(done) {
		
			var loadGuestStub = sinon.stub(filesystemLoader, 'loadGuest').returns(true);
			var loadActiveSessionFilesystemsStub = sinon.stub(filesystemLoader, 'loadActiveSessionFilesystems').callsFake(function returnIdsToCallback(sessionStore, cb) {
			
				return cb(new Error('test loadActiveSessionFilesystem error'), getFileSystemsIds());
			
			});
			gsh.initFileSystems(null, function(error, savedFsObj) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test loadActiveSessionFilesystem error');
				expect(savedFsObj).to.be.an('object').with.property('GUEST').that.is.true;
				loadGuestStub.restore();
				loadActiveSessionFilesystemsStub.restore();
				done();
			
			});
		
		});
		it('should should return an object to the second callback arg that includes properties matching the user ids from any active sessions that were successfully loaded, and these properties should have value === true', function(done) {
		
			var testUserIdArray = getFileSystemsIds();
			var loadGuestStub = sinon.stub(filesystemLoader, 'loadGuest').returns(true);
			var loadActiveSessionFilesystemsStub = sinon.stub(filesystemLoader, 'loadActiveSessionFilesystems').callsFake(function returnIdsToCallback(sessionStore, cb) {
			
				return cb(new Error('test loadActiveSessionFilesystem error'), getFileSystemsIds());
			
			});
			gsh.initFileSystems(null, function(error, savedFsObj) {
			
				expect(savedFsObj).to.be.an('object').with.property(testUserIdArray[0]).that.is.true;
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test loadActiveSessionFilesystem error');
				loadGuestStub.restore();
				loadActiveSessionFilesystemsStub.restore();
				done();
			
			});
		
		})
	
	});

});
