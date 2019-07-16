const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const AbstractRuntime = require('../parser/AbstractRuntime');
const sanitize = require('../helpers/valueConversion');
const systemError = require('../helpers/systemError');
const ansiToText = require('../output/ansiToText');

const RuntimeCmds = require('../parser/RuntimeCmds');

describe('RuntimeCmds.js', function() {

	describe('UwotRuntimeCmds', function() {
	
		it('should implement AbstractRuntime');
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(ast, user)', function() {
		
			it('should be a function');
			it('should throw a TypeError if passed ast arg value that is not an object with a type property equal to "Script" and a commands property that is not an object');
			it('should assign the value of the ast arg to its ast property');
			it('should assign the value of the user arg to its user property');
			it('should assign false to its fx property if config setting users:allowShellFunctions is true, this.user.uName is a string, and user is a guest while config setting users:alloweGuestShellFunctions is false');
			it('should initialize the fx property with an empty Map if users:allowShellFunctions is true and user is not a guest');
			it('should initialize the fx property with an empty Map if users:allowShellFunctions is true, users:allowGuestShellFunctions is true, and user is a guest');
			it('should leave the fx property undefined if the config setting users:allowShellFunctions is false');
			it('should call its buildCommands method');
		
		});
		describe('addAppInstance(app)', function() {
		
			it('should be a function');
			it('should be inherited from AbstractRuntime');
			it('should assign the app arg value of the runtime instance to its app property');
		
		});
		describe('addInstanceSession(isid)', function() {
		
			it('should be a function');
			it('should be inherited from AbstractRuntime');
			it('should assign the isid arg value of the runtime instance to its isid property');
		
		});
		describe('buildCommands()', function() {
		
			it('should be a function');
			it('should initialize its exes property with an empty Map');
			it('should loop through each node in this.ast.commands and set a Map value for an increasing integer key to the result of the parseCommandNode method called with the node as an arg');
			it('should return the final value of the exes property');
		
		});
		describe('executeCommands(cb)', function() {
		
			it('should call the executeMap method with the exes property as the arg');
			it('should then set the results of the executeMap method to the results property');
			it('should return the results of the executeMap method call to the callback arg function');
		
		});
		describe('parseCommandNode(astCmd, output, input)', function() {
		
			it('should be a function');
		
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
