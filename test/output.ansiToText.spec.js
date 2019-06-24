const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const globalSetupHelper = require('../helpers/globalSetup');

var toText = require('../output/ansiToText');

describe('ansiToText.js', function() {

	describe('parseToText(inputValue, inputType, isOrig)', function() {
	
		before(function() {
		
			globalSetupHelper.initConstants();
		
		});
		it('should be a function', function() {
		
			expect(toText).to.be.a('function');
		
		});
	
	});
	describe('ansiHtmlToText(htmlText)', function() {
	
		before(function() {
		
			globalSetupHelper.initConstants();
		
		});
		it('should not be accessible in export', function() {
		
			expect(toText.ansiHtmlToText).to.not.be.a('function');
		
		});
	
	});

});
