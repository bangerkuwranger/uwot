var path = require('path');
var globalSetupHelper = require('../helpers/globalSetup');
var listenerError = require('../helpers/UwotListenerError');

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
	
		});
		describe('handler(args)', function() {
		
			it('should be a function', function() {
			
				expect(testListener.handler).to.be.a('function');
			
			});
			it('should return a Promise', function() {
			
				testListener.status = 'disabled';
				expect(testListener.handler()).to.be.a('Promise');
			
			});
		
		});
		describe('enable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.enable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.enable()).to.equal(testListener.status);
			
			});
		
		});
		describe('disable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.disable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.disable()).to.equal(testListener.status);
			
			});
		
		});

	});

});
