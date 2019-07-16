const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const RuntimeCmds = require('../parser/RuntimeCmds');
const bashParser = require('bash-parser');

const defaultCmdParser = require('../parser/defaultCmdParser');

describe('defaultCmdParser.js', function() {

	describe('defaultCmdParser', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		it('should be a function');
		it('should throw a TypeError if callback arg value is not a function');
		it('should return a TypeError to callback if args is not an object with a non-empty string cmd property value');
		it('should return a response object with a cmdAst property containing the value of bashParser(args.cmd)');
		it('should get a guest user instance from global.Uwot.Users if args.isAuthenticated is not truthy, or if args.userId is not a non-empty string');
		it('should return an error if global.Uwot.Users.getGuest returns an error');
		it('should return a response object with a runtime property resulting from calling the RuntimeCmds constructor with response.cmdAst and guest user as args if calling getGuest is successful');
		it('should get a user instance for args.userId from global.Uwot.Users if args.isAuthenticated is truthy, and args.userId is a non-empty string');
		it('should return an error if global.Uwot.Users.findById returns an error');
		it('should get a guest user instance from global.Uwot.Users if findById does not return a valid user object');
		it('should return an error if global.Uwot.Users.getGuest returns an error after findById does not return a valid user object');
		it('should return a response object with a runtime property resulting from calling the RuntimeCmds constructor with response.cmdAst and guest user as args if calling getGuest is successful');
		it('should return a response object with a runtime property resulting from calling the RuntimeCmds constructor with response.cmdAst and guest user as args if calling getGuest is successful after findById does not return a valid user object');
		it('should return a response object with a runtime property resulting from calling the RuntimeCmds constructor with response.cmdAst and valid user instance as args if findById returns a valid user object');
		it('should call addAppInstance method with args.app as the argument on response.runtime prior to callback');
		it('should call addInstanceSessionId with args.isid as the argument on response.runtime prior to callback');

	});

});
