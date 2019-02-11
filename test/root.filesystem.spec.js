var path = require('path');
var fs = require('fs');
const globalSetupHelper = require('../helpers/globalSetup');
globalSetupHelper.initConstants();
globalSetupHelper.initEnvironment();

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const FileSystem = require('../filesystem');
var filesystem;

describe('filesystem.js', function() {

	describe('UwotFs', function() {
	
		beforeEach(function() {
		
			const dbFindStub = sinon.stub(global.Uwot.Users, 'findById').callsFake(function returnUserDoc(id, callback) {
		
				return callback(
					false, 
					{
						"fName": "Found",
						"lName": "User",
						"uName": "fuser",
						"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
						"sudoer": true,
						"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
						"createdAt": new Date(1546450800498),
						"updatedAt": new Date(1546450800498),
						"_id": "CDeOOrH0gOg791cZ",
						"verifyPassword": function(pass) {return true;},
						"maySudo": function() {return this.sudoer;}
					}
				);
	
			});
			filesystem = new FileSystem('CDeOOrH0gOg791cZ');
		});
		describe('constructor(userId, cwd)', function() {
		
			it('should be a function', function() {
			
				expect(FileSystem).to.be.a('function');
			
			});
			it('should assign guest to this.user and assign "/" to this.cwd if given no arguments');
			it('should assign guest to this.user and assign "/" to this.cwd  if userId arg is not a string and cwd arg is not a string');
			it('should assign guest to this.user and assign "/" to this.cwd  if userId does no match existing user and cwd arg is not a string');
			it('should assign user matching given userId arg to this.user and assign user directory to this.cwd if userId arg is a string matching an existing user and cwd arg is not a string');
			it('should set this.cwd to value of cwd arg if it is a string');
		
		});
		describe('setDirs()', function() {
		
			it('should be a function');
			it('should create object this.root and assign global appRoot constant + "/fs" to this.root.path');
			it('should create object this.pubDir and assign global config setting for pubDir to this.pubDir.path');
			it('should assign null to this.userDir if this.user is a guest');
			it('should create object this.userDir and assign global config userDir + "/{this.user.uName}" to this.userDir.path if user is not a guest.');
		
		});
		describe('cmd(cmdName, argArr, callback, isSudo)', function() {
		
			it('should be a function');
			it('should throw a TypeError if callback arg is not a function');
			it('should return an systemError to callback if cmdName arg is not a string');
			it('should return an systemError to callback if cmdName arg string does not match a valid command name');
			it('should return a systemError to callback if argArr arg is not an object');
			it('should perform this.changeCwd if cmdName arg === "cd"');
			it('should perform this.readDir if cmdName arg === "ls"');
			it('should perform this.getVcwd if cmdName arg === "pwd"');
			it('should perform this.createDir if cmdName arg === "mkdir"');
			it('should perform this.removeFile if cmdName arg === "rm"');
			it('should perform this.removeDir if cmdName arg === "rmdir"');
			it('should perform this.moveFile if cmdName arg === "mv"');
			it('should perform this.copy if cmdName arg === "cp"');
			it('should perform this.stat if cmdName arg === "stat"');
			it('should perform this.append if cmdName arg === "touch"');
			it('should return an error to callback if command process returns an error');
			it('should return output from the requested command process');
		
		});
		describe('changeCwd(pth)', function() {
		
			it('should be a function');
			it('should throw a TypeError if pth arg is not a string');
			it('should return an error if path cannot be resolved');
			it('should return an error if this.isReadable throws an error');
			it('should return a systemError if resolved path is not readable by user');
			it('should return true and set this.cwd to resolved path within VFS if resolved path is readable by user');
		
		});
		describe('getVcwd()', function() {
		
			it('should be a function');
			it('should return a string if this.cwd is a string');
			it('should return "/" if this.cwd. is not set or not a string');
		
		});
		describe('getCwd()', function() {
		
			it('should be a function');
			it('should return the absolute path of this.cwd if this.cwd is a string');
			it('should return absolute path to "fs" if this.cwd. is not set or not a string');
		
		});
		describe('append(pth, data)', function() {
		
			it('should be a function');
			it('should return an error if this.isWritable(pth) throws an error');
			it('should return a systemError if pth arg points to a location that is not writable by user');
			it('should return an error if path is writable but appendFileSync throws an error');
			it('should return true and append data arg to file at pth if path is writable and appendFileSync is successful');
		
		});
		describe('copy(source, target)', function() {
		
			it('should be a function');
			it('should return an error if this.isReadable(source) returns an error');
			it('should return an systemError if user is not allowed to read file at source');
			it('should return an error if this.isWriteable(target) throws an error');
			it('should return a systemError if user is not allowed to write to location of target');
			it('should return an error if copyFileSync(source, target) throws an error');
			it('should return true and copy contents of file at source to location of target if source is readable by user, target is writable by user, and copyFileSync executes without error');
		
		});
		describe('createDir(pth)', function() {
		
			it('should be a function');
			it('should return an error if this.isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if mkdirSync throws an error');
			it('should return true and create a new directory at pth if user is allowed to write to location at pth and mkdirSync completes without error');
		
		});
		describe('readDir(pth)', function() {
		
			it('should be a function');
			it('should return an error if isReadable throws an error');
			it('should return a systemError if user is not allowed to read location at pth');
			it('should return an error if readdirSync throws an error');
			it('should return an array of file names of files in dir at pth if user is allowed to read location at pth');
		
		});
		describe('readFile(pth)', function() {
		
			it('should be a function');
			it('should return an error if isReadable throws an error');
			it('should return a systemError if user is not allowed to read location at pth');
			it('should return an error if readFileSync throws an error');
			it('should return the content of the file if user is allowed to read location at pth and readFileSynce executes without error');
		
		});
		describe('moveFile(pth, newPath)', function() {
		
			it('should be a function');
			it('should return an error if isReadable(pth) throws an error');
			it('should return an error if isWritable(pth) throws an error');
			it('should return an error if isWritable(newPath) throws an error');
			it('should return a systemError if user is not allowed to read file at pth');
			it('should return a systemError if user is not allowed to write file at pth');
			it('should return a systemError if user is not allowed to write file at newPath');
			it('should return an error if renameSync throws an error');
			it('should return true and move file from pth to newPath if user has proper permissions and renameSync executes without error');
		
		});
		describe('removeDir(pth)', function() {
		
			it('should be a function');
			it('should return an error if isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if rmdirSync throws an error');
			it('should return true and remove directory at pth if user has proper permissions and rmdirSync executes without error');
		
		});
		describe('removeFile(pth)', function() {
		
			it('should be a function');
			it('should return an error if isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if unlinkSync throws an error');
			it('should return true and remove file at pth if user has proper permissions and unlinkSync executes without error');
		
		});
		describe('stat(pth)', function() {
		
			it('should be a function');
			it('should return an error if isReadable throws an error');
			it('should return a systemError if user is not allowed to read location at pth');
			it('should return a Stats object if user has proper permissions and statSynce executes without error');
		
		});
		describe('write(pth, data)', function() {
		
			it('should be a function');
			it('should return an eroor if isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if writeFileSync throws an error');
			it('should return true and write data to beginning of file at pth if user has proper permissions and writeFileSync executes without error');
		
		});
		describe('isInUser(pth, userId)', function() {
		
			it('should be a function');
			it('should return a TypeError if pth is not a string');
			it('should return false if this.userDir is null or if this.userDir.exists returns false');
			it('should return false if userId is not provided and pth is not inside the config user directory');
			it('should return true if userId is not provided and pth is inside the config user directory');
			it('should return false if userId matches instance user and pth is not inside the instance user\'s directory');
			it('should return true if userId matches instance user and pth is inside the instance user\'s directory');
			it('should return false if userId does not matche instance user and pth is not inside the given user\'s directory');
			it('should return true if userId does not match instance user and pth is inside the given user\'s directory');
		
		});
		describe('isInPub(pth)', function() {
		
			it('should be a function');
			it('should return a TypeError if pth is not a string');
			it('should return false if this.pubDir is null or this.pubDir.exists returns false');
			it('should return false if pth is not inside of this.pubDir.path');
			it('should return true if pth is inside of this.pubDir.path');
		
		});
		describe('isInRoot(pth)', function() {
		
			it('should be a function');
			it('should return a TypeError if pth is not a string');
			it('should return false if this.root is null or this.root.exists returns false');
			it('should return false if pth is not inside of this.root.path');
			it('should return true if pth is inside of this.root.path');
		
		});
		describe('tildeExpand(pth)', function() {
		
			it('should be a function');
			it('should return pth unchanged if pth is not a string starting with "~"');
			it('should replace the leading tilde with the absolute path to the instance user\'s directory if path is a string starting with "~" and this.userDir !== null');
			it('should replace the leading tilde with "/" if path is a string starting with "~" and this.userDir === null');
		
		});
		describe('resolvePath(pth)', function() {
		
			it('should be a function');
			it('should return a TypeError if pth is not a string');
			it('should return a systemError if pth points to a permissions file');
			it('should return the path with tilde expansion if pth is a string starting with a tilde and tilde expansion points to an extant path');
			it('should return pth if pth is absolute, within root, and extant');
			it('should return this.root.path + pth if pth is absolute, and extant from root');
			it('should return an error if pth is absolute and isInRoot throws an error');
			it('should return an error if pth is absolute and path.resolve throws an error');
			it('should return absolute path from VCWD to pth if this.cwd is a string and absolute path is extant');
			it('should return absolute path from Vroot to pth if this.cwd is not a string and absolute path is extant');
			it('should return absolute path from Vroot to pth if this.cwd is a string, absolute path from VCWD to path is not extant, and absolute path is extant');
			it('should return an error if this.cwd is a string, absolute path from VCWD to path is not extant, and absolute path from Vroot to path is not extant');
		
		});
		describe('isReadable(pth)', function() {
		
			it('should be a function');
			it('should return a systemError if pth is not a string');
			it('should return a systemError if pth points to a permissions file');
			it('should return a systemError if pth resolves to an absolute path outside of VFS as configured');
			it('should return true if pth resolves to an absolute path in either root or users directory, but not in pubDir or instance userDir, and users:sudoFullRoot is true in config and this.sudo is true, and file is readable by fs');
			it('should return a systemError if pth resolves to a file that is not readable by fs');
			it('should return false if pth resolves to an absolute path in either root or users directory, but not in pubDir or instance userDir, and users:sudoFullRoot is false in config or this.sudo is false');
			it('should return true if is in instance userDir and is readable by fs');
			it('should return an error if getPermissions throws an error');
			it('should return true if pth resolves to absolute path in this.pubDir.path, and instance user is set as owner of directory in permissions, and file is readable by fs');
			it('should return a systemError if pth resolves to absolute path in this.pubDir.path, and owner of directory in permissions file is not instance user');
			it('should return true if pth resolves to absolute path in this.pubDir.path, and instance user is granted read permissions in permissions file, and file is readable by fs');
			it('should return a systemError if pth resolves to absolute path in this.pubDir.path, and permissions are set, and instance user is not granted read permissions in permissions file');
			it('should return true if pth resolves to absolute path in this.pubDir.path, permissions file is not set, and file is readable by fs');
			it('should return an error if accessSync throws an error');
		
		});
		describe('isWritable(pth)', function() {
		
			it('should be a function');
			it('should return a systemError if pth is not a string');
			it('should return a systemError if pth points to a permissions file');
			it('should return a systemError if pth resolves to an absolute path outside of root, pubDir, or userDir');
			it('should return a systemError if pth resolves to a file that fs cannot write to');
			it('should return true if this.sudo is true, users:sudoFullRoot is true in config, file is in root or users, and writable by fs');
			it('should return true if pth resolves to a path in instance userDir, users:homeWritable and users:createHome is true in config, and file is writable by fs');
		
		});
		describe('getPermissions(pth)', function() {
		
			it('should be a function');
			it('should return a permissions object with owner:"root" and allowed:[] if pth is not in root or users');
			it('should return a permissions object with owner:"root" and allowed:[] if is in root, not in pub or instance userDir, and either this.sudo === false or user:sudoFullRoot is false in config');
			it('should return an error if pth points to a non-extant path');
			it('should return false if pth points to a directory and there is not valid JSON permissions data in the permissions file');
			it('should return a permissions object with the content of the permissions file in the directory if pth points to a directory and the permissions file contains valid JSON');
			it('should return an error if pth points to a directory and readFileSync throws an error trying to read the permissions file');
			it('should return false if pth points to a file and there is not valid JSON permissions data in the permissions file of its enclosing directory');
			it('should return a permissions object with the content of the permissions file in the directory if pth points to a file and the permissions file in the enclosing directory contains valid JSON');
			it('should return an error if pth points to a file and readFileSync throws an error trying to read the permissions file in the enclosing directory');
		
		});
		describe('setPermissions(pth, userId, permissions)', function() {
		
			it('should be a function');
			it('should return a systemError if !this.sudo or pth is not a string');
			it('should return a TypeError if userId is not a string or permissions is not a non-null object');
			it('should return a systemError if listUsers throws an error');
			it('should return an Error if userId does not match a user in the user db');
			it('should return a systemError if pth resolves to a path outside of root or users directory');
			it('should return an error if absolute path to permissions file cannot be resolved');
			it('should return an error if pth does not resolve to an extant path')
			it('should return an error if permissions file cannot be written');
			it('should write permissions arg data as JSON to permissions file at pth if this.sudo, userId matches a user in db, path is extant and a directory, and permissions file does not exist');
			it('should write permissions arg data as JSON to permissions file at directory enclosing file at pth if this.sudo, userId matches a user in db, path is extant and a file, and permissions file does not exist');
			it('should maintain the current generic permission set if permissions arg does not have allowed property set and allowed value was previously set');
			it('should set the owner to the instance user if owner was previously set to default, permissions.user property is not set, and pth resolves to a path in instance userDir');
			it('should maintain any user specific permissions if any were previously set');
		
		});
		describe('changeOwner(pth, userId)', function() {
		
			it('should be a function');
			it('should return a systemError if !this.sudo');
			it('should return a TypeError if userId is not a string');
			it('should return a systemError if listUsers returns an error');
			it('should return an error if userId does not match a user in the db');
			it('should return a systemError if pth does not resolve to a path inside of root or users');
			it('should return an error if pth resolves to a non-extant path');
			it('should return an error if fs cannot write to the permissions file at pth');
			it('should write a new JSON object with owner: "{userId}" to a permissions file at pth if pth resolves to a directory in root or users, this.sudo, userId matches a user in the db, and permissions were not previously set');
			it('should write only updated owner: "{userId}" in the JSON for the permissions file at pth if pth resolves to a directory in root or users, this.sudo, userId matches a user in the db, and permissions were not previously set');
			it('should write a new JSON object with owner: "{userId}" to a permissions file in the enclosing dir of pth if pth resolves to a file in root or users, this.sudo, userId matches a user in the db, and permissions were not previously set');
			it('should write only updated owner: "{userId}" in the JSON for the permissions file in the enclosing directory of pth if pth resolves to a file in root or users, this.sudo, userId matches a user in the db, and permissions were not previously set');
		
		});
	
	});
	describe('UwotFsPermissions', function() {
	
		describe('constructor(permissions)', function() {
		
			it('should not be able to be called outside of UwotFs methods');
			it('should be a function');
			it('should throw a TypeError if permissions arg is not an object');
			it('should assign DEFAULT_OWNER to owner property and DEFAULT_ALLOWED to allowed property if permisssions === null');
			it('should assign permissions.owner to owner property if permissions.owner is a string');
			it('should assign permissions.allowed to the allowed property if permissions.allowed is an array');
			it('should assign DEFAULT_ALLOWED to the allowed property if permissions.allowed is not an array');
			it('should assign any other properties that are not owner or allowed to itself, if the property name matches a userId from the DB and the property value is an array containing only any or none of ["r", "w", "x"]');
		
		});
		describe('toGeneric()', function() {
		
			it('should be a function');
			it('should return an object with constructor.name === "Object"');
			it('should set owner to DEFAULT_OWNER if owner property is not a string');
			it('should set owner to own owner property if it is a string');
			it('should set allowed property to own allowed property');
			it('should set any user specific permission properties');
		
		});
		describe('toJSON()', function() {
		
			it('should be a function');
			it('should return a JSON string representing the value of this.toGeneric()');
		
		});
		describe('concatPerms(otherPerms)', function() {
		
			it('should be a function');
			it('should throw a TypeError if otherPerms is not an object');
			it('should return this if otherPerms is null');
			it('should return a new object with all property values of otherPerms unless this has a different value for any key');
			it('should return an object with constructor.name === "UwotFsPermissions"');
		
		})
	
	});

});
