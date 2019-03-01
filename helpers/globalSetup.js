// node packages
var path = require('path');

// app packages
var Config = require('../config');
var Users = require('../users');
var Cmd = require('../cmd');
var Theme = require('../theme');
var binLoader = require('./binLoader');
var themeLoader = require('./themeLoader');

function initGlobalObjects() {

	// init globals with empty values if non-extant or wrong type
	if ('object' !== typeof global.Uwot || null == global.Uwot) {

		global.Uwot = {};

	}

	if ('object' !== typeof global.Uwot.Constants || null == global.Uwot.Constants) {

		global.Uwot.Constants = {};

	}

	if ('object' !== typeof global.Uwot.Config || null === global.Uwot.Config) {

		// was 'global.UwotConfig'
		global.Uwot.Config = {};

	}

	if ('object' !== typeof global.Uwot.Users || null === global.Uwot.Users) {

		// was 'global.UwotUsers'
		global.Uwot.Users = {};

	}

	if ('object' !== typeof global.Uwot.Exports || null === global.Uwot.Exports) {

		// was 'app.Exports'
		global.Uwot.Exports = {};

	}

	if ('object' !== typeof global.Uwot.Themes || null === global.Uwot.Themes) {

		// was 'global.UwotThemes'
		global.Uwot.Themes = {};

	}

	if ('object' !== typeof global.Uwot.Bin || null === global.Uwot.Bin) {

		// was 'global.UwotBin'
		global.Uwot.Bin = {};

	}

}

initGlobalObjects();

module.exports = {

	initConstants: function initConstants() {

		// init constant values
		if ('string' !== typeof global.Uwot.Constants.appRoot) {

			// was 'global.appRoot'
			global.Uwot.Constants.appRoot = path.resolve(__dirname, '../');

		}

		if ('function' !== typeof global.Uwot.Constants.tryParseJSON) {

			// was 'global.tryParseJSON'
			global.Uwot.Constants.tryParseJSON = function tryParseJSON(jsonString) {

				try {

					var jsonObj = JSON.parse(jsonString);
					if (jsonObj && typeof jsonObj === "object") {

						return jsonObj;

					}

				}
				catch (e) { }
				return false;

			};

		}

		if ('object' !== typeof global.Uwot.Constants.cliOps || !Array.isArray(global.Uwot.Constants.cliOps)) {

			// was 'global.UwotCliOps'
			global.Uwot.Constants.cliOps = [
				"clear",
				"history",
				"echo",
				"login",
				"logout",
				"exit"
			];

		}
		
		if ('object' !== typeof global.Uwot.Constants.reserved || !Array.isArray(global.Uwot.Constants.reserved)) {
		
			//was 'global.UwotReserved'
			global.Uwot.Constants.reserved = Array.from(global.Uwot.Constants.cliOps);
		
		}
		
		if ('string' !== typeof global.Uwot.Constants.version) {

			// was 'global.UwotVersion'
			global.Uwot.Constants.version = require('../package.json').version;
			var isPre = global.Uwot.Constants.version.indexOf('-');
			if (-1 !== isPre) {

				var preVersion = global.Uwot.Constants.version.substring(isPre+1);
				global.Uwot.Constants.version = global.Uwot.Constants.version.substring(0, isPre);
				if (preVersion.indexOf('alpha') !== -1) {
	
					global.Uwot.Constants.version += 'a';
	
				}
				else if (preVersion.indexOf('beta') !== -1) {
	
					global.Uwot.Constants.version += 'b';
	
				}
	
			}

		}

		if ('number' !== typeof global.Uwot.Constants.sessionHours) {

			
			global.Uwot.Constants.sessionHours = 12;

		}

		if ('string' !== typeof global.Uwot.Constants.etcProd) {

			global.Uwot.Constants.etcProd = path.resolve(global.Uwot.Constants.appRoot, 'etc', 'prod');

		}

		if ('string' !== typeof global.Uwot.Constants.etcDev) {

			global.Uwot.Constants.etcDev = path.resolve(global.Uwot.Constants.appRoot, 'etc', 'dev');

		}
		return global.Uwot.Constants;

	},
	
	initEnvironment: function initEnvironment() {

		// NODE_ENV based values
		var configPath;
		if ("development" !== global.process.env.NODE_ENV) {

			configPath = path.resolve(global.Uwot.Constants.etcProd, 'config.json');

		}
		else {

			configPath = path.resolve(global.Uwot.Constants.etcDev, 'config.json');

		}

		// init global objects with instances of app classes
		global.Uwot.Config = new Config(configPath);
		global.Uwot.Users = new Users();
		return;
	
	},
	
	initExports: function initExports() {
	
		if ('function' !== typeof global.Uwot.Exports.Cmd || global.Uwot.Exports.Cmd.name !== 'UwotCmd') {

			global.Uwot.Exports.Cmd = Cmd;

		}
		
		if ('function' !== typeof global.Uwot.Exports.Theme || global.Uwot.Exports.Theme.name !== 'UwotTheme') {

			global.Uwot.Exports.Theme = Theme;

		}
		return global.Uwot.Exports;
	
	},
	
	initThemes: function initThemes() {
	
		// load local themes if enabled
		if (global.Uwot.Config.get('themes', 'useLocal')) {

			themeLoader.loadLocalPath();

		}

		// TBD
		// load external themes if enabled
		if (global.Uwot.Config.get('themes', 'useExternal')) {
		
			themeLoader.loadExternalPath();
		
		}
		
		return global.Uwot.Themes;
	
	},
	
	initBins: function initBins() {
	
		// load locals if enabled
		if (global.Uwot.Config.get('binpath', 'useLocal')) {

			binLoader.loadLocalPath();

		}

		// TBD
		// load externals if enabled
		if (global.Uwot.Config.get('binpath', 'useExternal')) {

			binLoader.loadExternalPath();

		}
		// then add to reserved list
		global.Uwot.Constants.reserved.push(...Object.keys(global.Uwot.Bin));
		return global.Uwot.Bin;
	
	},
	
	initFileSystems: function initFileSystems() {
	
		global.Uwot.FileSystems = {};
	
	},
	
	uninitialize: function uninitialize() {
	
		delete global.Uwot;
		return;
	
	},
	
	initGlobalObjects

};
