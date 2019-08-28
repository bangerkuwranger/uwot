const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binMkdir;
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
			
				return "/home/" + getTestUser().uName + pth;
			
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

describe('mkdir.js', function() {

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
		binMkdir = require('../routes/bin/mkdir');
	
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
	it('should be an object that is an instance of UwotCmdMkdir', function() {
	
		expect(binMkdir).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdMkdir');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binMkdir).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binMkdir).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "mkdir"', function() {
	
			expect(binMkdir.command).to.have.property('name').that.equals('mkdir');
	
		});
		it('should have a property "description" that has value "Make directory."', function() {
	
			expect(binMkdir.command).to.have.property('description').that.equals('Make directory.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "path"', function() {
	
			expect(binMkdir.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binMkdir.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binMkdir).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binMkdir.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Create intermediate directories as required."', function() {
			
				expect(binMkdir.options[0]).to.be.an('object').with.property('description').that.equals('Create intermediate directories as required.');
			
			});
			it('should have property "shortOpt" that has value "p"', function() {
			
				expect(binMkdir.options[0]).to.be.an('object').with.property('shortOpt').that.equals('p');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binMkdir.options[0]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binMkdir.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binMkdir.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/mkdir"', function() {
	
			expect(binMkdir).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/mkdir');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binMkdir).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binMkdir.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binMkdir.constructor(...argArr);
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
		
			expect(binMkdir.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binMkdir.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/mkdir/execute');
		
		});
		it('should return a TypeError to callback function if instance user global fileSystem is invalid', function(done) {
		
			binMkdir.execute([], [], {}, {_id: 'falstaff'}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, null);
		
		});
		it('should return a TypeError to callback function if args in not an array with a member at index 0 that is a non-null object with a string value for property "text"', function(done) {
		
			binMkdir.execute('args', [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
				binMkdir.execute(null, [], {}, testUser, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
					binMkdir.execute([], [], {}, testUser, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
						binMkdir.execute(['args'], [], {}, testUser, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
							binMkdir.execute([null], [], {}, testUser, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
								binMkdir.execute([{text: null}], [], {}, testUser, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/mkdir/execute');
									done();
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should call the cmd method of the instance user global fileSystem using arguments "mkdir", an array containing the path string and value of createIntermediate, a callback function, and the value of isSudo arg if fileSystem, callback, and args are valid', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('mkdir');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1].length).to.equal(2);
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should use the value of args[0].text as the first member of the second argument array passed to cmd if args array is valid', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testPath);
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should use false for the second member of the second argument array passed to cmd if options is not a non-empty array', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should use false for the second member of the second argument array passed to cmd if options is a non-empty array that does not contain a non-null object with a value for the name property that equals "p"', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [{name: 'q'}], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should use true for the second member of the second argument array passed to cmd if options is a non-empty array that contains a non-null object with a value for the name property that equals "p"', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.true;
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should return an error as the first arg of callback if the cmd call returns an error to its callback', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binMkdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test cmd error');
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should return an error as the first arg of callback and the value of args[0].text as the second arg of callback if the cmd call does not return an error as the first arg to its callback and does not return a non-empty string as the second arg to its callback', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyString(op, args, cb, isSudo) {
			
				return cb(false, '');
			
			});
			binMkdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid path');
				expect(result).to.equal(testPath);
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should return an object with an output property that is an object with a content property that is an array containing the string "mkdir success: " and the result of calling userFs.dissolvePath on the final path of the new directory if the cmd call does not return an error as the first arg to its callback and returns a non-empty string as the second arg to its callback', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				return cb(false, args[0]);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binMkdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.contains('mkdir success: ' + testPath)
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binMkdir.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binMkdir.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
