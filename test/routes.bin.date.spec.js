const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binDate;
const path = require('path');

describe('date.js', function() {

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
		binDate = require('../routes/bin/date');
	
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
	it('should be an object that is an instance of UwotCmdDate', function() {
	
		expect(binDate).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdDate');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binDate).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binDate).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "date"', function() {
	
			expect(binDate.command).to.have.property('name').that.equals('date');
	
		});
		it('should have a property "description" that has value "Return current date and time."', function() {
	
			expect(binDate.command).to.have.property('description').that.equals('Return current date and time.');
	
		});
		it('should have a property "requiredArguments" that is an empty array', function() {
	
			expect(binDate.command).to.have.property('requiredArguments').that.is.an('array').that.is.empty;
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binDate.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array', function() {
	
			expect(binDate).to.have.property('options').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/date"', function() {
	
			expect(binDate).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/date');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binDate).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binDate.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binDate.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		it('should be a function', function() {
		
			expect(binDate.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binDate.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/date/execute');
		
		});
		it('should return the result of new Date().toString to the second arg of the callback function', function(done) {
		
			binDate.execute([], [], {}, {}, function(error, result) {

				expect(result).to.equal(new Date().toString());
				expect(error).to.be.false;
				done();

			}, false, null);
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binDate.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binDate.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
