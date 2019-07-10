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
		
			it('should be a function');
		
		});
		describe('renew()', function() {
		
			it('should be a function');
		
		});
		describe('toDB()', function() {
		
			it('should be a function');
		
		});
	
	});

});
