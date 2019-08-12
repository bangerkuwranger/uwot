const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binBasename;
const path = require('path');

describe('basename.js', function() {

	var req, res;
	before(function() {
	
		if('object' !== typeof global.Uwot || null === global.Uwot) {
		
			globalSetupHelper.initGlobalObjects();
		
		}
		if('object' !== typeof global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
		
			globalSetupHelper.initConstants();
		
		}
		if('object' !== typeof global.Uwot.Exports.Cmd || null === global.Uwot.Exports.Cmd) {
		
			globalSetupHelper.initExports();
		
		}
		binBasename = require('../routes/bin/basename');
	
	});
	beforeEach(function() {
	
		req = {};
		res = {
			json(obj) {
			
				var objJson = JSON.stringify(obj);
				return objJson;
			
			}
		};
	
	});
	it('should be an object that is an instance of UwotCmdBasename');
	it('should be an object that inherits from UwotCmd');
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand');
		it('should have a property "name" that has value "basename"');
		it('should have a property "description" that has value "Return filename portion of pathname."');
		it('should have a property "requiredArguments" that is an array with one value, "path"');
		it('should have a property "optionalArguments" that is an empty array');
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array');
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/basename"');
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false');
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function');
		it('should accept three arguments and pass them to the parent class constructor');
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		it('should be a function');
		it('should throw a TypeError if callback arg is not a function');
		it('should return a TypeError to callback function if args in not an array with a member at index 0 that is an object with a string value for property "text"');
		it('should return the result of path.basename called with the value of args[0].text.trim() to the callback function if args[0].text is a string');
	
	});
	describe('help(callback)', function() {
	
		it('should be a function');
		it('should return the result of calling the parent class method "help" with the passed value from callback arg');
	
	});

});
