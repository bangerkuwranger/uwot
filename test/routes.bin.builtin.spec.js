const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binBuiltin;
const path = require('path');

describe('builtin.js', function() {

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
		binBuiltin = require('../routes/bin/builtin');
	
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
	it('should be an object that is an instance of UwotCmdBuiltin', function() {
	
		expect(binBuiltin).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdBuiltin');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binBuiltin).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binBuiltin).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "builtin"', function() {
	
			expect(binBuiltin.command).to.have.property('name').that.equals('builtin');
	
		});
		it('should have a property "description" that has value "Return filename portion of pathname."', function() {
	
			expect(binBuiltin.command).to.have.property('description').that.equals('Run builtin commands in the running uwot process. This differs from ACTUAL shells in that most logical, memory, user, and process management builtins are implemented elsewhere (e.g. login/logout) or not implemented at all.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "shell-builtin"', function() {
	
			expect(binBuiltin.command).to.have.property('requiredArguments').that.is.an('array').that.contains('shell-builtin');
	
		});
		it('should have a property "optionalArguments" that is an array with one value, "shell-builtin-args"', function() {
	
			expect(binBuiltin.command).to.have.property('optionalArguments').that.is.an('array').that.contains('shell-builtin-args');
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array', function() {
	
			expect(binBuiltin).to.have.property('options').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
			expect(binBuiltin).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binBuiltin).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binBuiltin.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binBuiltin.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
		it('should set global.Uwot.Bin.cd to an instance of UwotCmdCd');
		it('should set global.Uwot.Bin.pwd to an instance of UwotCmdPwd');
		it('should set global.Uwot.Bin.help to an instance of UwotCmdHelp');
		it('should set global.Uwot.Bin.printf to an instance of UwotCmdPrintf');
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		afterEach(function() {
		
			sinon.restore;
		
		});
		it('should be a function', function() {
		
			expect(binBuiltin.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binBuiltin.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/builtin/execute');
		
		});
		it('should return the result of help to callback function if args is not a non-empty array and help does not return an error to callback', function(done) {
		
			var testResult = 'test help result';
			var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
				return cb(false, testResult);
			
			});
			binBuiltin.execute(null, [], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.equal(testResult);
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return an error to callback function if args is not a non-empty array and help returns an error to callback', function(done) {
		
			var testResult = new Error('test help error');
			var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
				return cb(testResult);
			
			});
			binBuiltin.execute(null, [], {}, {}, function(error, result) {
			
				expect(error).to.deep.equal(testResult);
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
	
	});
	describe('help(callback)', function() {
	
		afterEach(function() {
		
			sinon.restore;
		
		});
		it('should be a function', function() {
		
			expect(binBuiltin.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binBuiltin.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
		
	
	});

});
