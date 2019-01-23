const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var stringMethods = require('../helpers/stringMethods');

describe('stringMethods.js', function() {

	var testString;
	beforeEach(function() {
	
		testString = '  is thatAll there_is   ?  ';
	
	});
	before(function() {
	console.log('\x1b[36m%s\x1b[0m', '	"  is thatAll there_is   ?  "'); })
	describe('toCamel', function() {
	
		it('should be a function', function() {
		
			expect(testString.toCamel).to.be.a('function');
		
		});
		it('should remove all space characters from return string', function() {
		
			var testCCString = testString.toCamel();
			console.log('\x1b[36m%s\x1b[0m', '	' + testCCString);
			expect(testCCString.indexOf(' ')).to.equal(-1);
		
		});
		it('should remove all non-Alpha characters from return string', function() {
		
			var testCCString = testString.toCamel();
			expect(testCCString.indexOf('?')).to.equal(-1);
		
		});
		it('should trim all surrounding space characters from return string', function() {
		
			var testCCString = testString.toCamel();
			expect(testCCString.indexOf('i')).to.equal(0);
			var testCCArray = testCCString.split('');
			expect(testCCArray[testCCArray.length - 1]).to.equal('s');
		
		});
		it('should replace all internal space and underscore characters and capitalize the first Word character after the space(s) or underscores', function() {
		
			expect(testString.toCamel()).to.equal('isThatAllThereIs');
		
		});
	
	});
	describe('toUnderscore', function() {
	
		it('should be a function', function() {
		
			expect(testString.toUnderscore).to.be.a('function');
		
		});
		it('should remove all space characters from return string', function() {
		
			var testUSString = testString.toUnderscore();
			console.log('\x1b[36m%s\x1b[0m', '	' + testUSString);
			expect(testUSString.indexOf(' ')).to.equal(-1);
		
		});
		it('should remove all non-Word characters from return string', function() {
		
			var testUSString = testString.toUnderscore();
			expect(testUSString.indexOf('?')).to.equal(-1);
		
		});
		it('should trim all surrounding space and underscore characters from return string', function() {
		
			var testUSString = testString.toUnderscore();
			expect(testUSString.indexOf('i')).to.equal(0);
			var testUSArray = testUSString.split('');
			expect(testUSArray[testUSArray.length - 1]).to.equal('s');
		
		});
		it('should replace all internal space characters with underscores, separate camelCasing with underscores, and set the first Word character after each underscore to lowercase', function() {
		
			expect(testString.toUnderscore()).to.equal('is_that_all_there_is');
		
		});
	
	});
	describe('toCrArray', function() {
	
		it('should be a function', function() {
		
			expect(testString.toCrArray).to.be.a('function');
		
		});
		it('should return an array with elements split by carriage returns', function() {
		
			testString += "\n\r" + 'One can only hope';
			var testCRArray = testString.toCrArray();
			console.log('\x1b[36m%s\x1b[0m', '	' + JSON.stringify(testCRArray));
			expect(testCRArray).to.be.an('array').that.includes('  is thatAll there_is   ?  ', 'One can only hope');
		
		});
	
	});

});
