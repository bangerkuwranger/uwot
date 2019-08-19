const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binCat;
const path = require('path');
const EOL = require('os').EOL;

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

describe('cat.js', function() {

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
		binCat = require('../routes/bin/cat');
	
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
	it('should be an object that is an instance of UwotCmdCat', function() {
	
		expect(binCat).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCat');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binCat).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binCat).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "cat"', function() {
	
			expect(binCat.command).to.have.property('name').that.equals('cat');
	
		});
		it('should have a property "description" that has value "Return filename portion of pathname."', function() {
	
			expect(binCat.command).to.have.property('description').that.equals('Concatenate and print files. The cat utility reads files sequentially, writing them to the output.  The file operands are processed in command-line order. Dash stdin and sockets are NOT supported.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "file"', function() {
	
			expect(binCat.command).to.have.property('requiredArguments').that.is.an('array').that.contains('file');
	
		});
		it('should have a property "optionalArguments" that is an array containing one element, "moreFiles"', function() {
	
			expect(binCat.command).to.have.property('optionalArguments').that.is.an('array').that.contains('moreFiles');
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binCat).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binCat.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Number the non-blank output lines, starting at 1, for all lines combined."', function() {
			
				expect(binCat.options[0]).to.be.an('object').with.property('description').that.equals('Number the non-blank output lines, starting at 1, for all lines combined.');
			
			});
			it('should have property "shortOpt" that has value "b"', function() {
			
				expect(binCat.options[0]).to.be.an('object').with.property('shortOpt').that.equals('b');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binCat.options[0]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binCat.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binCat.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[1]', function() {
		
			it('should be an object', function() {
			
				expect(binCat.options[1]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Number all output lines, starting at 1, for all lines combined."', function() {
			
				expect(binCat.options[1]).to.be.an('object').with.property('description').that.equals('Number all output lines, starting at 1, for all lines combined.');
			
			});
			it('should have property "shortOpt" that has value "n"', function() {
			
				expect(binCat.options[1]).to.be.an('object').with.property('shortOpt').that.equals('n');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binCat.options[1]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binCat.options[1]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binCat.options[1]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[2]', function() {
		
			it('should be an object', function() {
			
				expect(binCat.options[2]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Define the separator between concatenated files. Using this flag without an argument results in no separator being used. Without this flag, separator is server-os EOL character."', function() {
			
				expect(binCat.options[2]).to.be.an('object').with.property('description').that.equals('Define the separator between concatenated files. Using this flag without an argument results in no separator being used. Without this flag, separator is server-os EOL character.');
			
			});
			it('should have property "shortOpt" that has value "p"', function() {
			
				expect(binCat.options[2]).to.be.an('object').with.property('shortOpt').that.equals('p');
			
			});
			it('should have property "longOpt" that has value "sep"', function() {
			
				expect(binCat.options[2]).to.be.an('object').with.property('longOpt').that.equals('sep');
			
			});
			it('should have property "requiredArguments" that is an array with one element, "separator"', function() {
			
				expect(binCat.options[2]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.contains('separator');
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binCat.options[2]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/cat"', function() {
	
			expect(binCat).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/cat');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binCat).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binCat.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binCat.constructor(...argArr);
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
		
			expect(binCat.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binCat.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/cat/execute');
		
		});
		it('should return a TypeError to callback function if user fileSystem is invalid', function(done) {
		
			binCat.execute('args', [], {}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user fileSystem');
				done();
				
			}, false, null);
		
		});
		it('should call its instance method argsObjToNameArray with args if args is a non-empty array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [], {}, testUser, function(error, result) {
			
				expect(cmdArgsObjToNameArrayStub.calledWith([{text: 'file1'}, {text: 'file2'}])).to.be.true;
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should return an object to callback with an output property that is an object with property content that is an array if it does not return an error', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [], {}, testUser, function(error, result) {
			
				expect(result).to.be.an('object').with.property('output').that.is.an('object').with.property('content').that.is.an('array');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should call the cmd method of the instance user\'s fileSystem with args "cat", array of filenames from args with last element the string value of the "separator" value (default or from options), a callback function that processes the result, and the value of the isSudo arg', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [], {}, testUser, function(error, result) {
			
				expect(userfsCmdStub.called).to.be.true;
				var cmdArgs = userfsCmdStub.getCall(0).args;
				expect(cmdArgs[0]).to.equal('cat');
				expect(cmdArgs[1]).to.deep.equal(['file1', 'file2']);
				expect(cmdArgs[2]).to.be.a('function');
				expect(cmdArgs[3]).to.be.false;
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should use the string value of args[0] for an option with name matching p or sep if its options are an array with a string for the first value for the separator passed in the path array to cmd call', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"p","args":["separator"]}], {}, testUser, function(error, result) {
			
				expect(calledSeparator).to.equal('separator');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should use an empty string as the if a member of the options array that is an option with a name property "p" or "sep" does not have an array args property with a string for its first member', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"p"}], {}, testUser, function(error, result) {
			
				expect(calledSeparator).to.equal('');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should use os.EOL as the separator passed in the path array to the cmd call if options arg is not a non-empty array, or if there is not a member of the options array that is an option with a name property "p" or "sep"', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"b"}], {}, testUser, function(error, result) {
			
				expect(calledSeparator).to.equal(EOL);
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should return an error to callback if the cmd call returns an error to its callback', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnError(op, args, cb, isSudo) {
			
				return cb(new Error('test cmd error'));
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"b"}], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test cmd error');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should return an error to callback if the result of the cmd call is not a string', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Maecenas faucibus mollis interdum. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL + 'Duis mollis, est non commodo luctus, nisi erat porttitor ligula, eget lacinia odio sem nec elit. Sed posuere consectetur est at lobortis. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Nullam id dolor id nibh ultricies vehicula ut id elit. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Praesent commodo cursus magna, vel scelerisque nisl consectetur et.';
			var file2String = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Aenean lacinia bibendum nulla sed consectetur. Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec ullamcorper nulla non metus auctor fringilla.' + EOL + 'Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Maecenas faucibus mollis interdum. Fusce dapibus, tellus ac cursus commodo, tortor mauris condimentum nibh, ut fermentum massa justo sit amet risus. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnNull(op, args, cb, isSudo) {
			
				return cb(false, null);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"b"}], {}, testUser, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid paths');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should loop through each line in the returned string and add an object with tag property that equals "div" and content property that equals the string value of the current line to the end of the return object\'s output.content array if line is not empty (other than whitespace) and neither option "b" nor "n" is in options arg array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, ' + EOL + 'consectetur adipiscing elit. ' + EOL + EOL + 'Maecenas faucibus mollis interdum. ' + EOL + '    ' + EOL+ 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL;
			var file2String = 'Nil nunquam nihil est.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"p", args:[' null ']}], {}, testUser, function(error, result) {
			
				expect(result.output.content).to.be.an('array');
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('Lorem ipsum dolor sit amet, ');
				expect(result.output.content[0].tag).to.equal('div');
				expect(result.output.content[1]).to.be.an('object').with.property('content').that.equals('consectetur adipiscing elit. ');
				expect(result.output.content[1].tag).to.equal('div');
				expect(result.output.content[3]).to.be.an('object').with.property('content').that.equals('Maecenas faucibus mollis interdum. ');
				expect(result.output.content[3].tag).to.equal('div');
				expect(result.output.content[5]).to.be.an('object').with.property('content').that.equals('Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
				expect(result.output.content[5].tag).to.equal('div');
				expect(result.output.content[6]).to.be.an('object').with.property('content').that.equals(calledSeparator + 'Nil nunquam nihil est.');
				expect(result.output.content[6].tag).to.equal('div');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should loop through each line in the returned string and add an object with tag property that equals "br" to the end of the return object\'s output.content array if line is empty (other than whitespace) and neither option "b" nor "n" is in options arg array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, ' + EOL + 'consectetur adipiscing elit. ' + EOL + EOL + 'Maecenas faucibus mollis interdum. ' + EOL + '    ' + EOL+ 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL;
			var file2String = 'Nil nunquam nihil est.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name":"p", args:[' null ']}], {}, testUser, function(error, result) {
			
				expect(result.output.content).to.be.an('array');
				expect(result.output.content[2]).to.be.an('object').with.property('tag').that.equals('br');
				expect(result.output.content[4]).to.be.an('object').with.property('tag').that.equals('br');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should loop through each line in the returned string and add an object with tag property that equals "br" to the end of the return object\'s output.content array if line is empty (other than whitespace) and option "b" is in options arg array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, ' + EOL + 'consectetur adipiscing elit. ' + EOL + EOL + 'Maecenas faucibus mollis interdum. ' + EOL + '    ' + EOL+ 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL;
			var file2String = 'Nil nunquam nihil est.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name": "b"}, {"name": "p", args:[' null ']}], {}, testUser, function(error, result) {
			
				expect(result.output.content).to.be.an('array');
				expect(result.output.content[2]).to.be.an('object').with.property('tag').that.equals('br');
				expect(result.output.content[4]).to.be.an('object').with.property('tag').that.equals('br');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should loop through each line in the returned string and add an object with tag property that equals "div" and content property that equals an iterated line number, starting from "1", plus the current string value of the line to the end of the return object\'s output.content array if line is not empty (other than whitespace) and option "b" in options arg array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, ' + EOL + 'consectetur adipiscing elit. ' + EOL + EOL + 'Maecenas faucibus mollis interdum. ' + EOL + '    ' + EOL+ 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL;
			var file2String = 'Nil nunquam nihil est.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name": "b"}, {"name":"p", args:[' null ']}], {}, testUser, function(error, result) {
			
				expect(result.output.content).to.be.an('array');
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lorem ipsum dolor sit amet, ');
				expect(result.output.content[0].tag).to.equal('div');
				expect(result.output.content[1]).to.be.an('object').with.property('content').that.equals('2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;consectetur adipiscing elit. ');
				expect(result.output.content[1].tag).to.equal('div');
				expect(result.output.content[3]).to.be.an('object').with.property('content').that.equals('3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Maecenas faucibus mollis interdum. ');
				expect(result.output.content[3].tag).to.equal('div');
				expect(result.output.content[5]).to.be.an('object').with.property('content').that.equals('4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
				expect(result.output.content[5].tag).to.equal('div');
				expect(result.output.content[6]).to.be.an('object').with.property('content').that.equals('5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + calledSeparator + 'Nil nunquam nihil est.');
				expect(result.output.content[6].tag).to.equal('div');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
		it('should loop through each line in the returned string and add an object with tag property that equals "div" and content property that equals an iterated line number, starting from "1", plus the current string value of the line, to the end of the return object\'s output.content array whether or not line is empty and "n" is in options arg array', function(done) {
		
			var cmdArgsObjToNameArrayStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'argsObjToNameArray').callsFake(function returnTextArr(objArr) {
				
				return objArr.map((node) => {
				
					return node.text;
				
				});
			
			});
			var calledSeparator = EOL;
			var file1String = 'Lorem ipsum dolor sit amet, ' + EOL + 'consectetur adipiscing elit. ' + EOL + EOL + 'Maecenas faucibus mollis interdum. ' + EOL + '    ' + EOL+ 'Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.' + EOL;
			var file2String = 'Nil nunquam nihil est.';
			var userfsCmdStub = sinon.stub(global.Uwot.FileSystems[testUser._id], 'cmd').callsFake(function returnString(op, args, cb, isSudo) {
			
				var separator = args.pop();
				calledSeparator = separator;
				var concatStr = file1String + separator + file2String;
				return cb(false, concatStr);
			
			});
			binCat.execute([{text: 'file1'}, {text: 'file2'}], [{"name": "b"}, {"name": "n"}, {"name":"p", args:[' null ']}], {}, testUser, function(error, result) {
			
				expect(result.output.content).to.be.an('array');
				expect(result.output.content[0]).to.be.an('object').with.property('content').that.equals('1&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Lorem ipsum dolor sit amet, ');
				expect(result.output.content[0].tag).to.equal('div');
				expect(result.output.content[1]).to.be.an('object').with.property('content').that.equals('2&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;consectetur adipiscing elit. ');
				expect(result.output.content[1].tag).to.equal('div');
				expect(result.output.content[2]).to.be.an('object').with.property('content').that.equals('3&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
				expect(result.output.content[2].tag).to.equal('div');
				expect(result.output.content[3]).to.be.an('object').with.property('content').that.equals('4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Maecenas faucibus mollis interdum. ');
				expect(result.output.content[3].tag).to.equal('div');
				expect(result.output.content[4]).to.be.an('object').with.property('content').that.equals('5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    ');
				expect(result.output.content[4].tag).to.equal('div');
				expect(result.output.content[5]).to.be.an('object').with.property('content').that.equals('6&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;Morbi leo risus, porta ac consectetur ac, vestibulum at eros. Donec id elit non mi porta gravida at eget metus. Lorem ipsum dolor sit amet, consectetur adipiscing elit.');
				expect(result.output.content[5].tag).to.equal('div');
				expect(result.output.content[6]).to.be.an('object').with.property('content').that.equals('7&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;' + calledSeparator + 'Nil nunquam nihil est.');
				expect(result.output.content[6].tag).to.equal('div');
				cmdArgsObjToNameArrayStub.restore();
				userfsCmdStub.restore();
				done();
			
			}, false, 'flagsAreRare');
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binCat.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binCat.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
