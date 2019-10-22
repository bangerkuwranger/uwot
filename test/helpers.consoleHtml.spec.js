const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;
const chaiAsPromised = require("chai-as-promised");
chai.use(chaiAsPromised);
const cheerio = require('cheerio');
const request = require('request-promise-native');
const path = require('path');
const globalSetupHelper = require('../helpers/globalSetup');

var consoleHtml = require('../helpers/consoleHtml');
const getTestHtmlString = function() {

	return '<html><head><title>the pull of the past is the pall over us</title><meta name="description" content="art. software. music. a general sense of unease."><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="194x194" href="/favicon-194x194.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=BG76j6NvbJ"><link rel="manifest" href="/site.webmanifest?v=BG76j6NvbJ"><link rel="mask-icon" href="/safari-pinned-tab.svg?v=BG76j6NvbJ" color="#ff0000"><link rel="shortcut icon" href="/favicon.ico?v=BG76j6NvbJ"><meta name="msapplication-TileColor" content="#979797"><meta name="theme-color" content="#ffffff"><link rel="stylesheet" href="https://www.chadacarino.com/css/singlepage.css?v=2"><link rel="stylesheet" href="https://www.chadacarino.com/css/font-cacscribbles.css"><style type="text/css">body {font-family: cAcScribbles, "Lucida Console", "Lucida Sans Typewriter", monaco, "Bitstream Vera Sans Mono", monospace;}h6 { text-transform: uppercase;}</style><script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script></head><body><div class="page page-comingsoon"><h1>i\'m working on it; leave me be.</h1><img src="https://www.chadacarino.com/images/caclogov2.png" alt="C. A. C." style="max-width: 320px; height: auto;"><h6><a id="normalLink" href="https://github.com/bangerkuwranger">visit me on github</a></h6></div><ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li></ul><p><a id="spawnLink" href="https://www.chadacarino.com/" target="_blank">spawn</a></p><p><a id="nothingLink" href="#!" target="_self" onClick="console.log(\'nothing done.\')">do nothing</a></p><p><a id="takeoverLink" href="https://www.chadacarino.com/" target="_parent">take over</a></p></body></html>';

};

const getTestCliHtmlString = function() {

	return '<html><head><title>the pull of the past is the pall over us</title><meta name="description" content="art. software. music. a general sense of unease."><meta name="application-name" content="uwotCli"><link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="194x194" href="/favicon-194x194.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="192x192" href="/android-chrome-192x192.png?v=BG76j6NvbJ"><link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png?v=BG76j6NvbJ"><link rel="manifest" href="/site.webmanifest?v=BG76j6NvbJ"><link rel="mask-icon" href="/safari-pinned-tab.svg?v=BG76j6NvbJ" color="#ff0000"><link rel="shortcut icon" href="/favicon.ico?v=BG76j6NvbJ"><meta name="msapplication-TileColor" content="#979797"><meta name="theme-color" content="#ffffff"><link rel="stylesheet" href="https://www.chadacarino.com/css/singlepage.css?v=2"><link rel="stylesheet" href="https://www.chadacarino.com/css/font-cacscribbles.css"><style type="text/css">body {font-family: cAcScribbles, "Lucida Console", "Lucida Sans Typewriter", monaco, "Bitstream Vera Sans Mono", monospace;}h6 { text-transform: uppercase;}</style><script type="text/javascript" src="https://ajax.googleapis.com/ajax/libs/webfont/1.6.26/webfont.js"></script></head><body><div class="page page-comingsoon"><h1>i\'m working on it; leave me be.</h1><img src="https://www.chadacarino.com/images/caclogov2.png" alt="C. A. C." style="max-width: 320px; height: auto;"><h6><a id="normalLink" href="https://github.com/bangerkuwranger">visit me on github</a></h6></div><ul id="fruits"><li class="apple">Apple</li><li class="orange">Orange</li><li class="pear">Pear</li></ul><p><a id="spawnLink" href="https://www.chadacarino.com/" target="_blank">spawn</a></p><p><a id="nothingLink" href="#!" target="_self" onClick="console.log(\'nothing done.\')">do nothing</a></p><p><a id="takeoverLink" href="https://www.chadacarino.com/" target="_parent">take over</a></p></body></html>';

};


var testInString, testObj, testOutString;
var testCliInString, testCliObj, testCliOutString;
var testCliOpenTag = '<div id="uwotBrowseHtml" class="uwotCli-html">';
var testOpenTag = '<div id="uwotBrowseHtml" class="uwotGui-html">';

describe('consoleHtml.js', function() {

	before(function() {
	
		if ('object' !== typeof global.Uwot || null === global.Uwot) {
		
			globalSetupHelper.initGlobalObjects();
		
		}
		if ('object' !== global.Uwot.Constants || null === global.Uwot.Constants || 'string' !== typeof global.Uwot.Constants.appRoot) {
		
			globalSetupHelper.initConstants();
		
		}
		if ('object' !== global.Uwot.Config || null === global.Uwot.Config) {
		
			var Config = require('../config');
			if ("development" !== global.process.env.NODE_ENV) {

				configPath = path.resolve(global.Uwot.Constants.etcProd, 'config.json');

			}
			else {

				configPath = path.resolve(global.Uwot.Constants.etcDev, 'config.json');

			}

			// init global objects with instances of app classes
			global.Uwot.Config = new Config(configPath);
		
		}
	
	});
	beforeEach(function() {
	
		testInString = getTestHtmlString();
		testObj = cheerio.load(testInString);
		testOutString = testObj('body').html();
		testCliInString = getTestCliHtmlString();
		testCliObj = cheerio.load(testCliInString);
		testCliOutString = testObj('body').html();
	
	});
	describe('getAsJQuery(htmlString)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.getAsJQuery).to.be.a('function');
		
		});
		it('should throw a TypeError if htmlString arg value is not a string', function() {
		
			expect(consoleHtml.getAsJQuery).to.throw(TypeError, 'invalid htmlString passed to getAsJQuery');
		
		});
		it('should return a cheerio object if htmlString arg value is a string', function() {
		
			var $ = consoleHtml.getAsJQuery(testInString);
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
		it('should return the html of the unchanged jqObj body if there are no "a" tags in the markup', function() {
		
			testObj('a').replaceWith('');
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			expect(testResults).to.equal(testObj('body').html());
		
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
		it('should add the class "uwot-console-link", an attribute "data-link-num" that is an integer, and add an onclick attribute calling "uwotConsoleGoto" to any links that do not have an onclick attribute and do not have a target attribute of "_blank"', function() {
		
			var testResults = consoleHtml.makeConsoleHtml(testObj);
			var resultObj = cheerio.load(testResults);
			var normalLinkHtml = resultObj.html('#normalLink');
			var takeoverLinkHtml = resultObj.html('#takeoverLink');
			expect(normalLinkHtml).to.equal('<a id="normalLink" href="https://github.com/bangerkuwranger" class="uwot-console-link" data-link-num="0" onclick="uwotConsoleGoto(&quot;https://github.com/bangerkuwranger&quot;)">visit me on github</a>');
			expect(takeoverLinkHtml).to.equal('<a id="takeoverLink" href="https://www.chadacarino.com/" target="_parent" class="uwot-console-link" data-link-num="3" onclick="uwotConsoleGoto(&quot;https://www.chadacarino.com/&quot;)">take over</a>');
		
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
	
		var getRemoteResourcesStub;
		beforeEach('stub out getRemoteResources', function() {
		
			getRemoteResourcesStub = sinon.stub(consoleHtml, 'getRemoteResources');
		
		});
		afterEach('restore stub', function() {
		
			getRemoteResourcesStub.restore();
		
		});
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
		it('should set type to style if type arg is not a string or not "script"', function() {
		
			var testHtml = '<html><head><link rel="stylesheet" href="localtest.css" /></head><body><p>test body</p</body></html>';
			var testHtmlObj = cheerio.load(testHtml);
			var testBody = 'body {background: #333;color: #ddd}';
			getRemoteResourcesStub.returns(Promise.resolve(testBody));
			return expect(consoleHtml.pullHeadElements(testHtmlObj)).to.eventually.be.fulfilled.then((resultTypeUndefined) => {
			
				expect(resultTypeUndefined).to.equal('<style type="text/css">' + testBody + '</style>');
				return expect(consoleHtml.pullHeadElements(testHtmlObj, 'invalidValue')).to.eventually.equal('<style type="text/css">' + testBody + '</style>');
			
			});
		
		});
		it('should return a Promise resolved with an empty string if there are no matching elements', function() {
		
			var testHtml = '<html><head></head><body><p>test body</p</body></html>';
			var testHtmlObj = cheerio.load(testHtml);
			var testBody = 'body {background: #333;color: #ddd}';
			getRemoteResourcesStub.returns(Promise.resolve(testBody));
			return expect(consoleHtml.pullHeadElements(testHtmlObj)).to.eventually.equal('');
		
		});
		it('should wrap returned results with a style tag, and limit results to the targets of link tags inside head with rel attr "stylesheet" and non-empty string href attr value if type is not "script"', function() {
			var headLinks = testObj('head > link');
			var matchedLinks = [];
			headLinks.each(function(i, thisLink) {
			
				if (testObj(thisLink).attr('rel') === 'stylesheet' && 'string' === typeof testObj(thisLink).attr('href') && '' !== testObj(thisLink).attr('href')) {
	
					matchedLinks.push(thisLink);
	
				}
			
			});
			testObj('head').append('<link rel="stylesheet" id="noHrefLink" /><link rel="stylesheet" href="" id="emptyHrefLink" /><link rel="css" href="nonono" id="notStylesheetRel" />');
			getRemoteResourcesStub.callsFake(function returnArrayLength(urlArray) {
			
				return Promise.resolve(urlArray.length);
			
			});
			return expect(consoleHtml.pullHeadElements(testObj), 'style').to.eventually.equal('<style type="text/css">' + matchedLinks.length + '</style>');
		
		});
		it('should wrap returned results with a script tag, and limit results to the targets of script tags in head with type attr "text/javascript" and non-empty string without "jquery.min.js" in it as value of src attr if type is "script"', function() {
			var headScripts = testObj('head > script');
			var matchedScripts = [];
			headScripts.each(function(i, thisScript) {
			
				if (testObj(thisScript).attr('type') === 'text/javascript' && 'string' === typeof testObj(thisScript).attr('src') && '' !== testObj(thisScript).attr('src') && -1 === testObj(thisScript).attr('src').indexOf('jquery.min.js')) {
	
					matchedScripts.push(thisScript);
	
				}
			
			});
			testObj('head').append('<script type="text/javascript" id="noSrcScript"></script><script rel="text/javascript" src="" id="emptySrcScript"></script><script type="js" src="nonono" id="notTextJsType"></script><script type="text/javascript" id="jQueryScript" src="//somecdn.com/jquery.min.js"></script>');
			getRemoteResourcesStub.callsFake(function returnArrayLength(urlArray) {
			
				return Promise.resolve(urlArray.length);
			
			});
			return expect(consoleHtml.pullHeadElements(testObj, 'script')).to.eventually.equal('<script type="text/javascript">' + matchedScripts.length + '</script>');
		
		});
		it('should return a Promise rejected with an Error if getRemoteResources returns a rejected Promise', function() {
		
			getRemoteResourcesStub.returns(Promise.reject('test getRemoteResources rejection'))
			return expect(consoleHtml.pullHeadElements(testObj, 'style')).to.eventually.be.rejectedWith('test getRemoteResources rejection');
		
		});
		
	
	});
	describe('loadForConsole(htmlString, callback)', function() {
	
		it('should be a function', function() {
		
			expect(consoleHtml.loadForConsole).to.be.a('function');
		
		});
		it('should throw a TypeError if callback is not a function', function() {
		
			expect(consoleHtml.loadForConsole).to.throw(TypeError, 'invalid callback passed to loadForConsole');
		
		});
		it('should return a TypeError to callback if htmlString is not a string', function(done) {
		
			consoleHtml.loadForConsole(null, function(error, result) {
			
				expect(result).to.be.null;
				expect(error).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid htmlString passed to loadForConsole');
				done();
			
			});
		
		});
		it('should return an error to callback if getAsJQuery throws an error', function(done) {
		
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').throws(new Error('test getAsJQuery error'));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.be.null;
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test getAsJQuery error');
				getAsJQueryStub.restore();
				done();
			
			});
		
		});
		it('should return an error to callback if makeConsoleHtml throws an error', function(done) {
		
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testCliObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').throws(new Error('test makeConsoleHtml error'));
			consoleHtml.loadForConsole(testCliInString, function(error, result) {
			
				expect(result).to.be.null;
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test makeConsoleHtml error');
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				done();
			
			});
		
		});
		it('should return an error as first callback arg and parsed body html as second html arg if pullHeadElements for styles returns a rejected Promise', function(done) {
		
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.reject(new Error('test styles pullHeadElements rejection')));
			pullHeadElementsStub.onCall(1).returns(Promise.resolve('<script type="text/javascript">console.log("it is a script");</script>'));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(testOutString);
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test styles pullHeadElements rejection');
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
		it('should return an error as first callback arg and parsed body html as second html arg if pullHeadElements for scripts returns a rejected Promise', function(done) {
		
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.resolve('<style type="text/css">.styled {width: auto;}</style>'));
			pullHeadElementsStub.onCall(1).returns(Promise.reject(new Error('test styles pullHeadElements rejection')));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(testOutString);
				expect(error).to.be.an.instanceof(Error).with.property('message').that.equals('test styles pullHeadElements rejection');
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
		it('should return the final html string with the style tag prepended if pullHeadElements for styles returns a Promise resolved with a non-empty string', function(done) {
		
			var finalHtml = testOpenTag + '<style type="text/css">.styled {width: auto;}</style>' + testOutString + '</div>';
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.resolve('<style type="text/css">.styled {width: auto;}</style>'));
			pullHeadElementsStub.onCall(1).returns(Promise.resolve(''));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(finalHtml);
				expect(error).to.be.false;
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
		it('should return the final html string with the script tag prepended if pullHeadElements for scripts returns a Promise resolved with a non-empty string', function(done) {
		
			var finalHtml = testOpenTag + '<script type="text/javascript">console.log("it is a script");</script>' + testOutString + '</div>';
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.resolve(''));
			pullHeadElementsStub.onCall(1).returns(Promise.resolve('<script type="text/javascript">console.log("it is a script");</script>'));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(finalHtml);
				expect(error).to.be.false;
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
		it('should return the final html string with the style and script tags prepended if pullHeadElements for styles and scripts return Promises resolved with non-empty strings', function(done) {
		
			var finalHtml = testOpenTag + '<style type="text/css">.styled {width: auto;}</style>' + '<script type="text/javascript">console.log("it is a script");</script>' + testOutString + '</div>';
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.resolve('<style type="text/css">.styled {width: auto;}</style>'));
			pullHeadElementsStub.onCall(1).returns(Promise.resolve('<script type="text/javascript">console.log("it is a script");</script>'));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(finalHtml);
				expect(error).to.be.false;
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
		it('should return the final html string with no tag prepended if pullHeadElements for styles and scripts return Promises resolved with empty strings', function(done) {
		
			var getAsJQueryStub = sinon.stub(consoleHtml, 'getAsJQuery').returns(testObj);
			var makeConsoleHtmlStub = sinon.stub(consoleHtml, 'makeConsoleHtml').returns(testOutString);
			var pullHeadElementsStub = sinon.stub(consoleHtml, 'pullHeadElements');
			pullHeadElementsStub.onCall(0).returns(Promise.resolve(''));
			pullHeadElementsStub.onCall(1).returns(Promise.resolve(''));
			consoleHtml.loadForConsole(testInString, function(error, result) {
			
				expect(result).to.equal(testOpenTag + testOutString + '</div>');
				expect(error).to.be.false;
				getAsJQueryStub.restore();
				makeConsoleHtmlStub.restore();
				pullHeadElementsStub.restore();
				done();
			
			});
		
		});
	
	});

});
