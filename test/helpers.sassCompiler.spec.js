const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs-extra');
var path = require('path');
var sass = require('sass');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var sassCompiler;

describe('sassCompiler.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		sassCompiler = require('../helpers/sassCompiler');
	
	});
	describe('getArgs(filePath)', function() {
	
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
	
		it('should be a function', function() {
		
			expect(sassCompiler.renderFile).to.be.a('function');
		
		});
		it('should return an object with a string source property and an Array errors property');
		it('should assign value of filePath arg to the source property, and an array with an error to the errors property, then immediately return if getArgs(filePath) throws an error');
		it('should assign args.file value to the source property of the returned object if getArgs does not throw an error');
		it('should assign true to the devMode property of the returned object if getArgs does not throw an error and args.outputStyle is "expanded"');
		it('should assign false to the devMode property of the returned object if getArgs does not throw an error and args.outputStyle is "compressed"');
		it('should assign the value of args.outFile to the cssFile property of the returned object if getArgs does not throw an error');
		it('should assign the value of args.outFile + ".map" to the mapFile property of the returned object if getArgs does not throw an error');
		it('should call sass.renderSync with the result of getArgs(filePath) to compile the SCSS to a CSS and source map');
		it('should add an Error with a message containing "rendering {filePath} failed." to the errors property array of the returned object and immediately return if sass.renderSync returns an Error');
		it('should call fs.outputFileSync with args.outFile and value of css property resulting from sass.renderSync as args');
		it('should add an Error with message containing "writing css for [filePath] failed." to errors property array of returned object if fs.outputFileSync for the css file throws an error');
		it('should call fs.outputFileSync with args.outFile + ".map" and value of map property resulting from sass.renderSync as args');
		it('should add an Error with message containing "writing source map for [filePath] failed." to errors property array of returned object if fs.outputFileSync for the source map file throws an error');
	
	});
	describe('renderMainStyle()', function() {
	
		it('should be a function', function() {
		
			expect(sassCompiler.renderMainStyle).to.be.a('function');
		
		});
		it('should return an object with array properties "processed" and "errors"');
		it('should call renderFile("style")');
		it('should add any errors in errors property array of object returned from calling renderFile to the errors property of returned object');
		it('should add the result of calling renderFile, with the errors property removed, to the processed property array of the returned object');
	
	});
	describe('renderLocalThemes()', function() {
	
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
