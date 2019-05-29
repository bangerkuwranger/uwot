const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const cheerio = require('cheerio');

var consoleHtml = require('../helpers/consoleHtml');
const getTestHtmlString = function() {

	return '<html><head><title>the pull of the past is the pall over us</title><meta name="description" content="art. software. music. a general sense of unease."><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="194x194" href="/favicon-194x194.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=BG76j6NvbJ"><link rel="manifest" href="/site.webmanifest?v=BG76j6NvbJ"><link rel="mask-icon" href="/safari-pinned-tab.svg?v=BG76j6NvbJ" color="#ff0000"><link rel="shortcut icon" href="/favicon.ico?v=BG76j6NvbJ"><meta name="msapplication-TileColor" content="#979797"><meta name="theme-color" content="#ffffff"><link rel="stylesheet" href="https://www.chadacarino.com/css/singlepage.css?v=2"><link rel="stylesheet" href="https://www.chadacarino.com/css/font-cacscribbles.css"><style type="text/css">body {font-family: cAcScribbles, "Lucida Console", "Lucida Sans Typewriter", monaco, "Bitstream Vera Sans Mono", monospace;}h6 { text-transform: uppercase;}</style></head><body><div class="page page-comingsoon"><h1>i\'m working on it; leave me be.</h1><img src="https://www.chadacarino.com/images/caclogov2.png" alt="C. A. C." style="max-width: 320px; height: auto;"><h6><a id="normalLink" href="https://github.com/bangerkuwranger">visit me on github</a></h6></div><ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li></ul><p><a id="spawnLink" href="https://www.chadacarino.com/" target="_blank">spawn</a></p><p><a id="nothingLink" href="#!" target="_self" onClick="console.log(\'nothing done.\')">do nothing</a></p><p><a id="takeoverLink" href="https://www.chadacarino.com/" target="_parent">take over</a></p></body></html>';

};


var testString;
var testObj;

describe('consoleHtml.js', function() {

	beforeEach(function() {
	
		testString = getTestHtmlString();
		testObj = cheerio.load(testString);
	
	});
	describe('getAsJQuery(htmlString)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.getAsJQuery).to.be.a('function');
		
		});
		it('should throw a TypeError if htmlString arg value is not a string', function() {
		
			expect(consoleHtml.getAsJQuery).to.throw(TypeError, 'invalid htmlString passed to getAsJQuery');
		
		});
		it('should return a cheerio object if htmlString arg value is a string', function() {
		
			var $ = consoleHtml.getAsJQuery(testString);
			expect($).to.be.a('function');
			expect($('title').text()).to.equal('the pull of the past is the pall over us');
			console.log($.html());
		
		});
	
	});
	describe('makeConsoleHtml(jqObj)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.makeConsoleHtml).to.be.a('function');
		
		});
		it('should throw a TypeError if jqObj is not a function', function() {
		
			expect(consoleHtml.makeConsoleHtml).to.throw(TypeError, 'invalid jqObj passed to makeConsoleHtml');
		
		});
		it('should return the html of the unchanged jqObj if there are no "a" tags in the markup', function() {
		
			testObj('a').replaceWith('');
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			expect(testResults).to.equal(testObj.html());
		
		});
		it('should not change the onclick or class attributes of any links that have an onclick attribute', function() {
		
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			var nothingLinkHtml = testObj.html('#nothingLink');
			var resultObj = cheerio.load(testResults);
			var resultLinkHtml = resultObj.html('#nothingLink');
			expect(resultLinkHtml).to.equal(nothingLinkHtml);
		
		});
		it('should not change the onclick or class attributes of any links that have a target attribute of "_blank"', function() {
		
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			var spawnLinkHtml = testObj.html('#spawnLink');
			var resultObj = cheerio.load(testResults);
			var resultLinkHtml = resultObj.html('#spawnLink');
			expect(resultLinkHtml).to.equal(spawnLinkHtml);
		
		});
		it('should add the class "uwot-console-link" and add an onclick attribute calling "uwotConsoleGoto" to any links that do not have an onclick attribute and do not have a target attribute of "_blank"', function() {
		
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			var resultObj = cheerio.load(testResults);
			var normalLinkHtml = resultObj.html('#normalLink');
			var takeoverLinkHtml = resultObj.html('#takeoverLink');
			expect(normalLinkHtml).to.equal('<a id="normalLink" href="https://github.com/bangerkuwranger" onclick="uwotConsoleGoto(&quot;https://github.com/bangerkuwranger&quot;)" class="uwot-console-link">visit me on github</a>');
			expect(takeoverLinkHtml).to.equal('<a id="takeoverLink" href="https://www.chadacarino.com/" target="_parent" onclick="uwotConsoleGoto(&quot;https://www.chadacarino.com/&quot;)" class="uwot-console-link">take over</a>');
		
		});
	
	});
	describe('pullHeadElements(jqObj, callback)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.pullHeadElements).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			expect(consoleHtml.pullHeadElements).to.throw(TypeError, 'invalid callback passed to pullHeadElements');
		
		});
		it('should return a TypeError to callback if jqObj is not a function');
		it('should not return until all matched head styles and scripts are loaded');
		it('should set stylesDone to true and return object property "styles" to an empty string if jqObj has no link elements in head');
		it('should set scriptsDone to true and return object property "scripts" to an empty string if jqObj has no script elements in head');
		it('should get content of any matched style links from cache if previously cached and append it to the style tag string in the return object\'s "styles" property');
		it('should retrieve content of any matched style links from remote location if not previously cached, then cache and append it to the style tag string in the return object\'s "styles" property');
		it('should get content of any matched script links from cache if previously cached and append it to the script tag string in the return object\'s "scripts" property');
		it('should retrieve content of any matched script links from remote location if not previously cached, then cache and append it to the script tag string in the return object\'s "scripts" property');
		it('should return an object with two properties, "styles" and "scripts", each containing a string that is either empty or an html tag');
		
	
	});
	describe('loadForConsole(htmlString, callback)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.loadForConsole).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			expect(consoleHtml.loadForConsole).to.throw(TypeError, 'invalid callback passed to loadForConsole');
		
		});
		it('should return a TypeError to callback if jqObj is not a function');
		it('should return an error to callback if getAsJQuery throws an error');
		it('should return an error to callback if makeConsoleHtml throws an error');
		it('should return an error as first callback arg and parsed body html as second html arg if pullHeadElements returns an error');
		it('should return the final html string with the style tag prepended if pullHeadElements results in a non-empty "styles" string');
		it('should return the final html string with the script tag prepended if pullHeadElements results in a non-empty "scripts" string');
		it('should return the final html string with the style and script tags prepended if pullHeadElements results in a non-empty "styles" and "scripts" string');
		it('should return the final html string with no tag prepended if pullHeadElements results in non-string or empty "styles" and "scripts" values');
	
	});

});
