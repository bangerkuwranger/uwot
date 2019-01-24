const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

globalSetupHelper.initConstants();
globalSetupHelper.initExports();
var themeLoader = require('../helpers/themeLoader');

describe('themeLoader.js', function() {

	describe('loadLocalPath', function() {
		
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
	describe('loadExternalPath', function() {
	
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

});
