const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs-extra');
var path = require('path');
var sass = require('sass');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var sassCompiler;

const getTestArgs = function() {

	return {
		file: "public/scss/test.scss",
		includePaths: [
			"public/scss/_partial",
			"public/scss/_partial/compass",
			"public/scss/theme"
		],
		linefeed: "lf",
		omitSourceMapUrl: false,
		outFile: "public/css/test.css",
		outputStyle: "expanded",
		sourceMap: true,
	};

};

const getTestRender = function() {

	return {
		css: Buffer.from(`body #uwot {${sassCompiler.ENV_SPEC.EOL}  color: white;${sassCompiler.ENV_SPEC.EOL}  background-color: black;${sassCompiler.ENV_SPEC.EOL}}${sassCompiler.ENV_SPEC.EOL}${sassCompiler.ENV_SPEC.EOL}/*# sourceMappingURL=test.css.map */`),
		map: Buffer.from('{"version":3,"sourceRoot":"","sources":["stdin"],"names":[],"mappings":"AAAM;EAAO;EAAa","file":"test.css"}'),
		stats: {
			"entry": "file",
			"start": 1565190327053,
			"end": 1565190327103,
			"duration": 50,
			"includedFiles": []
		}
	};

};

const getTestRenderFile = function() {

	var argsObj = getTestArgs();
	return {
		source: argsObj.file,
		devMode: argsObj.outputStyle === 'expanded',
		cssFile: argsObj.outFile,
		mapFile: argsObj.outFile + '.map',
		errors: []
	};

};

describe('sassCompiler.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		sassCompiler = require('../helpers/sassCompiler');
	
	});
	describe('getArgs(filePath)', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.getArgs).to.be.a('function');
		
		});
		it('should return an object', function() {
		
			var testPath = 'test';
			expect(sassCompiler.getArgs(testPath)).to.be.an('object');
		
		});
		it('should throw an Error if filePath is not a string', function() {
		
			expect(sassCompiler.getArgs).to.throw(Error, 'invalid filePath passed to getArgs');
		
		});
		it('should return an object with a file property that is a string describing a path from system root to public/scss/[filepath].scss', function() {
		
			var testPath = 'test';
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('file').that.contains(`public/scss/${testPath}.scss`);
		
		});
		it('should return an object with an outputStyle property that is "expanded" if global.process.env.NODE_ENV is "development"', function() {
		
			var testPath = 'test';
			const currentIsDev = sassCompiler.ENV_SPEC.isDev;
			sassCompiler.ENV_SPEC.isDev = true;
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('outputStyle').that.equals('expanded');
			sassCompiler.ENV_SPEC.isDev = currentIsDev;
		
		});
		it('should return an object with an outputStyle property that is "compressed" if global.process.env.NODE_ENV is not "development"', function() {
		
			var testPath = 'test';
			const currentIsDev = sassCompiler.ENV_SPEC.isDev;
			sassCompiler.ENV_SPEC.isDev = false;
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('outputStyle').that.equals('compressed');
			sassCompiler.ENV_SPEC.isDev = currentIsDev;
		
		});
		it('should return an object with an includePaths property that is an array containing strings with absolute paths to public/scss/_partial, public//scss/_partial/compass, and public/scss/theme', function() {
		
			var testPath = 'test';
			var testResult = sassCompiler.getArgs(testPath);
			expect(testResult).to.be.an('object').with.property('includePaths').that.is.an('array');
			expect(testResult.includePaths).to.contain(`${global.Uwot.Constants.appRoot}/public/scss/_partial`);
			expect(testResult.includePaths).to.contain(`${global.Uwot.Constants.appRoot}/public/scss/_partial/compass`);
			expect(testResult.includePaths).to.contain(`${global.Uwot.Constants.appRoot}/public/scss/theme`);
		
		});
		it('should return an object with a linefeed property that equals "crlf" if os.EOL is a carriage return then a linefeed', function() {
		
			var testPath = 'test';
			const currentEOL = sassCompiler.ENV_SPEC.EOL;
			sassCompiler.ENV_SPEC.EOL = "\r\n";
			var testResult = sassCompiler.getArgs(testPath);
			expect(testResult).to.be.an('object').with.property('linefeed').that.equals('crlf');
			sassCompiler.ENV_SPEC.EOL = currentEOL;
		
		});
		it('should return an object with a linefeed property that equals "cr" if os.EOL is a carriage return', function() {
		
			var testPath = 'test';
			const currentEOL = sassCompiler.ENV_SPEC.EOL;
			sassCompiler.ENV_SPEC.EOL = "\r";
			var testResult = sassCompiler.getArgs(testPath);
			expect(testResult).to.be.an('object').with.property('linefeed').that.equals('cr');
			sassCompiler.ENV_SPEC.EOL = currentEOL;
		
		});
		it('should return an object with a linefeed property that equals "lfcr" if os.EOL is a linefeed then a carriage return', function() {
		
			var testPath = 'test';
			const currentEOL = sassCompiler.ENV_SPEC.EOL;
			sassCompiler.ENV_SPEC.EOL = "\n\r";
			var testResult = sassCompiler.getArgs(testPath);
			expect(testResult).to.be.an('object').with.property('linefeed').that.equals('lfcr');
			sassCompiler.ENV_SPEC.EOL = currentEOL;
		
		});
		it('should return an object with a linefeed property that equals "lf" if os.EOL is a linefeed', function() {
		
			var testPath = 'test';
			const currentEOL = sassCompiler.ENV_SPEC.EOL;
			sassCompiler.ENV_SPEC.EOL = "\n";
			var testResult = sassCompiler.getArgs(testPath);
			expect(testResult).to.be.an('object').with.property('linefeed').that.equals('lf');
			sassCompiler.ENV_SPEC.EOL = currentEOL;
		
		});
		it('should return an object with an omitSourceMapUrl property that is false if global.process.env.NODE_ENV is "development"', function() {
		
			var testPath = 'test';
			const currentIsDev = sassCompiler.ENV_SPEC.isDev;
			sassCompiler.ENV_SPEC.isDev = true;
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('omitSourceMapUrl').that.is.false;
			sassCompiler.ENV_SPEC.isDev = currentIsDev;
		
		});
		it('should return an object with an omitSourceMapUrl property that is true if global.process.env.NODE_ENV is not "development"', function() {
		
			var testPath = 'test';
			const currentIsDev = sassCompiler.ENV_SPEC.isDev;
			sassCompiler.ENV_SPEC.isDev = false;
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('omitSourceMapUrl').that.is.true;
			sassCompiler.ENV_SPEC.isDev = currentIsDev;
		
		});
		it('should return an object with an outFile property that is a string describing a path from system root to public/css/[filepath].css', function() {
		
			var testPath = 'test';
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('outFile').that.equals(`/Users/ccarino/wot/public/css/${testPath}.css`);
		
		});
		it('should return an object with a sourceMap property that is true', function() {
		
			var testPath = 'test';
			expect(sassCompiler.getArgs(testPath)).to.be.an('object').with.property('sourceMap').that.is.true;
		
		});
	
	});
	describe('renderFile(filePath)', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderFile).to.be.a('function');
		
		});
		it('should return an object with a string source property and an Array errors property', function() {
		
			var testPath = 'test';
			var testResult = sassCompiler.renderFile();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult).to.be.an('object').with.property('source').that.is.a('string');
		
		});
		it('should assign value of filePath arg to the source property, and an array with an error to the errors property, then immediately return if getArgs(filePath) throws an error', function() {
		
			var testPath = 'test';
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').throws(new Error('test getArgs error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test getArgs error');
			expect(testResult.source).to.equal(testPath);
			getArgsStub.restore();
		
		});
		it('should assign args.file value to the source property of the returned object if getArgs does not throw an error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.source).to.equal(testArgs.file);
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should assign true to the devMode property of the returned object if getArgs does not throw an error and args.outputStyle is "expanded"', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			testArgs.outputStyle = 'expanded';
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.devMode).to.be.true;
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should assign false to the devMode property of the returned object if getArgs does not throw an error and args.outputStyle is "compressed"', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			testArgs.outputStyle = 'compressed';
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.devMode).to.be.false;
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should assign the value of args.outFile to the cssFile property of the returned object if getArgs does not throw an error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.cssFile).to.equal(testArgs.outFile);
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should assign the value of args.outFile + ".map" to the mapFile property of the returned object if getArgs does not throw an error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.mapFile).to.equal(`${testArgs.outFile}.map`);
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should call sass.renderSync with the result of getArgs(filePath) to compile the SCSS to a CSS and source map', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(sassRenderSyncStub.calledWith(testArgs)).to.be.true;
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should add an Error with a message containing "rendering {filePath} failed." to the errors property array of the returned object and immediately return if sass.renderSync throws an Error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').throws(new Error('thrown test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.contains('thrown test renderSync Error');
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should add an Error with a message containing "rendering {filePath} failed." to the errors property array of the returned object and immediately return if sass.renderSync returns an Error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(new Error('returned test renderSync Error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.contains('returned test renderSync Error');
			getArgsStub.restore();
			sassRenderSyncStub.restore();
		
		});
		it('should call fs.outputFileSync with args.outFile and value of css property resulting from sass.renderSync as args if sass.renderSync completes without error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var testRender = getTestRender();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(testRender);
			var outputFileSyncStub = sinon.stub(fs, 'outputFileSync').returns(true);
			var testResult = sassCompiler.renderFile(testPath);
			expect(outputFileSyncStub.getCall(0).args[0]).to.equal(testArgs.outFile);
			expect(outputFileSyncStub.getCall(0).args[1]).to.equal(testRender.css);
			getArgsStub.restore();
			sassRenderSyncStub.restore();
			outputFileSyncStub.restore();
		
		});
		it('should add an Error with message containing "writing css for [filePath] failed." to errors property array of returned object if fs.outputFileSync for the css file throws an error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var testRender = getTestRender();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(testRender);
			var outputFileSyncStub = sinon.stub(fs, 'outputFileSync');
			outputFileSyncStub.onCall(0).throws(new Error('test css write error'));
			outputFileSyncStub.onCall(1).returns(true);
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.contains('test css write error');
			getArgsStub.restore();
			sassRenderSyncStub.restore();
			outputFileSyncStub.restore();
		
		});
		it('should call fs.outputFileSync with args.outFile + ".map" and value of map property resulting from sass.renderSync as args', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var testRender = getTestRender();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(testRender);
			var outputFileSyncStub = sinon.stub(fs, 'outputFileSync').returns(true);
			var testResult = sassCompiler.renderFile(testPath);
			expect(outputFileSyncStub.getCall(1).args[0]).to.equal(`${testArgs.outFile}.map`);
			expect(outputFileSyncStub.getCall(1).args[1]).to.equal(testRender.map);
			getArgsStub.restore();
			sassRenderSyncStub.restore();
			outputFileSyncStub.restore();
		
		});
		it('should add an Error with message containing "writing source map for [filePath] failed." to errors property array of returned object if fs.outputFileSync for the source map file throws an error', function() {
		
			var testPath = 'test';
			var testArgs = getTestArgs();
			var testRender = getTestRender();
			var getArgsStub = sinon.stub(sassCompiler, 'getArgs').returns(testArgs);
			var sassRenderSyncStub = sinon.stub(sass, 'renderSync').returns(testRender);
			var outputFileSyncStub = sinon.stub(fs, 'outputFileSync');
			outputFileSyncStub.onCall(0).returns(true);
			outputFileSyncStub.onCall(1).throws(new Error('test source map write error'));
			var testResult = sassCompiler.renderFile(testPath);
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.contains('test source map write error');
			getArgsStub.restore();
			sassRenderSyncStub.restore();
			outputFileSyncStub.restore();
		
		});
	
	});
	describe('renderMainStyle()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderMainStyle).to.be.a('function');
		
		});
		it('should return an object with array properties "processed" and "errors"', function() {
		
			var testRenderFile = getTestRenderFile();
			testRenderFile.source = "public/scss/style.scss";
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').returns(testRenderFile);
			var testResult = sassCompiler.renderMainStyle();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array');
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			renderFileStub.restore();
		
		});
		it('should call renderFile("style")', function() {
		
			var testRenderFile = getTestRenderFile();
			testRenderFile.source = "public/scss/style.scss";
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').returns(testRenderFile);
			var testResult = sassCompiler.renderMainStyle();
			expect(renderFileStub.calledWith('style')).to.be.true;
			renderFileStub.restore();
		
		});
		it('should add any errors in errors property array of object returned from calling renderFile to the errors property of returned object', function() {
		
			var testRenderFile = getTestRenderFile();
			testRenderFile.source = "public/scss/style.scss";
			testRenderFile.errors.push(new Error('test renderFile error'));
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').returns(testRenderFile);
			var testResult = sassCompiler.renderMainStyle();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderFile error');
			renderFileStub.restore();
		
		});
		it('should add the result of calling renderFile, with the errors property removed, to the processed property array of the returned object', function() {
		
			var testRenderFile = getTestRenderFile();
			testRenderFile.source = "public/scss/style.scss";
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').returns(testRenderFile);
			var testResult = sassCompiler.renderMainStyle();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array');
			expect(testResult.processed[0]).to.be.an('object').with.property('source').that.equals(testRenderFile.source);
			expect(testResult.processed[0]).to.be.an('object').with.property('devMode').that.equals(sassCompiler.ENV_SPEC.isDev);
			expect(testResult.processed[0]).to.be.an('object').with.property('cssFile').that.equals(testRenderFile.cssFile);
			expect(testResult.processed[0]).to.be.an('object').with.property('mapFile').that.equals(testRenderFile.mapFile);
			expect(testResult.processed[0].errors).to.be.undefined;
			renderFileStub.restore();
		
		});
	
	});
	describe('renderLocalThemes()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderLocalThemes).to.be.a('function');
		
		});
		it('should return an object with array properties "processed" and "errors"');
		it('should call fs.readdirSync with an absolute path to public/scss/theme');
		it('should add an Error to the errors property array of the returned object and return immediately if the fs.readdirSync call throws an error');
		it('should return with empty array values for the processed and errors properties if the theme dir is empty (fs.readdirSync returns an empty array without error)');
		it('should loop through every value in array returned by fs.readdirSync');
		it('should call fs.statSync on each value returned by fs.readdirSync');
		it('should not add values to errors or processed array properties of returned object for any value in themes dir that is not a dir');
		it('should return without adding values to errors or processed array properties of returned object if last value in themes dir is not a dir');
		it('should call fs.statSync for a file "main.scss" in each directory in themes dir');
		it('should not add values to errors or processed array properties of returned object for any value in themes dir that is not a dir containing a "main.scss" file');
		it('should return without adding values to errors or processed array properties of returned object if last value in themes dir is not a dir containing a "main.scss" file');
		it('should call renderFile("theme/{themes[i]}/main") for each directory in themes dir that has a "main.scss" file');
		it('should add any errors returned by any call to renderFile to the errors property array of returned object');
		it('should add the result of each call to renderFile, with the errors property removed, to the processed property array of the returned object');
		it('should immediately return after adding a value to the processed property array of return object if the current dir is the last item in the themes dir');
	
	});
	describe('renderExternalThemes()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderExternalThemes).to.be.a('function');
		
		});
		it('should not be implemented and should throw an Error indicating such');
	
	});
	describe('renderAll()', function() {
	
		it('should be a function', function() {
		
			expect(sassCompiler.renderAll).to.be.a('function');
		
		});
		it('should return an object with array properties "processed" and "errors"');
		it('should call renderMainStyle and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error');
		it('should add an Error to the errors property array of the returned object if renderMainStyle call throws an error');
		it('should call renderLocalThemes and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error');
		it('should add an Error to the errors property array of the returned object if renderLocalThemes call throws an error');
		it('should call renderExternalThemes and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error');
		it('should add an Error to the errors property array of the returned object if renderExternalThemes call throws an error');
	
	});

});
