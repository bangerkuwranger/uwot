const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binDirname;
const path = require('path');

describe('dirname.js', function() {

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
		binDirname = require('../routes/bin/dirname');
	
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
	it('should be an object that is an instance of UwotCmdDirname', function() {
	
		expect(binDirname).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdDirname');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binDirname).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binDirname).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "dirname"', function() {
	
			expect(binDirname.command).to.have.property('name').that.equals('dirname');
	
		});
		it('should have a property "description" that has value "Return filename portion of pathname."', function() {
	
			expect(binDirname.command).to.have.property('description').that.equals('Return filename portion of pathname.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "path"', function() {
	
			expect(binDirname.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binDirname.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array', function() {
	
			expect(binDirname).to.have.property('options').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/dirname"', function() {
	
			expect(binDirname).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/dirname');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binDirname).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binDirname.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binDirname.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		it('should be a function', function() {
		
			expect(binDirname.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binDirname.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/dirname/execute');
		
		});
		it('should return a TypeError to callback function if args in not an array with a member at index 0 that is an object with a string value for property "text"', function(done) {
		
			binDirname.execute('args', [], {}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
				binDirname.execute(null, [], {}, {}, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
					binDirname.execute([], [], {}, {}, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
						binDirname.execute(['args'], [], {}, {}, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
							binDirname.execute([null], [], {}, {}, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
								binDirname.execute([{text: null}], [], {}, {}, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to dirname');
									done();
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should return the result of path.dirname called with the value of args[0].text.trim() to the callback function if args[0].text is a string', function(done) {
		
			var testName = 'ten';
			var testArg = '/goto/' + testName;
			binDirname.execute([{text: testArg}], [], {}, {}, function(error, result) {

				expect(result).to.equal(testName);
				expect(error).to.be.false;
				done();

			}, false, null);
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binDirname.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binDirname.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
