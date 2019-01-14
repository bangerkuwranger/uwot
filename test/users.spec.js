var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const Users = require('../users');

describe('Users', function() {
	
	const users = new Users();
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
		it('should throw a TypeError if not passed an uId as a string', function(done) {
		
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
		it('should throw a TypeError if passed uId is an empty string', function(done) {
		
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
		it('should return "callback(error, null)" if there is an error calling db.find', function() {
		
		
		
		});
		it('should return "callback(false, false)" if there is no matching record in db', function() {
		
		
		
		});
		it('should return "callback(false, User([found]))" if there is a matching record in db', function() {
		
		
		
		});
	
	});

});
