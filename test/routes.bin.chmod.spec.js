const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binChmod;
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

describe('chmod.js', function() {

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
		binChmod = require('../routes/bin/chmod');
	
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
	it('should be an object that is an instance of UwotCmdChmod', function() {
	
		expect(binChmod).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdChmod');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binChmod).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binChmod).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "chmod"', function() {
	
			expect(binChmod.command).to.have.property('name').that.equals('chmod');
	
		});
		it('should have a property "description" that has value "Change allowed permissions for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory. Only the owner of a file or the super-user is permitted to change the allowed permissions of a directory. As there are no user groups, permissions are set by default for all users, or specifically for one user, specified as argument of the -u flag. Also, the permissions specified do not follow POSIX rules, but are set with a single string "rwx", where including the letter allows the action, omitting it disallows it. E.g. "" would allow nothing, "r" is read-only, etc."', function() {
	
			expect(binChmod.command).to.have.property('description').that.equals('Change allowed permissions for files within a directory inside of the VFS. If a file is specified instead of a directory, change will be applied to parent directory. Only the owner of a file or the super-user is permitted to change the allowed permissions of a directory. As there are no user groups, permissions are set by default for all users, or specifically for one user, specified as argument of the -u flag. Also, the permissions specified do not follow POSIX rules, but are set with a single string "rwx", where including the letter allows the action, omitting it disallows it. E.g. "" would allow nothing, "r" is read-only, etc.');
	
		});
		it('should have a property "requiredArguments" that is an array with two values, "permissions" and "path"', function() {
	
			expect(binChmod.command).to.have.property('requiredArguments').that.is.an('array').that.contains('path');
			expect(binChmod.command).to.have.property('requiredArguments').that.is.an('array').that.contains('permissions');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binChmod.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binChmod).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binChmod.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Recursive permissions change. Change permissions of all subdirectories of a directory specified by path."', function() {
			
				expect(binChmod.options[0]).to.be.an('object').with.property('description').that.equals('Recursive permissions change. Change permissions of all subdirectories of a directory specified by path.');
			
			});
			it('should have property "shortOpt" that has value "R"', function() {
			
				expect(binChmod.options[0]).to.be.an('object').with.property('shortOpt').that.equals('R');
			
			});
			it('should have property "longOpt" that has value "recursive"', function() {
			
				expect(binChmod.options[0]).to.be.an('object').with.property('longOpt').that.equals('recursive');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binChmod.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binChmod.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[1]', function() {
		
			it('should be an object', function() {
			
				expect(binChmod.options[1]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Specify username that permissions should be applied to. Without an operand, this option is ignored."', function() {
			
				expect(binChmod.options[1]).to.be.an('object').with.property('description').that.equals('Specify username that permissions should be applied to. Without an operand, this option is ignored.');
			
			});
			it('should have property "shortOpt" that has value "u"', function() {
			
				expect(binChmod.options[1]).to.be.an('object').with.property('shortOpt').that.equals('u');
			
			});
			it('should have property "longOpt" that has value "user"', function() {
			
				expect(binChmod.options[1]).to.be.an('object').with.property('longOpt').that.equals('user');
			
			});
			it('should have property "requiredArguments" that is an array with one element, "username"', function() {
			
				expect(binChmod.options[1]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.contains('username');
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binChmod.options[1]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/chmod"', function() {
	
			expect(binChmod).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/chmod');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binChmod).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binChmod.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binChmod.constructor(...argArr);
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
		
			expect(binChmod.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binChmod.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/chmod/execute');
		
		});
		it('should return a TypeError to callback if user fileSystem is invalid', function(done) {
		
			binChmod.execute([], [], {}, {_id: 'marvin'}, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return a SystemError to callback if args is not a non-empty array', function(done) {
		
			binChmod.execute([], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EINVAL');
				done();
			
			}, false, 'paranoid');
		
		});
		it('should call the cmd method of instance user fileSystem with arguments "chmod"; an array containing path, allowed, isRecursive, and userName; a callback function; and the value of the isSudo arg if args and filesystem are valid', function(done) {
		
			var testPath = '/faeries/wear/boots';
			var testAllowedStr = 'rwx';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testPath);
				expect(testArgs[1][1]).to.deep.equal(['r', 'w', 'x']);
				expect(testArgs[1][2]).to.be.false;
				expect(testArgs[1][4]).to.be.undefined;
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass the value of the second member of the args array argument\'s text property with trimmed whitespace as the first argument for cmd', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'rwx';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array').that.contains(testPath.trim());
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass null as the first argument for cmd if the second member of the args array argument\'s text property is not a string', function(done) {
		
			var testPath = {damage: 'dent'};
			var testAllowedStr = 'rwx';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.be.null;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass an empty array as the second argument for cmd if the first member of the args array argument\'s text property is not a string, or does not contain any of the characters "r", "w", or "x"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'evesedlettes';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.an('array').that.is.empty;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass an array containing an array element with value "r" as the second argument for cmd if the first member of the args array argument\'s text property is a string containing "r"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebro';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.deep.equal(['r']);
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass an array containing an array element with value "w" as the second argument for cmd if the first member of the args array argument\'s text property is a string containing "w"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.deep.equal(['w']);
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass an array containing an array element with value "x" as the second argument for cmd if the first member of the args array argument\'s text property is a string containing "x"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebox';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.deep.equal(['x']);
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass false as the third element in the second argument array to cmd if the options argument value is not a non-empty array', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass false as the third element in the second argument array to cmd if the options argument value is a non-empty array and does not contain an object with a name property that equals "R" or "recursive"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'challenger'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass true as the third element in the second argument array to cmd if the options argument value is a non-empty array and contains an object with a name property that equals "R" or "recursive"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'R'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.true;
				binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'recursive'}], {}, testUser, function(error, wasChanged) {
			
					expect(userFsCmdStub.called).to.be.true;
					var testArgs = userFsCmdStub.getCall(0).args;
					expect(testArgs[0]).to.equal('chmod');
					expect(testArgs[1]).to.be.an('array');
					expect(testArgs[1][2]).to.be.true;
					userFsCmdStub.restore();
					done();
			
				}, false, 'paranoid');
			
			}, false, 'paranoid');
		
		});
		it('should pass undefined as the fourth element in the second argument array to cmd if the options argument value is not a non-empty array', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], null, {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][3]).to.be.undefined;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass undefined as the fourth element in the second argument array to cmd if the options argument value is a non-empty array and does not contain an object with a name property that equals "u" or "user"', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'challenger'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][3]).to.be.undefined;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass null as the fourth element in the second argument array to cmd if the options argument value is a non-empty array that contains an object with a name property that equals "u" or "user", but does not have a property "args" that is an array with a first element that is a string', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'u'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][3]).to.be.null;
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should pass the value of the first argument in an option\'s args property as the fourth argument for cmd if the options argument value is a non-empty array that contains an object with a name property that equals "u" or "user" that has a property "args" that is an array with a first element that is a string', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('chmod');
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][3]).to.equal('trillian');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return an error to callback if the cmd call returns an error to its callback', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.an.instanceof(Error).with.property('message').that.equals('test cmd error');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return an error to callback if the cmd call does not return a truthy result', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnFalse(op, args, cb, isSudo) {
			
				return cb(false, false);
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.an.instanceof(Error).with.property('message').that.equals('invalid path');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
		it('should return an object with property output that is an object with property content that is an array containing "permissions updated." to callback if cmd call returns a truthy result without error', function(done) {
		
			var testPath = '	/damaged/art   ';
			var testAllowedStr = 'beeblebrox wylde';
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnTrue(op, args, cb, isSudo) {
			
				return cb(false, true);
			
			});
			binChmod.execute([{text: testAllowedStr}, {text: testPath}], [{name: 'u', args: ['trillian']}], {}, testUser, function(error, wasChanged) {
			
				
			expect(error).to.be.false;	expect(wasChanged).to.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.contains('permissions updated.');
				userFsCmdStub.restore();
				done();
			
			}, false, 'paranoid');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binChmod.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binChmod.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
