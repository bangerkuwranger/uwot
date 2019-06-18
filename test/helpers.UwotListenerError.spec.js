const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var ListenerError = require('../helpers/UwotListenerError');
var os = require('os');

describe('UwotListenerError.js', function() {

	describe('UwotListenerError', function() {
	
		describe('constructor(msg, context)', function() {
		
			it('should be a function', function() {
			
				expect(ListenerError.constructor).to.be.a('function');
			
			});
			it('should set type to "UNKNOWN", reason to "unknown", isid to "unknown", and lname to "unknown" if contect is not an object or is null', function() {
			
				var noValueLE = new ListenerError();
				var nullContextLE = new ListenerError('', null);
				expect(noValueLE).to.be.an.instanceof(ListenerError).with.property('type').that.equals('UNKNOWN');
				expect(noValueLE).to.have.property('reason').that.equals('unknown');
				expect(noValueLE).to.have.property('isid').that.equals('unknown');
				expect(noValueLE).to.have.property('lname').that.equals('unknown');
				expect(nullContextLE).to.be.an.instanceof(ListenerError).with.property('type').that.equals('UNKNOWN');
				expect(nullContextLE).to.have.property('reason').that.equals('unknown');
				expect(nullContextLE).to.have.property('isid').that.equals('unknown');
				expect(nullContextLE).to.have.property('lname').that.equals('unknown');
			
			});
			it('should set error type to "UNKNOWN" if context arg is a non-null object and context.type is not a string or not a valid error type', function() {
			
				var invalidTypeContext = {
					type: 'NOFUN',
					reason: 'No fun at all.',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				var nullTypeContext = {
					type: null,
					reason: 'No fun at all.',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', invalidTypeContext)).to.be.an.instanceof(ListenerError).with.property('type').that.equals('UNKNOWN');
				expect(new ListenerError('', nullTypeContext)).to.be.an.instanceof(ListenerError).with.property('type').that.equals('UNKNOWN');
			
			});
			it('should set error reason to mapped reason for type if context arg is a non-null object and context.reason is not a string', function() {
			
				var nullReasonContext = {
					type: 'NONONCE',
					reason: null,
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', nullReasonContext)).to.be.an.instanceof(ListenerError).with.property('reason').that.equals('Nonce not found');
			
			});
			it('should always begin the message property with the string "Access Denied"', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).message).to.contain('Access Denied');
			
			});
			it('should include the error type in the message property if it is not "UNKNOWN"', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				var testUnknownErrorContext = {
					type: 'UNKNOWN',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).message).to.contain(testErrorContext.type);
				expect(new ListenerError('', testUnknownErrorContext).message).to.not.contain(testUnknownErrorContext.type);
			
			});
			it('should include the value of the msg argument in the message property, in place of context.reason, if it is a non-empty string', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('Jack has been looking dull, lately', testErrorContext).message).to.contain('Jack has been looking dull, lately');
				expect(new ListenerError('Jack has been looking dull, lately', testErrorContext).message).to.not.contain(testErrorContext.reason);
			
			});
			it('should include the error reason in the message property if the value of the msg arg is not a non-empty string', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).message).to.contain(testErrorContext.reason);
			
			});
			it('should include the value of the isid property in the message property if its value is a string', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).message).to.contain(testErrorContext.isid);
				var testNonstringIsidErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: ['allworkandnoplay'],
					lname: 'default'
				};
				expect(new ListenerError('', testNonstringIsidErrorContext).message).to.not.contain(testErrorContext.isid);
			
			});
			it('should include the value of the lname property in the message property if its value is a string', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).message).to.contain(testErrorContext.lname);
				var testNonstringLnameErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: ['default']
				};
				expect(new ListenerError('', testNonstringLnameErrorContext).message).to.not.contain(testErrorContext.lname);
			
			});
			it('should assign the context value to the kInfo property', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('Jack has been looking dull, lately', testErrorContext).kInfo).to.equal(testErrorContext);
			
			});
			it('should assign the context.type value to the kCode property', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('Jack has been looking dull, lately', testErrorContext).kCode).to.equal(testErrorContext.type);
			
			});
			it('should capture the v8 stack trace and assign it to the stack property', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				var testError = new ListenerError('Jack has been looking dull, lately', testErrorContext);
				expect(testError.stack).to.not.equal(testError.message);
				expect(testError.stack.length).to.be.above(testError.message.length);
				expect(testError.stack).to.contain(testError.message);
			
			});
		
		});
		describe('get name()', function() {
		
			it('is a getter that should return the string "Error"', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).name).to.equal('Error');
			
			});
		
		});
		describe('get info()', function() {
		
			it('is a getter that should return the object value of kInfo property', function() {
			
				var testErrorContext = {
					type: 'NONONCE',
					reason: 'Nonce not applicable to this transaction',
					isid: 'allworkandnoplay',
					lname: 'default'
				};
				expect(new ListenerError('', testErrorContext).info).to.deep.equal(testErrorContext);
			
			});
		
		});
	
	});

});
