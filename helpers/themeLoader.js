'use strict';
const fs = require('fs');
const path = require('path');
module.exports = {

	// loads /public/css/theme
	loadLocalPath: function loadLocalPath() {
	
		var localThemePath = path.resolve(global.Uwot.Constants.appRoot, 'public/css/theme');
		var localThemeStats = fs.statSync(localThemePath);
		if (localThemeStats.isDirectory()) {
	
			var localFileList = fs.readdirSync(localThemePath);
			var localThemeFiles = [];
			var localFileLength = localFileList.length;
			for (let i = 0; i < localFileLength; i++) {
	
				var thisFilePath = path.resolve(localThemePath, localFileList[i]);
				if (fs.statSync(thisFilePath).isDirectory()) {
		
					var thisThemeFiles = fs.readdirSync(thisFilePath);
					if (thisThemeFiles.indexOf('main.css') !== -1) {
					
						global.Uwot.Themes[path.parse(thisFilePath).name] = thisFilePath;
					
					}
		
				}
	
			}

		}
		else {
		
			throw new Error('localThemePath is not a valid directory');
		
		}
	
	},
	
	// TBD
	//loads from external or node-modules pathObj as defined in config
	loadExternalPath: function loadExternalPath(pathObj) {
	
		throw new Error('this function is not yet implemented');
	
	},
	
	// if themeName is not passed, returns array of loaded theme names.
	// if themeName is provided, compares against list of loaded theme names and returns
	// true if themeName is loaded,
	// false if not.
	isValidTheme(themeName) {
	
		if ('undefined' == typeof themeName || null === themeName || '' === themeName) {
		
			return Object.keys(global.Uwot.Themes);
		
		}
		else if ('string' !== typeof themeName) {
		
			return false;
		
		}
		else {
		
			var loadedThemes = Object.keys(global.Uwot.Themes);
			return loadedThemes.indexOf(themeName.trim()) !== -1;
		
		}
	
	}

}
