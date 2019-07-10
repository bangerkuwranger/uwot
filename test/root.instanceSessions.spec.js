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
		
		});
		describe('renew(sessionId, expiryExtensionMs, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.renew).to.be.a('function');
			
			});
		
		});
		describe('getValidInstances(callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.getValidInstances).to.be.a('function');
			
			});
		
		});
		describe('findById(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.findById).to.be.a('function');
			
			});
		
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
		
		});
		describe('validate()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.validate).to.be.a('function');
			
			});
		
		});
		describe('renew()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.renew).to.be.a('function');
			
			});
		
		});
		describe('toDB()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.toDB).to.be.a('function');
			
			});
		
		});
	
	});

});
