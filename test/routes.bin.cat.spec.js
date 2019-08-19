const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binCat;
const path = require('path');

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
