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
	
	},
	//loads from external or node-modules pathObj as defined in config
	loadExternalPath: function loadExternalPath(pathObj) {}

}
