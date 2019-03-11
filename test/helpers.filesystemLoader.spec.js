const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
var session = require('express-session');
var nedbSessionStore = require('nedb-session-store')(session);
globalSetupHelper.initConstants();
globalSetupHelper.initExports();
var filesystemLoader = require('../helpers/filesystemLoader');
var FileSystem = require('../filesystem');

const getSessions = function() {

	return [{passport:{user:{_id:'CDeOOrH0gOg791cZ'}}}];

};

const getInstanceUser = function() {

	return {
		"fName": "Found",
		"lName": "User",
		"uName": "fuser",
		"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
		"sudoer": true,
		"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
		"createdAt": new Date(1546450800498),
		"updatedAt": new Date(1546450800498),
		"_id": "CDeOOrH0gOg791cZ",
		"verifyPassword": function(pass) {return true;},
		"maySudo": function() {return this.sudoer;}
	};

};

const getGuestUser = function() {

	return {
		"fName": "Guest",
		"lName": "User",
		"uName": "guest",
		"_id": "GUEST",
		"maySudo": function() {return false;}
	};

};

describe('filesystemLoader.js', function() {

	describe('loadGuest()', function() {
		
		it('should be a function', function() {
		
			expect(filesystemLoader.loadGuest).to.be.a('function');
		
		});
		it('should return an error if FileSystem constructor throws an error', function() {
		
			if ('object' === typeof global.Uwot.Users && 'function' === typeof global.Uwot.Users.listUsers) {
			
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').throws(new TypeError('listUsers is not a function'));
			
			}
			if ('function' !== typeof global.Uwot.Config.getVal) {
			
				global.Uwot.Config.getVal = function() {
				
					return path.resolve(global.Uwot.Constants.appRoot + '/fs/var/www/html');
				
				};
			
			}
			else {
			
				var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').returns(path.resolve(global.Uwot.Constants.appRoot + '/fs/var/www/html'));
			
			}
			expect(filesystemLoader.loadGuest()).to.be.an.instanceof(TypeError).with.property('message').that.includes('listUsers is not a function');
			if ('undefined' !== typeof configGetStub) {
			
				configGetStub.restore();
			
			}
			else {
			
				delete global.Uwot.Config.getVal;
			
			}
			if ('undefined' !== typeof listUsersStub) {
			
				listUsersStub.restore();
			
			}
			
		
		});
		it('should assign a guest filesystem to global.Uwot.FileSystems.GUEST and return true if FileSystem constructor executes without error', function() {
		
			if ('function' !== typeof global.Uwot.Config.getVal) {
			
				global.Uwot.Config.getVal = function() {
				
					return path.resolve(global.Uwot.Constants.appRoot + '/fs/var/www/html');
				
				};
			
			}
			else {
			
				var configGetStub = sinon.stub(global.Uwot.Config, 'getVal').returns(path.resolve(global.Uwot.Constants.appRoot + '/fs/var/www/html'));
			
			}
			if ('object' !== typeof global.Uwot.Users) {
			
				global.Uwot.Users = {};
				var resetUsers = true;
			
			}
			if ('function' !== typeof global.Uwot.Users.listUsers) {
			
				global.Uwot.Users.listUsers = function() {
				
					return [getInstanceUser()];
				
				};
			
			}
			else {
			
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').returns([getInstanceUser()]);
			
			}
			if ('function' !== typeof global.Uwot.Users.getGuest) {
			
				global.Uwot.Users.getGuest = function() {
				
					return [getGuestUser()];
				
				};
			
			}
			else {
			
				var getGuestStub = sinon.stub(global.Uwot.Users, 'getGuest').returns([getGuestUser()]);
			
			}
			if ('function' !== typeof global.Uwot.Users.findById) {
			
				global.Uwot.Users.findById = function() {
				
					return [];
				
				};
			
			}
			else {
			
				var findByIdStub = sinon.stub(global.Uwot.Users, 'findById').returns([]);
			
			}
			expect(filesystemLoader.loadGuest()).to.be.true;
			expect(global.Uwot.FileSystems.GUEST).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFs');
			if ('undefined' !== typeof configGetStub) {
			
				configGetStub.restore();
			
			}
			else {
			
				delete global.Uwot.Config.getVal;
			
			}
			if ('undefined' !== typeof listUsersStub) {
			
				listUsersStub.restore();
			
			}
			else {
			
				delete global.Uwot.Users.listUsers;
			
			}
			if ('undefined' !== typeof getGuestStub) {
			
				getGuestStub.restore();
			
			}
			else {
			
				delete global.Uwot.Users.getGuest;
			
			}
			if ('undefined' !== typeof findByIdStub) {
			
				findByIdStub.restore();
			
			}
			else {
			
				delete global.Uwot.Users.findById;
			
			}
			if ('undefined' !== typeof resetUsers && resetUsers) {
			
				delete  global.Uwot.Users;
			
			}
			
		
		});
	
	});
	describe('loadActiveSessionFilesystems(sessionStore, callback)', function() {
	
		it('should be a function', function() {
		
			expect(filesystemLoader.loadActiveSessionFilesystems).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			expect(filesystemLoader.loadActiveSessionFilesystems).to.throw(TypeError, 'invalid callback passed to loadActiveSessionFilesystems');
		
		});
		it('should throw an error if sessionStore does not have a defined method "all()"', function() {
		
			function throwTypeError() {
			
				return filesystemLoader.loadActiveSessionFilesystems(null, function(e, r) {return});
			
			}
			expect(throwTypeError).to.throw(TypeError, "Cannot read property 'all' of null");
		
		});
		it('should return an error to callback if sessionStore.all returns an error', function(done) {
		
			var testSessionStore = {
				all(cb) {
				
					var allArray = getSessions();
					return cb(new Error('test all error'), allArray);
				
				}
			};
			filesystemLoader.loadActiveSessionFilesystems(testSessionStore, function(error, loadedSessions) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test all error');
				done();
			
			});
		
		});
		it('should return callback(false, false) if there are no active sessions or errors', function(done) {
		
			var testSessionStore = {
				all(cb) {
				
					var allArray = getSessions();
					return cb(false, []);
				
				}
			};
			filesystemLoader.loadActiveSessionFilesystems(testSessionStore, function(error, loadedSessions) {
			
				expect(error).to.be.false;
				expect(loadedSessions).to.be.false;
				done();
			
			});
		
		});
		it('should return callback(error, idArray) if there are active sessions and the FileSystem constructor throws an error while instantiating a FileSystem for any of them', function(done) {
		
			if ('object' === typeof global.Uwot.Users && 'function' === typeof global.Uwot.Users.listUsers) {
			
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').throws(new TypeError('listUsers is not a function'));
			
			}
			var testSessionStore = {
				all(cb) {
				
					var allArray = getSessions();
					allArray[0].passport.user = JSON.stringify(allArray[0].passport.user);
					return cb(false, allArray);
				
				}
			};
			filesystemLoader.loadActiveSessionFilesystems(testSessionStore, function(error, loadedSessions) {
			
				expect(error).to.be.an.instanceof(Error).with.property('message').that.includes('listUsers is not a function');
				if ('undefined' !== typeof listUsersStub) {
			
					listUsersStub.restore();
			
				}
				done();
			
			});
		
		});
		it('should return callback(false, idArray), where idArray is array of ids with loaded FileSystems if constructor for each completes without error', function(done) {
		
			var testSessionStore = {
				all(cb) {
				
					var allArray = getSessions();
					allArray[0].passport.user = JSON.stringify(allArray[0].passport.user);
					return cb(false, allArray);
				
				}
			};
			if ('object' !== typeof global.Uwot.Users) {
			
				global.Uwot.Users = {};
				var resetUsers = true;
			
			}
			if ('function' !== typeof global.Uwot.Users.listUsers) {
			
				global.Uwot.Users.listUsers = function() {
				
					return [getInstanceUser()];
				
				};
			
			}
			else {
			
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').returns([getInstanceUser()]);
			
			}
			if ('function' !== typeof global.Uwot.Users.findById) {
			
				global.Uwot.Users.findById = function() {
				
					return [getInstanceUser()];
				
				};
			
			}
			else {
			
				var findByIdStub = sinon.stub(global.Uwot.Users, 'findById').returns([getInstanceUser()]);
			
			}
			filesystemLoader.loadActiveSessionFilesystems(testSessionStore, function(error, loadedSessions) {
			
				var testId = getSessions()[0].passport.user._id;
				expect(error).to.be.false;
				expect(loadedSessions[0]).to.equal(testId);
				if ('undefined' !== typeof listUsersStub) {
		
					listUsersStub.restore();
		
				}
				else {
		
					delete global.Uwot.Users.listUsers;
		
				}
				if ('undefined' !== typeof findByIdStub) {
		
					findByIdStub.restore();
		
				}
				else {
		
					delete global.Uwot.Users.findById;
		
				}
				if ('undefined' !== typeof resetUsers && resetUsers) {
		
					delete  global.Uwot.Users;
		
				}
				done();
			
			});
		
		});
	
	});
	describe('isValidFs(userId)', function() {
	
		var loadedFses;
		before(function() {
		
			if('object' !== typeof global.Uwot.FileSystems) {
			
				global.Uwot.FileSystems = {
					GUEST: {}
				};
			
			}
			else if ('object' !== typeof global.Uwot.FileSystems.GUEST) {
			
				global.Uwot.FileSystems.GUEST = {};
			
			}
			loadedFses = Object.keys(global.Uwot.FileSystems);
		
		});
		
		it('should be a function', function() {
		
			expect(filesystemLoader.isValidFs).to.be.a('function');
		
		});
		it('should return the theme names as an array if userId arg is undefined', function() {
		
			expect(filesystemLoader.isValidFs()).to.be.an('array').that.deep.equals(loadedFses);
		
		});
		it('should return the theme names as an array if userId arg is null', function() {
		
			expect(filesystemLoader.isValidFs(null)).to.be.an('array').that.deep.equals(loadedFses);
		
		});
		it('should return the theme names as an array if userId arg is an empty string', function() {
		
			expect(filesystemLoader.isValidFs('')).to.be.an('array').that.deep.equals(loadedFses);
		
		});
		it('should return false if userId arg is not undefined, null, or a string', function() {
		
			expect(filesystemLoader.isValidFs(['userId'])).to.be.false;
		
		});
		it('should return false if userId arg is a string that is not a key in global.Uwot.FileSystems', function() {
		
			expect(filesystemLoader.isValidFs('[userId]')).to.be.false;
		
		});
		it('should return true if userId arg is a string that is a key in global.Uwot.FileSystems', function() {
		
			expect(filesystemLoader.isValidFs('GUEST')).to.be.true;
		
		});
	
	});

});
