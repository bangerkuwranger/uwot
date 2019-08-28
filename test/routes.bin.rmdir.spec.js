const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binRmdir;
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

describe('rmdir.js', function() {

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
		binRmdir = require('../routes/bin/rmdir');
	
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
	it('should be an object that is an instance of UwotCmdRmdir', function() {
	
		expect(binRmdir).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdRmdir');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binRmdir).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binRmdir).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "rmdir"', function() {
	
			expect(binRmdir.command).to.have.property('name').that.equals('rmdir');
	
		});
		it('should have a property "description" that has value "Remove directory.  The rmdir utility removes the directory entry specified by the directory argument, provided it is empty."', function() {
	
			expect(binRmdir.command).to.have.property('description').that.equals('Remove directory.  The rmdir utility removes the directory entry specified by the directory argument, provided it is empty.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "path"', function() {
	
			expect(binRmdir.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binRmdir.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an empty array', function() {
	
			expect(binRmdir).to.have.property('options').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/rmdir"', function() {
	
			expect(binRmdir).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/rmdir');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binRmdir).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binRmdir.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binRmdir.constructor(...argArr);
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
		
			expect(binRmdir.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binRmdir.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/rmdir/execute');
		
		});
		it('should return a TypeError to callback function if instance user global fileSystem is invalid', function(done) {
		
			binRmdir.execute([], [], {}, {_id: 'falstaff'}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, null);
		
		});
		it('should return a TypeError to callback function if args in not an array with a member at index 0 that is a non-null object with a string value for property "text"', function(done) {
		
			binRmdir.execute('args', [], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
				binRmdir.execute(null, [], {}, testUser, function(error, result) {
			
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
					binRmdir.execute([], [], {}, testUser, function(error, result) {
			
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
						binRmdir.execute(['args'], [], {}, testUser, function(error, result) {
			
							expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
							binRmdir.execute([null], [], {}, testUser, function(error, result) {
			
								expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
								binRmdir.execute([{text: null}], [], {}, testUser, function(error, result) {
		
									expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path passed to bin/rmdir/execute');
									done();
		
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should call the cmd method of the instance user global fileSystem using arguments "rmdir", an array containing the path string, a callback function, and the value of isSudo arg if fileSystem, callback, and args are valid', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binRmdir.execute([{text: testPath}], [], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('rmdir');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1].length).to.equal(1);
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
			binRmdir.execute([{text: testPath}], [], {}, testUser, function(error, result) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testPath);
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should return an error as the first arg of callback if the cmd call returns an error to its callback', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binRmdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
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
			binRmdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid path');
				expect(result).to.equal(testPath);
				userFsCmdStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
		it('should return an object with an output property that is an object with a content property that is an array containing the string "rmdir success: " and the result of calling userFs.dissolvePath on the final path of the removed file if the cmd call does not return an error as the first arg to its callback and returns a non-empty string as the second arg to its callback', function(done) {
		
			var testPath = '/rods/monochrome/';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnTrue(op, args, cb, isSudo) {
			
				return cb(false, true);
			
			});
			var userFsDissolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'dissolvePath').returnsArg(0);
			binRmdir.execute([{text: testPath}], [{name: 'p'}], {}, testUser, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.contains('removed: ' + testPath)
				userFsCmdStub.restore();
				userFsDissolvePathStub.restore();
				done();
			
			}, false, 'visualDreamer');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binRmdir.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binRmdir.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
