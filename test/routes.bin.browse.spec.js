const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binBrowse;
const path = require('path');
const ansi = require('../output/ansi');
const sanitize = require('../helpers/valueConversion');

const getTestUser = function() {

	return {
		"fName": "Found",
		"lName": "User",
		"uName": "fuser",
		"password": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI.Ai1mX96Xc7efm",
		"sudoer": true,
		"salt": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI",
		"createdAt": new Date(1546450800498),
		"updatedAt": new Date(1546450800498),
		"_id": "CDeOOrH0gOg791cZ",
		"maySudo": function() { return this.sudoer; }
	};

};

const createTestUserFS = function(uid) {

	if ('string' !== typeof uid) {
	
		uid = getTestUser()._id;
	
	}
	if ('object' !== typeof global.Uwot.FileSystems || null === global.Uwot.FileSystems) {
	
		global.Uwot.FileSystems = {};
	
	}
	if ('object' !== typeof global.Uwot.FileSystems[uid] || null === global.Uwot.FileSystems[uid]) {
	
		global.Uwot.FileSystems[uid] = {
			cmd: function(op, args, cb) {
	
				return cb(false, op + '(' + args.join() + ')');
	
			},
			pFile: function(op, args, isSudo) {
	
				return Promise.resolve(op + '(' + args.join(', ') + ')');
	
			},
			getVcwd: function() {
			
				return "/home/" + getTestUser().uName;
			
			}
		};
	
	}

}

const removeTestUserFS = function(uid) {

	if ('string' !== typeof uid) {
	
		uid = getTestUser()._id;
	
	}
	if ('object' === typeof global.Uwot.FileSystems && null !== global.Uwot.FileSystems && 'object' === typeof global.Uwot.FileSystems[uid] && null !== global.Uwot.FileSystems[uid]) {
	
		delete global.Uwot.FileSystems[uid];
	
	}

};

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
	
		var testUser;
		beforeEach(function() {
		
			testUser = getTestUser();
			createTestUserFS(testUser._id);
		
		});
		afterEach(function() {
		
			sinon.restore();
		
		});
		after(function() {
		
			removeTestUserFS();
		
		});
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
		it('should return a TypeError to callback if isid arg value is not a string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.execute([{text: testPath}], [], {}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid isid passed to bin/browse/execute');
				done();
			
			}, false, null);
		
		});
		it('should return a TypeError to callback if user arg value is not a non-null object with an _id property that is a string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.execute([{text: testPath}], [], {}, 'fuser', function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user passed to bin/browse/execute');
				binBrowse.execute([{text: testPath}], [], {}, null, function(error, result) {
			
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user passed to bin/browse/execute');
					binBrowse.execute([{text: testPath}], [], {}, {uName: 'fuser'}, function(error, result) {
			
						expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user passed to bin/browse/execute');
						done();
			
					}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
				}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an Error to callback if global.Uwot.FileSystems[user._id] is not a non-null object', function(done) {
		
			var testPath = '/var/www/html/example.html';
			delete global.Uwot.FileSystems[testUser._id];
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(error, result) {
	
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
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
		it('should return an Error to callback if this.getPathContent throws an Error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').throws(new Error('test getPathContent error'));
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(error, result) {
	
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test getPathContent error');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an Error to callback if this.getPathContent returns an Error to its callback', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnErrorToCb(pth, args, cb) {
			
				return cb(new Error('test getPathContent error'));
			
			});
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.an.instanceof(Error).with.property('message').that.equals('test getPathContent error');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an unfilled executeResult object with "no content found" content if this.getPathContent does not return a non-empty string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '');
			
			});
			var testResult = {
				output: {
					content: [{content: 'no content found', classes: ['browseOutput']}]
				},
				outputType: 'object'
			};
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.false;
				expect(result).to.deep.equal(testResult);
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener throws an Error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '<html><body><h1>Test Content</h1></body></html>');
			
			});
			var enableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'enableListener').throws(new Error('test enableListener error'));
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.an.instanceof(Error).with.property('message').that.equals('test enableListener error');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener returns an Error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '<html><body><h1>Test Content</h1></body></html>');
			
			});
			var enableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'enableListener').returns(new Error('test enableListener error'));
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.an.instanceof(Error).with.property('message').that.equals('test enableListener error');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return an Error to callback if this.getPathContent returns a non-empty string and super.enableListener does not return "enabled"', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '<html><body><h1>Test Content</h1></body></html>');
			
			});
			var enableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'enableListener').returns('disabled');
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.an.instanceof(Error).with.property('message').that.equals('could not enable listener for bin/browse');
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return a filled executeResult object, with output.content from the result of getPathContent and browse process cookies, to callback if this.getPathContent returns a non-empty string and super.enableListener returns "enabled"', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '<html><body><h1>Test Content</h1></body></html>');
			
			});
			var testResult = {
				output: {
					content: [
						{
							content: "<html><body><h1>Test Content</h1></body></html>",
							classes: [
								"browseOutput"
							]
						}
					]
				},
				outputType: "object",
				cookies: {
					uwotBrowseCurrentPath: {
						value: "/var/www/html/example.html"
					},
					uwotBrowseCurrentType: {
						value:"cli"
					},
					uwotBrowseCurrentStatus: {
						value: "active"
					}
				}
			};
			var enableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'enableListener').returns('enabled');
			binBrowse.execute([{text: testPath}], [], {}, testUser, function(e, result) {
	
				expect(e).to.be.false;
				expect(result).to.deep.equal(testResult);
				done();
	
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
	
	});
	describe('handler(bin, args, options, app, user, callback, isSudo, isid)', function() {
	
		var testUser;
		beforeEach(function() {
		
			testUser = getTestUser();
			createTestUserFS(testUser._id);
		
		});
		afterEach(function() {
		
			sinon.restore();
		
		});
		after(function() {
		
			removeTestUserFS();
		
		});
		it('should be a function', function() {
		
			expect(binBrowse.handler).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			function throwError() {
			
				return binBrowse.handler();
			
			}
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/handler');
		
		});
		it('should return a TypeError to callback if bin arg value is not a string matching an element of this.cmdSet', function(done) {
		
			binBrowse.handler('headstand', [], [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid cmd passed to bin/browse/handler');
				done();
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return a TypeError to callback if bin arg value is "quit" and isid arg value is not a non-empty string', function(done) {
		
			binBrowse.handler('quit', [], [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid isid passed to bin/browse/handler');
				done();
			
			}, false, '');
		
		});
		it('should return the result of this.quit to callback if bin arg value is "quit" and isid arg value is a non-empty string', function(done) {
		
			var quitStub = sinon.stub(binBrowse, 'quit').callsFake(function returnStrToCb(isid, cb) {
			
				return cb(false, 'test quit output');
			
			});
			binBrowse.handler('quit', [], [], {}, testUser, function(error, result) {
			
				expect(result).to.equal('test quit output');
				done();
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return a TypeError to callback if bin arg value matches a member of this.cmdSet that is not "quit" and args is not a non-empty Array', function(done) {
		
			binBrowse.handler('go', [], [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to bin/browse/handler');
				done();
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should use values of isSudo and user args as properties of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo" and args is a non-empty Array', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var goStub = sinon.stub(binBrowse, 'go').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test go output');
			
			});
			var nogoStub = sinon.stub(binBrowse, 'nogo').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test nogo output');
			
			});
			var goArgs, nogoArgs;
			binBrowse.handler('go', [{text: testPath}, {text: 'false'}], [], {}, testUser, function(error, result) {
			
				goArgs = goStub.getCall(0).args;
				expect(goArgs[0].user).to.deep.equal(testUser);
				expect(goArgs[0].isSudo).to.be.false;
				binBrowse.handler('nogo', [{text: testPath}, {text: 'false'}, {text: 'you tell me'}], [], {}, testUser, function(error, result) {
			
					nogoArgs = nogoStub.getCall(0).args;
					expect(nogoArgs[0].user).to.deep.equal(testUser);
					expect(nogoArgs[0].isSudo).to.be.true;
					done();
			
				}, true, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should pass the sanitized value of the first member of args as the "path" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[0] is a string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var goStub = sinon.stub(binBrowse, 'go').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test go output');
			
			});
			var nogoStub = sinon.stub(binBrowse, 'nogo').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test nogo output');
			
			});
			var goArgs, nogoArgs;
			binBrowse.handler('go', [{text: testPath}, {text: 'false'}], [], {}, testUser, function(error, result) {
			
				goArgs = goStub.getCall(0).args;
				expect(goArgs[0].path).to.equal(sanitize.cleanString(testPath, 1024,  null));
				binBrowse.handler('nogo', [{text: testPath}, {text: 'false'}, {text: 'you tell me'}], [], {}, testUser, function(error, result) {
			
					nogoArgs = nogoStub.getCall(0).args;
					expect(nogoArgs[0].path).to.equal(sanitize.cleanString(testPath, 1024,  null));
					done();
			
				}, true, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should pass the sanitized value of the second member of args as the "isGui" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[1] is a string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var goStub = sinon.stub(binBrowse, 'go').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test go output');
			
			});
			var nogoStub = sinon.stub(binBrowse, 'nogo').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test nogo output');
			
			});
			var goArgs, nogoArgs;
			binBrowse.handler('go', [{text: testPath}, {text: 'false'}], [], {}, testUser, function(error, result) {
			
				goArgs = goStub.getCall(0).args;
				expect(goArgs[0].isGui).to.be.false;
				binBrowse.handler('nogo', [{text: testPath}, {text: 'true'}, {text: 'you tell me'}], [], {}, testUser, function(error, result) {
			
					nogoArgs = nogoStub.getCall(0).args;
					expect(nogoArgs[0].isGui).to.be.true;
					done();
			
				}, true, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should pass the sanitized value of the third member of args as the "msg" property of args object passed to this.go or this.nogo if bin arg value is "go" or "nogo", args is a non-empty Array, and args[2] is a string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var goStub = sinon.stub(binBrowse, 'go').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test go output');
			
			});
			var nogoStub = sinon.stub(binBrowse, 'nogo').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test nogo output');
			
			});
			var goArgs, nogoArgs;
			binBrowse.handler('go', [{text: testPath}, {text: 'false'}, {text: '  nothing to say'}], [], {}, testUser, function(error, result) {
			
				goArgs = goStub.getCall(0).args;
				expect(goArgs[0].msg).to.equal(sanitize.cleanString('nothing to say', 255, false));
				binBrowse.handler('nogo', [{text: testPath}, {text: 'true'}, {text: 'you tell me'}], [], {}, testUser, function(error, result) {
			
					nogoArgs = nogoStub.getCall(0).args;
					expect(nogoArgs[0].msg).to.equal(sanitize.cleanString('you tell me', 255, false));
					done();
			
				}, true, 'z4EC2GTd1vQV7XbKuVMIxXG4');
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return the result of this.go called with the processed args to callback if bin arg value is "go" and args is a non-empty Array', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var goStub = sinon.stub(binBrowse, 'go').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test go output');
			
			});
			var goArgs;
			binBrowse.handler('go', [{text: testPath}, {text: 'false'}], [], {}, testUser, function(error, result) {

				expect(result).to.equal('test go output');
				done();
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
		});
		it('should return the result of this.nogo called with the processed args to callback if bin arg value is "nogo" and args is a non-empty Array', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var nogoStub = sinon.stub(binBrowse, 'nogo').callsFake(function returnStrToCb(args, cb) {
			
				return cb(false, 'test nogo output');
			
			});
			var nogoArgs;
			binBrowse.handler('nogo', [{text: testPath}, {text: 'false'}], [], {}, testUser, function(error, result) {
			
				expect(result).to.equal('test nogo output');
				done();
			
			}, false, 'z4EC2GTd1vQV7XbKuVMIxXG4');
		
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
	describe('outputBrowse(obj)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.outputBrowse).to.be.a('function');
		
		});
		it('should return the result of output/ansi export function called on obj arg', function() {
		
			var testObj = {
				noOutput: 'keep it steady',
				output: {content: 'change it up'}
			};
			var testResult = ansi(testObj);
			expect(binBrowse.outputBrowse(testObj)).to.deep.equal(testResult);
		
		});
	
	});
	describe('quit(isid, callback)', function() {
	
		var testUser;
		beforeEach(function() {
		
			testUser = getTestUser();
			createTestUserFS(testUser._id);
		
		});
		afterEach(function() {
		
			sinon.restore();
		
		});
		after(function() {
		
			removeTestUserFS();
		
		});
		it('should be a function', function() {
		
			expect(binBrowse.quit).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			function throwError() {
			
				return binBrowse.quit();
			
			}
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/handler/quit');
		
		});
		it('should return a TypeError to callback if isid is not a non-empty string', function(done) {
		
			binBrowse.quit(null, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid isid passed to bin/browse/handler/quit');
				done();
			
			});
		
		});
		it('should return an Error if call to super.disableListener(isid) throws an Error', function(done) {
		
			var uwotCmdDisableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'disableListener').throws(new Error('test disableListener error'));
			binBrowse.quit('z4EC2GTd1vQV7XbKuVMIxXG4', function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test disableListener error');
				done();
			
			});
		
		});
		it('should return an Error if call to super.disableListener(isid) returns an Error', function(done) {
		
			var uwotCmdDisableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'disableListener').returns(new Error('test disableListener error'));
			binBrowse.quit('z4EC2GTd1vQV7XbKuVMIxXG4', function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test disableListener error');
				done();
			
			});
		
		});
		it('should return an Error if call to super.disableListener(isid) does not return "disabled"', function(done) {
		
			var uwotCmdDisableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'disableListener').returns('enabled');
			binBrowse.quit('z4EC2GTd1vQV7XbKuVMIxXG4', function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('could not disable listener for bin/browse');
				done();
			
			});
		
		});
		it('should return the string "thanks for browsing!" if super.disableListener(isid) returns "disabled"', function(done) {
		
			var uwotCmdDisableListenerStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'disableListener').returns('disabled');
			binBrowse.quit('z4EC2GTd1vQV7XbKuVMIxXG4', function(error, result) {
			
				expect(result).to.equal('thanks for browsing!');
				done();
			
			});
		
		});
	
	});
	describe('go(args, callback)', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(binBrowse.go).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			function throwError() {
			
				return binBrowse.go();
			
			}
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/handler/go');
		
		});
		it('should return a TypeError to callback if args is not a non-null object', function(done) {
		
			binBrowse.go('null', function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to bin/browse/go');
				binBrowse.go(null, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to bin/browse/go');
					done();
			
				});
			
			});
		
		});
		it('should return a TypeError to callback if args.path is not a non-empty string', function(done) {
		
			binBrowse.go({}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/go');
				binBrowse.go({path: ''}, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/browse/go');
					done();
			
				});
			
			});
		
		});
		it('should return an object with properties output, outputType, cookies, and additional', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.outputType).to.be.a('string');
				expect(result.cookies).to.be.an('object').that.is.not.null;
				expect(result.additional).to.be.an('object').that.is.not.null;
				done();
		
			});
		
		});
		it('should set return object property output to an object with content property that is an array containing an object with classes property that is an array containing "browseOutput"', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
				expect(result.output.content[0]).to.be.an('object').with.property('classes').that.is.an('array').that.contains('browseOutput');
				done();
		
			});
		
		});
		it('should set return object property outputType to "object"', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('outputType').that.equals('object');
				done();
		
			});
		
		});
		it('should set return object property cookies to an object with properties uwotBrowseCurrentPath, uwotBrowseCurrentType, and uwotBrowseCurrentStatus', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('cookies').that.is.an('object').that.has.property('uwotBrowseCurrentPath');
				expect(result.cookies).to.have.property('uwotBrowseCurrentType');
				expect(result.cookies).to.have.property('uwotBrowseCurrentStatus');
				done();
		
			});
		
		});
		it('should set return object property additional to an object with property browseOpts that has property loadContent with value true', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
				expect(result.additional.browseOpts).to.have.property('loadContent').that.is.true;
				done();
		
			});
		
		});
		it('should set return object property additional.browseOpts.msg to the value of args.msg if args.msg is a non-empty string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.go({path: testPath, isGui: false, msg: ''}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
				expect(result.additional.browseOpts).to.not.have.property('msg');
				binBrowse.go({path: testPath, isGui: false, msg: 'test go msg'}, function(error, result) {
		
					expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
					expect(result.additional.browseOpts).to.have.property('msg').that.equals('test go msg');
					done();
		
				});
		
			});
		
		});
		it('should set the return object property output.content[0].content to the error message if this.getPathContent throws an error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function throwError(pth, args, cb) {
			
				throw new Error('thrown test getPathContent Error');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('thrown test getPathContent Error');
				done();
		
			});
		
		});
		it('should set the return object property output.content[0].content to the error message if this.getPathContent returns an error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnErrorToCb(pth, args, cb) {
			
				return cb(new Error('returned test getPathContent Error'));
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('returned test getPathContent Error');
				done();
		
			});
		
		});
		it('should set the return object property output.content[0].content to "no content found" if this.getPathContent does not return a non-empty string after completing without error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent');
			getPathContentStub.onCall(0).callsFake(function returnNullToCb(pth, args, cb) {
			
				return cb(false, null);
			
			});
			getPathContentStub.onCall(1).callsFake(function returnEmptyToCb(pth, args, cb) {
			
				return cb(false, '');
			
			});
			binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('no content found');
				binBrowse.go({path: testPath, isGui: false}, function(error, result) {
		
					expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
					expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
					expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('no content found');
					done();
		
				});
		
			});
		
		});
		it('should set the return object property output.content[0].content to the result of this.getPathContent if it returns a non-empty string after completing without error', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, '<div class="uwotGui-html">test go content</div>');
			
			});
			binBrowse.go({path: testPath, isGui: true}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('output').that.is.an('object').that.is.not.null;
				expect(result.output).to.have.property('content').that.is.an('array').that.is.not.empty;
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('<div class="uwotGui-html">test go content</div>');
				done();
		
			});
		
		});
	
	});
	describe('nogo(args, callback)', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(binBrowse.nogo).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			function throwError() {
			
				return binBrowse.nogo();
			
			}
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/handler/nogo');
		
		});
		it('should return an object with properties outputType, cookies, and additional', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.nogo({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('outputType').that.is.a('string');
				expect(result.cookies).to.be.an('object').that.is.not.null;
				expect(result.additional).to.be.an('object').that.is.not.null;
				done();
		
			});
		
		});
		it('should set return object property outputType to "object"', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.nogo({path: testPath, isGui: true}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('outputType').that.equals('object');
				done();
		
			});
		
		});
		it('should set return object property cookies to an object with properties uwotBrowseCurrentPath, uwotBrowseCurrentType, and uwotBrowseCurrentStatus', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.nogo({path: testPath, isGui: true}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('cookies').that.is.an('object').that.has.property('uwotBrowseCurrentPath').that.is.an('object').that.has.property('value').that.equals(testPath);
				expect(result.cookies).to.have.property('uwotBrowseCurrentType').that.is.an('object').that.has.property('value').that.equals('gui');
				expect(result.cookies).to.have.property('uwotBrowseCurrentStatus').that.is.an('object').that.has.property('value').that.equals('active');
				done();
		
			});
		
		});
		it('should set return object property additional to an object with property browseOpts that has property loadContent with value false', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.nogo({path: testPath, isGui: false}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
				expect(result.additional.browseOpts).to.have.property('loadContent').that.is.false;
				done();
		
			});
		
		});
		it('should set return object property additional.browseOpts.msg to the value of args.msg if args.msg is a non-empty string', function(done) {
		
			var testPath = '/var/www/html/example.html';
			var getPathContentStub = sinon.stub(binBrowse, 'getPathContent').callsFake(function returnStrToCb(pth, args, cb) {
			
				return cb(false, 'test go content');
			
			});
			binBrowse.nogo({path: testPath, isGui: false, msg: ''}, function(error, result) {
		
				expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
				expect(result.additional.browseOpts).to.not.have.property('msg');
				binBrowse.nogo({path: testPath, isGui: false, msg: 'test nogo msg'}, function(error, result) {
		
					expect(result).to.be.an('object').with.property('additional').that.is.an('object').that.has.property('browseOpts');
					expect(result.additional.browseOpts).to.have.property('msg').that.equals('test nogo msg');
					done();
		
				});
		
			});
		
		});
	
	});
	describe('getPathContent(pth, args, callback)', function() {
	
		it('should be a function', function() {
		
			expect(binBrowse.getPathContent).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			function throwError() {
			
				return binBrowse.getPathContent();
			
			}
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/browse/getPathContent');
		
		});
		it('should return a TypeError to callback if pth is not a non-empty string', function(done) {
		
			binBrowse.getPathContent(null, [], function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid pth passed to bin/browse/getPathContent');
				binBrowse.getPathContent('', [], function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid pth passed to bin/browse/getPathContent');
					done();
			
				});
			
			});
		
		});
		it('should return a TypeError to callback if args is not a non-null object', function(done) {
		
			var testPath = '/var/www/html/example.html';
			binBrowse.getPathContent(testPath, 'isLocal: false', function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to bin/browse/getPathContent');
				binBrowse.getPathContent(testPath, null, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to bin/browse/getPathContent');
					done();
			
				});
			
			});
		
		});
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
