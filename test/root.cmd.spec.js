var path = require('path');
var fs = require('fs-extra');
const globalSetupHelper = require('../helpers/globalSetup');
const EOL = require('os').EOL;

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const sanitize = require('../helpers/valueConversion');
const Cmd = require('../cmd');
var cmd, testCmdArgs;

const instanceUser = {
	"fName": "Found",
	"lName": "User",
	"uName": "fuser",
	"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
	"sudoer": true,
	"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
	"createdAt": new Date(1546450800498),
	"updatedAt": new Date(1546450800498),
	"_id": "CDeOOrH0gOg791cZ",
	verifyPassword(pass) {return true;},
	maySudo() {return this.sudoer;}
};

describe('cmd.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		testCmdArgs = {
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
	
	});
	describe('UwotCmd', function() {
	
		beforeEach(function() {
		
			cmd = new Cmd(
				testCmdArgs.command,
				testCmdArgs.options,
				testCmdArgs.path
			);
		
		});
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(command, options, path)', function() {
		
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
		describe('execute(args, options, app, user, callback, isSudo)', function() {
		
			it('should be a function', function() {
			
				expect(cmd.execute).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function(){
			
				expect(cmd.execute).to.throw(TypeError, 'invalid callback passed to execute.')
			
			});
			it('should return a string if there are no args and no options', function(done) {
			
				cmd.execute(null, null, this, instanceUser, function(error, result) {
				
					expect(result).to.be.a('string').that.includes(sanitize.stringNoSpaces(sanitize.cleanString(testCmdArgs.command.name), 'cc'));
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
				cmd.execute(args, null, this, instanceUser, function(error, result) {
				
					expect(result).to.be.a('string').that.includes('"mary" "had" "lamb" "little"');
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
				cmd.execute(args, opts, this, instanceUser, function(error, result) {
				
					expect(result).to.be.a('string').that.includes('"mary" "had" "lamb" "little" -s --recursive');
					done();
				
				});
			
			});
			it('should return a string containing the options if there are options but no args, and options array does not contain "h" or "help"', function(done) {
			
				var opts = [
					{name: 's'},
					{name: 'recursive', isLong: true}
				];
				cmd.execute(null, opts, this, instanceUser, function(error, result) {
				
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
				cmd.execute(null, opts, this, instanceUser, function(error, result) {
				
					expect(result).to.be.an('object');
					expect(result).to.not.be.null;
					expect(result.content).to.be.an('array');
					done();
				
				});
			
			});
		
		});
		describe('help(callback)', function() {
		
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
					expect(helpArray.content[0].content).to.be.a('string').that.includes(sanitize.stringNoSpaces(sanitize.cleanString(testCmdArgs.command.name), 'cc'));
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
					optString += EOL;
					optString += '       ' + testCmdArgs.options[i].description;
					optString += EOL;
		
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
					optString += EOL;
					optString += '       ' + testCmdArgs.options[i].description;
					optString += EOL;
		
				}
				cmd.help(function(error, helpArray) {
				
					expect(helpArray.content[1]).to.be.a('string').that.not.includes(optString);
					done();
				
				});
			
			});
		
		});
		describe('matchOpt(opt)', function() {
		
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
			it('should return an object with name stripped of leading hyphen if isLong=false', function() {
			
				var matchResult = cmd.matchOpt('-t');
				expect(matchResult.name).to.equal('t');
			
			});
			it('should return an object with name stripped of two leading hyphens if isLong=true', function() {
			
				var matchResult = cmd.matchOpt('--turbo');
				expect(matchResult.name).to.equal('turbo');
			
			});
			it('should return an object with name not stripped of more than two leading hyphens', function() {
			
				var matchResult = cmd.matchOpt('---triple');
				expect(matchResult.name).to.equal('-triple');
			
			});
			it('should return an object with assignedArg containing single assignment string if opt contains a single "="', function() {
			
				var matchResult = cmd.matchOpt('--t=testAssignedArg');
				expect(matchResult.assignedArg).to.equal('testAssignedArg');
			
			});
			it('should return an object with assignedArg containing comma separated assignment string if opt contains more than one "="', function() {
			
				var matchResult = cmd.matchOpt('--t=testAssignedArg=2500');
				expect(matchResult.assignedArg).to.equal('testAssignedArg,2500');
			
			});
			it('should return an object with isDefined=false if cmd.options is empty', function() {
			
				cmd.options = [];
				matchResult = cmd.matchOpt('-s');
				expect(matchResult.isDefined).to.be.false;
			
			});
			it('should return an object with isDefined=false if cmd.options doesn\'t contain a matching short or long option', function() {
			
				matchResult = cmd.matchOpt('-t');
				expect(matchResult.isDefined).to.be.false;
			
			});
			it('should return an object with isDefined=true if cmd.options contains a matching short option', function() {
			
				matchResult = cmd.matchOpt('-s');
				expect(matchResult.isDefined).to.be.true;
			
			});
			it('should return an object with isDefined=true if cmd.options contains a matching long option', function() {
			
				matchResult = cmd.matchOpt('--save');
				expect(matchResult.isDefined).to.be.true;
			
			});
			it('should return an object with hasArgs=true and reqArgs set to cmd.options[idx].reqArgs if defined and cmd.options[idx].reqArgs.length > 0', function() {
			
				matchResult = cmd.matchOpt('--save=theWorld');
				expect(matchResult.isDefined).to.be.true;
				expect(matchResult.hasArgs).to.be.true;
				expect(matchResult.reqArgs).to.be.an('array').that.includes(testCmdArgs.options[0].requiredArguments[0]);
			
			});
			it('should return an object with hasArgs=true and optArgs set to cmd.options[idx].optArgs if defined and cmd.options[idx].optArgs.length > 0', function() {
			
				matchResult = cmd.matchOpt('--save=theWorld');
				expect(matchResult.isDefined).to.be.true;
				expect(matchResult.hasArgs).to.be.true;
				expect(matchResult.optArgs).to.be.an('array').that.includes(testCmdArgs.options[0].optionalArguments[0]);
			
			});
		
		});
		describe('parsePre(preString)', function() {
		
			it('should be a function', function() {
			
				expect(cmd.parsePre).to.be.a('function');
			
			});
			it('should return preString unchanged if preString is not a string', function() {
			
				var str = null;
				expect(cmd.parsePre(str)).to.be.null;
			
			});
			it('should return an object with a content property if preString is a string', function() {
			
				var str = 'this charming man';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
			
			});
			it('should return an ansi object that ignores opening carriage returns of string', function() {
			
				var str = "\n\r" + 'this charming man';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
				expect(cmd.parsePre(str).content[0].content[0].content).to.equal('this');
			
			});
			it('should return an ansi object that has new nodes for each internal carriage return of string', function() {
			
				var str = "\n\r" + 'I would go out tonight' + "\n\r" + 'But I haven\'t got a stitch to wear';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
				expect(cmd.parsePre(str).content[1].content[0].content).to.equal('But');
			
			});
			it('should return an ansi object that has &nbsp; nodes for each internal space character of string', function() {
			
				var str = "\n\r" + 'I would go out tonight' + "\n\r" + 'But I haven\'t got a stitch to wear';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
				expect(cmd.parsePre(str).content[1].content[1].content).to.equal('&nbsp;');
			
			});
			it('should return an ansi object that has multiple &nbsp; nodes for each internal space character in sequence of string', function() {
			
				var str = "\n\r" + 'I would go out tonight' + "\n\r" + 'But     I haven\'t got a stitch to wear';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
				expect(cmd.parsePre(str).content[1].content[4].content).to.equal('&nbsp;');
			
			});
			it('should return an ansi object that has 4 &nbsp; nodes for each internal tab character of string', function() {
			
				var str = "\n\r" + 'I would go out tonight' + "\n\r" + 'But 	I haven\'t got a stitch to wear';
				expect(cmd.parsePre(str)).to.be.an('object');
				expect(cmd.parsePre(str).content).to.be.an('array');
				expect(cmd.parsePre(str).content[1].content[4].content).to.equal('&nbsp;');
			
			});
		
		});
		describe('argsObjToNameArray(argsObj)', function() {
		
			it('should be a function', function() {
			
				expect(cmd.argsObjToNameArray).to.be.a('function');
			
			});
			it('should return argsObj unchanged if argsObj is neither an array nor an object', function() {
			
				expect(cmd.argsObjToNameArray(null)).to.be.null;
				expect(cmd.argsObjToNameArray('name')).to.equal('name');
			
			});
			it('should return an array of names, taken from the text property of each element in argsObj', function() {
			
				var testArray = [
					{text: 'testOne', type: 'Word'},
					{text: 'testTwo', type: 'Word'},
					{text: 'testThree', type: 'Word'}
				];
				var testResult = cmd.argsObjToNameArray(testArray);
				expect(testResult).to.be.an('array');
				expect(testResult[0]).to.equal(testArray[0].text);
				expect(testResult[1]).to.equal(testArray[1].text);
				expect(testResult[2]).to.equal(testArray[2].text);
			
			});
			it('should not include values from any element that is not an object in the resulting array', function() {
			
				var testArray = [
					{text: 'testOne', type: 'Word'},
					"{text: 'testTwo', type: 'Word'}",
					{text: 'testThree', type: 'Word'}
				];
				var testResult = cmd.argsObjToNameArray(testArray);
				expect(testResult).to.be.an('array');
				expect(testResult[0]).to.equal(testArray[0].text);
				expect(testResult[1]).to.equal(testArray[2].text);
				expect(testResult[2]).to.be.undefined;
			
			});
			it('should not include values from any element that is not an object with property text having a string value in the resulting array', function() {
			
				var testArray = [
					{text: 'testOne', type: 'Word'},
					{name: 'testTwo', type: 'Word'},
					{text: ['testThree'], type: 'Word'}
				];
				var testResult = cmd.argsObjToNameArray(testArray);
				expect(testResult).to.be.an('array');
				expect(testResult[0]).to.equal(testArray[0].text);
				expect(testResult[1]).to.be.undefined;
				expect(testResult[2]).to.be.undefined;
			
			});
			it('should not include values from any element that is not an object with a property type that === "Word" in the resulting array', function() {
			
				var testArray = [
					{text: 'testOne', type: 'Word'},
					{text: 'testTwo', type: 'Wrod'},
					{text: 'testThree', type: 'Word'}
				];
				var testResult = cmd.argsObjToNameArray(testArray);
				expect(testResult).to.be.an('array');
				expect(testResult[0]).to.equal(testArray[0].text);
				expect(testResult[1]).to.equal(testArray[2].text);
				expect(testResult[2]).to.be.undefined;
			
			});
		
		});
	
	});
	describe('UwotCmdCommand', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(name, description, requiredArguments, optionalArguments)', function() {
		
			var testCommand;
			beforeEach(function() {
		
				cmd = new Cmd(
					testCmdArgs.command,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
		
			});
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdCommand() {
				
					return new UwotCmdCommad();
				
				}
				expect(returnNewCmdCommand).to.throw(ReferenceError, 'UwotCmdCommad is not defined');
			
			});
			it('should remove spaces from passed name property by camelCapping the string', function() {
			
				testCommand.name = 'test cmd';
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.name).to.equal(sanitize.stringNoSpaces(sanitize.cleanString(testCmdArgs.command.name), 'cc'));
			
			});
			it('should trim leading & trailing whitespace from passed description property', function() {
			
				testCommand.description = '    test command instance    ';
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.description).to.equal(testCmdArgs.command.description);
			
			});
			it('should truncate passed description property to 255 characters (excluding trimmed whitespace)', function() {
			
				testCommand.description = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Duis mollis, est non commodo luctus, nisi erat porttitorlia test command instance, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.';
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.description).to.equal('Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Duis mollis, est non commodo luctus, nisi erat porttitorlia ' + testCmdArgs.command.description);
			
			});
			it('should set requiredArguments property to an empty array if argument passed is not an array.', function() {
			
				testCommand.requiredArguments = 'test command argument';
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.requiredArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set requiredArguments property to an empty array if argument passed is not an array with a string as first element.', function() {
			
				testCommand.requiredArguments = [null, 'testCommandArgument'];
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.requiredArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set requiredArguments property to an array with an empty string replacing non-leading elements in passed array that are not strings.', function() {
			
				testCommand.requiredArguments = ['testCommandArgment', null, 'testCommandArgumentThree'];
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.requiredArguments).to.be.an('array').that.includes('');
			
			});
			it('should set optionalArguments property to an empty array if argument passed is not an array.', function() {
			
				testCommand.optionalArguments = 'test command argument';
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.optionalArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set optionalArguments property to an empty array if argument passed is not an array with a string as first element.', function() {
			
				testCommand.optionalArguments = [null, 'testCommandArgument'];
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.optionalArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set optionalArguments property to an array with an empty string replacing non-leading elements in passed array that are not strings.', function() {
			
				testCommand.optionalArguments = ['testCommandArgment', null, 'testCommandArgumentThree'];
				cmd = new Cmd(
					testCommand,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testCommand = cmd.command;
				expect(testCommand.optionalArguments).to.be.an('array').that.includes('');
			
			});
		
		});
	
	});
	describe('UwotCmdOption', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(description, shortOpt, longOpt, requiredArguments, optionalArguments)', function() {
		
			var testOptions;
			beforeEach(function() {
		
				cmd = new Cmd(
					testCmdArgs.command,
					testCmdArgs.options,
					testCmdArgs.path
				);
				testOptions = cmd.options;
		
			});
			it('should not be callable outside of UwotCmd methods', function() {
			
				function returnNewCmdOption() {
				
					return new UwotCmdOption();
				
				}
				expect(returnNewCmdOption).to.throw(ReferenceError, 'UwotCmdOption is not defined');
			
			});
			it('should remove spaces from passed longOpt property by camelCapping the string', function() {
			
				testOptions[0].longOpt = 'test cmd opt';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].longOpt).to.equal('testCmdOpt');
			
			});
			it('should trim leading & trailing whitespace from passed longOpt property', function() {
			
				testOptions[0].longOpt = '    test options instance    ';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].longOpt).to.equal('testOptionsInstance');
			
			});
			it('should trim leading & trailing whitespace, and truncate to 1 character from beginning of passed shortOpt property', function() {
			
				testOptions[0].shortOpt = '    test options instance    ';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].shortOpt).to.equal('t');
			
			});
			it('should truncate passed description property to 255 characters (excluding trimmed whitespace)', function() {
			
				testOptions[0].description = 'Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Duis mollis, est non commodo luctus, nisi erat porttitorlia test options instance, eget lacinia odio sem nec elit. Donec ullamcorper nulla non metus auctor fringilla. Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].description).to.equal('Maecenas sed diam eget risus varius blandit sit amet non magna. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam id dolor id nibh ultricies vehicula ut id elit. Duis mollis, est non commodo luctus, nisi erat porttitorlia test options instance');
			
			});
			it('should set requiredArguments property to an empty array if argument passed is not an array.', function() {
			
				testOptions[0].requiredArguments = 'test options argument';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].requiredArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set requiredArguments property to an empty array if argument passed is not an array with a string as first element.', function() {
			
				testOptions[0].requiredArguments = [null, 'testOptionsArgument'];
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].requiredArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set requiredArguments property to an array with an empty string replacing non-leading elements in passed array that are not strings.', function() {
			
				testOptions[0].requiredArguments = ['testOptionsArgment', null, 'testOptionsArgumentThree'];
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].requiredArguments).to.be.an('array').that.includes('');
			
			});
			it('should set optionalArguments property to an empty array if argument passed is not an array.', function() {
			
				testOptions[0].optionalArguments = 'test options argument';
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].optionalArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set optionalArguments property to an empty array if argument passed is not an array with a string as first element.', function() {
			
				testOptions[0].optionalArguments = [null, 'testOptionsArgument'];
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].optionalArguments).to.be.an('array').that.is.empty;
			
			});
			it('should set optionalArguments property to an array with an empty string replacing non-leading elements in passed array that are not strings.', function() {
			
				testOptions[0].optionalArguments = ['testOptionsArgment', null, 'testOptionsArgumentThree'];
				cmd = new Cmd(
					testCmdArgs.command,
					testOptions,
					testCmdArgs.path
				);
				testOptions = cmd.options;
				expect(testOptions[0].optionalArguments).to.be.an('array').that.includes('');
			
			});
		
		});
	
	});

});
