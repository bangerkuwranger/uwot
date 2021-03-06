'use strict';
const path = require('path');
const fs = require('fs-extra');
const readline = require('readline');
const globalSetupHelper = require('../helpers/globalSetup');

globalSetupHelper.initConstants();
globalSetupHelper.initEnvironment();
globalSetupHelper.initExports();
const sassCompiler = require('../helpers/sassCompiler');

const Setup = require('../setup');
const tableNames = [
	'users',
	'sessions'
];
const configCats = [
	"server",
	"users",
	"binpath",
	"themes"
];

// Headline output for shell interface
console.log('| Node application shell for: ' + global.Uwot.Constants.appRoot + ' |');
var bottomLine = '—————————————————————————————————';
for (let sp = 0; sp < global.Uwot.Constants.appRoot.toString().length; sp++) {

	bottomLine += '—';

}
console.log(bottomLine);

// TBD
// Add generators for theme and bin modules
// generate:
// 		"theme",
//		"bin"

// TBD
// Add setup for all config options
// setup:
//		"server",
//		"users",
//		"binpath",
//		"themes"

var commandSets = {
	adminUser: [
		"add",
		"delete",
		"list",
		"changeName",
		"changePw",
		"allowSudo",
		"disallowSudo"
	],
	db: [
		"setup"
	],
	setup: [
		"list",
		"set",
		"reset",
		"initial",
		"remove",
		"add"
	],
	styles: [
		"list",
		"compile"
	]
};

// Begin component functions

//setup config handler
//usage:
//	shell.js setup [action] [category] [...args]
function setupConfigHandler(action, category, argArray) {

	if ('undefined' === typeof category || '-h' === category || '--help' === category || 'help' === category || -1 === configCats.indexOf(category)) {
	
		var helpArgs;
		switch(action) {
		
			case 'list':
				helpArgs = [
					'setup list',
					'List all current values in a category.',
					'category environment',
					'Environment accepts "prod" or "dev". Default is prod.'
				];
				break;
			case 'initial':
				helpArgs = [
					'setup initial',
					'Perform initial interactive setup of a category.',
					'category'
				];
				break;
			case 'set':
				helpArgs = [
					'setup set',
					'Set a single string configuration value for a key within a category.',
					'category key value environment',
					'Environment accepts "prod", "dev", or "both". Default is both.'
				];
				break;
			case 'reset':
				helpArgs = [
					'setup reset',
					'Reset all configuration values within a category to the default.',
					'category environment',
					'Environment accepts "prod", "dev", or "both". Default is both.'
				];
				break;
			case 'add':
				helpArgs = [
					'setup add',
					'Add a member to an array configuration value for a key within a category.',
					'category key value environment',
					'Value must be a valid JSON representation of an array or object. (the string should be enclosed in single quotes e.g. \'{"name","path"}\').'+"\r\n"+'Environment accepts "prod", "dev", or "both". Default is both.'
				];
				break;
			case 'remove':
				helpArgs = [
					'setup set',
					'Remove an array member of the configuration value for a key within a category.',
					'category key index environment',
					'Index is a number representing the array item you are removing (starts from 0). Use "setup list [category]" to see current values. Environment accepts "prod", "dev", or "both". Default is both.'
				];
				break;
		
		}
		actionHelp(...helpArgs);
		if (-1 === configCats.indexOf(category)) {
			console.error('Invalid category "' + category + '". Use one of the following:');
		}
		else {
		
			console.log('Available category names:');
		
		}
		console.log('	' + JSON.stringify(configCats));
		return process.exit();
	
	}
	else if ('initial' === action) {
	
		const rl = readline.createInterface({
			input: process.stdin,
			output: process.stdout,
			prompt: 'UWOT Config> '
		});
		
		rl.question('Is this config change for the development, production, or both environments? (default both)' + "\r\n" + rl._prompt, function(answer) {
		
			var envs = getEnvs(answer.trim().toLowerCase(), 'both');
			console.log(envs);
			rl.close();
		
		});
	
	}
	else {
		
		var envString = argArray.pop();
		var envs = getEnvs(envString, 'both');
		switch(action) {
		
			case 'list':
				listSetupCategoryValues(category, getEnvs(envString, 'prod'));
				break;
			case 'set':
				setSetupCategoryKeyValue(category, ...argArray, envs);
				break;
			case 'reset':
				resetSetupCategoryValues(category, envs);
				break;
			case 'add':
				addSetupCategoryKeyArrayValue(category, ...argArray, envs);
				break;
			case 'remove':
				removeSetupCategoryKeyArrayValue(category, ...argArray, envs);
				break;
		
		}
	
	}

}

function listSetupCategoryValues(category, envs) {

	var setupInterface = new Setup(envs);
	titleBlock('current values for ' + envs[0]);
	setupInterface.listCat(category, function(error, valueList) {
	
		if (error) {
		
			console.error(error.stack);
			process.exit();
		
		}
		else if ('object' === typeof valueList && null !== valueList) {
		
			var keys = Object.keys(valueList);
			var arrays = new Map();
			keys.forEach(function(key) {
			
				if (Array.isArray(valueList[key])) {
				
					arrays.set(key, valueList[key]);
				
				}
				else {
				
					console.log(key + ': ' + valueList[key]);
				}
			
			});
			if (arrays.size > 0) {
			
				arrays.forEach(function(val, key) {
				
					if (val.length > 0) {
					
						console.log(key + ':');
						arrayWithIdx(val);
					
					}
					else {
					
						console.log(key + ': []');
					
					}
				
				});
			
			}
			process.exit();
		
		}
		else {
		
			console.log(valueList);
			process.exit();
		
		}
	
	});

}

function setSetupCategoryKeyValue(category, key, value, envs) {


	if ('string' !== typeof key || 'string' !== typeof value) {
	
		console.error('key and value must be strings');
		process.exit();
	
	}
	titleBlock('setting value for ' + category + ':' + key);
	var setupInterface = new Setup(envs);
	setupInterface.performConfigOperation('get', [category, null, true], function(error, currentValues) {
	
		if (error) {
		
			console.error(error.stack);
			process.exit();
		
		}
		else {
		
			console.log('Previous Values:');
			console.log(currentValues);
			var catKeys = Object.keys(currentValues);
			var newVals = new Map();
			for (let i = 0; i < catKeys.length; i++) {
			
				let thisVal = currentValues[catKeys[i]];
				if (catKeys[i] === key) {
				
					thisVal = value;
				
				}
				newVals.set(catKeys[i], thisVal);
				if ((i+1) >= catKeys.length) {
				
					setupInterface.setCat(category, newVals, function(error, savedKeys) {
					
						if (error) {
		
							console.error(error.stack);
							process.exit();
		
						}
						else if (-1 === savedKeys.indexOf(key)) {
						
							console.error('Unable to save value "' + value + '" for ' +  category + ':' + key);
							process.exit();
						
						}
						else {
						
							console.log('Successfully changed values to:');
							console.log(newVals);
							process.exit();
						
						}
					
					});
				
				}
			
			}
		
		}
	
	});

}

function resetSetupCategoryValues(category, envs) {

	titleBlock('resetting values for ' + category + ' to defaults');
	var setupInterface = new Setup(envs);
	setupInterface.resetCat(category, function(error, isReset) {
	
		if (error) {
		
			console.error(error);
			process.exit();
		
		}
		else if (!isReset) {
		
			console.log('No values to reset for category ' + category + '. All values are already set to use defaults');
		
		}
		else {
		
			console.log('Successfully reset values for category ' + category + ' to defaults.');
			
		
		}
		setupInterface.listCat(category, function(error, catVals) {
		
			if (error) {
	
				console.error(error);
				process.exit();
	
			}
			else {
			
				console.log('Current values:');
				console.log(catVals);
				process.exit();
			
			}
		
		});
	
	});

}

function addSetupCategoryKeyArrayValue(category, key, value, envs) {

	if ('string' !== typeof category || 'string' !== typeof key || 'string' !== typeof value) {
	
		console.error('category, key, and value must all be strings.');
	
	}
	else {
	
		titleBlock('adding new value to array for ' + category + ':' + key);
		var setupInterface = new Setup(envs);
		setupInterface.addArrayValue(category, key, value, function(error, isSaved) {
		
			if (error) {
			
				console.error(error);
				process.exit();
			
			}
			else if (!isSaved) {
			
				console.log('No new values saved in array for ' + category + ':' + key + '; all previous values matched given values.');
			
			}
			else {
			
				console.log('Successfully saved new values in array for ' + category + ':' + key);
			
			}
			setupInterface.listArrayValues(category, key, function(error, vals) {
		
				if (error) {
	
					console.error(error);
					process.exit();
	
				}
				else {
			
					console.log('Current values:');
					arrayWithIdx(vals);
					process.exit();
			
				}
		
			});
		
		});
	
	}

}

function removeSetupCategoryKeyArrayValue(category, key, index, envs) {

	//sanity check
	if ('string' !== typeof category || 'string' !== typeof key || isNaN(parseInt(index))) {
	
		console.error('category and key must be strings. index must be an integer.');
	
	}
	else {
	
		titleBlock('removing value at index #' + index + ' from array for ' + category + ':' + key);
		//get interface
		var setupInterface = new Setup(envs);
		//perform removal
		setupInterface.removeArrayIndex(category, key, parseInt(index), function(error, isRemoved) {
		
			//catch error
			if (error) {
			
				console.error(error);
				process.exit();
			
			}
			//if idx doesn't exist say so
			else if (!isRemoved) {
			
				console.log('Could not remove index #' + index + ' from ' + category + ':' + key + '; index is undefined.');
				setupInterface.listArrayValues(category, key, function(error, vals) {
			
					if (error) {
		
						console.error(error);
						process.exit();
		
					}
					else {
				
						console.log('Current values:');
						arrayWithIdx(vals);
						process.exit();
				
					}
			
				});
			
			}
			//display current values for key
			else {
			
				console.log('Successfully removed index #' + index + ' from ' + category + ':' + key + '.');
				setupInterface.listArrayValues(category, key, function(error, vals) {
			
					if (error) {
		
						console.error(error);
						process.exit();
		
					}
					else {
				
						console.log('Current values:');
						arrayWithIdx(vals);
						process.exit();
				
					}
			
				});
			
			} 
		
		});
	
	}

}

function getEnvs(given, defVal) {

	defVal = 'string' === typeof defVal ? defVal : 'prod';
	var finalV = 'string' !== typeof given ? defVal : given;
	var envs;
	switch(finalV) {
	
		case 'dev':
		case 'development':
			envs = ['dev'];
			break;
		case 'prod':
		case 'production':
			envs = ['prod'];
			break;
		default:
			envs= ['dev', 'prod'];
	
	}
	return envs;

}

function dropAndCreateTable(tableName, dbPath) {

	try {

		if (fs.existsSync(dbPath)) { 

			fs.unlinkSync(dbPath);

		}
		var createStream = fs.createWriteStream(dbPath);
		createStream.end();
		console.log('Dropped and set up ' + tableName + ' table.');
		return;

	}		
	catch(error) {

		console.log(error.stack);
		return process.exit();

	}

}

//setup db tables
//usage:
//	shell.js db setup tablename
function setupDb(tableName) {

	var dbPath, tableCount;
	if ('undefined' !== typeof tableName && ('-h' === tableName || '--help' === tableName || 'help' === tableName)) {
	
		actionHelp("db setup", 'Setup a table or all tables. Drops (if exists) and creates table.', 'tablename', 'Omitting the tablename will rebuild and set up all tables.');
		console.log('Available table names:');
		console.log('	' + JSON.stringify(tableNames));
		return process.exit();
	
	}
	else if ('undefined' !== typeof tableName) {
	
		if (tableNames.indexOf(tableName) === -1) {
		
			console.log('Unknown table: ' + tableName);
			console.log('Available table names:');
			console.log('	' + JSON.stringify(tableNames));
			return process.exit();
		
		}
		else {
		
			console.log('Setting up table: ' + tableName);
			dbPath = path.resolve(global.Uwot.Constants.appRoot, 'var/nedb/', tableName + '.db');
			dropAndCreateTable(tableName, dbPath);
			return process.exit();
		
		}
	
	}
	else {
	
		console.log('Dropping and rebuilding all tables.');
		tableCount = 0;
		for (let i = 0; i < tableNames.length; i++) {
		
			dbPath = path.resolve(global.Uwot.Constants.appRoot, 'var/nedb/', tableNames[i] + '.db');
			dropAndCreateTable(tableNames[i], dbPath);
			tableCount++;
		
		}
		console.log('Dropped and set up ' + tableCount + ' tables.');
		return process.exit();
	
	}

}

//add admin user
//usage:
//	shell.js adminUser add username password canSudo fname lname
function addAdminUser(uname, password, canSudo, fname, lname) {

	if ('undefined' === typeof uname || 'string' !== typeof uname || !uname || '' === uname) {
	
		return console.log('Cannot add user; username is invalid.');
	
	}
	
	if ('-h' === uname || '--help' === uname || 'help' === uname) {
	
		actionHelp('adminUser add', 'Add an admin user.', '[username] [password] [canSudo] [first name] [last name]');
		return process.exit();
	
	}
	
	if ('undefined' === typeof fname || 'string' !== typeof fname || !fname || '' === fname) {
	
		fname = null;
	
	}
	
	if ('undefined' === typeof lname || 'string' !== typeof lname || !lname || '' === lname) {
	
		lname = null;
	
	}
	
	if ('undefined' === typeof password || 'string' !== typeof password || !password || '' === password) {
	
		console.log('Cannot add user; password is invalid.');
		return process.exit();
	
	}
	if ('undefined' === typeof canSudo || 'string' !== typeof canSudo || !canSudo || '' === canSudo) {
	
		canSudo = false;
	
	}
	var rules = require('password-rules');
	var pwInvalid = rules(password, {maximumLength: 255});
	if (pwInvalid) {
	
		console.log(pwInvalid.sentence);
		return process.exit();
	
	}
// 	var users = new UserModel();
	var now = new Date();
	var newUserObj = {
		'fName': fname,
		'lName': lname,
		'uName': uname,
		'createdAt': now,
		'updatedAt': now,
		password,
		'sudoer': ('string' === typeof canSudo && 'true' === canSudo.toLowerCase()) ? true : false
	};
	global.Uwot.Users.createNew(newUserObj, function(error, user) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		console.log('User "' + uname + '" has been created (id ' + user._id + ').');
		return process.exit();
	
	});

}

//delete admin user
//usage:
//	shell.js adminUser delete id
function deleteAdminUser(id) {

	if ('undefined' !== typeof id && ('-h' === id || '--help' === id || 'help' === id)) {
	
		actionHelp("adminUser delete", 'Remove an admin user.', '[id]');
		return process.exit();
	
	}
	if ('string' !== typeof id || '' === id) {
	
		console.log('Cannot delete user; user id invalid.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.remove(id, function(error, removed) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!removed) {
		
			console.log('User with id ' + id + ' does not exist. Use "adminUser list" to see all existing users.');
			return process.exit();
		
		}
		
		console.log('User has been deleted (id ' + id + ').');
		return process.exit();
	
	});

}

//change admin user password
//usage:
//	shell.js adminUser changePw id oldpassword newpassword
function changeAdminUserPassword(id, oldpw, newpw) {

	if ('undefined' !== typeof id && ('-h' === id || '--help' === id || 'help' === id)) {
	
		actionHelp("adminUser changePw", 'Change password for an admin user.', '[id] [oldpassword] [newpassword]');
		return process.exit();
	
	}
	if ('string' !== typeof id || '' === id) {
	
		console.log('Cannot change user password; user id invalid.');
		return process.exit();
	
	}
	if ('string' !== typeof oldpw || '' === oldpw) {
	
		console.log('Cannot change user password; old password invalid.');
		return process.exit();
	
	}
	if ('string' !== typeof newpw || '' === newpw) {
	
		console.log('Cannot change user password; new password invalid.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.changePw(id, oldpw, newpw, function(error, changed) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!changed) {
		
			console.log('User with id ' + id + ' does not exist. Use "adminUser list" to see all existing users.');
			return process.exit();
		
		}
		
		console.log('Password for user has been updated (id ' + id + ').');
		return process.exit();
	
	});

}

//change admin user first and last name
//usage:
//	shell.js adminUser changeName id firstname lastname
function changeAdminUserName(id, fname, lname) {

	if ('undefined' !== typeof id && ('-h' === id || '--help' === id || 'help' === id)) {
	
		actionHelp("adminUser changeName", 'Change first and last name for an admin user.', '[id] [firstname] [lastname]');
		return process.exit();
	
	}
	if ('string' !== typeof id || '' === id) {
	
		console.log('Cannot change user names; user id invalid.');
		return process.exit();
	
	}
	if ('string' !== typeof fname || '' === fname) {
	
		console.log('Cannot change user names; first name invalid.');
		return process.exit();
	
	}
	if ('string' !== typeof lname || '' === lname) {
	
		console.log('Cannot change user names; last name invalid.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.changeName(id, fname, lname, function(error, changed) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!changed) {
		
			console.log('User with id ' + id + ' does not exist. Use "adminUser list" to see all existing users.');
			return process.exit();
		
		}
		
		console.log('First and Last names for user have been updated to "' + fname + ' ' + lname + '" (id ' + id + ').');
		return process.exit();
	
	});

}

//list admin users
//usage:
//	shell.js adminUser list
function listAdminUsers(arg) {

	if ('undefined' !== typeof arg && ('-h' === arg || '--help' === arg || 'help' === arg)) {
	
		actionHelp("adminUser list", 'View a list of all admin users.', '');
		return process.exit();
	
	}
	else if ('undefined' !== typeof arg) {
	
		console.log('"adminUser list" does not accept any arguments.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.listUsers(function(error, userList) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!userList || userList.length < 1) {
		
			console.log('No admin users. Use "adminUser add" to create an admin user.');
			return process.exit();
		
		}
		titleBlock('Available Admin Users:');
		console.log('        id                     username             name                                     sudoer');
		console.log('        --------------------------------------------------------------------------------------------');

		for (let i = 0; i < userList.length; i++) {
		
			var logLine = '        ' + userList[i]._id;
			for (let sp = 23 - userList[i]._id.toString().length; sp > 0; sp--) {
			
				logLine += ' ';
			
			}
			logLine += userList[i].uName;
			for (let sp = 21 - userList[i].uName.toString().length; sp > 0; sp--) {
			
				logLine += ' ';
			
			}
			var fullName;
			if (null === userList[i].fName && null === userList[i].lName) {
			
				fullName = "*NONE*";
			
			}
			else if (null === userList[i].lName) {
			
				fullName = userList[i].fName;
			
			}
			else if (null === userList[i].fName) {
			
				fullName = userList[i].lName;
			
			}
			else {
			
				fullName = userList[i].lName + ', ' + userList[i].fName;
			
			}
			logLine += fullName;
			for (let sp = 41 - fullName.length; sp > 0; sp--) {
			
				logLine += ' ';
			
			}
			logLine += userList[i].sudoer;
			console.log(logLine);
		
		}
		return process.exit();
		

	});

}

//enable sudo for admin user
//usage:
//	shell.js adminUser allowSudo id
function allowAdminUserSudo(id) {

	if ('undefined' !== typeof id && ('-h' === id || '--help' === id || 'help' === id)) {
	
		actionHelp("adminUser allowSudo", 'Add sudo privilege for an admin user.', '[id]');
		return process.exit();
	
	}
	if ('string' !== typeof id || '' === id) {
	
		console.log('Cannot allow sudo for user; user id invalid.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.changeSudo(id, true, function(error, changed) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!changed) {
		
			console.log('User with id ' + id + ' does not exist. Use "adminUser list" to see all existing users.');
			return process.exit();
		
		}
		
		console.log('Sudo has been enabled for user (id ' + id + ').');
		return process.exit();
	
	});

}

//disable sudo for admin user
//usage:
//	shell.js adminUser disallowSudo id
function disallowAdminUserSudo(id) {

	if ('undefined' !== typeof id && ('-h' === id || '--help' === id || 'help' === id)) {
	
		actionHelp("adminUser disallowSudo", 'Remove sudo privilege for an admin user.', '[id]');
		return process.exit();
	
	}
	if ('string' !== typeof id || '' === id) {
	
		console.log('Cannot disallow sudo for user; user id invalid.');
		return process.exit();
	
	}
// 	var users = new UserModel();
	global.Uwot.Users.changeSudo(id, false, function(error, changed) {
	
		if (error) {
		
			console.log(error.message);
			return process.exit();
		
		}
		if (!changed) {
		
			console.log('User with id ' + id + ' does not exist. Use "adminUser list" to see all existing users.');
			return process.exit();
		
		}
		
		console.log('Sudo has been disabled for user (id ' + id + ').');
		return process.exit();
	
	});

}

//list scss stylesheets
//usage:
//	shell.js styles list
function listStyles(arg) {

	if ('undefined' !== typeof arg && ('-h' === arg || '--help' === arg || 'help' === arg)) {
	
		actionHelp("styles list", 'View a list of all compilable scss stylesheets with type.', '');
		return process.exit();
	
	}
	else if ('undefined' !== typeof arg) {
	
		console.log('"styles list" does not accept any arguments.');
		return process.exit();
	
	}
	var styleList = sassCompiler.listStyles();
	if (styleList instanceof Error) {
	
		console.log(styleList.message);
		return process.exit();
	
	}
	titleBlock('Installed Stylesheets:');
	console.log('        type                   name                 location                                 status');
	console.log('        ------------------------------------------------------------------------------------------------------------------');
	var logLine;
	for (let i = 0; i < styleList.main.length; i++) {
	
		logLine = '        main';
		for (let sp = 19; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.main[i].name;
		for (let sp = 21 - styleList.main[i].name.toString().length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.main[i].location;
		for (let sp = 41 - styleList.main[i].location.length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.main[i].status;
		console.log(logLine);
	
	}
	for (let i = 0; i < styleList.local.length; i++) {
	
		logLine = '        local';
		for (let sp = 18; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.local[i].name;
		for (let sp = 21 - styleList.local[i].name.toString().length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.local[i].location;
		for (let sp = 41 - styleList.local[i].location.length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.local[i].status;
		console.log(logLine);
	
	}
	for (let i = 0; i < styleList.external.length; i++) {
	
		logLine = '        ext';
		for (let sp = 20; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.external[i].name;
		for (let sp = 21 - styleList.external[i].name.toString().length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.external[i].location;
		for (let sp = 41 - styleList.external[i].location.length; sp > 0; sp--) {
		
			logLine += ' ';
		
		}
		logLine += styleList.external[i].status;
		console.log(logLine);
	
	}
	return process.exit();

}

//list scss stylesheets
//usage:
//	shell.js styles compile
function compileStyles(arg) {

	var opResult;
	if ('string' !== typeof arg) {
	
		console.log('"styles compile" requires either a flag (--all, --main, --local, --ext) or filename as an argument.');
		return process.exit();
	
	}
	else if ('-h' === arg || '--help' === arg || 'help' === arg) {
	
		actionHelp("styles compile", 'Compile groups or individual stylesheets to CSS.', '[flag or filename]', 'flag or filename argument is either the name of the file as shown in "styles list" command or one of: "--all", compile all scss; "--main", compile main scss; "--local", compile local themes\' scss; "--ext", compile external themes\' scss');
		return process.exit();
	
	}
	else if ('--all' === arg) {
	
		try {
		
			opResult = sassCompiler.renderAll();
		
		}
		catch(e) {
		
			opResult = {
				processed: [],
				errors: [e]
			};
		
		}
	
	}
	else if ('--main' === arg) {
	
		try {
		
			opResult = sassCompiler.renderMainStyle();
		
		}
		catch(e) {
		
			opResult = {
				processed: [],
				errors: [e]
			};
		
		}
	
	}
	else if ('--local' === arg) {
	
		try {
		
			opResult = sassCompiler.renderLocalThemes();
		
		}
		catch(e) {
		
			opResult = {
				processed: [],
				errors: [e]
			};
		
		}
	
	}
	else if ('--ext' === arg) {
	
		try {
		
			opResult = sassCompiler.renderExternalThemes();
		
		}
		catch(e) {
		
			opResult = {
				processed: [],
				errors: [e]
			};
		
		}
	
	}
	else {
	
		try {
		
			opResult = {
				processed: [],
				errors: []
			};
			var stylePath;
			if (arg === 'style') {
			
				stylePath = 'style';
			
			}
			else {
			
				var styleList = sassCompiler.listStyles();
				var localMap = new Map();
				var extMap = new Map();
				if (styleList.local.length > 0) {
			
					styleList.local.forEach((localStyle) => {
					
						localMap.set(localStyle.name, `theme/${localStyle.name}/main`);
					
					});
			
				}
				// TBD
				// Resolve arg to correct value to pass to renderFile for ext
				
				var localPath = localMap.get(arg);
				var extPath = extMap.get(arg);
				if ('string' === typeof localPath) {
				
					stylePath = localPath;
				
				}
				else if ('string' === typeof extPath) {
				
					stylePath = extPath;
				
				}
				else {
				
					console.log(new Error('invalid style name - use "styles list" to see valid style names').message);
					return process.exit();
				
				}
			
			}
			var oneResult = sassCompiler.renderFile(stylePath);
			if (oneResult.errors.length > 0) {
	
				opResult.errors = opResult.errors.concat(oneResult.errors);
	
			}
			delete oneResult.errors;
			opResult.processed.push(oneResult);
		
		}
		catch(e) {
		
			opResult = {
				processed: [],
				errors: [e]
			};
		
		}
	
	}
	console.log('Compilation Complete: ' + opResult.processed.length + ' files processed with ' + opResult.errors.length + ' errors');
	if (opResult.errors.length > 0) {
	
		opResult.errors.forEach((err) => {
		
			console.log(err);
		
		});
	
	}
	return process.exit();

}

// outputs array of objects as table with properly spaced headers for each obj property and index for each element
function arrayWithIdx(ar) {

		var topline = '  index';
		var divider = '-------';
		var logLines = [];
		var padding = 4;
		var leftPad = 3;
		var headers = new Map();
		ar.forEach(function(arEl) {
		
			var theseKeys = Object.keys(arEl);
			theseKeys.forEach(function(key) {
			
				var thisHead = headers.get(key);
				var thisLen = 'string' === typeof arEl[key] ? arEl[key].length : 0;
				if ('undefined' === typeof thisHead) {
				
					headers.set(
						key,
						{
							kLen: key.length,
							maxLen: thisLen
						}
					);
				
				}
				else {
				
					thisHead.maxLen = thisHead.maxLen < thisLen ? thisLen : thisHead.maxLen;
				
				}
			
			});
		
		});
		var logHeaders = function(value, key) {
		
			for (let sp = value.maxLen + padding - value.kLen; sp > 0; sp--) {
			
				topline += ' ';
			
			}
			topline += key;
			for (let dsh = value.maxLen + padding; dsh > 0; dsh--) {
			
				divider += '-';
			
			}
		
		};
		headers.forEach(logHeaders(v, k));
		for (let i = 0; i < ar.length; i++) {
		
			var logLine = '';
			for (let sp = leftPad + padding - i.toString().length; sp > 0; sp--) {
			
				logLine += ' ';
			
			}
			logLine += i.toString();
			headers.forEach(function(val, col) {
			
				var valLen = 'string' === typeof ar[i][col] ? ar[i][col].length : 0;
				
				for (let sp = val.maxLen + padding - valLen; sp > 0; sp--) {
				
					logLine += ' ';
				
				}
				logLine += 0 ===  valLen ? '' : ar[i][col];
			
			});
			logLines[i] = logLine;
		
		}
		console.log(topline);
		console.log(divider);
		logLines.forEach(function(el) {
		
			console.log(el);
		
		});

}

function actionHelp(action, description, syntax, helpText) {

	titleBlock('help for ' + action);
	console.log(description);
	console.log('Syntax for "' + action + '":');
	console.log('	shell.js ' + action + ' ' + syntax);
	if ('undefined' !== typeof helpText && helpText) {
	
		console.log(helpText);
	
	}

}

function commandSetHelp(commandSet, helpText) {

	titleBlock('help for ' + commandSet);
	console.log('Available Actions for ' + commandSet + ':');
	var actions = commandSets[commandSet];
	for (let action in actions) {
	
		if ('string' === typeof actions[action]) {
		
			console.log('	' + actions[action]);
		
		}
	
	}
	if ('undefined' !== typeof helpText && helpText) {
	
		console.log(helpText.toString());
	
	}

}

function unrecognizedAction(commandSet, action) {

	console.log('Unrecognized Action "' + action + '" for Command Set "' + commandSet + '". (use shell.js ' + commandSet + ' -h for list of available Actions)');

}

function titleBlock(title) {

	title = (title).toUpperCase();
	var titleLine = '******';
	for (let sp = 0; sp < title.toString().length; sp++) {

		titleLine += '*';

	}
	console.log(titleLine);
	console.log('*  ' + title + '  *');
	console.log(titleLine);

}

// End component functions

// Begin input processing
// Parse args and execute commands

var args = [];
var i = 0;
process.argv.slice(2).forEach(function (arg) {

    args[i] = arg;
    i++;

});

switch (args[0]) {

	case 'db':
		switch(args[1]) {
			
			case 'setup': 
				setupDb(args[2]);
				break;
			case undefined:
			case '-h':
			case '--help':
			case 'help':
				commandSetHelp(args[0]);
				break;
			default:
				unrecognizedAction(args[0], args[1]);
		}
		break;
	case 'adminUser':
		switch(args[1]) {
		
			case 'list':
				listAdminUsers(args[2]);
				break;
			case 'add':
				addAdminUser(args[2], args[3], args[4], args[5], args[6]);
				break;
			case 'delete':
				deleteAdminUser(args[2]);
				break;
			case 'changePw':
				changeAdminUserPassword(args[2], args[3], args[4]);
				break;
			case 'allowSudo':
				allowAdminUserSudo(args[2]);
				break;
			case 'disallowSudo':
				disallowAdminUserSudo(args[2]);
				break;
			case 'changeName':
				changeAdminUserName(args[2], args[3], args[4]);
				break;
			case undefined:
			case '-h':
			case '--help':
			case 'help':
				commandSetHelp(args[0]);
				break;
			default:
				unrecognizedAction(args[0], args[1]);
		
		}
		break;
	case 'setup':
		let cs = args.shift();
		let an = args.shift();
		switch(an) {
		
			case 'list':
			case 'initial':
			case 'set':
			case 'reset':
			case 'add':
			case 'remove':
				setupConfigHandler(an, args.shift(), args);
				break;
			case undefined:
			case '-h':
			case '--help':
			case 'help':
				commandSetHelp(cs);
				break;
			default:
				unrecognizedAction(cs, an);
		
		}
		break;
	case 'styles':
		switch(args[1]) {
			
			case 'list': 
				listStyles(args[2]);
				break;
			case 'compile': 
				compileStyles(args[2]);
				break;
			case undefined:
			case '-h':
			case '--help':
			case 'help':
				commandSetHelp(args[0]);
				break;
			default:
				unrecognizedAction(args[0], args[1]);
		}
		break;
	case undefined:
	case '-h':
	case '--help':
	case 'help':
		titleBlock('help for shell.js');
		console.log('Syntax for shell.js:');
		console.log('	shell.js [Command Set] [Action] [arg1]...[arg(n)]');
		console.log('	');
		console.log('Available Command Sets & Actions:');
		var help = Object.keys(commandSets);
		for (let cSet in help) {
		
			if ('string' === typeof help[cSet]) {
			
				console.log('	' + help[cSet]);
				if ('object' === typeof commandSets[help[cSet]]) {
				
					for (let cAction in commandSets[help[cSet]]) {
					
						if ('string' === typeof commandSets[help[cSet]][cAction]) {
						
							console.log('		' + commandSets[help[cSet]][cAction]);
						
						}
					
					}
					
				}
			
			}
		
		}
		process.exit();
		break;
	default:
		console.log('Unrecognized Command Set: "' + args[0] + '". (use shell.js -h for list of available Command Sets)');

}
// End input processing
