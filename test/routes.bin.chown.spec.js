const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binChown;
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
			getVcwd: function() {
			
				return "/home/" +getTestUser().uName;
			
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

describe('chown.js', function() {

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
		binChown = require('../routes/bin/chown');
	
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
	it('should be an object that is an instance of UwotCmdChown', function() {
	
		expect(binChown).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdChown');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binChown).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binChown).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "chown"', function() {
	
			expect(binChown.command).to.have.property('name').that.equals('chown');
	
		});
		it('should have a property "description" that has value "Change owner for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory."', function() {
	
			expect(binChown.command).to.have.property('description').that.equals('Change owner for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory.');
	
		});
		it('should have a property "requiredArguments" that is an array with two values, "owner" and "path"', function() {
	
			expect(binChown.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
			expect(binChown.command).to.have.property('requiredArguments').that.is.an('array').that.contains('owner');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binChown.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binChown).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binChown.options[0]).to.be.an('object');
			
			});
			it('Recursive permissions change. Change owners for all subdirectories of a directory specified by path.', function() {
			
				expect(binChown.options[0]).to.be.an('object').with.property('description').that.equals('Recursive permissions change. Change owners for all subdirectories of a directory specified by path.');
			
			});
			it('should have property "shortOpt" that has value "R"', function() {
			
				expect(binChown.options[0]).to.be.an('object').with.property('shortOpt').that.equals('R');
			
			});
			it('should have property "longOpt" that has value "recursive"', function() {
			
				expect(binChown.options[0]).to.be.an('object').with.property('longOpt').that.equals('recursive');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binChown.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binChown.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/chown"', function() {
	
			expect(binChown).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/chown');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binChown).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binChown.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binChown.constructor(...argArr);
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
		
			expect(binChown.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binChown.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/chown/execute');
		
		});
		it('should return a TypeError to callback if user fileSystem is invalid', function(done) {
		
			binChown.execute([], [], {}, {_id: 'marvin'}, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return a SystemError to callback if args is not a non-empty array', function(done) {
		
			binChown.execute([], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EINVAL');
				done();
			
			}, false, 'paranoid');
		
		});
		it('should call the cmd method of instance user fileSystem with arguments "chown"; an array containing path, userName, and isRecursive; a callback function; and the value of the isSudo arg if args and filesystem are valid', function(done) {
		
			var testPath = '/faeries/wear/boots';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testPath);
				expect(testArgs[1][1]).to.equal(testUserName);
				expect(testArgs[1][2]).to.be.false;
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass the value of the second member of the args array argument\'s text property with trimmed whitespace as the first argument for cmd', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array').that.contains(testPath.trim());
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass null as the first argument for cmd if the second member of the args array argument\'s text property is not a string', function(done) {
		
			var testPath = {damage: 'dent'};
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.be.null;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass null as the second argument for cmd if the first member of the args array argument\'s text property is not a string', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = ['evesedlettes'];
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.null;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass an array containing value of args array\'s first member\'s text property as the second argument for cmd if the first member of the args array argument\'s text property is a string', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.equal(testUserName);
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass false as the third element in the second argument array to cmd if the options argument value is not a non-empty array', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass false as the third element in the second argument array to cmd if the options argument value is a non-empty array and does not contain an object with a name property that equals "R" or "recursive"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'challenger'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass true as the third element in the second argument array to cmd if the options argument value is a non-empty array and contains an object with a name property that equals "R" or "recursive"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'R'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chown');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.true;
				binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'recursive'}], {}, testUser, function(error, wasChanged) {
			
					expect(userFsCmdStub.called).to.be.true;
					var testArgs = userFsCmdStub.getCall(0).args;
					expect(testArgs[0]).to.equal('chown');
					expect(testArgs[1]).to.be.an('array');
					expect(testArgs[1][2]).to.be.true;
					userFsCmdStub.restore();
					done();
			
				}, false, 'paranoid');
			
			}, false, 'paranoid');
		
		});
		
		it('should return an error to callback if the cmd call returns an error to its callback', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.an.instanceof(Error).with.property('message').that.equals('test cmd error');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return an error to callback if the cmd call does not return a truthy result', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.an.instanceof(Error).with.property('message').that.equals('invalid path');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return an object with property output that is an object with property content that is an array containing "owner updated." to callback if cmd call returns a truthy result without error', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testUserName = testUser.uName;
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnTrue(op, args, cb, isSudo) {
			
				return cb(false, true);
			
			});
			binChown.execute([{text: testUserName}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				
			expect(error).to.be.false;	expect(wasChanged).to.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.contains('owner updated.');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binChown.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binChown.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
