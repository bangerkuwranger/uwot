const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binLs;
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
			getCwd: function() {
			
				return "/home/" + getTestUser().uName;
			
			},
			resolvePath: function(pth) {
			
				return "/tmp/" + pth;
			
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

describe('ls.js', function() {

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
		binLs = require('../routes/bin/ls');
	
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
	it('should be an object that is an instance of UwotCmdLs', function() {
	
		expect(binLs).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdLs');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binLs).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binLs).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "ls"', function() {
	
			expect(binLs.command).to.have.property('name').that.equals('ls');
	
		});
		it('should have a property "description" that has value "List directory contents."', function() {
	
			expect(binLs.command).to.have.property('description').that.equals('List directory contents.');
	
		});
		it('should have a property "requiredArguments" that is an empty array', function() {
	
			expect(binLs.command).to.have.property('requiredArguments').that.is.an('array').that.is.empty;
	
		});
		it('should have a property "optionalArguments" that is an array with one value, "path"', function() {
	
			expect(binLs.command).to.have.property('optionalArguments').that.is.an('array').that.contains('path');
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binLs).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binLs.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "List in long format."', function() {
			
				expect(binLs.options[0]).to.be.an('object').with.property('description').that.equals('List in long format.');
			
			});
			it('should have property "shortOpt" that has value "l"', function() {
			
				expect(binLs.options[0]).to.be.an('object').with.property('shortOpt').that.equals('l');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binLs.options[0]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binLs.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binLs.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[1]', function() {
		
			it('should be an object', function() {
			
				expect(binLs.options[1]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Include directory entries whose names begin with a dot (.)."', function() {
			
				expect(binLs.options[1]).to.be.an('object').with.property('description').that.equals('Include directory entries whose names begin with a dot (.).');
			
			});
			it('should have property "shortOpt" that has value "a"', function() {
			
				expect(binLs.options[1]).to.be.an('object').with.property('shortOpt').that.equals('a');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binLs.options[1]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binLs.options[1]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binLs.options[1]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/ls"', function() {
		
			expect(binLs).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/ls');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binLs).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binLs.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binLs.constructor(...argArr);
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
		
			expect(binLs.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binLs.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/ls/execute');
		
		});
		it('should return a TypeError to callback if user fileSystem is invalid', function(done) {
		
			binLs.execute([], [], {}, {_id: 'kirby'}, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid user fileSystem');
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an Error to callback if args[0] is a valid argument node and user fileSystem method resolvePath throws an Error', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').throws(new Error('test resolvePath error'));
			binLs.execute([{text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test resolvePath error');
				resolvePathStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an Error to callback if args[0] is a valid argument node and user fileSystem method resolvePath returns an Error', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returns(new Error('test resolvePath error'));
			binLs.execute([{text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test resolvePath error');
				resolvePathStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an Error to callback if args is not an array or args[0] is not a valid argument node and user fileSystem method getCwd throws an Error', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var getCwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getCwd').throws(new Error('test getCwd error'));
			binLs.execute([], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test getCwd error');
				getCwdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an Error to callback if args is not an array or args[0] is not a valid argument node and user fileSystem method getCwd returns an Error', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var getCwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getCwd').returns(new Error('test getCwd error'));
			binLs.execute([{text: null}], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test getCwd error');
				getCwdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should call the global fileSystem for the user_.id\'s cmd method with the args: "ls"; an array containing a path string, bool showInvisible, and bool longForm; a callback function, and the value of the isSudo arg', function(done) {
		
			var getCwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getCwd').returns('/home/' + testUser._id);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[0]).to.equal('ls');
				expect(testArgs[1]).to.be.an('array').with.property('length').that.equals(3);
				expect(testArgs[2]).to.be.a('function');
				expect(testArgs[3]).to.be.false;
				getCwdStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass the result of the userFs geCwd method as the first element in the second argument array to the userFs cmd call if args is not an array containing an object with a string text property value', function(done) {
		
			var getCwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getCwd').returns('/home/' + testUser._id);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal('/home/' + testUser._id);
				getCwdStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass the result of the userFs resolvePath method called with the text property value of the first element in args array as the first element in the second argument array to the userFs cmd call if args is an array containing an object with a string text property value', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][0]).to.equal(testPath);
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass false as the second and third members of the second argument array to the userFs cmd call if options is not a non-empty array', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.false;
				expect(testArgs[1][2]).to.be.false;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass false as the second member of the second argument array to the userFs cmd call if options is a non-empty array but does not contain an object with a name property value that equals "a"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.false;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass true as the second member of the second argument array to the userFs cmd call if options is a non-empty array and contains an object with a name property value that equals "a"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'a'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][1]).to.be.true;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass false as the third member of the second argument array to the userFs cmd call if options is a non-empty array but does not contain an object with a name property value that equals "l"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'q'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.false;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should pass true as the third member of the second argument array to the userFs cmd call if options is a non-empty array and contains an object with a name property value that equals "l"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'l'}], {}, testUser, function(error, wasChanged) {
			
				expect(userFsCmdStub.called).to.be.true;
				var testArgs = userFsCmdStub.getCall(0).args;
				expect(testArgs[1]).to.be.an('array');
				expect(testArgs[1][2]).to.be.true;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an Error to the callback function if the cmd call returns an Error to its callback', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnErr(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'), []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'l'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test cmd error');
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return an object with an output property that is an object with an array content property if the cmd call completes without error', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'l'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.false;
				expect(wasChanged).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array');
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should return the output.content property as an empty array if the cmd call completes without error and returns a value that is not a non-empty array', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, []);
			
			});
			binLs.execute([{text: testPath}], [{name: 'l'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.false;
				expect(wasChanged).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array').that.is.empty;
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should add an object resulting from each call to parent class method parsePre on each member of the array returned by the command function and a br tag ansi obj to the return object\'s output.content array if the cmd call returns a non-empty array and options is a non-empty array containing an object with name property that has value "l"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var testArray = [
				'raindrops',
				'whiskers',
				'kettles',
				'mittens'
			];
			var testResult = [
				'raindrops',
				{tag: 'br'},
				'whiskers',
				{tag: 'br'},
				'kettles',
				{tag: 'br'},
				'mittens',
				{tag: 'br'}
			];
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, testArray);
			
			});
			var parsePreStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'parsePre').returnsArg(0);
			binLs.execute([{text: testPath}], [{name: 'l'}], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.false;
				expect(wasChanged).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array');
				expect(wasChanged.output.content).to.deep.equal(testResult);
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
		it('should add an object with the filename property matching each string member of the array returned by the command function and a classes property that is an array containing "autoColElement" to the return object\'s output.content array if the cmd call returns a non-empty array and options is not a non-empty array, or is an array that does not contain an object with name property that has value "l". In this calse, the return object should also have a classes property that is an array containing the string "autoCallContainer"', function(done) {
		
			var testPath = '/sunshine/and/rainbows';
			var testArray = [
				'raindrops',
				'whiskers',
				'kettles',
				'mittens'
			];
			var testResult = [
				{
					content: 'raindrops',
					classes: ['autoColElement']
				},
				{
					content: 'whiskers',
					classes: ['autoColElement']
				},
				{
					content: 'kettles',
					classes: ['autoColElement']
				},
				{
					content: 'mittens',
					classes: ['autoColElement']
				}
			];
			var resolvePathStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'resolvePath').returnsArg(0);
			var userFsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnEmptyArr(op, args, cb, isSudo) {
			
				return cb(false, testArray);
			
			});
			var parsePreStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'parsePre').returnsArg(0);
			binLs.execute([{text: testPath}], [], {}, testUser, function(error, wasChanged) {
			
				expect(error).to.be.false;
				expect(wasChanged).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array');
				expect(wasChanged.output.classes).to.be.an('array').that.contains('autoColContainer');
				expect(wasChanged.output.content).to.deep.equal(testResult);
				resolvePathStub.restore();
				userFsCmdStub.restore();
				done();
			
			}, false, 'fanciful');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binLs.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binLs.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
