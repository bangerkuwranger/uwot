const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var sanitize = require('../helpers/valueConversion');

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
	describe('cleanString', function() {
	
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
	describe('cleanInt', function() {
	
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
	describe('cleanFloat', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanFloat).to.be.a('function');
		
		});
	
	});
	describe('cleanBool', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanBool).to.be.a('function');
		
		});
	
	});
	describe('cleanDate', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.cleanDate).to.be.a('function');
		
		});
	
	});
	describe('stringNoSpaces', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.stringNoSpaces).to.be.a('function');
		
		});
	
	});
	describe('arrayOfObjectsOrEmpty', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.arrayOfObjectsOrEmpty).to.be.a('function');
		
		});
	
	});
	describe('arrayOfStringsOrEmpty', function() {
	
		it('should be a function', function() {
		
			expect(sanitize.arrayOfStringsOrEmpty).to.be.a('function');
		
		});
	
	});

});
