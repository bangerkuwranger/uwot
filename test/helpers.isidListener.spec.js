const globalSetupHelper = require('../helpers/globalSetup');
var Listener = require('../listener');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var isidListener = require('../helpers/isidListener');

describe('isidListener.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
	
	});
	describe('ensureGlobalListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.ensureGlobalListener).to.be.a('function');
		
		});
		
	});
	describe('removeGlobalListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.removeGlobalListener).to.be.a('function');
		
		});
		
	});
	describe('newIsidDefaultListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.newIsidDefaultListener).to.be.a('function');
		
		});
		
	});
	describe('moveListeners(currentIsid, newIsid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.moveListeners).to.be.a('function');
		
		});
		
	});
	describe('enableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.enableExclusiveState).to.be.a('function');
		
		});
		
	});
	describe('disableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.disableExclusiveState).to.be.a('function');
		
		});
		
	});

});
