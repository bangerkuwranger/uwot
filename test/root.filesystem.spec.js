var path = require('path');
var fs = require('fs');
const SystemError = require('../helpers/systemError');
const globalSetupHelper = require('../helpers/globalSetup');
globalSetupHelper.initConstants();
globalSetupHelper.initEnvironment();

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const FileSystem = require('../filesystem');
var filesystem;

const instanceUser = {
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
};
const altUser = {
	"fName": "Mortimer",
	"lName": "Hemp",
	"uName": "mortimerhemp",
	"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
	"sudoer": true,
	"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
	"createdAt": new Date(1546450800498),
	"updatedAt": new Date(1546450800498),
	"_id": "123fourfive678ninetenELEVENTWELVE",
	"verifyPassword": function(pass) {return true;},
	"maySudo": function() {return this.sudoer;}
};

const UWOT_HIDDEN_PERMISSIONS_FILENAME = '.uwotprm';

describe('filesystem.js', function() {

	describe('UwotFs', function() {
	
		beforeEach(function() {
		
			const dbFindStub = sinon.stub(global.Uwot.Users, 'findById').callsFake(function returnUserDoc(id, callback) {
		
				if (id === altUser['_id']) {
				
					return callback(false, altUser);
				
				}
				else{
				
					return callback(false, instanceUser);
				
				}
	
			});
			filesystem = new FileSystem('CDeOOrH0gOg791cZ');
		});
		afterEach(function() {
		
			sinon.restore();
		
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
		describe('isInUser(pth, userName)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.isInUser).to.be.a('function');
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				var fnResult = filesystem.isInUser();
				expect(fnResult).to.be.instanceof(TypeError).with.property('message').that.includes('path passed to isInUser must be a string');
			
			});
			it('should return false if userName arg is not a string and either this.userDir is null or if this.userDir.exists returns false', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnFalse() {
			
					return false;
			
				});
				var existsFalse = filesystem.isInUser(path.resolve(global.Uwot.Constants.appRoot, 'fs/home/fuser/testpath'));
				expect(existsFalse).to.be.false;
				filesystem.userDir = null;
				var userDirIsNull = filesystem.isInUser(path.resolve(global.Uwot.Constants.appRoot, 'fs/home/fuser/testpath'));
				expect(userDirIsNull).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return false if userName is not a string, pth is not inside the instance userDir.path, and the directory at userDir.path exists', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var notInPath = filesystem.isInUser('fs/var/testpath');
				expect(notInPath).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return true if userName is not a string, pth is inside the instance userDir.path, and the directory at userDir.path exists', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var isInPath = filesystem.isInUser('fs/home/fuser/testpath');
				expect(isInPath).to.be.true;
				existsSyncStub.restore();
			
			});
			it('should return false if userName === "*" and pth is not inside the config server:userDir path', function() {
			
				var notInPath = filesystem.isInUser('fs/var/testpath', "*");
				expect(notInPath).to.be.false;
			
			});
			it('should return true if userName === "*" and pth is inside the config server:userDir path', function() {
			
				var isInPath = filesystem.isInUser('fs/home/testpath', "*");
				expect(isInPath).to.be.true;
			
			});
			it('should return false if userName is a string matching a user\'s existing home directory name and pth is not inside that directory\'s path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrueIfTestUser(userPath) {
			
					return -1 !== userPath.indexOf(altUser['uName']);
			
				});
				expect(filesystem.isInUser('fs/home/testpath', altUser['uName'])).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return true if userName is a string matching a user\'s existing home directory name and pth is inside that directory\'s path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrueIfTestUser(userPath) {
			
					return -1 !== userPath.indexOf(altUser['uName']);
			
				});
				expect(filesystem.isInUser('fs/home/mortimerhemp/testpath', altUser['uName'])).to.be.true;
				existsSyncStub.restore();
			
			});
			it('should return false if userName is a string that does not match a user\'s existing home directory name', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnFalse(userPath) {
			
					return false;
			
				});
				expect(filesystem.isInUser('fs/home/mortimerhemp/testpath', altUser['uName'])).to.be.false;
				existsSyncStub.restore();
			
			});
		
		});
		describe('isInPub(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.isInPub).to.be.a('function');
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				expect(filesystem.isInPub()).to.be.an.instanceof(TypeError).with.property('message').that.includes('path passed to isInPub must be a string');
			
			});
			it('should return false if this.pubDir is null or this.pubDir.exists returns false', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnFalse() {
			
					return false;
			
				});
				var existsFalse = filesystem.isInPub(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(existsFalse).to.be.false;
				filesystem.userDir = null;
				var pubDirIsNull = filesystem.isInPub(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(pubDirIsNull).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return false if pth is not inside of this.pubDir.path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var notInPath = filesystem.isInPub(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/run/testpath'));
				expect(notInPath).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return true if pth is inside of this.pubDir.path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var isInPath = filesystem.isInPub(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(isInPath).to.be.true;
				existsSyncStub.restore();
			
			});
		
		});
		describe('isInRoot(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.isInRoot).to.be.a('function');
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				expect(filesystem.isInRoot()).to.be.an.instanceof(TypeError).with.property('message').that.includes('path passed to isInRoot must be a string');
			
			});
			it('should return false if this.root is null or this.root.exists returns false', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnFalse() {
			
					return false;
			
				});
				var existsFalse = filesystem.isInRoot(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(existsFalse).to.be.false;
				filesystem.userDir = null;
				var RootDirIsNull = filesystem.isInRoot(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(RootDirIsNull).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return false if pth is not inside of this.root.path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var notInPath = filesystem.isInRoot(path.resolve(global.Uwot.Constants.appRoot, '/var/run/testpath'));
				expect(notInPath).to.be.false;
				existsSyncStub.restore();
			
			});
			it('should return true if pth is inside of this.root.path', function() {
			
				var existsSyncStub = sinon.stub(fs, 'existsSync').callsFake(function returnTrue() {
			
					return true;
			
				});
				var isInPath = filesystem.isInRoot(path.resolve(global.Uwot.Constants.appRoot, 'fs/var/www/html/testpath'));
				expect(isInPath).to.be.true;
				existsSyncStub.restore();
			
			});
		
		});
		describe('tildeExpand(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.tildeExpand).to.be.a('function');
			
			});
			it('should return pth unchanged if pth is not a string starting with "~"', function() {
			
				var testPath = '/fs/doc/';
				expect(filesystem.tildeExpand(testPath)).to.equal(testPath);
			
			});
			it('should replace the leading tilde with this.userDir.path if path is a string starting with "~" and this.userDir !== null', function() {
			
				var testPath = '~/doc/';
				filesystem.userDir.path = '/fs/home/fuser';	//faking it out w/ an absolute path; this will return full path from server root at runtime
				expect(filesystem.tildeExpand(testPath)).to.equal('/fs/home/fuser/doc/');
			
			});
			it('should replace the leading tilde with this.root.path if path is a string starting with "~" and this.userDir === null', function() {
			
				var testPath = '~/doc/';
				filesystem.userDir = null;
				filesystem.root.path = '/fs';	//faking it out w/ an absolute path; this will return full path from server root at runtime
				expect(filesystem.tildeExpand(testPath)).to.equal('/fs/doc/');
			
			});
		
		});
		describe('resolvePath(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.resolvePath).to.be.a('function');
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				expect(filesystem.resolvePath()).to.be.an.instanceof(TypeError).with.property('message').that.includes('path passed to resolvePath must be a string');
			
			});
			it('should return a systemError if pth points to a permissions file', function() {
			
				var permFilePath = '/etc/' + UWOT_HIDDEN_PERMISSIONS_FILENAME;
				expect(filesystem.resolvePath(permFilePath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return the resolved path with tilde expansion if pth is a string starting with a tilde and tilde expansion points to an extant path', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				var testPath = '~/doc/';
				filesystem.userDir.path = '/fs/home/fuser';	//faking it out w/ an absolute path; this will return full path from server root at runtime
				expect(filesystem.resolvePath(testPath)).to.equal('/fs/home/fuser/doc');
			
			});
			it('should return pth if pth is absolute, within root, and extant', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				var testPath = '/var/doc';
				expect(filesystem.resolvePath(testPath)).to.equal(testPath);
			
			});
			it('should return this.root.path + pth if pth is absolute, and extant from root', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				var testPath = global.Uwot.Constants.appRoot + '/fs/var/doc';
				expect(filesystem.resolvePath(testPath)).to.equal(testPath);
			
			});
			it('should return an error if pth is absolute and isInRoot throws an error', function() {
			
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(function returnError() {
			
					return new Error('test isInRoot error');
				
				});
				var testPath = global.Uwot.Constants.appRoot + '/fs/var/doc';
				expect(filesystem.resolvePath(testPath)).to.be.an.instanceof(Error).with.property('message').that.includes('test isInRoot error');
			
			});
			it('should return an error if pth is absolute and path.resolve throws an error', function() {
			
				var resolveStub = sinon.stub(path, 'resolve').callsFake(function throwError() {
			
					throw new Error('test resolve error');
				
				});
				var testPath = global.Uwot.Constants.appRoot + '/fs/var/doc';
				expect(filesystem.resolvePath(testPath)).to.be.an.instanceof(Error).with.property('message').that.includes('test resolve error');
			
			});
			it('should return an error if pth is absolute and fs.statSync throws an error', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function throwError() {
			
					throw new Error('test statSync error')
				
				});
				var testPath = global.Uwot.Constants.appRoot + '/fs/var/doc';
				expect(filesystem.resolvePath(testPath)).to.be.an.instanceof(Error).with.property('message').that.includes('test statSync error');
			
			});
			it('should return absolute path from VCWD to pth if this.cwd is a string and absolute path is extant', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				filesystem.cwd = "var/www";
				var testPath = 'html';
				var resolvedPath = path.resolve(filesystem.root.path, filesystem.cwd, testPath);
				expect(filesystem.resolvePath(testPath)).to.equal(resolvedPath);
			
			});
			it('should return absolute path from Vroot to pth if this.cwd is not a string and absolute path is extant', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				filesystem.cwd = null;
				var testPath = 'html';
				var resolvedPath = path.resolve(filesystem.root.path, testPath);
				expect(filesystem.resolvePath(testPath)).to.equal(resolvedPath);
			
			});
			it('should return absolute path from Vroot to pth if this.cwd is a string, absolute path from VCWD to path is not extant, and absolute path is extant', function() {
			
				filesystem.cwd = "var";
				var testPath = 'etc';
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrueOrThrow(pth) {
			
					if (-1 === pth.indexOf("var/etc")) {
					
						return true;
					
					}
					throw new Error('"/var/etc" does not exist');
				
				});
				var resolvedPath = path.resolve(filesystem.root.path, testPath);
				expect(filesystem.resolvePath(testPath)).to.equal(resolvedPath);
			
			});
			it('should return an error if this.cwd is a string, absolute path from VCWD to path is not extant, and absolute path from Vroot to path is not extant', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnFalse() {
			
					throw SystemError.ENOENT({syscall: 'stat', path: "/baklava"});
				
				});
				filesystem.cwd = '/var/eat/';
				var testPath = 'baklava';
				var shouldBeError = filesystem.resolvePath(testPath);
				expect(shouldBeError).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
		
		});
		describe('isReadable(pth)', function() {
		
			it('should be a function', function() {			
			
				expect(filesystem.isReadable).to.be.a('function');
			
			});
			it('should return a systemError if pth is not a string', function() {
			
				expect(filesystem.isReadable()).to.be.an.instanceof(Error).with.property('code').that.includes('EINVAL');
			
			});
			it('should return a systemError if pth points to a permissions file', function() {
			
				var permFilePath = '/etc/' + UWOT_HIDDEN_PERMISSIONS_FILENAME;
				expect(filesystem.isReadable(permFilePath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return a systemError if pth resolves to an absolute path outside of VFS as configured', function() {
			
				function returnFalse(pth) {
			
					return false;
				
				}
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(returnFalse);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').callsFake(returnFalse);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').callsFake(returnFalse);
				var testPath = "Users/elfo/lifeblood";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return true if pth resolves to an absolute path in either root or users directory, but not in pubDir or instance userDir, and users:sudoFullRoot is true in config and this.sudo is true, and file is readable by fs', function() {
			
				function returnFalse(pth) {
			
					return false;
				
				}
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(function trueIfPathNotHome(pth) {
				
					return -1 === pth.indexOf('fs/home/');
				
				});
				var isInUserStub = sinon.stub(filesystem, 'isInUser').callsFake(function trueIfPathIsHome(pth) {
				
					return -1 !== pth.indexOf('fs/home/');
				
				});
				var isInPubStub = sinon.stub(filesystem, 'isInPub').callsFake(returnFalse);
				var accessSyncStub = sinon.stub(fs, 'accessSync').callsFake(function returnTrue(path, mode) {
				
					return true;
				
				});
				var testPath = "etc/elfo/lifeblood/conf.d";
				var testPathTwo = "home/elfo/cage";
				expect(filesystem.isReadable(testPath)).to.be.true;
				expect(filesystem.isReadable(testPathTwo)).to.be.true;
			
			});
			it('should return a systemError if pth resolves to a file that is not readable by fs', function() {
			
				function returnFalse(pth) {
			
					return false;
				
				}
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(function trueIfPathNotHome(pth) {
				
					return -1 === pth.indexOf('fs/home/');
				
				});
				var isInUserStub = sinon.stub(filesystem, 'isInUser').callsFake(function trueIfPathIsHome(pth) {
				
					return -1 !== pth.indexOf('fs/home/');
				
				});
				var isInPubStub = sinon.stub(filesystem, 'isInPub').callsFake(returnFalse);
				var accessSyncStub = sinon.stub(fs, 'accessSync').callsFake(function throwError(path, mode) {
				
					throw SystemError.EACCES({syscall: "read", path: path});
				
				});
				var testPath = "etc/elfo/lifeblood/conf.d";
				var testPathTwo = "home/elfo/cage";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				expect(filesystem.isReadable(testPathTwo)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return a SystemError if pth resolves to an absolute path in either root or users directory, but not in pubDir or instance userDir, and users:sudoFullRoot is false in config or this.sudo is false', function() {
			
				function returnFalse(pth) {
			
					return false;
				
				}
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(function trueIfPathNotHome(pth) {
				
					return -1 === pth.indexOf('fs/home/');
				
				});
				var isInUserStub = sinon.stub(filesystem, 'isInUser').callsFake(function trueIfPathIsHome(pth, uName) {
				
					return -1 !== pth.indexOf('fs/home/') && 'string' == typeof uName;
				
				});
				var isInPubStub = sinon.stub(filesystem, 'isInPub').callsFake(returnFalse);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				filesystem.sudo = true;
				var testPath = "etc/david/lifeblood/conf.d";
				var testPathTwo = "home/david/toadstool";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				filesystem.sudo = false;
				expect(filesystem.isReadable(testPathTwo)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
			
			});
			it('should return true if is in instance userDir and is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(true);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPath = "home/elfo/cage";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return an error if getPermissions returns an error', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.ENOENT({syscall: 'stat'}));
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return true if pth resolves to absolute path in this.pubDir.path, and instance user is set as owner of directory in permissions, and file is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns({owner: instanceUser.uName});
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return a systemError if pth resolves to absolute path in this.pubDir.path, instance user is not granted read permissions in permissions file, and owner of directory in permissions file is not instance user', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns({owner: altUser.uName});
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return true if pth resolves to absolute path in this.pubDir.path, and instance user is granted read permissions in permissions file, and file is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = {owner: altUser.uName};
				testPerms[instanceUser.uName] = ['r'];
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return a systemError if pth resolves to absolute path in this.pubDir.path, and permissions are set, and instance user is not granted read permissions in permissions file', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = {};
				testPerms[instanceUser.uName] = ['w'];
				testPerms[altUser.uName] = ['r'];
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return true if pth resolves to absolute path in this.pubDir.path, permissions file is not set, and file is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(false);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return an error if accessSync throws an error', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').throws(SystemError.EACCES({syscall: 'stat'}));
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(false);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
		
		});
		describe('isWritable(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.isWritable).to.be.a('function');
			
			});
			it('should return a systemError if pth is not a string', function() {
			
				expect(filesystem.isWritable()).to.be.an.instanceof(Error).with.property('code').that.equals('EINVAL');
			
			});
			it('should return a systemError if pth points to a permissions file', function() {
			
				var permFilePath = '/etc/' + UWOT_HIDDEN_PERMISSIONS_FILENAME;
				expect(filesystem.isWritable(permFilePath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return a systemError if pth resolves to an absolute path outside of root, pubDir, or userDir', function() {
			
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var testPath = "Users/elfo/lifeblood";
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return a SystemError if pth resolves to a path in instance userDir, and either users:homeWritable or users:createHome is false in config', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(true);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPath = "home/elfo/lifeblood.txt";
				global.Uwot.Config.nconf.set('users:homeWritable', true);
				global.Uwot.Config.nconf.set('users:createHome', false);
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
				global.Uwot.Config.nconf.set('users:homeWritable', false);
				global.Uwot.Config.nconf.set('users:createHome', true);
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
				global.Uwot.Config.nconf.set('users:homeWritable', false);
				global.Uwot.Config.nconf.set('users:createHome', false);
			
			});
			it('should return true if pth resolves to a path in instance userDir, users:homeWritable and users:createHome is true in config, and file is writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(true);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPath = "home/elfo/lifeblood.txt";
				global.Uwot.Config.nconf.set('users:homeWritable', true);
				global.Uwot.Config.nconf.set('users:createHome', true);
				expect(filesystem.isWritable(testPath)).to.be.true;
				global.Uwot.Config.nconf.set('users:homeWritable', false);
				global.Uwot.Config.nconf.set('users:createHome', false);
			
			});
			it('should return an error if getPermissions returns an error', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.ENOENT({syscall: 'stat'}));
				var testPath = "Users/elfo/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');;
			
			});
			it('should return a SystemError if pth resolves to a path in this.pubDir, instance user is not set to owner or granted write permissions in permissions file', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns({owner: altUser.uName});
				var testPath = "Users/elfo/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
			
			});
			it('should return truw if pth resolves to a path in this.pubDir, instance user is set to owner in permissions file, and is writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns({owner: instanceUser.uName});
				var testPath = "Users/elfo/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.true;
			
			});
			it('should return true if pth resolves to a path in this.pubDir, instance user is not set to owner in permissions file but is granted write access, and is writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = {owner: altUser.uName};
				testPerms[instanceUser.uName] = ['w']
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "Users/david/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.true;
			
			});
			it('should return a SystemError if this.sudo is false or users:sudoFullRoot is false in config, file is in root', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPath = "var/elfo/cage/config.d";
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
			
			});
			it('should return true if this.sudo is true, users:sudoFullRoot is true in config, file is in root, and writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPath = "var/elfo/cage/config.d";
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				expect(filesystem.isWritable(testPath)).to.be.true;
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
			
			});
			it('should return a systemError if pth resolves to a file that fs cannot write to', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				var accessSyncStub = sinon.stub(fs, 'accessSync').throws(SystemError.EACCES({syscall: 'write'}));
				var testPath = "var/elfo/cage/config.d";
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
			
			});
		
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
