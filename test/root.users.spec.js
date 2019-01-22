var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Users = require('../users');
var users;

describe('users.js', function() {

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
			it('should have a property "update" that is a function', function() {
		
				expect(users.db.update).to.be.a('function');
			
			});
			it('should have a property "count" that is a function', function() {
		
				expect(users.db.update).to.be.a('function');
			
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
		describe('changePw', function() {
		
			it('should be a function', function() {
		
				expect(users.changePw).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.changePw).to.throw(TypeError, 'invalid callback passed to changePw.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed an uId as a string', function(done) {
		
				function passNullId() {
			
					users.changePw(null, 'testP@55', 'newtestP@SS', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid args passed to changePw.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uId is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.changePw('', 'testP@55', 'newtestP@SS', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid args passed to changePw.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed oldPw is not a string', function(done) {
		
				function passNullOldPw() {
			
					users.changePw('CDeOOrH0gOg791cZ', null, 'newtestP@SS', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullOldPw).to.throw(TypeError, 'invalid args passed to changePw.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed newPw is not a string', function(done) {
		
				function passNullNewPw() {
			
					users.changePw('CDeOOrH0gOg791cZ', 'testP@55', null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullNewPw).to.throw(TypeError, 'invalid args passed to changePw.');
				done();
		
			});
			it('should return callback(error, null) if users.validate returns an error', function(done) {
		
				var stubValidateError = sinon.stub(users, 'validate').callsFake(function returnError(uId, oldPw, callback) {
				
					return callback(new Error('validate error'), null);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('validate error');
					done();
				
				});
		
			});
			it('should return callback(error, null) if users.validate returns false', function(done) {
		
				var stubValidateFalse = sinon.stub(users, 'validate').callsFake(function returnFalse(uId, oldPw, callback) {
				
					return callback(false, false);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('Cannot change user password; old password invalid.');
					done();
				
				});
		
			});
			it('should return callback(error, null) if newPw doesn\'t pass the password security rules', function(done) {
		
				var stubValidateTrue = sinon.stub(users, 'validate').callsFake(function returnTrue(uId, oldPw, callback) {
				
					return callback(false, true);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestpass', function(error, isPwUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.include('Invalid value for new password:');
					done();
				
				});
		
			});
			it('should return callback(error, null) if newPw is the same as oldPw', function(done) {
		
				var stubValidateTrue = sinon.stub(users, 'validate').callsFake(function returnTrue(uId, oldPw, callback) {
				
					return callback(false, true);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'testP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('Invalid value for new password: Password must be unique.');
					done();
				
				});
		
			});
			it('should return callback(error, null) if db.update returns an error', function(done) {
		
				this.timeout(10000);
				var stubValidateTrue = sinon.stub(users, 'validate').callsFake(function returnTrue(uId, oldPw, callback) {
				
					return callback(false, true);
			
				});
				var stubDbUpdateError = sinon.stub(users.db, 'update').callsFake(function returnError(search, options, callback) {
				
					return callback(new Error('update error'), null);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('update error');
					done();
				
				});
		
			});
			it('should return callback(false, false) if db.update was unsuccessful (record does not exist)', function(done) {
		
				this.timeout(10000);
				var stubValidateTrue = sinon.stub(users, 'validate').callsFake(function returnTrue(uId, oldPw, callback) {
				
					return callback(false, true);
			
				});
				var stubDbUpdateFalse = sinon.stub(users.db, 'update').callsFake(function returnFalse(search, options, callback) {
				
					return callback(false, 0);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.false;
					expect(isPwUpdated).to.be.false;
					done();
				
				});
		
			});
			it('should return callback(false, false) if db.update was successful', function(done) {
		
				this.timeout(10000);
				var stubValidateTrue = sinon.stub(users, 'validate').callsFake(function returnTrue(uId, oldPw, callback) {
				
					return callback(false, true);
			
				});
				var stubDbUpdateTrue = sinon.stub(users.db, 'update').callsFake(function returnTrue(search, options, callback) {
				
					return callback(false, 1);
			
				});
				users.changePw('CDeOOrH0gOg791cZ', 'testP@55', 'newtestP@55', function(error, isPwUpdated) {
				
					expect(error).to.be.false;
					expect(isPwUpdated).to.be.true;
					done();
				
				});
		
			});
			
		});
		describe('changeName', function() {
		
			it('should be a function', function() {
		
				expect(users.changeName).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.changeName).to.throw(TypeError, 'invalid callback passed to changeName.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed an uId as a string', function(done) {
		
				function passNullId() {
			
					users.changeName(null, 'New', 'Name', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid args passed to changeName.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uId is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.changeName('', 'New', 'Name', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid args passed to changeName.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if not passed an fName as a string', function(done) {
		
				function passNullfName() {
			
					users.changeName('CDeOOrH0gOg791cZ', null, 'Name', function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullfName).to.throw(TypeError, 'invalid args passed to changeName.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if not passed an lName as a string', function(done) {
		
				function passNulllName() {
			
					users.changeName('CDeOOrH0gOg791cZ', 'New', null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNulllName).to.throw(TypeError, 'invalid args passed to changeName.');
				done();
		
			});
			it('should return callback(error, null) if db.update returns an error', function(done) {
		
				var stubUpdateError = sinon.stub(users.db, 'update').callsFake(function returnError(search, update, options, callback) {
				
					return callback(new Error('update error'), null);
			
				});
				users.changeName('CDeOOrH0gOg791cZ', 'New', 'Name', function(error, isNameUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('update error');
					done();
				
				});
		
			});
			it('should return callback(false, false) if db.update returns 0 (record does not exist)', function(done) {
		
				var stubUpdateFalse= sinon.stub(users.db, 'update').callsFake(function returnFalse(search, update, options, callback) {
				
					return callback(false, 0);
			
				});
				users.changeName('CDeOOrH0gOg791cZ', 'New', 'Name', function(error, isNameUpdated) {
				
					expect(error).to.be.false;
					expect(isNameUpdated).to.be.false;
					done();
				
				});
		
			});
			it('should return callback(false, true) if db.update runs successfully', function(done) {
		
				var stubUpdateTrue= sinon.stub(users.db, 'update').callsFake(function returnTrue(search, update, options, callback) {
				
					return callback(false, 1);
			
				});
				users.changeName('CDeOOrH0gOg791cZ', 'New', 'Name', function(error, isNameUpdated) {
				
					expect(error).to.be.false;
					expect(isNameUpdated).to.be.true;
					done();
				
				});
		
			});
		
		});
		describe('changeSudo', function() {
		
			it('should be a function', function() {
		
				expect(users.changeSudo).to.be.a('function');
		
			});
			it('should throw a TypeError if not passed a valid callback function', function() {
		
				expect(users.changeSudo).to.throw(TypeError, 'invalid callback passed to changeSudo.');
		
			});
			it('should return a TypeError as the first argument in callback if not passed an uId as a string', function(done) {
		
				function passNullId() {
			
					users.changeSudo(null, true, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNullId).to.throw(TypeError, 'invalid args passed to changeSudo.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback if passed uId is an empty string', function(done) {
		
				function passEmptyId() {
			
					users.changeSudo('', true, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passEmptyId).to.throw(TypeError, 'invalid args passed to changeSudo.');
				done();
		
			});
			it('should return a TypeError as the first argument in callback passed maySudo is not boolean and !== "true" || "false"', function(done) {
		
				var stubUpdateFalse = sinon.stub(users.db, 'update').callsFake(function returnFalse(search, update, options, callback) {
				
					return callback(false, false);
			
				});
				function passNull() {
			
					users.changeSudo('CDeOOrH0gOg791cZ', null, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				function passStringTrue() {
			
					users.changeSudo('CDeOOrH0gOg791cZ', "true", function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				function passStringFalse() {
			
					users.changeSudo('CDeOOrH0gOg791cZ', "false", function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				function passBoolTrue() {
			
					users.changeSudo('CDeOOrH0gOg791cZ', true, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				function passBoolFalse() {
			
					users.changeSudo('CDeOOrH0gOg791cZ', false, function(er) {
				
						if (er) {
					
							throw(er);
					
						}
				
					});
			
				};
				expect(passNull).to.throw(TypeError, 'invalid args passed to changeSudo.');
				expect(passStringTrue).to.not.throw();
				expect(passStringFalse).to.not.throw();
				expect(passBoolFalse).to.not.throw();
				expect(passBoolTrue).to.not.throw();
				done();
		
			});
			it('should return callback(error, null) if db.update returns an error', function(done) {
		
				var stubUpdateError = sinon.stub(users.db, 'update').callsFake(function returnError(search, update, options, callback) {
				
					return callback(new Error('update error'), null);
			
				});
				users.changeSudo('CDeOOrH0gOg791cZ', true, function(error, isSudoUpdated) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('update error');
					done();
				
				});
		
			});
			it('should return callback(false, false) if db.update returns 0 (record does not exist)', function(done) {
		
				var stubUpdateFalse= sinon.stub(users.db, 'update').callsFake(function returnFalse(search, update, options, callback) {
				
					return callback(false, 0);
			
				});
				users.changeSudo('CDeOOrH0gOg791cZ', true, function(error, isSudoUpdated) {
				
					expect(error).to.be.false;
					expect(isSudoUpdated).to.be.false;
					done();
				
				});
		
			});
			it('should return callback(false, true) if db.update runs successfully', function(done) {
		
				var stubUpdateTrue= sinon.stub(users.db, 'update').callsFake(function returnTrue(search, update, options, callback) {
				
					return callback(false, 1);
			
				});
				users.changeSudo('CDeOOrH0gOg791cZ', true, function(error, isSudoUpdated) {
				
					expect(error).to.be.false;
					expect(isSudoUpdated).to.be.true;
					done();
				
				});
		
			});
		
		});
		describe('validate', function() {
		
			this.timeout(10000);
			it('should be a function', function() {
			
				expect(users.validate).to.be.a('function');
			
			});
			it('should throw a TypeError if passed a callback that is not a function', function() {
			
				expect(users.validate).to.throw(TypeError, 'invalid callback passed to validate.');
			
			});
			it('should return callback(TypeError, null) if passed uId is not a string', function(done) {
			
				users.validate(null, 'testP@55', function(error, isValid) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to validate.');
					done();
				
				});
			
			});
			it('should return callback(TypeError, null) if passed uId is an empty string', function(done) {
			
				users.validate('', 'testP@55', function(error, isValid) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to validate.');
					done();
				
				});
			
			});
			it('should return callback(TypeError, null) if passed pw is not a string', function(done) {
			
				users.validate('CDeOOrH0gOg791cZ', null, function(error, isValid) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to validate.');
					done();
				
				});
			
			});
			it('should return callback(TypeError, null) if passed pw is an empty string', function(done) {
			
				users.validate('CDeOOrH0gOg791cZ', '', function(error, isValid) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid args passed to validate.');
					done();
				
				});
			
			});
			it('should return "callback(error, null)" if there is an error calling db.find', function(done) {
		
			
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnError(searchTerms, searchSettings, callback) {
				
					return callback(new Error('test db.find error'), []);
			
				});
				users.validate('CDeOOrH0gOg791cZ', 'testP@55', function(error, isValid) {
			
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('test db.find error');
					expect(isValid).to.be.null;
					done();
			
				});
		
			});
			it('should return "callback(false, false)" if there are no matching records to validate against', function(done) {
			
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnFalse(searchTerms, searchSettings, callback) {
				
					return callback(false, []);
			
				});
				users.validate('CDeOOrH0gOg791cZ', 'testP@55', function(error, isValid) {
			
					expect(error).to.be.false;
					expect(isValid).to.be.false;
					done();
			
				});
		
			});
			it('should return "callback(false, false)" if password doesn\'t match user record', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnUser(searchTerms, searchSettings, callback) {
				
					var userData = {
						"fName": "Found",
						"lName": "User",
						"uName": "fuser",
						"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ..z56khVltcaST8aHNSuVic.YPQPKGTC",
						"sudoer": true,
						"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
						"createdAt": new Date(1546450800498),
						"updatedAt": new Date(1546450800498),
						"_id": "CDeOOrH0gOg791cZ"
					}
					return callback(false, [userData]);
			
				});
				users.validate('CDeOOrH0gOg791cZ', 'testpass', function(error, isValid) {
			
					expect(error).to.be.false;
					expect(isValid).to.be.false;
					done();
			
				});
		
			});
			it('should return "callback(false, true)" if password matches user record', function(done) {
		
				const dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnUser(searchTerms, searchSettings, callback) {
				
					var userData = {
						"fName": "Found",
						"lName": "User",
						"uName": "fuser",
						"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ..z56khVltcaST8aHNSuVic.YPQPKGTC",
						"sudoer": true,
						"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
						"createdAt": new Date(1546450800498),
						"updatedAt": new Date(1546450800498),
						"_id": "CDeOOrH0gOg791cZ"
					}
					return callback(false, [userData]);
			
				});
				users.validate('CDeOOrH0gOg791cZ', 'testP@55', function(error, isValid) {
			
					expect(error).to.be.false;
					expect(isValid).to.be.true;
					done();
			
				});
		
			});
		
		});
		describe('listUsers', function() {
		
			it('should be a function', function() {
			
				expect(users.listUsers).to.be.a('function');
			
			});
			it('should throw a TypeError if passed a callback that is not a function', function() {
			
				expect(users.listUsers).to.throw(TypeError, 'invalid callback passed to listUsers.');
			
			});
			it('should return callback(error, userList), and error should be an error if db.find returns an error', function(done) {
			
				var dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnError(callback) {
				
					return {
						projection: sinon.stub().returns({
						
							sort: sinon.stub().returns({
							
								exec: sinon.stub().callsFake(function exec(callback) { 
							
									return callback(new Error('db.find error'), null);
						
								})
							
							})
						
						})
					
					};
				
				});
				users.listUsers(function(error, userList) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('db.find error');
					done();
				
				});
			
			});
			it('should return callback(error, userList), and userList should be an Array', function(done) {
			
				users.listUsers(function(error, userList) {
				
					expect(userList).to.be.an('array');
					done();
				
				});
			
			});
			it('should return callback(error, userList), and userList should be empty if there are no records', function(done) {
			
				var dbFindStub = sinon.stub(users.db, 'find').callsFake(function returnError(callback) {
				
					return {
						projection: sinon.stub().returns({
						
							sort: sinon.stub().returns({
							
								exec: sinon.stub().callsFake(function exec(callback) { 
							
									return callback(false, []);
						
								})
							
							})
						
						})
					
					};
				
				});
				users.listUsers(function(error, userList) {
				
					expect(error).to.be.false;
					expect(userList).to.be.an('array').that.is.empty;
					done();
				
				});
			
			});
		
		});
		describe('isUnique', function() {
		
			it('should be a function', function() {
			
				expect(users.isUnique).to.be.a('function');
			
			});
			it('should throw a TypeError if passed a callback that is not a function', function() {
			
				expect(users.isUnique).to.throw(TypeError, 'invalid callback passed to isUnique.');
			
			});
			it('should return callback(TypeError, null) if passed uName is not a string', function(done) {
			
				users.isUnique(null, function(error, isUnique) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid username passed to isUnique.');
					done();
				
				});
			
			});
			it('should return callback(TypeError, null) if passed uName is an empty string', function(done) {
			
				users.isUnique('', function(error, isUnique) {
				
					expect(error).to.be.instanceof(TypeError);
					expect(error.message).to.equal('invalid username passed to isUnique.');
					done();
				
				});
			
			});
			it('should return callback(false, false) if passed username is "guest"', function(done) {
			
				users.isUnique('guest', function(error, isUnique) {
				
					expect(error).to.be.false;
					expect(isUnique).to.be.false;
					done();
				
				});
			
			});
			it('should return callback(Error, null) if db.count returns an error', function(done) {
			
				var dbCountStub = sinon.stub(users.db, 'count').callsFake(function returnError(query, callback) {
				
					return callback(new Error('db.count error'), null);
				
				});
				users.isUnique('testUser', function(error, isUnique) {
				
					expect(error).to.be.instanceof(Error);
					expect(error.message).to.equal('db.count error');
					done();
				
				});
			
			});
			it('should return callback(false, false) if db.count is greater than or equal to 1', function(done) {
			
				var dbCountStub = sinon.stub(users.db, 'count').callsFake(function returnFalse(query, callback) {
				
					return callback(false, 1);
				
				});
				users.isUnique('testUser', function(error, isUnique) {
				
					expect(error).to.be.false;
					expect(isUnique).to.be.false;
					done();
				
				});
			
			});
			it('should return callback(false, true) if db.count is less than 1', function(done) {
			
				var dbCountStub = sinon.stub(users.db, 'count').callsFake(function returnFalse(query, callback) {
				
					return callback(false, 0);
				
				});
				users.isUnique('testUser', function(error, isUnique) {
				
					expect(error).to.be.false;
					expect(isUnique).to.be.true;
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
							"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
							"sudoer": true,
							"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
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
		it('should not allow the constructor to be called outside of the UwotUsers class methods', function() {
	
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
		describe('verifyPassword', function() {
		
			this.timeout(15000);
			beforeEach('generating password', function() {
			
				testUser.password = testUser.saltPass('testP@55');
			
			});
			it('should throw a TypeError if it is passed a non-string value for password', function() {
			
				function passNullPassword() {
				
					return testUser.verifyPassword(null);	
				
				}
				expect(passNullPassword).to.throw(TypeError, 'invalid password value passed to verifyPassword.');
			
			});
			it('should return false if salt property is undefined', function() {
			
				delete testUser.salt;
				var verify = testUser.verifyPassword('testP@55');
				expect(verify).to.be.false;
			
			});
			it('should return false if salt property is null', function() {
			
				testUser.salt = null;
				var verify = testUser.verifyPassword('testP@55');
				expect(verify).to.be.false;
			
			});
			it('should return false if salt property is falsey', function() {
			
				testUser.salt = 0;
				var verify = testUser.verifyPassword('testP@55');
				expect(verify).to.be.false;
			
			});
			it('should return false if salted password doesn\'t match password property', function() {
			
				var verify = testUser.verifyPassword('testPass');
				expect(verify).to.be.false;
			
			});
			it('should return true if salted password matches password property', function() {
			
				var verify = testUser.verifyPassword('testP@55');
				expect(verify).to.be.true;
			
			});
		
		});
		describe('maySudo', function() {
		
			it('should return false if sudoer property is not a boolean', function() {
			
				testUser.sudoer = 1;
				expect(testUser.maySudo()).to.be.false;
			
			});
			it('should return false if sudoer property is false', function() {
			
				testUser.sudoer = false;
				expect(testUser.maySudo()).to.be.false;
			
			});
			it('should return true if sudoer property is true', function() {
			
				testUser.sudoer = true;
				expect(testUser.maySudo()).to.be.true;
			
			});
		
		});
		describe('fullName', function() {
		
			it('should return a string in format "lName, fName" with no arguments provided', function() {
			
				expect(testUser.fullName()).to.equal('User, Found');
			
			});
			it('should return a string in format "lName, fName" with if format argument is not a string', function() {
			
				expect(testUser.fullName(null)).to.equal('User, Found');
			
			});
			it('should return a string in that replaces the character "f" in format argument with the value of the fName property', function() {
			
				expect(testUser.fullName('f theMagnificent')).to.equal('Found theMagniFoundicent');
			
			});
			it('should return a string in that replaces the character "l" in format argument with the value of the lName property', function() {
			
				expect(testUser.fullName('Mr./Ms. l')).to.equal('Mr./Ms. User');
			
			});
			it('should return a string replacing both "l" and "f" in the format argument', function() {
			
				expect(testUser.fullName('Mr./Ms. f l')).to.equal('Mr./Ms. Found User');
			
			});
		
		});

	});

});