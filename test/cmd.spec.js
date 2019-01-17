var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');
globalSetupHelper.initConstants();

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Cmd = require('../cmd');
var cmd;
const testCmdArgs = {
	command: {
		name: 'testCmd',
		description: 'test command instance',
		requiredArguments: [
			'argOne',
			'argTwo',
			'argThree'
		],
		optionalArguments: [
			'optArgOne',
			'optArgTwo',
			'optArgThree'
		]
	},
	options: [
		{
			description: 'the save flag',
			shortOpt: 's',
			longOpt: 'save',
			requiredArguments: ['scope'],
			optionalArguments: ['toDisk', 'toMemory']
		},
		{
			description: 'the global flag',
			shortOpt: 'g',
			longOpt: 'global',
			requiredArguments: [],
			optionalArguments: []
		},
		{
			description: 'the recursive flag',
			shortOpt: 'r',
			longOpt: 'recursive',
			requiredArguments: [],
			optionalArguments: []
		}
	],
	path: path.resolve(global.Uwot.Constants.appRoot, 'test/cmd.spec.js')
};

describe('cmd.js', function() {

	describe('UwotCmd', function() {
	
		beforeEach(function() {
		
			cmd = new Cmd(
				testCmdArgs.command,
				testCmdArgs.options,
				testCmdArgs.path
			);
		
		});
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(Cmd).to.be.a('function');
			
			});
			it('should set the command property to an instance of UwotCmdCommand', function() {
			
				expect(cmd.command).to.be.an('object');
				expect(cmd.command.constructor.name.toString()).to.equal('UwotCmdCommand');
			
			});
			it('should set the options property to an Array', function() {
			
				expect(cmd.options).to.be.an('array');
			
			});
			it('should set each member of the options Array to an instance of UwotCmdOption', function() {
			
				for(let i = 0; i < cmd.options.length; i++) {
				
					expect(cmd.options[i]).to.be.an('object');
					expect(cmd.options[i].constructor.name.toString()).to.equal('UwotCmdOption');
				
				}
			
			});
			it('should set the path property to a string containing the third argument', function() {
			
				expect(cmd.path).to.be.a('string').that.includes(testCmdArgs.path);
			
			});
		
		});
		describe('execute', function() {
		
			it('should be a function', function() {
			
				expect(cmd.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function(){
			
				expect(cmd.execute).to.throw(TypeError, 'invalid callback passed to execute.')
			
			});
			it('should return a string if there are no args and no options', function(done) {
			
				cmd.execute(null, null, this, function(error, result) {
				
					expect(result).to.be.a('string').that.includes(testCmdArgs.command.name);
					done();
				
				});
			
			});
			it('should return a string containing the args if there are args but no options', function(done) {
			
				var args = [
					'mary',
					'had',
					'lamb',
					'little'
				];
				cmd.execute(args, null, this, function(error, result) {
				
					expect(result).to.be.a('string').that.includes('mary had lamb little');
					done();
				
				});
			
			});
			it('should return a string containing the args and options if there are both args and options, and options array does not contain "h" or "help"', function(done) {
			
				var args = [
					'mary',
					'had',
					'lamb',
					'little'
				];
				var opts = [
					{name: 's'},
					{name: 'recursive', isLong: true}
				];
				cmd.execute(args, opts, this, function(error, result) {
				
					expect(result).to.be.a('string').that.includes('mary had lamb little -s --recursive');
					done();
				
				});
			
			});
			it('should return a string containing the options if there are options but no args, and options array does not contain "h" or "help"', function(done) {
			
				var opts = [
					{name: 's'},
					{name: 'recursive', isLong: true}
				];
				cmd.execute(null, opts, this, function(error, result) {
				
					expect(result).to.be.a('string').that.includes('-s --recursive');
					done();
				
				});
			
			});
			it('should return an object for ansi formatting containing help output if there are options and options contains "h" or "help"', function(done) {
			
				var opts = [
					{name: 'h'},
					{name: 'recursive', isLong: true}
				];
				var helpStub = sinon.stub(cmd, 'help').callsFake(function returnAnsi(callback) {
				
					return callback(false, {content:['test help string']});
				
				});
				cmd.execute(null, opts, this, function(error, result) {
				
					expect(result).to.be.an('object');
					expect(result).to.not.be.null;
					expect(result.content).to.be.an('array');
					done();
				
				});
			
			});
		
		});
		describe('help', function() {
		
			it('should be a function', function() {
			
				expect(cmd.help).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function(){
			
				expect(cmd.help).to.throw(TypeError, 'invalid callback passed to help.')
			
			});
			it('should return an object for ansi formatting containing help output', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.help(function(error, helpArray) {
				
					expect(helpArray).to.be.an('object');
					expect(helpArray.content).to.be.an('array');
					done();
				
				});
			
			});
			it('should return an object containing a bold ansi node that contains the command name', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.help(function(error, helpArray) {
				
					expect(helpArray.content[0]).to.be.an('object');
					expect(helpArray.content[0].isBold).to.be.true;
					expect(helpArray.content[0].content).to.be.a('string').that.includes(testCmdArgs.command.name);
					done();
				
				});
			
			});
			it('should return an object containing the required arguments inside angle brackets', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.help(function(error, helpArray) {
				
					var rArgStr = '';
					for (let i = 0; i < testCmdArgs.command.requiredArguments.length; i++) {
					
						rArgStr += '<' + testCmdArgs.command.requiredArguments[i] + '>';
						if ((i + 1) < testCmdArgs.command.requiredArguments.length) {
						
							rArgStr += ' ';
						
						}
					
					}
					expect(helpArray.content[1]).to.be.a('string').that.includes(rArgStr);
					done();
				
				});
			
			});
			it('should return an object containing the optional arguments inside square brackets', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.help(function(error, helpArray) {
				
					var oArgStr = '';
					for (let i = 0; i < testCmdArgs.command.optionalArguments.length; i++) {
					
						oArgStr += '[' + testCmdArgs.command.optionalArguments[i] + ']';
						if ((i + 1) < testCmdArgs.command.optionalArguments.length) {
						
							oArgStr += ' ';
						
						}
					
					}
					expect(helpArray.content[1]).to.be.a('string').that.includes(oArgStr);
					done();
				
				});
			
			});
			it('should return an object containing the description', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.help(function(error, helpArray) {
				
					expect(helpArray.content[1]).to.be.a('string').that.includes(testCmdArgs.command.description);
					done();
				
				});
			
			});
			it('should return an object containing the options (one per line, with all available class props)', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				var optString = '';
				for (let i = 0; i < testCmdArgs.options.length; i++) {
		
					optString += '    -' + testCmdArgs.options[i].shortOpt + ', --' + testCmdArgs.options[i].longOpt + ' ';
					for (let j = 0; j < testCmdArgs.options[i].requiredArguments.length; j++) {
			
						optString += ' <' + testCmdArgs.options[i].requiredArguments[j] + '>';
			
					}
					for (let j = 0; j < testCmdArgs.options[i].optionalArguments.length; j++) {
			
						optString += ' [' + testCmdArgs.options[i].optionalArguments[j] + ']';
			
					}
					optString += "\r\n";
					optString += '       ' + testCmdArgs.options[i].description;
					optString += "\r\n";
		
				}
				cmd.help(function(error, helpArray) {
				
					expect(helpArray.content[1]).to.be.a('string').that.includes(optString);
					done();
				
				});
			
			});
			it('should return an object that does not contain space for options if no options are defined', function(done) {
			
				var parsePreStub = sinon.stub(cmd, 'parsePre').callsFake(function returnAnsi(str) {
				
					return {content:[str], tag: 'pre'};
				
				});
				cmd.options = [];
				var optString = '';
				for (let i = 0; i < testCmdArgs.options.length; i++) {
		
					optString += '    -' + testCmdArgs.options[i].shortOpt + ', --' + testCmdArgs.options[i].longOpt + ' ';
					for (let j = 0; j < testCmdArgs.options[i].requiredArguments.length; j++) {
			
						optString += ' <' + testCmdArgs.options[i].requiredArguments[j] + '>';
			
					}
					for (let j = 0; j < testCmdArgs.options[i].optionalArguments.length; j++) {
			
						optString += ' [' + testCmdArgs.options[i].optionalArguments[j] + ']';
			
					}
					optString += "\r\n";
					optString += '       ' + testCmdArgs.options[i].description;
					optString += "\r\n";
		
				}
				cmd.help(function(error, helpArray) {
				
					expect(helpArray.content[1]).to.be.a('string').that.not.includes(optString);
					done();
				
				});
			
			});
		
		});
		describe('matchOpt', function() {
		
			it('should be a function', function() {
			
				expect(cmd.matchOpt).to.be.a('function');
			
			});
			it('should throw a TypeError if opt is not a string', function(){
			
				expect(cmd.matchOpt).to.throw(TypeError, 'invalid opt string passed to matchOpt')
			
			});
			it('should throw a TypeError if opt is an empty string', function(){
			
				function passEmpty() {
				
					return cmd.matchOpt('');
				
				}
				expect(passEmpty).to.throw(TypeError, 'invalid opt string passed to matchOpt')
			
			});
			it('should return an object with properties name, isOpt, isLong, isDefined, hasArgs, reqArgs, optArgs, assignedArg', function() {
			
				var matchResult = cmd.matchOpt('-t');
				console.log(matchResult);
				expect(matchResult).to.be.an('object');
				expect(matchResult).to.have.own.property('name');
				expect(matchResult).to.have.own.property('isOpt');
				expect(matchResult).to.have.own.property('isLong');
				expect(matchResult).to.have.own.property('isDefined');
				expect(matchResult).to.have.own.property('hasArgs');
				expect(matchResult).to.have.own.property('reqArgs');
				expect(matchResult).to.have.own.property('optArgs');
				expect(matchResult).to.have.own.property('assignedArg');
			
			});
			it('should return an object where properties name abd assignedArg are strings', function() {
			
				var matchResult = cmd.matchOpt('-t');
				expect(matchResult.name).to.be.a('string');
				expect(matchResult.assignedArg).to.be.a('string');
			
			});
			it('should return an object where properties isOpt, isLong, isDefined, and hasArgs are booleans', function() {
			
				var matchResult = cmd.matchOpt('-t');
				expect(matchResult.isOpt).to.be.a('boolean');
				expect(matchResult.isLong).to.be.a('boolean');
				expect(matchResult.isDefined).to.be.a('boolean');
				expect(matchResult.hasArgs).to.be.a('boolean');
			
			});
			it('should return an object where properties reqArgs and optArgs are arrays', function() {
			
				var matchResult = cmd.matchOpt('-t');
				expect(matchResult.reqArgs).to.be.an('array');
				expect(matchResult.optArgs).to.be.an('array');
			
			});
			it('should return a default result object if opt does not start with a "-" (strings empty, arrays, empty, bools false)', function() {
			
				var matchDefault = {
					name: '',
					isOpt: false,
					isLong: false,
					isDefined: false,
					hasArgs: false,
					reqArgs: [],
					optArgs: [],
					assignedArg: ''
				};
				var matchResult = cmd.matchOpt('t');
				var defaultProps = Object.keys(matchDefault);
				for(let i = 0; i < defaultProps.length; i++) {
				
					if ('object' !== typeof matchDefault[defaultProps[i]]) {
					
						expect(matchResult[defaultProps[i]]).to.equal(matchDefault[defaultProps[i]]);
					
					}
					else {
					
						expect(matchDefault[defaultProps[i]]).to.be.empty;
					
					}
				
				}
			
			});
			it('should return an object with isOpt=true if opt starts with a "-"', function() {
			
				var matchResult = cmd.matchOpt('-t');
				expect(matchResult.isOpt).to.be.true;
				matchResult = cmd.matchOpt('t');
				expect(matchResult.isOpt).to.be.false;
			
			});
			it('should return an object with isLong=true if opt starts with "--"', function() {
			
				var matchResult = cmd.matchOpt('--t');
				expect(matchResult.isLong).to.be.true;
				matchResult = cmd.matchOpt('-t');
				expect(matchResult.isLong).to.be.false;
			
			});
		
		});
		describe('parsePre', function() {
		
			it('should be a function', function() {
			
				expect(cmd.parsePre).to.be.a('function');
			
			});
		
		});
		describe('escapeHtml', function() {
		
			it('should be a function', function() {
			
				expect(cmd.escapeHtml).to.be.a('function');
			
			});
		
		});
	
	});
	describe('UwotCmdCommand', function() {
	
		describe('constructor', function() {
		
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdCommand() {
				
					return new UwotCmdCommad();
				
				}
				expect(returnNewCmdCommand).to.throw(ReferenceError, 'UwotCmdCommad is not defined');
			
			});
		
		});
	
	});
	describe('UwotCmdOption', function() {
	
		describe('constructor', function() {
		
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdOption() {
				
					return new UwotCmdOption();
				
				}
				expect(returnNewCmdOption).to.throw(ReferenceError, 'UwotCmdOption is not defined');
			
			});
		
		});
	
	});

});
