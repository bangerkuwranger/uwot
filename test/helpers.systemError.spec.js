const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var SystemError = require('../helpers/systemError');
var os = require('os');

describe('systemError.js', function() {

	describe('sysErrors', function() {
	
		it('should be an object where all properties are names of system errors with values that are functions instantiated when module is included via Node.js require()', function() {
		
			expect(SystemError).to.be.an('object').with.property('ENOENT').that.is.a('function');
		
		});
		it('should instantiate a new systemError object when any property function is called', function() {
		
			var unknownError = SystemError.ENOENT();
			expect(unknownError).to.be.an.instanceOf(Error).with.property('code').that.equals('UNKNOWN');
		
		});
	
	});
	describe('SystemError', function() {
	
		describe('constructor(key, context)', function() {
		
			it('should be a function', function() {
			
				expect(SystemError.construct).to.be.a('function');
			
			});
			it('should throw a TypeError if passed an invalid or nonstring key argument', function() {
			
				function passNullKey() {
				
					return new SystemError.construct(null, {syscall: 'stat'});
				
				}
				function passInvStrKey() {
				
					return new SystemError.construct('enoent', {syscall: 'stat'});
				
				}
				expect(passNullKey).to.throw(TypeError, 'invalid key passed to SystemError');
				expect(passInvStrKey).to.throw(TypeError, 'invalid key passed to SystemError');
			
			});
			it('should set key to "UNKNOWN" and syscall to "unknown", regardless of key arg value, if context is not an object or context.syscall is not a string', function() {
			
				expect(new SystemError.construct()).to.be.an.instanceOf(SystemError.construct).with.property('code').that.equals('UNKNOWN');
				expect(new SystemError.construct('ENOENT', {sysall: 'stat'})).to.be.an.instanceOf(SystemError.construct).with.property('code').that.equals('UNKNOWN');
				expect(new SystemError.construct('ENOENT', 'stat')).to.be.an.instanceOf(SystemError.construct).with.property('code').that.equals('UNKNOWN');
			
			});
			it('should format the message property as a string containing key, a color, a space, and the hardcoded message string for that key', function() {
			
				var eagainMsg = 'resource temporarily unavailable';
				var enoentMsg = 'no such file or directory';
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('EAGAIN: ' + eagainMsg);
				expect(new SystemError.construct('ENOENT', {syscall: 'stat'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('ENOENT: ' + enoentMsg);
			
			});
			it('should include the syscall in the message property if context.syscall is a string', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('stat');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('stat');
			
			});
			it('should include the target path in the message property if context.path is a string', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat', path: '/i/h/o/p'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('/i/h/o/p');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat', path: '/d/e/n/n/y/s'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('/d/e/n/n/y/s');
			
			});
			it('should include the destination path in the message property if context.dest is a string', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat', path: '/i/h/o/p', dest: '/h/o/w'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('/h/o/w');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat', path: '/d/e/n/n/y/s', dest: '/b/e/d'})).to.be.an.instanceOf(SystemError.construct).with.property('message').that.includes('/b/e/d');
			
			});
			it('should set context.errno to the local OS error number if it exists or the UV error number, and assign final context object to the kInfo property');
			it('should define a writable, configurable property "kCode" and assign the key arg value to it');
			it('should define an enumerable property "code" and assign the key arg value to it');
			it('should define an enumerable property "dest" and assign context.dest value to it');
			it('should define an enumerable property "path" and assign context.path value to it');
			it('should define an enumerable property "errno" and assign context.errno value to it');
			it('should capture the v8 stack trace and assign it to the stack property');
		
		});
		describe('get name()', function() {
		
			it('is a getter that should return the string "Error"', function() {
			
				expect(SystemError.ENOENT({syscall: 'stat'}).name).to.equal('Error');
			
			});
		
		});
	
	});

});
