const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const path = require('path');

describe('builtin.js', function() {

	var binBuiltin;
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
		if ('object' !== typeof global.Uwot.Bin.builtin || null === global.Uwot.Bin.builtin) {
		
			global.Uwot.Bin.builtin = binBuiltin;
		
		}
		if ('object' !== typeof global.Uwot.Bin.cd || null === global.Uwot.Bin.cd) {
		
			binBuiltin.loadBuiltins();
		
		}
	
	});
	describe('UwotCmdBuiltin', function() {
	
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
				binBuiltin.execute([], [], {}, {}, function(error, result) {
			
					expect(error).to.deep.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
			it('should return the result of help to callback function if args is a non-empty array, args[0] is not an object with a string value for its text property, and help does not return an error to callback', function(done) {
		
				var testResult = 'test help result';
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(false, testResult);
			
				});
				binBuiltin.execute([null], [], {}, {}, function(error, result) {
			
					expect(error).to.be.false;
					expect(result).to.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
			it('should return an error to callback function if args is a non-empty array, args[0] is not an object with a string value for its text property, and help returns an error to callback', function(done) {
		
				var testResult = new Error('test help error');
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(testResult);
			
				});
				binBuiltin.execute([{text: null}], [], {}, {}, function(error, result) {
			
					expect(error).to.deep.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
		
			it('should return an error to callback function if args is a non-empty array and args[0] is an object with a string value for its text property that does not match one of [cd, pwd, help, printf]', function(done) {
		
				binBuiltin.execute([{text: 'notAValidBuiltin'}], [], {}, {}, function(error, result) {
			
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid builtin');
					done();
			
				}, false, null);
		
			});
			it('should return the value of the result of calling a valid builtin cmd if the first element in args contains an object with a text property matching a valid builtin name and the call completes without error');
			it('should return an error if calling a valid builtin cmd returns an error and the first element in args contains an object with a text property matching a valid builtin name');
			it('should return the value of the result of calling a valid builtin cmd with additional args if the first element in args contains an object with a text property matching a valid builtin name and args contains additional valid arg nodes beyond the builtin name');
			it('should return the value of the result of calling a valid builtin cmd with additional args if the first element in args contains an object with a text property matching a valid builtin name and options contains valid option nodes');
	
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
	describe('UwotCmdCd', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdCd();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdCd is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.cd).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "cd"', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('name').that.equals('cd');
	
			});
			it('should have a property "description" that has value "Change working directory."', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('description').that.equals('Change working directory.');
	
			});
			it('should have a property "requiredArguments" that is an array with one value, "directory"', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('requiredArguments').that.is.an('array').that.contains('directory');
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.execute).to.be.a('function');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.help).to.be.a('function');
			
			});
		
		});
	
	});
	describe('UwotCmdPwd', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdPwd();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdPwd is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.pwd).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "pwd"', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('name').that.equals('pwd');
	
			});
			it('should have a property "description" that has value "Print working directory to console."', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('description').that.equals('Print working directory to console.');
	
			});
			it('should have a property "requiredArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('requiredArguments').that.is.an('array').that.is.empty;
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.execute).to.be.a('function');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.help).to.be.a('function');
			
			});
		
		});
	
	});
	describe('UwotCmdHelp', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdHelp();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdHelp is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.help).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "help"', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('name').that.equals('help');
	
			});
			it('should have a property "description" that has value "Display helpful information about builtin commands."', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('description').that.equals('Display helpful information about builtin commands.');
	
			});
			it('should have a property "requiredArguments" that is an array with one element, "pattern"', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('requiredArguments').that.is.an('array').that.contains('pattern');
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.execute).to.be.a('function');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.help).to.be.a('function');
			
			});
		
		});
	
	});
	describe('UwotCmdPrintf', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdPrintf();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdPrintf is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.printf).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "printf"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('name').that.equals('printf');
	
			});
			it('should have a property "description" that has value "Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process."', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('description').that.equals('Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process.');
	
			});
			it('should have a property "requiredArguments" that is an array with one element, "format"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('requiredArguments').that.is.an('array').that.contains('format');
	
			});
			it('should have a property "optionalArguments" that is an array with one element, "arguments"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('optionalArguments').that.is.an('array').that.contains('arguments');
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.execute).to.be.a('function');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.help).to.be.a('function');
			
			});
		
		});
	
	});

});
