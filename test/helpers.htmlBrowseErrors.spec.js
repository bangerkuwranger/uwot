const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var browseErrors = require('../helpers/htmlBrowseErrors');
var os = require('os');

const getNotFoundObj = function() {
	return {
	
		errInt: '404',
		name: 'Not Found',
		rawDesc: "The requested URL was not found on this server. If you entered the URL manually please check your spelling and try again."
	
	};

};

describe('htmlBrowseErrors.js', function() {

	describe('getErrorHtmlFromTemplate(args)', function() {
	
		it('should be a function', function() {
		
			expect(browseErrors.getErrorHtmlFromTemplate).to.be.a('function');
		
		});
		it('should return an error if args is not a non-null object with a string property "name"', function() {
		
			expect(browseErrors.getErrorHtmlFromTemplate()).to.be.an.instanceof(Error).with.property('message').that.equals('invalid browser Error');
			expect(browseErrors.getErrorHtmlFromTemplate(null)).to.be.an.instanceof(Error).with.property('message').that.equals('invalid browser Error');
			expect(browseErrors.getErrorHtmlFromTemplate({errName: 'ENOENT'})).to.be.an.instanceof(Error).with.property('message').that.equals('invalid browser Error');
		
		});
		it('should return a string containing a valid html page', function() {
		
			var testResult = browseErrors.getErrorHtmlFromTemplate(getNotFoundObj());
			expect(testResult).to.be.a('string');
			expect(testResult).to.contain('<html>');
			expect(testResult).to.contain('</html>');
		
		});
		it('should include args.name in the head title element text node and body h1 element text node', function() {
		
			var testObj = getNotFoundObj();
			var testResult = browseErrors.getErrorHtmlFromTemplate(testObj);
			expect(testResult).to.be.a('string');
			expect(testResult).to.contain(testObj.name + '</title></head>');
			expect(testResult).to.contain(testObj.name + '</h1>');
		
		});
		it('should include args.errInt in the head title element text node and body h1 element text node if args.errInt is a string', function() {
		
			var testObj = getNotFoundObj();
			var testResult = browseErrors.getErrorHtmlFromTemplate(testObj);
			var testObj2 = getNotFoundObj();
			delete testObj2.errInt;
			var testResult2 = browseErrors.getErrorHtmlFromTemplate(testObj2);
			expect(testResult).to.be.a('string');
			expect(testResult).to.contain('<head><title>' + testObj.errInt + ' ' + testObj.name + '</title></head>');
			expect(testResult).to.contain('<h1>Error ' + testObj.errInt + ' ' + testObj.name + '</h1>');
			expect(testResult2).to.be.a('string');
			expect(testResult2).to.contain('<head><title>' + testObj.name + '</title></head>');
			expect(testResult2).to.contain('<h1>Error ' + testObj.name + '</h1>');
		
		});
		it('should include a paragraph element for each section of text, separated by an os.EOL character, in args.rawDesc if args.rawDesc is a string', function() {
		
			var testObj = getNotFoundObj();
			testObj.rawDesc = 'line one' + os.EOL + 'line two';
			var testResult = browseErrors.getErrorHtmlFromTemplate(testObj);
			expect(testResult).to.be.a('string');
			expect(testResult).to.contain('<p>line one</p>');
			expect(testResult).to.contain('<p>line two</p>');
		
		});
		it('should include the formatted html in the args.htmlDesc property if it is a string and args.rawDesc is not  a string', function() {
		
			var testObj = getNotFoundObj();
			testObj.rawDesc = null;
			testObj.htmlDesc = '<p>formatted line one</p><p>formatted line two</p>';
			var testResult = browseErrors.getErrorHtmlFromTemplate(testObj);
			expect(testResult).to.be.a('string');
			expect(testResult).to.contain(testObj.htmlDesc);
		
		});
	
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
