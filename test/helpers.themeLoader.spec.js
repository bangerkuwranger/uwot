const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs-extra');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var themeLoader = require('../helpers/themeLoader');

describe('themeLoader.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		globalSetupHelper.initExports();
	
	});
	describe('loadLocalPath()', function() {
		
		afterEach(function() {

			sinon.restore();

		});
	
		it('should be a function', function() {
		
			expect(themeLoader.loadLocalPath).to.be.a('function');
		
		});
		it('should throw an Error if localThemePath is not a directory', function() {
		
			var isDirectoryStub = sinon.stub(fs.Stats.prototype, 'isDirectory').callsFake(function returnFalse() {
			
				return false;
			
			});
			expect(themeLoader.loadLocalPath).to.throw(Error, 'localThemePath is not a valid directory');
			isDirectoryStub.restore();
		
		});
		it('should load all paths from directories with main.css files in localThemePath as properties of global.Uwot.Themes with names matching the directory', function() {
		
			var localThemePath = path.resolve(global.Uwot.Constants.appRoot, 'public/css/theme');
			var localFileList = fs.readdirSync(localThemePath);
			var localThemes = [];
			let i = 0;
			localFileList.forEach(function(fn) {
			
				var thisFilePath = path.resolve(localThemePath, localFileList[i]);
				if (fs.statSync(thisFilePath).isDirectory()) {
	
					var thisThemeFiles = fs.readdirSync(thisFilePath);
					if (thisThemeFiles.indexOf('main.css') !== -1) {
				
						localThemes.push(path.parse(thisFilePath).name);
				
					}
	
				}
				if (++i >= localFileList.length) {
				
					themeLoader.loadLocalPath();
					expect(Object.keys(global.Uwot.Themes)).to.include(...localThemes);
				
				}
			
			});
		
		});
	
	});
	describe('loadExternalPath(pathObj)', function() {
	
		afterEach(function() {

			sinon.restore();

		});
		it('should be a function', function() {
		
			expect(themeLoader.loadExternalPath).to.be.a('function');
		
		});
		
		it('is not implemented yet', function() {
		
			expect(themeLoader.loadExternalPath).to.throw(Error, 'this function is not yet implemented');
		
		});
	
	});
	describe('isValidTheme(themeName)', function() {
	
		var loadedThemes;
		before(function() {
		
			global.Uwot.Themes = {};
			themeLoader.loadLocalPath();
			loadedThemes = Object.keys(global.Uwot.Themes);
		
		});
		
		it('should be a function', function() {
		
			expect(themeLoader.isValidTheme).to.be.a('function');
		
		});
		it('should return the theme names as an array if themeName arg is undefined', function() {
		
			expect(themeLoader.isValidTheme()).to.be.an('array').that.deep.equals(loadedThemes);
		
		});
		it('should return the theme names as an array if themeName arg is null', function() {
		
			expect(themeLoader.isValidTheme(null)).to.be.an('array').that.deep.equals(loadedThemes);
		
		});
		it('should return the theme names as an array if themeName arg is an empty string', function() {
		
			expect(themeLoader.isValidTheme('')).to.be.an('array').that.deep.equals(loadedThemes);
		
		});
		it('should return false if themeName arg is not undefined, null, or a string', function() {
		
			expect(themeLoader.isValidTheme(['themeName'])).to.be.false;
		
		});
		it('should return false if themeName arg is a string that is not a key in global.Uwot.Themes', function() {
		
			expect(themeLoader.isValidTheme('[themeName]')).to.be.false;
		
		});
		it('should return true if themeName arg is a string that is a key in global.Uwot.Themes', function() {
		
			expect(themeLoader.isValidTheme('cac')).to.be.true;
		
		});
	
	});

});
