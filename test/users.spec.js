var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Users = require('../users');
var users;

describe('Users.js', function() {

	before('getting fresh UserInterface instance', function() {
	
		users = new Users();

	});
	describe('UwotUsers', function() {
	
		describe('constructor', function() {
	
			it('creates an object with a db property', function() {
			
				expect(users).to.have.own.property('db');
		
			});
	
		});
		describe('db', function() {
	
		
			it('should be an object', function() {
		
				expect(users.db).to.be.an('object');
		
			});
			it('should have a filename that is a string', function() {
		
				expect(users.db.filename).to.be.a('string');
		
			});
			it('should have a filename point to a file that exists', function() {
		
				expect(fs.existsSync(users.db.filename)).to.equal(true);
		
			});
			it('should have a property "find" that is a function', function() {
		
				expect(users.db.find).to.be.a('function');
			
			});
			it('should have a property "insert" that is a function', function() {
		
				expect(users.db.insert).to.be.a('function');
			
			});
			it('should have a property "remove" that is a function', function() {
		
				expect(users.db.remove).to.be.a('function');
			
			});
	
		});
		describe('getGuest', function() {
	
			it('should be a function', function() {
		
				expect(users.getGuest).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.getGuest).to.throw(TypeError, 'invalid callback passed to getGuest.');
		
			});
			it('should return a User object', function(done){
		
				users.getGuest(function(error, guest) {
			
					if (error) {
				
						done(error);
				
					}
					else {
					
						expect(guest).to.be.an('object');
						expect(guest.constructor.name.toString()).to.equal('User');
						done();
				
					}
			
				});
		
			});
			it('should return a User object with the name "guest user" and username "guest"', function(done) {
		
				users.getGuest(function(error, guest) {
			
					if (error) {
				
						done(error);
				
					}
					else {
					
						expect(guest.fName).to.equal('guest');
						expect(guest.lName).to.equal('user');
						expect(guest.uName).to.equal('guest');
						done();
				
					}
			
				});
		
			});
			it('should return an User object with undefined password and salt properties', function(done) {
		
				users.getGuest(function(error, guest) {
			
					if (error) {
				
						done(error);
				
					}
					else {
					
						expect(guest.password).to.be.undefined;
						expect(guest.salt).to.be.undefined;
						done();
				
					}
			
				});
		
			});
			it('should return a User object that cannot sudo', function(done) {
		
				users.getGuest(function(error, guest) {
			
					if (error) {
				
						done(error);
				
					}
					else {
					
						expect(guest.sudoer).to.be.false;
						expect(guest.maySudo).to.be.a('function');
						expect(guest.maySudo()).to.be.false;
						done();
				
					}
			
				});
		
			});
	
		});
		describe('findById', function() {
	
			it('should be a function', function() {
		
				expect(users.findById).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.findById).to.throw(TypeError, 'invalid callback passed to findById.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed an uId as a string', function(done) {
		
				function passNullId() {
			
					users.findById(null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid id passed to findById.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uId is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.findById('', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid id passed to findById.');
				done();
		
			});
			it('should return "callback(error, null)" if there is an error calling db.find', function(done) {
		
			
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnError(searchTerms, searchSettings, callback) {
				
					return callback(new Error('test db.find error'), []);
			
				});
				users.findById('stubErrorUserId', function(error, userObj) {
			
					expect(error).to.be.instanceof(Error);
					expect(userObj).to.be.null;
					done();
			
				});
		
			});
			it('should return "callback(false, false)" if there is no matching record in db', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnNotFound(searchTerms, searchSettings, callback) {
				
					return callback(false, []);
			
				});
				users.findById('stubNotFoundUserId', function(error, userObj) {
			
					expect(error).to.be.false;
					expect(userObj).to.be.false;
					done();
			
				});
		
			});
			it('should return "callback(false, User(foundData)" if there is a matching record in db', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnUserDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"fName": "Found",
							"lName": "User",
							"uName": "fuser",
							"password": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI.Ai1mX96Xc7efm",
							"sudoer": true,
							"salt": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI",
							"createdAt": new Date(1546450800498),
							"updatedAt": new Date(1546450800498),
							"_id": "CDeOOrH0gOg791cZ"
						}
					]);
			
				});
				users.findById('stubFoundUserId', function(error, userObj) {
			
					expect(error).to.be.false;
					expect(userObj).to.be.an('object');
					expect(userObj.constructor.name.toString()).to.equal('User');
					done();
			
				});
		
			});
	
		});
		describe('findByName', function() {
	
			it('should be a function', function() {
		
				expect(users.findByName).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.findByName).to.throw(TypeError, 'invalid callback passed to findByName.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed a uName as a string', function(done) {
		
				function passNullId() {
			
					users.findByName(null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid user name passed to findByName.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uName is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.findByName('', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid user name passed to findByName.');
				done();
		
			});
			it('should return "callback(error, null)" if there is an error calling db.find', function(done) {
		
			
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnError(searchTerms, searchSettings, callback) {
				
					return callback(new Error('test db.find error'), []);
			
				});
				users.findByName('stubErrorUserId', function(error, userObj) {
			
					expect(error).to.be.instanceof(Error);
					expect(userObj).to.be.null;
					done();
			
				});
		
			});
			it('should return "callback(false, false)" if there is no matching record in db', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnNotFound(searchTerms, searchSettings, callback) {
				
					return callback(false, []);
			
				});
				users.findByName('stubNotFoundUserId', function(error, userObj) {
			
					expect(error).to.be.false;
					expect(userObj).to.be.false;
					done();
			
				});
		
			});
			it('should return "callback(false, User(foundData)" if there is a matching record in db', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnUserDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"fName": "Found",
							"lName": "User",
							"uName": "fuser",
							"password": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI.Ai1mX96Xc7efm",
							"sudoer": true,
							"salt": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI",
							"createdAt": new Date(1546450800498),
							"updatedAt": new Date(1546450800498),
							"_id": "CDeOOrH0gOg791cZ"
						}
					]);
			
				});
				users.findByName('stubFoundUserId', function(error, userObj) {
			
					expect(error).to.be.false;
					expect(userObj).to.be.an('object');
					expect(userObj.constructor.name.toString()).to.equal('User');
					done();
			
				});
		
			});
	
		});
		describe('createNew', function() {
	
			it('should be a function', function() {
		
				expect(users.createNew).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.createNew).to.throw(TypeError, 'invalid callback passed to createNew.');
		
			});
			it('should return a TypeError as the first argument in callback if uObj is not an object.', function(done) {
		
				function passStringuObj() {
			
					users.createNew('newUser', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passStringuObj).to.throw(TypeError, 'invalid user object passed to createNew.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if uObj.uName is not a string', function(done) {
		
				function passNulluName() {
			
					users.createNew({uName: null, password: 'newUserP@55'}, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNulluName).to.throw(TypeError, 'invalid user object passed to createNew.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if uObj.uName is empty string', function(done) {
		
				function passEmptyuName() {
			
					users.createNew({uName: '', password: 'newUserP@55'}, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyuName).to.throw(TypeError, 'invalid user object passed to createNew.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if uObj.password not a string', function(done) {
		
				function passNullPassword() {
			
					users.createNew({uName: 'newUser', password: null}, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullPassword).to.throw(TypeError, 'invalid user object passed to createNew.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if uObj.password is empty string', function(done) {
		
				function passEmptyPassword() {
			
					users.createNew({uName: 'newUser', password: ''}, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyPassword).to.throw(TypeError, 'invalid user object passed to createNew.');
				done();
		
			});
			it('should return an error as the first argument in callback if this.isUnique returns an error', function(done) {
		
				const isUniqueStub = sinon.stub(users, 'isUnique').callsFake(function returnError(uName, callback) {
				
					return callback(new Error('isUnique error'), null);
			
				});
				users.createNew({uName: 'newUser', password: 'newUserP@55'}, function(error, newUser) {
			
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('isUnique error');
					done();
			
				});
		
			});
			it('should return an error as the first argument in callback if this.isUnique(uObj.uName) is false', function(done) {
		
				const isUniqueStub = sinon.stub(users, 'isUnique').callsFake(function returnFalse(uName, callback) {
				
					return callback(false, false);
			
				});
				users.createNew({uName: 'newUser', password: 'newUserP@55'}, function(error, newUser) {
			
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('User "newUser" already exists.');
					done();
			
				});
		
			});
			it('should return an error as the first argument in callback if uObj.password fails the password rules', function(done) {
		
				const isUniqueStub = sinon.stub(users, 'isUnique').callsFake(function returnTrue(uName, callback) {
				
					return callback(false, true);
			
				});
				users.createNew({uName: 'newUser', password: 'newuserpass'}, function(error, newUser) {
			
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('Password must contain a capital letter and contain a number.');
					done();
			
				});
		
			});
			it('should return an error as the first argument in callback if db.insert throws an error', function(done) {
		
				this.timeout(10000);
				const dbFindStub = sinon.stub(users.db, 'insert').callsFake(function returnInsertError(newUser, callback) {
				
					return callback(
						new Error('db.insert error'),
						false
					);
			
				});
				users.createNew({uName: 'newUser', password: 'newUserP@55'}, function(error, newUser) {
			
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('db.insert error');
					done();
				
				});
		
			});
			it('should return callback(false, false) if db.insert could not create a new record', function(done) {
		
				this.timeout(10000);
				const dbFindStub = sinon.stub(users.db, 'insert').callsFake(function returnFalse(newUser, callback) {
				
					return callback(
						false,
						false
					);
			
				});
				users.createNew({uName: 'newUser', password: 'newUserP@55'}, function(error, newUser) {
			
					expect(error).to.equal(false);
					expect(newUser).to.be.false;
					done();
			
				});
		
			});
			it('should return callback(false, User(newRecord)) if db.insert is successful', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'insert').callsFake(function returnNewUserDoc(newUser, callback) {
				
					return callback(
						false,
						{
							"fName": "",
							"lName": "",
							"uName": newUser.uName,
							"password": "$2a$16$KOigNymFmGpwaBdRxzyhA..T2t4ZRCPTlbLdtg02T7AXuTeZQ7Oam",
							"sudoer": true,
							"salt": "$2a$16$KOigNymFmGpwaBdRxzyhA.",
							"createdAt": new Date(),
							"updatedAt": new Date(),
							"_id": "CDeOOrH0gOg791cZ"
						}
					);
			
				});
				users.createNew({uName: 'newUser', password: 'newUserP@55'}, function(error, newUser) {
			
					this.timeout(10000);
					expect(error).to.equal(false);
					expect(newUser).to.be.an('object');
					expect(newUser.constructor.name.toString()).to.equal('User');
					done();
			
				}.bind(this));
		
			});
	
		});
		describe('remove', function() {
	
			it('should be a function', function() {
		
				expect(users.remove).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.remove).to.throw(TypeError, 'invalid callback passed to remove.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed an uId as a string', function(done) {
		
				function passNullId() {
			
					users.remove(null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid user id passed to remove.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uId is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.remove('', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid user id passed to remove.');
				done();
		
			});
			it('should return "callback(error, null)" if there is an error calling db.remove', function(done) {
		
			
				const dbRemoveStub = sinon.stub(users.db, 'remove').callsFake(function returnError(searchTerms, options, callback) {
				
					return callback(new Error('test db.remove error'), []);
			
				});
				users.remove('stubErrorUserId', function(error, removed) {
			
					expect(error).to.be.instanceof(Error);
					expect(removed).to.be.null;
					done();
			
				});
		
			});
			it('should return "callback(false, false)" if there is no matching record in db', function(done) {
		
				const dbRemoveStub = sinon.stub(users.db, 'remove').callsFake(function returnNotFound(searchTerms, options, callback) {
				
					return callback(false, 0);
			
				});
				users.remove('stubNotFoundUserId', function(error, removed) {
			
					expect(error).to.be.false;
					expect(removed).to.be.false;
					done();
			
				});
		
			});
			it('should return "callback(false, User(foundData)" if there is a matching record in db', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'remove').callsFake(function returnUserDoc(searchTerms, options, callback) {
				
					return callback(false, 1);
			
				});
				users.remove('stubFoundUserId', function(error, removed) {
			
					expect(error).to.be.false;
					expect(removed).to.be.true;
					done();
			
				});
		
			});
	
		});

	});

	describe('User', function() {

		var testUser;
		beforeEach('getting fresh User instance as testUser', function(done) {
	
			const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnUserDoc(searchTerms, searchSettings, callback) {
				
					return callback(false, [
						{
							"fName": "Found",
							"lName": "User",
							"uName": "fuser",
							"password": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI.Ai1mX96Xc7efm",
							"sudoer": true,
							"salt": "$2a$16$UV6V2nmIoFY14OZqfRWxpuSsId5m6E3k4crTUTI",
							"createdAt": new Date(1546450800498),
							"updatedAt": new Date(1546450800498),
							"_id": "CDeOOrH0gOg791cZ"
						}
					]);
			
				});
				users.findById('CDeOOrH0gOg791cZ', function(error, userObj) {
			
					testUser = userObj;
					done();
			
				});
	
		});
		it('should not allow the constructor to be used outside of the UwotUsers class methods', function() {
	
			function returnNewUser() {
			
				return new User();
			
			}
			expect(returnNewUser).to.throw(ReferenceError, 'User is not defined');
	
		});
		describe('saltPass', function() {
		
			this.timeout(10000);
			it('should throw an error if "password" is not a string', function() {
	
				function passNullPassword() {
				
					return testUser.saltPass(null);
				
				};
				expect(passNullPassword).to.throw(TypeError, 'invalid password value passed to saltPass.');
	
			});
			it('should generate a new value for salt property if salt property is undefined.', function() {
			
				delete testUser.salt;
				var newSaltedPassword = testUser.saltPass('newTestP@55');
				expect(testUser.salt).to.not.equal(null);
			
			});
			it('should generate a new value for salt property if salt property is null.', function() {
			
				var newSaltedPassword = testUser.saltPass('newTestP@55');
				expect(testUser.salt).to.not.equal(null);
			
			});
			it('should generate a new value for salt property if salt property is falsey.', function() {
			
				testUser.salt = 0;
				var newSaltedPassword = testUser.saltPass('newTestP@55');
				expect(testUser.salt).to.not.equal(0);
			
			});
			it('should return a salted password prepended with the salt.', function() {
			
				var newSaltedPassword = testUser.saltPass('newTestP@55');
				expect(newSaltedPassword).to.include(testUser.salt);
			
			});
		
		});

	});

});
