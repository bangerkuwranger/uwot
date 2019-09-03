const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binTheme;
const path = require('path');
const themeLoader = require('../helpers/themeLoader');

describe('theme.js', function() {

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
		binTheme = require('../routes/bin/theme');
	
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
	it('should be an object that is an instance of UwotCmdTheme', function() {
	
		expect(binTheme).to.be.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdTheme');
	
	});
	it('should be an object that inherits from UwotCmd', function() {
	
		expect(binTheme).to.be.an.instanceof(global.Uwot.Exports.Cmd);
	
	});
	describe('command', function() {
	
		it('should be an object that is an instance of UwotCmdCommand', function() {
	
			expect(binTheme).to.have.property('command').that.is.an('object').that.has.property('constructor').that.has.property('name').that.equals('UwotCmdCommand');
	
		});
		it('should have a property "name" that has value "theme"', function() {
	
			expect(binTheme.command).to.have.property('name').that.equals('theme');
	
		});
		it('should have a property "description" that has value "Changes the theme for the console window."', function() {
	
			expect(binTheme.command).to.have.property('description').that.equals('Changes the theme for the console window.');
	
		});
		it('should have a property "requiredArguments" that is an array with one value, "themeName"', function() {
	
			expect(binTheme.command).to.have.property('requiredArguments').that.is.an('array').that.contains('themeName');
	
		});
		it('should have a property "optionalArguments" that is an empty array', function() {
	
			expect(binTheme.command).to.have.property('optionalArguments').that.is.an('array').that.is.empty;
	
		});
	
	});
	describe('options', function() {
	
		it('should have a value that is an array', function() {
	
			expect(binTheme).to.have.property('options').that.is.an('array');
	
		});
		describe('options[0]', function() {
		
			it('should be an object', function() {
			
				expect(binTheme.options[0]).to.be.an('object');
			
			});
			it('should have property "description" that has value "Save theme selection for future sessions for this user."', function() {
			
				expect(binTheme.options[0]).to.be.an('object').with.property('description').that.equals('Save theme selection for future sessions for this user.');
			
			});
			it('should have property "shortOpt" that has value "s"', function() {
			
				expect(binTheme.options[0]).to.be.an('object').with.property('shortOpt').that.equals('s');
			
			});
			it('should have property "longOpt" that has value "save"', function() {
			
				expect(binTheme.options[0]).to.be.an('object').with.property('longOpt').that.equals('save');
			
			});
			it('should have property "requiredArguments" that is an empty array', function() {
			
				expect(binTheme.options[0]).to.be.an('object').with.property('requiredArguments').that.is.an('array').that.is.empty;
			
			});
			it('should have property "optionalArguments" that is an empty array', function() {
			
				expect(binTheme.options[0]).to.be.an('object').with.property('optionalArguments').that.is.an('array').that.is.empty;
			
			});
		
		});
	
	});
	describe('path', function() {
	
		it('should have a string value that is an absolute path to the application root and "routes/bin/theme"', function() {
	
			expect(binTheme).to.have.property('path').that.equals(global.Uwot.Constants.appRoot + '/routes/bin/theme');
	
		});
	
	});
	describe('listenerSettings', function() {
	
		it('should have a value that is false', function() {
	
			expect(binTheme).to.have.property('listenerSettings').that.is.false;
	
		});
	
	});
	describe('constructor(cmdObj, cmdOpts, cmdPath)', function() {
	
		it('should be a function', function() {
		
			expect(binTheme.constructor).to.be.a('function');
		
		});
		it('should accept three arguments and pass them to the parent class constructor'
		
// 		, function() {
// 		
// 			var argArr = ['arg1', 'arg2', 'arg3'];
// 			var uwotCmdStub = sinon.stub(global.Uwot.Exports.Cmd.prototype, 'constructor').returns(argArr);
// 			var bb2 = new binTheme.constructor(...argArr);
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
		
			expect(binTheme.execute).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg is not a function', function() {
		
			function throwError() {
			
				return binTheme.execute();
			
			};
			expect(throwError).to.throw(TypeError, 'invalid callback passed to bin/theme/execute');
		
		});
		it('should return a TypeError to callback function if app instance is not a function', function(done) {
		
			binTheme.execute('args', [], {}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid app instance passed to bin/theme/execute');
				done();
			
			}, false, null);
		
		});
		it('should return a TypeError to callback function if app instance is a function but the get property is not a function', function(done) {
		
			binTheme.execute('args', [], {"get": null}, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid app instance passed to bin/theme/execute');
				done();
			
			}, false, null);
		
		});
		it('should call the help method if args is not a non-empty array', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(new Error('test help error'));
			
			});
			binTheme.execute([], [], testApp, {}, function(error, result) {
			
				expect(helpStub.called).to.be.true;
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return an error to callback if args is not a non-empty array and the help method call returns an error to its callback', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(new Error('test help error'));
			
			});
			binTheme.execute([], [], testApp, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test help error');
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return an object with property content that is an array with the first member an ansi object containing the current theme name if args is not a non-empty array and the help method call returns an object to the second argument of its callback after running without error', function(done) {
		
			var testApp = function() { return false; };
			var testThemeOutput = {
				content: [
					{
						content: 'Current Theme: '
					},
					{
						content: 'default',
						isBold: true
					},
					{
						tag: 'br'
					},
					{
						tag: 'br'
					}
				]
			};
			var testHelpResult = {
				content:[
					testThemeOutput,
					{
						tag: 'div',
						content: 'List of valid themeNames:',
						isBold: true
					},
					{
						content: [
							{
								content: 'borg',
								tag: 'li'
							},
							{
								content: 'bot',
								tag: 'li'
							},
							{
								content: 'clone',
								tag: 'li'
							},
							{
								content: 'default',
								tag: 'li'
							}
						],
						tag: 'ul'
					}
				]
			};
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(false, testHelpResult);
			
			});
			binTheme.execute([], [], testApp, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.deep.equal(testHelpResult);
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should call the help method if args is a non-empty array and the value of the first element is an object with a text property that has a value that is an empty string', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(new Error('test help error'));
			
			});
			binTheme.execute([{text: ''}], [], testApp, {}, function(error, result) {
			
				expect(helpStub.called).to.be.true;
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return an error to callback if args is a non-empty array, the value of the first element is an object with a text property that has a value that is an empty string, and the help method call returns an error to its callback', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(new Error('test help error'));
			
			});
			binTheme.execute([{text: ''}], [], testApp, {}, function(error, result) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test help error');
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return an object with property content that is an array with the first member an ansi object containing the current theme name if args is a non-empty array, the value of the first element is an object with a text property that has a value that is an empty string, and the help method call returns an object to the second argument of its callback after running without error', function(done) {
		
			var testApp = function() { return false; };
			var testThemeOutput = {
				content: [
					{
						content: 'Current Theme: '
					},
					{
						content: 'default',
						isBold: true
					},
					{
						tag: 'br'
					},
					{
						tag: 'br'
					}
				]
			};
			var testHelpResult = {
				content:[
					testThemeOutput,
					{
						tag: 'div',
						content: 'List of valid themeNames:',
						isBold: true
					},
					{
						content: [
							{
								content: 'borg',
								tag: 'li'
							},
							{
								content: 'bot',
								tag: 'li'
							},
							{
								content: 'clone',
								tag: 'li'
							},
							{
								content: 'default',
								tag: 'li'
							}
						],
						tag: 'ul'
					}
				]
			};
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var helpStub = sinon.stub(binTheme, 'help').callsFake(function returnError(cb) {
			
				return cb(false, testHelpResult);
			
			});
			binTheme.execute([{text: ''}], [], testApp, {}, function(error, result) {
			
				expect(error).to.be.false;
				expect(result).to.deep.equal(testHelpResult);
				helpStub.restore();
				done();
			
			}, false, null);
		
		});
		it('should return to callback an object with a cookies property that is an object with property uwotSavedTheme that is an object with value and expiry properties if args contains a valid theme name and options is a non-empty array with a member that is an object with a name property value of "s" or "save"', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var validateThemeStub = sinon.stub(themeLoader, 'isValidTheme').returns(true);
			binTheme.execute([{text: 'clone'}], [{name: 's'}], testApp, {}, function(error, result) {
			
				expect(validateThemeStub.called).to.be.true;
				expect(error).to.be.false;
				expect(result).to.be.an('object').with.property('cookies').that.is.an('object').with.property('uwotSavedTheme').that.is.an('object').that.is.not.null;
				expect(result.cookies.uwotSavedTheme).to.have.property('value');
				expect(result.cookies.uwotSavedTheme).to.have.property('expiry');
				binTheme.execute([{text: 'clone'}], [{name: 'save'}], testApp, {}, function(error, result) {
			
					expect(validateThemeStub.called).to.be.true;
					expect(error).to.be.false;
					expect(result).to.be.an('object').with.property('cookies').that.is.an('object').with.property('uwotSavedTheme').that.is.an('object').that.is.not.null;
					expect(result.cookies.uwotSavedTheme).to.have.property('value');
					expect(result.cookies.uwotSavedTheme).to.have.property('expiry');
					validateThemeStub.restore();
					done();
			
				}, false, null);
			
			}, false, null);
		
		});
		it('should return an error to callback if the text property of the first member of args array is an invalid value for theme', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var validateThemeStub = sinon.stub(themeLoader, 'isValidTheme').returns(false);
			
			binTheme.execute([{text: 'clone'}], [{name: 'save'}], testApp, {}, function(error, result) {
		
				expect(validateThemeStub.called).to.be.true;
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('invalid theme');
				validateThemeStub.restore();
				done();
		
			}, false, null);
		
		});
		it('should return an object to callback with a redirect property that is a path with a query string that contains a theme attribute that equals the theme name from args, and an outputType property that equals "object" if the first member of the args array is a valid theme name', function(done) {
		
			var testApp = function() { return false; };
			testApp.get = function(prop) {
			
				return 'default';
			
			};
			var testRedirect = '/?theme=clone';
			var validateThemeStub = sinon.stub(themeLoader, 'isValidTheme').returns(true);
			
			binTheme.execute([{text: 'clone'}], [{name: 'save'}], testApp, {}, function(error, result) {
		
				expect(validateThemeStub.called).to.be.true;
				expect(error).to.be.false;
				expect(result).to.be.an('object').with.property('redirect').that.equals(testRedirect);
				expect(result).to.have.property('outputType').that.equals('object');
				validateThemeStub.restore();
				done();
		
			}, false, null);
		
		});
		
	
	});
	describe('help(callback)', function() {
	
		it('should be a function', function() {
		
			expect(binTheme.help).to.be.a('function');
		
		});
		it('should call the class method outputValidThemes');
		it('should call the parent class help method');
		it('should return an error to callback if the parent help call returns an error to its callback');
		it('should return the result of the parent class help call, with a the result of outputValidThemes appended to the content property array, if the parent help call returns a non-null object');
		it('should return the result of the outputValidThemes call, with an ansi object with "*** Help system currently unavailable. ***" content prepended to its content array property if the parent help call completes without error but does not return a non-null object to its callback');
	
	});
	describe('outputValidThemes()', function() {
	
		it('should be a function');
		it('should call themeLoader helper function isValidTheme');
		it('should return an ansi object with a a content array that has a second member that is an ansi object containing a ul with li objects that match the elements of the result of isValidTheme call');
	
	});

});
