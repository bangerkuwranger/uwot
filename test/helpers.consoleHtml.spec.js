const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const cheerio = require('cheerio');
const request = require('request-promise-native');

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
	describe('getRemoteResources(urlOrUrlArray, contentString)', function() {
	
		var requestGetStub;
		beforeEach('stub out request-promise-native', function() {
		
			requestGetStub = sinon.stub(request, 'get');
		
		});
		afterEach('restore stub', function() {
		
			requestGetStub.restore();
		
		});
		it('should be a function', function() {
		
			expect(consoleHtml.getRemoteResources).to.be.a('function');
		
		});
		it('should return a Promise rejected with a TypeError if urlOrUrlArray is not a string or Array', function() {
		
			return expect(consoleHtml.getRemoteResources(null)).to.eventually.be.rejectedWith(TypeError).with.property('message').that.equals('urlOrUrlArray must be a string or an Array of strings');
		
		});
		it('should return a Promise resolved with a cached value if urlOrUrlArray is a string and the matching value is cached', function() {
		
			var testUrl = 'https://www.chadacarino.com/css/singlepage.css';
			var testCache = 'body {background: #333;color: #ddd}';
			consoleHtml.cache.set(testUrl, testCache);
			return expect(consoleHtml.getRemoteResources(testUrl)).to.eventually.be.fulfilled.then((content) => {
			
				consoleHtml.cache.del(testUrl);
				expect(content).to.equal(testCache);
			
			});
		
		});
		it('should return a Promise resolved with a string of cached value appended to contentString value if urlOrUrlArray is a string, the matching value is cached, and contentString arg value is a string', function() {
		
			var testContentString = 'body.darkmode {background: #000; color: #ccc}';
			var testUrl = 'https://www.chadacarino.com/css/singlepage.css';
			var testCache = 'body {background: #333;color: #ddd}';
			consoleHtml.cache.set(testUrl, testCache);
			return expect(consoleHtml.getRemoteResources(testUrl, testContentString)).to.eventually.be.fulfilled.then((content) => {
			
				expect(content).to.equal(testContentString + testCache);
				consoleHtml.cache.del(testUrl);
			
			});
		
		});
		it('should return a Promise resolved with the retrieved value and cache the retrieved value if urlOrUrlArray is a string, value is not cached, and the remote data is retrieved successfully', function() {
		
			var testUrl = 'https://www.chadacarino.com/css/singlepage.css';
			var testBody = 'body {background: #333;color: #ddd}';
			requestGetStub.returns(Promise.resolve(testBody));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrl)).to.eventually.be.fulfilled.then((content) => {
		
				expect(content).to.equal(testBody);
				expect(consoleHtml.cache.get(testUrl)).to.equal(content);
				consoleHtml.cache.del(testUrl);
			
			});
		
		});
		it('should return a Promise resolved with a string of the retrieved value appended to contentString value and cache the retrieved value if urlOrUrlArray is a string, value is not cached, the remote data is retrieved successfully, and contentString arg value is a string', function() {
		
			var testContentString = 'body.darkmode {background: #000; color: #ccc}';
			var testUrl = 'https://www.chadacarino.com/css/singlepage.css';
			var testBody = 'body {background: #333;color: #ddd}';
			requestGetStub.returns(Promise.resolve(testBody));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrl, testContentString)).to.eventually.be.fulfilled.then((content) => {
		
				expect(content).to.equal(testContentString + testBody);
				expect(consoleHtml.cache.get(testUrl)).to.equal(testBody);
				consoleHtml.cache.del(testUrl);
			
			});
		
		});
		it('should return a Promise rejected with an Error if urlOrUrlArray is a string, value is not cached, and the remote data is not retrieved successfully', function() {
		
			var testUrl = 'https://www.chadacarino.com/css/neverthere.css';
			requestGetStub.returns(Promise.reject(new Error('test request error')));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrl)).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('test request error');
		
		});
		it('should return a Promise rejected with an Error if urlOrUrlArray arg is an empty Array and contentString is not a string', function() {
		
			var testUrls = [];
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('no content received');
		
		});
		it('should return a Promise resolved with the value of contentString arg if urlOrUrlArray arg is an empty Array and contentString is a string', function() {
		
			var testUrls = [];
			var testContentString = 'body.darkmode {background: #000; color: #ccc}';
			return expect(consoleHtml.getRemoteResources(testUrls, testContentString)).to.eventually.equal(testContentString);
		
		});
		it('should return a Promise rejected with an Error if the first URL in the urlOrUrlArray Array gets a rejected Promise from request', function() {
		
			var testUrls = ['https://www.chadacarino.com/css/neverthere.css'];
			requestGetStub.returns(Promise.reject(new Error('test request error')));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('test request error');
		
		});
		it('should return a Promise rejected with an Error if any subsequent url after the first URL in the urlOrUrlArray Array gets a rejected Promise from request', function() {
		
			var testUrls = ['https://www.chadacarino.com/css/singlepage.css', 'https://www.chadacarino.com/css/neverthere.css'];
			var testBody = 'body {background: #333;color: #ddd}';
			requestGetStub.onCall(0).returns(Promise.resolve(testBody));
			requestGetStub.onCall(1).returns(Promise.reject(new Error('test request error')));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.rejectedWith(Error).with.property('message').that.equals('test request error');
		
		});
		it('should return a Promise rejected with an Error if any subsequent url after the first URL, which has cached results, in the urlOrUrlArray Array gets a rejected Promise from request', function() {
		
			var testUrls = ['https://www.chadacarino.com/css/singlepage.css', 'https://www.chadacarino.com/css/neverthere.css'];
			var testBody = 'body {background: #333;color: #ddd}';
			requestGetStub.returns(Promise.reject(new Error('test request error')));
			consoleHtml.cache.set(testUrls[0], testBody);
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.rejected.then((error) => {
			
				consoleHtml.cache.flushAll();
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test request error');
			
			});
		
		});
		it('should return Promise resolved with a string concatenated from cached results if all urls have cached strings and contentString is not a string', function() {
		
			var testUrls = ['https://www.chadacarino.com/css/singlepage.css', 'https://www.chadacarino.com/css/darkmode.css'];
			var testBody1 = 'body {background: #333;color: #ddd}';
			var testBody2 = 'body.darkmode {background: #000; color: #ccc}';
			consoleHtml.cache.set(testUrls[0], testBody1);
			consoleHtml.cache.set(testUrls[1], testBody2);
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.fulfilled.then((content) => {
			
				consoleHtml.cache.flushAll();
				expect(content).to.equal(testBody1 + testBody2);
			
			});
		
		});
		it('should return Promise resolved with a string concatenated from contentString and cached results if all urls have cached strings and contentString is a string', function() {
		
			var testUrls = ['https://www.chadacarino.com/css/singlepage.css', 'https://www.chadacarino.com/css/darkmode.css'];
			var testBody1 = 'body {background: #333;color: #ddd}';
			var testBody2 = 'body.darkmode {background: #000; color: #ccc}';
			var testContentString = 'body {font-family: monospace}';
			consoleHtml.cache.set(testUrls[0], testBody1);
			consoleHtml.cache.set(testUrls[1], testBody2);
			return expect(consoleHtml.getRemoteResources(testUrls, testContentString)).to.eventually.be.fulfilled.then((content) => {
			
				consoleHtml.cache.flushAll();
				expect(content).to.equal(testContentString + testBody1 + testBody2);
			
			});
		
		});
		it('should return Promise resolved with a string concatenated from retrieved results, caching all results, if no urls have cached strings, all remote content is loaded successfully, and contentString is not a string', function() {
		
			var testUrl1 = 'https://www.chadacarino.com/css/singlepage.css';
			var testUrl2 = 'https://www.chadacarino.com/css/darkmode.css';
			var testUrls = [testUrl1, testUrl2];
			var testBody1 = 'body {background: #333;color: #ddd}';
			var testBody2 = 'body.darkmode {background: #000; color: #ccc}';
			requestGetStub.onCall(0).returns(Promise.resolve(testBody1));
			requestGetStub.onCall(1).returns(Promise.resolve(testBody2));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrls)).to.eventually.be.fulfilled.then((content) => {
			
				expect(consoleHtml.cache.get(testUrl1)).to.equal(testBody1);
				expect(consoleHtml.cache.get(testUrl2)).to.equal(testBody2);
				consoleHtml.cache.flushAll();
				expect(content).to.equal(testBody1 + testBody2);
			
			});
		
		});
		it('should return Promise resolved with a string concatenated from contentString and retrieved results, caching all results, if no urls have cached strings, all remote content is loaded successfully, and contentString is a string', function() {
		
			var testUrl1 = 'https://www.chadacarino.com/css/singlepage.css';
			var testUrl2 = 'https://www.chadacarino.com/css/darkmode.css';
			var testUrls = [testUrl1, testUrl2];
			var testBody1 = 'body {background: #333;color: #ddd}';
			var testBody2 = 'body.darkmode {background: #000; color: #ccc}';
			var testContentString = 'body {font-family: monospace}';
			requestGetStub.onCall(0).returns(Promise.resolve(testBody1));
			requestGetStub.onCall(1).returns(Promise.resolve(testBody2));
			consoleHtml.cache.flushAll();
			return expect(consoleHtml.getRemoteResources(testUrls, testContentString)).to.eventually.be.fulfilled.then((content) => {
			
				expect(consoleHtml.cache.get(testUrl1)).to.equal(testBody1);
				expect(consoleHtml.cache.get(testUrl2)).to.equal(testBody2);
				consoleHtml.cache.flushAll();
				expect(content).to.equal(testContentString + testBody1 + testBody2);
			
			});
		
		});
	
	});
	describe('pullHeadElements(jqObj, type)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.pullHeadElements).to.be.a('function');
		
		});
		it('should return a TypeError in a rejected Promise if jqObj is not a function', function(done) {
		
			consoleHtml.pullHeadElements(null, 'style').then((result) => {
			
				expect(result).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid jqObj passed to pullHeadElements');
				done();
			
			}).catch((error) => {
			
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid jqObj passed to pullHeadElements');
				done();
			
			});
		
		});
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
