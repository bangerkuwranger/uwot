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
		it('should create an empty object as value of global.Uwot.Listeners if it is not already an object');
		it('should create an empty object as value of global.Uwot.Listeners[isid] if it is not already an object');
		it('should return a reference to global.Uwot.Listeners[isid], which should be an empty object, if it did not exist prior to being called');
		it('should return a reference to global.Uwot.Listeners[isid], which should be the already existing object, if it existed prior to being called');
		
	});
	describe('removeGlobalListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.removeGlobalListener).to.be.a('function');
		
		});
		it('should attempt to remove global.Uwot.Listeners[isid]');
		it('should return true if attempt was successful and threw no errors');
		it('should return false if attempt threw an error');
		
	});
	describe('newIsidDefaultListener(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.newIsidDefaultListener).to.be.a('function');
		
		});
		it('should call ensureGlobalListener');
		it('should set global.Uwot.Listeners[isid].default to a new instance of Listener class if current value is not a non-null object');
		it('should return an Error if instantiating the default Listener throws an error');
		it('should return the Listener global.Uwot.Listeners[isid].default if it was created without error or if it already existed');
		
	});
	describe('moveListeners(currentIsid, newIsid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.moveListeners).to.be.a('function');
		
		});
		it('should call ensureGlobalListener for isids in both args');
		it('should call newIsidDefaultListener for the new isid and return global.Uwot.Listeners[newIsid] if the old isid had no existing global listeners');
		it('should create new listeners matching the old isid globals');
		it('should set the isid to newIsid value for all new listeners');
		it('should add all new listeners to the global listener object for newIsid');
		it('should disable all old isid listeners prior to removal');
		it('should remove global.Uwot.Listeners[currentIsid] by calling removeGlobalListener');
		it('should return a reference to global.Uwot.Listeners[newIsid]');
	
	});
	describe('enableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.enableExclusiveState).to.be.a('function');
		
		});
		it('should call ensureGlobalListener');
		it('should add the names of all currently enabled non-exclusive listeners to the array global.Uwot.Listeners[isid].disabledForExclusive');
		it('should change the status of all disabledForExclusive Listeners to "disabled"');
		it('should return the disabledForExclusive array');
		
	});
	describe('disableExclusiveState(isid)', function() {
	
		it('should be a function', function() {
		
			expect(isidListener.disableExclusiveState).to.be.a('function');
		
		});
		it('should call ensureGlobalListener');
		it('should return an empty array if global.Uwot.Listeners[isid].disabledForExclusive is not a non-empty array');
		it('should enable all listeners in global.Uwot.Listeners[isid] matching names in the disabledForExclusive array if it is a non-empty array');
		it('should remove global.Uwot.Listeners[isid].disabledForExclusive if it is a non-empty array');
		it('should return an array of all enabled Listener instances if global.Uwot.Listeners[isid].disabledForExclusive is a non-empty array');
		
	});

});
