'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {

	// loads /router/bin
	loadLocalPath: function loadLocalPath() {
	
		var localBinPath = path.resolve(global.Uwot.Constants.appRoot, 'routes/bin');
		var localBinStats = fs.statSync(localBinPath);
		if (localBinStats.isDirectory()) {
	
			var localFileList = fs.readdirSync(localBinPath);
			var localBinFiles = [];
			var localFileLength = localFileList.length;
			for (let i = 0; i < localFileLength; i++) {
	
				if (localFileList[i].endsWith('.js')) {
		
					global.Uwot.Bin[path.parse(localFileList[i]).name] = require(path.resolve(localBinPath, localFileList[i]));
		
				}
	
			}

		}
		else {
		
			throw new Error('localBinPath is not a valid directory');
		
		}
	
	},
	
	// TBD
	//loads from external or node-modules pathObj as defined in config
	loadExternalPath: function loadExternalPath(pathObj) {
	
		throw new Error('this function is not yet implemented');
	
	},
	
	// if binName is not passed, returns array of loaded bin names.
	// if binName is provided, compares against list of loaded bin names and returns
	// true if binName is loaded,
	// false if not.
	isValidBin(binName) {
	
		if ('undefined' === typeof binName || null === binName || '' === binName) {
		
			return Object.keys(global.Uwot.Bin);
		
		}
		else if ('string' !== typeof binName) {
		
			return false;
		
		}
		else {
		
			var loadedBins = Object.keys(global.Uwot.Bin);
			return loadedBins.indexOf(binName.trim()) !== -1;
		
		}
	
	}

};
