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
			expect(unknownError).to.be.an.instanceof(Error).with.property('code').that.equals('UNKNOWN');
		
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
			
				expect(new SystemError.construct()).to.be.an.instanceof(SystemError.construct).with.property('code').that.equals('UNKNOWN');
				expect(new SystemError.construct('ENOENT', {sysall: 'stat'})).to.be.an.instanceof(SystemError.construct).with.property('code').that.equals('UNKNOWN');
				expect(new SystemError.construct('ENOENT', 'stat')).to.be.an.instanceof(SystemError.construct).with.property('code').that.equals('UNKNOWN');
			
			});
			it('should not overwrite context.path if context.path is a string or a Buffer and context.syscall is not a string', function() {
			
				var pathString = '/var/run/mysql/mysql.sock';
				var pathBuffer = new Buffer(pathString);
				expect(new SystemError.construct('ENOENT', {sysall: 'stat', path: pathString})).to.be.an.instanceof(SystemError.construct).with.property('path').that.equals(pathString);
				expect(new SystemError.construct('ENOENT', {path: pathBuffer})).to.be.an.instanceof(SystemError.construct).with.property('path').that.equals(pathString);
			
			});
			it('should not overwrite context.dest if context.dest is a string or a Buffer and context.syscall is not a string', function() {
			
				var destString = '/var/run/mysql/mysql.sock';
				var destBuffer = new Buffer(destString);
				expect(new SystemError.construct('ENOENT', {sysall: 'stat', dest: destString})).to.be.an.instanceof(SystemError.construct).with.property('dest').that.equals(destString);
				expect(new SystemError.construct('ENOENT', {dest: destBuffer})).to.be.an.instanceof(SystemError.construct).with.property('dest').that.equals(destString);
			
			});
			it('should format the message property as a string containing key, a colon, a space, and the hardcoded message string for that key', function() {
			
				var eagainMsg = 'resource temporarily unavailable';
				var enoentMsg = 'no such file or directory';
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('EAGAIN: ' + eagainMsg);
				expect(new SystemError.construct('ENOENT', {syscall: 'stat'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('ENOENT: ' + enoentMsg);
			
			});
			it('should include the syscall in the message property if context.syscall is a string', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('stat');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('stat');
			
			});
			it('should include the target path in the message property if context.path is a string or Buffer', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat', path: '/i/h/o/p'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('/i/h/o/p');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat', path: new Buffer('/d/e/n/n/y/s')})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('/d/e/n/n/y/s');
			
			});
			it('should include the destination path in the message property if context.dest is a string or Buffer', function() {
			
				expect(new SystemError.construct('EAGAIN', {syscall: 'stat', path: '/i/h/o/p', dest: '/h/o/w'})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('/h/o/w');
				expect(new SystemError.construct('ENOENT', {syscall: 'stat', path: '/d/e/n/n/y/s', dest: new Buffer('/b/e/d')})).to.be.an.instanceof(SystemError.construct).with.property('message').that.includes('/b/e/d');
			
			});
			it('should set context.errno to the local OS error number if it exists or the UV error number if it does not');
			it('should define a writable, non-configurable, non-enumerable property "kInfo" and assign the updated context value to it');
			it('should define a writable, non-configurable, non-enumerable property "kCode" and assign the key arg value to it');
			it('should define an enumerable property "code" with getters and setters pointing to kInfo.code');
			it('should define an enumerable property "dest" with getters and setters pointing to kInfo.dest');
			it('should define an enumerable property "path" with getters and setters pointing to kInfo.path');
			it('should define an enumerable property "errno" with getters and setters pointing to kInfo.errno');
			it('should capture the v8 stack trace and assign it to the stack property');
		
		});
		describe('get name()', function() {
		
			it('is a getter that should return the string "Error"', function() {
			
				expect(SystemError.ENOENT({syscall: 'stat'}).name).to.equal('Error');
			
			});
		
		});
		describe('set name(value)', function() {
		
			it('is a setter that assigns value of argument to a configurable, enumerable, writable property "name"', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				enoentError.name = 'No Entity Error';
				var nameDescriptor = Object.getOwnPropertyDescriptor(enoentError, 'name');
				expect(enoentError.name).to.equal('No Entity Error');
				expect(nameDescriptor.configurable).to.be.true;
				expect(nameDescriptor.enumerable).to.be.true;
				expect(nameDescriptor.writable).to.be.true;
			
			});
		
		});
		describe('get code()', function() {
		
			it('is a getter that should return the string value of kCode property', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				expect(enoentError.code).to.equal(enoentError.kCode);
			
			});
		
		});
		describe('set code(value)', function() {
		
			it('is a setter that assigns value of argument to property "kCode"', function() {
			
				var newCode = 'EPERM';
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				enoentError.code = newCode;
				expect(enoentError.code).to.equal(enoentError.kCode);
				expect(enoentError.code).to.equal(newCode);
			
			});
		
		});
		describe('get info()', function() {
		
			it('is a getter that should return the object value of kInfo property', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				expect(enoentError.info).to.deep.equal({syscall: 'stat', path: '/var/mysql/mysql.sock', errno: 'number' === typeof os.constants.errno['ENOENT'] ? os.constants.errno['ENOENT'] : -4058});
			
			});
		
		});
		describe('get errno()', function() {
		
			it('is a getter that should return the string value of kInfo.errno property', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				expect(enoentError.errno).to.equal(enoentError.kInfo.errno);
			
			});
		
		});
		describe('set errno(val)', function() {
		
			it('is a setter that assigns value of argument to property "kInfo.errno"', function() {
			
				var newErrno = 42;
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				enoentError.errno = newErrno;
				expect(enoentError.errno).to.equal(enoentError.kInfo.errno);
				expect(enoentError.errno).to.equal(newErrno);
			
			});
		
		});
		describe('get syscall()', function() {
		
			it('is a getter that should return the string value of kInfo.syscall property', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				expect(enoentError.syscall).to.equal(enoentError.kInfo.syscall);
			
			});
		
		});
		describe('set syscall(val)', function() {
		
			it('is a setter that assigns value of argument to property "kInfo.syscall"', function() {
			
				var newSyscall = 'write';
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				enoentError.syscall = newSyscall;
				expect(enoentError.syscall).to.equal(enoentError.kInfo.syscall);
				expect(enoentError.syscall).to.equal(newSyscall);
			
			});
		
		});
		describe('get path()', function() {
		
			it('is a getter that should return the string value of kInfo.path property, or undefined if kInfo.path is undefined', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				expect(enoentError.path).to.equal(enoentError.kInfo.path);
				var epermError = SystemError.EPERM({syscall: 'stat'});
				expect(epermError.path).to.be.undefined;
			
			});
		
		});
		describe('set path(val)', function() {
		
			it('is a setter that assigns value of argument, as a Buffer object, to property "kInfo.path", if val is a string or buffer; otherwise, sets propert "kInfo.path" to undefined', function() {
			
				var newPath = '~/run/mysql.sock';
				var enoentError = SystemError.ENOENT({syscall: 'stat', path: '/var/mysql/mysql.sock'});
				enoentError.path = newPath;
				expect(enoentError.path).to.equal(enoentError.kInfo.path.toString());
				expect(enoentError.path).to.equal(newPath);
				expect(enoentError.kInfo.path).to.be.an.instanceof(Buffer);
				var newPathBuffer = new Buffer('~/run/mysql.sock');
				enoentError.path = newPathBuffer;
				expect(enoentError.path).to.equal(enoentError.kInfo.path.toString());
				expect(enoentError.path).to.equal(newPathBuffer.toString());
				expect(enoentError.kInfo.path).to.be.an.instanceof(Buffer);
				enoentError.path = null;
				expect(enoentError.path).to.equal(enoentError.kInfo.path);
				expect(enoentError.kInfo.path).to.be.undefined;
			
			});
		
		});
		describe('get dest()', function() {
		
			it('is a getter that should return the string value of kInfo.dest property, or undefined if kInfo.dest is undefined', function() {
			
				var enoentError = SystemError.ENOENT({syscall: 'stat', dest: '/var/mysql/mysql.sock'});
				expect(enoentError.dest).to.equal(enoentError.kInfo.dest);
				var epermError = SystemError.EPERM({syscall: 'stat'});
				expect(epermError.dest).to.be.undefined;
			
			});
		
		});
		describe('set dest(val)', function() {
		
			it('is a setter that assigns value of argument, as a Buffer object, to property "kInfo.dest", if val is a string or buffer; otherwise, sets propert "kInfo.dest" to undefined', function() {
			
				var newPath = '~/run/mysql.sock';
				var enoentError = SystemError.ENOENT({syscall: 'stat', dest: '/var/mysql/mysql.sock'});
				enoentError.dest = newPath;
				expect(enoentError.dest).to.equal(enoentError.kInfo.dest.toString());
				expect(enoentError.dest).to.equal(newPath);
				expect(enoentError.kInfo.dest).to.be.an.instanceof(Buffer);
				var newPathBuffer = new Buffer('~/run/mysql.sock');
				enoentError.dest = newPathBuffer;
				expect(enoentError.dest).to.equal(enoentError.kInfo.dest.toString());
				expect(enoentError.dest).to.equal(newPathBuffer.toString());
				expect(enoentError.kInfo.dest).to.be.an.instanceof(Buffer);
				enoentError.dest = null;
				expect(enoentError.dest).to.equal(enoentError.kInfo.dest);
				expect(enoentError.kInfo.dest).to.be.undefined;
			
			});
		
		});
	
	});

});
