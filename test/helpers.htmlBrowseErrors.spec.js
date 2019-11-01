const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var browseErrors = require('../helpers/htmlBrowseErrors');
var os = require('os');

describe('htmlBrowseErrors.js', function() {

	describe('getErrorHtmlFromTemplate(args)', function() {
	
		it('should be a function', function() {
		
			expect(browseErrors.getErrorHtmlFromTemplate).to.be.a('function');
		
		});
		it('should return an error if args is not a non-null object with a string property "name"');
		it('should return a string containing a valid html page');
		it('should include args.name in the head title element text node and body h1 element text node');
		it('should include args.errInt in the head title element text node and body h1 element text node if args.errInt is a string');
		it('should include a paragraph element for each section of text, separated by an os.EOL character, in args.rawDesc if args.rawDesc is a string');
		it('should include the formatted html in the args.htmlDesc property if it is a string and args.rawDesc is not  a string');
	
	});
	describe('getHtmlForError(errInt)', function() {
	
		it('should be a function', function() {
		
			expect(browseErrors.getHtmlForError).to.be.a('function');
		
		});
		it('should return an Error if errInt arg value is not a number');
		it('should return an Error if errInt arg value is not one of 401, 403, 404, or 500');
		it('should return the result of this.getErrorHtmlFromTemplate called with errInt arg value if errInt is a valid error integer');
	
	});
	describe('getErrIntFromSysCode(sysCode)', function() {
	
		it('should be a function', function() {
		
			expect(browseErrors.getErrIntFromSysCode).to.be.a('function');
		
		});
		it('should return 0 if sysCode arg value is not a string');
		it('should return 500 if sysCode arg value is a string that does not equal one of "EACCES", "EPERM", "ENOENT", or "EISDIR"');
		it('should return 401 if sysCode arg value equals "EACCES"');
		it('should return 403 if sysCode arg value equals "EPERM"');
		it('should return 404 if sysCode arg value equals "ENOENT" or "EISDIR"');
	
	});

});
