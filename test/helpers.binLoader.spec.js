const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs-extra');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

var binLoader = require('../helpers/binLoader');

const testLocalBinPathFiles = [
	'this.xml',
	'that',
	'theOther.js',
	'final.js'
];

describe('binLoader.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		globalSetupHelper.initExports();
	
	});
	describe('loadLocalPath()', function() {
	
		it('should be a function', function() {
		
			expect(binLoader.loadLocalPath).to.be.a('function');
		
		});
		it('should throw an Error if localBinPath is not a directory', function() {
		
			var isDirectoryStub = sinon.stub(fs.Stats.prototype, 'isDirectory').callsFake(function returnFalse() {
			
				return false;
			
			});
			expect(binLoader.loadLocalPath).to.throw(Error, 'localBinPath is not a valid directory');
			isDirectoryStub.restore();
		
		});
		it('should only load js files to global.Uwot.Bin from localBinPath', function() {
		
			var isDirectoryStub = sinon.stub(fs.Stats.prototype, 'isDirectory').callsFake(function returnTrue() {
			
				return true;
			
			});
			var readdirSyncStub = sinon.stub(fs, 'readdirSync').callsFake(function returnTestList(path) {
			
				return testLocalBinPathFiles;
			
			});
			expect(binLoader.loadLocalPath).to.throw(Error, 'routes/bin/theOther.js');
			isDirectoryStub.restore();
			readdirSyncStub.restore();
		
		});
		it('should load all exports from files in localBinPath as properties of global.Uwot.Bin with names matching the filename minus extension of each file', function() {
		
				var localBinPath = path.resolve(global.Uwot.Constants.appRoot, 'routes/bin');
				var localFileList = fs.readdirSync(localBinPath);
				var localJsFiles = [];
				localFileList.forEach(function(fn) {
				
					if (fn.endsWith('.js')) {
					
						let fname = path.parse(fn).name;
						localJsFiles.push(fname);
						console.log('\x1b[36m%s\x1b[0m', '	' + fname);
					
					}
				
				});
				binLoader.loadLocalPath();
				expect(Object.keys(global.Uwot.Bin)).to.include(...localJsFiles);
		
		});
	
	});
	describe('loadExternalPath(pathObj)', function() {
	
		it('should be a function', function() {
		
			expect(binLoader.loadExternalPath).to.be.a('function');
		
		});
		
		it('is not implemented yet', function() {
		
			expect(binLoader.loadExternalPath).to.throw(Error, 'this function is not yet implemented');
		
		});
	
	});
	describe('isValidBin(binName)', function() {
	
		var loadedBins;
		before(function() {
		
			global.Uwot.Bin = {};
			binLoader.loadLocalPath();
			loadedBins = Object.keys(global.Uwot.Bin);
		
		});
		
		it('should be a function', function() {
		
			expect(binLoader.isValidBin).to.be.a('function');
		
		});
		it('should return the bin names as an array if binName arg is undefined', function() {
		
			expect(binLoader.isValidBin()).to.be.an('array').that.deep.equals(loadedBins);
		
		});
		it('should return the bin names as an array if binName arg is null', function() {
		
			expect(binLoader.isValidBin(null)).to.be.an('array').that.deep.equals(loadedBins);
		
		});
		it('should return the bin names as an array if binName arg is an empty string', function() {
		
			expect(binLoader.isValidBin('')).to.be.an('array').that.deep.equals(loadedBins);
		
		});
		it('should return false if binName arg is not undefined, null, or a string', function() {
		
			expect(binLoader.isValidBin(['binName'])).to.be.false;
		
		});
		it('should return false if binName arg is a string that is not a key in global.Uwot.Bin', function() {
		
			expect(binLoader.isValidBin('[binName]')).to.be.false;
		
		});
		it('should return true if binName arg is a string that is a key in global.Uwot.Bin', function() {
		
			expect(binLoader.isValidBin('theme')).to.be.true;
		
		});
	
	});

});
