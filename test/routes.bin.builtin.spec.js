const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

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
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should call the cmd method of the global filesystem for "user" with "pwd" as the first argument');
			it('should return an error to callback if calling cmd("pwd", ...) returns an error to its callback');
			it('should return a string to the second arg of callback if calling cmd("pwd", ...) returns without error');
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.pwd.help).to.be.a('function');
			
			});
			it('should call the parent class method help');
		
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
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should call its help method and return the result to callback if args is not a non-empty array with a first member that is a string');
			it('should call parent class method argsObjToNameArray with args if args is a non-empty array with a first member that is a string');
			it('should call binLoader method isValidBin on the text value of the first member of args and return the result of calling the global bin with the text value of the first member of args to callback if isValidBin is true');
			it('should call binLoader method isValidBin on the text value of the first member of args and return an error to callback if isValidBin is false');
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.help.help).to.be.a('function');
			
			});
			it('should call the parent class method help');
		
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
			it('should have a property "description" that has value "Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process."', function() {
	
				expect(global.Uwot.Bin.printf.command).to.have.property('description').that.equals('Write the formatted arguments to the standard output under the control of the format. Does NOT support modifiers or the following string placeholders: %q, %n, %a, %A, %(FORMAT)T. Additionally, all numeric conversions are limited by ES6 spec, and as such, will be limited to double precision and may be converted to 32bit integers in the process.');
	
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
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.execute).to.be.a('function');
			
			});
		
		});
		describe('help(callback)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.help).to.be.a('function');
			
			});
			it('should call the parent class method help');
		
		});
		describe('stripQuotes(quotedStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.stripQuotes).to.be.a('function');
			
			});
		
		});
		describe('unescapeString(escStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unescapeString).to.be.a('function');
			
			});
		
		});
		describe('unsDecNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsDecNum).to.be.a('function');
			
			});
		
		});
		describe('sigDecNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.sigDecNum).to.be.a('function');
			
			});
		
		});
		describe('unsOctNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsOctNum).to.be.a('function');
			
			});
		
		});
		describe('unsHexNum(inputStr, casing)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.unsHexNum).to.be.a('function');
			
			});
		
		});
		describe('floatNum(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.floatNum).to.be.a('function');
			
			});
		
		});
		describe('doubleNum(inputStr, casing, sci)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.doubleNum).to.be.a('function');
			
			});
		
		});
		describe('charStr(inputStr)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.charStr).to.be.a('function');
			
			});
		
		});
		describe('replaceSub(subPattern, argsArray)', function() {
		
			it('should be a function', function() {
			
				expect(global.Uwot.Bin.printf.replaceSub).to.be.a('function');
			
			});
		
		});
	
	});

});
