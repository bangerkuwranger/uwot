const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const RuntimeCmds = require('../parser/RuntimeCmds');
const bashParser = require('bash-parser');

const globalSetupHelper = require('../helpers/globalSetup');

const defaultCmdParser = require('../parser/defaultCmdParser');

const getTestAst = function() {

	return {
		type: 'Script',
		commands: [
			{
				type: 'Command',
				name: {
					type: 'Word',
					text: 'invalid'
				}
			}
		]
	};

};
const getTestUser = function() {

	return {
		"fName": "Found",
		"lName": "User",
		"uName": "fuser",
		"password": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI.Ai1mX96Xc7efm",
		"sudoer": true,
		"salt": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI",
		"createdAt": new Date(1546450800498),
		"updatedAt": new Date(1546450800498),
		"_id": "CDeOOrH0gOg791cZ",
		"maySudo": function() { return this.sudoer; }
	};

};
var testGuestUser;
const getTestGuest = function() {

	return Object.assign({}, testGuestUser);

}

describe('defaultCmdParser.js', function() {

	before('insure globals', function() {
	
		if ('object' !== typeof global.Uwot) {
	
			globalSetupHelper.initGlobalObjects;
	
		}
		if ('string' !== typeof global.Uwot.Constants.appRoot) {

			globalSetupHelper.initConstants();

		}
		if ('object' !== typeof global.Uwot.Config || 'UwotConfigBase' !== global.Uwot.Config.constructor.name) {
	
			globalSetupHelper.initEnvironment();
	
		}
		global.Uwot.Users.getGuest(function(error, guestUser) {

			testGuestUser = guestUser;
			return;

		});
	
	});
	describe('defaultCmdParser(args, callback)', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		it('should be a function', function() {
		
			expect(defaultCmdParser).to.be.a('function');
		
		});
		it('should throw a TypeError if callback arg value is not a function', function() {
		
			expect(defaultCmdParser).to.throw(TypeError, 'invalid callback passed to defaultCmdParser');
		
		});
		it('should return a TypeError to callback if args is not an object with a non-empty string cmd property value', function(done) {
		
			defaultCmdParser(null, function(e, r) { 
				
				expect(e).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to defaultCmdParser');
				defaultCmdParser('args', function(e, r) { 
			
					expect(e).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to defaultCmdParser');
					defaultCmdParser({isAuthenticated: true, userId: 'CDeOOrH0gOg791cZ'}, function(e, r) { 
			
						expect(e).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to defaultCmdParser');
						defaultCmdParser({isAuthenticated: true, userId: 'CDeOOrH0gOg791cZ', cmd: ''}, function(e, r) { 
						
							expect(e).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid args passed to defaultCmdParser');
							done();
					
						});
					
					});
				
				});
			
			});
		
		});
		it('should return a response object with a cmdAst property containing the value of bashParser(args.cmd)', function(done) {
		
			var testArgs = {isAuthenticated: true, userId: 'CDeOOrH0gOg791cZ', cmd: 'test command'};
			var testCmdAst = bashParser(testArgs.cmd);
			var usersFindByIdStub = sinon.stub(global.Uwot.Users, 'findById').callsFake(function returnTestUserToCb(uid, cb) {
			
				return cb(false, getTestUser());
			
			});
			defaultCmdParser(testArgs, function(e, r) {
			
				delete r.cmdAst.commands[0].id;
				expect(r).to.be.an('object').with.property('cmdAst').that.deep.equals(testCmdAst);
				done();
			
			});
		
		});
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
