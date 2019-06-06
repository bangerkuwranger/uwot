// node packages
var path = require('path');

// app packages
var Config = require('../config');
var Users = require('../users');
var InstanceSessions = require('../instanceSessions');
var Cmd = require('../cmd');
var Theme = require('../theme');
var Listener = requeire('../listener');
var binLoader = require('./binLoader');
var themeLoader = require('./themeLoader');
var filesystemLoader = require('./filesystemLoader');

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
	if ('object' !== typeof global.Uwot.InstanceSessions || null === global.Uwot.InstanceSessions) {

		global.Uwot.InstanceSessions = {};

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
	
	if ('object' !== typeof global.Uwot.FileSystems || null === global.Uwot.FileSystems) {
	
		global.Uwot.FileSystems = {};
	
	}
	
	if ('object' !== typeof global.Uwot.Listeners || null === global.Uwot.Listeners) {
	
		global.Uwot.Listeners = {};
	
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
		
		if ('function' !== typeof global.Uwot.Constants.escapeHtml) {
		
			// was 'UwotCmd.Prototype.escapeHtml'
			global.Uwot.Constants.escapeHtml = function escapeHtml(str) {
	
				if ('string' !== typeof str) {
		
					return str;
			
				}
				return str.replace(/&/g, "&amp;")
				.replace(/</g, "&lt;")
				.replace(/>/g, "&gt;")
				.replace(/"/g, "&quot;")
				.replace(/'/g, "&#039;");
		
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
		
		if ('object' !== typeof global.Uwot.Constants.listenerTypes) {
		
			global.Uwot.Constants.listenerTypes = [
				"default",		// the main listener that routes commands to path router. There can be only one.
				"additional",	// adds commands outside of the default set while allowing default listener to route commands. There can be as many of these as needed, but cannot override default commands
				"exclusive"		// takes over CLI interface and only routes all commands to listener target. Only one active at a time; allowed to override default commands.
			];
		
		}
		
		if ('object' !== typeof global.Uwot.Constants.listenerParserTypes) {
		
			global.Uwot.Constants.listenerParserTypes = [
				"cmdParser",		// the default command parser for the base shell. Parses to AST using bash-parser, stores AST in req.body.ast, and creates a runtime at req.body.runtime with method "executeCommands" that stores results in a property "results"
				"internal",	// parser logic is contained a middleware function that is a method of the UwotCmd child class. parserPath must be set to the name of this method.
				"external"		// parser logic is in a middleware function that is the export value of an additional file outside of the file containing the UwotCmd child class. parserPath must be set to the path to this file from global.Uwot.Constants.approot
			];
		
		}
		
		if ('object' !== typeof global.Uwot.Constants.listenerOutputTypes) {
		
			global.Uwot.Constants.listenerOutputTypes = [
				"ansi",		// the default command output engine for the base shell. Parses results object property 'output' to ansi and returns final object as JSON object to res.JSON
				"internal",	// output logic is contained a middleware function that is a method of the UwotCmd child class. outputPath must be set to the name of this method, and this method MUST set res.ansi to be the output function that returns JSON object to res.JSON after performing any transformation to the expected output format
				"external"		// output logic is in a middleware function that is the export value of an additional file outside of the file containing the UwotCmd child class. outputPath must be set to the path to this file from global.Uwot.Constants.approot. This middleware function MUST set res.ansi to be the output function that returns JSON object to res.JSON after performing any transformation to the expected output format
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
		global.Uwot.InstanceSessions = new InstanceSessions();
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
		if (global.Uwot.Config.getVal('themes', 'useLocal')) {

			themeLoader.loadLocalPath();

		}

		// TBD
		// load external themes if enabled
		if (global.Uwot.Config.getVal('themes', 'useExternal')) {
		
			themeLoader.loadExternalPath();
		
		}
		
		return global.Uwot.Themes;
	
	},
	
	// TBD
	// Write listener tracking object and initialize the default CLI listener.
	
	initListeners: function initListeners(callback) {
	
		var listeners = {};
		var error = false;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to initListeners');
		
		}
		else {
		
			global.Uwot.InstanceSessions.getValidInstances(function(error, validInstances) {
			
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('object' !== typeof validInstances || !(Array.isArray(validInstances)) || validInstances.length < 1) {
				
					return callback(false, false);
				
				}
				else {
				
					for (let i = 0; i < validInstances.length; i++) {
					
						var currentInstanceId = validInstances[i]._id;
						if ('object' === typeof global.Uwot.Listeners[currentInstanceId] && null !== global.Uwot.Listeners[currentInstanceId]) {
						
							
						
						}
						else {
						
							global.Uwot.Listeners[currentInstanceId] = {};
							global.Uwot.Listeners[currentInstanceId].default = new Listener('default', currentInstanceId);
						
						}
						if ((i + 1) > validInstances.length) {
						
							return callback(false, Object.keys(global.Uwot.Listeners));
						
						}
					
					}
				
				}
			
			});
		}
	
	},
	
	initBins: function initBins() {
	
		// load locals if enabled
		if (global.Uwot.Config.getVal('binpath', 'useLocal')) {

			binLoader.loadLocalPath();

		}

		// TBD
		// load externals if enabled
		if (global.Uwot.Config.getVal('binpath', 'useExternal')) {

			binLoader.loadExternalPath();

		}
		// then add to reserved list
		global.Uwot.Constants.reserved.push(...Object.keys(global.Uwot.Bin));
		return global.Uwot.Bin;
	
	},
	
	initFileSystems: function initFileSystems(sessionStore, callback) {
	
		var loadedFilesystems = {};
		var error = false;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to initFileSystems');
		
		}
		else {
		
			var loadGuest = filesystemLoader.loadGuest();
			if (true !== loadGuest) {
			
				loadedFilesystems.GUEST = false;
				error = loadGuest;
				
			
			}
			else {
			
				loadedFilesystems.GUEST = true;
			
			}
			filesystemLoader.loadActiveSessionFilesystems(sessionStore, function(err, loadedForSessions) {
			
				if (err) {
				
					error = err;
				
				}
				if ('object' === typeof loadedForSessions && Array.isArray(loadedForSessions) && loadedForSessions.length > 0) {
				
					var i = 0;
					loadedForSessions.forEach(function(uid) {
					
						loadedFilesystems[uid] = true;
						if (++i >= loadedForSessions.length) {
						
							return callback(error, loadedFilesystems);
						
						}
					
					});
				
				}
				else {
				
					return callback(error, loadedFilesystems);
				
				}
			
			});
		
		}
	
	},
	
	uninitialize: function uninitialize() {
	
		delete global.Uwot;
		return;
	
	},
	
	initGlobalObjects

};
