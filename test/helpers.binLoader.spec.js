const globalSetupHelper = require('../helpers/globalSetup');
var fs = require('fs');
var path = require('path');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

globalSetupHelper.initConstants();
globalSetupHelper.initExports();
var binLoader = require('../helpers/binLoader');

const testLocalBinPathFiles = [
	'this.xml',
	'that',
	'theOther.js',
	'final.js'
];

describe('binLoader.js', function() {

	describe('loadLocalPath', function() {
	
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
	describe('loadExternalPath', function() {
	
		it('should be a function', function() {
		
			expect(binLoader.loadExternalPath).to.be.a('function');
		
		});
	
	});

});
