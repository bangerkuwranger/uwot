const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var sanitize = require('../helpers/valueConversion');
require('../helpers/stringMethods');

describe('valueConversion.js', function() {
	const testValues = {};
	var testString;
	var testNumber;
	var testBool;
	var testDate;
	var testArray;
	beforeEach(function() {
	
		testString = '  is thatAll there_is   ?  ';
		testNumber = 2.718281828459;
		testBool = false;
		testDate = new Date(1546450800498);
		testArray = [
			{
				a: 1,
				b: 'falstaff',
				c: null
			},
			{
				a: 2,
				b: 'falstaff',
				c: null
			},
			{
				a: 1,
				b: 'ivanovitch',
				c: {path: 'b/a/'}
			}
		];
		testValues.string = testString;
		testValues.number = testNumber;
		testValues.boolean	= testBool;
		testValues.date = testDate;
		testValues.array = testArray;
	
	});
	describe('Test Values', function() {
	
		it('are defined',  function() {
	
			console.log('\x1b[36m%s\x1b[0m', '	' + testValues.string);
			console.log('\x1b[36m%s\x1b[0m', '	' + testValues.number);
			console.log('\x1b[36m%s\x1b[0m', '	' + testValues.boolean);
			console.log('\x1b[36m%s\x1b[0m', '	' + testValues.date);
			console.log('\x1b[36m%s\x1b[0m', '	' + JSON.stringify(testValues.array));
	
		});
	
	});
	describe('cleanString(value, length, defaultValue)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanString).to.be.a('function');
		
		});
		it('should return null if no arguments are passed', function() {
		
			expect(sanitize.cleanString()).to.be.null;
		
		});
		it('should return the value argument with trimmed leading and following whitespace if value is a string', function() {
		
			expect(sanitize.cleanString(testValues.string)).to.be.a('string').that.equals(testString.trim());
		
		});
		it('should return a string truncated after length argument value\'s number of characters from start of value string, after trimming whitespace', function() {
		
				expect(sanitize.cleanString(testValues.string, 7)).to.equal(testString.trim().substring(0,7));
		
		});
		it('should use the first integer value for length if length argument value is a float', function() {
		
				expect(sanitize.cleanString(testValues.string, 7.4)).to.equal(testString.trim().substring(0,7));
				expect(sanitize.cleanString(testValues.string, 7.8)).to.equal(testString.trim().substring(0,7));
		
		});
		it('should use 255 as default length if length argument is undefined, not a number, or less than one.', function() {
		
			var longString = "  Aenean lacinia bibendum nulla sed consectetur. Nullam id dolor id nibh ultricies vehicula ut id elit. Nullam quis risus eget urna mollis ornare vel eu leo. Sed posuere consectetur est at lobortis. Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Donec id elit non mi porta gravida at eget metus. Nullam quis risus eget urna mollis ornare vel eu leo.	";
			expect(sanitize.cleanString(longString)).to.equal(longString.trim().substring(0,255));
			expect(sanitize.cleanString(longString, 'elephantine')).to.equal(longString.trim().substring(0,255));
			expect(sanitize.cleanString(longString, -30)).to.equal(longString.trim().substring(0,255));
		
		});
		it('should return the specified defaultValue argument if defaultValue is a string and value is undefined', function() {
		
			var testArgs = [testValues.string, 8, 'elephantine'];
			expect(sanitize.cleanString(...testArgs)).to.equal(testString.trim().substring(0,8));
			delete testArgs[0];
			expect(sanitize.cleanString(...testArgs)).to.equal(testArgs[2]);
		
		});
		it('should return the trimmed, truncated result of the toString method of the value argument if it is not a string and not null', function() {
		
			expect(sanitize.cleanString(testValues.number, 6)).to.equal(testNumber.toString().trim().substring(0,6));
		
		});
		it('should return null if the value argument is null', function() {
		
			expect(sanitize.cleanString(null)).to.be.null;
		
		});
	
	});
	describe('cleanInt(value, defaultValue, format)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanInt).to.be.a('function');
		
		});
		it('should return 0 if passed no arguments', function() {
		
			expect(sanitize.cleanInt()).to.equal(0);
		
		});
		it('should return the value argument if it is a positive integer or 0', function() {
		
			expect(sanitize.cleanInt(144)).to.equal(144);
			expect(sanitize.cleanInt(0)).to.equal(0);
		
		});
		it('should return 0 if the value argument is a negative integer', function() {
		
			expect(sanitize.cleanInt(-144)).to.equal(0);
		
		});
		it('should return an integer parsed from the value argument if parseInt(value) resolves to a positive integer or 0', function() {
		
			expect(sanitize.cleanInt(144.441)).to.equal(144);
			expect(sanitize.cleanInt(-144.441)).to.equal(0);
		
		});
		it('should return 0 if parseInt(value) resolves to a negative integer', function() {
		
			expect(sanitize.cleanInt(-144)).to.equal(0);
		
		});
		it('should return null if value argument is null', function() {
		
			expect(sanitize.cleanInt(null)).to.be.null;
		
		});
		it('should return 0 if parseInt(value) is NaN and defaultValue arg is undefined', function() {
		
			expect(sanitize.cleanInt('miniscule')).to.equal(0);
		
		});
		it('should return defaultValue argument if parseInt(value) is NaN and defaultValue arg is defined', function() {
		
			expect(sanitize.cleanInt('miniscule', 8)).to.equal(8);
		
		});
		it('should return defaultValue argument if parseInt(value) is a positive integer that is less than defaultValue, and defaultValue is a number', function() {
		
			expect(sanitize.cleanInt('7', 8)).to.equal(8);
			expect(sanitize.cleanInt('-7', 8)).to.equal(8);
		
		});
		it('should return value argument if parseInt(value) is a positive integer that is greater than than defaultValue, and defaultValue is a number', function() {
		
			expect(sanitize.cleanInt('144', 8)).to.equal(144);
		
		});
		it('should return value argument if parseInt(value) is a positive integer and defaultValue is not a number', function() {
		
			expect(sanitize.cleanInt('7', '8')).to.equal(7);
			expect(sanitize.cleanInt(144, 'horsefeathers')).to.equal(144);
		
		});
		it('should return null if format==="db" and value===null', function() {
		
			expect(sanitize.cleanInt(null, null, 'db')).to.be.null;
		
		});
		it('should return parseInt(value) if format==="db" and parseInt(value) is a positive integer that is greater than defaultValue', function() {
		
			expect(sanitize.cleanInt(144, null, 'db')).to.equal(144);
			expect(sanitize.cleanInt(144, 8, 'db')).to.equal(144);
		
		});
		it('should return defaultValue if format==="db" and parseInt(value) is NaN and defaultValue is null or a Number', function() {
		
			expect(sanitize.cleanInt('picayune', null, 'db')).to.equal(null);
			expect(sanitize.cleanInt('balderdash', 8, 'db')).to.equal(8);
		
		});
		it('should return 0 if format==="db" and parseInt(value) is NaN and defaultValue is not null or a Number', function() {
		
			expect(sanitize.cleanInt('horsefeathers', 'falwell', 'db')).to.equal(0);
		
		});
		it('should return 0 if format==="db" and parseInt(value) is NaN and defaultValue is undefined', function() {
		
			var args = [
				'fantasy',
				'cantor',
				'db'
			];
			delete args[1];
			expect(sanitize.cleanInt(...args)).to.equal(0);
		
		});
		it('should return an empty string if format==="csv" and value===null', function() {
		
			expect(sanitize.cleanInt(null, null, 'csv')).to.equal('');
		
		});
		it('should return parseInt(value).toString() if format==="csv" and parseInt(value) is a positive integer that is greater than defaultValue', function() {
		
			expect(sanitize.cleanInt(144, null, 'csv')).to.equal('144');
			expect(sanitize.cleanInt(144, 8, 'csv')).to.equal('144');
		
		});
		it('should return defaultValue.toString() if format==="csv" and parseInt(value) is NaN and defaultValue is a Number', function() {
		
			expect(sanitize.cleanInt('balderdash', 8, 'csv')).to.equal('8');
		
		});
		it('should return an empty string if format==="csv" and parseInt(value) is NaN and defaultValue is null', function() {
		
			expect(sanitize.cleanInt('picayune', null, 'csv')).to.equal('');
		
		});
		it('should return "0" if format==="csv" and parseInt(value) is NaN and defaultValue is not null or a Number', function() {
		
			expect(sanitize.cleanInt('horsefeathers', 'falwell', 'csv')).to.equal('0');
		
		});
		it('should return "0" if format==="csv" and parseInt(value) is NaN and defaultValue is undefined', function() {
		
			var args = [
				'fantasy',
				'cantor',
				'csv'
			];
			delete args[1];
			expect(sanitize.cleanInt(...args)).to.equal('0');
		
		});
	
	});
	describe('cleanFloat(value, defaultValue, format)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanFloat).to.be.a('function');
		
		});
		it('should return 0 if passed no arguments', function() {
		
			expect(sanitize.cleanFloat()).to.equal(0);
		
		});
		it('should return the value argument if parseFloat(value) is a positive number or 0', function() {
		
			expect(sanitize.cleanFloat(144)).to.equal(144);
			expect(sanitize.cleanFloat(0)).to.equal(0);
			expect(sanitize.cleanFloat('7', 8)).to.equal(7);
			expect(sanitize.cleanFloat('144', 8)).to.equal(144);
		
		});
		it('should return the value argument if parseFloat(value) is a negative number', function() {
		
			expect(sanitize.cleanFloat(-144)).to.equal(-144);
			expect(sanitize.cleanFloat('-7', 8)).to.equal(-7);
		
		});
		it('should return an float limited to 4 decimal places parsed from the value argument if parseFloat(value) is a Number', function() {
		
			expect(sanitize.cleanFloat(144.44175)).to.equal(144.4418);
			expect(sanitize.cleanFloat('-144.4418')).to.equal(-144.4418);
		
		});
		it('should return 0 if value argument is null', function() {
		
			expect(sanitize.cleanFloat(null)).to.equal(0);
		
		});
		it('should return 0 if parseFloat(value) is NaN and defaultValue arg is undefined', function() {
		
			expect(sanitize.cleanFloat('miniscule')).to.equal(0);
		
		});
		it('should return defaultValue argument if parseFloat(value) is NaN and defaultValue arg is defined', function() {
		
			expect(sanitize.cleanFloat('miniscule', 8)).to.equal(8);
		
		});
		it('should return value argument if parseFloat(value) is a number and defaultValue is not a number', function() {
		
			expect(sanitize.cleanFloat('7', '8')).to.equal(7);
			expect(sanitize.cleanFloat(144, 'horsefeathers')).to.equal(144);
			expect(sanitize.cleanFloat(-42, '42')).to.equal(-42);
		
		});
		it('should return 0 if format==="db" and value===null', function() {
		
			expect(sanitize.cleanFloat(null, null, 'db')).to.equal(0);
		
		});
		it('should return parseFloat(value) if format==="db" and parseFloat(value) is a positive number', function() {
		
			expect(sanitize.cleanFloat(144, null, 'db')).to.equal(144);
			expect(sanitize.cleanFloat(144, 8, 'db')).to.equal(144);
		
		});
		it('should return defaultValue if format==="db" and parseFloat(value) is NaN and defaultValue is a Number', function() {
		
			expect(sanitize.cleanFloat('balderdash', 8, 'db')).to.equal(8);
		
		});
		it('should return 0 if format==="db" and parseFloat(value) is NaN and defaultValue is not a Number', function() {
		
			expect(sanitize.cleanFloat('horsefeathers', 'falwell', 'db')).to.equal(0);
			expect(sanitize.cleanFloat('picayune', null, 'db')).to.equal(0);
		
		});
		it('should return 0 if format==="db" and parseFloat(value) is NaN and defaultValue is undefined', function() {
		
			var args = [
				'fantasy',
				'cantor',
				'db'
			];
			delete args[1];
			expect(sanitize.cleanFloat(...args)).to.equal(0);
		
		});
		it('should return an empty string if format==="csv" and value===null', function() {
		
			expect(sanitize.cleanFloat(null, null, 'csv')).to.equal('');
		
		});
		it('should return parseFloat(value).toString() to four decimals if format==="csv" and parseFloat(value) is a number', function() {
		
			expect(sanitize.cleanFloat(144, null, 'csv')).to.equal('144.0000');
			expect(sanitize.cleanFloat(144.27, 8, 'csv')).to.equal('144.2700');
		
		});
		it('should return defaultValue.toString() if format==="csv" and parseFloat(value) is NaN and defaultValue is a Number', function() {
		
			expect(sanitize.cleanFloat('balderdash', 8, 'csv')).to.equal('8.0000');
		
		});
		it('should return "0.0000" if format==="csv" and parseFloat(value) is NaN and defaultValue is not a Number', function() {
		
			expect(sanitize.cleanFloat('picayune', null, 'csv')).to.equal('0.0000');
			expect(sanitize.cleanFloat('horsefeathers', 'falwell', 'csv')).to.equal('0.0000');
			var args = [
				'fantasy',
				'cantor',
				'csv'
			];
			delete args[1];
			expect(sanitize.cleanFloat(...args)).to.equal('0.0000');
		
		});
	
	});
	describe('cleanBool(value, defaultValue, format)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanBool).to.be.a('function');
		
		});
		it('should return false if passed no arguments', function() {
		
			expect(sanitize.cleanBool()).to.be.false;
		
		});
		it('should return false if value argument is false, "false", 0, or "0"', function() {
		
			expect(sanitize.cleanBool(false)).to.be.false;
			expect(sanitize.cleanBool('false')).to.be.false;
			expect(sanitize.cleanBool(0)).to.be.false;
			expect(sanitize.cleanBool('0')).to.be.false;
		
		});
		it('should return false if value argument is undefined, null, "", or NaN when defaultValue is undefined', function() {
		
			expect(sanitize.cleanBool(null)).to.be.false;
			expect(sanitize.cleanBool('')).to.be.false;
			expect(sanitize.cleanBool(parseInt('jellyfishnose'))).to.be.false;
			var args = [];
			expect(sanitize.cleanBool(...args)).to.be.false;
		
		})
		it('should return true if value argument is NOT false, "false", 0, "0", undefined, null, "", or NaN', function() {
		
			expect(sanitize.cleanBool(true)).to.be.true;
			expect(sanitize.cleanBool('true')).to.be.true;
			expect(sanitize.cleanBool(1)).to.be.true;
			expect(sanitize.cleanBool(parseInt('9000'))).to.be.true;
			expect(sanitize.cleanBool('veritas')).to.be.true;
			expect(sanitize.cleanBool('null')).to.be.true;
			expect(sanitize.cleanBool([])).to.be.true;
			expect(sanitize.cleanBool(['0'])).to.be.true;
			expect(sanitize.cleanBool({})).to.be.true;
			expect(sanitize.cleanBool({isTrue: false})).to.be.true;
		
		});
		it('should return false if value argument is undefined, null, "", or NaN when defaultValue is false, "false", 0, "0", null, "", or NaN', function() {
		
			expect(sanitize.cleanBool(null, false)).to.be.false;
			expect(sanitize.cleanBool(null, 'false')).to.be.false;
			expect(sanitize.cleanBool(null, 0)).to.be.false;
			expect(sanitize.cleanBool(null, '0')).to.be.false;
			expect(sanitize.cleanBool(null, null)).to.be.false;
			expect(sanitize.cleanBool(null, '')).to.be.false;
			expect(sanitize.cleanBool(null, parseInt('preposterousness'))).to.be.false;
			
			expect(sanitize.cleanBool('', false)).to.be.false;
			expect(sanitize.cleanBool('', 'false')).to.be.false;
			expect(sanitize.cleanBool('', 0)).to.be.false;
			expect(sanitize.cleanBool('', '0')).to.be.false;
			expect(sanitize.cleanBool('', null)).to.be.false;
			expect(sanitize.cleanBool('', '')).to.be.false;
			expect(sanitize.cleanBool('', parseInt('preposterousness'))).to.be.false;
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), false)).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'false')).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 0)).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '0')).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), null)).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '')).to.be.false;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('preposterousness'))).to.be.false;
			
			var args = [];
			args[1] = false;
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = 'false';
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = 0;
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = '0';
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = null;
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = '';
			expect(sanitize.cleanBool(...args)).to.be.false;
			args[1] = parseInt('preposterousness');
			expect(sanitize.cleanBool(...args)).to.be.false;
		
		});
		it('should return true if value argument is undefined, null, "", or NaN when defaultValue is NOT false, "false", 0, "0", null, "", or NaN', function() {
		
			expect(sanitize.cleanBool(null, true)).to.be.true;
			expect(sanitize.cleanBool(null, 'true')).to.be.true;
			expect(sanitize.cleanBool(null, 1)).to.be.true;
			expect(sanitize.cleanBool(null, '1')).to.be.true;
			expect(sanitize.cleanBool(null, 'null')).to.be.true;
			expect(sanitize.cleanBool(null, 'theAnswer')).to.be.true;
			expect(sanitize.cleanBool(null, parseInt('42'))).to.be.true;
			expect(sanitize.cleanBool(null, 'theAnswer')).to.be.true;
			expect(sanitize.cleanBool(null, [])).to.be.true;
			expect(sanitize.cleanBool(null, ['0'])).to.be.true;
			expect(sanitize.cleanBool(null, {})).to.be.true;
			expect(sanitize.cleanBool(null, {isTrue: false})).to.be.true;
			
			expect(sanitize.cleanBool('', true)).to.be.true;
			expect(sanitize.cleanBool('', 'true')).to.be.true;
			expect(sanitize.cleanBool('', 1)).to.be.true;
			expect(sanitize.cleanBool('', '1')).to.be.true;
			expect(sanitize.cleanBool('', 'null')).to.be.true;
			expect(sanitize.cleanBool('', 'theAnswer')).to.be.true;
			expect(sanitize.cleanBool('', parseInt('42'))).to.be.true;
			expect(sanitize.cleanBool('', [])).to.be.true;
			expect(sanitize.cleanBool('', ['0'])).to.be.true;
			expect(sanitize.cleanBool('', {})).to.be.true;
			expect(sanitize.cleanBool('', {isTrue: false})).to.be.true;
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), true)).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'true')).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 1)).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '1')).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'null')).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'theAnswer')).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('42'))).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), [])).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), ['0'])).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {})).to.be.true;
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {isTrue: false})).to.be.true;
			
			var args = [];
			args[1] = true;
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = 'true';
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = 1;
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = '1';
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = 'null';
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = 'theAnswer';
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = parseInt('42');
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = [];
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = ['0'];
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = {};
			expect(sanitize.cleanBool(...args)).to.be.true;
			args[1] = {isTrue: false};
			expect(sanitize.cleanBool(...args)).to.be.true;
		
		});
		it('should return 1 if format==="db" and cleanBool would otherwise return true', function() {
		
			var args = [];
			args[2] = 'db';
			args[0] = true;
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = 'true';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = 1;
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = parseInt('9000');
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = 'veritas';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = 'null';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = [];
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = ['0'];
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = {};
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[0] = {isTrue: false};
			expect(sanitize.cleanBool(...args)).to.equal(1);
			
			delete args[0];
			args[1] = true;
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = 'true';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = 1;
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = '1';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = 'null';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = 'theAnswer';
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = parseInt('42');
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = [];
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = ['0'];
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = {};
			expect(sanitize.cleanBool(...args)).to.equal(1);
			args[1] = {isTrue: false};
			expect(sanitize.cleanBool(...args)).to.equal(1);
			
			expect(sanitize.cleanBool(null, true, 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, 'true', 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, 1, 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, '1', 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, 'null', 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, 'theAnswer', 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, parseInt('42'), 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, 'theAnswer', 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, [], 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, ['0'], 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, {}, 'db')).to.equal(1);
			expect(sanitize.cleanBool(null, {isTrue: false}, 'db')).to.equal(1);
			
			expect(sanitize.cleanBool('', true, 'db')).to.equal(1);
			expect(sanitize.cleanBool('', 'true', 'db')).to.equal(1);
			expect(sanitize.cleanBool('', 1, 'db')).to.equal(1);
			expect(sanitize.cleanBool('', '1', 'db')).to.equal(1);
			expect(sanitize.cleanBool('', 'null', 'db')).to.equal(1);
			expect(sanitize.cleanBool('', 'theAnswer', 'db')).to.equal(1);
			expect(sanitize.cleanBool('', parseInt('42'), 'db')).to.equal(1);
			expect(sanitize.cleanBool('', [], 'db')).to.equal(1);
			expect(sanitize.cleanBool('', ['0'], 'db')).to.equal(1);
			expect(sanitize.cleanBool('', {}, 'db')).to.equal(1);
			expect(sanitize.cleanBool('', {isTrue: false}, 'db')).to.equal(1);
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), true, 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'true', 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 1, 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '1', 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'null', 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'theAnswer', 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('42'), 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), [], 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), ['0'], 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {}, 'db')).to.equal(1);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {isTrue: false}, 'db')).to.equal(1);
		
		});
		it('should return 0 if format==="db" and cleanBool would otherwise return false', function() {
		
			var args = [];
			args[2] = 'db';
			args[0] = false;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = 'false';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = 0;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = '0';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = null;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = '';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[0] = parseInt('jellyfishnose');
			expect(sanitize.cleanBool(...args)).to.equal(0);
			
			delete args[0];
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = false;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = 'false';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = 0;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = '0';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = null;
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = '';
			expect(sanitize.cleanBool(...args)).to.equal(0);
			args[1] = parseInt('preposterousness');
			expect(sanitize.cleanBool(...args)).to.equal(0);
			
			expect(sanitize.cleanBool(null, false, 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, 'false', 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, 0, 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, '0', 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, null, 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, '', 'db')).to.equal(0);
			expect(sanitize.cleanBool(null, parseInt('preposterousness'), 'db')).to.equal(0);
			
			expect(sanitize.cleanBool('', false, 'db')).to.equal(0);
			expect(sanitize.cleanBool('', 'false', 'db')).to.equal(0);
			expect(sanitize.cleanBool('', 0, 'db')).to.equal(0);
			expect(sanitize.cleanBool('', '0', 'db')).to.equal(0);
			expect(sanitize.cleanBool('', null, 'db')).to.equal(0);
			expect(sanitize.cleanBool('', '', 'db')).to.equal(0);
			expect(sanitize.cleanBool('', parseInt('preposterousness'), 'db')).to.equal(0);
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), false, 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'false', 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 0, 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '0', 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), null, 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '', 'db')).to.equal(0);
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('preposterousness'), 'db')).to.equal(0);
		
		});
		it('should return "true" if format==="csv" and cleanBool would otherwise return true', function() {
		
			var args = [];
			args[2] = 'csv';
			args[0] = true;
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = 'true';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = 1;
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = parseInt('9000');
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = 'veritas';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = 'null';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = [];
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = ['0'];
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = {};
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[0] = {isTrue: false};
			expect(sanitize.cleanBool(...args)).to.equal('true');
			
			delete args[0];
			args[1] = true;
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = 'true';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = 1;
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = '1';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = 'null';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = 'theAnswer';
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = parseInt('42');
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = [];
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = ['0'];
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = {};
			expect(sanitize.cleanBool(...args)).to.equal('true');
			args[1] = {isTrue: false};
			expect(sanitize.cleanBool(...args)).to.equal('true');
			
			expect(sanitize.cleanBool(null, true, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, 'true', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, 1, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, '1', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, 'null', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, 'theAnswer', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, parseInt('42'), 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, 'theAnswer', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, [], 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, ['0'], 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, {}, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(null, {isTrue: false}, 'csv')).to.equal('true');
			
			expect(sanitize.cleanBool('', true, 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', 'true', 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', 1, 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', '1', 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', 'null', 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', 'theAnswer', 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', parseInt('42'), 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', [], 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', ['0'], 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', {}, 'csv')).to.equal('true');
			expect(sanitize.cleanBool('', {isTrue: false}, 'csv')).to.equal('true');
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), true, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'true', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 1, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '1', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'null', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'theAnswer', 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('42'), 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), [], 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), ['0'], 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {}, 'csv')).to.equal('true');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), {isTrue: false}, 'csv')).to.equal('true');
		
		});
		it('should return "false" if format==="csv" and cleanBool would otherwise return false', function() {
		
			var args = [];
			args[2] = 'csv';
			args[0] = false;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = 'false';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = 0;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = '0';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = null;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = '';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[0] = parseInt('jellyfishnose');
			expect(sanitize.cleanBool(...args)).to.equal('false');
			
			delete args[0];
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = false;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = 'false';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = 0;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = '0';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = null;
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = '';
			expect(sanitize.cleanBool(...args)).to.equal('false');
			args[1] = parseInt('preposterousness');
			expect(sanitize.cleanBool(...args)).to.equal('false');
			
			expect(sanitize.cleanBool(null, false, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, 'false', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, 0, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, '0', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, null, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, '', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(null, parseInt('preposterousness'), 'csv')).to.equal('false');
			
			expect(sanitize.cleanBool('', false, 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', 'false', 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', 0, 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', '0', 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', null, 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', '', 'csv')).to.equal('false');
			expect(sanitize.cleanBool('', parseInt('preposterousness'), 'csv')).to.equal('false');
			
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), false, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 'false', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), 0, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '0', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), null, 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), '', 'csv')).to.equal('false');
			expect(sanitize.cleanBool(parseInt('faaaaaaake'), parseInt('preposterousness'), 'csv')).to.equal('false');
		
		});
	
	});
	describe('cleanDate(value, format)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanDate).to.be.a('function');
		
		});
		it('should return new Date() if not passed any arguments', function() {
		
			let now = new Date();
			let result = sanitize.cleanDate();
			expect(result).to.be.an.instanceof(Date);
			expect(result >= now).to.be.true;
		
		});
		it('should return value if value is a Date object and format !== "db" || "csv"', function() {
		
			expect(sanitize.cleanDate(testValues.date)).to.deep.equal(testDate);
			expect(sanitize.cleanDate(testValues.date, testValues.string)).to.deep.equal(testDate);
			expect(sanitize.cleanDate(testValues.date, testValues.array)).to.deep.equal(testDate);
		
		});
		it('should return new Date(value) if value is a string that can be parsed to a valid date and format !== "db" || "csv"', function() {
		
			var testDateString = testValues.date.toISOString();
			var nowDate = new Date();
			var nowString = nowDate.toISOString();
			expect(sanitize.cleanDate(testDateString)).to.deep.equal(testDate);
			expect(sanitize.cleanDate(nowString)).to.deep.equal(nowDate);
		
		});
		it('should return new Date(value) if value is a number that can be parsed to a valid date and format !== "db" || "csv"', function() {
		
			var testNumDate = new Date(testNumber);
			expect(sanitize.cleanDate(1546450800498)).to.deep.equal(testDate);
			expect(sanitize.cleanDate(testValues.number)).to.deep.equal(testNumDate);
		
		});
		it('should return new Date() if value cannot be parsed to a valid date and format !== "db" || "csv"', function() {
		
			var testNum = -68000000000000000000000;
			var testNumDate = sanitize.cleanDate(testNum);
			var testStringDate = sanitize.cleanDate(testValues.string);
			var nowDate = new Date();
			expect(nowDate >= testNumDate).to.be.true;
			expect(nowDate >= testStringDate).to.be.true;
			expect(new Date(testNum).toString()).to.equal('Invalid Date');
			expect(new Date(testString).toString()).to.equal('Invalid Date');
			expect(testNumDate.toString()).not.to.equal('Invalid Date');
			expect(testStringDate.toString()).not.to.equal('Invalid Date');
		
		});
		it('should return a string in MySQL format (YYYY-MM-DD HH:MM:SS) parsed from expected Date object if format==="db"', function() {
		
			expect(sanitize.cleanDate(testValues.date, 'db')).to.equal('2019-01-02 17:40:00');
		
		});
		it('should return a string in csv format (YYYY-MM-DD HH:MM:SS ZZZ) parsed from expected Date object if format==="csv"', function() {
		
			expect(sanitize.cleanDate(testValues.date, 'csv')).to.equal('2019-01-02 17:40:00 UTC');
		
		});
		
	});
	describe('stringNoSpaces(value, format)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.stringNoSpaces).to.be.a('function');
		
		});
		it('should return an empty string if passed no arguments', function() {
		
			expect(sanitize.stringNoSpaces()).to.equal('');
		
		});
		it('should return an empty string if value argument is null', function() {
		
			expect(sanitize.stringNoSpaces(null)).to.equal('');
		
		});
		it('should return the value argument as a string with all leading and following whitespace removed and all internal spaces replaced by camelCapping (non-alpha chars are removed) if it is passed as a string and format!=="us"', function() {
		
			expect(sanitize.stringNoSpaces(testValues.string)).to.equal(testString.trim().split(' ').join('_').toCamel());
		
		});
		it('should return the value argument as a string with all leading and following whitespace removed and all internal spaces replaced by single underscores, and all characters after each underscore in lowercase (non-alpha/non-underscore chars are removed) if it is passed as a string and format==="us"', function() {
		
			expect(sanitize.stringNoSpaces(testValues.string, 'us')).to.equal(testString.trim().split(' ').join('_').toUnderscore());
		
		});
		it('should return the value argument as a string with all leading and following whitespace removed and all internal spaces replaced by camelCapping (non-alpha chars are removed) if value is not a string, null, or undefined, and format!=="us"', function() {
		
			expect(sanitize.stringNoSpaces(testValues.number)).to.equal(testNumber.toString().trim().split(' ').join('_').toCamel());
			expect(sanitize.stringNoSpaces(testValues.boolean)).to.equal(testBool.toString().trim().split(' ').join('_').toCamel());
			expect(sanitize.stringNoSpaces(testValues.date)).to.equal(testDate.toString().trim().split(' ').join('_').toCamel());
			expect(sanitize.stringNoSpaces(testValues.array)).to.equal(testArray.toString().trim().split(' ').join('_').toCamel());
		
		});
		it('should return the value argument as a string with all leading and following whitespace removed and internal spaces replaced by single underscores, and all characters after each underscore in lowercase  (non-alpha/non-underscore chars are removed) if value is not a string, null, or undefined, and format==="us"', function() {
		
			expect(sanitize.stringNoSpaces(testValues.number, 'us')).to.equal(testNumber.toString().trim().split(' ').join('_').toUnderscore());
			expect(sanitize.stringNoSpaces(testValues.boolean, 'us')).to.equal(testBool.toString().trim().split(' ').join('_').toUnderscore());
			expect(sanitize.stringNoSpaces(testValues.date, 'us')).to.equal(testDate.toString().trim().split(' ').join('_').toUnderscore());
			expect(sanitize.stringNoSpaces(testValues.array, 'us')).to.equal(testArray.toString().trim().split(' ').join('_').toUnderscore());
		
		});
	
	});
	describe('arrayOfObjectsOrEmpty(value)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.arrayOfObjectsOrEmpty).to.be.a('function');
		
		});
		it('should return an empty array if passed no arguments', function() {
		
			expect(sanitize.arrayOfObjectsOrEmpty()).to.deep.equal([]);
		
		});
		it('should return an empty array if value argument is not an array or if the first array element is not an object (or null...)', function() {
		
			expect(sanitize.arrayOfObjectsOrEmpty([1,2,3])).to.deep.equal([]);
			expect(sanitize.arrayOfObjectsOrEmpty(null)).to.deep.equal([]);
			expect(sanitize.arrayOfObjectsOrEmpty('[1,2,3]')).to.deep.equal([]);
			expect(sanitize.arrayOfObjectsOrEmpty(new Date())).to.deep.equal([]);
			expect(sanitize.arrayOfObjectsOrEmpty(['heresy', new Error('excommunicated.'), new Date()])).to.deep.equal([]);
		
		});
		it('should return an array with the same elements as the value argument if it is an array that only has objects as elements', function() {
		
			
			expect(sanitize.arrayOfObjectsOrEmpty(testValues.array)).to.deep.equal(testArray);
			var testArraywNull = Array.from(testArray);
			testArraywNull.unshift(null);
			expect(sanitize.arrayOfObjectsOrEmpty(testArraywNull)).to.deep.equal(testArraywNull);
		
		});
		it('should return an array with the same elements as the value argument, replacing any non-object members with null, if it is an array that has an object as its first element', function() {
		
			var testArraywGarbage = Array.from(testValues.array);
			var testArraywNulls = Array.from(testArray);
			testArraywGarbage.push(testValues.string, testValues.number, testValues.boolean);
			testArraywNulls.push(null, null, null);
			expect(sanitize.arrayOfObjectsOrEmpty(testArraywGarbage)).to.deep.equal(testArraywNulls);
		
		});
	
	});
	describe('arrayOfStringsOrEmpty(value, discardEmpty)', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty).to.be.a('function');
		
		});
		it('should return an empty array if passed no arguments', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty()).to.deep.equal([]);
		
		});
		it('should return an empty array if value argument is not an array', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty(null)).to.deep.equal([]);
			expect(sanitize.arrayOfStringsOrEmpty('[1,2,3]')).to.deep.equal([]);
			expect(sanitize.arrayOfStringsOrEmpty(new Date())).to.deep.equal([]);
		
		});
		it('should return an empty array if argument is an array with no string elements and discardEmpty is true', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty([1,2,3], true)).to.deep.equal([]);
			expect(sanitize.arrayOfStringsOrEmpty([42, null, new Error('excommunicated.'), new Date()], true)).to.deep.equal([]);
		
		});
		it('should return an array with empty strings in place of all argument array elements if argument is an array with no string elements and discardEmpty is not true', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty([1,2,3], false)).to.deep.equal(['', '', '']);
			expect(sanitize.arrayOfStringsOrEmpty([42, null, new Error('excommunicated.'), new Date()])).to.deep.equal(['', '', '', '']);
		
		});
		it('should return an array with the same elements as the value argument if it is an array that only has strings as elements', function() {
		
			var strArray = ['come', 'at', 'me', 'bro'];
			expect(sanitize.arrayOfStringsOrEmpty(strArray)).to.deep.equal(strArray);
		
		});
		it('should return an array with the same elements as the value argument, replacing any non-string members with empty strings', function() {
		
			var strArray = ['come', 'at', 'me', 'bro'];
			var testArraywGarbage = Array.from(strArray);
			var testArraywEmpties = Array.from(strArray);
			testArraywGarbage.push(testValues.date, testValues.number, testValues.boolean);
			testArraywEmpties.push('', '', '');
			expect(sanitize.arrayOfStringsOrEmpty(testArraywGarbage)).to.deep.equal(testArraywEmpties);
		
		});
		it('should return an array containing only string elements of the argument array, replacing any non-string members with empty strings, and discardEmpty is true', function() {
		
			var strArray = ['come', 'at', 'me', 'bro'];
			var testArraywGarbage = Array.from(strArray);
			var testArraywEmpties = Array.from(strArray);
			testArraywGarbage.push(testValues.date, testValues.number, testValues.boolean);
			expect(sanitize.arrayOfStringsOrEmpty(testArraywGarbage, true)).to.deep.equal(testArraywEmpties);
		
		});
	
	});

});
