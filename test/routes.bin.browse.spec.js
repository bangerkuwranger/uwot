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
			describe('cmdPath', function() {
		
				it('should have a value that is an absolute path to listener bin cmd router', function() {
			
					expect(binBrowse.listenerSettings.options).to.have.property('cmdPath').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/browse.js');
			
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
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
				binBrowse.execute(null, [], {}, {}, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
					binBrowse.execute([], [], {}, {}, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
						binBrowse.execute(['args'], [], {}, {}, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
							binBrowse.execute([null], [], {}, {}, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
								binBrowse.execute([{text: null}], [], {}, {}, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/execute');
									done();
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should return a TypeError to callback if isid arg value is not a string');
		it('should return a TypeError to callback if user arg value is not a non-null object with an _id property that is a string');
		it('should return an Error to callback if global.Uwot.FileSystems[user._id] is not a non-null object');
		// it('should return false to the callback function if args[0].text is a string', function(done) {
// 		
// 			var testName = 'ten';
// 			var testArg = '/goto/' + testName;
// 			binBrowse.execute([{text: testArg}], [], {}, {}, function(error, result) {
// 
// 				expect(result).to.be.false;
// 				expect(error).to.be.false;
// 				done();
// 
// 			}, false, null);
// 		
// 		});
		it('should return an Error to callback if this.getPathContent throws an Error');
		it('should return an Error to callback if this.getPathContent returns an Error to its callback');
		it('should return an unfilled executeResult object with "no content found" content if this.getPathContent does not return a non-empty string');
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener throws an Error');
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener returns an Error');
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener does not return "enabled"');
		it('should return a filled executeResult object, with output.content from the result of getPathContent and browse process cookies, to callback if this.getPathContent returns a non-empty string and super.enableListener returns "enabled"');
	
	});
	describe('handler(bin, args, options, app, user, callback, isSudo, isid)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.handler).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function');
		it('should return a TypeError to callback if bin arg value is not a string matching an element of this.cmdSet');
		it('should return a TypeError to callback if bin arg value is "quit" and isid arg value is not a non-empty string');
		it('should return the result of this.quit to callback if bin arg value is "quit" and isid arg value is a non-empty string');
		it('should return a TypeError to callback if bin arg value matches a member of this.cmdSet that is not "quit" and args is not a non-empty Array');
		it('should use values of isSudo and user args as properties of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo" and args is a non-empty Array');
		it('should pass the sanitized value of the first member of args as the "path" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[0] is a string');
		it('should pass the sanitized value of the second member of args as the "isGui" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[1] is a string');
		it('should pass the sanitized value of the third member of args as the "msg" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[2] is a string');
		it('should return the result of this.go called with the processed args to callback if bin arg value is "go" and args is a non-empty Array');
		it('should return the result of this.nogo called with the processed args to callback if bin arg value is "nogo" and args is a non-empty Array');
	
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
	describe('outputBrowse(obj)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.outputBrowse).to.be.a('function');
		
		});
		it('should return the result of output/ansi export function called on obj arg');
	
	});
	describe('quit(isid, callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.quit).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function');
		it('should return a TypeError to callback if isid is not a non-empty string');
		it('should return an Error if call to super.disableListener(isid) throws an Error');
		it('should return an Error if call to super.disableListener(isid) returns an Error');
		it('should return an Error if call to super.disableListener(isid) does not return "disabled"');
		it('should return the string "thanks for browsing!" if super.disableListener(isid) returns "disabled"');
	
	});
	describe('go(args, callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.go).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function');
		it('should return a TypeError to callback if args is not a non-null object');
		it('should return a TypeError to callback if args.path is not a non-empty string');
		it('should return an object with properties output, outputType, cookies, and additional');
		it('should set return object property output to an object with content property that is an array containing an object with classes property that is an array containing "browseOutput"');
		it('should set return object property outputType to "object"');
		it('should set return object property cookies to an object with properties uwotBrowseCurrentPath, uwotBrowseCurrentType, and uwotBrowseCurrentStatus');
		it('should set return object property additional to an object with property browseOpts that has property loadContent with value true');
		it('should set return object property additional.browseOpts.msg to the value of args.msg if args.msg is a non-empty string');
		it('should set the return object property output.content[0].content to the error message if this.getPathContent throws an error');
		it('should set the return object property output.content[0].content to the error message if this.getPathContent returns an error');
		it('should set the return object property output.content[0].content to "no content found" if this.getPathContent does not return a non-empty string after completing without error');
		it('should set the return object property output.content[0].content to the result of this.getPathContent if it returns a non-empty string after completing without error');
	
	});
	describe('nogo(args, callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.nogo).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function');
		it('should return a TypeError to callback if args is not a non-null object');
		it('should return an object with properties outputType, cookies, and additional');
		it('should set return object property outputType to "object"');
		it('should set return object property cookies to an object with properties uwotBrowseCurrentPath, uwotBrowseCurrentType, and uwotBrowseCurrentStatus');
		it('should set return object property additional to an object with property browseOpts that has property loadContent with value false');
		it('should set return object property additional.browseOpts.msg to the value of args.msg if args.msg is a non-empty string');
	
	});
	describe('getPathContent(pth, args, callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.getPathContent).to.be.a('function');
		
		});
		it('should return a TypeError if callback is not a function');
		it('should return a TypeError to callback if pth is not a non-empty string');
		it('should return a TypeError to callback if args is not a non-null object');
		it('should set args.isLocal to the result of validUrl.isUri(pth) if args.isLocal is not a boolean value');
		it('should set args.isSudo to false if args.isSudo is any value other than true');
		it('should return a TypeError to callback if args.isLocal is true and there is no valid filesystem loaded to global for user');
		it('should return the result of consoleHtml helper method loadForConsole called with resolved result of user filesystem method pFile if args.isLocal is true and pFile call does not reject');
		it('should return an html error string to second arg of callback if args.isLocal is true and user filesystem method pFile call rejects with a SystemError');
		it('should return an error to the first argument of callback if args.isLocal is true and user filesystem method pFile call rejects with a non SystemError Error');
		it('should return the result of consoleHtml helper method loadForConsole called with resolved result of consoleHtml helper method getRemoteResources(pth) if args.isLocal is false and getRemoteResources call does not reject');
		it('should return an html error string to second arg of callback if args.isLocal is false and consoleHtml helper method getRemoteResources(pth) call rejects with a SystemError');
		it('should return an error to the first argument of callback if args.isLocal is false and consoleHtml helper method getRemoteResources(pth) call rejects with a non SystemError Error');
	
	});

});
