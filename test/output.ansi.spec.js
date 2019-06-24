const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const globalSetupHelper = require('../helpers/globalSetup');

var ansi = require('../output/ansi');

describe('ansi.js', function() {

	describe('ansi(obj)', function() {
	
		it('should be a function', function() {
		
			expect(ansi).to.be.a('function');
		
		});
		it('should return obj arg value unchanged if it is not an object', function() {
		
			var notObj = 'notAnObj';
			expect(ansi(notObj)).to.equal(notObj);
		
		});
		it('should return obj arg value unchanged if it is an object but does not have a property "output" that is an object', function() {
		
			var noOutputObj = {name: 'notAnObj'};
			expect(ansi(noOutputObj)).to.deep.equal(noOutputObj);
		
		});
		it('should return obj arg with output property object replaced by a string (using unexported function parseToAnsi) if obj is an object with a property "output" that is an object', function() {
		
			var testObj = {
				output: {
				
					content: 'test output'
				
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('test output');
		
		});
	
	});
	describe('parseToAnsi(ansiObj)', function() {
	
		before(function() {
		
			globalSetupHelper.initConstants();
		
		});
		it('should not be accessible in export', function() {
		
			expect(ansi.parseToAnsi).to.not.be.a('function');
		
		});
		it('should return an empty string if ansiObj is not a non-null object', function() {
		
			var testObj = {
				output: null
			};
			expect(ansi(testObj).output).to.equal('');
		
		});
		it('should return a string containing valid html parsed from the ansiObj', function() {
		
			var testObj = {
				output: {
					content: 'test output'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.equals('<span class="ansi">test output</span>');
		
		});
		it('should include a class value "ansi" for any html tag', function() {
		
			var testObj = {
				output: {
					content: 'test output'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('class="ansi');
		
		});
		it('should use "span" as the enclosing element for any node that has a non-string tag property', function() {
		
			var testObj = {
				output: {
					content: 'test output'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('</span>');
		
		});
		it('should use the given tag propert value as the enclosing element for any node that does has a tag property that is a string', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					tag: 'div'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('</div>');
		
		});
		it('should add a class "fg-[color]" if [color] is a string value that is assigned to ansiObj argument\'s "color" property', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					color: 'cyan'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('fg-cyan');
		
		});
		it('should add a class "bg-[color]" if [color] is a string value that is assigned to ansiObj argument\'s "backgroundColor" property', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white'
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('bg-cyan');
		
		});
		it('should add a class "reversed" if ansiObj argument\'s "isReversed" property is truthy', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: true
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('reversed');
		
		});
		it('should add a class "bold" if ansiObj argument\'s "isBold" property is truthy', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: true
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('bold');
		
		});
		it('should add a class "underline" if ansiObj argument\'s "isUnderline" property is truthy', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: true
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('underline');
		
		});
		it('should add any classes if ansiObj argument\'s "classes" property is a non-empty array of strings, escaping each class name with global.Uwot.Constants.escapeHtml', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: false,
					classes: [
						'woe&betrayal'
					]
				}
			};
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('woe&amp;betrayal');
		
		});
		it('should not add any additional classes if ansiObj argument\'s "classes" property is not a non-empty array of strings', function() {
		
			var testObj1 = {
				output: {
				
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: false,
					classes: []
				
				}
			};
			var testObj2 = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: false,
					classes: null
				}
			};
			var testObj3 = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: false,
					classes: 'woe&betrayal'
				}
			};
			expect(ansi(testObj1)).to.be.an('object').with.property('output').that.is.a('string').that.contains('class="ansi fg-white bg-cyan"');
			expect(ansi(testObj2)).to.be.an('object').with.property('output').that.is.a('string').that.contains('class="ansi fg-white bg-cyan"');
			expect(ansi(testObj3)).to.be.an('object').with.property('output').that.is.a('string').that.contains('class="ansi fg-white bg-cyan"');
		
		});
		it('should skip add any additional classes in ansiObj argument\'s "classes" property array that are not non-empty strings', function() {
		
			var testObj = {
				output: {
					content: 'test output',
					backgroundColor: 'cyan',
					color: 'white',
					isReversed: false,
					isBold: false,
					isUnderline: false,
					classes: [
						'',
						['happiness'],
						null,
						{humanDefault: 'kindness'},
						42,
						'woe&betrayal'
					]
				}
			};
			
			expect(ansi(testObj)).to.be.an('object').with.property('output').that.is.a('string').that.contains('class="ansi fg-white bg-cyan woe&amp;betrayal"');
		
		});
		it('should create proper open and close tags for any node that has a string content property', function() {
		
			var testObj = {
				output: {
				
					content: 'test output'
				
				}
			};
			var htmlOutput = ansi(testObj).output;
			expect(htmlOutput).to.be.a('string').that.contains('<span');
			expect(htmlOutput).to.be.a('string').that.contains('</span>');
		
		});
		it('should create a self-closed tag for any node that has undefined content property', function() {
		
			var testObj = {
				output: {
					tag: 'br'
				}
			};
			var htmlOutput = ansi(testObj).output;
			expect(htmlOutput).to.be.a('string').that.equals('<br class="ansi" />');
		
		});
		it('should create a tag pair with no text node for any node that has a defined content property that is not a string or array', function() {
		
			var testObj = {
				output: {
					content: null
				}
			};
			var htmlOutput = ansi(testObj).output;
			expect(htmlOutput).to.be.a('string').that.equals('<span class="ansi"></span>');
		
		});
		it('should loop through array members if content property is an array, placing text (if member is a string) or recursively processing it and placing resulting html (if member is an object) inside of generated tag. any non-string and non-object members should be ignored', function() {
		
			var testObj = {
				output: {
					content: [
						'string1&nbsp;',
						null,
						'string2&nbsp;',
						{
							tag: 'ul',
							content: [
								{
									tag: 'li',
									content: 'list'
								},
								{
									tag: 'li',
									content: 'of'
								},
								{
									tag: 'li',
									content: 'stuff'
								}
							]
						},
						'string3&nbsp;',
						1024
					],
					tag: 'p'
				}
			};
			var htmlOutput = ansi(testObj).output;
			expect(htmlOutput).to.be.a('string').that.contains('string1&nbsp;string2&nbsp;<ul class="ansi"><li class="ansi">list</li><li class="ansi">of</li><li class="ansi">stuff</li></ul>string3&nbsp');
		
		});
	
	});

});
