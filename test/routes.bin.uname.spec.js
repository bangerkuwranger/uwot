const globalSetupHelper = require('../helpers/globalSetup');
var Config = require('../config');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binUname;
const path = require('path');

describe('uname.js', function() {

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
		if('object' !== typeof global.Uwot.Config || 'function' !== typeof global.Uwot.Config.getConfigServerOrigin) {
		
			if ("development" !== global.process.env.NODE_ENV) {

				configPath = path.resolve(global.Uwot.Constants.etcProd, 'config.json');

			}
			else {

				configPath = path.resolve(global.Uwot.Constants.etcDev, 'config.json');

			}
			global.Uwot.Config = new Config(configPath);
		
		}
		binUname = require('../routes/bin/uname');
	
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
	it('should be an object that is an instance of UwotCmdUname', function() {
	
		expect(binUname).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdUname');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binUname).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binUname).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "uname"', function() {
	
			expect(binUname.command).to.have.property('name').that.equals('uname');
	
		});
		it('should have a property "description" that has value "Print system name. The uname utility writes symbols representing one or more system characteristics to the standard output."', function() {
	
			expect(binUname.command).to.have.property('description').that.equals('Print system name. The uname utility writes symbols representing one or more system characteristics to the standard output.');
	
		});
		it('should have a property "requiredArguments" that is an empty array', function() {
	
			expect(binUname.command).to.have.property('requiredArguments').that.is.an('array').that.is.empty;
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binUname.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binUname).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Output all strings from flags s, v, n, p, r, & m".', function() {
			
				expect(binUname.options[0]).to.be.an('object').with.property('description').that.equals('Output all strings from flags s, v, n, p, r, & m.');
			
			});
			it('should have property "shortOpt" that has value "a"', function() {
			
				expect(binUname.options[0]).to.be.an('object').with.property('shortOpt').that.equals('a');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[0]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[1]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[1]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print server hardware architecture."', function() {
			
				expect(binUname.options[1]).to.be.an('object').with.property('description').that.equals('Print server hardware architecture.');
			
			});
			it('should have property "shortOpt" that has value "m"', function() {
			
				expect(binUname.options[1]).to.be.an('object').with.property('shortOpt').that.equals('m');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[1]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[1]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[1]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[2]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[2]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print the network domain information."', function() {
			
				expect(binUname.options[2]).to.be.an('object').with.property('description').that.equals('Print the network domain information.');
			
			});
			it('should have property "shortOpt" that has value "n"', function() {
			
				expect(binUname.options[2]).to.be.an('object').with.property('shortOpt').that.equals('n');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[2]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[2]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[2]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[3]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[3]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print the runtime name."', function() {
			
				expect(binUname.options[3]).to.be.an('object').with.property('description').that.equals('Print the runtime name.');
			
			});
			it('should have property "shortOpt" that has value "p"', function() {
			
				expect(binUname.options[3]).to.be.an('object').with.property('shortOpt').that.equals('p');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[3]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[3]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[3]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[4]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[4]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print the runtime version."', function() {
			
				expect(binUname.options[4]).to.be.an('object').with.property('description').that.equals('Print the runtime version.');
			
			});
			it('should have property "shortOpt" that has value "r"', function() {
			
				expect(binUname.options[4]).to.be.an('object').with.property('shortOpt').that.equals('r');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[4]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[4]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[4]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[5]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[5]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print the system name."', function() {
			
				expect(binUname.options[5]).to.be.an('object').with.property('description').that.equals('Print the system name.');
			
			});
			it('should have property "shortOpt" that has value "s"', function() {
			
				expect(binUname.options[5]).to.be.an('object').with.property('shortOpt').that.equals('s');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[5]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[5]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[5]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
		describe('options[6]', function() {
		
			it('should be an object', function() {
			
				expect(binUname.options[6]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Print the system version."', function() {
			
				expect(binUname.options[6]).to.be.an('object').with.property('description').that.equals('Print the system version.');
			
			});
			it('should have property "shortOpt" that has value "v"', function() {
			
				expect(binUname.options[6]).to.be.an('object').with.property('shortOpt').that.equals('v');
			
			});
			it('should have property "longOpt" that has value ""', function() {
			
				expect(binUname.options[6]).to.be.an('object').with.property('longOpt').that.equals('');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binUname.options[6]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binUname.options[6]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/uname"', function() {
	
			expect(binUname).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/uname');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binUname).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binUname.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binUname.constructor(...argArr);
// 			console.log(bb2)
// 			expect(uwotCmdStub.called).to.be.true;
// 		
// 		}
		
		);
	
	});
	describe('execute(args, options, app, user, callback, isSudo, isid)', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(binUname.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binUname.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/uname/execute');
		
		});
		it('should return a string to callback if callback is valid', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string');
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that equals "Uwot" to callback if options is not a non-empty array', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.equal('Uwot');
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains "Uwot", global.Uwot.Constants.version, global.Uwot.Config.getConfigServerOrigin(), global.process.argv0, global.process.version, and global.process.arch if options is a non-empty array with a member that is an object with property name that equals "a"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'a'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains('Uwot');
				expect(result).to.contain(global.Uwot.Constants.version);
				expect(result).to.contain(testServerOrigin);
				expect(result).to.contain(global.process.argv0);
				expect(result).to.contain(global.process.version);
				expect(result).to.contain(global.process.arch);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains global.process.arch if options is a non-empty array with a member that is an object with property name that equals "m"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'm'}, {name: 's'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains(global.process.arch);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains global.Uwot.Config.getConfigServerOrigin() if options is a non-empty array with a member that is an object with property name that equals "n"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'n'}, {name: 's'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains(testServerOrigin);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains global.process.argv0 if options is a non-empty array with a member that is an object with property name that equals "p"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'p'}, {name: 's'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains(global.process.argv0);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains global.process.version if options is a non-empty array with a member that is an object with property name that equals "r"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'r'}, {name: 's'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains(global.process.version);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains "Uwot" if options is a non-empty array with a member that is an object with property name that equals "s"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 's'}, {name: 'r'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains('Uwot');
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return a string that contains global.Uwot.Constants.version if options is a non-empty array with a member that is an object with property name that equals "v"', function(done) {
		
			var testServerOrigin = "http://localhost:3000/";
			var getConfigServerOriginStub = sinon.stub(global.Uwot.Config, 'getConfigServerOrigin').returns(testServerOrigin);
			binUname.execute([], [{name: 'v'}, {name: 's'}], {}, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.be.a('string').that.contains(global.Uwot.Constants.version);
				getConfigServerOriginStub.restore();
				done();
			
			}, false, null);
		
		});
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binUname.help).to.be.a('function');
		
		});
		it('should return the result of calling the parent class method "help" with the passed value from callback arg', function(done) {
		
			var argArr = ['arg1', 'arg2', 'arg3'];
			var uwotCmdHelpStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'help').callsFake(function returnArgArr(cb) {
			
				return cb(false, argArr);
			
			});
			binUname.help(function(error, result) {
			
				expect(uwotCmdHelpStub.called).to.be.true;
				done();
			
			});
		
		});
	
	});

});
