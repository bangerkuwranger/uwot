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
		describe('constructor', function() {
		
			it('should be a function', function() {
			
				expect(FileSystem).to.be.a('function');
			
			});
			it('should assign guest to this.user and assign "/" to this.cwd if given no arguments');
			it('should assign guest to this.user and assign "/" to this.cwd  if userId arg is not a string and cwd arg is not a string');
			it('should assign guest to this.user and assign "/" to this.cwd  if userId does no match existing user and cwd arg is not a string');
			it('should assign user matching given userId arg to this.user and assign user directory to this.cwd if userId arg is a string matching an existing user and cwd arg is not a string');
			it('should set this.cwd to value of cwd arg if it is a string');
		
		});
		describe('setDirs', function() {
		
			it('should be a function');
			it('should create object this.root and assign global appRoot constant + "/fs" to this.root.path');
			it('should create object this.pubDir and assign global config setting for pubDir to this.pubDir.path');
			it('should assign null to this.userDir if this.user is a guest');
			it('should create object this.userDir and assign global config userDir + "/{this.user.uName}" to this.userDir.path if user is not a guest.');
		
		});
		describe('cmd', function() {
		
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
		describe('changeCwd', function() {
		
			it('should be a function');
			it('should throw a TypeError if pth arg is not a string');
			it('should return an error if path cannot be resolved');
			it('should return an error if this.isReadable throws an error');
			it('should return a systemError if resolved path is not readable by user');
			it('should return true and set this.cwd to resolved path within VFS if resolved path is readable by user');
		
		});
		describe('getVcwd', function() {
		
			it('should be a function');
			it('should return a string if this.cwd is a string');
			it('should return "/" if this.cwd. is not set or not a string');
		
		});
		describe('getCwd', function() {
		
			it('should be a function');
			it('should return the absolute path of this.cwd if this.cwd is a string');
			it('should return absolute path to "fs" if this.cwd. is not set or not a string');
		
		});
		describe('append', function() {
		
			it('should be a function');
			it('should return an error if this.isWritable(pth) throws an error');
			it('should return a systemError if pth arg points to a location that is not writable by user');
			it('should return an error if path is writable but appendFileSync throws an error');
			it('should return true and append data arg to file at pth if path is writable and appendFileSync is successful');
		
		});
		describe('copy', function() {
		
			it('should be a function');
			it('should return an error if this.isReadable(source) returns an error');
			it('should return an systemError if user is not allowed to read file at source');
			it('should return an error if this.isWriteable(target) throws an error');
			it('should return a systemError if user is not allowed to write to location of target');
			it('should return an error if copyFileSync(source, target) throws an error');
			it('should return true and copy contents of file at source to location of target if source is readable by user, target is writable by user, and copyFileSync executes without error');
		
		});
		describe('createDir', function() {
		
			it('should be a function');
			it('should return an error if this.isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if mkdirSync throws an error');
			it('should return true and create a new directory at pth if user is allowed to write to location at pth and mkdirSync completes without error');
		
		});
		describe('readDir', function() {
		
			it('should be a function');
			it('should return an error if isReadable throws an error');
			it('should return a systemError if user is not allowed to read location at pth');
			it('should return an error if readdirSync throws an error');
			it('should return an array of file names of files in dir at pth if user is allowed to read location at pth');
		
		});
		describe('readFile', function() {
		
			it('should be a function');
			it('should return an error if isReadable throws an error');
			it('should return a systemError if user is not allowed to read location at pth');
			it('should return an error if readFileSync throws an error');
			it('should return the content of the file if user is allowed to read location at pth and readFileSynce executes without error');
		
		});
		describe('moveFile', function() {
		
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
		describe('removeDir', function() {
		
			it('should be a function');
			it('should return an error if isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if rmdirSync throws an error');
			it('should return true and remove directory at pth if user has proper permissions and rmdirSync executes without error');
		
		});
		describe('removeFile', function() {
		
			it('should be a function');
			it('should return an error if isWritable throws an error');
			it('should return a systemError if user is not allowed to write to location at pth');
			it('should return an error if unlinkSync throws an error');
			it('should return true and remove file at pth if user has proper permissions and unlinkSync executes without error');
		
		});
		describe('stat', function() {
		
			it('should be a function');
		
		});
		describe('write', function() {
		
			it('should be a function');
		
		});
		describe('isInUser', function() {
		
			it('should be a function');
		
		});
		describe('isInPub', function() {
		
			it('should be a function');
		
		});
		describe('isInRoot', function() {
		
			it('should be a function');
		
		});
		describe('tildeExpand', function() {
		
			it('should be a function');
		
		});
		describe('resolvePath', function() {
		
			it('should be a function');
		
		});
		describe('isReadable', function() {
		
			it('should be a function');
		
		});
		describe('isWritable', function() {
		
			it('should be a function');
		
		});
		describe('getPermissions', function() {
		
			it('should be a function');
		
		});
		describe('setPermissions', function() {
		
			it('should be a function');
		
		});
		describe('changeOwner', function() {
		
			it('should be a function');
		
		});
	
	});

});
