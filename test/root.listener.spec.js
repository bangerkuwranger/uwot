var path = require('path');
var globalSetupHelper = require('../helpers/globalSetup');
var ListenerError = require('../helpers/UwotListenerError');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Listener = require('../listener');
var testListener;
if('object' !== typeof global.Uwot || 'object' !== typeof global.Uwot.Constants) {
		
	globalSetupHelper.initGlobalObjects();
	globalSetupHelper.initConstants();

}
const testIsid = "SBuXMoJxjj-uEDzF2gy0n8g6";
const testListenerName = 'testListener';
const getTestListenerOpts = function() {

	return {
		type:			'additional',
		parser:			'cmdParser',
		parserPath:		path.join(global.Uwot.Constants.appRoot, 'parser/defaultCmdParser.js'),
		output:			'ansi',
		outputPath:		path.join(global.Uwot.Constants.appRoot, 'output/ansi.js'),
		routerPath:		path.join(global.Uwot.Constants.appRoot, 'routes/path.js'),
		routeUriPath:	'/testListener',
		cmdSet: 		['fwd', 'cc', 'bcc']
	};
	
};

describe('instanceSessions.js', function() {

	before(function() {
	
		if('object' !== typeof global.Uwot || 'object' !== typeof global.Uwot.Constants) {
		
			globalSetupHelper.initGlobalObjects();
		
		}
		if('string' !== typeof global.Uwot.Constants.appRoot) {
		
			globalSetupHelper.initConstants();
		
		}
	
	});
	describe('UwotListener', function() {
	
		beforeEach(function() {
		
			testListener = new Listener(
				testListenerName,
				testIsid,
				getTestListenerOpts()
			);
		
		});
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(name, instanceSessionId, options)', function() {
	
			it('should be a function', function() {
			
				expect(Listener).to.be.a('function');
			
			});
			it('should throw a TypeError if name arg is not a string');
			it('should throw a TypeError if instanceSessionId is not a string');
			it('should initialize global.Uwot.Listeners with an empty object if it is not an object');
			it('should initialize global.Uwot.Listeners[instanceSessionId] with an empty object if it is not an object');
			it('should throw an Error if global.Uwot.Listeners[instanceSessionId][name] is an existing object');
			it('should set its name property to the name arg value');
			it('should set its isid property to the isid arg value');
			it('should use the default listener options if options arg value is not a non-null object');
			it('should throw an Error if options.type is "default" and default global listener already exists for isid');
			it('should set its type property to options.type value if it is a string that is a member of global.Uwot.Constants.listenerTypes');
			it('should set its type property to default type value if options.type is not a string or not a member of global.Uwot.Constants.listenerTypes');
			it('should set its parser property to options.parser if it is a string that is a member of global.Uwot.Constants.listenerParserTypes');
			it('should set its parser property to default parser value if options.parser is not a string or not a member of global.Uwot.Constants.listenerParserTypes');
			it('should set its parserPath property to options.parserPath if it is a string');
			it('should set its parserPath property to default parserPath value if options.parserPath is not a string');
			it('should set its output property to options.output if it is a string that is a member of global.Uwot.Constants.listenerOutputTypes');
			it('should set its output property to default output value if options.output is not a string or not a member of global.Uwot.Constants.listenerOutputTypes');
			it('should set its outputPath property to options.outputPath if it is a string');
			it('should set its outputPath property to default outputPath value if options.outputPath is not a string');
			it('should set its routerPath property to options.routerPath if it is a string');
			it('should set its routerPath property to default routerPath value if options.routerPath is not a string');
			it('should set its routeUriPath property to options.routeUriPath if it is a string');
			it('should set its routeUriPath property to default routeUriPath value if options.routeUriPath is not a string');
			it('should set its cmdSet property to options.cmdSet if it is a Array');
			it('should set its cmdSet property to default cmdSet value if options.cmdSet is not a Array');
			it('should throw an Error if require(this.routerPath) throws an Error');
			it('should set this.parserFunction to require(this.routerPath)[this.parserPath] if this.parser is "internal"');
			it('should set this.parserFunction to require(this.parserPath) if this.parser is "external" or "default"');
			it('should set this.outputFunction to require(this.routerPath)[this.outputPath] if this.output is "internal"');
			it('should set this.outputFunction to require(this.outputPath) if this.output is "external" or "default"');
			it('should set this.status to "enabled" if this.type is "default"');
			it('should set this.status to "disabled" if this.type is not "default"');
	
		});
		describe('handler(args)', function() {
		
			it('should be a function', function() {
			
				expect(testListener.handler).to.be.a('function');
			
			});
			it('should return a Promise', function() {
			
				testListener.status = 'disabled';
				expect(testListener.handler()).to.be.a('Promise');
			
			});
			it('should return a Promise rejected with null if this.status is not "enabled"');
			it('should return a Promise rejected with a ListenerError if args.cmd is not a string');
			it('should truncate args.cmd to 1024 chars if it is a string');
			it('should return a Promise rejected with a ListenerError if args.app is not a function');
			it('should set args.isAuthenticated to false if it is not a boolean');
			it('should truncate args.userId to 255 chars if it is a string');
			it('should set args.isid to this.isid if it is not passed as a non-empty string');
			it('should call its parserFunction with args as the first argument');
			it('should return a Promise rejected with an Error if the parserFunction returns an Error to callback');
			it('should return a Promise resolved with the result object of the parserFunction if it does not return an Error to callback');
			it('should set the result object\'s outputHandler to a function that returns a Promise resolved by the result of this.outputFunction(outputObj)');
		
		});
		describe('enable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.enable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.enable()).to.equal(testListener.status);
			
			});
			it('should set this.status to "enabled"');
		
		});
		describe('disable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.disable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.disable()).to.equal(testListener.status);
			
			});
			it('should set this.status to "disabled"');
		
		});

	});

});
