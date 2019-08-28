const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binMv;
const path = require('path');

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
			dissolvePath: function(pth) {
			
				return pth.replace(global.Uwot.Constants.appRoot, '');
			
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

describe('mv.js', function() {

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
		binMv = require('../routes/bin/mv');
	
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
	it('should be an object that is an instance of UwotCmdMv', function() {
	
		expect(binMv).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdMv');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binMv).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binMv).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "mv"', function() {
	
			expect(binMv.command).to.have.property('name').that.equals('mv');
	
		});
		it('should have a property "description" that has value "Move files. The mv utility renames the file named by the source operand to the destination path named by the target operand."', function() {
	
			expect(binMv.command).to.have.property('description').that.equals('Move files. The mv utility renames the file named by the source operand to the destination path named by the target operand.');
	
		});
		it('should have a property "requiredArguments" that is an array with two values, "source" and "target"', function() {
	
			expect(binMv.command).to.have.property('requiredArguments').that.is.an('array').that.contains('source');
			expect(binMv.command).to.have.property('requiredArguments').that.is.an('array').that.contains('target');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binMv.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binMv).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binMv.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that equals "Do not overwrite an existing file."', function() {
			
				expect(binMv.options[0]).to.be.an('object').with.property('description').that.equals('Do not overwrite an existing file.');
			
			});
			it('should have property "shortOpt" that has value "n"', function() {
			
				expect(binMv.options[0]).to.be.an('object').with.property('shortOpt').that.equals('n');
			
			});
			it('should have property "longOpt" that has value "noclobber"', function() {
			
				expect(binMv.options[0]).to.be.an('object').with.property('longOpt').that.equals('noclobber');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binMv.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binMv.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/mv"', function() {
	
			expect(binMv).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/mv');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binMv).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binMv.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binMv.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		var testUser;
		before(function() {
		
			testUser = getTestUser();
			createTestUserFS();
		
		});
		afterEach(function() {
		
			sinon.restore();
		
		});
		after(function() {
		
			removeTestUserFS();
		
		});
		it('should be a function', function() {
		
			expect(binMv.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binMv.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/mv/execute');
		
		});
		it('should return a TypeError to callback function if args in not an array with two member objects that each have a text property with a string value', function(done) {
		
			binMv.execute('args', [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
				binMv.execute(null, [], {}, testUser, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
					binMv.execute([], [], {}, testUser, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
						binMv.execute(['args'], [], {}, testUser, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
							binMv.execute([null], [], {}, testUser, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
								binMv.execute([{text: null}], [], {}, testUser, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
									binMv.execute([{text: 'anywhere/but/here'}, {text: null}], [], {}, testUser, function(error, result) {
		
										expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/mv/execute');
										done();
		
									}, false, null);
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should return a TypeError to callback if user fileSystem is invalid', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, {_id: 'marvin'}, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, 'martian');
		
		});
		it('should call instance user fileSystem cmd method with args: "mv"; array with source, target, & noOverwrite values; callback function; and value of isSudo arg', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('matt damon'));
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1].length).to.equal(3);
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass the string value of args[0].text as the first member of the second argument array (source) to the cmd call if args is a non-empty array with a first member object with property text that is a string', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testSource);
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass the string value of args[1].text as the second member of the second argument array (target) to the cmd call if args is a non-empty array with a second member object with property text that is a string', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.equal(testTarget);
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass false as the third member (noOverWrite) of the second argument array to the cmd call if options arg is not a non-empty array', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass false as the third member of the second argument array to the cmd call if options arg is a non-empty array but does not contain a member object with name property that equals "n" or "noclobber"', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass true as the third member of the second argument array to the cmd call if options arg is a non-empty array and contains a member object with name property that equals "n" or "noclobber"', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'n'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mv');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.true;
				binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'noclobber'}], {}, testUser, function(error, wasChanged) {
			
					expect(userFsCmdStub.called).to.be.true;
					var testArgs = userFsCmdStub.getCall(0).args;
					expect(testArgs[0]).to.equal('mv');
					expect(testArgs[1]).to.be.an('array');
					expect(testArgs[1][2]).to.be.true;
					userFsCmdStub.restore();
					userFsDissolvePathStub.restore();
					done();
			
				}, false, 'martian');
			
			}, false, 'martian');
		
		});
		it('should return an error to callback if cmd call returns an error to its callback', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('matt damon'));
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('matt damon');
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should return an error and array containing source and target string values to callback if cmd call does not return true to its callback but completes without error', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid move');
				expect(wasChanged).to.be.an('array').that.contains(testSource);
				expect(wasChanged).to.be.an('array').that.contains(testTarget);
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should return an object with output property that is an object with content property that is an array containing the result of instance user fileSystem method dissolvePath being called with source and target values if cmd call returns true to its callback', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnTrue(op, args, cb, isSudo) {
			
				return cb(false, true);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.false;
				expect(wasChanged).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.contains('moved ' + testSource + ' to ' + testTarget);
				expect(userFsDissolvePathStub.calledWith(testSource)).to.be.true;
				expect(userFsDissolvePathStub.calledWith(testTarget)).to.be.true;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should return an error to callback if either call to dissolvePath throws an error after cmd call returns true to its callback', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnTrue(op, args, cb, isSudo) {
			
				return cb(false, true);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath');
			userFsDissolvePathStub.onCall(0).returnsArg(0);
			userFsDissolvePathStub.onCall(1).throws(new Error('test dissolvePath error'));
			binMv.execute([{text: testSource}, {text: testTarget}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test dissolvePath error');
				expect(userFsDissolvePathStub.calledWith(testSource)).to.be.true;
				expect(userFsDissolvePathStub.calledWith(testTarget)).to.be.true;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binMv.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binMv.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
