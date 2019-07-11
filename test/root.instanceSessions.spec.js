var path = require('path');
var fs = require('fs-extra');
var globalSetupHelper = require('../helpers/globalSetup');
var systemError = require('../helpers/systemError');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var bcrypt = require('bcryptjs');

const InstanceSessions = require('../instanceSessions');
var instanceSessions;

describe('instanceSessions.js', function() {

	before('getting fresh InstanceSessions instance', function() {
	
		globalSetupHelper.uninitialize();
		globalSetupHelper.initGlobalObjects();
		globalSetupHelper.initConstants();
		globalSetupHelper.initEnvironment();
		instanceSessions = global.Uwot.InstanceSessions;

	});
	describe('UwotInstanceSessions', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor()', function() {
	
			it('creates an object with a db property', function() {
			
				expect(instanceSessions).to.have.own.property('db');
		
			});
	
		});
		describe('db', function() {
	
		
			it('should be an object', function() {
		
				expect(instanceSessions.db).to.be.an('object');
		
			});
			it('should have a filename that is a string', function() {
		
				expect(instanceSessions.db.filename).to.be.a('string');
		
			});
			it('should have a filename point to a file that exists', function() {
		
				expect(fs.existsSync(instanceSessions.db.filename)).to.equal(true);
		
			});
			it('should have a property "find" that is a function', function() {
		
				expect(instanceSessions.db.find).to.be.a('function');
			
			});
			it('should have a property "insert" that is a function', function() {
		
				expect(instanceSessions.db.insert).to.be.a('function');
			
			});
			it('should have a property "remove" that is a function', function() {
		
				expect(instanceSessions.db.remove).to.be.a('function');
			
			});
			it('should have a property "update" that is a function', function() {
		
				expect(instanceSessions.db.update).to.be.a('function');
			
			});
			it('should have a property "count" that is a function', function() {
		
				expect(instanceSessions.db.update).to.be.a('function');
			
			});
	
		});
		describe('createNew(expiryMs, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.createNew).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should use the config users:instanceSessionExpiry value for expiryMs if the arg value is not a string or number that can be parsed to an integer');
			it('should return callback(Error, null) if db.insert returns an error');
			it('should return callback(false, false) if db.insert does not return a non-null object with a string value for its "_id" property');
			it('should return callback(Error, null) if creating a new InstanceSession with saved data throws an error');
			it('should return callback(false, InstanceSession) if record was created without error and InstanceSession instance was created without error');
		
		});
		describe('remove(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.remove).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string');
			it('should return callback(Error, null) if db.remove returns an error');
			it('should return callback(false, false) if db.remove failed to remove any records');
			it('should return callback(false, true) if db.remove removed any records');
		
		});
		describe('validate(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.validate).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string');
			it('should return callback(Error, null) if db.find returns an error');
			it('should return callback(false, false) if db.find failed to match any records');
			it('should return callback(false, false) if InstanceSession from matched db data returns false from validate() method');
			it('should return callback(false, true) if InstanceSession from matched db data returns true from validate() method');
		
		});
		describe('invalidate(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.invalidate).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string');
			it('should return callback(Error, null) if db.update returns an error');
			it('should return callback(false, false) if db.update failed to update any records');
			it('should set expiresAt timestamp to current time and return callback(false, sessionId)');
		
		});
		describe('renew(sessionId, expiryExtensionMs, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.renew).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string');
			it('should return callback(Error, null) if db.find returns an error');
			it('should return callback(false, false) if db.find failed to match any records');
			it('should return callback(Error, null) if db.update returns an error');
			it('should return callback(false, false) if db.update failed to update any records');
			it('should set expiresAt timestamp to current time plus value of expiryExtensionMs and return callback(false, sessionId)');
		
		});
		describe('getValidInstances(callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.getValidInstances).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(Error, null) if db.find returns an error');
			it('should return callback(false, false) if db.find failed to match any records');
			it('should return an array of objects that for valid sessions if they exist and db operations complete without error');
		
		});
		describe('findById(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.findById).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function');
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string');
			it('should return callback(Error, null) if db.find returns an error');
			it('should return callback(false, false) if db.find failed to match any records');
			it('should return callback(false, object) with an object created by InstanceSession.toDB() from db data matching given ID');
		
		});

	});
	describe('InstanceSession', function() {
	
		var testInstanceSession;
		beforeEach('getting fresh User instance as testUser', function(done) {
	
			const dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnUserDoc(searchTerms, searchSettings, callback) {
				
				var now = new Date();
				return callback(false, [
					{
						"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
						"createdAt": now,
						"expiresAt": new Date(now.getTime() + 30000)
					}
				]);
		
			});
			instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
		
				testInstanceSession = instanceSessionObj;
				done();
		
			});
	
		});
		afterEach(function() {

			sinon.restore();

		});
		describe('constructor(_id, expiry, createdAt, expiresAt)', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.constructor).to.be.a('function');
			
			});
			it('should assign the value of the _id arg, truncated to 255 characters, to its _id property if the arg value is a non-empty string');
			it('should generate a secure random string and assign it to its _id value if the _id arg value is null or not a non-empty string');
			it('should assign a Date object from the value of the createdAt arg value to its createdAt property if the arg value is a valid Date object or a string that can be parsed by the Date constructor');
			it('should assign a Date object with the current timestamp to its createdAt property if the createdAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor');
			it('should assign a Date object from the value of the expiresAt arg value to its expiresAt property if the arg value is a valid Date object or a string that can be parsed by the Date constructor');
			it('should assign a Date object with the value of the createdAt Ms from epoch plus the integer value of the expiry argument if to its expiresAt property if the expiresAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor and the expiry arg value can be parsed to a valid positive integer');
			it('should assign a Date object with the value of the createdAt Ms from epoch plus the integer value of the config setting users:instanceSessionExpiry to its expiresAt property if the expiresAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor and the expiry arg value can not be parsed to a valid positive integer');
		
		});
		describe('validate()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.validate).to.be.a('function');
			
			});
			it('should return false if its expiresAt property is not a Date object');
			it('should return false if the expiresAt property is a Date object set to a timestamp older than or equal to the current timestamp');
			it('should return false if the expiresAt property is a Date object set to a timestamp further in the future than the current timestamp');
		
		});
		describe('renew(expiryExtension)', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.renew).to.be.a('function');
			
			});
			it('should update its expiresAt property to a Date object with the value of the current expiresAt Ms from epoch plus the integer value of the expiryExtension arg if it can be parsed to a positive integer');
			it('should update its expiresAt property to a Date object with the value of the current expiresAt Ms from epoch plus the integer value of config setting users:instanceSessionExpiry if the expiryExtension arg is undefined or otherwise cannot be parsed to a positive integer');
			it('should return the updated expiresAt property value');
		
		});
		describe('toDB()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.toDB).to.be.a('function');
			
			});
			it('should return a generic object with the _id, createdAt, and expiresAt properties and values matching the object instance the method was called on');
		
		});
	
	});

});
