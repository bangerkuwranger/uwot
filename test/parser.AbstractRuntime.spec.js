const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const AbstractRuntime = require('../parser/AbstractRuntime');

describe('AbstractRuntime.js', function() {

	describe('UwotAbstractRuntime', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(ast, user)', function() {
		
			it('should be a function');
			it('should not be able to be instantiated directly');
			it('should throw a TypeError if the implementing class does not implement the buildCommands method');
			it('should throw a TypeError if the implementing class does not implement the executeCommands method');
			it('should throw a TypeError if the implementing class does not implement the parseCommandNode method');
			it('should throw a TypeError if the implementing class does not implement the outputLine method');
			it('should throw a TypeError if the implementing class does not implement the executeMap method');
		
		});
		describe('addAppInstance(app)', function() {
		
			it('should be a function');
			it('should assign the app arg value of the runtime instance to its app property');
		
		});
		describe('addInstanceSession(isid)', function() {
		
			it('should be a function');
			it('should assign the isid arg value of the runtime instance to its isid property');
		
		});

	});

});
