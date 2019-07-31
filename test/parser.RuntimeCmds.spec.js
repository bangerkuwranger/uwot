const path = require('path');
const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const globalSetupHelper = require('../helpers/globalSetup');
const AbstractRuntime = require('../parser/AbstractRuntime');
const sanitize = require('../helpers/valueConversion');
const systemError = require('../helpers/systemError');
const ansiToText = require('../output/ansiToText');

const uid = require('uid-safe');

var att = {};
att.ansiToText = require('../output/ansiToText');

const RuntimeCmds = require('../parser/RuntimeCmds');

const getTestAst = function() {

	return {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					type: 'Word',
					text: 'invalid'
				}
			}
		]
	};

};
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
var testGuestUser;
const getTestGuest = function() {

	return Object.assign({}, testGuestUser);

}
const getTestExe = function() {

	return {
		isOp: false,
		type: 'Command',
		isSudo: false,
		name: 'invalid'
	};

};

describe('RuntimeCmds.js', function() {

	before('insure globals', function() {
	
		if ('object' !== typeof global.Uwot) {
		
			globalSetupHelper.initGlobalObjects;
		
		}
		if ('string' !== typeof global.Uwot.Constants.appRoot) {

			globalSetupHelper.initConstants();

		}
		if ('object' !== typeof global.Uwot.Config || 'UwotConfigBase' !== global.Uwot.Config.constructor.name) {
		
			globalSetupHelper.initEnvironment();
		
		}
		if ('function' !== typeof global.Uwot.Exports.Cmd || global.Uwot.Exports.Cmd.name !== 'UwotCmd') {

			global.Uwot.Exports.Cmd = require('../cmd');

		}
		if (-1 === Object.keys(global.Uwot.Bin).indexOf('sudo')) {
		
			global.Uwot.Bin.sudo = {
				command: {
					name: 'sudo',
					description: 'Allows user to run commands with elevated privileges.',
					requiredArguments: [],
					optionalArguments: []
				},
				options: [],
				path: global.Uwot.Constants.appRoot,
				execute: function execute(args, options, app, user, callback, isSudo) {
	
					return callback(
						false,
						{
							content: ['sudo what? sudo please...'],
							color: 'magenta'
						}
					);
	
				},
				help: function help(cb) {
	
					return cb(false, 'sudo &lt;command&gt; <br/> Either you can or you can\'t. There is no "maybe" in sudo.');
	
				},
				matchOpt: function matchOpt(opt) {
	
					return {
						name: '',
						isOpt: false,
						isLong: false,
						isDefined: false,
						hasArgs: false,
						reqArgs: [],
						optArgs: [],
						assignedArg: ''
					};
	
				}
			};
		
		}
		if (-1 === global.Uwot.Constants.reserved.indexOf('sudo')) {
		
			global.Uwot.Constants.reserved.push('sudo');
		
		}
		if (-1 === global.Uwot.Constants.reserved.indexOf('pwd')) {
		
			global.Uwot.Constants.reserved.push('pwd');
		
		}
		if (-1 === global.Uwot.Constants.reserved.indexOf('theme')) {
		
			global.Uwot.Constants.reserved.push('theme');
		
		}
		if (-1 === Object.keys(global.Uwot.Bin).indexOf('theme')) {
		
			global.Uwot.Bin.theme = require(path.resolve(global.Uwot.Constants.appRoot, 'routes/bin/theme'));
		
		}
		global.Uwot.Users.getGuest(function(error, guestUser) {

			testGuestUser = guestUser;
			return;

		});
		var fUid = getTestUser()._id;
		global.Uwot.FileSystems[fUid] = {
			resolvePath(path, exists) {
			
				return '/' + path;
			
			},
			append(file, text) {
			
				return text;
			
			},
			write(file, text) {
			
				return text;
			
			}
		};
	
	});
	after('remove global FS', function() {
	
		var fUid = getTestUser()._id;
		delete global.Uwot.FileSystems[fUid];
	
	});
	describe('UwotRuntimeCmds', function() {
	
		it('should implement AbstractRuntime', function() {
		
			var testRuntime;
			var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
			
				var exes = new Map();
				this.exes = exes;
				return exes;
			
			});
			testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
			expect(testRuntime).to.be.an.instanceof(AbstractRuntime);
			buildCommandsStub.restore();
		
		});
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(ast, user)', function() {
		
			it('should be a function', function() {
			
				expect(RuntimeCmds).to.be.a('function');
			
			});
			it('should throw a TypeError if passed ast arg value that is not an object with a type property equal to "Script" and a commands property that is not an object', function() {
			
				function testErrors(i) {
				
					if (i === 0) {
					
						return new RuntimeCmds('ast');
					
					}
					if (i === 1) {
					
						return new RuntimeCmds({type: 'ast', commands: {pwd: 'pwd'}});
					
					}
					if (i === 2) {
					
						return new RuntimeCmds({type: 'Script'});
					
					}
				
				}
				function test1() {
				
					return testErrors(0);
				
				}
				function test2() {
				
					return testErrors(1);
				
				}
				function test3() {
				
					return testErrors(2);
				
				}
				expect(test1).to.throw(TypeError, 'invalid ast node passed to UwotRuntimeCmds constructor');
				expect(test2).to.throw(TypeError, 'invalid ast node passed to UwotRuntimeCmds constructor');
				expect(test3).to.throw(TypeError, 'invalid ast node passed to UwotRuntimeCmds constructor');
			
			});
			it('should assign the value of the ast arg to its ast property', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.ast).to.deep.equal(getTestAst());
				buildCommandsStub.restore();
			
			});
			it('should assign the value of the user arg to its user property', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(JSON.stringify(testRuntime.user)).to.deep.equal(JSON.stringify(getTestUser()));
				buildCommandsStub.restore();
			
			});
			it('should assign false to its fx property if config setting users:allowShellFunctions is true, this.user.uName is a string, and user is a guest while config setting users:alloweGuestShellFunctions is false', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnFakeShellScriptConfig(cat, key) {
				
					if ('users' === cat) {
					
						if ('allowShellFunctions' === key) {
						
							return true;
						
						}
						if ('allowGuestShellFunctions' === key) {
						
							return false
						
						}
					
					}
					return global.Uwot.Config.nconf.get(cat + ':' + key);
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestGuest());
				expect(testRuntime.fx).to.be.false;
				buildCommandsStub.restore();
				configGetValStub.restore();
			
			});
			it('should initialize the fx property with an empty Map if users:allowShellFunctions is true and user is not a guest', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnFakeShellScriptConfig(cat, key) {
				
					if ('users' === cat) {
					
						if ('allowShellFunctions' === key) {
						
							return true;
						
						}
						if ('allowGuestShellFunctions' === key) {
						
							return false
						
						}
					
					}
					return global.Uwot.Config.nconf.get(cat + ':' + key);
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.fx).to.be.a('Map').that.is.empty;
				buildCommandsStub.restore();
				configGetValStub.restore();
			
			});
			it('should initialize the fx property with an empty Map if users:allowShellFunctions is true, users:allowGuestShellFunctions is true, users:allowGuest is true, and user is a guest', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnFakeShellScriptConfig(cat, key) {
				
					if ('users' === cat && ('allowShellFunctions' === key || 'allowGuestShellFunctions' === key) || 'allowGuest' === key) {
						
						return true;
					
					}
					return global.Uwot.Config.nconf.get(cat + ':' + key);
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestGuest());
				expect(testRuntime.fx).to.be.a('Map').that.is.empty;
				buildCommandsStub.restore();
				configGetValStub.restore();
			
			});
			it('should leave the fx property undefined if the config setting users:allowShellFunctions is false', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnFakeShellScriptConfig(cat, key) {
				
					if ('users' === cat && ('allowShellFunctions' === key || 'allowGuestShellFunctions' === key)) {
						
						return false;
					
					}
					return global.Uwot.Config.nconf.get(cat + ':' + key);
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestGuest());
				expect(testRuntime.fx).to.be.undefined;
				buildCommandsStub.restore();
				configGetValStub.restore();
			
			});
			it('should call its buildCommands method', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').callsFake(function returnFakeShellScriptConfig(cat, key) {
				
					if ('users' === cat && ('allowShellFunctions' === key || 'allowGuestShellFunctions' === key)) {
						
						return false;
					
					}
					return global.Uwot.Config.nconf.get(cat + ':' + key);
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(buildCommandsStub.called).to.be.true;
				buildCommandsStub.restore();
				configGetValStub.restore();
			
			});
		
		});
		describe('addAppInstance(app)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.addAppInstance).to.be.a('function');
			
			});
			it('should be inherited from AbstractRuntime', function() {
			
				expect(testRuntime.addAppInstance).to.deep.equal(AbstractRuntime.prototype.addAppInstance);
			
			});
			it('should assign the app arg value of the runtime instance to its app property', function() {
			
				var testApp = function() {return {isApp: true}; };
				testRuntime.addAppInstance(testApp)
				expect(testRuntime.app).to.deep.equal(testApp);
			
			});
		
		});
		describe('addInstanceSessionId(isid)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.addInstanceSessionId).to.be.a('function');
			
			});
			it('should be inherited from AbstractRuntime', function() {
			
				expect(testRuntime.addInstanceSessionId).to.deep.equal(AbstractRuntime.prototype.addInstanceSessionId);
			
			});
			it('should assign the isid arg value of the runtime instance to its isid property', function() {
			
				var testIsid = 'SBuXMoJxjj-uEDzF2gy0n8g6';
				testRuntime.addInstanceSessionId(testIsid)
				expect(testRuntime.isid).to.equal(testIsid);
			
			});
		
		});
		describe('buildCommands()', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {

				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				expect(testRuntime.buildCommands).to.be.a('function');
				parseCommandNodeStub.restore();
			
			});
			it('should initialize its exes property with an empty Map', function() {
			
				var noCommandsAst = {
					type: 'Script',
					commands: [
						{
							type: 'Command',
							name: {
								type: 'Word',
								text: 'invalid'
							}
						}
					]
				};
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
			
			});
			it('should loop through each node in this.ast.commands and set a Map value for an increasing integer key to the result of the parseCommandNode method called with the node as an arg', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
				expect(testRuntime.exes.get(0)).to.deep.equal(getTestExe());
			
			});
			it('should return the final value of the exes property', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				var testReturn = testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
				expect(testRuntime.exes).to.deep.equal(testReturn);
			
			});
		
		});
		describe('executeCommands(cb)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});

			it('should be a function', function() {
			
				expect(testRuntime.executeCommands).to.be.a('function');
			
			});
			it('should call the executeMap method with the exes property as the arg', function(done) {
			
				var executeMapStub = sinon.stub(testRuntime, 'executeMap').callsFake(function returnResults(exeMap, outputType) {
				
					return Promise.resolve({
						output: [
							'executeMapStub output'
						],
						operations: [],
						cookies: {}
					});
				
				});
				testRuntime.executeCommands(function(results) {
				
					expect(executeMapStub.called).to.be.true;
					expect(executeMapStub.calledWith(testRuntime.exes)).to.be.true;
					done();
				
				});
			
			});
			it('should then set the results of the executeMap method to the results property', function(done) {
			
				var executeMapStub = sinon.stub(testRuntime, 'executeMap').callsFake(function returnResults(exeMap, outputType) {
				
					return Promise.resolve({
						output: [
							'executeMapStub output'
						],
						operations: [],
						cookies: {}
					});
				
				});
				testRuntime.executeCommands(function(results) {
				
					expect(testRuntime.results).to.be.an('object').with.property('output').that.deep.equals(['executeMapStub output']);
					done();
				
				});
			
			});
			it('should return the results of the executeMap method call to the callback arg function', function(done) {
			
				var executeMapStub = sinon.stub(testRuntime, 'executeMap').callsFake(function returnResults(exeMap, outputType) {
				
					return Promise.resolve({
						output: [
							'executeMapStub output'
						],
						operations: [],
						cookies: {}
					});
				
				});
				testRuntime.executeCommands(function(results) {
				
					expect(results).to.be.an('object').with.property('output').that.deep.equals(['executeMapStub output']);
					done();
				
				});
			
			});
		
		});
		describe('parseCommandNode(astCmd, output, input)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parseCommandNode).to.be.a('function');
			
			});
			it('should throw a TypeError if astCmd is not an object with property type that is a string with value matching a member of global.Uwot.Constants.commandTypes', function() {
			
				var testAstCmd1 = 'QuizzicalExpression';
				var testAstCmd2 = {type: testAstCmd1};
				var testAstCmd3 = null;
				function throwError1() {
				
					return testRuntime.parseCommandNode(testAstCmd1);
				
				};
				function throwError2() {
				
					return testRuntime.parseCommandNode(testAstCmd2);
				
				};
				function throwError3() {
				
					return testRuntime.parseCommandNode(testAstCmd3);
				
				};
				expect(throwError1).to.throw(TypeError, 'invalid ast command node passed to parseCommandNode');
				expect(throwError2).to.throw(TypeError, 'invalid ast command node passed to parseCommandNode');
				expect(throwError3).to.throw(TypeError, 'invalid ast command node passed to parseCommandNode');
			
			});
			it('should return the value for this.parseCommand(astCmd, output, input) if astCmd.type is "Command"', function() {
			
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns('test parseCommand output');
				var testAstCmd = {type: 'Command'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseCommand output');
				parseCommandStub.restore();
			
			});
			it('should set output to null if arg is undefined', function() {
			
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(parseCommandStub.calledWith(testAstCmd, null, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should use output arg value if defined', function() {
			
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testOutput = 'test output';
				var returned = testRuntime.parseCommandNode(testAstCmd, testOutput);
				expect(parseCommandStub.calledWith(testAstCmd, testOutput, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should set input to null if arg is undefined', function() {
			
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testOutput = 'test output';
				var returned = testRuntime.parseCommandNode(testAstCmd, testOutput);
				expect(parseCommandStub.calledWith(testAstCmd, testOutput, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should use input arg value if defined', function() {
			
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testInput = 'test input';
				var returned = testRuntime.parseCommandNode(testAstCmd, null, testInput);
				expect(parseCommandStub.calledWith(testAstCmd, null, testInput)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should return the value of this.parsePipeline(astCmd) if astCmd.type is "Pipeline"', function() {
			
				var parsePipelineStub = sinon.stub(testRuntime, 'parsePipeline').callsFake(function returnResolved(cmdArr) {
				
					return new Promise((resolve) => {
					
						return resolve('test parsePipeline output');
					
					});
				
				});
				var testAstCmd = {type: 'Pipeline'};
// 				expect(testRuntime.parseCommandNode(testAstCmd)).to.equal('test parsePipeline output');
				parsePipelineStub.restore();
			
			});
			it('should return the value for this.parseFunction(astCmd) if astCmd.type is "Function"', function() {
			
				var parseFunctionStub = sinon.stub(testRuntime, 'parseFunction').returns('test parseFunction output');
				var testAstCmd = {type: 'Function'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseFunction output');
				parseFunctionStub.restore();
			
			});
			it('should return the value for this.parseConditional(astCmd.type, astCmd.then, args) if astCmd.type is "If"', function() {
			
				var parseConditionalStub = sinon.stub(testRuntime, 'parseConditional').returns('test parseConditional output');
				var testAstCmd = {type: 'If'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseConditional output');
				parseConditionalStub.restore();
			
			});
		
		});
		describe('parseCommand(astCommand, output, input)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parseCommand).to.be.a('function');
			
			});
			it('should return an object with an Error in error property if astCommand.name.text is not a non-empty string', function() {
			
				var testAst = getTestAst();
				var testCmd1 = Object.assign({}, testAst.commands[0]);
				testCmd1.id = uid.sync(24);
				testCmd1.name.text = null;
				var testCmd2 = Object.assign({}, testCmd1);
				testCmd2.name.text = '';
				expect(testRuntime.parseCommand(testCmd1)).to.be.an('object').with.property('error').that.is.an.instanceof(Error).with.property('message').that.equals('command is not a string');
				expect(testRuntime.parseCommand(testCmd2)).to.be.an('object').with.property('error').that.is.an.instanceof(Error).with.property('message').that.equals('command is not a string');
			
			});
			it('should return an object with an Error in error property if astCommand.name.text is not a string with value "sudo" or that matches a member of global.Uwot.Constants.cliOps or global.Uwot.Constants.reserved', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'explodingDonkey';
				expect(testRuntime.parseCommand(testCmd)).to.be.an('object').with.property('error').that.is.an.instanceof(Error).with.property('message').that.equals(testCmd.name.text + ': command not found');
			
			});
			it('should return an exe object if name is a valid command (has minimal properties isOp, type, isSudo, name, id)', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.a('boolean');
				expect(testExe).to.have.property('type').that.is.a('string');
				expect(testExe).to.have.property('isSudo').that.is.a('boolean');
				expect(testExe).to.have.property('name').that.is.a('string');
				expect(testExe).to.have.property('input').that.is.null;
				expect(testExe).to.have.property('output').that.is.null;
			
			});
			it('should assign value of astCommand.name.text to return object property name', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('name').that.is.a('string').that.equals(testCmd.name.text);
			
			});
			it('should assign value of astCommand.id to return object property id', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('id').that.is.a('string').that.equals(testCmd.id);
			
			});
			it('should return an object with a SystemError assigned to error property if name is "sudo" and this.user.maySudo() returns false', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'sudo';
				testCmd.suffix = [{text:"pwd", type:"Word"}];
				testRuntime.user.sudoer = false;
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('error').with.property('code').that.equals('EPERM');
			
			});
			it('should recurse with a command node containing the sudo command arguments if name is "sudo" and this.user.maySudo() returns true; the resulting object should have true assigned to the isSudo property', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'sudo';
				testCmd.suffix = [{text:"pwd", type:"Word"}];
				testRuntime.user.sudoer = true;
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isSudo').that.is.true;
				expect(testExe.name).to.equal(testCmd.suffix[0].text);
			
			});
			it('should set the isOp property of the returned object to true if name matches a member of global.Uwot.Constants.cliOps', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'clear';
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.true;
			
			});
			it('should assign an array of arg nodes derived from astCommand.suffix members that have type property "Word" to the args property of the returned object if name matches a member of global.Uwot.Constants.cliOps and astCommand.suffix length is greater than 0', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'echo';
				testCmd.suffix = [{text: "exploding", type: "Word"}, {text: "Donkey", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.true;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.suffix);
			
			});
			it('should derive args and opts properties from an array containing nodes from astCommand.prefix and astCommand.suffix if name matches a member of global.Uwot.Constants.reserved', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "-s", type: "Word"}];
				testCmd.suffix = [{text: "cac", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.suffix);
				expect(testExe).to.have.property('opts').that.is.an('array');
				expect(testExe.opts[0]).to.be.an('object').that.has.property('name').that.equals('s');
			
			});
			it('should include any nodes from prefix and suffix that are not type Word or Redirect in the returned object args property array if name matches a member of global.Uwot.Constants.reserved', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "--sadness", type: "Command"}];
				testCmd.suffix = [{text: "bliss", type: "Feeling"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.prefix.concat(testCmd.suffix));
			
			});
			it('should add a node to the return object property args array if name matches a member of global.Uwot.Constants.reserved, suffix/prefix node type is Word, and matchOpt.isOpt is false', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "silverstart", type: "Word"}];
				testCmd.suffix = [{text: "cac", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.prefix.concat(testCmd.suffix));
				expect(testExe).to.have.property('opts').that.is.an('array').that.is.empty;
			
			});
			it('should not add node to return object property opts array if name matches a member of global.Uwot.Constants.reserved, matchOpt.isOpt is true, and name is an empty string; all subsequent suffix/prefix nodes should not be considered options and therefore also not be added to opts', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "-", type: "Word"}];
				testCmd.suffix = [{text: "cac", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.suffix);
				expect(testExe).to.have.property('opts').that.is.an('array').that.is.empty;
			
			});
			it('should add a prefix/suffix node with only the option name defined to return object opts property array if name matches a member of global.Uwot.Constants.reserved, optMatch.isOpt is true, node name is not an empty string, and optMatch.isDefined is false', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "--cookietime=42", type: "Word"}];
				testCmd.suffix = [{text: "cac", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.suffix);
				expect(testExe).to.have.property('opts').that.is.an('array');
				expect(testExe.opts[0]).to.deep.equal({name: 'cookietime'});
			
			});
			it('should add a prefix/suffix node with an args property array containing optMatch.assignedArg values separated by any commas in the string to return object opts property array if name matches a member of global.Uwot.Constants.reserved, optMatch.isOpt is true, node name is not an empty string, optMatch.isDefined is true, and optMatch.assignedArg is not an empty string', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "--s=42,54", type: "Word"}];
				testCmd.suffix = [{text: "cac", type: "Word"}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals(testCmd.suffix);
				expect(testExe).to.have.property('opts').that.is.an('array');
				expect(testExe.opts[0]).to.deep.equal({name: 's', args: ['42', '54']});
			
			});
			it('should add a prefix/suffix node with an args property array containing any subsequent nodes as args if assignedArg has not yet filled all required arg values to return object opts property array if name matches a member of global.Uwot.Constants.reserved, optMatch.isOpt is true, node name is not an empty string, optMatch.isDefined is true, and optMatch.reqArg length is greater than 0', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'theme';
				testCmd.prefix = [{text: "--s=42", type: "Word"}];
				testCmd.suffix = [{text: "54", type: "Word"}, {text: "cac", type: "Word"}];
				var themeMatchOptStub = sinon.stub(global.Uwot.Bin.theme, 'matchOpt')
				themeMatchOptStub.withArgs('--s=42').callsFake(function oneAndDone(opt) {
				
					return {
						name: 's',
						isOpt: true,
						isLong: false,
						isDefined: true,
						hasArgs: true,
						reqArgs: ['minLength', 'maxLength'],
						optArgs: ['themeLength'],
						assignedArg: '42'
					};
				
				});
				themeMatchOptStub.callThrough();
				var testExe = testRuntime.parseCommand(testCmd);
				themeMatchOptStub.restore();
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('args').that.is.an('array').that.deep.equals([testCmd.suffix[1]]);
				expect(testExe).to.have.property('opts').that.is.an('array');
				expect(testExe.opts[0]).to.deep.equal({name: 's', args: ['42', '54']});
			
			});
			it('should assign an ioFile object with options.noclobber property true, options.append property false, and other properties derived from the prefix/suffix node to return object input property if command name matches a member of global.Uwot.Constants.reserved, node type is Redirect, and node op.type is less', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				testCmd.suffix = [{op: {type: "less", symbol: "<"}, type: "Redirect", file: {type: "Word", text: "up/uranus"}}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('output').that.is.null;
				expect(testExe).to.have.property('input').that.is.an('object');
				expect(testExe.input).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.input).to.have.property('options').that.is.an('object');
				expect(testExe.input.options).to.have.property('noclobber').that.is.true;
				expect(testExe.input.options).to.have.property('append').that.is.false;
			
			});
			it('should assign an ioFile object with options.noclobber property true, options.append property false, and other properties derived from the prefix/suffix node to return object output property if command name matches a member of global.Uwot.Constants.reserved, node type is Redirect, and node op.type is great', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				testCmd.suffix = [{op: {type: "great", symbol: ">"}, type: "Redirect", file: {type: "Word", text: "up/uranus"}}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('input').that.is.null;
				expect(testExe).to.have.property('output').that.is.an('object');
				expect(testExe.output).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.output).to.have.property('options').that.is.an('object');
				expect(testExe.output.options).to.have.property('noclobber').that.is.true;
				expect(testExe.output.options).to.have.property('append').that.is.false;
			
			});
			it('should assign an ioFile object with options.noclobber property true, options.append property false, and other properties derived from the prefix/suffix node to return object input and output properties if command name matches a member of global.Uwot.Constants.reserved, node type is Redirect, and node op.type is lessgreat', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				testCmd.suffix = [{op: {type: "lessgreat", symbol: "<>"}, type: "Redirect", file: {type: "Word", text: "up/uranus"}}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('input').that.is.an('object');
				expect(testExe.input).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.input).to.have.property('options').that.is.an('object');
				expect(testExe.input.options).to.have.property('noclobber').that.is.true;
				expect(testExe.input.options).to.have.property('append').that.is.false;
				expect(testExe).to.have.property('output').that.is.an('object');
				expect(testExe.output).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.output).to.have.property('options').that.is.an('object');
				expect(testExe.output.options).to.have.property('noclobber').that.is.true;
				expect(testExe.output.options).to.have.property('append').that.is.false;
			
			});
			it('should assign an ioFile object with options.noclobber property true, options.append property true, and other properties derived from the prefix/suffix node to return object output property if command name matches a member of global.Uwot.Constants.reserved, node type is Redirect, and node op.type is dgreat', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				testCmd.suffix = [{op: {type: "dgreat", symbol: ">>"}, type: "Redirect", file: {type: "Word", text: "up/uranus"}}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('input').that.is.null;
				expect(testExe).to.have.property('output').that.is.an('object');
				expect(testExe.output).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.output).to.have.property('options').that.is.an('object');
				expect(testExe.output.options).to.have.property('noclobber').that.is.true;
				expect(testExe.output.options).to.have.property('append').that.is.true;
			
			});
			it('should assign an ioFile object with options.noclobber property false, options.append property false, and other properties derived from the prefix/suffix node to return object output property if command name matches a member of global.Uwot.Constants.reserved, node type is Redirect, and node op.type is clobber', function() {
			
				var testAst = getTestAst();
				var testCmd = Object.assign({}, testAst.commands[0]);
				testCmd.id = uid.sync(24);
				testCmd.name.text = 'pwd';
				testCmd.suffix = [{op: {type: "clobber", symbol: ">|"}, type: "Redirect", file: {type: "Word", text: "up/uranus"}}];
				var testExe = testRuntime.parseCommand(testCmd);
				expect(testExe).to.have.property('isOp').that.is.false;
				expect(testExe).to.have.property('input').that.is.null;
				expect(testExe).to.have.property('output').that.is.an('object');
				expect(testExe.output).to.have.property('text').that.equals(testCmd.suffix[0].file.text);
				expect(testExe.output).to.have.property('options').that.is.an('object');
				expect(testExe.output.options).to.have.property('noclobber').that.is.false;
				expect(testExe.output.options).to.have.property('append').that.is.false;
			
			});
		
		});
		describe('parseLoop(loopType, loopNodes)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parseLoop).to.be.a('function');
			
			});
			it('is not currently implemented and will only return an empty object', function() {
			
				expect(testRuntime.parseLoop()).to.be.an('object').that.is.empty;
			
			});
		
		});
		describe('parseConditional(condType, condNodes, condArgs)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parseConditional).to.be.a('function');
			
			});
			it('should throw a TypeError if condType is not a string matching "If" or "LogicalExpression"', function() {
			
				function testError1() {
				
					return testRuntime.parseConditional(null);
				
				}
				function testError2() {
				
					return testRuntime.parseConditional('Nope');
				
				}
				expect(testError1).to.throw(TypeError, 'invalid condType passed to parseConditional');
				expect(testError2).to.throw(TypeError, 'invalid condType passed to parseConditional');
			
			});
			it('should throw a TypeError if condNodes values is not an array', function() {
			
				function testError1() {
				
					return testRuntime.parseConditional('If');
				
				}
				function testError2() {
				
					return testRuntime.parseConditional('If', null);
				
				}
				expect(testError1).to.throw(TypeError, 'invalid condNodes passed to parseConditional');
				expect(testError2).to.throw(TypeError, 'invalid condNodes passed to parseConditional');
			
			});
			it('should throw a TypeError if condType is LogicalExpression and condArgs is not an object with a property op that is a string', function() {
			
				function testError1() {
				
					return testRuntime.parseConditional('LogicalExpression', ['obj'], {});
				
				}
				function testError2() {
				
					return testRuntime.parseConditional('LogicalExpression', ['obj'], {op: {theOp: 'stuff'}});
				
				}
				expect(testError1).to.throw(TypeError, 'condArgs.op passed to parseConditional must be a string');
				expect(testError2).to.throw(TypeError, 'condArgs.op passed to parseConditional must be a string');
			
			});
			it('should throw a TypeError if condType is If and condArgs is not an object with a property clause that is an Array', function() {
			
				function testError1() {
				
					return testRuntime.parseConditional('If', ['obj'], {});
				
				}
				function testError2() {
				
					return testRuntime.parseConditional('If', ['obj'], {clause: {theClause: 'stuff'}});
				
				}
				expect(testError1).to.throw(TypeError, 'condArgs.clause passed to parseConditional must be an array');
				expect(testError2).to.throw(TypeError, 'condArgs.clause passed to parseConditional must be an array');
			
			});
			it('should return an exe object if the operations complete without error', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				testResult = testRuntime.parseConditional('LogicalExpression', ['leftSide', 'rightSide'], {op: 'OR'});
				expect(testResult).to.be.an('object').with.property('type').that.equals('LogicalExpression');
				parseCommandNodeStub.restore();
			
			});
			it('should return an exe object with name property "LogicalExpression", op property "or" or "and", a left property that is an exe resulting from running parseCommandNode on condNodes[0], and a right property that is an exe resulting from running parseCommandNode on condNodes[1] if condType is "LogicalExpression"', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				testResult = testRuntime.parseConditional('LogicalExpression', ['leftSide', 'rightSide'], {op: 'orr'});
				expect(testResult).to.be.an('object').with.property('type').that.equals('LogicalExpression');
				expect(testResult.left).to.equal('leftSide');
				expect(testResult.right).to.equal('rightSide');
				expect(testResult.op).to.equal('and');
				parseCommandNodeStub.restore();
			
			});
			it('should return an exe object with name property "If", clause property that is an exe resulting from running parseCommandNode on condArgs.clause, and then property that is an exe resulting from running parseCommandNode on condNodes if condType is "If"', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				testResult = testRuntime.parseConditional('If', ['firstThen', 'secondThen'], {clause: ['clause']});
				expect(testResult).to.be.an('object').with.property('type').that.equals('If');
				expect(testResult.clause).to.deep.equal(['clause']);
				expect(testResult.then).to.deep.equal(['firstThen', 'secondThen']);
				parseCommandNodeStub.restore();
			
			});
			it('should return an exe object with a property else that is an exe that results from running parseCommandNode on condArgs.else if condType is "If" and condArgs.else is an Array', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				testResult = testRuntime.parseConditional('If', ['firstThen', 'secondThen'], {clause: ['clause'], else: ['elseClause']});
				expect(testResult).to.be.an('object').with.property('type').that.equals('If');
				expect(testResult.clause).to.deep.equal(['clause']);
				expect(testResult.then).to.deep.equal(['firstThen', 'secondThen']);
				expect(testResult.else).to.deep.equal(['elseClause']);
				parseCommandNodeStub.restore();
			
			});
		
		});
		describe('parseFunction(fName, fBody, fRedirect)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parseFunction).to.be.a('function');
			
			});
			it('is not implemented and only returns void or undefined', function() {
			
				var testResult = testRuntime.parseFunction();
				expect(testResult).to.be.undefined;
				testRuntime.fx = new Map();
				testResult = testRuntime.parseFunction();
				expect(testResult).to.be.undefined;
			
			});
		
		});
		describe('parsePipeline(astCommands)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.parsePipeline).to.be.a('function');
			
			});
			it('should return a Promise rejected with a TypeError if astCommands arg value is not an Array', function() {
			
				expect(testRuntime.parsePipeline()).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('astCommands passed to parsePipeline must be an array');
			
			});
			it('should loop through members of astCommands and generate a Map containing the result of parseCommandNode for each member prior to calling executeChainedMap', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				var testAstNode1 = getTestAst().commands[0];
				var testAstNode2 = getTestAst().commands[0];
				testAstNode1.name.text = 'set course';
				testAstNode2.name.text = 'engage';
				var testAstCommands = [testAstNode1, testAstNode2];
				var resultChainedMap;
				var testChainedMap = new Map([[0, testAstNode1], [1, testAstNode2]]);
				var executeChainedMapStub = sinon.stub(testRuntime, 'executeChainedMap').callsFake(function returnResolved(cmap) {
				
					testChainedMap = cmap;
					return new Promise((resolve, reject) => {
					
						return resolve({
							output: cmap,
							redirect: null,
							cwd: '',
							cookies: {}
						});
					
					});
				
				});
				var testResult = testRuntime.parsePipeline(testAstCommands);
				expect(testChainedMap).to.be.an.instanceof(Map);
				expect(testChainedMap.get(0)).to.deep.equal(testAstNode1);
				expect(testChainedMap.get(1)).to.deep.equal(testAstNode2);
			
			});
			it('should return a Promise resolved with a static exe if executeChainedMap completes without error', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				var testAstNode1 = getTestAst().commands[0];
				var testAstNode2 = getTestAst().commands[0];
				testAstNode1.name.text = 'set course';
				testAstNode2.name.text = 'engage';
				var testAstCommands = [testAstNode1, testAstNode2];
				var resultChainedMap;
				var testChainedMap = new Map([[0, testAstNode1], [1, testAstNode2]]);
				var executeChainedMapStub = sinon.stub(testRuntime, 'executeChainedMap').callsFake(function returnResolved(cmap) {
				
					testChainedMap = cmap;
					return new Promise((resolve, reject) => {
					
						return resolve({
							output: cmap,
							redirect: null,
							cwd: '',
							cookies: {}
						});
					
					});
				
				});
				var testResult = testRuntime.parsePipeline(testAstCommands);
				return expect(testResult).to.eventually.be.fulfilled.then((testStaticExe) => {
				
					expect(testStaticExe).to.be.an('object').with.property('type').that.equals('Static');
				
				});
			
			});
			it('should return a Promise rejected with an error if executeChainedMap returns an error', function() {
			
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returnsArg(0);
				var testAstNode1 = getTestAst().commands[0];
				var testAstNode2 = getTestAst().commands[0];
				testAstNode1.name.text = 'set course';
				testAstNode2.name.text = 'engage';
				var testAstCommands = [testAstNode1, testAstNode2];
				var resultChainedMap;
				var testChainedMap = new Map([[0, testAstNode1], [1, testAstNode2]]);
				var executeChainedMapStub = sinon.stub(testRuntime, 'executeChainedMap').callsFake(function returnRejected(cmap) {
				
					testChainedMap = cmap;
					return new Promise((resolve, reject) => {
					
						return reject(new Error('warp drive offline'));
					
					});
				
				});
				var testResult = testRuntime.parsePipeline(testAstCommands);
				return expect(testResult).to.eventually.be.rejectedWith(Error).that.has.property('message').that.equals('warp drive offline');
			
			});
		
		});
		describe('outputLine(output, type)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.outputLine).to.be.a('function');
			
			});
			it('should default type arg to "ansi" if passed type arg value is not a string', function() {
			
				var testOutput = 'by the rivers of Babylon';
				var testResult = testRuntime.outputLine(testOutput);
				expect(testResult).to.be.an('object').with.property('content').that.contains(testOutput);
			
			});
			it('should serialize the output arg value to JSON prior to processing if it is not a string and output type is not "object" or "ansi"', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'string');
				expect(testResult).to.equal(JSON.stringify(testOutput));
			
			});
			it('should serialize the output arg value to JSON prior to processing if type is "ansi" and it is passed as a non-array, non-Error object that does not have an array as its content property', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').that.contains(JSON.stringify(testOutput));
			
			});
			it('should return the output arg value as a string if type is not "object" or "ansi"', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'string');
				expect(testResult).to.be.a('string');
			
			});
			it('should return the output arg value unchanged if type arg value is "object" and output is an object', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'object');
				expect(testResult).to.deep.equal(testOutput);
			
			});
			it('should return an object with property "content" assigned output value if type arg value is "object" and output arg value is not an object', function() {
			
				var testOutput = 'by the rivers of Babylon';
				var testResult = testRuntime.outputLine(testOutput, 'object');
				expect(testResult).to.be.an('object').with.property('content').that.contains(testOutput);
			
			});
			it('should return an object with a content property that is an array if type arg value is "ansi"', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').is.an('array').that.contains(JSON.stringify(testOutput));
			
			});
			it('should add an empty br tag member to the end of the content property array of the returned object if type arg value is "ansi"', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').is.an('array');
				expect(testResult.content[1]).to.deep.equal({tag: 'br'});
			
			});
			it('should add a red text span element member with content property "Error: \r\n", and a second member that is a string with the value of error message if type arg value is "ansi" and output arg value is an Error', function() {
			
				var testOutput = new Error('cannot remember Zion');
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').is.an('array');
				expect(testResult.content[0]).to.deep.equal({
					content: 'Error:' + "\r\n",
					color: 'red'
				});
				expect(testResult.content[1]).to.equal(testOutput.message);
			
			});
			it('should add the value of the output arg to the return object content property array as a member if type arg value is "ansi" and it is an object with a content property that is an Array', function() {
			
				var testOutput = {content: ['by the rivers of Babylon', 'there we sat down']};
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').is.an('array');
				expect(testResult.content[0]).to.deep.equal(testOutput);
			
			});
			it('should add the value of the output arg as a string to the return object content property array as a memeber if type arg value is "ansi" and it is an not an Error or object with an array property "content"', function() {
			
				var testOutput = {satDown: 'by the rivers of Babylon'};
				var testResult = testRuntime.outputLine(testOutput, 'ansi');
				expect(testResult).to.be.an('object').with.property('content').is.an('array')
				expect(testResult.content[0]).to.equal(JSON.stringify(testOutput));
			
			});
		
		});
		describe('executeMap(exeMap, outputType)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.executeMap).to.be.a('function');
			
			});
			it('should return a Promise', function() {
			
				expect(testRuntime.executeMap()).to.be.an.instanceof(Promise);
			
			});
			it('should return a Promise resolved with an array the result of this.outputLine called with a TypeError and specified outputType if exeMap arg value is not a Map object', function() {
			
				var testError = new TypeError('exeMap passed to executeMap must be an instance of Map');
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnErrorMessageString(err) {
				
					return err.message;
				
				});
				return expect(testRuntime.executeMap(null, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(outputLineStub.getCall(0).args[0]).to.be.an.instanceof(TypeError).with.property('message').that.equals(testError.message);
					expect(outputLineStub.getCall(0).args[1]).to.equal('object');
					expect(testResult).to.be.an('array').that.contains(testError.message);
					return expect(testRuntime.executeMap()).to.eventually.be.fulfilled.then((testResult) => {
				
						expect(outputLineStub.getCall(1).args[0]).to.be.an.instanceof(TypeError).with.property('message').that.equals(testError.message);
						expect(outputLineStub.getCall(1).args[1]).to.equal('ansi');
						expect(testResult).to.be.an('array').that.contains(testError.message);
						return expect(testRuntime.executeMap(null, 'string')).to.eventually.be.fulfilled.then((testResult) => {
				
							expect(outputLineStub.getCall(2).args[0]).to.be.an.instanceof(TypeError).with.property('message').that.equals(testError.message);
							expect(outputLineStub.getCall(2).args[1]).to.equal('string');
							expect(testResult).to.be.an('array').that.contains(testError.message);
				
						}).catch((e) => {
				
							throw e;
				
						});
				
					}).catch((e) => {
				
						throw e;
				
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should return a Promise resolved with a unfilled results object (output & operations props are empty arrays, cookies is an empty object) if exeMap arg value is a Map with size less than one', function() {
			
				return expect(testRuntime.executeMap(new Map())).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.deep.equal({
						output: [],
						operations: [],
						cookies: {}
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should include the result of this.outputLine called with a TypeError in return object output property array if a value in exeMap is not a non-null object', function() {
			
				var testMap = new Map([[0, null]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnErrorMessageString(err) {
				
					return err.message;
				
				});
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains('exe with index 0 is invalid')
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should include the result of this.outputLine called with the value of its error property in return object output property array if a value in exeMap has a defined error property', function() {
			
				var testError = new Error('test exe error');
				var testMap = new Map([[0, {error: testError}]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnErrorMessageString(err) {
				
					return err.message;
				
				});
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains(testError.message);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should not include a value in return object output array for a value in exeMap that is an operation if user is a guest, config value users:allowGuest is false, and its name property is not "login"', function() {
			
				var testExe = getTestExe();
				testExe.isOp = true;
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnErrorMessageString(err) {
				
					return err.message;
				
				});
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains('config does not allow guest users. use the "login" command to begin your session.');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should include a value in return object output array containing the result of this.outputLine called with a string containing the operation name for a value in exeMap that is an operation if user is a guest while config value users:allowGuest is true, user is an authenticated user, or its name property is "login"', function() {
			
				var testExe = getTestExe();
				testExe.isOp = true;
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal');
				configGetValStub.onCall(0).returns(false);
				configGetValStub.onCall(1).returns(false);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains('operation ' + testExe.name);
					testRuntime.user.uName = 'guest';
					testExe.name = 'login';
					testMap.set(0, testExe);
					return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
					
						expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains('operation ' + testExe.name);
					
					}).catch((e) => {
				
						throw e;
				
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should include a value in return object operations array that matches the exeMap node value for a value in exeMap that is an operation if user is a guest while config value users:allowGuest is true, user is an authenticated user, or its name property is "login"', function() {
			
				var testExe = getTestExe();
				testExe.isOp = true;
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal');
				configGetValStub.onCall(0).returns(false);
				configGetValStub.onCall(1).returns(false);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('operations').that.is.an('array').that.contains(testExe);
					testRuntime.user.uName = 'guest';
					testExe.name = 'login';
					testMap.set(0, testExe);
					return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
					
						expect(testResult).to.be.an('object').with.property('operations').that.is.an('array').that.contains(testExe);
					
					}).catch((e) => {
				
						throw e;
				
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should not include a value in return object output array for a value in exeMap that is not an operation if user is a guest and config value users:allowGuest is false', function() {
			
				var testExe = getTestExe();
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnErrorMessageString(err) {
				
					return err.message;
				
				});
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array').that.contains('config does not allow guest users. use the "login" command to begin your session.');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe if user is a guest and config value users:allowGuest is true or user is authenticated', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.output = null;
				var testMap = new Map([[0, testExe]]);
				var testInputs = [];
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					testInputs.push(null);
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						outputType: 'object',
						output: JSON.stringify(args)
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testInputs[0]).to.be.null;
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should add a member to return object output array value containing the result of this.outputLine called with an input error if user is a guest and config value users:allowGuest is true or user is authenticated and attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe results in an input error', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnError(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return reject(new Error('test input Error'));
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						outputType: 'object',
						output: JSON.stringify(args)
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test input Error');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should add inputData as the first element in exe.args array prior to execution attempt if attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe successfully returns a string of inputData and user is a guest while config value users:allowGuest is true or user is an authenticated user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = [];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnString(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve('testInputArg');
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						outputType: 'object',
						output: JSON.stringify(args)
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an('object').with.property('output').that.equals('["testInputArg"]');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use an Error as the first argument in getConsoleOutputForExe if the execute method call returns an error to callback for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = [];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					return cb(new Error('test theme execute error'), null);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test theme execute error');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use the result returned to the execute method callback as the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback and its name property is "sudo" for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'sudo';
				testExe.input = null;
				testExe.output = null;
				testExe.args = [];
				var testSudoArg = getTestExe();
				testSudoArg.input = null;
				testSudoArg.output = null;
				testSudoArg.name = 'theme';
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnResult(args, opts, app, user, cb) {
				
					var result = {
						output: 'test theme output'
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.deep.equal({
						content: ['sudo what? sudo please...'],
						color: 'magenta'
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use the result of this.outputLine called with the result returned to the execute method callback and "object" for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback, result.output is not an object, and the result.outputType is "object" for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					return {content: op.output};
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: 'test theme execute result',
						outputType: 'object'
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an('object').with.property('content').that.equals('test theme execute result');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use the result of this.outputLine called with the output property of result returned to the execute method callback and "object" for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback and the result.outputType is "object" and result.output is an object for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						},
						outputType: 'object'
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an('object').with.property('content').that.equals('test theme execute result');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should assign value of redirect property of result returned to the execute method callback to return object redirect property if the execute method call does not return an error to callback, the result.outputType is "object", and the result redirect property is a string for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						},
						redirect: 'test theme execute redirect',
						outputType: 'object'
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('redirect').that.equals('test theme execute redirect');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should assign values of cookies property of result returned to the execute method callback to to matched keys of return object cookies property if the execute method call does not return an error to callback, the result.outputType is "object", and the result cookies property is a non-null object for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						},
						cookies: {
							ok: 'chocoChip',
							fav: 'pb',
							death: 'raisin'
						},
						outputType: 'object'
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'object')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('cookies').that.is.an('object');
					expect(testResult.cookies).to.have.property('ok').that.equals('chocoChip');
					expect(testResult.cookies).to.have.property('fav').that.equals('pb');
					expect(testResult.cookies).to.have.property('death').that.equals('raisin');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use the result of this.outputLine called with the result returned to the execute method callback and its outputType property value for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback, the result.outputType is not "object", and result.output is not an object for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testExecuteresult = {
					output: 'test theme execute result',
					cookies: {
						ok: 'chocoChip',
						fav: 'pb',
						death: 'raisin'
					},
				};
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string' && 'object' === typeof op) {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					
					return cb(false, testExecuteresult);
				
				});
				return expect(testRuntime.executeMap(testMap, 'string')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal(JSON.stringify(testExecuteresult));
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should use the result of this.outputLine called with the output property of result returned to the execute method callback and its outputType property value for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback, the result.outputType is not "object", and result.output is an object for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string') {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						},
						cookies: {
							ok: 'chocoChip',
							fav: 'pb',
							death: 'raisin'
						},
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'string')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('{"content":"test theme execute result","tag":"p"}');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should assign value of cwd property of result returned to the execute method callback to return object cwd property if the execute method call does not return an error to callback, the result is an object, and the result cwd property is a string for a non-operation member of exeMap for an allowed user', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string') {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						},
						cwd: '/run/for/the/hills',
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'string')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('cwd').that.equals('/run/for/the/hills');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should attempt to get consoleOutput value using getConsoleOutputForExe with outputData for a non-operation member of exeMap for an allowed user if execute method call does not return an error, and should add the result to the return object output array if the exeMap member output property is null', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string') {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						}
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'ansi')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.deep.equal({
						content: 'test theme execute result',
						tag: 'p'
					});
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should add the value of exeMap member output property to the return object output array if the exeMap member output property is not null and the getConsoleOutputForExe call does not throw an error', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = {
					text: '/tmp/themeOut',
					options: {
						append: false,
						noclobber: true
					}
				};
				var testConsoleOutput = 'output to /tmp/themeOut via new file write was successful';
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string') {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(testConsoleOutput);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						}
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'ansi')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal(testConsoleOutput);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should add the result of outputLine called with the output error to the return object output array if the getConsoleOutputForExe call does throw an error', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = {
					text: '/tmp/themeOut',
					options: {
						append: false,
						noclobber: true
					}
				};
				var testOutputError = new Error('test output error');
				testExe.args = ['cac'];
				var testMap = new Map([[0, testExe]]);
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').callsFake(function returnOutputAsObj(op, tp) {
				
					if (tp === 'string') {
					
						return JSON.stringify(op);
					
					}
					return op;
				
				});
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return reject(testOutputError);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = {
						output: {
							content: 'test theme execute result',
							tag: 'p'
						}
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeMap(testMap, 'ansi')).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.deep.equal(testOutputError);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output and finally resolve if, after determining that user is not allowed to execute current member of exeMap, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testExecuteErrorExe = getTestExe();
				testExecuteErrorExe.name = 'theme';
				testExecuteErrorExe.input = null;
				testExecuteErrorExe.output = null;
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal');
				configGetValStub.onCall(0).returns(false);
				configGetValStub.onCall(1).returns(false);
				testRuntime.user.uName = 'guest';
				var testMap = new Map([[0, testExe], [1, testExecuteErrorExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(eo instanceof Error ? eo : od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					if ('object' === typeof args && Array.isArray(args) && args.length > 1) {
					
						throw new Error('test execute error');
					
					}
					var result = 'test theme execute result ' + globalBinThemeExecuteStub.callCount;
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an.instanceof(Error).with.property('message').that.equals('config does not allow guest users. use the "login" command to begin your session.');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should finally resolve if, after catching a thrown error during execute method call, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testExecuteErrorExe = getTestExe();
				testExecuteErrorExe.name = 'theme';
				testExecuteErrorExe.input = null;
				testExecuteErrorExe.output = null;
				testExecuteErrorExe.args = ['throw', 'an', 'error'];
				var testMap = new Map([[0, testExe], [1, testExecuteErrorExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(eo instanceof Error ? eo : od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					if ('object' === typeof args && Array.isArray(args) && args.length > 1) {
					
						throw new Error('test execute error');
					
					}
					var result = 'test theme execute result ' + globalBinThemeExecuteStub.callCount;
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[1]).to.be.an.instanceof(Error).with.property('message').that.equals('test execute error');
					expect(testResult.output[0]).to.equal('test theme execute result 1');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should finally resolve if, after catching an output error, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testOutputErrorExe = getTestExe();
				testOutputErrorExe.name = 'theme';
				testOutputErrorExe.input = null;
				testOutputErrorExe.output = new Error('test output Error');
				var testMap = new Map([[0, testExe], [1, testOutputErrorExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(eo instanceof Error ? eo : od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result ' + globalBinThemeExecuteStub.callCount;
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[1]).to.be.an.instanceof(Error).with.property('message').that.equals(testOutputErrorExe.output.message);
					expect(testResult.output[0]).to.equal('test theme execute result 1');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after successfully adding consoleOutput or exe.output to return object output property array, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testMap = new Map([[0, testExe], [1, testExe]]);
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve();
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result ' + globalBinThemeExecuteStub.callCount;
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an.instanceof(Error).with.property('message').that.equals('config does not allow guest users. use the "login" command to begin your session.');
					expect(testResult.output[1]).to.be.undefined;
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should finally resolve if, after successfully adding consoleOutput or exe.output to return object output property array, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testMap = new Map([[0, testExe], [1, testExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result ' + globalBinThemeExecuteStub.callCount;
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('test theme execute result 1');
					expect(testResult.output[1]).to.equal('test theme execute result 2');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should finally resolve if, after catching an input error, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testInputErrorExe = getTestExe();
				testInputErrorExe.name = 'theme';
				testInputErrorExe.input = new Error('test input error');
				testInputErrorExe.output = null;
				var testMap = new Map([[0, testExe], [1, testInputErrorExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(ei);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('test theme execute result');
					expect(testResult.output[1]).to.be.an.instanceof(Error).with.property('message').that.equals(testInputErrorExe.input.message);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after determining user is not allowed to execute an operation, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testAllowedOpExe = getTestExe();
				testAllowedOpExe.name = 'history';
				testAllowedOpExe.isOp = true;
				var testMap = new Map([[0, testExe], [1, testAllowedOpExe]]);
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.be.an.instanceof(Error).with.property('message').that.equals('config does not allow guest users. use the "login" command to begin your session.');
					expect(testResult.output[1]).to.be.undefined;
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			it('should finally resolve if, after determining user is not allowed to execute an operation, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'login';
				testExe.isOp = true;
				var testAllowedOpExe = getTestExe();
				testAllowedOpExe.name = 'history';
				testAllowedOpExe.isOp = true;
				var testMap = new Map([[0, testExe], [1, testAllowedOpExe]]);
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('operation ' + testExe.name);
					expect(testResult.output[1]).to.be.undefined;
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			// This case is not possible; logic fills output prop of return 
			// it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after adding an allowed operation to the return object operations property array, all members of exeMap have attempted to execute');
			it('should finally resolve if, after adding an allowed operation to the return object operations property array, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testAllowedOpExe = getTestExe();
				testAllowedOpExe.name = 'history';
				testAllowedOpExe.isOp = true;
				var testMap = new Map([[0, testExe], [1, testAllowedOpExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('test theme execute result');
					expect(testResult.output[1]).to.equal('operation ' + testAllowedOpExe.name);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			// This case is not possible; logic fills output prop of return 
			// it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after processing a member of exeMap with a defined error property, all members of exeMap have attempted to execute');
			it('should finally resolve if, after processing a member of exeMap with a defined error property, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testErrorExe = {error: new Error('test exe error property')};
				var testMap = new Map([[0, testExe], [1, testErrorExe]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equal('test theme execute result');
					expect(testResult.output[1]).to.be.an.instanceof(Error).with.property('message').that.equals(testErrorExe.error.message);
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
			// This case is not possible; logic fills output prop of return 
			// it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after processing a member of exeMap that is not a non-null object, all members of exeMap have attempted to execute');
			it('should finally resolve if, after processing a member of exeMap that is not a non-null object, all members of exeMap have attempted to execute', function() {
			
				var testExe = getTestExe();
				testExe.name = 'theme';
				testExe.input = null;
				testExe.output = null;
				var testMap = new Map([[0, testExe], [1, null]]);
				var getInputForExeStub = sinon.stub(testRuntime, 'getInputForExe').callsFake(async function returnNull(ei, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(null);
					
					});
				
				});
				var getConsoleOutputForExeStub = sinon.stub(testRuntime, 'getConsoleOutputForExe').callsFake(async function returnOd(od, eo, uid) {
				
					return new Promise((resolve, reject) => {
					
						return resolve(od);
					
					});
				
				});
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnArgsInResult(args, opts, app, user, cb) {
				
					var result = 'test theme execute result';
					return cb(false, result);
				
				});
				var outputLineStub = sinon.stub(testRuntime, 'outputLine').returnsArg(0);
				return expect(testRuntime.executeMap(testMap)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.an('object').with.property('output').that.is.an('array');
					expect(testResult.output[0]).to.equals('test theme execute result');
					expect(testResult.output[1]).to.be.an.instanceof(TypeError).with.property('message').that.equals('exe with index 1 is invalid');
				
				}).catch((e) => {
				
					throw e;
				
				});
			
			});
		
		});
		describe('executeChainedMap(chainedExeMap)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.executeChainedMap).to.be.a('function');
			
			});
			it('should return a Promise', function() {
			
				expect(testRuntime.executeChainedMap().catch((e) => {})).to.be.an.instanceof(Promise);
			
			});
			it('should return a Promise rejected with a TypeError if chainedExeMap is not a Map object', function() {
			
				return expect(testRuntime.executeChainedMap()).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('chainedExeMap passed to executeChainedMap must be an instance of Map');
			
			});
			it('should return a Promise rejected with a TypeError if chainedExeMap is an empty Map object', function() {
			
				return expect(testRuntime.executeChainedMap(new Map())).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('chainedExeMap passed to executeChainedMap must not be empty');
			
			});
			it('should return a Promise rejected with a TypeError if any member of chainedExeMap is not a non-null object', function() {
			
				return expect(testRuntime.executeChainedMap(new Map([[0, null]]))).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('exe with index 0 is invalid');
			
			});
			it('should return a Promise rejected with the value of the member error property if any member of chainedExeMap has a defined error property', function() {
			
				var testErrorExe = getTestExe();
				testErrorExe.error = new Error('test exe prop error');
				return expect(testRuntime.executeChainedMap(new Map([[0, testErrorExe]]))).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('test exe prop error');
			
			});
			it('should return a Promise rejected with a TypeError if any member of chainedExeMap is an operation', function() {
			
				var testOpExe = getTestExe();
				testOpExe.isOp = true;
				return expect(testRuntime.executeChainedMap(new Map([[0, testOpExe]]))).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('exe with index 0 is an operation, which invalidates the pipeline');
			
			});
			it('should add the result of the previous command execution to the beginning of the current node args array prior to execution if it is not the first member of chainedExeMap', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += args[i];
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(12);
					expect(testArgs).to.deep.equal([3, 3, 9]);
				
				});
			
			});
			it('should return a Promise rejected with an Error if user does not have permission to execute any member of chainedExeMap', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				testRuntime.user.uName = 'guest';
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(false);
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += args[i];
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('user does not have permissions to execute this command');
			
			});
			it('should assign error value to prevResult, add the error to the resultMap, and move to the next node execution if calling the execute method for a command returns an error to the callback', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [];
				testSecondExe.name = 'theme';
				testSecondExe.args = [3];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += isNaN(parseInt(args[i])) ? 0 : parseInt(args[i]);
						
						}
						return cb(false, result);
					
					}
					return cb(new Error('test execute error'), null);
					
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(3);
					expect(testArgs[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test execute error');
				
				});
			
			});
			it('should assign error value to prevResult, add the error to the resultMap, and move to the next node execution if calling the execute method for a command throws an error', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [];
				testSecondExe.name = 'theme';
				testSecondExe.args = [3];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function throwError(args, opts, app, user, cb) {
				
					throw new Error('panic on the streets of London');
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.be.an.instanceof(Error).with.property('message').that.equals('panic on the streets of London');
				
				});
			
			});
			it('should return the Promise resolved with a finalResult object if execute method call returns an error to callback and all commands in chainedExeMap have been executed', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [];
				testSecondExe.name = 'theme';
				testSecondExe.args = [3];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 1;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							if (args[i] === 4) {
							
								return cb(new Error('test execute error'), null);
							
							}
							result += isNaN(parseInt(args[i])) ? 0 : parseInt(args[i]);
						
						}
						return cb(false, result);
					
					}
					return cb(new Error('test execute error'), null);
					
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[1, testFirstExe], [0, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.be.an.instanceof(Error).with.property('message').that.equals('test execute error');
				
				});
			
			});
			it('should assign result value to prevResult, add the result to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and exe.name is "sudo"', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'sudo';
				testSecondExe.args = [testFirstExe, 9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += isNaN(parseInt(args[i])) ? 0 : parseInt(args[i]);
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[1, testFirstExe], [0, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(3);
					expect(testArgs[0]).to.deep.equal({ content: [ 'sudo what? sudo please...' ], color: 'magenta' });
					expect(testArgs[1]).to.equal(3);
				
				});
			
			});
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, exe.name is sudo, and all commands in chainedExeMap have been executed', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'sudo';
				testSecondExe.args = [testFirstExe, 9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += args[i];
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {

					expect(testResult.output).to.be.an('object').with.property('color').that.equals('magenta');
					expect(testArgs).to.deep.equal([3]);
				
				});
			
			});
			it('should assign result value to prevResult, add the result to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and result is not a non-null object', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += args[i];
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(12);
					expect(testArgs).to.deep.equal([3, 3, 9]);
				
				});
			
			});
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, result is not a non-null object, and all commands in chainedExeMap have been executed', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var result = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							result += args[i];
						
						}
					
					}
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(12);
					expect(testArgs).to.deep.equal([3, 3, 9]);
				
				});
			
			});
			it('should assign result output property value to prevResult, add prevResult to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and result is a non-null object', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var output = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							output += args[i];
						
						}
					
					}
					var result = {
						output
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(12);
					expect(testArgs).to.deep.equal([3, 3, 9]);
				
				});
			
			});
			it('should assign value of result.redirect to the finalResult object property redirect if result is a non-null object with a string redirect property; the last returned value of redirect should be the only one returned in the redirect property', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var output = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							output += args[i];
						
						}
					
					}
					var result = {
						output,
						redirect: '/three/hundred/thirty/nine/' + output
					};
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.redirect).to.equal('/three/hundred/thirty/nine/' + testResult.output);
				
				});
			
			});
			it('should assign values of result.cookies to matching keys in the finalResult object property cookies if result is a non-null object with a non-null object cookies property; matching keys in different call results should be overwritten with the last value for the cookies key', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [9];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var output = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							output += args[i];
						
						}
					
					}
					var result = {
						output,
						redirect: '/three/hundred/thirty/nine/' + output,
						cookies: {overWrite: 'lastNo' + output}
					};
					result.cookies['c' + output] = 'cval' + output;
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.cookies).to.be.an('object');
					expect(testResult.cookies.c3).to.equal('cval3');
					expect(testResult.cookies.c12).to.equal('cval12');
					expect(testResult.cookies.overWrite).to.equal('lastNo12');
				
				});
			
			});
			it('should assign value of result.cwd to the finalResult object property redirect if result is a non-null object with a string cwd property; last cwd property passed should be the only string returned in cwd property', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [3];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var output = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							output += args[i];
						
						}
					
					}
					var result = {
						output,
						redirect: '/three/hundred/thirty/nine/' + output,
						cookies: {overWrite: 'lastNo' + output},
						cwd: output + '/feet/under'
					};
					result.cookies['c' + output] = 'cval' + output;
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.cwd).to.equal('6/feet/under');
				
				});
			
			});
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, result is a non-null object, and all commands in chainedExeMap have been executed', function() {
			
				var testFirstExe = getTestExe();
				var testSecondExe = getTestExe();
				testFirstExe.name = 'theme';
				testFirstExe.args = [3];
				testSecondExe.name = 'theme';
				testSecondExe.args = [3];
				testArgs = [];
				var globalBinThemeExecuteStub = sinon.stub(global.Uwot.Bin.theme, 'execute').callsFake(function returnError(args, opts, app, user, cb) {
				
					var output = 0;
					if ('object' == typeof args && Array.isArray(args) && args.length > 0) {
					
						testArgs = testArgs.concat(args);
						for (let i = 0; i < args.length; i++) {
						
							output += args[i];
						
						}
					
					}
					var result = {
						output,
						redirect: '/three/hundred/thirty/nine/' + output,
						cookies: {overWrite: 'lastNo' + output},
						cwd: output + '/feet/under'
					};
					result.cookies['c' + output] = 'cval' + output;
					return cb(false, result);
				
				});
				return expect(testRuntime.executeChainedMap(new Map([[0, testFirstExe], [1, testSecondExe]]))).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult.output).to.equal(6);
				
				});
			
			});
		
		});
		describe('fileOutputConsoleString(fileName, opts, successful)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.fileOutputConsoleString).to.be.a('function');
			
			});
			it('should return a string containing value of fileName arg', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains(testFileName);
			
			});
			it('should return a string containing "successful" if value of successful arg is truthy', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('successful');
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, 1)).to.be.a('string').that.contains('successful');
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, 'false')).to.be.a('string').that.contains('successful');
			
			});
			it('should return a string containing "failed" if value of successful arg is falsey', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, false)).to.be.a('string').that.contains('failed');
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts)).to.be.a('string').that.contains('failed');
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, 0)).to.be.a('string').that.contains('failed');
			
			});
			it('should return a string containing "append" if value of opts.append is truthy', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: true,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('append');
				testOpts.append = 1;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('append');
				testOpts.append = 'false';
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('append');
			
			});
			it('should return a string containing "new file write" if value of opts.noclobber is truthy', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('new file write');
				testOpts.noclobber = 1;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('new file write');
				testOpts.noclobber = 'false';
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('new file write');
			
			});
			it('should return a string containing "file overwrite" if value of opts.append and opts.noclobber is falsey', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: false
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('file overwrite');
				testOpts.noclobber = 0;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('file overwrite');
				delete testOpts.noclobber;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, true)).to.be.a('string').that.contains('file overwrite');
			
			});
			it('should return a string containing "file overwrite" and "failed" if value of opts.append and opts.noclobber is falsey and successful is falsey', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: false,
					noclobber: false
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, false)).to.be.a('string').that.contains('file overwrite failed');
				testOpts.noclobber = 0;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts)).to.be.a('string').that.contains('file overwrite failed');
				delete testOpts.noclobber;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, 0)).to.be.a('string').that.contains('file overwrite failed');
			
			});
			it('should return a string containing "file overwrite" and "failed" if value of opts.append and opts.noclobber is falsey and successful is falsey', function() {
			
				var testFileName = 'Drisma';
				var testOpts = {
					append: true,
					noclobber: true
				};
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, false)).to.be.a('string').that.contains('append failed');
				testOpts.append = 1;
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts)).to.be.a('string').that.contains('append failed');
				testOpts.append = 'false';
				expect(testRuntime.fileOutputConsoleString(testFileName, testOpts, 0)).to.be.a('string').that.contains('append failed');
			
			});
		
		});
		describe('getConsoleOutputForExe(outputData, exeOutput, userId)', function() {
		
			var testRuntime;
			beforeEach(function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
			
			});
			it('should be a function', function() {
			
				expect(testRuntime.getConsoleOutputForExe).to.be.a('function');
			
			});
			it('should return a Promise', function() {
			
				expect(testRuntime.getConsoleOutputForExe().catch((e) => { return; })).to.be.a('Promise');
			
			});
			it('should return a Promise rejected with a TypeError if exeOutput arg is not an object', function() {
			
				return expect(testRuntime.getConsoleOutputForExe()).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('invalid output object passed to getConsoleOutputForExe');
			
			});
			it('should return a Promise resolved with the value of outputData if exeOutput is null', function() {
			
				var testOutputData = 'I was having a sunny day';
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, null)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.equal(testOutputData);
				
				});
			
			});
			it('should return a Promise rejected with a TypeError if exeOutput is not null and exeOutput.text arg is not a string', function() {
			
				var testOutputData = 'I was having a sunny day';
				var testExeOutput = {};
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('invalid output filename passed to getConsoleOutputForExe');
			
			});
			it('should return a Promise rejected with a TypeError if exeOutput is not null and exeOutput.options arg is not a non-null object', function() {
			
				var testOutputData = 'I was having a sunny day';
				var testExeOutput = {
					text: 'Drisma'
				};
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('invalid output options passed to getConsoleOutputForExe');
				testExeOutput.options = null;
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('invalid output options passed to getConsoleOutputForExe');
			
			});
			it('should use the result of ansiToText with outputData arg value to generate text to output to file if exeOutput is a valid output object', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: false,
						noclobber: false
					}
				};
				var fsWriteStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'write').callsFake(function returnErrorWithText(file, text) {
				
					return new Error(text);
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.rejectedWith(Error).with.property('message').that.contains(testOutputData.content[0]);
			
			});
			it('should use the user FileSystem append method to write outputText to existing file if exeOutput.options.append is truthy', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: true,
						noclobber: false
					}
				};
				var fsAppendStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'append').callsFake(function returnTrue(file, text) {
				
					return true;
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.a('string').that.contains('append was successful');
					expect(fsAppendStub.called).to.be.true;
					expect(fsAppendStub.getCall(0).args[0]).to.equal(testExeOutput.text);
					expect(fsAppendStub.getCall(0).args[1]).to.equal(testOutputData.content[0]);
				
				});
			
			});
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is truthy, and append method call returns an error', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: true,
						noclobber: false
					}
				};
				var fsAppendStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'append').callsFake(function returnError(file, text) {
				
					return new Error('test append error');
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.rejectedWith(Error).with.property('message').that.contains('test append error');
			
			});
			it('should use the user FileSystem resolvePath method to verify if file exists prior to write operation if exeOutput.options.append is falsey', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: false,
						noclobber: true
					}
				};
				var fsResolvePathStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'resolvePath').callsFake(function returnErrorWithPath(path) {
				
					return new Error(path);
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.be.rejectedWith(Error).then((testResult) => {
				
					expect(fsResolvePathStub.called).to.be.true;
					expect(fsResolvePathStub.getCall(0).args[0]).to.equal(testExeOutput.text);
				
				});
			
			});
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is falsey, noclobber is truthy, and file exists', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: false,
						noclobber: true
					}
				};
				var fsResolvePathStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'resolvePath').callsFake(function returnErrorWithPath(path) {
				
					return '/' + path;
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.be.rejected.then((testResult) => {
				
					expect(testResult).to.be.an.instanceof(Error).with.property('message').that.contains('cannot overwrite: file exists and noclobber is true');
				
				});
			
			});
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is falsey, noclobber is falsey & file exists, or file does not exist, and FileSystem write method call returns an error', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: false,
						noclobber: false
					}
				};
				var fsResolvePathStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'resolvePath').callsFake(function returnErrorWithPath(path) {
				
					return '/' + path;
				
				});
				var fsWriteStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'write').returns(new Error('test write error'));
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.be.rejected.then((testResult) => {
				
					expect(testResult).to.be.an.instanceof(Error).with.property('message').that.contains('test write error');
				
				});
			
			});
			it('should return a Promise resolved with the result of fileOutputConsoleString if exeOutput.options.append is falsey and noclobber is falsey & file exists, or file does not exist, and the FileSystem write operation completes without error', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: false,
						noclobber: true
					}
				};
				var fsResolvePathStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'resolvePath').callsFake(function returnErrorWithPath(path) {
				
					return systemError.ENOENT({syscall: 'stat', target: path});
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.a('string').that.contains('new file write was successful');
				
				});
			
			});
			it('should return a Promise resolved with the result of fileOutputConsoleString if the FileSystem append operation completes without error', function() {
			
				var testOutputData = {content: ['I was having a sunny day']};
				var testExeOutput = {
					text: 'Drisma',
					options: {
						append: true,
						noclobber: false
					}
				};
				var fsAppendStub = sinon.stub(global.Uwot.FileSystems[testRuntime.user._id], 'append').callsFake(function returnTrue(file, text) {
				
					return true;
				
				});
				return expect(testRuntime.getConsoleOutputForExe(testOutputData, testExeOutput)).to.eventually.be.fulfilled.then((testResult) => {
				
					expect(testResult).to.be.a('string').that.contains('append was successful');
				
				});
			
			});
		
		});
		describe('getInputForExe(exeInput, userId)', function() {
		
			it('should be a function');
			it('should return a Promise');
			it('should return a Promise resolved with null if exeInput is null');
			it('should return a Promise rejected with a TypeError if exeInput is not null or an object with a property type that equals "Word"');
			it('should include the value of exeInput.text in the TypeError message if exeInput is not null or an object with a property type that equals "Word" but exeInput.text is a string');
			it('should attempt to use user FileSystem method readFile called with exeInput.text to read data from specified input');
			it('should return a Promise rejected with an Error if the readFile method call throws an error');
			it('should return a Promise rejected with an Error if the readFile method call returns an error');
			it('should return a Promise resolved with the result of the readFile method call if the process completes without error');
		
		});

	});

});
