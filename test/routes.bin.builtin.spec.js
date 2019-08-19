const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const path = require('path');
const binLoader = require('../helpers/binLoader');

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

describe('builtin.js', function() {

	var binBuiltin;
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
		binBuiltin = require('../routes/bin/builtin');
		if ('object' !== typeof global.Uwot.Bin.builtin || null === global.Uwot.Bin.builtin) {
		
			global.Uwot.Bin.builtin = binBuiltin;
		
		}
		if ('object' !== typeof global.Uwot.Bin.cd || null === global.Uwot.Bin.cd) {
		
			binBuiltin.loadBuiltins();
		
		}
	
	});
	describe('UwotCmdBuiltin', function() {
	
		it('should be an object that is an instance of UwotCmdBuiltin', function() {
	
			expect(binBuiltin).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdBuiltin');
	
		});
		it('should be an object that inherits from UwotCmd', function() {
	
			expect(binBuiltin).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(binBuiltin).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "builtin"', function() {
	
				expect(binBuiltin.command).to.have.property('name').that.equals('builtin');
	
			});
			it('should have a property "description" that has value "Return filename portion of pathname."', function() {
	
				expect(binBuiltin.command).to.have.property('description').that.equals('Run builtin commands in the running uwot process. This differs from ACTUAL shells in that most logical, memory, user, and process management builtins are implemented elsewhere (e.g. login/logout) or not implemented at all.');
	
			});
			it('should have a property "requiredArguments" that is an array with one value, "shell-builtin"', function() {
	
				expect(binBuiltin.command).to.have.property('requiredArguments').that.is.an('array').that.contains('shell-builtin');
	
			});
			it('should have a property "optionalArguments" that is an array with one value, "shell-builtin-args"', function() {
	
				expect(binBuiltin.command).to.have.property('optionalArguments').that.is.an('array').that.contains('shell-builtin-args');
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(binBuiltin).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(binBuiltin).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(binBuiltin).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
			it('should be a function', function() {
		
				expect(binBuiltin.constructor).to.be.a('function');
		
			});
			it('should accept three arguments and pass them to the parent class constructor'
		
	// 		, function() {
	// 		
	// 			var argArr = ['arg1', 'arg2', 'arg3'];
	// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
	// 			var bb2 = new binBuiltin.constructor(...argArr);
	// 			console.log(bb2)
	// 			expect(uwotCmdStub.called).to.be.true;
	// 		
	// 		}
		
			);
			it('should set call loadBuiltins to load cd, pwd, help, and printf to global.Uwot.Bin');
	
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
			afterEach(function() {
		
				sinon.restore;
		
			});
			it('should be a function', function() {
		
				expect(binBuiltin.execute).to.be.a('function');
		
			});
			it('should throw a TypeError if callback arg is not a function', function() {
		
				function throwError() {
			
					return binBuiltin.execute();
			
				};
				expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/builtin/execute');
		
			});
			it('should return the result of help to callback function if args is not a non-empty array and help does not return an error to callback', function(done) {
		
				var testResult = 'test help result';
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(false, testResult);
			
				});
				binBuiltin.execute(null, [], {}, {}, function(error, result) {
			
					expect(error).to.be.false;
					expect(result).to.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
			it('should return an error to callback function if args is not a non-empty array and help returns an error to callback', function(done) {
		
				var testResult = new Error('test help error');
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(testResult);
			
				});
				binBuiltin.execute([], [], {}, {}, function(error, result) {
			
					expect(error).to.deep.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
			it('should return the result of help to callback function if args is a non-empty array, args[0] is not an object with a string value for its text property, and help does not return an error to callback', function(done) {
		
				var testResult = 'test help result';
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(false, testResult);
			
				});
				binBuiltin.execute([null], [], {}, {}, function(error, result) {
			
					expect(error).to.be.false;
					expect(result).to.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
			it('should return an error to callback function if args is a non-empty array, args[0] is not an object with a string value for its text property, and help returns an error to callback', function(done) {
		
				var testResult = new Error('test help error');
				var helpStub = sinon.stub(binBuiltin, 'help').callsFake(function returnString(cb) {
			
					return cb(testResult);
			
				});
				binBuiltin.execute([{text: null}], [], {}, {}, function(error, result) {
			
					expect(error).to.deep.equal(testResult);
					helpStub.restore();
					done();
			
				}, false, null);
		
			});
		
			it('should return an error to callback function if args is a non-empty array and args[0] is an object with a string value for its text property that does not match one of [cd, pwd, help, printf]', function(done) {
		
				binBuiltin.execute([{text: 'notAValidBuiltin'}], [], {}, {}, function(error, result) {
			
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid builtin');
					done();
			
				}, false, null);
		
			});
			it('should return the value of the result of calling a valid builtin cmd if the first element in args contains an object with a text property matching a valid builtin name and the call completes without error', function(done) {
		
				const currentGlobalPwd = global.Uwot.Bin.pwd;
				global.Uwot.Bin.pwd = {
					execute(args, options, app, user, callback, isSudo, isid) {
					
						return callback(false, 'test pwd result')
					
					}
				}
				binBuiltin.execute([{text: 'pwd'}], [], {}, {}, function(error, result) {
			
					if (error || 'string' !== typeof result) {
					
						global.Uwot.Bin.pwd = currentGlobalPwd;
					
					}
					expect(error).to.be.false;
					expect(result).to.equal('test pwd result');
					global.Uwot.Bin.pwd = currentGlobalPwd;
					done();
			
				}, false, null);
		
			});
			it('should return an error if calling a valid builtin cmd returns an error and the first element in args contains an object with a text property matching a valid builtin name', function(done) {
		
				const currentGlobalPwd = global.Uwot.Bin.pwd;
				global.Uwot.Bin.pwd = {
					execute(args, options, app, user, callback, isSudo, isid) {
					
						return callback(new Error('test pwd error'))
					
					}
				}
				binBuiltin.execute([{text: 'pwd'}], [], {}, {}, function(error, result) {
			
					if (!error) {
					
						global.Uwot.Bin.pwd = currentGlobalPwd;
					
					}
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test pwd error');
					global.Uwot.Bin.pwd = currentGlobalPwd;
					done();
			
				}, false, null);
		
			});
			it('should return the value of the result of calling a valid builtin cmd with additional args if the first element in args contains an object with a text property matching a valid builtin name and args contains additional valid arg nodes beyond the builtin name', function(done) {
		
				const currentGlobalPwd = global.Uwot.Bin.pwd;
				global.Uwot.Bin.pwd = {
					execute(args, options, app, user, callback, isSudo, isid) {
					
						var argStr = '';
						for (let i = 0; i < args.length; i++) {
						
							if ('object' === typeof args[i] && null !== args[i] && 'string' === typeof args[i].text) {
							
								argStr += args[i].text;
							
							}
							if ((i + 1) >= args.length) {
							
								return callback(false, argStr);
							
							}
						
						}
					
					}
				}
				binBuiltin.execute([{text: 'pwd'}, {text: 'ready'}, {text: 'set'}, {text: 'go'}], [], {}, {}, function(error, result) {
			
					if (error || 'string' !== typeof result) {
					
						global.Uwot.Bin.pwd = currentGlobalPwd;
					
					}
					expect(error).to.be.false;
					expect(result).to.equal('readysetgo');
					global.Uwot.Bin.pwd = currentGlobalPwd;
					done();
			
				}, false, null);
		
			});
			it('should return the value of the result of calling a valid builtin cmd with options if the first element in args contains an object with a text property matching a valid builtin name and options contains valid option nodes', function(done) {
		
				const currentGlobalPwd = global.Uwot.Bin.pwd;
				global.Uwot.Bin.pwd = {
					execute(args, options, app, user, callback, isSudo, isid) {
					
						var optsStr = '';
						for (let i = 0; i < options.length; i++) {
						
							if ('object' === typeof options[i] && null !== options[i] && 'string' === typeof options[i].text) {
							
								optsStr += options[i].text;
							
							}
							if ((i + 1) >= options.length) {
							
								return callback(false, optsStr);
							
							}
						
						}
					
					}
				}
				binBuiltin.execute([{text: 'pwd'}], [{text: 'ready'}, {text: 'set'}, {text: 'go'}], {}, {}, function(error, result) {
			
					if (error || 'string' !== typeof result) {
					
						global.Uwot.Bin.pwd = currentGlobalPwd;
					
					}
					expect(error).to.be.false;
					expect(result).to.equal('readysetgo');
					global.Uwot.Bin.pwd = currentGlobalPwd;
					done();
			
				}, false, null);
		
			});
	
		});
		describe('help(callback)', function() {
	
			afterEach(function() {
		
				sinon.restore();
		
			});
			it('should be a function', function() {
		
				expect(binBuiltin.help).to.be.a('function');
		
			});
			it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
				var argArr = ['arg1', 'arg2', 'arg3'];
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
					return cb(false, argArr);
			
				});
				binBuiltin.help(function(error, result) {
			
					expect(uwotCmdHelpStub.called).to.be.true;
					expect(result).to.deep.equal(argArr);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
			it('should return an error if calling the parent class method "help" with the passed value from callback arg returns an error', function(done) {
		
				var helpError = new Error('test help error');
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnErr(cb) {
			
					return cb(helpError);
			
				});
				binBuiltin.help(function(error, result) {
			
					expect(error).to.deep.equal(helpError);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
			it('should return an object with an output property containing a message indicating help isn\'t working if calling the parent class method "help" with the passed value from callback arg does not return an error or a non-null object to callback', function(done) {
		
				var testResult = 'there\'s no fixing stupid.';
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnStr(cb) {
			
					return cb(false, testResult);
			
				});
				binBuiltin.help(function(error, result) {
			
					expect(result).to.be.an('object').with.property('output').that.equals('*** Help system currently unavailable. ***');
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
		
	
		});

	});
	describe('UwotCmdCd', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdCd();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdCd is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.cd).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "cd"', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('name').that.equals('cd');
	
			});
			it('should have a property "description" that has value "Change working directory."', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('description').that.equals('Change working directory.');
	
			});
			it('should have a property "requiredArguments" that is an array with one value, "directory"', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('requiredArguments').that.is.an('array').that.contains('directory');
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.cd.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.cd).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			afterEach(function() {
			
				sinon.restore();
			
			});
			after(function() {
			
				removeTestUserFS();
			
			});
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback arg is not a function', function() {
			
				function throwError() {
				
					return global.Uwot.Bin.cd.execute([{type: 'Word', text: '/salmonella'}], [], {}, {}, null, false, 'blueberries');
				
				}
				expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/builtin/cd/execute');
			
			});
			it('should call its own/inherited method argsObjToNameArray with args if args is an object', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(new Error('test cmd error'));
				
				});
				global.Uwot.Bin.cd.execute([{type: 'Word', text: '/salmonella'}], [], {}, testUser, function(error, result) {
				
					expect(cmdArgsObjToNameArrayStub.called).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should call the cmd method of the global filesystem for the passed user\'s _id with args "cd" and null if args is not an object', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(new Error('test cmd error'));
				
				});
				global.Uwot.Bin.cd.execute('/salmonella', [], {}, testUser, function(error, result) {
				
					expect(fsCmdStub.called).to.be.true;
					var cmdCall = fsCmdStub.getCall(0);
					expect(cmdCall.args[0]).to.equal('cd');
					expect(cmdCall.args[1]).to.be.null;
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should call the cmd method of the global filesystem for the passed user\'s _id with args "cd" and the result of argsObjToNameArray if args is an object', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/salmonella';
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnSecondArg(op, args, cb) {
				
					return cb(false, args[1]);
				
				});
				var fsGetVcwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getVcwd').returns(testPath);
				global.Uwot.Bin.cd.execute([{type: 'Word', text: testPath}], [], {}, testUser, function(error, result) {
				
					expect(fsCmdStub.called).to.be.true;
					var cmdCall = fsCmdStub.getCall(0);
					expect(cmdCall.args[0]).to.equal('cd');
					expect(cmdCall.args[1]).to.deep.equal([testPath]);
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					fsGetVcwdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should return an error to callback if the cmd call returns an error to callback', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(new Error('test cmd error'));
				
				});
				global.Uwot.Bin.cd.execute('/salmonella', [], {}, testUser, function(error, result) {
				
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test cmd error');
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should call the getVcwd method of the global filesystem for "user"', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/salmonella';
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnSecondArg(op, args, cb) {
				
					return cb(false, args[1]);
				
				});
				var fsGetVcwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getVcwd').returns(testPath);
				global.Uwot.Bin.cd.execute([{type: 'Word', text: testPath}], [], {}, testUser, function(error, result) {
				
					expect(fsGetVcwdStub.called).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					fsGetVcwdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should return an object with a cwd value matching the result of getVcwd, and an output property value containing both "changed directory to " and the result of getVcwd', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/salmonella';
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnSecondArg(op, args, cb) {
				
					return cb(false, args[1]);
				
				});
				var fsGetVcwdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'getVcwd').returns(testPath);
				global.Uwot.Bin.cd.execute([{type: 'Word', text: testPath}], [], {}, testUser, function(error, result) {
				
					expect(fsGetVcwdStub.called).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					fsCmdStub.restore();
					fsGetVcwdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.cd.help).to.be.a('function');
			
			});
			it('should call the parent class method help', function(done) {
		
				var argArr = ['arg1', 'arg2', 'arg3'];
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
					return cb(false, argArr);
			
				});
				global.Uwot.Bin.cd.help(function(error, result) {
			
					expect(uwotCmdHelpStub.called).to.be.true;
					expect(result).to.deep.equal(argArr);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
		
		});
	
	});
	describe('UwotCmdPwd', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdPwd();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdPwd is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.pwd).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "pwd"', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('name').that.equals('pwd');
	
			});
			it('should have a property "description" that has value "Print working directory to console."', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('description').that.equals('Print working directory to console.');
	
			});
			it('should have a property "requiredArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('requiredArguments').that.is.an('array').that.is.empty;
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.pwd).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			afterEach(function() {
			
				sinon.restore();
			
			});
			after(function() {
			
				removeTestUserFS();
			
			});
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				function throwError() {
				
					return global.Uwot.Bin.pwd.execute([], [], {}, {}, null, false, 'tanqueray');
				
				}
				expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/builtin/pwd/execute');
			
			});
			it('should call the cmd method of the global filesystem for "user" with "pwd" as the first argument', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/tonic/lime';
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(new Error('test cmd error'));
				
				});
				global.Uwot.Bin.pwd.execute([], [], {}, testUser, function(error, result) {
				
					expect(fsCmdStub.called).to.be.true;
					var cmdCall = fsCmdStub.getCall(0);
					expect(cmdCall.args[0]).to.equal('pwd');
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should return an error to callback if calling cmd("pwd", ...) returns an error to its callback', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/tonic/lime';
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(new Error('test cmd error'));
				
				});
				global.Uwot.Bin.pwd.execute([], [], {}, testUser, function(error, result) {
				
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test cmd error');
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
			it('should return a string to the second arg of callback if calling cmd("pwd", ...) returns without error', function(done) {
			
				var testUser = getTestUser();
				createTestUserFS();
				var testPath = '/tonic/lime';
				var fsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb) {
				
					return cb(false, testPath);
				
				});
				global.Uwot.Bin.pwd.execute([], [], {}, testUser, function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal(testPath);
					fsCmdStub.restore();
					done();
				
				}, false, 'blueberries');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.help).to.be.a('function');
			
			});
			it('should call the parent class method help', function(done) {
		
				var argArr = ['arg1', 'arg2', 'arg3'];
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
					return cb(false, argArr);
			
				});
				global.Uwot.Bin.pwd.help(function(error, result) {
			
					expect(uwotCmdHelpStub.called).to.be.true;
					expect(result).to.deep.equal(argArr);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
		
		});
	
	});
	describe('UwotCmdHelp', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdHelp();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdHelp is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.help).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "help"', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('name').that.equals('help');
	
			});
			it('should have a property "description" that has value "Display helpful information about builtin commands."', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('description').that.equals('Display helpful information about builtin commands.');
	
			});
			it('should have a property "requiredArguments" that is an array with one element, "pattern"', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('requiredArguments').that.is.an('array').that.contains('pattern');
	
			});
			it('should have a property "optionalArguments" that is an empty array', function() {
	
				expect(global.Uwot.Bin.help.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.help).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			afterEach(function() {
			
				sinon.restore();
			
			});
			after(function() {
			
				removeTestUserFS();
			
			});
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				function throwError() {
				
					return global.Uwot.Bin.help.execute([], [], {}, {}, null, false, 'tanqueray');
				
				}
				expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/builtin/help/execute');
			
			});
			it('should call its help method and return the result to callback if args is not a non-empty array with a first member that is an object with property "text" that is a string', function(done) {
		
				var testResult = 'test help result';
				var helpStub = sinon.stub(global.Uwot.Bin.help, 'help').callsFake(function returnString(cb) {
			
					return cb(false, testResult);
			
				});
				global.Uwot.Bin.help.execute('null', [], {}, {}, function(error, result) {
			
					expect(error).to.be.false;
					expect(result).to.equal(testResult);
					global.Uwot.Bin.help.execute(null, [], {}, {}, function(error, result) {
			
						expect(error).to.be.false;
						expect(result).to.equal(testResult);
						global.Uwot.Bin.help.execute([], [], {}, {}, function(error, result) {
			
							expect(error).to.be.false;
							expect(result).to.equal(testResult);
							global.Uwot.Bin.help.execute(['null'], [], {}, {}, function(error, result) {
			
								expect(error).to.be.false;
								expect(result).to.equal(testResult);
								global.Uwot.Bin.help.execute([null], [], {}, {}, function(error, result) {
			
									expect(error).to.be.false;
									expect(result).to.equal(testResult);
									global.Uwot.Bin.help.execute([{text: null}], [], {}, {}, function(error, result) {
			
										expect(error).to.be.false;
										expect(result).to.equal(testResult);
										helpStub.restore();
										done();
			
									}, false, null);
			
								}, false, null);
			
							}, false, null);
			
						}, false, null);
			
					}, false, null);
			
				}, false, null);
		
			});
			it('should call parent class method argsObjToNameArray with args if args is a non-empty array with a first member that is a string', function(done) {
			
				var testUser = getTestUser();
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var binLoaderIsValidBinStub = sinon.stub(binLoader, 'isValidBin').callsFake(function returnFalse(binName) {
				
					return false;
				
				});
				global.Uwot.Bin.help.execute([{type: 'Word', text: 'pwd'}], [], {}, testUser, function(error, result) {
				
					expect(cmdArgsObjToNameArrayStub.called).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					binLoaderIsValidBinStub.restore();
					done();
				
				}, false, 'glenlivet');
			
			});
			it('should call binLoader method isValidBin on the text value of the first member of args and return the result of calling the global bin with the text value of the first member of args to callback if isValidBin is true', function(done) {
			
				var testUser = getTestUser();
				var testResult = 'test pwd help';
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var binLoaderIsValidBinStub = sinon.stub(binLoader, 'isValidBin').callsFake(function returnTrue(binName) {
				
					return true;
				
				});
				var globalBinPwdHelpStub = sinon.stub(global.Uwot.Bin.pwd, 'help').callsFake(function returnString(cb) {
				
					return cb(false, testResult);
				
				});
				global.Uwot.Bin.help.execute([{type: 'Word', text: 'pwd'}], [], {}, testUser, function(error, result) {
				
					expect(binLoaderIsValidBinStub.called).to.be.true;
					expect(binLoaderIsValidBinStub.calledWith('pwd')).to.be.true;
					expect(globalBinPwdHelpStub.called).to.be.true;
					expect(result).to.equal(testResult);
					expect(error).to.be.false;
					cmdArgsObjToNameArrayStub.restore();
					binLoaderIsValidBinStub.restore();
					globalBinPwdHelpStub.restore();
					done();
				
				}, false, 'glenlivet');
			
			});
			it('should call binLoader method isValidBin on the text value of the first member of args and return an error to callback if isValidBin is false', function(done) {
			
				var testUser = getTestUser();
				var testResult = 'test pwd help';
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var binLoaderIsValidBinStub = sinon.stub(binLoader, 'isValidBin').callsFake(function returnFalse(binName) {
				
					return false;
				
				});
				global.Uwot.Bin.help.execute([{type: 'Word', text: 'pwd'}], [], {}, testUser, function(error, result) {
				
					expect(binLoaderIsValidBinStub.called).to.be.true;
					expect(binLoaderIsValidBinStub.calledWith('pwd')).to.be.true;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid command: pwd');
					cmdArgsObjToNameArrayStub.restore();
					binLoaderIsValidBinStub.restore();
					done();
				
				}, false, 'glenlivet');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.help).to.be.a('function');
			
			});
			it('should call the parent class method help', function(done) {
		
				var argArr = ['arg1', 'arg2', 'arg3'];
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
					return cb(false, argArr);
			
				});
				global.Uwot.Bin.help.help(function(error, result) {
			
					expect(uwotCmdHelpStub.called).to.be.true;
					expect(result).to.deep.equal(argArr);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
		
		});
	
	});
	describe('UwotCmdPrintf', function() {
	
		it('should not be accessible from exports', function() {
		
			function throwError() {
			
				return new UwotCmdPrintf();
			
			};
			expect(throwError).to.throw(ReferenceError, 'UwotCmdPrintf is not defined');
		
		});
		it('should inherit from UwotCmd', function() {
	
			expect(global.Uwot.Bin.printf).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
		});
		describe('command', function() {
	
			it('should be an object that is an instance of UwotCmdCommand', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
			});
			it('should have a property "name" that has value "printf"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('name').that.equals('printf');
	
			});
			it('should have a property "description" that has value "Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process. Some automatic formatting placeholders will use the more complex rather than "most appropriate" method to determine input/output settings for transforming value. Specifically, %i and %d both attempt to automatically select the radix on input, and both %e and %g only use exponential notation in output."', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('description').that.equals('Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process. Some automatic formatting placeholders will use the more complex rather than "most appropriate" method to determine input/output settings for transforming value. Specifically, %i and %d both attempt to automatically select the radix on input, and both %e and %g only use exponential notation in output.');
	
			});
			it('should have a property "requiredArguments" that is an array with one element, "format"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('requiredArguments').that.is.an('array').that.contains('format');
	
			});
			it('should have a property "optionalArguments" that is an array with one element, "arguments"', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('optionalArguments').that.is.an('array').that.contains('arguments');
	
			});
	
		});
		describe('options', function() {
	
			it('should have a value that is an empty array', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('options').that.is.an('array').that.is.empty;
	
			});
	
		});
		describe('path', function() {
	
			it('should have a string value that is an absolute path to the application root and "routes/bin/builtin"', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/builtin');
	
			});
	
		});
		describe('listenerSettings', function() {
	
			it('should have a value that is false', function() {
	
				expect(global.Uwot.Bin.printf).to.have.property('listenerSettings').that.is.false;
	
			});
	
		});
		describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.constructor).to.be.a('function');
			
			});
		
		});
		describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
		
			afterEach(function() {
			
				sinon.restore();
			
			});
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				function throwError() {
				
					return global.Uwot.Bin.printf.execute([], [], {}, getTestUser(), null, false, 'triboro');
				
				}
				expect(throwError).to.throw(TypeError, 'invalid callback passed to printf');
			
			});
			it('should return the results of its instance help method to callback if args is not an array with an object that has a string value for its text property as its first member', function(done) {
			
				var helpStub = sinon.stub(global.Uwot.Bin.printf, 'help').callsFake(function returnString(cb) {
				
					return cb(false, 'test help output');
				
				});
				global.Uwot.Bin.printf.execute('args', [], {}, getTestUser(), function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('test help output');
					global.Uwot.Bin.printf.execute(null, [], {}, getTestUser(), function(error, result) {
			
						expect(error).to.be.false;
						expect(result).to.equal('test help output');
						global.Uwot.Bin.printf.execute(['args'], [], {}, getTestUser(), function(error, result) {
				
							expect(error).to.be.false;
							expect(result).to.equal('test help output');
							global.Uwot.Bin.printf.execute([{text: null}], [], {}, getTestUser(), function(error, result) {
			
								expect(error).to.be.false;
								expect(result).to.equal('test help output');
								helpStub.restore();
								done();
			
							}, false, 'triboro');
				
						}, false, 'triboro');
			
					}, false, 'triboro');
				
				}, false, 'triboro');
			
			});
			it('should return an Error to callback if the first member of args is not a valid argument node', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return [];
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(error).to.be.an.instanceof(Error).with.property('message').that.contains('invalid format: ');
					cmdArgsObjToNameArrayStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should call the parent class method argsObjToNameArray with the value of args', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return [];
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(cmdArgsObjToNameArrayStub.called).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should call stripQuotes on the first element in argsArray if args is valid', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(stripQuotesStub.calledWith(testFormat)).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should call unescapeString on the result of calling stripQuotes on the text value of the first element in args if args is valid', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(unescapeStringStub.calledWith('stripQuotes(' + testFormat + ')')).to.be.true;
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should return the result of calling stripQuotes and unescapeString on the text value of the first member of args array if it is a string that does not contain the "%" character', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen hairs on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(result).to.equal("unescapeString(stripQuotes(Fifteen hairs on a dead man\\'s chest))");
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should loop through each character in the text value of the first member of args, calling replaceSub with the each character following a "%" character', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s chest";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(result).to.equal("unescapeString(stripQuotes(Fifteen rs(s, squirrels) on a dead man\\'s chest))");
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should return an Error to callback if the result of any call to replaceSub returns an Error', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					if (arr.length < 1 ) {
					
						return new Error('unexpected format placeholder %' + rsChar.toString());
					
					}
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s %s";
				var testSub = 'squirrels';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}], [], {}, getTestUser(), function(error, result) {

					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals("unexpected format placeholder %s");
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			it('should replace any valid placeholder with the string result of replaceSub in the final string and return the final string to callback if replaceSub calls do not return any errors', function(done) {
			
				var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
					return objArr.map((node) => {
					
						return node.text;
					
					});
				
				});
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				var replaceSubStub = sinon.stub(global.Uwot.Bin.printf, 'replaceSub').callsFake(function addRSName(rsChar, arr) {
				
					if (arr.length < 1 ) {
					
						return new Error('unexpected format placeholder %' + rsChar.toString());
					
					}
					return 'rs(' + rsChar + ', ' +  arr.shift() + ')';
				
				});
				var testFormat = "Fifteen %s on a dead man\\'s %s";
				var testSub = 'squirrels';
				var testSub2 = 'tree';
				global.Uwot.Bin.printf.execute([{text: testFormat}, {text: testSub}, {text: testSub2}], [], {}, getTestUser(), function(error, result) {

					expect(error).to.be.false;
					expect(result).to.equal("unescapeString(stripQuotes(Fifteen rs(s, squirrels) on a dead man\\'s rs(s, tree)))")
					cmdArgsObjToNameArrayStub.restore();
					stripQuotesStub.restore();
					unescapeStringStub.restore();
					replaceSubStub.restore();
					done();

				}, false, 'triboro');
			
			});
			
			
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.help).to.be.a('function');
			
			});
			it('should call the parent class method help', function(done) {
		
				var argArr = ['arg1', 'arg2', 'arg3'];
				var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
					return cb(false, argArr);
			
				});
				global.Uwot.Bin.printf.help(function(error, result) {
			
					expect(uwotCmdHelpStub.called).to.be.true;
					expect(result).to.deep.equal(argArr);
					uwotCmdHelpStub.restore();
					done();
			
				});
		
			});
		
		});
		describe('stripQuotes(quotedStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.stripQuotes).to.be.a('function');
			
			});
			it('should return value of quotedStr arg unchanged if it is not a string', function() {
			
				var testArg = ['"fanciful unicorns"'];
				expect(global.Uwot.Bin.printf.stripQuotes(testArg)).to.deep.equal(testArg);
			
			});
			it('should return value of quotedStr arg with the first and last characters removed if they are both double-quote chars', function() {
			
				var testArg = '"fanciful unicorns"';
				var testResult = 'fanciful unicorns';
				expect(global.Uwot.Bin.printf.stripQuotes(testArg)).to.equal(testResult);
			
			});
			it('should return value of quotedStr arg with the first and last characters removed if they are both single-quote chars', function() {
			
				var testArg = "'fanciful unicorns'";
				var testResult = 'fanciful unicorns';
				expect(global.Uwot.Bin.printf.stripQuotes(testArg)).to.equal(testResult);
			
			});
			it('should return value of quotedStr arg unchanged if first and last chars are neither both double- or single-quotes', function() {
			
				var testArg1 = 'fanciful unicorns';
				var testArg2 = '\'fanciful unicorns"';
				var testArg3 = '"fanciful unicorns\'';
				var testArg4 = '\'fanciful unicorns';
				var testArg5 = 'fanciful unicorns\'';
				var testArg6 = 'fanciful unicorns"';
				var testArg7 = '"fanciful unicorns';
				expect(global.Uwot.Bin.printf.stripQuotes(testArg1)).to.equal(testArg1);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg2)).to.equal(testArg2);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg3)).to.equal(testArg3);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg4)).to.equal(testArg4);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg5)).to.equal(testArg5);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg6)).to.equal(testArg6);
				expect(global.Uwot.Bin.printf.stripQuotes(testArg7)).to.equal(testArg7);
			
			});
		
		});
		describe('unescapeString(escStr)', function() {
		
			var testArg = 'trailing the \\$, \\n\\r c:run\\\\bin\\\\ \\#bitcoin\\> still \\"trending\\",\\tdespite loss \\& currently \\\'\\<\\\'\\? ';
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unescapeString).to.be.a('function');
			
			});
			it('should return value of escStr arg unchanged if it is not a string', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString([testArg]);
				expect(testResult).to.be.an('array');
				expect(testResult[0]).to.equal(testArg);
			
			});
			it('should return the value of escStr with all instances of "\\\\" replaced with "&bsol;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('c:run&bsol;bin&bsol;');
			
			});
			it('should return the value of escStr with all instances of "\\n" replaced with "&NewLine;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain(', &NewLine; ');
			
			});
			it('should return the value of escStr with all instances of "\\r" replaced with ""', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain(', &NewLine; ');
			
			});
			it('should return the value of escStr with all instances of "\\t" replaced with "&Tab;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain(',&Tab;despite');
			
			});
			it('should return the value of escStr with all instances of "\\\"" replaced with "&quot;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('&quot;trending&quot;');
			
			});
			it('should return the value of escStr with all instances of "\\\'" replaced with "&apos;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('&apos;&lt;&apos;');
			
			});
			it('should return the value of escStr with all instances of "\\?" replaced with "&quest;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('&apos;&lt;&apos;&quest;');
			
			});
			it('should return the value of escStr with all instances of "\\#" replaced with "&num;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('&num;bitcoin');
			
			});
			it('should return the value of escStr with all instances of "\\$" replaced with "&dollar"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('trailing the &dollar;,');
			
			});
			it('should return the value of escStr with all instances of "\\<" replaced with "&lt;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('currently &apos;&lt;');
			
			});
			it('should return the value of escStr with all instances of "\\>" replaced with "&gt;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('bitcoin&gt;');
			
			});
			it('should return the value of escStr with all instances of "\\&" replaced with "&amp;"', function() {
			
				var testResult = global.Uwot.Bin.printf.unescapeString(testArg);
				expect(testResult).to.contain('loss &amp; currently');
			
			});
		
		});
		describe('unsDecNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsDecNum).to.be.a('function');
			
			});
			it('should return an unsigned decimal representation of inputStr arg value', function() {
			
				testArgs = [
					'-9000',
					'9001',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.unsDecNum(ta); });
				expect(testResults[0]).to.equal('9000');
				expect(testResults[1]).to.equal('9001');
				expect(testResults[2]).to.equal('0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('3.141592653589793');
				expect(testResults[5]).to.equal('2.718281828459045');
				expect(testResults[6]).to.equal('0');
				
			
			});
		
		});
		describe('sigDecNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.sigDecNum).to.be.a('function');
			
			});
			it('should return a signed decimal representation of inputStr arg value', function() {
			
				testArgs = [
					'-9000',
					'9001',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.sigDecNum(ta); });
				expect(testResults[0]).to.equal('-9000');
				expect(testResults[1]).to.equal('9001');
				expect(testResults[2]).to.equal('0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('-3.141592653589793');
				expect(testResults[5]).to.equal('2.718281828459045');
				expect(testResults[6]).to.equal('0');
				
			
			});
		
		});
		describe('unsOctNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsOctNum).to.be.a('function');
			
			});
			it('should return an unsigned octal representation of inputStr arg value', function() {
			
				testArgs = [
					'-9000',
					'9001',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.unsOctNum(ta); });
				expect(testResults[0]).to.equal('21450');
				expect(testResults[1]).to.equal('21451');
				expect(testResults[2]).to.equal('372');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('3');
				expect(testResults[5]).to.equal('2');
				expect(testResults[6]).to.equal('377');
				
			
			});
		
		});
		describe('unsHexNum(inputStr, casing)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsHexNum).to.be.a('function');
			
			});
			it('should return an unsigned hexadecimal representation of inputStr arg value with lowercase alpha chars if casing arg is not a string that equals "upper"', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.unsHexNum(ta); });
				expect(testResults[0]).to.equal('15f90');
				expect(testResults[1]).to.equal('400');
				expect(testResults[2]).to.equal('fa');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('3.243f6a8885a3');
				expect(testResults[5]).to.equal('2.b7e151628aed2');
				expect(testResults[6]).to.equal('ff');
				
			
			});
			it('should return an unsigned hexadecimal representation of inputStr arg value with uppercase alpha chars if casing arg equals "upper"', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.unsHexNum(ta, 'upper'); });
				expect(testResults[0]).to.equal('15F90');
				expect(testResults[1]).to.equal('400');
				expect(testResults[2]).to.equal('FA');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('3.243F6A8885A3');
				expect(testResults[5]).to.equal('2.B7E151628AED2');
				expect(testResults[6]).to.equal('FF');
				
			});
			it('should return "NaN" if inputStr value cannot be parsed to a number, even if casing is "upper"', function() {
			
				expect(global.Uwot.Bin.printf.unsHexNum('ta ta for now', 'upper')).to.equal('NaN');
			
			});
		
		});
		describe('floatNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.floatNum).to.be.a('function');
			
			});
			it('should return a signed 32-bit floating decimal representation of inputStr arg value', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.floatNum(ta); });
				expect(testResults[0]).to.equal('-90000');
				expect(testResults[1]).to.equal('1024');
				expect(testResults[2]).to.equal('0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('-3.1415927410125732');
				expect(testResults[5]).to.equal('2.7182817459106445');
				expect(testResults[6]).to.equal('0');
				
			});
		
		});
		describe('doubleNum(inputStr, sci, casing)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.doubleNum).to.be.a('function');
			
			});
			it('should return a signed 64-bit floating decimal representation of inputStr arg value if value of sci arg is not a boolean that is true', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.doubleNum(ta); });
				expect(testResults[0]).to.equal('-90000');
				expect(testResults[1]).to.equal('1024');
				expect(testResults[2]).to.equal('0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('-3.141592653589793');
				expect(testResults[5]).to.equal('2.718281828459045');
				expect(testResults[6]).to.equal('0');
				
			});
			it('should return a signed 64-bit floating decimal exponential representation with lowercase alpha chars of inputStr arg value if value of sci arg is a boolean that is true and casing arg value does not equal "upper"', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.doubleNum(ta, true); });
				expect(testResults[0]).to.equal('-9e+4');
				expect(testResults[1]).to.equal('1.024e+3');
				expect(testResults[2]).to.equal('0e+0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('-3.141592653589793e+0');
				expect(testResults[5]).to.equal('2.718281828459045e+0');
				expect(testResults[6]).to.equal('0e+0');
				
			});
			it('should return a signed 64-bit floating decimal exponential representation with uppercase alpha chars of inputStr arg value if value of sci arg is a boolean that is true and casing arg value does not equal "upper"', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.doubleNum(ta, true, 'upper'); });
				expect(testResults[0]).to.equal('-9E+4');
				expect(testResults[1]).to.equal('1.024E+3');
				expect(testResults[2]).to.equal('0E+0');
				expect(testResults[3]).to.equal('NaN');
				expect(testResults[4]).to.equal('-3.141592653589793E+0');
				expect(testResults[5]).to.equal('2.718281828459045E+0');
				expect(testResults[6]).to.equal('0E+0');
				
			});
			it('should return "NaN" if inputStr value cannot be parsed to a number, even if sci is true and casing is "upper"', function() {
			
				expect(global.Uwot.Bin.printf.unsHexNum('ta ta for now', 'upper')).to.equal('NaN');
			
			});
		
		});
		describe('charStr(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.charStr).to.be.a('function');
			
			});
			it('should throw a TypeError if value of inputStr is not a string, number, or boolean"', function() {
			
				function throwError() {
				
					return global.Uwot.Bin.printf.charStr(null);
				
				}
				expect(throwError).to.throw(TypeError, 'invalid inputStr passed to bin/builtin/printf/charStr');
			
			});
			it('should return the first character of inputStr arg value as a string, excluding whitespace, if value of inputStr is a string, number, or boolean"', function() {
			
				testArgs = [
					'-90000',
					'1024',
					'0xfam',
					'it is over',
					'-3.14159265358979323846264338327950288419716939937510582097494459230781640629',
					'2.71828182845904523536028747135266249775724709369995957496696762772407663035354759457138217852516643',
					'0xff',
					'         seventy-thousand	'
				]
				testResults = testArgs.map((ta) => { return global.Uwot.Bin.printf.charStr(ta); });
				expect(testResults[0]).to.equal('-');
				expect(testResults[1]).to.equal('1');
				expect(testResults[2]).to.equal('0');
				expect(testResults[3]).to.equal('i');
				expect(testResults[4]).to.equal('-');
				expect(testResults[5]).to.equal('2');
				expect(testResults[6]).to.equal('0');
				expect(testResults[7]).to.equal('s');
				
			});
		
		});
		describe('replaceSub(subPattern, argsArray)', function() {
		
			afterEach(function() {
			
				sinon.restore();
			
			});
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.replaceSub).to.be.a('function');
			
			});
			it('should return an Error if subPattern is not a valid replacement character', function() {
			
				var testArr = ['kablooey'];
				var testPattern = '8';
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.be.an.instanceof(Error).with.property('message').that.equals('unexpected format placeholder %8');
			
			});
			it('should return a string resulting from calling stripQuotes and then unescapeString on the first element of the argsArray argument if subPattern is "b"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'b';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unescapeStringStub = sinon.stub(global.Uwot.Bin.printf, 'unescapeString').callsFake(function addUSName(usString) {
				
					return 'unescapeString(' + usString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('unescapeString(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				unescapeStringStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes and then sigDecNum on the first element of the argsArray argument if subPattern is "i" or "d"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'i';
				var testArr2 = ['kablam'];
				var testPattern2 = 'd';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var sigDecNumStub = sinon.stub(global.Uwot.Bin.printf, 'sigDecNum').callsFake(function addSDNName(sdnString) {
				
					return 'sigDecNum(' + sdnString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('sigDecNum(stripQuotes(kablooey))');
				expect(global.Uwot.Bin.printf.replaceSub(testPattern2, testArr2)).to.equal('sigDecNum(stripQuotes(kablam))');
				stripQuotesStub.restore();
				sigDecNumStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes and then unsOctNum on the first element of the argsArray argument if subPattern is "o"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'o';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unsOctNumStub = sinon.stub(global.Uwot.Bin.printf, 'unsOctNum').callsFake(function addUONName(uonString) {
				
					return 'unsOctNum(' + uonString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('unsOctNum(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				unsOctNumStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes and then unsDecNum on the first element of the argsArray argument if subPattern is "u"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'u';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unsDecNumStub = sinon.stub(global.Uwot.Bin.printf, 'unsDecNum').callsFake(function addUDNName(udnString) {
				
					return 'unsDecNum(' + udnString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('unsDecNum(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				unsDecNumStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes and then unsHexNum on the first element of the argsArray argument if subPattern is "x"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'x';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unsHexNumStub = sinon.stub(global.Uwot.Bin.printf, 'unsHexNum').callsFake(function addUHNName(uhnString, casing) {
				
					var result = 'unsHexNum(' + uhnString + ')';
					return casing === "upper" ? result.toUpperCase() : result;
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('unsHexNum(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				unsHexNumStub.restore();
			
			});
			it('should return a string resulting from calling unsHexNum with the result of calling stripQuotes on the first element of the argsArray argument and "upper" if subPattern is "X"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'X';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var unsHexNumStub = sinon.stub(global.Uwot.Bin.printf, 'unsHexNum').callsFake(function addUHNName(uhnString, casing) {
				
					var result = 'unsHexNum(' + uhnString + ')';
					return casing === "upper" ? result.toUpperCase() : result;
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('UNSHEXNUM(STRIPQUOTES(KABLOOEY))');
				stripQuotesStub.restore();
				unsHexNumStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes and then floatNum on the first element of the argsArray argument if subPattern is "f"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'f';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var floatNumStub = sinon.stub(global.Uwot.Bin.printf, 'floatNum').callsFake(function addFNName(fnString) {
				
					return 'floatNum(' + fnString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('floatNum(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				floatNumStub.restore();
			
			});
			it('should return a string resulting from calling doubleNum with the result of calling stripQuotes on the first element of the argsArray argument and true if subPattern is "g" or "e"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'g';
				var testArr2 = ['kablam'];
				var testPattern2 = 'e';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var doubleNumStub = sinon.stub(global.Uwot.Bin.printf, 'doubleNum').callsFake(function addDNName(dnString, sci, casing) {
				
					if (sci) {
					
						dnString += 'e+0';
					
					}
					var result = 'doubleNum(' + dnString + ')';
					return casing === 'upper' ? result.toUpperCase() : result;
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('doubleNum(stripQuotes(kablooey)e+0)');
				expect(global.Uwot.Bin.printf.replaceSub(testPattern2, testArr2)).to.equal('doubleNum(stripQuotes(kablam)e+0)');
				stripQuotesStub.restore();
				doubleNumStub.restore();
			
			});
			it('should return a string resulting from calling doubleNum with the result of calling stripQuotes on the first element of the argsArray argument, true, and "upper" if subPattern is "G" or "E"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'G';
				var testArr2 = ['kablam'];
				var testPattern2 = 'E';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var doubleNumStub = sinon.stub(global.Uwot.Bin.printf, 'doubleNum').callsFake(function addDNName(dnString, sci, casing) {
				
					if (sci) {
					
						dnString += 'e+0';
					
					}
					var result = 'doubleNum(' + dnString + ')';
					return casing === 'upper' ? result.toUpperCase() : result;
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('DOUBLENUM(STRIPQUOTES(KABLOOEY)E+0)');
				expect(global.Uwot.Bin.printf.replaceSub(testPattern2, testArr2)).to.equal('DOUBLENUM(STRIPQUOTES(KABLAM)E+0)');
				stripQuotesStub.restore();
				doubleNumStub.restore();
			
			});
			it('should return a string resulting from calling charStr with the result of calling stripQuotes on the first element of the argsArray argument if subPattern is "c"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 'c';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				var charStrStub = sinon.stub(global.Uwot.Bin.printf, 'charStr').callsFake(function addCSName(csString) {
				
					return 'charStr(' + csString + ')';
				
				});
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('charStr(stripQuotes(kablooey))');
				stripQuotesStub.restore();
				charStrStub.restore();
			
			});
			it('should return a string resulting from calling stripQuotes on the first element of the argsArray argument if subPattern is "s"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = 's';
				var stripQuotesStub = sinon.stub(global.Uwot.Bin.printf, 'stripQuotes').callsFake(function addSQName(sqStr) {
				
					return 'stripQuotes(' + sqStr + ')';
				
				});
				
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('stripQuotes(kablooey)');
				stripQuotesStub.restore();
			
			});
			it('should return a string that contains the html entity for "%" if subPattern is "%"', function() {
			
				var testArr = ['kablooey'];
				var testPattern = '%';
				expect(global.Uwot.Bin.printf.replaceSub(testPattern, testArr)).to.equal('&percnt;');
			
			});
			
		});
	
	});

});
