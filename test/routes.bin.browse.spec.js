const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binBrowse;
const path = require('path');

describe('browse.js', function() {

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
		binBrowse = require('../routes/bin/browse');
	
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
	it('should be an object that is an instance of UwotCmdBrowse', function() {
	
		expect(binBrowse).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdBrowse');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binBrowse).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binBrowse).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "browse"', function() {
	
			expect(binBrowse.command).to.have.property('name').that.equals('browse');
	
		});
		it('should have a property "description" that has value "Return filename portion of pathname."', function() {
	
			expect(binBrowse.command).to.have.property('description').that.equals('Open selected html file in internal browsing environment');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "path"', function() {
	
			expect(binBrowse.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binBrowse.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array', function() {
	
			expect(binBrowse).to.have.property('options').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/browse"', function() {
	
			expect(binBrowse).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/browse');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		
		it('should have a value that is an object', function() {
	
			expect(binBrowse).to.have.property('listenerSettings').that.is.an('object');
			console.log(binBrowse.listenerSettings);
	
		});
		describe('name', function() {
		
			it('should have a value that equals "browse"', function() {
		
				expect(binBrowse.listenerSettings).to.have.property('name').that.equals('browse');
		
			});
		
		});
		describe('options', function() {
		
			it('should have a value that is an object', function() {
			
				expect(binBrowse.listenerSettings).to.have.property('options').that.is.an('object');
			
			});
			describe('type', function() {
		
				it('should have a value that equals "exclusive"', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('type').that.equals('exclusive');
			
				});
		
			});
			describe('output', function() {
		
				it('should have a value that equals "internal"', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('output').that.equals('internal');
			
				});
		
			});
			describe('outputPath', function() {
		
				it('should have a value that equals "outputBrowse"', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('outputPath').that.equals('outputBrowse');
			
				});
		
			});
			describe('routerPath', function() {
		
				it('should have a value that is an absolute path to listener router', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('routerPath').that.equals(global.Uwot.Constants.appRoot + '/routes/listeners.js');
			
				});
		
			});
			describe('routeUriPath', function() {
		
				it('should have a value that equals "/listeners"', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('routeUriPath').that.equals('/listeners');
			
				});
		
			});
			describe('cmdSet', function() {
		
				it('should have a value is an array', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('cmdSet').that.is.an('array');
			
				});
		
			});

		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binBrowse.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binBrowse.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/execute');
		
		});
		it('should return a TypeError to callback function if args in not an array with a member at index 0 that is an object with a string value for property "text"', function(done) {
		
			binBrowse.execute('args', [], {}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
				binBrowse.execute(null, [], {}, {}, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
					binBrowse.execute([], [], {}, {}, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
						binBrowse.execute(['args'], [], {}, {}, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
							binBrowse.execute([null], [], {}, {}, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
								binBrowse.execute([{text: null}], [], {}, {}, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to browse');
									done();
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should return false to the callback function if args[0].text is a string', function(done) {
		
			var testName = 'ten';
			var testArg = '/goto/' + testName;
			binBrowse.execute([{text: testArg}], [], {}, {}, function(error, result) {

				expect(result).to.be.false;
				expect(error).to.be.false;
				done();

			}, false, null);
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binBrowse.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
