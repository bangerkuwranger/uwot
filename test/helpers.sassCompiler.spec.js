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

const getTestRenderFile = function(testPth) {

	var argsObj = getTestArgs();
	if ('string' === typeof testPth) {
	
		argsObj.file = `public/scss/${testPth}.scss`;
		argsObj.outFile = `public/css/${testPth}.css`;
	
	}
	return {
		source: argsObj.file,
		devMode: argsObj.outputStyle === 'expanded',
		cssFile: argsObj.outFile,
		mapFile: argsObj.outFile + '.map',
		errors: []
	};

};

const getTestDirs = function() {

	return [
		'beard',
		'bind',
		'borg',
		'bot',
		'cac',
		'clone',
		'default'
	];

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
		it('should return an object with array properties "processed" and "errors"', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').throws(new Error('test readdirSync error'));
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array');
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			readdirSyncStub.restore();
		
		});
		it('should call fs.readdirSync with an absolute path to public/scss/theme', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').throws(new Error('test readdirSync error'));
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var testResult = sassCompiler.renderLocalThemes();
			expect(readdirSyncStub.calledWith(themeDirPath)).to.be.true;
			readdirSyncStub.restore();
		
		});
		it('should add an Error to the errors property array of the returned object and return immediately if the fs.readdirSync call throws an error', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').throws(new Error('test readdirSync error'));
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test readdirSync error');
			expect(testResult.processed).to.be.an('array').that.is.empty;
			readdirSyncStub.restore();
		
		});
		it('should return with empty array values for the processed and errors properties if the theme dir is empty (fs.readdirSync returns an empty array without error)', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.empty;
			readdirSyncStub.restore();
		
		});
		it('should loop through every value in array returned by fs.readdirSync', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			var processedThemes = testResult.processed.map((pt) => {
			
				var sourceArr = pt.source.split('/');
				return sourceArr[3];
			
			});
			expect(processedThemes).to.deep.equal(testDirs);
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should call fs.statSync on each value returned by fs.readdirSync', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			for (let i = 0; i < testDirs.length; i++) {
			
				var themePath = path.join(themeDirPath, testDirs[i]);
				expect(statSyncStub.calledWith(themePath)).to.be.true;
			
			}
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should not add values to errors or processed array properties of returned object for any value in themes dir that is not a dir', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else if ('cac' === fileName) {
				
					return {
						isDirectory: function() { return false; }
					};
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			var processedThemes = testResult.processed.map((pt) => {
			
				var sourceArr = pt.source.split('/');
				return sourceArr[3];
			
			});
			expect(processedThemes.indexOf('cac')).to.equal(-1);
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should return without adding values to errors or processed array properties of returned object if last value in themes dir is not a dir', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else if ('default' === fileName) {
				
					return {
						isDirectory: function() { return false; }
					};
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			var processedThemes = testResult.processed.map((pt) => {
			
				var sourceArr = pt.source.split('/');
				return sourceArr[3];
			
			});
			expect(processedThemes.indexOf('default')).to.equal(-1);
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should call fs.statSync for a file "main.scss" in each directory in themes dir', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			for (let i = 0; i < testDirs.length; i++) {
			
				var themeFilePath = path.join(themeDirPath, testDirs[i], 'main.scss');
				expect(statSyncStub.calledWith(themeFilePath)).to.be.true;
			
			}
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should not add values to errors or processed array properties of returned object for any value in themes dir that is not a dir containing a "main.scss" file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if ('cac/main.scss' === fileName) {
				
					throw new Error('fnf');
				
				}
				else if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			var processedThemes = testResult.processed.map((pt) => {
			
				var sourceArr = pt.source.split('/');
				return sourceArr[3];
			
			});
			expect(processedThemes.indexOf('cac')).to.equal(-1);
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should return without adding values to errors or processed array properties of returned object if last value in themes dir is not a dir containing a "main.scss" file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if ('default/main.scss' === fileName) {
				
					throw new Error('fnf');
				
				}
				else if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			var processedThemes = testResult.processed.map((pt) => {
			
				var sourceArr = pt.source.split('/');
				return sourceArr[3];
			
			});
			expect(processedThemes.indexOf('default')).to.equal(-1);
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should call renderFile("theme/{themes[i]}/main") for each directory in themes dir that has a "main.scss" file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				return getTestRenderFile(pth);
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			for (let i = 0; i < testDirs.length; i++) {
			
				expect(renderFileStub.calledWith(`theme/${testDirs[i]}/main`)).to.be.true;
			
			}
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should add any errors returned by any call to renderFile to the errors property array of returned object', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				var testRenderFile = getTestRenderFile(pth);
				if ('theme/cac/main' === pth) {
				
					testRenderFile.errors.push(new Error('test renderFile error'));
				
				}
				return testRenderFile;
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.not.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderFile error');
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should add the result of each call to renderFile, with the errors property removed, to the processed property array of the returned object', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				var testRenderFile = getTestRenderFile(pth);
				if ('theme/cac/main' === pth) {
				
					testRenderFile.errors.push(new Error('test renderFile error'));
				
				}
				return testRenderFile;
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.not.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderFile error');
			for (let i = 0; i < testDirs.length; i++) {
			
				var thisProcessed = testResult.processed[i];
				var thisDir = testDirs[i];
				expect(thisProcessed.source).to.equal(`public/scss/theme/${thisDir}/main.scss`);
			
			}
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
		it('should immediately return after adding a value to the processed property array of return object if the current dir is the last item in the themes dir', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var themeDirPath = path.join(global.Uwot.Constants.appRoot, 'public/scss/theme');
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnIsDirIfDir(pth) {
			
				var fileName = path.relative(themeDirPath, pth);
				if (testDirs.indexOf(fileName) === -1) {
				
					return true;
				
				}
				else {
				
					return {
						isDirectory: function() { return true; }
					};
				
				}
			
			});
			var renderFileStub = sinon.stub(sassCompiler, 'renderFile').callsFake(function returnResult(pth) {
			
				var testRenderFile = getTestRenderFile(pth);
				if ('theme/default/main' === pth) {
				
					testRenderFile.errors.push(new Error('test renderFile error'));
				
				}
				return testRenderFile;
			
			});
			var testResult = sassCompiler.renderLocalThemes();
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array').that.is.not.empty;
			expect(testResult.processed).to.be.an('array').that.is.not.empty;
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderFile error');
			for (let i = 0; i < testDirs.length; i++) {
			
				var thisProcessed = testResult.processed[i];
				var thisDir = testDirs[i];
				expect(thisProcessed.source).to.equal(`public/scss/theme/${thisDir}/main.scss`);
			
			}
			readdirSyncStub.restore();
			statSyncStub.restore();
			renderFileStub.restore();
		
		});
	
	});
	describe('renderExternalThemes()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderExternalThemes).to.be.a('function');
		
		});
		it('should not be implemented and should throw an Error indicating such', function() {
		
			expect(sassCompiler.renderExternalThemes).to.throw(Error, 'this function is not yet implemented');
		
		});
	
	});
	describe('renderAll()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.renderAll).to.be.a('function');
		
		});
		it('should return an object with array properties "processed" and "errors"', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [],
				errors: []
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnEmpty() {
			
				return {
					processed: [],
					errors: []
				};
			
			});
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array');
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should call renderMainStyle and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [
					testRenderFileMain
				],
				errors: [
					new Error('test renderMainStyle renderFile error')
				]
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnEmpty() {
			
				return {
					processed: [],
					errors: []
				};
			
			});
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.contains(testRenderFileMain);
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderMainStyle renderFile error');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should add an Error to the errors property array of the returned object if renderMainStyle call throws an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').throws(new Error('test renderMainStyle error'));
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnEmpty() {
			
				return {
					processed: [],
					errors: []
				};
			
			});
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.is.empty;
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderMainStyle error');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should call renderLocalThemes and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [],
				errors: []
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnProcs() {
			
				var procArr = [];
				for (let i = 0; i < testDirs.length; i++) {
			
					let procVal = getTestRenderFile(`${testDirs[i]}/main`);
					delete procVal.errors;
					procArr.push(procVal);
			
				}
				return {
					processed: procArr,
					errors: [
						new Error('test renderLocalThemes renderFile error')
					]
				};
			
			});
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.is.not.empty;
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderLocalThemes renderFile error');
			for (let i = 0; i < testDirs.length; i++) {
		
				let procSrc = `public/scss/${testDirs[i]}/main.scss`;
				expect(testResult.processed[i].source).to.equal(procSrc);
		
			}
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should add an Error to the errors property array of the returned object if renderLocalThemes call throws an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [],
				errors: []
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').throws(new Error('test renderLocalThemes error'));
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.is.empty;
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderLocalThemes error');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should call renderExternalThemes and add any values in its result property arrays, errors and processed, to the respective property arrays in the returned object if the call does not throw an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [],
				errors: []
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnEmpty() {
			
				return {
					processed: [],
					errors: []
				};
			
			});
			var extThemeResult = getTestRenderFile('ext/tacoTuesday/main');
			delete extThemeResult.errors;
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').returns({
				processed: [
					extThemeResult
				],
				errors: [
					new Error('test renderExternalThemes renderFile error')
				]
			});
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.contains(extThemeResult);
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('test renderExternalThemes renderFile error');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
		it('should add an Error to the errors property array of the returned object if renderExternalThemes call throws an error', function() {
		
			var testDirs = getTestDirs();
			var testRenderFileMain = getTestRenderFile('style');
			delete testRenderFileMain.errors;
			var renderMainStyleStub = sinon.stub(sassCompiler, 'renderMainStyle').returns({
				processed: [],
				errors: []
			});
			var renderLocalThemesStub = sinon.stub(sassCompiler, 'renderLocalThemes').callsFake(function returnEmpty() {
			
				return {
					processed: [],
					errors: []
				};
			
			});
			var renderExternalThemesStub = sinon.stub(sassCompiler, 'renderExternalThemes').throws(new Error('this function is not yet implemented'));
			var testResult = sassCompiler.renderAll();
			expect(testResult).to.be.an('object').with.property('processed').that.is.an('array').that.is.empty;
			expect(testResult).to.be.an('object').with.property('errors').that.is.an('array');
			expect(testResult.errors[0]).to.be.an.instanceof(Error).with.property('message').that.equals('this function is not yet implemented');
			renderMainStyleStub.restore();
			renderLocalThemesStub.restore();
			renderExternalThemesStub.restore();
		
		});
	
	});
	describe('listStyles()', function() {
	
		afterEach(function() {
		
			sinon.restore();
		
		});
		it('should be a function', function() {
		
			expect(sassCompiler.listStyles).to.be.a('function');
		
		});
		it('should return an object with three properties that are arrays (main, local, & external)', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.main).to.be.an('array');
			expect(testResult.local).to.be.an('array');
			expect(testResult.external).to.be.an('array');
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should return a single element in the main array with string properties "name" and "location"', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.main).to.be.an('array');
			expect(testResult.main[0]).to.be.an('object').with.property('name').that.is.a('string');
			expect(testResult.main[0]).to.be.an('object').with.property('location').that.is.a('string');
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should include a status property in the single main array element object that contains "compiled" if the css file exists', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMain(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.main).to.be.an('array');
			expect(testResult.main[0]).to.be.an('object').with.property('status').that.contains('compiled ');
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should include a status property in the single main array element object that contains "NOT COMPILED" if the css file does not exist', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.main).to.be.an('array');
			expect(testResult.main[0]).to.be.an('object').with.property('status').that.equals('NOT COMPILED');
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should return an empty array for local if there are no themes in the local theme directory', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.local).to.be.an('array').that.is.empty;
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should always return an empty array for external since the external theme function is not yet implemented', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns([]);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.external).to.be.an('array').that.is.empty;
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should add an errors property that is an array containing an error to the return object if readdir called with the local theme directory throws an error', function() {
		
			var testReaddirSyncError = new Error('test readdirSync error');
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').throws(testReaddirSyncError);
			var statSyncStub = sinon.stub(fs, 'statSync').throws(new Error('test statSync error'));
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.errors).to.be.an('array').that.contains(testReaddirSyncError);
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should loop through all of the themes in the local theme directory if it is not empty and there are valid theme directories within', function() {
		
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(getTestDirs());
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMainorLocalScss(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				else if (pth.indexOf('main.scss') > -1) {
				
					return true;
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object');
			expect(testResult.local.length).to.equal(getTestDirs().length);
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should add an object as an element to the local array property of the returned object that contains a name property equal to the directory name and a location property with a relative path to the scss file from the application root for each directory in the local theme directory that contains a main.scss file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMainorLocalScss(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				else if (pth.indexOf('main.scss') > -1) {
				
					return true;
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object').with.property('local').that.is.an('array');
			expect(testResult.local.length).to.equal(getTestDirs().length);
			var i = 0;
			testDirs.forEach((dirName) => {
			
				expect(testResult.local[i]).to.be.an('object').with.property('name').that.equals(dirName);
				expect(testResult.local[i]).to.be.an('object').with.property('location').that.equals('public/scss/theme/' + dirName + '/main.scss');
				i++;
			
			});
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should add an object as an element to the local array property of the returned object that contains a status property that contains "compile" for each directory in the local theme directory that contains a main.scss file that has an extant corresponding css file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMainorLocalScss(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				else if (pth.indexOf('main.scss') > -1) {
				
					return true;
				
				}
				else if (pth.indexOf('main.css') > -1) {
				
					return {
						mtime: new Date()
					};
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object').with.property('local').that.is.an('array');
			expect(testResult.local.length).to.equal(getTestDirs().length);
			var i = 0;
			testDirs.forEach((dirName) => {
			
				expect(testResult.local[i]).to.be.an('object').with.property('status').that.contains('compiled ');
				i++;
			
			});
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should add an object as an element to the local array property of the returned object that contains a status property that contains "NOT COMPILED" for each directory in the local theme directory that contains a main.scss file that does not have an extant corresponding css file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMainorLocalScss(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				else if (pth.indexOf('main.scss') > -1) {
				
					return true;
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object').with.property('local').that.is.an('array');
			expect(testResult.local.length).to.equal(getTestDirs().length);
			var i = 0;
			testDirs.forEach((dirName) => {
			
				expect(testResult.local[i]).to.be.an('object').with.property('status').that.equals('NOT COMPILED');
				i++;
			
			});
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
		it('should not add an element to the local array property of the returned object for any item in the local theme directory that is not a directory containing a main.scss file', function() {
		
			var testDirs = getTestDirs();
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(testDirs);
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function errorUnlessMainorLocalScss(pth) {
			
				if(pth.indexOf('public/css/style.css') > -1) {
				
					return {
						mtime: new Date()
					}
				
				}
				else if (pth.indexOf('default/main.scss') > -1) {
				
					return true;
				
				}
				else if (pth.indexOf('default') > -1) {
				
					return {
						mtime: new Date()
					};
				
				}
				throw new Error('test statSync error');
				
			});
			var testResult = sassCompiler.listStyles();
			expect(testResult).to.be.an('object').with.property('local').that.is.an('array');
			expect(testResult.local.length).to.equal(1);
			readdirSyncStub.restore();
			statSyncStub.restore();
		
		});
	
	});

});
