var fs = require('fs');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var gsh = require('../helpers/globalSetup');

describe('globalSetup.js', function() {

	it('should create global.Uwot object and all properties as empty objects, if objects do not already exist, upon first require', function() {
	
		expect(global.Uwot).to.be.an('object').that.is.not.null;
		expect(global.Uwot).to.have.property('Constants').that.is.not.null;
		expect(global.Uwot).to.have.property('Config').that.is.not.null;
		expect(global.Uwot).to.have.property('Users').that.is.not.null;
		expect(global.Uwot).to.have.property('Exports').that.is.not.null;
		expect(global.Uwot).to.have.property('Themes').that.is.not.null;
		expect(global.Uwot).to.have.property('Bin').that.is.not.null;

	});
	
	afterEach(function() {

		sinon.restore();

	});
	
	describe('initGlobalObjects', function() {
	
		it('should be a function', function() {
		
			expect(gsh.initGlobalObjects).to.be.a('function');
		
		});
		it('should create global.Uwot object and all properties as empty objects, if objects do not already exist.', function() {
	
			gsh.uninitialize();
			gsh.initGlobalObjects();
			expect(global.Uwot).to.be.an('object').that.is.not.null;
			expect(global.Uwot).to.have.property('Constants').that.deep.equals({});
			expect(global.Uwot).to.have.property('Config').that.deep.equals({});
			expect(global.Uwot).to.have.property('Users').that.deep.equals({});
			expect(global.Uwot).to.have.property('Exports').that.deep.equals({});
			expect(global.Uwot).to.have.property('Themes').that.deep.equals({});
			expect(global.Uwot).to.have.property('Bin').that.deep.equals({});
	
		});
	
	});
	describe('initConstants', function() {
	
		it('should be a function', function() {
		
			expect(gsh.initConstants).to.be.a('function');
		
		});
	
	});
	describe('initEnvironment', function() {
	
		it('should be a function', function() {
		
			expect(gsh.initEnvironment).to.be.a('function');
		
		});
		
	
	});

});
