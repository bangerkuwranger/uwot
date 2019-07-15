var path = require('path');
var globalSetupHelper = require('../helpers/globalSetup');
var ListenerError = require('../helpers/UwotListenerError');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

const Listener = require('../listener');
var testListener;
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
			it('should throw a TypeError if name arg is not a string', function() {
			
				function throwTypeError() {
				
					return new Listener();
				
				}
				expect(throwTypeError).to.throw(TypeError, 'invalid name passed to UwotListener contstructor')
			
			});
			it('should throw a TypeError if instanceSessionId is not a string', function() {
			
				function throwTypeError() {
				
					return new Listener(testListenerName);
				
				}
				expect(throwTypeError).to.throw(TypeError, 'invalid instanceSessionId passed to UwotListener contstructor')
			
			});
			it('should initialize global.Uwot.Listeners with an empty object if it is not an object', function() {
			
				delete global.Uwot.Listeners;
				expect(global.Uwot.Listeners).to.be.undefined;
				testListener = new Listener(testListenerName, testIsid, {type: 'additional'});
				expect(global.Uwot.Listeners).to.be.an('object');
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should initialize global.Uwot.Listeners[instanceSessionId] with an empty object if it is not an object', function() {
			
				delete global.Uwot.Listeners[testIsid];
				expect(global.Uwot.Listeners[testIsid]).to.be.undefined;
				testListener = new Listener(testListenerName, testIsid, {type: 'additional'});
				expect(global.Uwot.Listeners[testIsid]).to.be.an('object');
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should throw an Error if global.Uwot.Listeners[instanceSessionId][name] is an existing object', function() {
			
				global.Uwot.Listeners[testIsid][testListenerName] = new Date();
				function throwExistsError() {
				
					testListener = new Listener(testListenerName, testIsid, {type: 'additional'});
				
				}
				expect(throwExistsError).to.throw(Error, 'not unique for isid');
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its name property to the name arg value', function() {
			
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(testListenerName, testIsid, {type: 'additional'});
				expect(testListener).to.be.an('object').with.property('name').that.equals(testListenerName);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its isid property to the isid arg value', function() {
			
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(testListenerName, testIsid, {type: 'additional'});
				expect(testListener).to.be.an('object').with.property('isid').that.equals(testIsid);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should use the default listener options if options arg value is not a non-null object', function() {
			
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener('default', testIsid, null);
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				expect(testListener.type).to.equal(defaultOpts.type);
				expect(testListener.parser).to.equal(defaultOpts.parser);
				expect(testListener.parserPath).to.equal(defaultOpts.parserPath);
				expect(testListener.output).to.equal(defaultOpts.output);
				expect(testListener.outputPath).to.equal(defaultOpts.outputPath);
				expect(testListener.routerPath).to.equal(defaultOpts.routerPath);
				expect(testListener.routeUriPath).to.equal(defaultOpts.routeUriPath);
				expect(testListener.cmdSet).to.equal(defaultOpts.cmdSet);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should throw an Error if options.type is "default" and default global listener already exists for isid', function() {
			
				delete global.Uwot.Listeners[testIsid];
				function throwDefaultExistsError() {
				
					testListener = new Listener(testListenerName, testIsid);
				
				}
				expect(throwDefaultExistsError).to.throw(Error, 'default listener already exists for isid ');
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its type property to options.type value if it is a string that is a member of global.Uwot.Constants.listenerTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				testListener = new Listener(testListenerName, testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('type').that.equals(testOpts.type);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its type property to default type value if options.type is not a string or not a member of global.Uwot.Constants.listenerTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.type = 'invalidType';
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('type').that.equals(defaultOpts.type);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its parser property to options.parser if it is a string that is a member of global.Uwot.Constants.listenerParserTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.parser = 'external';
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('parser').that.equals(testOpts.parser);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its parser property to default parser value if options.parser is not a string or not a member of global.Uwot.Constants.listenerParserTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.parser = 'invalidParserType';
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('parser').that.equals(defaultOpts.parser);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its parserPath property to options.parserPath if it is a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('parserPath').that.equals(testOpts.parserPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its parserPath property to default parserPath value if options.parserPath is not a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.parserPath = null;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('parserPath').that.equals(defaultOpts.parserPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its output property to options.output if it is a string that is a member of global.Uwot.Constants.listenerOutputTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('output').that.equals(testOpts.output);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its output property to default output value if options.output is not a string or not a member of global.Uwot.Constants.listenerOutputTypes', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.output = 'invalidOutputType';
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('output').that.equals(defaultOpts.output);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its outputPath property to options.outputPath if it is a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('outputPath').that.equals(testOpts.outputPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its outputPath property to default outputPath value if options.outputPath is not a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.outputPath = null;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('outputPath').that.equals(defaultOpts.outputPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its routerPath property to options.routerPath if it is a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('routerPath').that.equals(testOpts.routerPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its routerPath property to default routerPath value if options.routerPath is not a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.routerPath = null;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('routerPath').that.equals(defaultOpts.routerPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its routeUriPath property to options.routeUriPath if it is a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('routeUriPath').that.equals(testOpts.routeUriPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its routeUriPath property to default routeUriPath value if options.routeUriPath is not a string', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.routeUriPath = null;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('routeUriPath').that.equals(defaultOpts.routeUriPath);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its cmdSet property to options.cmdSet if it is a Array', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('cmdSet').that.equals(testOpts.cmdSet);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set its cmdSet property to default cmdSet value if options.cmdSet is not a Array', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.cmdSet = null;
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener).to.be.an('object').with.property('cmdSet').that.equals(defaultOpts.cmdSet);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should throw an Error if require(this.routerPath) throws an Error', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.routerPath = 'file/not/found.js';
				function throwSysError() {
				
					testListener = new Listener('default', testIsid, testOpts);
				
				}
				expect(throwSysError).to.throw(Error, 'Cannot find module');
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.parserFunction to require(this.routerPath)[this.parserPath] if this.parser is "internal"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.parser = 'internal';
				var testParserFunction = require(testOpts.routerPath)[testOpts.parserPath];
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener.parserFunction).to.deep.equal(testParserFunction);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.parserFunction to require(this.parserPath) if this.parser is "external" or "default"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.parser = 'external';
				var testParserFunction = require(testOpts.parserPath);
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener.parserFunction).to.deep.equal(testParserFunction);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.outputFunction to require(this.routerPath)[this.outputPath] if this.output is "internal"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.output = 'internal';
				var testOutputFunction = require(testOpts.routerPath)[testOpts.outputPath];
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener.outputFunction).to.deep.equal(testOutputFunction);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.outputFunction to require(this.outputPath) if this.output is "external" or "default"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				var testOpts = getTestListenerOpts();
				var defaultOpts = Listener.DEFAULT_UWOT_LISTENER_OPTIONS;
				testOpts.output = 'external';
				var testOutputFunction = require(testOpts.outputPath);
				testListener = new Listener('default', testIsid, testOpts);
				expect(testListener.outputFunction).to.deep.equal(testOutputFunction);
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.status to "enabled" if this.type is "default"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener('default', testIsid, null);
				expect(testListener.status).to.equal('enabled');
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
			});
			it('should set this.status to "disabled" if this.type is not "default"', function() {
			
				delete global.Uwot.Listeners[testIsid];
				testListener = new Listener(testListenerName, testIsid, getTestListenerOpts());
				expect(testListener.status).to.equal('disabled');
				testListener = new Listener(
					testListenerName,
					testIsid,
					getTestListenerOpts()
				);
			
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
			it('should return a Promise fulfilled with null if this.status is not "enabled"', function() {
			
				testListener.status = 'disabled';
				return expect(testListener.handler()).to.eventually.be.null;
			
			});
			it('should return a Promise rejected with a ListenerError if args.cmd is not a string', function() {
			
				testListener.status = 'enabled';
				var args = {
					cmd: null
				};
				return expect(testListener.handler(args)).to.eventually.be.rejectedWith(ListenerError).with.property('type').that.equals('CMDINV');
			
			});
			it('should truncate args.cmd to 1024 chars if it is a string', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui.';
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: 'mortimerHemp'
				};
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					expect(parsedObj.cmd).to.equal(testParserArgsCmd.trim().substring(0, 1024));
				
				});
			
			});
			it('should return a Promise rejected with a ListenerError if args.app is not a function', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var args = {
					cmd: testParserArgsCmd,
					app: null,
					userId: 'mortimerHemp'
				};
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.rejectedWith(ListenerError).with.property('type').that.equals('APPINV');
			
			});
			it('should set args.isAuthenticated to false if it is not a boolean', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: 'mortimerHemp'
				};
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					expect(parsedObj.isAuthenticated).to.be.false;
				
				});
			
			});
			it('should truncate args.userId to 255 chars if it is a string', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui. Donec sed odio dui. Maecenas faucibus mollis interdum. Vivamus sagittis lacus vel augue laoreet rutrum faucibus dolor auctor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Vestibulum id ligula porta felis euismod semper. Maecenas sed diam eget risus varius blandit sit amet non magna. Donec ullamcorper nulla non metus auctor fringilla. Donec sed odio dui.';
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true
				};
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					expect(parsedObj.userId).to.equal(testUserId.trim().substring(0, 255));
				
				});
			
			});
			it('should set args.isid to this.isid if it is not passed as a non-empty string', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'mortimerHemp';
				var testParserIsid = '';
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true,
					isid: testParserIsid
				};
				const testListenerIsid = testListener.isid;
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					expect(parsedObj.isid).to.equal(testListenerIsid);
				
				});
			
			});
			it('should call its parserFunction with args as the first argument', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'mortimerHemp';
				var testParserIsid = testIsid;
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true,
					isid: testParserIsid
				};
				const testListenerIsid = testListener.isid;
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					expect(parserFunctionStub.calledWith(args)).to.be.true;
				
				});
			
			});
			it('should return a Promise rejected with an Error if the parserFunction returns an Error to callback', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'mortimerHemp';
				var testParserIsid = testIsid;
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true,
					isid: testParserIsid
				};
				const testListenerIsid = testListener.isid;
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(new Error('test parserFunction error'));
				
				});
				return expect(testListener.handler(args)).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('test parserFunction error');
			
			});
			it('should return a Promise resolved with the result object of the parserFunction if it does not return an Error to callback', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'mortimerHemp';
				var testParserIsid = testIsid;
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true,
					isid: testParserIsid
				};
				const testListenerIsid = testListener.isid;
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					delete parsedObj.outputHandler;
					expect(parsedObj).to.deep.equal(args);
				
				});
			
			});
			it('should set the result object\'s outputHandler to a function that returns a Promise resolved by the result of this.outputFunction(outputObj)', function() {
			
				testListener.status = 'enabled';
				var testParserArgsCmd = 'fwd -t="noone@mortma.in"';
				var testUserId = 'mortimerHemp';
				var testParserIsid = testIsid;
				var args = {
					cmd: testParserArgsCmd,
					app: function() { return false; },
					userId: testUserId,
					isAuthenticated: true,
					isid: testParserIsid
				};
				const testListenerIsid = testListener.isid;
				var parserFunctionStub = sinon.stub(testListener, 'parserFunction').callsFake(function returnArgToCb(a, cb) {
				
					return cb(false, a);
				
				});
				var outputFunctionStub = sinon.stub(testListener, 'outputFunction').callsFake(function returnArgJsonToCb(a) {
				
					return JSON.stringify(a);
				
				});
				return expect(testListener.handler(args)).to.eventually.be.fulfilled.then((parsedObj) => {
				
					return expect(parsedObj.outputHandler(args)).to.eventually.deep.equal(JSON.stringify(args));
				
				});
			
			});
		
		});
		describe('enable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.enable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.enable()).to.equal(testListener.status);
			
			});
			it('should set this.status to "enabled"', function() {
			
				testListener.enable()
				expect(testListener.status).to.equal('enabled');
			
			});
		
		});
		describe('disable()', function() {
		
			it('should be a function', function() {
			
				expect(testListener.disable).to.be.a('function');
			
			});
			it('should return this.status', function() {
			
				expect(testListener.disable()).to.equal(testListener.status);
			
			});
			it('should set this.status to "disabled"', function() {
			
				testListener.disable()
				expect(testListener.status).to.equal('disabled');
			
			});
		
		});

	});

});
