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
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.createNew).to.throw(TypeError, 'invalid callback passed to createNew.');
			
			});
			it('should use the config users:instanceSessionExpiry value for expiryMs if the arg value is not a string or number that can be parsed to an integer', function(done) {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var dbInsertStub = sinon.stub(instanceSessions.db, 'insert').callsFake(function returnArg0(obj, cb) {
				
					return cb(false, obj);
				
				});
				instanceSessions.createNew(function(error, newSession) {
				
					expect(newSession.expiresAt.getTime()).to.equal(newSession.createdAt.getTime() + 7200000);
					configGetValStub.restore();
					dbInsertStub.restore();
					done();
				
				});
			
			});
			it('should use the the arg value for expiryMs if the it is a string or number that can be parsed to an integer', function(done) {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var dbInsertStub = sinon.stub(instanceSessions.db, 'insert').callsFake(function returnArg0(obj, cb) {
				
					return cb(false, obj);
				
				});
				instanceSessions.createNew(3600000, function(error, newSession) {
				
					expect(newSession.expiresAt.getTime()).to.equal(newSession.createdAt.getTime() + 3600000);
					instanceSessions.createNew('1800000', function(error, newSession) {
				
						expect(newSession.expiresAt.getTime()).to.equal(newSession.createdAt.getTime() + 1800000);
						configGetValStub.restore();
						dbInsertStub.restore();
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.insert returns an error', function(done) {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var dbInsertStub = sinon.stub(instanceSessions.db, 'insert').callsFake(function returnError(obj, cb) {
				
					return cb(new Error('test insert error'), null);
				
				});
				instanceSessions.createNew(function(error, newSession) {
				
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test insert error');
					configGetValStub.restore();
					dbInsertStub.restore();
					done();
				
				});
			
			});
			it('should return callback(false, false) if db.insert does not return a non-null object with a string value for its "_id" property', function(done) {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var dbInsertStub = sinon.stub(instanceSessions.db, 'insert');
				dbInsertStub.onCall(0).callsFake(function returnNull(obj, cb) {
				
					return cb(false, null);
				
				});
				dbInsertStub.onCall(1).callsFake(function returnNullId(obj, cb) {
				
					obj._id = null;
					return cb(false, obj);
				
				});
				instanceSessions.createNew(3600000, function(error, newSession) {
				
					expect(newSession).to.be.false;
					instanceSessions.createNew('1800000', function(error, newSession) {
				
						expect(newSession).to.be.false;
						configGetValStub.restore();
						dbInsertStub.restore();
						done();
				
					});
				
				});
			
			});
			it('should return callback(false, InstanceSession) if record was created without error', function(done) {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var savedObj;
				var dbInsertStub = sinon.stub(instanceSessions.db, 'insert').callsFake(function returnArg0andSave(obj, cb) {
				
					savedObj = obj;
					return cb(false, obj);
				
				});
				instanceSessions.createNew(function(error, newSession) {
				
					expect(savedObj).to.be.an('object');
					expect(newSession._id).to.equal(savedObj._id);
					expect(newSession.createdAt).to.deep.equal(savedObj.createdAt);
					expect(newSession.expiresAt).to.deep.equal(savedObj.expiresAt);
					configGetValStub.restore();
					dbInsertStub.restore();
					done();
				
				});
			
			});
		
		});
		describe('remove(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.remove).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.remove).to.throw(TypeError, 'invalid callback passed to remove.');
			
			});
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string', function(done) {
			
				instanceSessions.remove(null, function(error, wasRemoved) {
				
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid session id passed to remove.');
					instanceSessions.remove('', function(error, wasRemoved) {
				
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid session id passed to remove.');
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.remove returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbRemoveStub = sinon.stub(instanceSessions.db, 'remove').callsFake(function returnError(searchObj, opts, cb) {
				
					return cb(new Error('test remove error'), null);
				
				});
				instanceSessions.remove(testId, function(error, wasRemoved) {
			
					expect(wasRemoved).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test remove error');
					dbRemoveStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.remove failed to remove any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbRemoveStub = sinon.stub(instanceSessions.db, 'remove').callsFake(function return0(searchObj, opts, cb) {
				
					return cb(false, 0);
				
				});
				instanceSessions.remove(testId, function(error, wasRemoved) {
			
					expect(wasRemoved).to.be.false;
					expect(error).to.be.false;
					dbRemoveStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, true) if db.remove removed any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbRemoveStub = sinon.stub(instanceSessions.db, 'remove').callsFake(function return1(searchObj, opts, cb) {
				
					return cb(false, 1);
				
				});
				instanceSessions.remove(testId, function(error, wasRemoved) {
			
					expect(wasRemoved).to.be.true;
					expect(error).to.be.false;
					dbRemoveStub.restore();
					done();
			
				});
			
			});
		
		});
		describe('validate(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.validate).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.validate).to.throw(TypeError, 'invalid callback passed to validate.');
			
			});
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string', function(done) {
			
				instanceSessions.validate(null, function(error, wasRemoved) {
				
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to validate.');
					instanceSessions.validate('', function(error, wasRemoved) {
				
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to validate.');
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.find returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnError(searchObj, opts, cb) {
				
					return cb(new Error('test find error'), null);
				
				});
				instanceSessions.validate(testId, function(error, isValid) {
			
					expect(isValid).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test find error');
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.find failed to match any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnNoResults(searchObj, opts, cb) {
				
					return cb(false, []);
				
				});
				instanceSessions.validate(testId, function(error, isValid) {
			
					expect(isValid).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if InstanceSession from matched db data returns false from validate() method', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var testDate = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnInvalidResult(searchObj, opts, cb) {
				
					return cb(
						false,
						[
							{
								_id: testId,
								createdAt: testDate,
								expiresAt: testDate
							}
						]
					);
				
				});
				instanceSessions.validate(testId, function(error, isValid) {
			
					expect(isValid).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, true) if InstanceSession from matched db data returns true from validate() method', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var testDate = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnValidResult(searchObj, opts, cb) {
				
					return cb(
						false,
						[
							{
								_id: testId,
								createdAt: testDate,
								expiresAt: new Date(testDate.getTime() + 3600000)
							}
						]
					);
				
				});
				instanceSessions.validate(testId, function(error, isValid) {
			
					expect(isValid).to.be.true;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
		
		});
		describe('invalidate(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.invalidate).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.invalidate).to.throw(TypeError, 'invalid callback passed to invalidate.');
			
			});
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string', function(done) {
			
				instanceSessions.invalidate(null, function(error, sessionId) {
				
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to invalidate.');
					instanceSessions.invalidate('', function(error, sessionId) {
				
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to invalidate.');
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.update returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnError(searchObj, changes, opts, cb) {
				
					return cb(new Error('test update error'), null);
				
				});
				instanceSessions.invalidate(testId, function(error, sessionId) {
			
					expect(sessionId).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test update error');
					dbUpdateStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.update failed to update any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnNoUpdates(searchObj, changes, opts, cb) {
				
					return cb(false, 0);
				
				});
				instanceSessions.invalidate(testId, function(error, sessionId) {
			
					expect(sessionId).to.be.false;
					expect(error).to.be.false;
					dbUpdateStub.restore();
					done();
			
				});
			
			});
			it('should set expiresAt timestamp to current time and return callback(false, sessionId)', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var newExpires;
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnUpdated(searchObj, changes, opts, cb) {
				
					newExpires = changes.$set.expiresAt;
					return cb(false, 1);
				
				});
				instanceSessions.invalidate(testId, function(error, sessionId) {
			
					expect(sessionId).to.equal(testId);
					expect(newExpires.getTime()).to.equal(now.getTime());
					expect(error).to.be.false;
					dbUpdateStub.restore();
					done();
			
				});
			
			});
		
		});
		describe('renew(sessionId, expiryExtensionMs, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.renew).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.renew).to.throw(TypeError, 'invalid callback passed to renew.');
			
			});
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string', function(done) {
			
				instanceSessions.renew(null, 1200000, function(error, sessionId) {
				
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to renew.');
					instanceSessions.renew('', 1200000, function(error, sessionId) {
				
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to renew.');
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.find returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnError(searchObj, opts, cb) {
				
					return cb(new Error('test find error'), null);
				
				});
				instanceSessions.renew(testId, 1200000, function(error, session) {
			
					expect(session).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test find error');
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.find failed to match any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnNotFound(searchObj, opts, cb) {
				
					return cb(false, []);
				
				});
				instanceSessions.renew(testId, 1200000, function(error, session) {
			
					expect(session).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(Error, null) if db.update returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var oldExpiresAt;
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnRecord(searchObj, opts, cb) {
				
					oldExpiresAt = new Date(now.getTime() + 30000);
					return cb(false, [{
							"_id": testId,
							"createdAt": now,
							"expiresAt": oldExpiresAt
						}]);
				
				});
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnError(searchObj, changes, opts, cb) {
				
					return cb(new Error('test update error'))
				
				});
				instanceSessions.renew(testId, 1200000, function(error, session) {
			
					expect(session).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test update error');
					dbFindStub.restore();
					dbUpdateStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.update failed to update any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var oldExpiresAt;
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnRecord(searchObj, opts, cb) {
				
					oldExpiresAt = new Date(now.getTime() + 30000);
					return cb(false, [{
							"_id": testId,
							"createdAt": now,
							"expiresAt": oldExpiresAt
						}]);
				
				});
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnNoUpdates(searchObj, changes, opts, cb) {
				
					return cb(false, 0);
				
				});
				instanceSessions.renew(testId, 1200000, function(error, session) {
			
					expect(session).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					dbUpdateStub.restore();
					done();
			
				});
			
			});
			it('should set expiresAt timestamp to current time plus value of expiryExtensionMs and return callback(false, InstanceSession) if expiryExtensionMs is a positive integer', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var oldExpiresAt;
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnRecord(searchObj, opts, cb) {
				
					oldExpiresAt = new Date(now.getTime() + 30000);
					return cb(false, [{
							"_id": testId,
							"createdAt": now,
							"expiresAt": oldExpiresAt
						}]);
				
				});
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnNoUpdates(searchObj, changes, opts, cb) {
				
					return cb(false, 1);
				
				});
				instanceSessions.renew(testId, 1200000, function(error, session) {
			
					expect(session.expiresAt.getTime()).to.equal(oldExpiresAt.getTime() + 1200000);
					expect(error).to.be.false;
					dbFindStub.restore();
					dbUpdateStub.restore();
					done();
			
				});
			
			});
			it('should set expiresAt timestamp to current time from epoch plus the integer value of config setting users:instanceSessionExpiry and return callback(false, InstanceSession) if expiryExtensionMs is not a positive integer', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var oldExpiresAt;
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(6000000);
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnRecord(searchObj, opts, cb) {
				
					oldExpiresAt = new Date(now.getTime() + 30000);
					return cb(false, [{
							"_id": testId,
							"createdAt": now,
							"expiresAt": oldExpiresAt
						}]);
				
				});
				var dbUpdateStub = sinon.stub(instanceSessions.db, 'update').callsFake(function returnNoUpdates(searchObj, changes, opts, cb) {
				
					return cb(false, 1);
				
				});
				instanceSessions.renew(testId, 0, function(error, session) {
			
					expect(session.expiresAt.getTime()).to.equal(oldExpiresAt.getTime() + 6000000);
					expect(error).to.be.false;
					configGetValStub.restore();
					dbFindStub.restore();
					dbUpdateStub.restore();
					done();
			
				});
			
			});
		
		});
		describe('getValidInstances(callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.getValidInstances).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.getValidInstances).to.throw(TypeError, 'invalid callback passed to getValidInstances.');
			
			});
			it('should return callback(Error, null) if db.find returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnError(searchObj, opts, cb) {
				
					return cb(new Error('test find error'), null);
				
				});
				instanceSessions.getValidInstances(function(error, sessionArray) {
			
					expect(sessionArray).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test find error');
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.find failed to match any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnEmptyArray(searchObj, opts, cb) {
				
					return cb(false, []);
				
				});
				instanceSessions.getValidInstances(function(error, sessionArray) {
			
					expect(sessionArray).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return an array of objects that for valid sessions if they exist and db operations complete without error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnArray(searchObj, opts, cb) {
				
					return cb(false, [
						{
							"_id": testId,
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 300000)
						}
					]);
				
				});
				instanceSessions.getValidInstances(function(error, sessionArray) {
			
					expect(sessionArray).to.be.an('array').that.is.not.empty;
					expect(sessionArray[0]._id).to.equal(testId);
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
		
		});
		describe('findById(sessionId, callback)', function() {
		
			it('should be a function', function() {
			
				expect(instanceSessions.findById).to.be.a('function');
			
			});
			it('should throw a TypeError if callback is not a function', function() {
			
				expect(instanceSessions.findById).to.throw(TypeError, 'invalid callback passed to findById.');
			
			});
			it('should return callback(TypeError, null) if sessionId arg value is not a non-empty string', function(done) {
			
				instanceSessions.findById(null, function(error, session) {
				
					expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to findById.');
					instanceSessions.findById('', function(error, session) {
				
						expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid sessionId passed to findById.');
						done();
				
					});
				
				});
			
			});
			it('should return callback(Error, null) if db.find returns an error', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnError(searchObj, opts, cb) {
				
					return cb(new Error('test find error'), null);
				
				});
				instanceSessions.findById(testId, function(error, foundSession) {
			
					expect(foundSession).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test find error');
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, false) if db.find failed to match any records', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnNotFound(searchObj, opts, cb) {
				
					return cb(false, []);
				
				});
				instanceSessions.findById(testId, function(error, foundSession) {
			
					expect(foundSession).to.be.false;
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
			it('should return callback(false, object) with an object created by InstanceSession.toDB() from db data matching given ID', function(done) {
			
				var testId = "SBuXMoJxjj-uEDzF2gy0n8g6";
				var now = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnArray(searchObj, opts, cb) {
				
					return cb(false, [
						{
							"_id": testId,
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 300000)
						}
					]);
				
				});
				instanceSessions.findById(testId, function(error, foundSession) {
			
					expect(foundSession).to.be.an('object').with.property('_id').that.equals(testId);
					expect(foundSession.createdAt).to.deep.equal(now);
					expect(foundSession.expiresAt).to.deep.equal(new Date(now.getTime() + 300000));
					expect(error).to.be.false;
					dbFindStub.restore();
					done();
			
				});
			
			});
		
		});

	});
	describe('InstanceSession', function() {
	
		var testInstanceSession;
		beforeEach('getting fresh User instance as testUser', function(done) {
	
			var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
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
				dbFindStub.restore();
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
			it('should assign the value of the _id arg, truncated to 255 characters, to its _id property if the arg value is a non-empty string', function(done) {
			
				var test_id = "Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum. Sed posuere consectetur est at lobortis. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Vestibulum id ligula porta felis euismod semper. Cras mattis consectetur purus sit amet fermentum. Vestibulum id ligula porta felis euismod semper. Integer posuere erat a ante venenatis dapibus posuere velit aliquet. Donec ullamcorper nulla non metus auctor fringilla. Donec ullamcorper nulla non metus auctor fringilla. Donec ullamcorper nulla non metus auctor fringilla. Aenean eu leo quam. Pellentesque ornare sem lacinia quam venenatis vestibulum.";
				var now = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": test_id,
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 30000)
						}
					]);
			
				});
				instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
	
					expect(instanceSessionObj._id).to.equal(test_id.trim().substring(0, 255));
					dbFindStub.restore();
					done();
	
				});
			
			});
			it('should generate a secure random 24 character string and assign it to its _id value if the _id arg value is null or not a non-empty string', function(done) {
			
				var test_id = null;
				var now = new Date();
				var dbFindStub = sinon.stub(instanceSessions.db, 'find').callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": test_id,
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 30000)
						}
					]);
			
				});
				instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
	
					expect(instanceSessionObj['_id']).to.be.a('string');
					expect(instanceSessionObj['_id']).to.have.lengthOf(24);
					dbFindStub.restore();
					done();
	
				});
			
			});
			it('should assign a Date object from the value of the createdAt arg value to its createdAt property if the arg value is a valid Date object or a string that can be parsed by the Date constructor', function(done) {
			
				var now = new Date(1562861100000);
				var dbFindStub = sinon.stub(instanceSessions.db, 'find');
				dbFindStub.onCall(0).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 3600000)
						}
					]);
		
				});
				dbFindStub.onCall(1).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": '2019-07-11T16:05:00.000Z',
							"expiresAt": new Date(now.getTime() + 3600000)
						}
					]);
		
				});
				instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
		
					expect(instanceSessionObj.createdAt).to.deep.equal(now);
					instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj2) {
		
						expect(instanceSessionObj2.createdAt).to.deep.equal(now);
						dbFindStub.restore();
						done();
					
					});
		
				});
			
			});
			it('should assign a Date object with the current timestamp to its createdAt property if the createdAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor', function(done) {
			
				var dbFindStub = sinon.stub(instanceSessions.db, 'find');
				dbFindStub.onCall(0).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": null,
							"expiresAt": new Date(new Date().getTime() + 3600000)
						}
					]);
		
				});
				dbFindStub.onCall(1).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": "sometime last january... I forget",
							"expiresAt": new Date(new Date().getTime() + 3600000)
						}
					]);
		
				});
				instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
		
					expect(instanceSessionObj.createdAt.getTime() <= new Date().getTime()).to.be.true;
					instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj2) {
					
						expect(instanceSessionObj2.createdAt.getTime() <= new Date().getTime()).to.be.true;
						dbFindStub.restore();
						done();
					
					});
		
				});
			
			});
			it('should assign a Date object from the value of the expiresAt arg value to its expiresAt property if the arg value is a valid Date object or a string that can be parsed by the Date constructor', function(done) {
			
				var now = new Date(1562861100000);
				var dbFindStub = sinon.stub(instanceSessions.db, 'find');
				dbFindStub.onCall(0).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": now,
							"expiresAt": new Date(now.getTime() + 3600000)
						}
					]);
		
				});
				dbFindStub.onCall(1).callsFake(function returnInstanceSessionDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
							"createdAt": '2019-07-11T16:05:00.000Z',
							"expiresAt": '2019-07-11T17:05:00.000Z'
						}
					]);
		
				});
				instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj) {
		
					expect(instanceSessionObj.expiresAt.getTime()).to.equal(now.getTime() + 3600000);
					instanceSessions.findById('SBuXMoJxjj-uEDzF2gy0n8g6', function(error, instanceSessionObj2) {
		
						expect(instanceSessionObj2.expiresAt.getTime()).to.equal(new Date('2019-07-11T17:05:00.000Z').getTime());
						dbFindStub.restore();
						done();
					
					});
		
				});
			
			});
			it('should assign a Date object with the value of the createdAt Ms from epoch plus the integer value of the expiry argument if to its expiresAt property if the expiresAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor and the expiry arg value can be parsed to a valid positive integer', function() {
			
				var now = new Date(1562861100000);
				var instanceSessionObj = instanceSessions.getInstanceSessionObject(
					{
						"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
						"createdAt": now,
						"expiresAt": null,
						"expiry": 3600000
					}
				);
				var instanceSessionObj2 = instanceSessions.getInstanceSessionObject(
					{
						"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
						"createdAt": now,
						"expiry": '3600000'
					}
				);
				expect(instanceSessionObj.expiresAt.getTime()).to.equal(now.getTime() + 3600000);
				expect(instanceSessionObj2.expiresAt.getTime()).to.equal(now.getTime() + 3600000);
			
			});
			it('should assign a Date object with the value of the createdAt Ms from epoch plus the integer value of the config setting users:instanceSessionExpiry to its expiresAt property if the expiresAt arg value is neither a valid Date object nor a string that can be parsed by the Date constructor and the expiry arg value can not be parsed to a valid positive integer', function() {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var now = new Date(1562861100000);
				var instanceSessionObj = instanceSessions.getInstanceSessionObject(
					{
						"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
						"createdAt": now,
						"expiresAt": null,
						"expiry": -3600000
					}
				);
				var instanceSessionObj2 = instanceSessions.getInstanceSessionObject(
					{
						"_id": "SBuXMoJxjj-uEDzF2gy0n8g6",
						"createdAt": now,
						"expiry": 0
					}
				);
				expect(instanceSessionObj.expiresAt.getTime()).to.equal(now.getTime() + 7200000);
				expect(instanceSessionObj2.expiresAt.getTime()).to.equal(now.getTime() + 7200000);
				configGetValStub.restore();
			
			});
		
		});
		describe('validate()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.validate).to.be.a('function');
			
			});
			it('should return false if its expiresAt property is not a Date object', function() {
			
				testInstanceSession.expiresAt = null;
				expect(testInstanceSession.validate()).to.be.false;
				testInstanceSession.expiresAt = 'next friday';
				expect(testInstanceSession.validate()).to.be.false;
			
			});
			it('should return false if the expiresAt property is a Date object set to a timestamp older than or equal to the current timestamp', function() {
			
				testInstanceSession.expiresAt = testInstanceSession.createdAt;
				expect(testInstanceSession.validate()).to.be.false;
				testInstanceSession.expiresAt = new Date(testInstanceSession.createdAt.getTime() - 3600000);
				expect(testInstanceSession.validate()).to.be.false;
			
			});
			it('should return true if the expiresAt property is a Date object set to a timestamp further in the future than the current timestamp', function() {
			
				testInstanceSession.expiresAt = new Date(testInstanceSession.createdAt.getTime() + 3600000);
				expect(testInstanceSession.validate()).to.be.true;
			
			});
		
		});
		describe('renew(expiryExtension)', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.renew).to.be.a('function');
			
			});
			it('should update its expiresAt property to a Date object with the value of the current expiresAt Ms from epoch plus the integer value of the expiryExtension arg if it can be parsed to a positive integer', function() {
			
				const oldExpiresAt = testInstanceSession.expiresAt;
				var newExpiresAt = testInstanceSession.renew(10);
				expect(testInstanceSession.expiresAt.getTime()).to.equal(oldExpiresAt.getTime() + 10);
			
			});
			it('should update its expiresAt property to a Date object with the value of the current expiresAt Ms from epoch plus the integer value of config setting users:instanceSessionExpiry if the expiryExtension arg is undefined or otherwise cannot be parsed to a positive integer', function() {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				const oldExpiresAt = testInstanceSession.expiresAt;
				var newExpiresAt = testInstanceSession.renew(-10);
				expect(testInstanceSession.expiresAt.getTime()).to.equal(oldExpiresAt.getTime() + 7200000);
				testInstanceSession.expiresAt = oldExpiresAt;
				var newExpiresAt = testInstanceSession.renew();
				expect(testInstanceSession.expiresAt.getTime()).to.equal(oldExpiresAt.getTime() + 7200000);
				configGetValStub.restore();
			
			});
			it('should return the updated expiresAt property value', function() {
			
				var configGetValStub = sinon.stub(global.Uwot.Config, 'getVal').returns(7200000);
				var newExpiresAt = testInstanceSession.renew();
				expect(testInstanceSession.expiresAt).to.deep.equal(newExpiresAt);
				configGetValStub.restore();
			
			});
		
		});
		describe('toDB()', function() {
		
			it('should be a function', function() {
			
				expect(testInstanceSession.toDB).to.be.a('function');
			
			});
			it('should return a generic object with the _id, createdAt, and expiresAt properties and values matching the object instance the method was called on', function() {
			
				var genericInstanceSessionObj = testInstanceSession.toDB();
				expect(genericInstanceSessionObj).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
				expect(genericInstanceSessionObj).to.have.property('_id').that.equals(testInstanceSession._id);
				expect(genericInstanceSessionObj).to.have.property('createdAt').that.equals(testInstanceSession.createdAt);
				expect(genericInstanceSessionObj).to.have.property('expiresAt').that.equals(testInstanceSession.expiresAt);
				expect(genericInstanceSessionObj).to.not.have.property('validate');
				expect(genericInstanceSessionObj).to.not.have.property('renew');
				expect(genericInstanceSessionObj).to.not.have.property('toDB');
			
			});
		
		});
	
	});

});
