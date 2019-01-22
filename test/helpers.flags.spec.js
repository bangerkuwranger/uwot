const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var FlagSet = require('../helpers/flags');
var testFlagSet;
const testFlagSetArgs = [
	{
		flagString: 's',
		type: 'boolean',
		name: 'save'
	},
	{
		flagString: 'd',
		type: 'string',
		name: 'default name',
		defaultValue: 'flag'
	},
	{
		flagString: 'p',
		type: 'json',
		name: 'parent'
	},
	'-r',
	{
		flagString: null,
		type: 'boolean',
		name: ''
	},
	{
		flagString: 'x',
		type: 'date',
		name: 'remove by date',
		defaultValue: new Date()
	}
];

describe('flags.js', function() {
	
	beforeEach(function() {
	
		testFlagSet = new FlagSet(testFlagSetArgs);
	
	});
	describe('FlagSet', function() {
	
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				console.log(JSON.stringify(testFlagSet));
				expect(FlagSet).to.be.a('function');
			
			});
		
		});
		describe('addFlag', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.addFlag).to.be.a('function');
			
			});
		
		});
		describe('removeFlag', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.removeFlag).to.be.a('function');
			
			});
		
		});
		describe('parseFlags', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.parseFlags).to.be.a('function');
			
			});
		
		});
	
	});
	describe('Flag', function() {
	
		beforeEach(function() {
	
			testFlagSet = new FlagSet(testFlagSetArgs);
	
		});
		it('should not allow the constructor to be called outside of the FlagSet class methods', function() {
	
			function returnNewFlag() {
			
				return new Flag();
			
			}
			expect(returnNewFlag).to.throw(ReferenceError, 'Flag is not defined');
	
		});
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.flags.get('s')).to.have.property('constructor').that.is.a('function');
			
			});
		
		});
		describe('parseFromString', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.flags.get('s')).to.have.property('parseFromString').that.is.a('function');
			
			});
		
		});
	
	});

});
