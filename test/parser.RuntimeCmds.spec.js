const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const globalSetupHelper = require('../helpers/globalSetup');
const AbstractRuntime = require('../parser/AbstractRuntime');
const sanitize = require('../helpers/valueConversion');
const systemError = require('../helpers/systemError');
const ansiToText = require('../output/ansiToText');

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
		"_id": "CDeOOrH0gOg791cZ"
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
		global.Uwot.Users.getGuest(function(error, guestUser) {

			testGuestUser = guestUser;
			return;

		});
	
	});
	describe('UwotRuntimeCmds', function() {
	
		it('should implement AbstractRuntime');
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
				expect(testRuntime.user).to.deep.equal(getTestUser());
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
		
			it('should be a function', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.addAppInstance).to.be.a('function');
			
			});
			it('should be inherited from AbstractRuntime', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.addAppInstance).to.deep.equal(AbstractRuntime.prototype.addAppInstance);
			
			});
			it('should assign the app arg value of the runtime instance to its app property', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				var testApp = function() {return {isApp: true}; };
				testRuntime.addAppInstance(testApp)
				expect(testRuntime.app).to.deep.equal(testApp);
			
			});
		
		});
		describe('addInstanceSessionId(isid)', function() {
		
			it('should be a function', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.addInstanceSessionId).to.be.a('function');
			
			});
			it('should be inherited from AbstractRuntime', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				expect(testRuntime.addInstanceSessionId).to.deep.equal(AbstractRuntime.prototype.addInstanceSessionId);
			
			});
			it('should assign the isid arg value of the runtime instance to its isid property', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				var testIsid = 'SBuXMoJxjj-uEDzF2gy0n8g6';
				testRuntime.addInstanceSessionId(testIsid)
				expect(testRuntime.isid).to.equal(testIsid);
			
			});
		
		});
		describe('buildCommands()', function() {
		
			it('should be a function', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				expect(testRuntime.buildCommands).to.be.a('function');
			
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
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(noCommandsAst, getTestUser());
				buildCommandsStub.restore();
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
			
			});
			it('should loop through each node in this.ast.commands and set a Map value for an increasing integer key to the result of the parseCommandNode method called with the node as an arg', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
				expect(testRuntime.exes.get(0)).to.deep.equal(getTestExe());
			
			});
			it('should return the final value of the exes property', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandNodeStub = sinon.stub(testRuntime, 'parseCommandNode').returns(getTestExe());
				var testReturn = testRuntime.buildCommands();
				expect(testRuntime.exes).to.be.a('Map');
				expect(testRuntime.exes).to.deep.equal(testReturn);
			
			});
		
		});
		describe('executeCommands(cb)', function() {
		
			it('should be a function', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').returns(new Map());
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				expect(testRuntime.executeCommands).to.be.a('function');
			
			});
			it('should call the executeMap method with the exes property as the arg', function(done) {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
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
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
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
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
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
		
			it('should be a function', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				expect(testRuntime.parseCommandNode).to.be.a('function');
			
			});
			it('should throw a TypeError if astCmd is not an object with property type that is a string with value matching a member of global.Uwot.Constants.commandTypes', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
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
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns('test parseCommand output');
				var testAstCmd = {type: 'Command'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseCommand output');
				parseCommandStub.restore();
			
			});
			it('should set output to null if arg is undefined', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(parseCommandStub.calledWith(testAstCmd, null, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should use output arg value if defined', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testOutput = 'test output';
				var returned = testRuntime.parseCommandNode(testAstCmd, testOutput);
				expect(parseCommandStub.calledWith(testAstCmd, testOutput, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should set input to null if arg is undefined', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testOutput = 'test output';
				var returned = testRuntime.parseCommandNode(testAstCmd, testOutput);
				expect(parseCommandStub.calledWith(testAstCmd, testOutput, null)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should use input arg value if defined', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseCommandStub = sinon.stub(testRuntime, 'parseCommand').returns({});
				var testAstCmd = {type: 'Command'};
				var testInput = 'test input';
				var returned = testRuntime.parseCommandNode(testAstCmd, null, testInput);
				expect(parseCommandStub.calledWith(testAstCmd, null, testInput)).to.be.true;
				parseCommandStub.restore();
			
			});
			it('should return the value of this.parsePipeline(astCmd) if astCmd.type is "Pipeline"', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parsePipelineStub = sinon.stub(testRuntime, 'parsePipeline').returns('test parsePipeline output');
				var testAstCmd = {type: 'Pipeline'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parsePipeline output');
				parsePipelineStub.restore();
			
			});
			it('should return the value for this.parseFunction(astCmd) if astCmd.type is "Function"', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseFunctionStub = sinon.stub(testRuntime, 'parseFunction').returns('test parseFunction output');
				var testAstCmd = {type: 'Function'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseFunction output');
				parseFunctionStub.restore();
			
			});
			it('should return the value for this.parseConditional(astCmd.type, astCmd.then, args) if astCmd.type is "If"', function() {
			
				var buildCommandsStub = sinon.stub(RuntimeCmds.prototype, 'buildCommands').callsFake(function setExes() {
				
					var exes = new Map();
					this.exes = exes;
					return exes;
				
				});
				var testRuntime = new RuntimeCmds(getTestAst(), getTestUser());
				buildCommandsStub.restore();
				var parseConditionalStub = sinon.stub(testRuntime, 'parseConditional').returns('test parseConditional output');
				var testAstCmd = {type: 'If'};
				var returned = testRuntime.parseCommandNode(testAstCmd);
				expect(returned).to.equal('test parseConditional output');
				parseConditionalStub.restore();
			
			});
		
		});
		describe('parseCommand(astCommand, output, input)', function() {
		
			it('should be a function');
		
		});
		describe('parseLoop(loopType, loopNodes)', function() {
		
			it('should be a function');
		
		});
		describe('parseConditional(condType, condNodes, condArgs)', function() {
		
			it('should be a function');
		
		});
		describe('parseFunction(fName, fBody, fRedirect)', function() {
		
			it('should be a function');
		
		});
		describe('parsePipeline(astCommands)', function() {
		
			it('should be a function');
		
		});
		describe('outputLine(output, type)', function() {
		
			it('should be a function');
		
		});
		describe('executeMap(exeMap, outputType)', function() {
		
			it('should be a function');
		
		});
		describe('fileOutputConsoleString(fileName, opts, successful)', function() {
		
			it('should be a function');
		
		});
		describe('getConsoleOutputForExe(outputData, exeOutput, userId)', function() {
		
			it('should be a function');
		
		});
		describe('getInputForExe(exeInput, userId)', function() {
		
			it('should be a function');
		
		});

	});

});
