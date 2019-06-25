const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const globalSetupHelper = require('../helpers/globalSetup');
const EOL = require('os').EOL;

var toText = require('../output/ansiToText');

describe('ansiToText.js', function() {

	describe('parseToText(inputValue, inputType)', function() {
	
		before(function() {
		
			globalSetupHelper.initConstants();
		
		});
		it('should be a function', function() {
		
			expect(toText).to.be.a('function');
		
		});
		it('should return inputValue.toString() if inputType arg is not a string or not a valid inputType', function() {
		
			var testValue = 'aloutte intact';
			expect(toText(testValue, null)).to.equal(testValue);
			expect(toText(testValue, 'xml')).to.equal(testValue);
		
		});
		it('should return inputValue unchanged if inputType is "string"', function() {
		
			var testValue = 'aloutte intact';
			expect(toText(testValue, 'string')).to.equal(testValue);
		
		});
		it('should return the result of ansiHtmlToText(inputValue) if inputType is "html"', function() {
		
			var testValue = '<span class="ansi">aloutte intact</span>';
			var addString = 'ansiHtmlToText run on: ';
			var ansiHtmlToTextStub = sinon.stub(toText, 'ansiHtmlToText').callsFake(function addStringToArg(input) {
			
				return addString + input;
			
			});
			expect(toText(testValue, 'html')).to.equal(addString + testValue);
			ansiHtmlToTextStub.restore();
		
		});
		it('should attempt to parse JSON to object if inputType is "json"', function() {
		
			var testValue = 'aloutte intact';
			var addString = 'ansiHtmlToText run on: ';
			var testObj = {
				output: {
					content: testValue
				}
			};
			var testJson = JSON.stringify(testObj);
			var ansiHtmlToTextStub = sinon.stub(toText, 'ansiHtmlToText').callsFake(function addStringToArg(input) {
			
				return addString + input;
			
			});
			expect(toText(testJson, 'json')).to.equal(addString + '<span class="ansi">aloutte intact</span>');
			ansiHtmlToTextStub.restore();
		
		});
		it('should only parse the output property value of an object or json parsed to object if it is set and is itself an object', function() {
		
			var testValue = 'aloutte intact';
			var addString = 'ansiHtmlToText run on: ';
			var testObj = {
				output: {
					content: testValue
				}
			};
			var ansiHtmlToTextStub = sinon.stub(toText, 'ansiHtmlToText').callsFake(function addStringToArg(input) {
			
				return addString + input;
			
			});
			expect(toText(testObj, 'object')).to.equal(addString + '<span class="ansi">aloutte intact</span>');
			ansiHtmlToTextStub.restore();
		
		});
		
	
	});
	describe('ansiHtmlToText(htmlText)', function() {
	
		
		var testHtml;
		before(function() {
		
			globalSetupHelper.initConstants();
		
		});
		it('should be a function accessible as property of export', function() {
		
			expect(toText.ansiHtmlToText).to.be.a('function');
		
		});
		it('should return a string', function() {
		
			testHtml = '<span class="ansi">wing by wing</span>';
			expect(toText.ansiHtmlToText(testHtml)).to.be.a('string');
		
		});
		it('should strip html tags and return value of text nodes', function() {
		
			expect(toText.ansiHtmlToText(testHtml)).to.equal('wing by wing');
		
		});
		it('should replace "br" tags with EOL characters', function() {
		
			testHtml += '<br /><span class="ansi">feather by feather</span>';
			expect(toText.ansiHtmlToText(testHtml)).to.equal('wing by wing' + EOL + 'feather by feather');
		
		});
		it('should not return any text from empty or non-"br" self closed tags', function() {
		
			testHtml += '<p class="ansi fg-green">sanguine within,</p><pre></pre><icon class="fa fa-twitter" /><p class="ansi fg-green"> perishement without</p>';
			expect(toText.ansiHtmlToText(testHtml)).to.equal('wing by wing' + EOL + 'feather by feather' + EOL + 'sanguine within,' + EOL + ' perishement without');
		
		});
		it('should prepend text for each non-empty block tag with an EOL character', function() {
		
			expect(toText.ansiHtmlToText(testHtml)).to.equal('wing by wing' + EOL + 'feather by feather' + EOL + 'sanguine within,' + EOL + ' perishement without');
		
		});
		it('should append an EOL character to text from each non-empty block tag that is not followed by another block tag and is not the last element', function() {
		
			testHtml += '<span class="ansi">soaring in stillness</span><div class="ansi">complete</div><span class="ansi">completely</span><span class="ansi">   nothing   </span>';
			var testText = toText.ansiHtmlToText(testHtml);
			expect(testText).to.equal('wing by wing' + EOL + 'feather by feather' + EOL + 'sanguine within,' + EOL + ' perishement without' + EOL + 'soaring in stillness' + EOL + 'complete' + EOL + 'completely   nothing   ');
			console.log(testText);
		
		});
	
	});

});
