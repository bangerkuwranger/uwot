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
			it('should return an exe object if the operations complete without error');
			it('should return an exe object with name property "LogicalExpression", op property "or" or "and", a left property that is an exe resulting from running parseCommandNode on condNodes[0], and a right property that is an exe resulting from running parseCommandNode on condNodes[1] if condType is "LogicalExpression"');
			it('should return an exe object with name property "If", clause property that is an exe resulting from running parseCommandNode on condArgs.clause, and then property that is an exe resulting from running parseCommandNode on condNodes if condType is "If"');
			it('should return an exe object with a property else that is an exe that results from running parseCommandNode on condArgs.else if condType is "If" and condArgs.else is an Array');
		
		});
		describe('parseFunction(fName, fBody, fRedirect)', function() {
		
			it('should be a function');
			it('is not implemented and only returns void or undefined');
		
		});
		describe('parsePipeline(astCommands)', function() {
		
			it('should be a function');
			it('should return a Promise resolved with a static exe if executeChainedMap completes without error');
			it('should return a Promise rejected with an error if executeChainedMap returns an error');
			it('should create the chained map from the array of nodes passed in astCommands by running parseCommandNode on each element');
		
		});
		describe('outputLine(output, type)', function() {
		
			it('should be a function');
			it('should default type arg to "ansi" if passed type arg value is not a string');
			it('should serialize the output arg value to JSON prior to processing if it is not a string and output type is not "object" or "ansi"');
			it('should serialize the output arg value to JSON prior to processing if type is "ansi" and it is passed as a non-array, non-Error object that does not have an array as its content property');
			it('should return the output arg value as a string if type is not "object" or "ansi"');
			it('should return the output arg value unchanged if type arg value is "object" and output is an object');
			it('should return an object with property "content" assigned output value if type arg value is "object" and output arg value is not an object');
			it('should return an object with a content property that is an array if type arg value is "ansi"');
			it('should add an empty br tag member to the end of the content property array of the returned object if type arg value is "ansi"');
			it('should add a red text span element member with content property "Error: \r\n", and a second member that is a string with the value of error message if type arg value is "ansi" and output arg value is an Error');
			it('should add the value of the output arg to the return object content property array as a memeber if type arg value is "ansi" and it is an object with a content property that is an Array');
			it('should add the value of the output arg as a string to the return object content property array as a memeber if type arg value is "ansi" and it is an not an Error or object with an array property "content"');
		
		});
		describe('executeMap(exeMap, outputType)', function() {
		
			it('should be a function');
			it('should return a Promise');
			it('should return a Promise resolved with the result of this.outputLine called with a TypeError if exeMap arg value is not a Map object');
			it('should return a Promise resolved with a unfilled results object (output & operations props are empty arrays, cookies is an empty object) if exeMap arg value is a Map with size less than one');
			it('should include the result of this.outputLine called with a TypeError in return object output property array if a value in exeMap is not a non-null object');
			it('should include the result of this.outputLine called with the value of its error property in return object output property array if a value in exeMap has a defined error property');
			it('should not include a value in return object output array for a value in exeMap that is an operation if user is a guest, config value users:allowGuest is false, and its name property is not "login"');
			it('should include a value in return object output array containing the result of this.outputLine called with a string containing the operation name for a value in exeMap that is an operation if user is a guest while config value users:allowGuest is true, user is an authenticated user, or its name property is "login"');
			it('should include a value in return object operations array that matches the exeMap node value for a value in exeMap that is an operation if user is a guest while config value users:allowGuest is true, user is an authenticated user, or its name property is "login"');
			it('should not include a value in return object output array for a value in exeMap that is not an operation if user is a guest and config value users:allowGuest is false');
			it('should attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe if user is a guest and config value users:allowGuest is true or user is authenticated');
			it('should add a member to return object output array value containing the result of this.outputLine called with an input error if user is a guest and config value users:allowGuest is true or user is authenticated and attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe results in an input error');
			it('should add inputData as the first element in exe.args array prior to execution attempt if attempt to get the input for a command for a value in exeMap that is not an operation using this.getInputFoeExe successfully returns a string of inputData and user is a guest while config value users:allowGuest is true or user is an authenticated user');
			it('should use an Error as the first argument in getConsoleOutputForExe if the execute method call returns an error to callback for a non-operation member of exeMap for an allowed user');
			it('should use the result returned to the execute method callback as the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback and its name property is "sudo" for a non-operation member of exeMap for an allowed user');
			it('should use the result of this.outputLine called with the result returned to the execute method callback and "object" for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback and the result.outputType is "object" for a non-operation member of exeMap for an allowed user');
			it('should use the result of this.outputLine called with the output property of result returned to the execute method callback and "object" for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback and the result.outputType is "object" and result.output is an object for a non-operation member of exeMap for an allowed user');
			it('should assign value of redirect property of result returned to the execute method callback to return object redirect property if the execute method call does not return an error to callback, the result.outputType is "object", and the result redirect property is a string for a non-operation member of exeMap for an allowed user');
			it('should assign values of cookies property of result returned to the execute method callback to to matched keys of return object cookies property if the execute method call does not return an error to callback, the result.outputType is "object", and the result cookies property is a non-null object for a non-operation member of exeMap for an allowed user');
			it('should use the result of this.outputLine called with the result returned to the execute method callback and its outputType property value for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback, the result.outputType is not "object", and result.output is not an object for a non-operation member of exeMap for an allowed user');
			it('should use the result of this.outputLine called with the output property of result returned to the execute method callback and its outputType property value for the first argument in getConsoleOutputForExe if the execute method call does not return an error to callback, the result.outputType is not "object", and result.output is an object for a non-operation member of exeMap for an allowed user');
			it('should assign value of cwd property of result returned to the execute method callback to return object cwd property if the execute method call does not return an error to callback, the result is an object, and the result cwd property is a string for a non-operation member of exeMap for an allowed user');
			it('should attempt to get consoleOutput value using getConsoleOutputForExe with outputData for a non-operation member of exeMap for an allowed user if execute method call does not return an error, and should add the result to the return object output array if the exeMap member output property is null');
			it('should add the value of exeMap member output property to the return object output array if the exeMap member output property is not null and the getConsoleOutputForExe call does not throw an error');
			it('should add the result of outputLine called with the output error to the return object output array if the getConsoleOutputForExe call does throw an error');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after determining that user is not allowed to execute current member of exeMap, all members of exeMap have attempted to execute');
			it('should finally resolve if, after determining that user is not allowed to execute current member of exeMap, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after catching a thrown error during execute method call, all members of exeMap have attempted to execute');
			it('should finally resolve if, after catching a thrown error during execute method call, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after catching an output error, all members of exeMap have attempted to execute');
			it('should finally resolve if, after catching an output error, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after successfully adding consoleOutput or exe.output to return object output property array, all members of exeMap have attempted to execute');
			it('should finally resolve if, after successfully adding consoleOutput or exe.output to return object output property array, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after catching an input error, all members of exeMap have attempted to execute');
			it('should finally resolve if, after catching an input error, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after determining user is not allowed to execute an operation, all members of exeMap have attempted to execute');
			it('should finally resolve if, after determining user is not allowed to execute an operation, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after adding an allowed operation to the return object operations property array, all members of exeMap have attempted to execute');
			it('should finally resolve if, after adding an allowed operation to the return object operations property array, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after processing a member of exeMap with a defined error property, all members of exeMap have attempted to execute');
			it('should finally resolve if, after processing a member of exeMap with a defined error property, all members of exeMap have attempted to execute');
			it('should check if a disallowed user has a return object with no output or operations, and add a message to implore user to login to output, if, after processing a member of exeMap that is not a non-null object, all members of exeMap have attempted to execute');
			it('should finally resolve if, after processing a member of exeMap that is not a non-null object, all members of exeMap have attempted to execute');
		
		});
		describe('executeChainedMap(chainedExeMap)', function() {
		
			it('should be a function');
			it('should return a Promise');
			it('should return a Promise rejected with a TypeError if chainedExeMap is not a Map object');
			it('should return a Promise rejected with a TypeError if chainedExeMap is an empty Map object');
			it('should return a Promise rejected with a TypeError if any member of chainedExeMap is not a non-null object');
			it('should return a Promise rejected with the value of the member error property if any member of chainedExeMap has a defined error property');
			it('should return a Promise rejected with a TypeError if any member of chainedExeMap is an operation');
			it('should add the result of the previous command execution to the beginning of the current node args array prior to execution if it is not the first member of chainedExeMap');
			it('should return a Promise rejected with an Error if user does not have permission to execute any member of chainedExeMap');
			it('should assign error value to prevResult, add the error to the resultMap, and move to the next node execution if calling the execute method for a command returns an error to the callback');
			it('should return the Promise resolved with a finalResult object if execute method call returns an error to callback and all commands in chainedExeMap have been executed');
			it('should assign result value to prevResult, add the result to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and exe.name is "sudo"');
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, exe.name is sudo, and all commands in chainedExeMap have been executed');
			it('should assign result value to prevResult, add the result to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and result is not a non-null object');
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, result is not a non-null object, and all commands in chainedExeMap have been executed');
			it('should assign result output property value to prevResult, add prevResult to the resultMap, and move to the next node execution if calling the execute method for a command does not return an error to the callback and result is a non-null object');
			it('should assign value of result.redirect to the finalResult object property redirect if result is a non-null object with a string redirect property');
			it('should assign values of result.cookies to matching keys in the finalResult object property cookies if result is a non-null object with a non-null object cookies property');
			it('should assign value of result.cwd to the finalResult object property redirect if result is a non-null object with a string cwd property');
			it('should return the Promise resolved with a finalResult object if execute method call does not return an error to callback, result is a non-null object, and all commands in chainedExeMap have been executed');
		
		});
		describe('fileOutputConsoleString(fileName, opts, successful)', function() {
		
			it('should be a function');
			it('should return a string containing value of fileName arg');
			it('should return a string containing "successful" if value of successful arg is truthy');
			it('should return a string containing "failed" if value of successful arg is falsey');
			it('should return a string containing "append" if value of opts.append is truthy');
			it('should return a string containing "new file write" if value of opts.noclobber is truthy');
			it('should return a string containing "file overwrite" if value of opts.append and opts.noclobber is falsey');
		
		});
		describe('getConsoleOutputForExe(outputData, exeOutput, userId)', function() {
		
			it('should be a function');
			it('should return a Promise');
			it('should return a Promise rejected with a TypeError if exeOutput arg is not an object');
			it('should return a Promise resolved with the value of outputData if exeOutput is null');
			it('should return a Promise rejected with a TypeError if exeOutput is not null and exeOutput.text arg is not a string');
			it('should return a Promise rejected with a TypeError if exeOutput is not null and exeOutput.options arg is not a non-null object');
			it('should use the result of ansiToText with outputData arg value to generate text to output to file if exeOutput is a valid output object');
			it('should use the user FileSystem append method to write outputText to existing file if exeOutput.options.append is truthy');
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is truthy, and append method call returns an error');
			it('should use the user FileSystem resolvePath method to verify if file exists prior to write operation if exeOutput.options.append is falsey');
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is falsey, noclobber is truthy, and file exists');
			it('should return a Promise rejected with an Error with a message containing result of fileOutputConsoleString if append is falsey, noclobber is falsey & file exists, or file does not exist, and FileSystem write method call returns an error');
			it('should use the user FileSystem write method to verify if file exists prior to write operation if exeOutput.options.append is falsey and noclobber is falsey & file exists, or file does not exist');
			it('should return a Promise resolved with the result of fileOutputConsoleString if the FileSystem write or append operation completes without error');
		
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
