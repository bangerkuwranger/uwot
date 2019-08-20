const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binCp;
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

describe('cp.js', function() {

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
		binCp = require('../routes/bin/cp');
	
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
	it('should be an object that is an instance of UwotCmdCp', function() {
	
		expect(binCp).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCp');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binCp).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binCp).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "cp"', function() {
	
			expect(binCp.command).to.have.property('name').that.equals('cp');
	
		});
		it('should have a property "description" that has value "Copy files. The cp utility copies the contents of the source to the target."', function() {
	
			expect(binCp.command).to.have.property('description').that.equals('Copy files. The cp utility copies the contents of the source to the target.');
	
		});
		it('should have a property "requiredArguments" that is an array with two values, "source" and "target"', function() {
	
			expect(binCp.command).to.have.property('requiredArguments').that.is.an('array').that.contains('source');
			expect(binCp.command).to.have.property('requiredArguments').that.is.an('array').that.contains('target');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binCp.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binCp).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binCp.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that equals "Do not overwrite an existing file."', function() {
			
				expect(binCp.options[0]).to.be.an('object').with.property('description').that.equals('Do not overwrite an existing file.');
			
			});
			it('should have property "shortOpt" that has value "R"', function() {
			
				expect(binCp.options[0]).to.be.an('object').with.property('shortOpt').that.equals('n');
			
			});
			it('should have property "longOpt" that has value "recursive"', function() {
			
				expect(binCp.options[0]).to.be.an('object').with.property('longOpt').that.equals('noclobber');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binCp.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binCp.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[1]', function() {
		
			it('should be an object', function() {
			
				expect(binCp.options[1]).to.be.an('object');
			
			});
			it('should have property "description" that equals "Recursive copy. If source designates a directory, cp copies the directory and the entire subtree connected at that point.  If the source path ends in a "/", the contents of the directory are copied rather than the directory itself."', function() {
			
				expect(binCp.options[1]).to.be.an('object').with.property('description').that.equals('Recursive copy. If source designates a directory, cp copies the directory and the entire subtree connected at that point.  If the source path ends in a "/", the contents of the directory are copied rather than the directory itself.');
			
			});
			it('should have property "shortOpt" that has value "R"', function() {
			
				expect(binCp.options[1]).to.be.an('object').with.property('shortOpt').that.equals('R');
			
			});
			it('should have property "longOpt" that has value "recursive"', function() {
			
				expect(binCp.options[1]).to.be.an('object').with.property('longOpt').that.equals('recursive');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binCp.options[1]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binCp.options[1]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/cp"', function() {
	
			expect(binCp).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/cp');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binCp).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binCp.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binCp.constructor(...argArr);
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
		
			expect(binCp.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binCp.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/cp/execute');
		
		});
		it('should return a TypeError to callback function if args in not an array with two member objects that each have a text property with a string value', function(done) {
		
			binCp.execute('args', [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
				binCp.execute(null, [], {}, testUser, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
					binCp.execute([], [], {}, testUser, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
						binCp.execute(['args'], [], {}, testUser, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
							binCp.execute([null], [], {}, testUser, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
								binCp.execute([{text: null}], [], {}, testUser, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
									binCp.execute([{text: 'anywhere/but/here'}, {text: null}], [], {}, testUser, function(error, result) {
		
										expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid source/target for bin/cp/execute');
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
			binCp.execute([{text: testSource}, {text: testTarget}], [], {}, {_id: 'marvin'}, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, 'martian');
		
		});
		it('should call instance user fileSystem cmd method with args: "cp"; array with source, target, noOverwrite, isRecursive values; callback function; and value of isSudo arg', function(done) {
		
			var testSource = '/screwy/aint/it';
			var testTarget = '/what/a/stinker';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('matt damon'));
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binCp.execute([{text: testSource}, {text: testTarget}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('cp');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testSource);
				expect(testArgs[1][1]).to.equal(testTarget);
				expect(testArgs[1][2]).to.be.false;
				expect(testArgs[1][3]).to.be.false;
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'martian');
		
		});
		it('should pass the string value of args[0].text as the first member of the second argument array to the cmd call if args is a non-empty array with a first member object with property text that is a string');
		it('should pass the string value of args[1].text as the second member of the second argument array to the cmd call if args is a non-empty array with a second member object with property text that is a string');
		it('should pass false as the third and fourth member of the second argument array to the cmd call if options arg is not a non-empty array');
		it('should pass false as the third member of the second argument array to the cmd call if options arg is a non-empty array but does not contain a member object with name property that equals "n" or "noclobber"');
		it('should pass false as the fourth member of the second argument array to the cmd call if options arg is a non-empty array but does not contain a member object with name property that equals "R" or "recursive"');
		it('should pass true as the third member of the second argument array to the cmd call if options arg is a non-empty array and contains a member object with name property that equals "n" or "noclobber"');
		it('should pass true as the fourth member of the second argument array to the cmd call if options arg is a non-empty array and contains a member object with name property that equals "R" or "recursive"');
		it('should return an error to callback if cmd call returns an error to its callback');
		it('should return an error and array containing source and target string values to callback if cmd call does not return true to its callback but completes without error');
		it('should return an object with output property that is an object with content property that is an array containing the result of instance user fileSystem method dissolvePath being called with source and target values');
		it('should return an error to callback if either call to dissolvePath throws an error');
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binCp.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binCp.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
