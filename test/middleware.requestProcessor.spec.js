const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);

var requestProcessor = require('../middleware/requestProcessor');
var ansiOutput = require('../output/ansi');

const getAnsiJson = function(obj) {

	return JSON.stringify(ansiOutput(obj));

}
const getTestAst = function() {

	return {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					type: 'Word',
					text: 'testCmd'
				}
			}
		]
	};

};

const getTestExe = function() {

	return {
		isOp: false,
		type: 'Command',
		isSudo: false,
		name: 'testCmd'
	};

};

const getTestRuntime = function() {

	return {
		executeCommands(cb) {
			return cb('no results');
		}
	};

}

describe('requestProcessor.js', function() {

	var req, res;
	beforeEach(function() {
	
		req = {};
		res = {
			json(obj) {
			
				var objJson = JSON.stringify(obj);
				this.jsonOut = objJson;
				return objJson;
			
			},
			ansi(obj) {
			
				return this.json(ansiOutput(obj));
			
			}
		};
	
	});
	it('should return a function', function() {
	
		expect(requestProcessor).to.be.a('function');
	
	});
	describe('function(req, res, next)', function() {
	
		it('should be a function', function() {
		
			expect(requestProcessor()).to.be.a('function');
		
		});
		it('should call res.ansi with a an invalid request ansi object if req.body is not an object or req.body.cmd is not a string', function() {
		
			var invalidRequestObj = {
				output: {
					color: 'yellow',
					content: 'Invalid Request'
				}
			};
			requestProcessor()(req, res, function() {});
			expect(res.jsonOut).to.equal(getAnsiJson(invalidRequestObj));
		
		});
		it('should call res.ansi with a an CMD Verified ansi object if req.body.cmd is a non-empty string but req.uwot is not an object or req.uwot.cmdAst is not a non-null object', function() {
		
			var cmdVerifiedObj = {
				output: {
					content: ['CMD Verified: ', 'testCmd', {tag:'br'}]
				}
			};
			req.body = {
				cmd: 'testCmd'
			};
			requestProcessor()(req, res, function() {});
			expect(res.jsonOut).to.equal(getAnsiJson(cmdVerifiedObj));
		
		});
		it('should call res.ansi with a single ansi br object if req.body.cmd is an empty string and req.uwot.cmdAst is not a non-null object', function() {
		
			var singleBrObj = {
				output: {
					tag: 'br'
				}
			};
			req.body = {
				cmd: ''
			};
			req.uwot = {
				cmdAst: null
			};
			requestProcessor()(req, res, function() {});
			expect(res.jsonOut).to.equal(getAnsiJson(singleBrObj));
		
		});
		it('should call res.ansi with an invalid request ansi object if req.body.cmd is a string, req.uwot.cmdAst is a non-null object, global.process.env.NODE_ENV is not "development", and either req.uwot.runtime or req.uwot.runtime.exes is not an object', function() {
		
			var invalidRequestObj = {
				output: {
					color: 'yellow',
					content: 'Invalid Request'
				}
			};
			var testCmdAst = getTestAst();
			const currentNodeEnv = global.process.env.NODE_ENV;
			global.process.env.NODE_ENV = 'production';
			req.body = {
				cmd: 'testCmd'
			};
			req.uwot = {
				cmdAst: testCmdAst,
				runtime: {}
			};
			requestProcessor()(req, res, function() {});
			global.process.env.NODE_ENV = currentNodeEnv;
			expect(res.jsonOut).to.equal(getAnsiJson(invalidRequestObj));
		
		});
		it('should call res.ansi with only a "CMD Verified. AST:" ansi object if req.body.cmd is a string, req.uwot.cmdAst is a non-null object, global.process.env.NODE_ENV is "development", and either req.uwot.runtime or req.uwot.runtime.exes is not an object', function() {
		
			var testCmdAst = getTestAst();
			var cmdVerifiedAstObj = {
				output: {
					content: [
						{
							content: 'CMD Verified. AST: ',
							color: 'cyan'
						},
						{
							tag: 'br'
						},
						{
							tag: 'br'
						},
						JSON.stringify(testCmdAst),
						{
							tag: 'br'
						},
						{
							tag: 'br'
						}
					]
				}
			};
			const currentNodeEnv = global.process.env.NODE_ENV;
			global.process.env.NODE_ENV = 'development';
			req.body = {
				cmd: 'testCmd'
			};
			req.uwot = {
				cmdAst: testCmdAst,
				runtime: {}
			};
			requestProcessor()(req, res, function() {});
			global.process.env.NODE_ENV = currentNodeEnv;
			expect(res.jsonOut).to.equal(getAnsiJson(cmdVerifiedAstObj));
		
		});
		it('should call res.ansi with only a "CMD Verified. AST:" ansi object and an "EXES:" ansi object if req.body.cmd is a string, req.uwot.cmdAst is a non-null object, global.process.env.NODE_ENV is "development", req.uwot.runtime.exes is an object, and executeRuntime(req.uwot.runtime) resolves with a non-object value', function() {
		
			var testCmdAst = getTestAst();
			var testExes = new Map([[0, getTestExe()]]);
			var testRuntime = getTestRuntime();
			testRuntime.exes = testExes;
			var cmdVerifiedAstExesObj = {
				output: {
					content: [
						{
							content: 'CMD Verified. AST: ',
							color: 'cyan'
						},
						{
							tag: 'br'
						},
						{
							tag: 'br'
						},
						JSON.stringify(testCmdAst),
						{
							tag: 'br'
						},
						{
							tag: 'br'
						},
						{
							content: 'EXES: ',
							color: 'cyan'
						},
						{
							tag: 'br'
						},
						{
							tag: 'br'
						},
						JSON.stringify(getTestExe()),
						{
							tag: 'br'
						},
						{
							tag: 'br'
						},
					]
				}
			};
			const currentNodeEnv = global.process.env.NODE_ENV;
			global.process.env.NODE_ENV = 'development';
			req.body = {
				cmd: 'testCmd'
			};
			req.uwot = {
				cmdAst: testCmdAst,
				runtime: testRuntime
			};
			executeRuntimeStub = sinon.stub(requestProcessor, 'executeRuntime').callsFake(function returnPromise(runtime) {

				return new Promise(function(resolve, reject) {
	
					runtime.executeCommands(function(runtimeResults) {
		
						if (runtimeResults instanceof Error) {
			
							return reject(runtimeResults)
			
						}
						return resolve(runtimeResults);
		
					});
		
	
				});

			});
			requestProcessor()(req, res, function() {});
			global.process.env.NODE_ENV = currentNodeEnv;
			expect(getAnsiJson(res.uwotObj)).to.equal(getAnsiJson(cmdVerifiedAstExesObj));
		
		});
	
	});

});
