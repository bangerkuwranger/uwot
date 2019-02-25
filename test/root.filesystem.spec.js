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
var testStats;

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
const notFoundUser = {
	"fName": "Mighty",
	"lName": "Mouse",
	"uName": "mightymouse",
	"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
	"sudoer": false,
	"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
	"createdAt": new Date(1546450800498),
	"updatedAt": new Date(1546450800498),
	"_id": "mightymouse",
	"verifyPassword": function(pass) {return true;},
	"maySudo": function() {return this.sudoer;}
};
const errorUser = {
	"fName": "drop",
	"lName": "all",
	"uName": "drop all",
	"password": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.P7VSbyZwmn/tfo6I9bPSx7uQ7SCNtpe",
	"sudoer": false,
	"salt": "$2a$16$KPBBkPbCBW./mwnXuoBYJ.",
	"createdAt": new Date(1546450800498),
	"updatedAt": new Date(1546450800498),
	"_id": "()",
	"verifyPassword": function(pass) {return true;},
	"maySudo": function() {return this.sudoer;}
};

const UWOT_HIDDEN_PERMISSIONS_FILENAME = '.uwotprm';

const readdirFileArray = [
	'kyoto.term',
	'water_plant.map',
	'phor.texture'
];

const getTestStats = function() {

	var thisTestStats = new fs.Stats(
		{
			dev: 2114,
			ino: 48064969,
			mode: 33188,
			nlink: 1,
			uid: 85,
			gid: 100,
			rdev: 0,
			size: 527,
			blksize: 4096,
			blocks: 8,
			atimeMs: 1318289051000.1,
			mtimeMs: 1318289051000.1,
			ctimeMs: 1318289051000.1,
			birthtimeMs: 1318289051000.1,
			atime: new Date('Mon, 10 Oct 2011 23:24:11 GMT'),
			mtime: new Date('Mon, 10 Oct 2011 23:24:11 GMT'),
			ctime: new Date('Mon, 10 Oct 2011 23:24:11 GMT'),
			birthtime: new Date('Mon, 10 Oct 2011 23:24:11 GMT')
		}
	);
	thisTestStats.isDirectory = function() { return false };
	thisTestStats.isFile = function() { return false };
	return thisTestStats;

};

const getTestPerms = function() {

	return JSON.stringify({
		owner: 'mortimerhemp',
		allowed: ['r','x'],
		fuser: ['r', 'w', 'x']
	});

};

describe('filesystem.js', function() {

	describe('UwotFs', function() {
	
		beforeEach(function() {
		
			const dbFindStub = sinon.stub(global.Uwot.Users, 'findById').callsFake(function returnUserDoc(id, callback) {
		
				if (id === altUser['_id']) {
				
					return callback(false, altUser);
				
				}
				else if (id === notFoundUser['_id']) {
				
					return callback(false, false);
				
				}
				else if (id === errorUser['_id']) {
				
					return callback(new Error('test findById error'), null);
				
				}
				else {
				
					return callback(false, instanceUser);
				
				}
	
			});
			var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').callsFake(function testUserList(cb) {
		
				return cb(false, [
					instanceUser,
					altUser,
					notFoundUser,
					errorUser
				]);
		
			});
			filesystem = new FileSystem('CDeOOrH0gOg791cZ');
			listUsersStub.restore();
			testStats = getTestStats();
		});
		afterEach(function() {
		
			sinon.restore();
		
		});
		describe('constructor(userId, cwd)', function() {
		
			it('should be a function', function() {
			
				expect(FileSystem).to.be.a('function');
			
			});
			it('should throw an error if listUsers returns an error to callback', function() {
			
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').callsFake(function testUserList(cb) {
		
					return cb(new Error('test listUsers error'), null);
		
				});
				function throwListUsersError() {
				
					return new FileSystem('CDeOOrH0gOg791cZ');
				
				}
				expect(throwListUsersError).to.throw(Error, 'test listUsers error');
			
			});
			it('should assign the array of user objects returned to callback of listUsers to this.validUsers if listUsers executes without error', function() {
			
				var users = [
					instanceUser,
					altUser,
					notFoundUser,
					errorUser
				];
				expect(filesystem.validUsers).to.deep.equal(users);
			
			});
			it('should assign guest to this.user and assign "" to this.cwd if given no arguments', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				filesystem = new FileSystem();
				expect(filesystem.user.uName).to.equal('guest');
				expect(filesystem.cwd).to.equal('');
			
			});
			it('should assign guest to this.user and assign "/" to this.cwd if userId arg is not a string and cwd arg is not a string', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				filesystem = new FileSystem(null, null);
				expect(filesystem.user.uName).to.equal('guest');
				expect(filesystem.cwd).to.equal('');
			
			});
			it('should assign guest to this.user and assign "/" to this.cwd if userId does not match existing user and cwd arg is not a string', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				filesystem = new FileSystem(notFoundUser["_id"], null);
				expect(filesystem.user.uName).to.equal('guest');
				expect(filesystem.cwd).to.equal('');
			
			});
			it('should assign user matching given userId arg to this.user and assign user directory to this.cwd if userId arg is a string matching an existing user and cwd arg is not a string', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = 'string' == typeof this_userDir_path ? this_userDir_path : '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				var this_userDir_path = "home/" + instanceUser.uName;
				filesystem = new FileSystem(instanceUser["_id"], null);
				expect(filesystem.user.uName).to.equal(instanceUser["uName"]);
				expect(filesystem.cwd).to.equal(this_userDir_path);
			
			});
			it('should set this.cwd to value of cwd arg if it is a string', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.changeCwd('guest' !== typeof this.user.uName ? 'home/' + this.user.uName : '');
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				var testCwd = 'var';
				filesystem = new FileSystem(instanceUser["_id"], testCwd);
				expect(filesystem.user.uName).to.equal(instanceUser["uName"]);
				expect(filesystem.cwd).to.equal(testCwd);
				filesystem = new FileSystem(notFoundUser["_id"], testCwd);
				expect(filesystem.user.uName).to.equal('guest');
				expect(filesystem.cwd).to.equal(testCwd);
			
			});
			it('should throw an Error if global.Uwot.Users.getGuest returns an error via callback', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				var getGuestStub = sinon.stub(global.Uwot.Users, 'getGuest').callsFake(function hasError(cb) {
				
					return cb(new Error('test getGuest error'), null);
				
				});
				function throwError() {
				
					filesystem = new FileSystem();
					return filesystem;
				
				}
				expect(throwError).to.throw(Error, 'test getGuest error');
			
			});
			it('should throw an Error if global.Uwot.Users.findById returns an error via callback', function() {
			
				var setDirsStub = sinon.stub(FileSystem.prototype, 'setDirs').callsFake(function setDefaultCwd() {
				
					if ('string' !== typeof this.cwd) {
					
						this.cwd = '';
					
					}
				
				});
				var changeCwdStub = sinon.stub(FileSystem.prototype, 'changeCwd').callsFake(function justSetIt(pth) {
				
					if ('string' === typeof pth) {
					
						this.cwd = pth;
						return true;
					
					}
				
				});
				function throwError() {
				
					filesystem = new FileSystem(errorUser["_id"]);
					return filesystem;
				
				}
				expect(throwError).to.throw(Error, 'test findById error');
			
			});
		
		});
		describe('setDirs()', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.setDirs).to.be.a('function');
			
			});
			it('should create object this.root and assign global appRoot constant + "/fs" to this.root.path', function() {
			
				expect(filesystem.root).to.be.an('object').with.property('path').that.equals(global.Uwot.Constants.appRoot + "/fs");
			
			});
			it('should create object this.pubDir and assign global config setting for pubDir to this.pubDir.path', function() {
			
				expect(filesystem.pubDir).to.be.an('object').with.property('path').that.equals(global.Uwot.Config.get('server', 'pubDir'));
			
			});
			it('should assign null to this.userDir if this.user is a guest', function(done) {
			
				global.Uwot.Users.getGuest(function(error, guestUser) {
				
					filesystem.user = guestUser;
					filesystem.setDirs();
					expect(filesystem.userDir).to.be.null;
					done();
				
				});
			
			});
			it('should create object this.userDir and assign global config userDir + "/{this.user.uName}" to this.userDir.path if user is not a guest.', function() {
			
				expect(filesystem.userDir).to.be.an('object').with.property('path').that.equals(global.Uwot.Config.get('server', 'userDir') + path.sep + instanceUser.uName);
			
			});
		
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
		
			it('should be a function', function() {
			
				expect(filesystem.changeCwd).to.be.a('function');
			
			});
			it('should return a TypeError if pth arg is not a string', function() {
			
				expect(filesystem.changeCwd()).to.be.an.instanceof(TypeError).with.property('message').that.equals('path must be a string');
			
			});
			it('should return a TypeError if path cannot be resolved', function() {
			
				var pathResolveStub = sinon.stub(path, 'resolve').throws(new TypeError('test resolve error'));
				expect(filesystem.changeCwd('/var')).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve error');
			
			});
			it('should return an error if this.isReadable returns an error', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: "read", path: testPath}));
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if resolved path is not readable by user', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return true and set this.cwd to resolved relative path from VFS root if resolved path is readable by user', function() {
			
				var testPath = '/var/toad/hole';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				expect(filesystem.changeCwd(testPath)).to.be.true;
				expect(filesystem.cwd).to.equal('var/toad/hole');
			
			});
		
		});
		describe('getVcwd()', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getVcwd).to.be.a('function');
			
			});
			it('should return a string === "/" + this.cwd if this.cwd is a string', function() {
			
				filesystem.cwd = "var/run/marathon2";
				expect(filesystem.getVcwd()).to.equal("/var/run/marathon2");
			
			});
			it('should return "/" if this.cwd. is not set, empty string, or not a string', function() {
			
				delete filesystem.cwd;
				expect(filesystem.getVcwd()).to.equal("/");
				filesystem.cwd = "";
				expect(filesystem.getVcwd()).to.equal("/");
				filesystem.cwd = null;
				expect(filesystem.getVcwd()).to.equal("/");
			
			});
		
		});
		describe('getCwd()', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getCwd).to.be.a('function');
			
			});
			it('should return the absolute path of this.cwd if this.cwd is a string', function() {
			
				var testRootDir = global.Uwot.Constants.appRoot + "/fs";
				filesystem.cwd = "var/run/marathon2";
				expect(filesystem.getCwd()).to.equal(testRootDir + "/var/run/marathon2");
			
			});
			it('should return absolute path to this.rootDir.path if this.cwd is not set, an empty string, or not a string', function() {
			
				var testRootDir = global.Uwot.Constants.appRoot + "/fs";
				delete filesystem.cwd;
				expect(filesystem.getCwd()).to.equal(testRootDir);
				filesystem.cwd = "";
				expect(filesystem.getCwd()).to.equal(testRootDir);
				filesystem.cwd = null;
				expect(filesystem.getCwd()).to.equal(testRootDir);
			
			});
		
		});
		describe('append(pth, data)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.append).to.be.a('function');
			
			});
			it('should return an error if pth is relative or absolute but not resolved to VFS root and this.resolvePath(pth, false) returns an error', function() {
			
				var testPath = 'var/run/marathon2/kytoto.term';
				var testData = 'The candles burn out for you; I am free.';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'));
				expect(filesystem.append(testPath, testData)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
				expect(filesystem.append("/" + testPath, testData)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if this.isWritable(pth) returns an error', function() {
			
				var testPath = 'var/run/marathon2/kytoto.term';
				var testData = 'The candles burn out for you; I am free.';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.ENOENT({syscall: 'write', path: testPath}));
				expect(filesystem.append(testPath, testData)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if pth arg points to a location that is not writable by user', function() {
			
				var testPath = 'var/run/marathon2/kytoto.term';
				var testData = 'The candles burn out for you; I am free.';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.append(testPath, testData)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if path is writable but appendFileSync throws an error', function() {
			
				var testPath = 'var/run/marathon2/kytoto.term';
				var testData = 'The candles burn out for you; I am free.';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').throws(new Error('test appendFileSync error'));
				expect(filesystem.append(testPath, testData)).to.be.an.instanceof(Error).with.property('message').that.equals('test appendFileSync error');
			
			});
			it('should return true and append data arg to file at pth if path is writable and appendFileSync is successful', function() {
			
				var testPath = 'var/run/marathon2/kytoto.term';
				var testData = 'The candles burn out for you; I am free.';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				expect(filesystem.append(testPath, testData)).to.be.true;
				expect(filesystem.append(path.resolve(filesystem.root.path + '/', testPath), testData)).to.be.true;
			
			});
		
		});
		describe('copy(source, target)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.copy).to.be.a('function');
			
			});
			it('should return an error if source is relative or is an absolute path that does not resolve to VFS root, and this.resolvePath(source, false) returns an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = 'etc/daemon/belial.cfg';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').callsFake(function returnErrorOrPath(pth) {
					
					if ('string' == typeof pth && -1 === pth.indexOf('belial')) {
					
						return SystemError.ENOENT({syscall: 'read', path: testReadPath});
					
					}
					else {
					
						return path.resolve(filesystem.root.path, pth);
					
					}
				
				});
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if target is relative or is an absolute path that does not resolve to VFS root, and this.resolvePath(target, false) returns an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = 'etc/daemon/belial.cfg';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').callsFake(function returnErrorOrPath(pth) {
					
					if ('string' == typeof pth && -1 === pth.indexOf('diablo')) {
					
						return SystemError.ENOENT({syscall: 'read', path: testWritePath});
					
					}
					else {
					
						return path.resolve(filesystem.root.path, pth);
					
					}
				
				});
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if this.isReadable(source) returns an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'read', path: testReadPath}));
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an systemError if user is not allowed to read file at source', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if this.isWriteable(target) returns an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.EIO({syscall: 'write', path: testWritePath}));
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should return a systemError if user is not allowed to write to location of target', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if copyFileSync(source, target) throws an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').throws(SystemError.ENOENT({syscall: 'copyfile', path: testReadPath, dest: testWritePath}));
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return true and copy contents of file at source to location of target if source is readable by user, target is writable by user, and copyFileSync executes without error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.true;
				expect(filesystem.copy(path.resolve(filesystem.root.path, testReadPath.replace(/^\/+/g, '')), testWritePath)).to.be.true;
				expect(filesystem.copy(testReadPath, path.resolve(filesystem.root.path, testWritePath.replace(/^\/+/g, '')))).to.be.true;
			
			});
		
		});
		describe('createDir(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.createDir).to.be.a('function');
			
			});
			it('should return an error if pth is relative and this.resolvePath(pth, false) returns an error', function() {
			
				var testPath = "var/run/marathon2";
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'))
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.ENOENT({syscall: 'write', path: testPath}));
				expect(filesystem.createDir(testPath)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if this.isWritable returns an error', function() {
			
				var testPath = "var/run/marathon2";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.ENOENT({syscall: 'write', path: testPath}));
				expect(filesystem.createDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals("ENOENT");
			
			});
			it('should return a systemError if user is not allowed to write to location at pth', function() {
			
				var testPath = "var/run/marathon2";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.createDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals("EACCES");
			
			});
			it('should return an error if mkdirSync throws an error', function() {
			
				var testPath = "var/run/marathon2";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var mkdirSyncStub = sinon.stub(fs, 'mkdirSync').throws(SystemError.EACCES({syscall: 'write', path: testPath}));
				expect(filesystem.createDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals("EACCES");
			
			});
			it('should return true and create a new directory at pth if pth is absolute,  user is allowed to write to location at pth and mkdirSync completes without error', function() {
			
				var testPath = "/var/run/marathon2";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var mkdirSyncStub = sinon.stub(fs, 'mkdirSync').returns(true);
				expect(filesystem.createDir(testPath)).to.equal(path.resolve(filesystem.root.path, testPath.replace(/^\/+/g, '')));
			
			});
			it('should return true and create a directory at path VFS root + pth if pth is relative or an absolute path not containing this.root.path, user is allowed to write at location of pth, and mkDirSync completes without error', function() {
			
				var testPath = "var/run/marathon2";
				var fullPath = path.resolve(filesystem.root.path, testPath);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var mkdirSyncStub = sinon.stub(fs, 'mkdirSync').returns(true);
				expect(filesystem.createDir(testPath)).to.equal(fullPath);
				expect(filesystem.createDir(fullPath)).to.equal(fullPath);
			
			});
		
		});
		describe('readDir(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.readDir).to.be.a('function');
			
			});
			it('should return an error if path is not absolute and this.resolvePath(pth, false) throws an error', function() {
			
				var testPath = "var/run/marathon2/level4";
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').throws(new TypeError('test resolvePath error'));
				expect(filesystem.readDir(testPath)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if isReadable returns an error', function() {
			
				var testPath = "var/run/marathon2/level4";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.readDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to read location at pth', function() {
			
				var testPath = "var/run/marathon2/level4";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				expect(filesystem.readDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if readdirSync throws an error', function() {
			
				var testPath = "var/run/marathon2/level4";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readdirSyncStub = sinon.stub(fs, 'readdirSync').throws(SystemError.EIO({syscall: 'read', path: testPath}));
				expect(filesystem.readDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should return an array of file names of files in dir at pth if path is absolute and user is allowed to read location at pth', function() {
			
				var testPath = path.join(global.Uwot.Constants.appRoot, "/fs/var/run/marathon2/level4");
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readdirFileArrayAbs = [];
				var readdirSyncStub = sinon.stub(fs, 'readdirSync').callsFake(function returnAbsolute(pth) {
				
					for (let i = 0; i < readdirFileArray.length; i++) {
					
						readdirFileArrayAbs[i] = 'absolute_' + readdirFileArray[i];
					
					}
					return readdirFileArrayAbs;
					
				});
				var testReaddir = filesystem.readDir(testPath);
				expect(testReaddir[0]).to.equal(readdirFileArrayAbs[0]);
				expect(testReaddir[1]).to.equal(readdirFileArrayAbs[1]);
				expect(testReaddir[2]).to.equal(readdirFileArrayAbs[2]);
			
			});
			it('should return an array of file names of files in dir at appRoot + "/fs/" + pth if path is relative and user is allowed to read location at pth', function() {
			
				var testPath = "var/run/marathon2/level4";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readdirSyncStub = sinon.stub(fs, 'readdirSync').returns(readdirFileArray);
				var testReaddir = filesystem.readDir(testPath);
				expect(testReaddir).to.be.an('array').that.includes(readdirFileArray[0], readdirFileArray[1], readdirFileArray[2]);
			
			});
		
		});
		describe('readFile(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.readFile).to.be.a('function');
			
			});
			it('should return an error if path is relative and does not contain the root path and path.resolve throws an error', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				var pathResolveStub = sinon.stub(path, 'resolve').throws(new TypeError('test resolve error'));
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve error');
			
			});
			it('should return an error if isReadable throws an error', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				var testResolvedPath = path.resolve(global.Uwot.Constants.appRoot + '/fs', testPath);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'read', path: testPath}));
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to read location at pth', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				var testResolvedPath = path.resolve(global.Uwot.Constants.appRoot + '/fs', testPath);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if readFileSync throws an error', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				var testResolvedPath = path.resolve(global.Uwot.Constants.appRoot + '/fs', testPath);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').throws(SystemError.EISDIR({syscall: 'read', path: testPath}));
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.be.an.instanceof(Error).with.property('code').that.equals('EISDIR');
			
			});
			it('should return the content of the file at this.root + pth if pth is relative and does not contain the VFS root path, user is allowed to read location at pth, and readFileSync executes without error', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				var testResolvedPath = path.resolve(global.Uwot.Constants.appRoot + '/fs', testPath);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returnsArg(0);
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.equal(testResolvedPath);
			
			});
			it('should return the content of the file at this.root.path + pth if pth is absolute and does not contain the VFS root path, user is allowed to read location at pth, and readFileSync executes without error', function() {
			
				var testPath = path.join('/var/run/marathon2/level4', readdirFileArray[0]);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returnsArg(0);
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.equal(filesystem.root.path + testPath);
			
			});
			it('should return the content of the file at pth if pth is absolute and does contain the VFS root path, user is allowed to read location at pth, and readFileSync executes without error', function() {
			
				var testPath = path.join(filesystem.root.path + '/var/run/marathon2/level4', readdirFileArray[0]);
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returnsArg(0);
				var testReadFile = filesystem.readFile(testPath);
				expect(testReadFile).to.equal(testPath);
			
			});
		
		});
		describe('moveFile(source, target)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.moveFile).to.be.a('function');
			
			});
			it('should return an error if source is either relative or does not contain this.root.path and this.resolvePath(source, false) returns an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolve source error'));
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve source error');
				expect(filesystem.moveFile("/" + testPathSource, testPathTarget)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve source error');
			
			});
			it('should return an error if target is either relative or does not contain this.root.path and this.resolvePath(target, false) returns an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').callsFake(function returnErrorIfTarg(pth, checkExists) {
				
					if (-1 !== pth.indexOf('usr/local/bin')) {
					
						return new TypeError('test resolve target error');
					
					}
					else {
					
						return path.resolve(filesystem.root.path + pth);
					
					}
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve target error');
				expect(filesystem.moveFile(testPathSource, "/" + testPathTarget)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve target error');
			
			});
			it('should return an error if isReadable(source) returns an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'read', path: testPathSource}));
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if isWritable(source) returns an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').callsFake(function returnErrorIfNotTarg(pth) {
				
					if (-1 === pth.indexOf('usr/local/bin')) {
					
						return SystemError.ENOENT({syscall: 'write', path: testPathSource});
					
					}
					else {
					
						return path.resolve(filesystem.root.path + pth);
					
					}
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if isWritable(target) returns an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').callsFake(function returnErrorIfTarg(pth) {
				
					if (-1 !== pth.indexOf('usr/local/bin')) {
					
						return SystemError.ENOENT({syscall: 'write', path: testPathTarget});
					
					}
					else {
					
						return path.resolve(filesystem.root.path + pth);
					
					}
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to read file at source', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return a systemError if user is not allowed to write file at source', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').callsFake(function returnErrorIfNotTarg(pth) {
				
					if (-1 === pth.indexOf('usr/local/bin')) {
					
						return false
					
					}
					else {
					
						return path.resolve(filesystem.root.path + pth);
					
					}
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return a systemError if user is not allowed to write file at target', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').callsFake(function returnErrorIfTarg(pth) {
				
					if (-1 !== pth.indexOf('usr/local/bin')) {
					
						return false
					
					}
					else {
					
						return path.resolve(filesystem.root.path + pth);
					
					}
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if renameSync throws an error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var renameSyncStub = sinon.stub(fs, 'renameSync').throws(SystemError.EIO({syscall: 'rename', path: testPathSource}));
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should return true and move file from source to target if user has proper permissions and renameSync executes without error', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var finalPaths = {new:'', old:''};
				var renameSyncStub = sinon.stub(fs, 'renameSync').callsFake(function setFinalPaths(o, n) {
				
					finalPaths.new = n;
					finalPaths.old = o;
					return finalPaths;
				
				});
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
				expect(filesystem.moveFile("/" + testPathSource, testPathTarget)).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
				expect(filesystem.moveFile("/" + testPathSource, "/" + testPathTarget)).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
				expect(filesystem.moveFile(testPathSource, "/" + testPathTarget)).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
				expect(filesystem.moveFile(path.resolve(filesystem.root.path, testPathSource), testPathTarget)).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
				expect(filesystem.moveFile(testPathSource, path.resolve(filesystem.root.path, testPathTarget))).to.be.true;
				expect(finalPaths.old).to.equal(path.resolve(filesystem.root.path, testPathSource));
				expect(finalPaths.new).to.equal(path.resolve(filesystem.root.path, testPathTarget));
			
			});
		
		});
		describe('removeDir(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.removeDir).to.be.a('function');
			
			});
			it('should return an error if path is relative or absolute and not resolved to root, and resolvePath returns an error', function() {
			
				var testPath = 'two/roads/diverged';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.removeDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if isWritable throws an error', function() {
			
				var testPath = 'two/roads/diverged';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.ENOENT({syscall: 'rmdir', path: testPath}));
				expect(filesystem.removeDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to write to location at pth', function() {
			
				var testPath = 'two/roads/diverged';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.removeDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if rmdirSync throws an error', function() {
			
				var testPath = 'two/roads/diverged';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var rmdirSyncStub = sinon.stub(fs, 'rmdirSync').throws(SystemError.ENOTDIR({syscall: 'rmdir', path: testPath}));
				expect(filesystem.removeDir(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOTDIR');
			
			});
			it('should return true and remove directory at pth if user has proper permissions and rmdirSync executes without error', function() {
			
				var testPath = 'two/roads/diverged';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var rmdirSyncStub = sinon.stub(fs, 'rmdirSync').returns(true);
				expect(filesystem.removeDir(testPath)).to.be.true;
				expect(filesystem.removeDir("/" + testPath)).to.be.true;
				expect(filesystem.removeDir(path.join(filesystem.root.path + "/", testPath))).to.be.true;
			
			});
		
		});
		describe('removeFile(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.removeFile).to.be.a('function');
			
			});
			it('should return an error if pth is relative or an absolute path that does not contain the this.root.path, and resolvePath throws an error', function() {
			
				var testPath = 'two/roads/diverged/inAWood.txt';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'));
				expect(filesystem.removeFile(testPath)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if isWritable throws an error', function() {
			
				var testPath = 'two/roads/diverged/inAWood.txt';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.removeFile(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to write to location at pth', function() {
			
				var testPath = 'two/roads/diverged/inAWood.txt';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.removeFile(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if unlinkSync throws an error', function() {
			
				var testPath = 'two/roads/diverged/inAWood.txt';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var unlinkSyncStub = sinon.stub(fs, 'unlinkSync').throws(SystemError.EROFS({syscall: 'unlink', path: testPath}));
				expect(filesystem.removeFile(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EROFS');
			
			});
			it('should return true and remove file at pth if user has proper permissions and unlinkSync executes without error', function() {
			
				var testPath = 'two/roads/diverged/inAWood.txt';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var unlinkSyncStub = sinon.stub(fs, 'unlinkSync').returns(true);
				expect(filesystem.removeFile(testPath)).to.be.true;
				expect(filesystem.removeFile("/" + testPath)).to.be.true;
				expect(filesystem.removeFile(path.join(filesystem.root.path + "/", testPath))).to.be.true;
			
			});
		
		});
		describe('stat(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.stat).to.be.a('function');
			
			});
			it('should return an error if pth is relative or an absolute path not resolved to this.root.path, and resolvePath returns an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'));
				expect(filesystem.stat(testPath)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if isReadable returns an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.stat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to read location at pth', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				expect(filesystem.stat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an Error if fs.statSync throws an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.EPERM({syscall: 'stat', path: testPath}));
				expect(filesystem.stat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a Stats object if user has proper permissions and statSync executes without error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.stat(testPath)).to.be.an.instanceof(fs.Stats);
				expect(filesystem.stat("/" + testPath)).to.be.an.instanceof(fs.Stats);
				expect(filesystem.stat(path.join(filesystem.root.path + "/", testPath))).to.be.an.instanceof(fs.Stats);
			
			});
		
		});
		describe('write(pth, data)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.write).to.be.a('function');
			
			});
			it('should return an error if pth is relative or an absolute path not resolved to this.root.path, and resolvePath returns an error', function() {
			
				var testPath = 'var/run/marathon2/level4/kyoto.term';
				var testData = "....n 15 ~~~~~~Be~rn border of the Roman Empire to the Danube \n\r River.  During a skirmish with barbarians in Raetiain the \n\r mountains near the borof modern France and Switzerland), 117 \n\r men under Gaius Licinius MarcW#&I~?f/f/xxfxfff`~~~ \n\r THM@#%!@# \n\r 233nce of weird and frightening monsters under his control, \n\r many successful raidsecty the fall of the Roman Empire and \n\r remained unmolested until the ninth un~~~ \n\r written ls into the lex vita.  Clovis moved the settlement \n\r farther south i the mountains, nearer the spring, to escape \n\r Clovis remain```` \n\r ~fxf´f`~Fxff´xf~~~~ \n\r however, carried out reforms before their deaths which slowly \n\r integrated their people secretly into world society, which are \n\r now scattered all over the globe- to meet only once every \n\r seven years in southeast France~FFFffxfffffF?F?FF?Ff must \n\r be chosen.";
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'));
				expect(filesystem.write(testPath, testData)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if isWritable returns an error', function() {
			
				var testPath = 'var/run/marathon2/level4/kyoto.term';
				var testData = "....n 15 ~~~~~~Be~rn border of the Roman Empire to the Danube \n\r River.  During a skirmish with barbarians in Raetiain the \n\r mountains near the borof modern France and Switzerland), 117 \n\r men under Gaius Licinius MarcW#&I~?f/f/xxfxfff`~~~ \n\r THM@#%!@# \n\r 233nce of weird and frightening monsters under his control, \n\r many successful raidsecty the fall of the Roman Empire and \n\r remained unmolested until the ninth un~~~ \n\r written ls into the lex vita.  Clovis moved the settlement \n\r farther south i the mountains, nearer the spring, to escape \n\r Clovis remain```` \n\r ~fxf´f`~Fxff´xf~~~~ \n\r however, carried out reforms before their deaths which slowly \n\r integrated their people secretly into world society, which are \n\r now scattered all over the globe- to meet only once every \n\r seven years in southeast France~FFFffxfffffF?F?FF?Ff must \n\r be chosen.";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.EPERM({syscall: 'write', path: testPath}));
				expect(filesystem.write(testPath, testData)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a systemError if user is not allowed to write to location at pth', function() {
			
				var testPath = 'var/run/marathon2/level4/kyoto.term';
				var testData = "....n 15 ~~~~~~Be~rn border of the Roman Empire to the Danube \n\r River.  During a skirmish with barbarians in Raetiain the \n\r mountains near the borof modern France and Switzerland), 117 \n\r men under Gaius Licinius MarcW#&I~?f/f/xxfxfff`~~~ \n\r THM@#%!@# \n\r 233nce of weird and frightening monsters under his control, \n\r many successful raidsecty the fall of the Roman Empire and \n\r remained unmolested until the ninth un~~~ \n\r written ls into the lex vita.  Clovis moved the settlement \n\r farther south i the mountains, nearer the spring, to escape \n\r Clovis remain```` \n\r ~fxf´f`~Fxff´xf~~~~ \n\r however, carried out reforms before their deaths which slowly \n\r integrated their people secretly into world society, which are \n\r now scattered all over the globe- to meet only once every \n\r seven years in southeast France~FFFffxfffffF?F?FF?Ff must \n\r be chosen.";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.write(testPath, testData)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an error if writeFileSync throws an error', function() {
			
				var testPath = 'var/run/marathon2/level4/kyoto.term';
				var testData = "....n 15 ~~~~~~Be~rn border of the Roman Empire to the Danube \n\r River.  During a skirmish with barbarians in Raetiain the \n\r mountains near the borof modern France and Switzerland), 117 \n\r men under Gaius Licinius MarcW#&I~?f/f/xxfxfff`~~~ \n\r THM@#%!@# \n\r 233nce of weird and frightening monsters under his control, \n\r many successful raidsecty the fall of the Roman Empire and \n\r remained unmolested until the ninth un~~~ \n\r written ls into the lex vita.  Clovis moved the settlement \n\r farther south i the mountains, nearer the spring, to escape \n\r Clovis remain```` \n\r ~fxf´f`~Fxff´xf~~~~ \n\r however, carried out reforms before their deaths which slowly \n\r integrated their people secretly into world society, which are \n\r now scattered all over the globe- to meet only once every \n\r seven years in southeast France~FFFffxfffffF?F?FF?Ff must \n\r be chosen.";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').throws(SystemError.EPERM({syscall: 'write', path: testPath}));
				expect(filesystem.write(testPath, testData)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return true and write data to beginning of file at pth if user has proper permissions and writeFileSync executes without error', function() {
			
				var testPath = 'var/run/marathon2/level4/kyoto.term';
				var testData = "....n 15 ~~~~~~Be~rn border of the Roman Empire to the Danube \n\r River.  During a skirmish with barbarians in Raetiain the \n\r mountains near the borof modern France and Switzerland), 117 \n\r men under Gaius Licinius MarcW#&I~?f/f/xxfxfff`~~~ \n\r THM@#%!@# \n\r 233nce of weird and frightening monsters under his control, \n\r many successful raidsecty the fall of the Roman Empire and \n\r remained unmolested until the ninth un~~~ \n\r written ls into the lex vita.  Clovis moved the settlement \n\r farther south i the mountains, nearer the spring, to escape \n\r Clovis remain```` \n\r ~fxf´f`~Fxff´xf~~~~ \n\r however, carried out reforms before their deaths which slowly \n\r integrated their people secretly into world society, which are \n\r now scattered all over the globe- to meet only once every \n\r seven years in southeast France~FFFffxfffffF?F?FF?Ff must \n\r be chosen.";
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').returns(true);
				expect(filesystem.write(testPath, testData)).to.be.true;
				expect(filesystem.write("/" + testPath, testData)).to.be.true;
				expect(filesystem.write(path.join(filesystem.root.path + "/", testPath), testData)).to.be.true;
			
			});
		
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
				expect(filesystem.resolvePath(testPath)).to.equal(filesystem.userDir.path + '/doc/');
			
			});
			it('should return this.root.path + pth if pth is absolute, resolves within root, and extant', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnTrue() {
			
					return true;
				
				});
				var testPath = '/var/doc';
				expect(filesystem.resolvePath(testPath)).to.equal(filesystem.root.path + testPath);
			
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
		describe('dissolvePath(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.dissolvePath).to.be.a('function');
			
			});
			it('should return pth unchanged if pth is not a string', function() {
			
				expect(filesystem.dissolvePath(null)).to.be.null;
			
			});
			it('should return pth unchanged if pth is relative or an absolute path that cannot be resolved to VFS root, pubdir, CWD, or userDir.', function() {
			
				var pthOne = 'var/run/marathon2';
				var pthTwo = '/Users/shunter2/burnward';
				expect(filesystem.dissolvePath(pthOne)).to.equal(pthOne);
				expect(filesystem.dissolvePath(pthTwo)).to.equal(pthTwo);
			
			});
			it('should replace this.userDir.path with an absolute path from VFS root to users directory in pth and return if pth is an absolute path resolved to a user directory', function() {
			
				var testPath = path.resolve(filesystem.userDir.path, 'shunter2/burnward');
				var testResult = '/home/fuser/shunter2/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
			
			});
			it('should replace this.pubDir.path with an absolute path from VFS root to public directory in pth and return if pth is an absolute path resolved to public directory', function() {
			
				var testPath = path.resolve(filesystem.pubDir.path, 'shunter2/burnward');
				var testResult = '/var/www/html/shunter2/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
			
			});
			it('should replace this.getCwd() value with an absolute path from VFS root to the CWD in pth and return if pth is an absolute path resolved to the current CWD', function() {
			
				filesystem.cwd = 'var/run'
				var testPath = path.resolve(filesystem.getCwd(), 'shunter2/burnward');
				var testResult = filesystem.getVcwd() + '/shunter2/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
				filesystem.cwd = 'home/fuser'
				testPath = path.resolve(filesystem.getCwd(), 'burnward');
				testResult = filesystem.getVcwd() + '/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
				filesystem.cwd = 'var/www/html/userPages'
				testPath = path.resolve(filesystem.getCwd(), 'shunter2/burnward');
				testResult = filesystem.getVcwd() + '/shunter2/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
				filesystem.cwd = ''
				testPath = path.resolve(filesystem.getCwd(), 'shunter2/burnward');
				testResult = '/shunter2/burnward';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
			
			});
			it('should remove this.root.path from pth and return if pth is an absolute path that resolves to root but no other variable named directory locations', function() {
			
				var testPath = filesystem.root.path + '/etc/comp/so/gnat/hus';
				var testResult = '/etc/comp/so/gnat/hus';
				expect(filesystem.dissolvePath(testPath)).to.equal(testResult);
			
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
		
			it('should be a function', function() {
			
				expect(filesystem.getPermissions).to.be.a('function');
			
			});
			it('should return a permissions object with owner:"root" and allowed:[] if pth is not in root, pubDir or userDir', function() {
			
				var testPath = '/Users/tmp/dropBox';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
			
			});
			it('should return a permissions object with owner:"root" and allowed:[] if is in root, not in pub or instance userDir, and either this.sudo === false or user:sudoFullRoot is false in config', function() {
			
				var testPath = path.resolve(filesystem.root.path + '/', 'tmp/dropBox');
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", false);
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", true);
				testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", false);
			
			});
			it('should return an error if pth points to a non-extant path', function() {
			
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return false if pth points to a directory and there is not valid JSON permissions data in the permissions file', function() {
			
				testStats.isDirectory = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('["test" : 123]');
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return a generic permissions object with the content of the permissions file in the directory if pth points to a directory and the permissions file contains valid JSON', function() {
			
				testStats.isDirectory = function() { return true; };
				var thesePerms = getTestPerms();
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(thesePerms);
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').callsFake(function testUserList(cb) {
					return cb(false, [
						instanceUser,
						altUser,
						notFoundUser,
						errorUser
					]);
				});
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return false if pth points to a directory and readFileSync throws an error trying to read the permissions file', function() {
			
				testStats.isDirectory = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').throws(SystemError.EISDIR({syscall: 'read', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return false if pth points to a file and there is not valid JSON permissions data in the permissions file of its enclosing directory', function() {
			
				testStats.isFile = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('["test" : 123]');
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return a permissions object with the content of the permissions file in the directory if pth points to a file and the permissions file in the enclosing directory contains valid JSON', function() {
			
				testStats.isFile = function() { return true; };
				var thesePerms = getTestPerms();
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(thesePerms);
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').callsFake(function testUserList(cb) {
					return cb(false, [
						instanceUser,
						altUser,
						notFoundUser,
						errorUser
					]);
				});
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return an error if pth points to a file and readFileSync throws an error trying to read the permissions file in the enclosing directory', function() {
			
				testStats.isFile = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').throws(SystemError.EISDIR({syscall: 'read', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return an ENOENT SystemError if pth is extant and in an allowed path, but points to neither a file nor a directory', function() {
			
				var testPath = 'tmp/dropBox';
				var thesePerms = getTestPerms();
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(thesePerms);
				var listUsersStub = sinon.stub(global.Uwot.Users, 'listUsers').callsFake(function testUserList(cb) {
					return cb(false, [
						instanceUser,
						altUser,
						notFoundUser,
						errorUser
					]);
				});
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
		
		});
		describe('setPermissions(pth, userName, permissions)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.setPermissions).to.be.a('function');
			
			});
			it('should return a systemError if !this.sudo or pth is not a string', function() {
			
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				filesystem.sudo = true;
				expect(filesystem.setPermissions(null, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
				filesystem.sudo = false;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a TypeError if userName is not a string or permissions is not a non-null object', function() {
			
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, null, testPerms)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user or permissions');
				expect(filesystem.setPermissions(testPath, testUName, null)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user or permissions');
			
			});
			it('should return an Error if userName does not match a user in the user db', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(false);
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('message').that.includes(': illegal user name');
			
			});
			it('should return a systemError if pth resolves to a path outside of root or users directory', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth target is not extant', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth cannot be resolved to a permissions file location', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var testStats = getTestStats();
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					if (pth === testPath) {
					
						return null;
					
					}
					else {
					
						return pthObj.dir;
					
					}
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(TypeError).with.property('message').that.includes('Path must be a string.');
			
			});
			it('should return an error if permissions file cannot be written', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var testStats = getTestStats();
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').throws(SystemError.EIO({syscall: 'write', path: testPath}));
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.includes('EIO');
			
			});
			it('should write permissions arg data as JSON to permissions file at pth if this.sudo, userName matches a user in db, path is extant and a directory, and permissions file does not exist', function() {
			
				var jsonOutput;
				var finalPath;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(false);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(JSON.parse(getTestPerms()));
				expect(finalPath).to.equal(testPath + path.sep + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should write permissions arg data as JSON to permissions file at directory enclosing file at pth if pth points to a file, this.sudo, userName matches a user in db, path is extant and a file, and permissions file does not exist', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(false);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(JSON.parse(getTestPerms()));
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should maintain the current allowed permission set if permissions arg does not have allowed property set and allowed value was previously set', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				testPerms.allowed = null;
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.allowed = ['r', 'w'];
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var testResult = JSON.parse(getTestPerms());
				testResult.allowed = ['r', 'w'];
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(testResult);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should keep the the owner value in the existing file if owner was not previously set to default, and permissions.user property is not set', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				testPerms.owner = null;
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.owner = 'fuser';
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var testResult = JSON.parse(getTestPerms());
				testResult.owner = 'fuser';
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(testResult);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should set the owner to the instance user if owner was previously set to default, permissions.user property is not set, and pth resolves to a path in instance userDir', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				delete testPerms.owner;
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.owner = 'root';
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var testResult = JSON.parse(getTestPerms());
				testResult.owner = 'fuser';
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(testResult);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should maintain any user specific permissions if any were previously set and the same user\'s permissions are not set in permissions arg', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = JSON.parse(getTestPerms());
				testPerms[notFoundUser.uName] = ['r'];
				delete testPerms[instanceUser.uName];
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms[instanceUser.uName] = ['w', 'x'];
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var testResult = JSON.parse(getTestPerms());
				testResult[notFoundUser.uName] = ['r'];
				testResult[instanceUser.uName] = ['w', 'x'];
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					return pthObj.dir;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function assignToVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return undefined;
				
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(testResult);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
		
		});
		describe('changeAllowed(pth, allowed)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.changeAllowed).to.be.a('function');
			
			});
			it('should return a SystemError if !this.sudo or pth is not a string', function() {
			
				filesystem.sudo = true;
				var testPath = null;
				var testAllowed = ['r', 'w', 'x'];
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
				filesystem.sudo = false;
				testPath = '/usr/local/bin';
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a TypeError if allowed is not an object, is null, or is not an array', function() {
			
				filesystem.sudo = true;
				var testPath = '/usr/local/bin';
				var testAllowed = "['r', 'w', 'x']";
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid allowed');
				testAllowed = null;
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid allowed');
				testAllowed = {'r': true, 'w': true, 'x': true};
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid allowed');
				
			});
			it('should return a SystemError if pth resolves outside of root, users, or public directories', function() {
			
				filesystem.sudo = true;
				var testPath = '/usr/local/bin';
				var testAllowed = ['r', 'w', 'x'];
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if UwotFsPermissions constructor throws an error', function() {
			
// 				var UwotFsPermissionsConstructorStub = sinon.stub(UwotFsPermissions, 'constructor').throws(new TypeError('argument of UwotFsPermissions constructor must be an object'));
				filesystem.sudo = true;
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testAllowed = ['r', 'w', 'x'];
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				throw new Error('need to stub the UwotFsPermissions toGeneric method to return a string rather than a valid object to trigger error here.');
				
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if absolute path to permissions file cannot be resolved', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if pth does not resolve to an extant path', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.EPERM({syscall: 'stat', path: testPath}));
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var pathResolveStub = sinon.stub(path, 'resolve').callsFake(function throwIfPermFile(pth, pth2, pth3) {
				
					if (UWOT_HIDDEN_PERMISSIONS_FILENAME === pth || UWOT_HIDDEN_PERMISSIONS_FILENAME === pth2 || UWOT_HIDDEN_PERMISSIONS_FILENAME === pth3) {
					
						return new TypeError('test resolve error');
					
					}
					else {
					
						return path.join('string' == typeof pth ? pth : '', 'string' == typeof pth2 ? pth2 : '', 'string' == typeof pth3 ? pth3 : '');
					
					}
				
				});
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve error');
			
			});
			it('should return an error if permissions file cannot be written', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.EPERM({syscall: 'stat', path: testPath}));
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').throws(SystemError.EPERM({syscall: 'write', path: testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME}));
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should write permissions arg data as JSON to permissions file at directory enclosing file at pth if this.sudo, pth is extant and a file, and permissions file does not exist', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.EPERM({syscall: 'stat', path: testPath}));
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should maintain the current owner if owner was previously set', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed
					}
				
				};
				delete testPrevPerms.fuser;
				var finalData = {
					owner: testPrevPerms.owner,
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should maintain any user specific permissions if any were previously set', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testPrevPerms.owner,
					allowed: testAllowed,
					fuser: testPrevPerms.fuser
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should change the permissions allowed value to value of allowed argument', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = JSON.parse(getTestPerms());
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testPrevPerms.owner,
					allowed: testAllowed,
					fuser: testPrevPerms.fuser
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput).allowed).to.deep.equal(testAllowed);
			
			});
		
		});
		describe('changeOwner(pth, userName)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.changeOwner).to.be.a('function');
			
			});
			it('should return a systemError if !this.sudo', function() {
			
				var testPath = '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = false;
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a TypeError if userName is not a string', function() {
			
				var testPath = '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				expect(filesystem.changeOwner(testPath, null)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user');
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				var testPath = '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				expect(filesystem.changeOwner(null, testUserName)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid path');
			
			});
			it('should return a systemError if listUsers returns an error');
			it('should return an error if userName does not match a user in the db');
			it('should return a systemError if pth does not resolve to a path inside of root or users');
			it('should return an error if pth resolves to a non-extant path');
			it('should return an error if fs cannot write to the permissions file at pth');
			it('should write a new JSON object with owner: "{userName}" to a permissions file at pth if pth resolves to a directory in root or users, this.sudo, userName matches a user in the db, and permissions were not previously set');
			it('should write only updated owner: "{userName}" in the JSON for the permissions file at pth if pth resolves to a directory in root or users, this.sudo, userName matches a user in the db, and permissions were not previously set');
			it('should write a new JSON object with owner: "{userName}" to a permissions file in the enclosing dir of pth if pth resolves to a file in root or users, this.sudo, userName matches a user in the db, and permissions were not previously set');
			it('should write only updated owner: "{userName}" in the JSON for the permissions file in the enclosing directory of pth if pth resolves to a file in root or users, this.sudo, userName matches a user in the db, and permissions were not previously set');
		
		});
		describe('isValidUserName(userName)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.isValidUserName).to.be.a('function');
			
			});
			it('should return false if userName !== any user.uName value in this.validUsers', function() {
			
				expect(filesystem.isValidUserName(instanceUser.uName)).to.be.true;
			
			});
			it('should return true if userName === any user.uName value in this.validUsers', function() {
			
				expect(filesystem.isValidUserName(instanceUser.uName + 'notAUser')).to.be.false;
			
			});
		
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
			it('should assign any other properties that are not owner or allowed to itself, if the property name matches a userName from the DB and the property value is an array containing only any or none of ["r", "w", "x"]');
		
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
