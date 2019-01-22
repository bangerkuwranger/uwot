const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

globalSetupHelper.initConstants();
var FlagSet = require('../helpers/flags');
var testFlagSet;
const testFlagSetArgs = [
	{
		flagString: 's',
		type: 'boolean',
		name: 'save'
	},
	{
		flagString: '',
		type: 'boolean',
		name: 'empty'
	},
	{
		flagString: 'd',
		type: 'string',
		name: 'default name',
		defaultVal: 'flag'
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
		defaultVal: new Date()
	},
	null,
	{
		flagString: 'u',
		type: 'boolean',
		name: 'unset',
		defaultVal: true
	},
	{
		flagString: 'a',
		type: 'json',
		name: 'additional names',
		defaultVal: {middle: 'A.'}
	},
	{
		flagString: 'l',
		type: 'string',
		name: 'last'
	},
	{
		flagString: 'b',
		type: 'boolean',
		name: 'is boolean',
		defaultVal: 'sure'
	},
	{
		flagString: 'y',
		type: 'string',
		name: 'yellow',
		defaultVal: false
	},
	{
		flagString: 'k',
		type: 'json',
		name: 'type check',
		defaultVal: 'percival'
	},
];

describe('flags.js', function() {
	
	beforeEach(function() {
	
		testFlagSet = new FlagSet(testFlagSetArgs);
	
	});
	describe('FlagSet', function() {
	
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(FlagSet).to.be.a('function');
// 				var validTestFlags = [];
// 				testFlagSet.flags.forEach(function(f) {
// 				
// 					validTestFlags.push(f);
// 				
// 				});
// 				testFlagSet.flags = validTestFlags;
// 				console.log(JSON.stringify(testFlagSet));
			
			});
			it('should throw a TypeError if the flags argument is not an array', function() {
			
				function useNullArg() {
				
					return new FlagSet(null);
				
				}
				function useUndefinedArg() {
				
					return new FlagSet();
				
				}
				expect(useNullArg).to.throw(TypeError, 'flags must be an array');
				expect(useUndefinedArg).to.throw(TypeError, 'flags must be an array');
			
			});
			it('should add valid members of flags Array to map assigned to this.flags', function() {
			
				var flagOne = testFlagSetArgs[0];
				flagOne.defaultVal = false;
				expect(testFlagSet.flags.get('s')).to.be.an('object').that.deep.equals(flagOne);
				var flagTwo = testFlagSetArgs[2];
				flagTwo.defaultVal = 'flag';
				expect(testFlagSet.flags.get('d')).to.be.an('object').that.deep.equals(flagTwo);
				var flagThree = testFlagSetArgs[3];
				flagThree.defaultVal = {};
				expect(testFlagSet.flags.get('p')).to.be.an('object').that.deep.equals(flagThree);
			
			});
			it('should push members of flags array with empty strings as flagString properties to this.invalidFlags instead of adding to this.flags', function() {
			
				expect(testFlagSet.invalidFlags[0]).to.deep.equal(testFlagSetArgs[1]);
			
			});
			it('should push members of flags array that are not objects or are null to this.invalidFlags instead of adding to this.flags', function() {
			
				expect(testFlagSet.invalidFlags[1]).to.equal(testFlagSetArgs[4]);
				expect(testFlagSet.invalidFlags[4]).to.equal(testFlagSetArgs[7]);
			
			});
			it('should push members of flags array that cause the Flag constructor to throw an error when passed as arg to this.invalidFlags instead of adding to this.flags', function() {
			
				expect(testFlagSet.invalidFlags[2]).to.deep.equal(testFlagSetArgs[5]);
				expect(testFlagSet.invalidFlags[3]).to.deep.equal(testFlagSetArgs[6]);
			
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
			it('should return a Map object', function() {
			
				expect(testFlagSet.parseFlags('s=true')).to.be.an.instanceof(Map);
				expect(testFlagSet.parseFlags(null)).to.be.an.instanceof(Map);
;			
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
			it('should throw a TypeError if flagString is not a string', function() {
			
				expect(testFlagSet.flagErrors).to.be.an('array');
				expect(testFlagSet.flagErrors[0]).to.be.an.instanceof(TypeError);
				expect(testFlagSet.flagErrors[0].message).to.equal('invalid flagString');
			
			});
			it('should throw a TypeError if type is not a valid flag type (boolean, string, or json)', function() {
			
				expect(testFlagSet.flagErrors).to.be.an('array');
				expect(testFlagSet.flagErrors[1]).to.be.an.instanceof(TypeError);
				expect(testFlagSet.flagErrors[1].message).to.equal('invalid flag type');
			
			});
			it('should assign defaultVal to this.defaultVal if passed and matches passed type', function() {
			
				expect(testFlagSet.flags.get('d').defaultVal).to.equal(testFlagSetArgs[2].defaultVal);
				expect(testFlagSet.flags.get('u').defaultVal).to.equal(testFlagSetArgs[8].defaultVal);
				expect(testFlagSet.flags.get('a').defaultVal).to.equal(testFlagSetArgs[9].defaultVal);
			
			});
			it('should assign type defaults to this.defaultVal if defaultVal not passed', function() {
			
				expect(testFlagSet.flags.get('s').defaultVal).to.be.false;
				expect(testFlagSet.flags.get('p').defaultVal).to.deep.equal({});
				expect(testFlagSet.flags.get('l').defaultVal).to.equal('');
			
			});
			it('should assign type defaults to this.defaultVal if defaultVal passed but not matching type', function() {
			
				expect(testFlagSet.flags.get('b').defaultVal).to.be.false;
				expect(testFlagSet.flags.get('k').defaultVal).to.deep.equal({});
				expect(testFlagSet.flags.get('y').defaultVal).to.equal('');
			
			});
		
		});
		describe('parseFromString', function() {
		
			it('should be a function', function() {
			
				expect(testFlagSet.flags.get('s')).to.have.property('parseFromString').that.is.a('function');
			
			});
			it('should throw a TypeError if stringValue is not a string', function() {
			
				function passNullStringValue() {
				
					return testFlagSet.flags.get('s').parseFromString(null);
				
				}
				expect(passNullStringValue).to.throw(TypeError, 'stringValue must be a string');
			
			});
			it('should return an array with this.flagString as the first member', function() {
			
				var parseEmpty = testFlagSet.flags.get('s').parseFromString('');
				expect(parseEmpty).to.be.an('array');
				expect(parseEmpty[0]).to.equal(testFlagSetArgs[0].flagString);
			
			});
			it('should return an array where the second member is the parsed value from the stringValue argument', function() {
			
				var parseString = testFlagSet.flags.get('d').parseFromString('doubleFlag');
				expect(parseString).to.be.an('array');
				expect(parseString[1]).to.equal('doubleFlag');
			
			});
			it('should return a parsed value that matches the given string, forced to this.type, if not an equality (e.g. not "[this.flagString]=givenValue")', function() {
			
				var parseBool = testFlagSet.flags.get('s').parseFromString('doubleFlag');
				expect(parseBool[1]).to.be.true;
				var parseJson = testFlagSet.flags.get('p').parseFromString('doubleFlag');
				expect(parseJson[1]).to.deep.equal({value: 'doubleFlag'});
				parseJson = testFlagSet.flags.get('p').parseFromString('{"parent":"doubleFlag"}');
				expect(parseJson[1]).to.deep.equal({parent: 'doubleFlag'});
			
			});
			it('should return a parsed value that matches this.defaultVal when passed an empty string', function() {
			
				var parseBool = testFlagSet.flags.get('s').parseFromString('');
				expect(parseBool[1]).to.be.false;
				var parseJson = testFlagSet.flags.get('p').parseFromString('');
				expect(parseJson[1]).to.deep.equal({value: {}});
				var parseString = testFlagSet.flags.get('d').parseFromString('');
				expect(parseString[1]).to.equal('flag');
			
			});
			it('should return a parsed value that matches the right side of given string\'s equality statement, forced to this.type, if it is passed an equality (e.g. "[this.flagString]=givenValue")', function() {
			
				var parseBool = testFlagSet.flags.get('s').parseFromString('s=false');
				expect(parseBool[1]).to.be.false;
				var parseJson = testFlagSet.flags.get('p').parseFromString('p={"parent": "false"}');
				expect(parseJson[1]).to.deep.equal({parent: 'false'});
				var parseString = testFlagSet.flags.get('d').parseFromString('d={"parent":"false"}');
				expect(parseString[1]).to.equal('{"parent":"false"}');
			
			});
			it('should return true as a parsed value for boolean flags that only pass this.flagString as stringValue argument (e.g. flagString is "s" and stringValue is "s")', function() {
			
				expect(testFlagSet.flags.get('s').parseFromString('s')[1]).to.be.true;
			
			});
		
		});
	
	});

});
