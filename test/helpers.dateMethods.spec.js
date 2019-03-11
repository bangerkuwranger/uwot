const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var dateMethods = require('../helpers/dateMethods');

describe('dateMethods.js', function() {

	var testDate;
	beforeEach(function() {
	
		testDate = new Date(1546450800498);
	
	});
	describe('Date.toMySqlString()', function() {
	
		var asMySqlString = '2019-01-02 17:40:00';
		it('should be a property of a Date', function() {
		
			expect(testDate).to.have.property('toMySqlString');
		
		});
		it('should be a function', function() {
		
			expect(testDate.toMySqlString).to.be.a('function');
		
		});
		it('should return Date value as a string', function() {
		
			expect(testDate.toMySqlString()).to.be.a('string');
		
		});
		it('should return Date value as a string formatted in MySQL native format (YYYY-MM-DD HH:MM:SS)', function() {
		
			expect(testDate.toMySqlString()).to.equal(asMySqlString);
		
		});
		
	
	});
	describe('Date.toCsvString()', function() {
	
		var asCsvString = '2019-01-02 17:40:00 UTC';
		it('should be a property of a Date', function() {
		
			expect(testDate).to.have.property('toCsvString');
		
		});
		it('should be a function', function() {
		
			expect(testDate.toCsvString).to.be.a('function');
		
		});
		it('should return Date value as a string', function() {
		
			expect(testDate.toCsvString()).to.be.a('string');
		
		});
		it('should return Date value as a string formatted in CSV output format (YYYY-MM-DD HH:MM:SS TZ)', function() {
		
			expect(testDate.toCsvString()).to.equal(asCsvString);
		
		});
	
	});

});
