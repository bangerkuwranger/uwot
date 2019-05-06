var path = require('path');
var fs = require('fs-extra');
const EOL = require('os').EOL;
const SystemError = require('../helpers/systemError');
const globalSetupHelper = require('../helpers/globalSetup');

const sinon = require("sinon");
const chai = require("chai");
const sinonChai = require('sinon-chai');
const expect = chai.expect;

const FileSystem = require('../filesystem');
var filesystem;
var testStats;
var testPermissionsObj;
const DEFAULT_OWNER = 'root';

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
	thisTestStats.dev = 2114;
	thisTestStats.ino = 48064969;
	thisTestStats.mode = 33188;
	thisTestStats.nlink = 1;
	thisTestStats.uid = 85;
	thisTestStats.gid = 100;
	thisTestStats.rdev = 0;
	thisTestStats.size = 527;
	thisTestStats.blksize = 4096;
	thisTestStats.blocks = 8;
	thisTestStats.atimeMs = 1318289051000.1;
	thisTestStats.mtimeMs = 1318289051000.1;
	thisTestStats.ctimeMs = 1318289051000.1;
	thisTestStats.birthtimeMs = 1318289051000.1;
	thisTestStats.atime = new Date('Mon, 10 Oct 2011 23:24:11 GMT');
	thisTestStats.mtime = new Date('Mon, 10 Oct 2011 23:24:11 GMT');
	thisTestStats.ctime = new Date('Mon, 10 Oct 2011 23:24:11 GMT');
	thisTestStats.birthtime = new Date('Mon, 10 Oct 2011 23:24:11 GMT');
	return thisTestStats;

};

const getTestPerms = function() {

	return {
		owner: 'mortimerhemp',
		allowed: ['r','x'],
		fuser: ['r', 'w', 'x'],
		getUserPermsString: function(uname) { 
			var ua;
			if ('string' === uname) { 
				ua = this[uname];
			} 
			else { 
				ua = this.allowed
			}
			var permLine = '';
			if (-1 !== ua.indexOf('r')) {
	
				permLine += 'r';
	
			}
			else {
	
				permLine += '-';
	
			}
			if (-1 !== ua.indexOf('w')) {
	
				permLine += 'w';
	
			}
			else {
	
				permLine += '-';
	
			}
			if (-1 !== ua.indexOf('x')) {
	
				permLine += 'x';
	
			}
			else {
	
				permLine += '-';
	
			}
			return permLine;
		},
		toGeneric: function() {
	
			var genericPermissionsObj = {
				owner: 'string' === typeof this.owner ? this.owner : DEFAULT_OWNER,
				allowed: this.allowed
			};
			var permUsers = Object.keys(this);
			for (let i = 0; i < permUsers.length; i++) {
		
				if (this.hasOwnProperty(permUsers[i]) && 'owner' !== permUsers[i] && 'allowed' !== permUsers[i] && 'validUsers' !== permUsers[i] && 'object' === typeof this[permUsers[i]] && Array.isArray(this[permUsers[i]])) {
			
					genericPermissionsObj[permUsers[i]] = this[permUsers[i]];
			
				}
		
			}
			return genericPermissionsObj;
	
		},
		mayRead: function() { return true; },
		mayWrite: function() { return true; }
	};

};

const getDefaultPerms = function() {

	return {
		owner: 'root',
		allowed: [],
		getUserPermsString: function(uname) { 
			var ua;
			if ('string' === uname) { 
				ua = this[uname];
			} 
			else { 
				ua = this.allowed
			}
			var permLine = '';
			if (-1 !== ua.indexOf('r')) {
	
				permLine += 'r';
	
			}
			else {
	
				permLine += '-';
	
			}
			if (-1 !== ua.indexOf('w')) {
	
				permLine += 'w';
	
			}
			else {
	
				permLine += '-';
	
			}
			if (-1 !== ua.indexOf('x')) {
	
				permLine += 'x';
	
			}
			else {
	
				permLine += '-';
	
			}
			return permLine;
		},
		toGeneric: function() {
	
			var genericPermissionsObj = {
				owner: 'string' === typeof this.owner ? this.owner : DEFAULT_OWNER,
				allowed: this.allowed
			};
			var permUsers = Object.keys(this);
			for (let i = 0; i < permUsers.length; i++) {
		
				if (this.hasOwnProperty(permUsers[i]) && 'owner' !== permUsers[i] && 'allowed' !== permUsers[i] && 'validUsers' !== permUsers[i] && 'object' === typeof this[permUsers[i]] && Array.isArray(this[permUsers[i]])) {
			
					genericPermissionsObj[permUsers[i]] = this[permUsers[i]];
			
				}
		
			}
			return genericPermissionsObj;
	
		},
		mayRead: function() { return false; },
		mayWrite: function() { return false; }
	}

};

describe('filesystem.js', function() {

	before(function() {
	
		globalSetupHelper.initConstants();
		globalSetupHelper.initEnvironment();
	
	});
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
				expect(filesystem.cwd).to.equal('var');
			
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
		describe('setDirs(cwd)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.setDirs).to.be.a('function');
			
			});
			it('should create object this.root and assign global appRoot constant + "/fs" to this.root.path', function() {
			
				expect(filesystem.root).to.be.an('object').with.property('path').that.equals(global.Uwot.Constants.appRoot + "/fs");
			
			});
			it('should create object this.pubDir and assign global config setting for pubDir to this.pubDir.path', function() {
			
				expect(filesystem.pubDir).to.be.an('object').with.property('path').that.equals(global.Uwot.Config.getVal('server', 'pubDir'));
			
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
			
				expect(filesystem.userDir).to.be.an('object').with.property('path').that.equals(global.Uwot.Config.getVal('server', 'userDir') + path.sep + instanceUser.uName);
			
			});
			it('should set this.cwd to this.userDir.path if cwd is undefined and this.userDir is a non-null object', function() {
			
				var testPath = 'home/' + instanceUser.uName;
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function setCwd(pth) {
				
					this.cwd = pth.replace(this.root.path + '/', '');
					return true;
				
				});
				filesystem.setDirs();
				expect(filesystem.cwd).to.equal(testPath);
			
			});
			it('should set this.cwd to pubDir.path is cwd is undefined and this.userDir is null', function(done) {
			
				var testPath = global.Uwot.Config.getVal('server', 'pubDir').replace(filesystem.root.path + '/', '');
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function setCwd(pth) {
				
					this.cwd = pth.replace(this.root.path + '/', '');
					return true;
				
				});
				global.Uwot.Users.getGuest(function(error, guestUser) {
				
					filesystem.user = guestUser;
					filesystem.setDirs();
					expect(filesystem.cwd).to.equal(testPath);
					done();
				
				});
			
			});
			it('should set this.cwd to this.userDir.path if cwd is a string representing a path not readable by user and this.userDir is a non-null object', function() {
			
				var testPath = 'home/' + instanceUser.uName;
				var testCwd = '/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function setCwd(pth) {
				
					if (pth === '/var') {
					
						return SystemError.EPERM({syscall: 'read', path: pth});
					
					}
					else {
					
						this.cwd = pth.replace(this.root.path + '/', '');
						return true;
					
					}
				
				});
				filesystem.setDirs(testCwd);
				expect(filesystem.cwd).to.equal(testPath);
			
			});
			it('should set this.cwd to pubDir.path is cwd is a string representing a path not readable by user and this.userDir is null', function(done) {
			
				var testCwd = '/var';
				var testPath = global.Uwot.Config.getVal('server', 'pubDir').replace(filesystem.root.path + '/', '');
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function setCwd(pth) {
				
					if (pth === '/var') {
					
						return SystemError.EPERM({syscall: 'read', path: pth});
					
					}
					else {
					
						this.cwd = pth.replace(this.root.path + '/', '');
						return true;
					
					}
				
				});
				global.Uwot.Users.getGuest(function(error, guestUser) {
				
					filesystem.user = guestUser;
					filesystem.setDirs();
					expect(filesystem.cwd).to.equal(testPath);
					done();
				
				});
			
			});
			it('should set this.cwd to cwd value if cwd is a string representing a path readable by user', function() {
			
				var testPath = 'home/' + instanceUser.uName;
				var testCwd = '/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function setCwd(pth) {
							
					this.cwd = pth.replace(this.root.path + '/', '');
					return true;

				});
				filesystem.setDirs(testCwd);
				expect(filesystem.cwd).to.equal(testCwd);
			
			});
			
		
		});
		describe('cmd(cmdName, argArr, callback, isSudo)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.cmd).to.be.a('function');
			
			});
			it('should throw a TypeError if callback arg is not a function', function() {
			
				expect(filesystem.cmd).to.throw(TypeError, 'invalid callback passed to cmd');
			
			});
			it('should return an systemError to callback if cmdName arg is not a string', function(done) {
			
				filesystem.cmd(null, ['/usr/var'], function(error, result) {
				
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals("EINVAL");
					done();
				
				}, false);
			
			});
			it('should return an systemError to callback if cmdName arg string does not match a valid command name', function(done) {
			
				filesystem.cmd('format', ['/usr/var'], function(error, result) {
				
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals("EINVAL");
					done();
				
				}, false);
			
			});
			it('should return a systemError to callback if argArr arg is not an object', function(done) {
			
				filesystem.cmd('format', '/usr/var', function(error, result) {
				
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals("EINVAL");
					done();
				
				}, false);
			
			});
			it('should set argArr to an empty array if it is passed as null or non-array object', function(done) {
			
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnArgs() {
				
					return Array.from(arguments);
				
				});
				filesystem.cmd('cd', null, function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.be.an('array').that.is.empty;
					filesystem.cmd('cd', {path: '/usr/var'}, function(error, result) {
					
						expect(result).to.be.an('array').that.is.empty;
						done();
					
					});
				
				}, false);
			
			});
			it('should set this.sudo to true if isSudo argument === true and this.user.maySudo() returns true', function(done) {
			
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnSudo() {
				
					return this.sudo;
				
				});
				filesystem.cmd('cd', null, function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.be.true;
					done();
				
				}, true);
			
			});
			it('should set this.sudo to false if isSudo argument not a boolean, not true, or and this.user.maySudo() returns false', function(done) {
			
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnSudo() {
				
					return this.sudo;
				
				});
				filesystem.cmd('cd', null, function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.be.false;
					filesystem.cmd('cd', null, function(error, result) {
				
						expect(error).to.be.false;
						expect(result).to.be.false;
						filesystem.user.maySudo = function() { return false; };
						filesystem.cmd('cd', null, function(error, result) {
				
							expect(error).to.be.false;
							expect(result).to.be.false;
							done();
				
						}, true);
				
					}, 1);
				
				}, false);
			
			});
			it('should perform this.changeCwd if cmdName arg === "cd"', function(done) {
			
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnCmd() {
				
					return 'changeCwd ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('cd', ['/usr/var'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('changeCwd /usr/var');
					done();
				
				}, true);
			
			});
			it('should perform this.readDir if cmdName arg === "ls"', function(done) {
			
				var readDirStub = sinon.stub(filesystem, 'readDir').callsFake(function returnCmd() {
				
					return 'readDir ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('ls', [], function(error, result) {
				
					expect(error).to.be.false;
					expect(readDirStub.called).to.be.true;
					done();
				
				}, true);
			
			});
			it('should perform this.getVcwd if cmdName arg === "pwd"', function(done) {
			
				var getVcwdStub = sinon.stub(filesystem, 'getVcwd').callsFake(function returnCmd() {
				
					return 'getVcwd ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('pwd', null, function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('getVcwd ');
					done();
				
				}, true);
			
			});
			it('should perform this.createDir if cmdName arg === "mkdir"', function(done) {
			
				var createDirStub = sinon.stub(filesystem, 'createDir').callsFake(function returnCmd() {
				
					return 'createDir ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('mkdir', ['/usr/var'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('createDir /usr/var false');
					done();
				
				}, true);
			
			});
			it('should perform this.removeFile if cmdName arg === "rm"', function(done) {
			
				var removeFileStub = sinon.stub(filesystem, 'removeFile').callsFake(function returnCmd() {
				
					return 'removeFile ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('rm', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('removeFile /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.removeDir if cmdName arg === "rmdir"', function(done) {
			
				var removeDirStub = sinon.stub(filesystem, 'removeDir').callsFake(function returnCmd() {
				
					return 'removeDir ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('rmdir', ['/usr/var'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('removeDir /usr/var');
					done();
				
				}, true);
			
			});
			it('should perform this.moveFile if cmdName arg === "mv"', function(done) {
			
				var moveFileStub = sinon.stub(filesystem, 'moveFile').callsFake(function returnCmd() {
				
					return 'moveFile ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('mv', ['/usr/var/tmpfile', '/home/' + filesystem.user.uName + '/permfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.include('moveFile /usr/var/tmpfile /home/' + filesystem.user.uName + '/permfile');
					done();
				
				}, true);
			
			});
			it('should perform this.copy if cmdName arg === "cp"', function(done) {
			
				var copyStub = sinon.stub(filesystem, 'copy').callsFake(function returnCmd() {
				
					return 'copy ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('cp', ['/usr/var/tmpfile', '/home/' + filesystem.user.uName + '/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('copy /usr/var/tmpfile /home/' + filesystem.user.uName + '/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.stat if cmdName arg === "stat"', function(done) {
			
				var statStub = sinon.stub(filesystem, 'stat').callsFake(function returnCmd() {
				
					return 'stat ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('stat', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.equal('stat /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.append if cmdName arg === "touch"', function(done) {
			
				var touchStub = sinon.stub(filesystem, 'touch').callsFake(function returnCmd() {
				
					return 'touch ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('touch', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.include('touch /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.cat if cmdName arg === "cat"', function(done) {
			
				var catStub = sinon.stub(filesystem, 'cat').callsFake(function returnCmd() {
				
					return 'cat ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('cat', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.include('cat  /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.changeAllowed if cmdName arg === "chmod"', function(done) {
			
				var changeAllowedStub = sinon.stub(filesystem, 'changeAllowed').callsFake(function returnCmd() {
				
					return 'changeAllowed ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('chmod', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.include('changeAllowed /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should perform this.changeOwner if cmdName arg === "chown"', function(done) {
			
				var changeOwnerStub = sinon.stub(filesystem, 'changeOwner').callsFake(function returnCmd() {
				
					return 'changeOwner ' + Array.from(arguments).join(' ');
				
				});
				filesystem.cmd('chown', ['/usr/var/tmpfile'], function(error, result) {
				
					expect(error).to.be.false;
					expect(result).to.include('changeOwner /usr/var/tmpfile');
					done();
				
				}, true);
			
			});
			it('should return an error to callback and set this.sudo to false if command process throws an error', function(done) {
			
				var testPath = '/usr/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').throws(SystemError.EIO({syscall: 'chdir', path: testPath}));
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
					expect(filesystem.sudo).to.be.false;
					done();
				
				}, true);
			
			});
			it('should return an error to callback and set this.sudo to false if command process returns an error', function(done) {
			
				var testPath = '/usr/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnError() {
				
					return SystemError.EIO({syscall: 'chdir', path: testPath});
				
				});
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
					expect(filesystem.sudo).to.be.false;
					done();
				
				}, true);
			
			});
			it('should return output from the requested command process to the callback and set this.sudo to false if the command process does not return an error', function(done) {
			
				var testPath = '/usr/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnTrue() {
				
					return true;
				
				});
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.true;
					expect(error).to.be.false;
					expect(filesystem.sudo).to.be.false;
					done();
				
				}, true);
			
			});
			it('should change the returned error\'s path property to be absolute starting from the VFS root if command process returns a SystemError that has a path.', function(done) {
			
				var testPath = '/usr/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnError() {
				
					return SystemError.EIO({syscall: 'chdir', path: path.join(this.getCwd(), testPath)});
				
				});
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
					expect(error.path).to.equal(path.join(filesystem.getVcwd(), testPath));
					done();
				
				}, true);
			
			});
			it('should change the returned error\'s dest property to be absolute starting from the VFS root if command process returns a SystemError that has a target.', function(done) {
			
				var testPath = '/usr/var';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnError() {
				
					return SystemError.EIO({syscall: 'chdir', dest: path.join(this.getCwd(), testPath)});
				
				});
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
					expect(error.dest).to.equal(path.join(filesystem.getVcwd(), testPath));
					done();
				
				}, true);
			
			});
			it('should change the returned error\'s dest and path properties to be absolute starting from the VFS root if command process returns a SystemError that has both a path and a dest.', function(done) {
			
				var testPath = '/usr/var';
				var testTarg = '/var/run';
				var changeCwdStub = sinon.stub(filesystem, 'changeCwd').callsFake(function returnError() {
				
					return SystemError.EIO({syscall: 'chdir', path: path.join(this.getCwd(), testPath), dest: path.join(this.getCwd(), testTarg)});
				
				});
				filesystem.cmd('cd', [testPath], function(error, result) {
				
					expect(result).to.be.null;
					expect(error).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
					expect(error.path).to.equal(path.join(filesystem.getVcwd(), testPath));
					expect(error.dest).to.equal(path.join(filesystem.getVcwd(), testTarg));
					done();
				
				}, true);
			
			});
		
		});
		describe('changeCwd(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.changeCwd).to.be.a('function');
			
			});
			it('should return a TypeError if pth arg is not a string', function() {
			
				expect(filesystem.changeCwd()).to.be.an.instanceof(TypeError).with.property('message').that.equals('path must be a string');
			
			});
			it('should return an Error if resolvePath returns an error attempting to resolve pth value', function() {
			
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new Error('test resolvePath error'));
				expect(filesystem.changeCwd('/var')).to.be.an.instanceof(Error).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if this.isReadable returns an error', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: "read", path: testPath}));
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if fs.statSync(absPth) or calling the isDirectory() method of that result throws an error', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncErrorStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: "read", path: testPath}));
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
				statSyncErrorStub.restore();
				testStats.isDirectory = function() { throw new ReferenceError('isDirectory is not defined')};
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(ReferenceError).with.property('message').that.equals('isDirectory is not defined');
			
			});
			it('should return a systemError if resolved path is not readable by user', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an systemError if absPth is not pointing to a directory', function() {
			
				var testPath = '/var';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncErrorStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.changeCwd(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOTDIR');
			
			});
			it('should return true and set this.cwd to an empty string if root directory is readable by user and absPth === this.root.path', function() {
			
				var testPath = '/';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.changeCwd(testPath)).to.be.true;
				expect(filesystem.cwd).to.equal('');
			
			});
			it('should return true and set this.cwd to resolved relative path from VFS root if resolved path is readable by user', function() {
			
				var testPath = '/var/toad/hole';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
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
		describe('touch(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.touch).to.be.a('function');
			
			});
			it('should return an Error if this.isWritable(pth) returns an Error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(SystemError.EPERM({syscall: 'write', path: testPath}));
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a SystemError if this.isWritable(pth) returns false', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(false);
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an Error if fs.appendFileSync throws an Error that is not a SystemError with code "EISDIR"', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').throws(SystemError.EIO({syscall: 'write', path: testPath}));
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should return an Error if fs.appendFileSync throws a SystemError with code "EISDIR" and fs.utimesSync throws an Error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').throws(SystemError.EISDIR({syscall: 'write', path: testPath}));
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').throws(SystemError.EIO({syscall: 'write', path: testPath}));
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should update the atime and mtime values of file at pth if file is a directory and return true if directory is allowed to be written by user,  fs.appendFileSync returns a SystemError with code "EISDIR", and fs.utimesSync executes without error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').throws(SystemError.EISDIR({syscall: 'write', path: testPath}));
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				expect(filesystem.touch(testPath)).to.be.true;
			
			});
			it('should update the atime and mtime values of file at pth if file is not a symlink or directory, and return true if file is allowed to be written by user,  fs.appendFileSync executes without error, and fs.utimesSync executes without error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				expect(filesystem.touch(testPath)).to.be.true;
			
			});
			it('should create a new empty file at pth and return true if target dir is allowed to be written by user,  fs.appendFileSync executes without error, and fs.utimesSync executes without error', function() {
			
				var testPath = 'testFile';
				var resolvedPath = path.join(filesystem.getCwd(), testPath);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				expect(filesystem.touch(testPath)).to.be.true;
				expect(appendFileSyncStub.getCall(0).args[0]).to.equal(resolvedPath);
			
			});
			it('should return an Error if target is a file, fs.appendFileSync executes without error, and fs.utimesSync throws an Error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').throws(SystemError.EIO({syscall: 'write', path: testPath}));
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should use the value of pth unchanged for touch operations if pth is absolute and begins with the path to VFS root', function() {
			
				var testPath =  path.join(filesystem.getCwd(), 'testFile');
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				expect(filesystem.touch(testPath)).to.be.true;
				expect(appendFileSyncStub.getCall(0).args[0]).to.equal(testPath);
			
			});
			it('should use this.resolvePath to resolve the full path to target if pth is relative or an absolute path not within the VFS root', function() {
			
				var testPath =  path.join(filesystem.getVcwd(), 'testFile');
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				expect(filesystem.touch(testPath)).to.be.true;
				expect(appendFileSyncStub.getCall(0).args[0]).to.equal(path.join(filesystem.getCwd(), 'testFile'));
			
			});
			it('should return an error if this.resolvePath returns an error', function() {
			
				var testPath = '~/testFile';
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var appendFileSyncStub = sinon.stub(fs, 'appendFileSync').returns();
				var utimesSyncStub = sinon.stub(fs, 'utimesSync').returns();
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(SystemError.EIO({syscall: 'write', path: testPath}));
				expect(filesystem.touch(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
		
		});
		describe('cat(pthArr, separator)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.cat).to.be.a('function');
			
			});
			it('should return contents of a file at pthArr[0] without changes if file is successfully read and pthArr only has one element', function() {
			
				var testPath = '~/finalWillandTestament.txt';
				var testFileContents = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var readFileStub = sinon.stub(filesystem, 'readFile').returns(testFileContents);
				expect(filesystem.cat([testPath])).to.equal(testFileContents);
			
			});
			it('should return an Error if this.readFile returns an error for any path in pthArr', function() {
			
				var testPath1 = '~/finalWillandTestament.txt';
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var readFileStub = sinon.stub(filesystem, 'readFile').returns(new Error('test readFile Error.'));
				expect(filesystem.cat([testPath1, testPath2])).to.be.an.instanceof(Error).with.property('message').that.equals('test readFile Error.');
			
			});
			it('should return a SystemError if a member of pthArr is not a string', function() {
			
				var testPath1 = ['~/finalWillandTestament.txt'];
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var readFileStub = sinon.stub(filesystem, 'readFile').returns(new Error('test readFile Error.'));
				expect(filesystem.cat([testPath1, testPath2])).to.be.an.instanceof(Error).with.property('code').that.equals('EINVAL');
			
			});
			it('should return a SystemError if this.readFile returns a non-Error, non-string value', function() {
			
				var testPath1 = '~/finalWillandTestament.txt';
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var readFileStub = sinon.stub(filesystem, 'readFile').returns(null);
				expect(filesystem.cat([testPath1, testPath2])).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should return the contents of each file in pthArr in sequence with an additional EOL character between them if this.readFile does not return any errors and separator arg is not a string', function() {
			
				var testPath1 = '~/finalWillandTestament.txt';
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var readFileStub = sinon.stub(filesystem, 'readFile');
				readFileStub.onCall(0).returns(testFileContents1);
				readFileStub.onCall(1).returns(testFileContents2);
				expect(filesystem.cat([testPath1, testPath2])).to.equal(testFileContents1 + EOL + EOL + testFileContents2);
			
			});
			it('should return the contents of each file in pthArr in sequence with a single EOL character between them if this.readFile does not return any errors and separator arg is an empty string', function() {
			
				var testPath1 = '~/finalWillandTestament.txt';
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var readFileStub = sinon.stub(filesystem, 'readFile');
				readFileStub.onCall(0).returns(testFileContents1);
				readFileStub.onCall(1).returns(testFileContents2);
				expect(filesystem.cat([testPath1, testPath2], '')).to.equal(testFileContents1 + EOL + testFileContents2);
			
			});
			it('should return the contents of each file in pthArr in sequence with the value of the separator arg between them if this.readFile does not return any errors and separator arg is a string', function() {
			
				var testPath1 = '~/finalWillandTestament.txt';
				var testFileContents1 = 'Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus. Nullam id dolor id nibh ultricies vehicula ut id elit.';
				var testPath2 = '~/leaveItToTheCats.txt';
				var testFileContents2 = 'Cras mattis consectetur purus sit amet fermentum. Curabitur blandit tempus porttitor. Integer posuere erat a ante venenatis dapibus posuere velit aliquet.';
				var separator = '   24k Gold - Addendum after my kid dropped out of school:    ';
				var readFileStub = sinon.stub(filesystem, 'readFile');
				readFileStub.onCall(0).returns(testFileContents1);
				readFileStub.onCall(1).returns(testFileContents2);
				expect(filesystem.cat([testPath1, testPath2], separator)).to.equal(testFileContents1 + separator + EOL + testFileContents2);
			
			});
		
		});
		describe('copy(source, target, noOverwrite, isRecursive)', function() {
		
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
			it('should set noOverwrite to false if arg is false or not boolean', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var testOpts;
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').callsFake(function saveargs(src, trg, opts) {
				
					testOpts = opts;
				
				});
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.true;
				expect(testOpts).to.be.undefined;
			
			});
			it('should set isRecursive to false if arg is false or not boolean', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copySyncStub = sinon.stub(fs, 'copySync').returns(undefined);
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
				expect(filesystem.copy(testReadPath, testWritePath)).to.be.true;
				expect(copySyncStub.called).to.be.false;
			
			});
			it('should use fs.copySync to copy file recursively if isRecursive is true', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copySyncStub = sinon.stub(fs, 'copySync').returns(undefined);
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
				expect(filesystem.copy(testReadPath, testWritePath, false, true)).to.be.true;
				expect(copyFileSyncStub.called).to.be.false;
				expect(copySyncStub.called).to.be.true;
			
			});
			it('should return an error if isRecursive is true and fs.copySync throws an error', function() {
			
				var testReadPath = '/etc/daemon/diablo.cfg';
				var testWritePath = '/etc/daemon/belial.cfg';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var copySyncStub = sinon.stub(fs, 'copySync').throws(new Error('test copySync error'));
				var copyFileSyncStub = sinon.stub(fs, 'copyFileSync').returns(undefined);
				expect(filesystem.copy(testReadPath, testWritePath, false, true)).to.be.an.instanceof(Error).with.property('message').that.equals('test copySync error');
				expect(copyFileSyncStub.called).to.be.false;
				expect(copySyncStub.called).to.be.true;
			
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
				filesystem.cwd = '';
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
			it('should return the content of the file at this.getCwd() + pth if pth is relative and does not contain the VFS root path, user is allowed to read location at pth, and readFileSync executes without error', function() {
			
				var testPath = path.join('var/run/marathon2/level4', readdirFileArray[0]);
				filesystem.cwd = '';
				var testResolvedPath = path.resolve(filesystem.getCwd(), testPath);
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
			it('should default to using false as value of noOverwrite arg if not passed a boolean', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var renameSyncStub = sinon.stub(fs, 'renameSync').returns();
				var existsSyncStub = sinon.stub(fs, 'existsSync').throws(new Error('don\'t throw me, bro!'));
				expect(filesystem.moveFile(testPathSource, testPathTarget)).to.be.true;
			
			});
			it('should use fs.existsSync to check if target already exists if noOverwrite arg value is true', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var renameSyncStub = sinon.stub(fs, 'renameSync').returns();
				var existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
				expect(filesystem.moveFile(testPathSource, testPathTarget, true)).to.be.true;
				expect(existsSyncStub.called).to.be.true;
			
			});
			it('should return an error if noOverwrite is true and fs.existsSync throws an error (unlikely in rwa)', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var renameSyncStub = sinon.stub(fs, 'renameSync').returns();
				var existsSyncStub = sinon.stub(fs, 'existsSync').throws(new Error('ok, throw me, bro!'));
				expect(filesystem.moveFile(testPathSource, testPathTarget, true)).to.be.an.instanceof(Error).with.property('message').that.equals('ok, throw me, bro!');
			
			});
			it('should return an error referencing the -n flag if noOverwrite is true and fs.existsSync returns true', function() {
			
				var testPathSource = "var/run/marathon2/alephOne.exe";
				var testPathTarget = "usr/local/bin/Marathon2.exe";
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var isWritableStub = sinon.stub(filesystem, 'isWritable').returns(true);
				var renameSyncStub = sinon.stub(fs, 'renameSync').returns();
				var existsSyncStub = sinon.stub(fs, 'existsSync').returns(true);
				expect(filesystem.moveFile(testPathSource, testPathTarget, true)).to.be.an.instanceof(Error).with.property('message').that.includes('exists and -n flag prevents overwriting existing file.');
			
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
				filesystem.cwd = '';
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
		describe('stat(pth, isVerbose, appendFtc, format)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.stat).to.be.a('function');
			
			});
			it('should return an Error if this.lstat returns an error', function() {
			
				var testPath = '~/HowToLieWithStatistics.pdf';
				var testStats = getTestStats();
				var testPerms = getTestPerms();
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testStats);
				expect(filesystem.stat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an Error if this.getPermissions returns an error', function() {
			
				var testPath = '~/HowToLieWithStatistics.pdf';
				var testStats = getTestStats();
				var testPerms = getTestPerms();
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.stat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should include default permissions for the parent directory if a permissions file does not exist at pth or above it in VFS', function() {
			
				var testPath = '~/HowToLieWithStatistics.pdf';
				var testStats = getTestStats();
				testStats.isFile = function() { return true; };
				var testPerms = getTestPerms();
				var defaultPerms = getDefaultPerms();
				var testResults = '---- ' + testStats.nlink + ' ' + defaultPerms.owner + ' ' + testStats.size + ' "' + testStats.atime.toString() + '" "' + testStats.mtime.toString() + '" "' + testStats.birthtime.toString() + '" ' + testStats.blksize + ' ' + testStats.blocks + ' ' + path.basename(testPath);
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(false);
				var getInheritedPermissionsStub = sinon.stub(filesystem, 'getInheritedPermissions').returns(false);
				var getDefaultPermissionsStub = sinon.stub(filesystem, 'getDefaultPermissions').returns(defaultPerms);
				expect(filesystem.stat(testPath)).to.equal(testResults);
			
			});
			it('should return stats formatted in a single line if isVerbose is undefined or false and format is not a string', function() {
			
				var testPath = '~/HowToLieWithStatistics.pdf';
				var testStats = getTestStats();
				testStats.isFile = function() { return true; };
				var testPerms = getTestPerms();
				var testAllowed = '';
				testAllowed += -1 !== testPerms.allowed.indexOf('r') ? 'r' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('w') ? 'w' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('x') ? 'x' : '-';
				var testResults = '-' + testAllowed + ' ' + testStats.nlink + ' ' + testPerms.owner + ' ' + testStats.size + ' "' + testStats.atime.toString() + '" "' + testStats.mtime.toString() + '" "' + testStats.birthtime.toString() + '" ' + testStats.blksize + ' ' + testStats.blocks + ' ' + path.basename(testPath);
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				expect(filesystem.stat(testPath)).to.equal(testResults);
			
			});
			it('should return stats in verbose format if isVerbose is true regardless of other arg values', function() {
			
				var testPath = '~/HowToLieWithStatistics.pdf';
				var testStats = getTestStats();
				testStats.isFile = function() { return true; };
				var testPerms = getTestPerms();
				var testAllowed = '';
				testAllowed += -1 !== testPerms.allowed.indexOf('r') ? 'r' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('w') ? 'w' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('x') ? 'x' : '-';
				var testResults = 'File: "' + path.basename(testPath) + '"' + EOL;
				testResults += 'Size: ' + testStats.size + ' Blocks: ' + testStats.blocks + ' BlockSize: ' + testStats.blksize + EOL;
				testResults += 'FileType: File' + EOL;
				testResults += 'Links: ' + testStats.nlink + EOL;
				testResults += 'Allowed: ' + testAllowed + EOL;
				testResults += 'Owner: ' + testPerms.owner + EOL;
				testResults += 'LastAccessed: ' + testStats.atime.toString() + EOL;
				testResults += 'LastModified: ' + testStats.mtime.toString() + EOL;
				testResults += 'Created: ' + testStats.birthtime.toString() + EOL;
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				expect(filesystem.stat(testPath, true)).to.equal(testResults);
				expect(filesystem.stat(testPath, true, true)).to.equal(testResults);
				expect(filesystem.stat(testPath, true, true, '%A')).to.equal(testResults);
			
			});
			it('should return stats replacing valid placeholders in the format argument value with stats if format is a string and isVerbose is false or undefined', function() {
			
				var testPath = '~/HowToLieWithStatistics';
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var testPerms = getTestPerms();
				var testAllowed = '';
				testAllowed += -1 !== testPerms.allowed.indexOf('r') ? 'r' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('w') ? 'w' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('x') ? 'x' : '-';
				var testFormat = '%Y%y%X%x%W%w%U%s%N%h%F%f%e%B%b%A';
				var testResults = testStats.mtime.toString() + testStats.mtimeMs.toString() + testStats.atime.toString() + testStats.atimeMs.toString()+ testStats.birthtime.toString() + testStats.birthtimeMs.toString() + testPerms.owner + testStats.size + path.basename(testPath) + testStats.nlink + 'Directory/d' + testStats.blksize + testStats.blocks + testAllowed;
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				expect(filesystem.stat(testPath, false, false, testFormat)).to.equal(testResults);
			
			});
			it('should append a character indicating file type to the end of each file name substitution in format string or default format string if isVerbose is false or undefined and appendFtc is true.', function() {
			
				var testPath = '~/HowToLieWithStatistics';
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var testPerms = getTestPerms();
				var testAllowed = '';
				testAllowed += -1 !== testPerms.allowed.indexOf('r') ? 'r' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('w') ? 'w' : '-';
				testAllowed += -1 !== testPerms.allowed.indexOf('x') ? 'x' : '-';
				var testResults1 = 'd' + testAllowed + ' ' + testStats.nlink + ' ' + testPerms.owner + ' ' + testStats.size + ' "' + testStats.atime.toString() + '" "' + testStats.mtime.toString() + '" "' + testStats.birthtime.toString() + '" ' + testStats.blksize + ' ' + testStats.blocks + ' ' + path.basename(testPath) + '/';
				var testFormat = '%Y%y%X%x%W%w%U%s%N%h%F%f%e%B%b%A';
				var testResults2 = testStats.mtime.toString() + testStats.mtimeMs.toString() + testStats.atime.toString() + testStats.atimeMs.toString()+ testStats.birthtime.toString() + testStats.birthtimeMs.toString() + testPerms.owner + testStats.size + path.basename(testPath) + '/' + testStats.nlink + 'Directory/d' + testStats.blksize + testStats.blocks + testAllowed;
				var lstatStub = sinon.stub(filesystem, 'lstat').returns(testStats);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				expect(filesystem.stat(testPath, false, true)).to.equal(testResults1);
				expect(filesystem.stat(testPath, false, true, testFormat)).to.equal(testResults2);
			
			});
		
		});
		describe('lstat(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.lstat).to.be.a('function');
			
			});
			it('should return an error if pth is relative or an absolute path not resolved to this.root.path, and resolvePath returns an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(new TypeError('test resolvePath error'));
				expect(filesystem.lstat(testPath)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolvePath error');
			
			});
			it('should return an error if isReadable returns an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.lstat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if user is not allowed to read location at pth', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(false);
				expect(filesystem.lstat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return an Error if fs.statSync throws an error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.EPERM({syscall: 'stat', path: testPath}));
				expect(filesystem.lstat(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a Stats object if user has proper permissions and statSync executes without error', function() {
			
				var testPath = 'etc/nginx/conf.d';
				var isReadableStub = sinon.stub(filesystem, 'isReadable').returns(true);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.lstat(testPath)).to.be.an.instanceof(fs.Stats);
				expect(filesystem.lstat("/" + testPath)).to.be.an.instanceof(fs.Stats);
				expect(filesystem.lstat(path.join(filesystem.root.path + "/", testPath))).to.be.an.instanceof(fs.Stats);
			
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
			it('should return an error if pth arg value === path.sep, checkIfExists is true, and statSync of this.root.path throws an error', function() {
			
				var testPath = path.sep;
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.resolvePath(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth arg value === path.sep, checkIfExists !== false, and statSync of this.root.path throws an error', function() {
			
				var testPath = path.sep;
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.resolvePath(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return this.root.path if pth arg value === path.sep, checkIfExists !== false, and statSync of this.root.path executes without error', function() {
			
				var testPath = path.sep;
				var testStats = getTestStats();
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				expect(filesystem.resolvePath(testPath)).to.equal(filesystem.root.path);
			
			});
			it('should return this.root.path if pth arg value === path.sep and checkIfExists === false', function() {
			
				var testPath = path.sep;
				expect(filesystem.resolvePath(testPath, false)).to.equal(filesystem.root.path);
			
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
			it('should return an error if this.cwd is a string, absolute path from VCWD to path is not extant', function() {
			
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
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').callsFake(function trueIfPathNotHome(pth) {
				
					return -1 === pth.indexOf('fs/home/');
				
				});
				var isInUserStub = sinon.stub(filesystem, 'isInUser').callsFake(function trueIfPathIsHome(pth, uName) {
				
					return -1 !== pth.indexOf('fs/home/') && 'string' == typeof uName;
				
				});
				var isInPubStub = sinon.stub(filesystem, 'isInPub').callsFake(returnFalse);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				filesystem.sudo = true;
				filesystem.cwd = '';
				var testPath = "etc/david/lifeblood/conf.d";
				var usersSudoFullRoot = global.Uwot.Config.nconf.get('users:sudoFullRoot');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				filesystem.sudo = false;
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
				global.Uwot.Config.nconf.set('users:sudoFullRoot', usersSudoFullRoot);
			
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
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return true if pth resolves to absolute path in this.pubDir.path, and instance user is granted read permissions in permissions file, and file is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = getTestPerms();
				testPerms[instanceUser.uName] = ['r'];
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return a systemError if pth resolves to absolute path in this.pubDir.path, and permissions are set, and instance user is not granted read permissions in permissions file', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = getDefaultPerms();
				testPerms[instanceUser.uName] = ['w'];
				testPerms[altUser.uName] = ['r'];
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EACCES');
			
			});
			it('should return true if pth resolves to absolute path in this.pubDir.path, permissions file is not set, and file is readable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns({owner: 'root', allowed: ['r', 'x'], mayRead: function() {return true;}});
				var testPath = "var/www/html/elfo/unrequieted";
				expect(filesystem.isReadable(testPath)).to.be.true;
			
			});
			it('should return an error if accessSync throws an error', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(getTestStats());
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true)
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').throws(SystemError.EACCES({syscall: 'stat'}));
				var testPerms = getDefaultPerms();
				testPerms.mayRead = function() { return true; };
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
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
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var testPath = "Users/elfo/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.an.instanceof(Error).with.property('code').that.includes('EACCES');
			
			});
			it('should return true if pth resolves to a path in this.pubDir, instance user is set to owner in permissions file, and is writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = getTestPerms();
				testPerms.owner = instanceUser.uName;
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testPath = "Users/elfo/lifeblood.txt";
				expect(filesystem.isWritable(testPath)).to.be.true;
			
			});
			it('should return true if pth resolves to a path in this.pubDir, instance user is not set to owner in permissions file but is granted write access, and is writable by fs', function() {
			
				var statSyncStub = sinon.stub(fs, 'statSync').returns(true);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				var accessSyncStub = sinon.stub(fs, 'accessSync').returns(true);
				var testPerms = getTestPerms();
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
			it('should return result of getExplicitPermissions if it is a non-error object', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(testPerms.toGeneric());
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return an error if getExplicitPermissions returns an error', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return the result of getInheritedPermissions if getExplicitPermissions returns false and it returns a non-error object', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(false);
				var getInheritedPermissionsStub = sinon.stub(filesystem, 'getInheritedPermissions').returns(testPerms.toGeneric());
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return an error if getExplicitPermissions returns false and getInheritedPermissions returns an error', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(false);
				var getInheritedPermissionsStub = sinon.stub(filesystem, 'getInheritedPermissions').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return the result of getDefaultPermissions if getExplicitPermissions returns false, getInheritedPermissions returns false, and it is a non-error object', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(false);
				var getInheritedPermissionsStub = sinon.stub(filesystem, 'getInheritedPermissions').returns(false);
				var getDefaultPermissionsStub = sinon.stub(filesystem, 'getDefaultPermissions').returns(testPerms.toGeneric());
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return an error if getExplicitPermissions returns false, getInheritedPermissions returns false, and getDefaultPermissions returns an error', function() {
			
				var testPerms = getTestPerms();
				var thesePerms = JSON.stringify(testPerms);
				var testPath = 'tmp/dropBox';
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(false);
				var getInheritedPermissionsStub = sinon.stub(filesystem, 'getInheritedPermissions').returns(false);
				var getDefaultPermissionsStub = sinon.stub(filesystem, 'getDefaultPermissions').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.getPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
		
		});
		describe('getExplicitPermissions(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getExplicitPermissions).to.be.a('function');
			
			});
			it('should return a permissions object with owner:"root" and allowed:[] if pth is not in root, pubDir or userDir', function() {
			
				var testPath = '/Users/tmp/dropBox';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
			
			});
			it('should return a permissions object with owner:"root" and allowed:[] if is in root, not in pub or instance userDir, and either this.sudo === false or user:sudoFullRoot is false in config', function() {
			
				var testPath = path.resolve(filesystem.root.path + '/', 'tmp/dropBox');
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", false);
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", true);
				testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult.owner).to.equal('root');
				expect(testResult.allowed).to.be.an('array').that.is.empty;
				global.Uwot.Config.nconf.set("user:sudoFullRoot", false);
			
			});
			it('should return an error if pth points to a non-extant path', function() {
			
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return false if pth points to a directory and there is not valid JSON permissions data in the permissions file', function() {
			
				testStats.isDirectory = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('["test" : 123]');
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return a generic permissions object with the content of the permissions file in the directory if pth points to a directory and the permissions file contains valid JSON', function() {
			
				testStats.isDirectory = function() { return true; };
				var thesePerms = JSON.stringify(getTestPerms());
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
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return false if pth points to a directory and readFileSync throws an error trying to read the permissions file', function() {
			
				testStats.isDirectory = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').throws(SystemError.EISDIR({syscall: 'read', path: testPath}));
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return false if pth points to a file and there is not valid JSON permissions data in the permissions file of its enclosing directory', function() {
			
				testStats.isFile = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns('["test" : 123]');
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return a permissions object with the content of the permissions file in the directory if pth points to a file and the permissions file in the enclosing directory contains valid JSON', function() {
			
				testStats.isFile = function() { return true; };
				var thesePerms = JSON.stringify(getTestPerms());
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
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.deep.equal(JSON.parse(thesePerms));
			
			});
			it('should return an error if pth points to a file and readFileSync throws an error trying to read the permissions file in the enclosing directory', function() {
			
				testStats.isFile = function() { return true; };
				var testPath = 'tmp/dropBox';
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var readFileSyncStub = sinon.stub(fs, 'readFileSync').throws(SystemError.EISDIR({syscall: 'read', path: testPath}));
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.false;
			
			});
			it('should return an ENOENT SystemError if pth is extant and in an allowed path, but points to neither a file nor a directory', function() {
			
				var testPath = 'tmp/dropBox';
				var thesePerms = JSON.stringify(getTestPerms());
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
				var testResult = filesystem.getExplicitPermissions(testPath);
				expect(testResult).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
		
		});
		describe('getInheritedPermissions(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getInheritedPermissions).to.be.a('function');
			
			});
			it('should return an error if getPathLocVars(pth) returns an error', function() {
			
				var testPath = '/var/run/mouth/aboutMe.txt';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns(SystemError.EPERM({syscall: 'stat', path: testPath}));
				expect(filesystem.getInheritedPermissions(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a permissions object with default owner and empty allowed array if pth is not in VFS', function() {
			
				var testPath = '/var/run/mouth/aboutMe.txt';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					fullPath: path.join(filesystem.root.path, testPath),
					inVFS: false
				});
				expect(filesystem.getInheritedPermissions(testPath)).to.deep.equal({owner: 'root', allowed: []});
			
			});
			it('should return false if pth is VFS root', function() {
			
				var testPath = filesystem.root.path;
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					fullPath: testPath,
					inVFS: true
				});
				expect(filesystem.getInheritedPermissions(testPath)).to.be.false;
			
			});
			it('should recurse through parent directories, returning the value of the first parent with explicit permissions if any parent directory prior to root has explicit permissions', function() {
			
				var testPerms = getTestPerms();
				var testPath = '/var/run/mouth/aboutMe.txt';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					fullPath: path.join(filesystem.root.path, testPath),
					inVFS: true
				});
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(testPerms);
				var existsSyncStub = sinon.stub(fs, 'existsSync');
				existsSyncStub.onCall(0).returns(false);
				existsSyncStub.onCall(1).returns(true);
				expect(filesystem.getInheritedPermissions(testPath)).to.deep.equal(testPerms);
			
			});
			it('should return false if no parent directory has explicit permissions', function() {
			
				var testPerms = getTestPerms();
				var testPath = '/var/run/mouth/aboutMe.txt';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					fullPath: path.join(filesystem.root.path, testPath),
					inVFS: true
				});
				var getExplicitPermissionsStub = sinon.stub(filesystem, 'getExplicitPermissions').returns(testPerms);
				var existsSyncStub = sinon.stub(fs, 'existsSync').returns(false);
				expect(filesystem.getInheritedPermissions(testPath)).to.be.false;
			
			});
		
		});
		describe('getDefaultPermissions(pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getDefaultPermissions).to.be.a('function');
			
			});
			it('should return an Error if getPathLocVars returns an error', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.getDefaultPermissions(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a UwotFsPermissions object if getPathLocVars executes without error', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: false,
					inUsers: false,
					inPub: false,
					inAllowed: false,
					isOwned: false
				});
				expect(filesystem.getDefaultPermissions(testPath)).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed none if getPathLocVars executes without error and path is not in Root, Users, nor Public directory', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: false,
					inUsers: false,
					inPub: false,
					inAllowed: false,
					isOwned: false
				});
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals('root');
				expect(testResult).to.have.property('allowed').that.is.an('array').that.is.empty;
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed none if getPathLocVars executes without error and path is in Root, but neither instance user nor Public directory and either this.sudo or config users:sudoFullRoot is false', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: true,
					inUsers: false,
					inPub: false,
					inAllowed: false,
					isOwned: false
				});
				var origSFR = global.Uwot.Config.nconf.get('users:sudoFullRoot');
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals('root');
				expect(testResult).to.have.property('allowed').that.is.an('array').that.is.empty;
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', false);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals('root');
				expect(testResult).to.have.property('allowed').that.is.an('array').that.is.empty;
				filesystem.sudo = false;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', origSFR);
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed read if getPathLocVars executes without error and path is in Root, but neither instance user nor Public directory and both this.sudo and config users:sudoFullRoot are true', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: true,
					inUsers: false,
					inPub: false,
					inAllowed: false,
					isOwned: false
				});
				var origSFR = global.Uwot.Config.nconf.get('users:sudoFullRoot');
				filesystem.sudo = true;
				global.Uwot.Config.nconf.set('users:sudoFullRoot', true);
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals('root');
				expect(testResult).to.have.property('allowed').that.is.an('array').that.deep.equals(['r']);
				global.Uwot.Config.nconf.set('users:sudoFullRoot', origSFR);
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed read & execute if getPathLocVars executes without error and path is in Public directory', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: true,
					inUsers: false,
					inPub: true,
					inAllowed: true,
					isOwned: false
				});
				var origSFR = global.Uwot.Config.nconf.get('users:sudoFullRoot');
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals('root');
				expect(testResult).to.have.property('allowed').that.is.an('array').that.includes('r', 'x');
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed read & execute if getPathLocVars executes without error and path is in instance user directory and config users:homeWritable is false', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: true,
					inUsers: true,
					inPub: false,
					inAllowed: true,
					isOwned: true
				});
				var origHW = global.Uwot.Config.nconf.get('users:homeWritable');
				global.Uwot.Config.nconf.set('users:homeWritable', false);
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals(instanceUser.uName);
				expect(testResult).to.have.property('allowed').that.is.an('array').that.includes('r', 'x');
				global.Uwot.Config.nconf.set('users:homeWritable', origHW);
				
			
			});
			it('should return a UwotFsPermissions object with default owner and allowed read, write, & execute if getPathLocVars executes without error and path is in instance user directory and config users:homeWritable is true', function() {
			
				var testPath = 'path/to/nowhere';
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					inRoot: true,
					inUsers: true,
					inPub: false,
					inAllowed: true,
					isOwned: true
				});
				var origHW = global.Uwot.Config.nconf.get('users:homeWritable');
				global.Uwot.Config.nconf.set('users:homeWritable', true);
				var testResult = filesystem.getDefaultPermissions(testPath);
				expect(testResult).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testResult).to.have.property('owner').that.equals(instanceUser.uName);
				expect(testResult).to.have.property('allowed').that.is.an('array').that.includes('r', 'w', 'x');
				global.Uwot.Config.nconf.set('users:homeWritable', origHW);
				
			
			});
		
		});
		describe('setPermissions(pth, userName, permissions)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.setPermissions).to.be.a('function');
			
			});
			it('should return a systemError if !this.sudo or pth is not a string', function() {
			
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				filesystem.sudo = true;
				expect(filesystem.setPermissions(null, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
				filesystem.sudo = false;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return a TypeError if userName is not a string or permissions is not a non-null object', function() {
			
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, null, testPerms)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user or permissions');
				expect(filesystem.setPermissions(testPath, testUName, null)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid user or permissions');
			
			});
			it('should return an Error if userName does not match a user in the user db', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(false);
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('message').that.includes(': illegal user name');
			
			});
			it('should return a systemError if pth resolves to a path outside of root or users directory', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth target is not extant', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth cannot be resolved to a permissions file location', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				var testStats = getTestStats();
				var dirnameStub = sinon.stub(path, 'dirname').callsFake(function errorOrPath(pth) {
				
					var pthObj = path.parse(pth);
					if (pth === testPath) {
					
						throw SystemError.ENOENT({syscall: 'stat'});
					
					}
					else {
					
						return pthObj.dir;
					
					}
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				filesystem.sudo = true;
				// no longer dependent on specific node errors
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if this.getPermissions returns an error', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var getPathLocVarsStub = sinon.stub(filesystem, 'getPathLocVars').returns({
					fullPath: testPath,
					inRoot: true,
					inUsers: false,
					inAllowed: true
				});
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(new Error('test getPermissions error'));
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.an.instanceof(Error).with.property('message').that.equals('test getPermissions error');
			
			});
			it('should return an error if permissions file cannot be written', function() {
			
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				var testStats = getTestStats();
				testStats.isFile = function() { return true; };
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
				var testPerms = getTestPerms();
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
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(JSON.parse(JSON.stringify(getTestPerms())));
				expect(finalPath).to.equal(testPath + path.sep + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should write permissions arg data as JSON to permissions file at directory enclosing file at pth if pth points to a file, this.sudo, userName matches a user in db, path is extant and a file, and permissions file does not exist', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
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
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				filesystem.sudo = true;
				expect(filesystem.setPermissions(testPath + testFileName, testUName, testPerms)).to.be.true;
				expect(JSON.parse(jsonOutput)).to.deep.equal(JSON.parse(JSON.stringify(getTestPerms())));
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should maintain the current allowed permission set if permissions arg does not have allowed property set and allowed value was previously set', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				testPerms.allowed = null;
				var testPrevPerms = getTestPerms();
				testPrevPerms.allowed = ['r', 'w'];
				var testResult = getTestPerms();
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
				expect(JSON.parse(jsonOutput).allowed).to.deep.equal(testResult.allowed);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should keep the the owner value in the existing file if owner was not previously set to default, and permissions.user property is not set', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				testPerms.owner = null;
				var testPrevPerms = getTestPerms();
				testPrevPerms.owner = 'fuser';
				var testResult = getTestPerms();
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
				expect(JSON.parse(jsonOutput).owner).to.equal(testResult.owner);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should set the owner to the instance user if owner was previously set to default, permissions.user property is not set, and pth resolves to a path in instance userDir', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				delete testPerms.owner;
				var testPrevPerms = getTestPerms();
				testPrevPerms.owner = 'root';
				var testResult = getTestPerms();
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
				expect(JSON.parse(jsonOutput).owner).to.equal(testResult.owner);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should maintain any user specific permissions if any were previously set and the same user\'s permissions are not set in permissions arg', function() {
			
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUName = instanceUser.uName;
				var testPerms = getTestPerms();
				testPerms[notFoundUser.uName] = ['r'];
				delete testPerms[instanceUser.uName];
				var testPrevPerms = getTestPerms();
				testPrevPerms[instanceUser.uName] = ['w', 'x'];
				var testResult = getTestPerms();
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
				expect(JSON.parse(jsonOutput).fuser).to.deep.equal(testResult.fuser);
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
		
		});
		describe('changeAllowed(pth, allowed, isRecursive)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.changeAllowed).to.be.a('function');
			
			});
			it('should return a SystemError if pth is not a string', function() {
			
				filesystem.sudo = true;
				var testPath = null;
				var testAllowed = ['r', 'w', 'x'];
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('EINVAL');
			
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
			it('should assign false to isRecursive if passed a non-boolean value for the isRecursive argument', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, 'true')).to.be.true;
				expect(readdirRecursiveStub.called).to.be.false;
			
			});
			it('should assign null to userName if passed userName that is either not a string or not a valid username', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').callsFake(function falseOnNAU(uName) {
				
					return uName !== 'notAUser';
								
				});
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, false, null)).to.be.true;
				var outputObj = JSON.parse(jsonOutput);
				expect(outputObj.allowed).to.deep.equal(testAllowed);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, false, 'notAUser')).to.be.true;
				outputObj = JSON.parse(jsonOutput);
				expect(outputObj.allowed).to.deep.equal(testAllowed);
				expect(typeof outputObj.notAUser).to.equal('undefined');
			
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
				// filesystem.sudo = true;
// 				var testPath = filesystem.root.path + '/usr/local/bin';
// 				var testAllowed = ['r', 'w', 'x'];
// 				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
// 				throw new Error('need to stub the UwotFsPermissions toGeneric method to return a string rather than a valid object to trigger error here.');
// 				
// 				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return an error if this.getPermissions returns an error', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(SystemError.ENOENT({syscall: 'stat', path: testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME}));
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, 'true')).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should return a systemError if this.sudo is not true and file owner is not a string OR does not match this.user.uName', function() {
			
				filesystem.sudo = false;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').callsFake(function noOwner(pth) {
				
					var noOwnerPerms = getDefaultPerms();
					delete noOwnerPerms.owner;
					return noOwnerPerms;
				
				});
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, 'true', testPrevPerms.owner)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
				getPermissionsStub.restore();
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, 'true', testPrevPerms.owner)).to.be.an.instanceof(Error).with.property('code').that.equals('EPERM');
			
			});
			it('should return an error if absolute path to permissions file cannot be resolved', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
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
				var testPrevPerms = getTestPerms();
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var pathResolveStub = sinon.stub(path, 'resolve').callsFake(function throwIfPermFile(pth, pth2, pth3) {
				
					if (UWOT_HIDDEN_PERMISSIONS_FILENAME === pth || UWOT_HIDDEN_PERMISSIONS_FILENAME === pth2 || UWOT_HIDDEN_PERMISSIONS_FILENAME === pth3) {
					
						throw new TypeError('test resolve error');
					
					}
					else {
					
						return path.join('string' == typeof pth ? pth : '', 'string' == typeof pth2 ? pth2 : '', 'string' == typeof pth3 ? pth3 : '');
					
					}
				
				});
				expect(filesystem.changeAllowed(testPath, testAllowed)).to.be.an.instanceof(TypeError).with.property('message').that.equals('test resolve error');
			
			});
			it('should set the allowed property for the directory\'s permissions to the value of the allowed argument if userName is null', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').callsFake(function falseOnNAU(uName) {
				
					return uName !== 'notAUser';
								
				});
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, false, 'notAUser')).to.be.true;
				var outputObj = JSON.parse(jsonOutput);
				expect(outputObj.allowed).to.deep.equal(testAllowed);
				expect(typeof outputObj.notAUser).to.equal('undefined');
			
			});
			it('should set the userName property for the directory\'s permissions to the value of the allowed argument if userName is not null', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').callsFake(function falseOnNAU(uName) {
				
					return uName !== 'notAUser';
								
				});
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, data) {
				
					jsonOutput = data;
					finalPath = pth;
					return true;
				
				});
				var readdirRecursiveStub = sinon.stub(filesystem, 'readdirRecursive').returns([]);
				expect(filesystem.changeAllowed(testPath + testFileName, testAllowed, false, testPrevPerms.owner)).to.be.true;
				var outputObj = JSON.parse(jsonOutput);
				expect(outputObj.allowed).to.deep.equal(getDefaultPerms().allowed);
				expect(outputObj[testPrevPerms.owner]).to.deep.equal(testAllowed);
			
			});
			it('should return an error if permissions file cannot be written', function() {
			
				filesystem.sudo = true;
				var jsonOutput;
				var finalPath;
				var testFileName = 'marathon';
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
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
				var testPath = filesystem.root.path + '/var/www/html/local/bin/';
				var testAllowed = ['r', 'w', 'x'];
				var testPrevPerms = getTestPerms();
				var finalData = {
					owner: 'root',
					allowed: testAllowed
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
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
				var testPrevPerms = getTestPerms();
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
				var testPrevPerms = getTestPerms();
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
				var testPrevPerms = getTestPerms();
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
			it('should return a systemError if isRecursive is true and this.readdirRecursive returns a non-object or an object that is neither an array nor an instance of Error');
			it('should return an error if isRecursive is true and this.readdirRecursive returns an Error');
			it('should return true if isRecursive is true, and the directories below the original path are successfully updated recursively without error');
			it('should return an error if isRecursive is true and any of the recursive operations returns an error');
		
		});
		describe('changeOwner(pth, userName, isRecursive)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.changeOwner).to.be.a('function');
			
			});
			it('should return a systemError if !this.sudo and instance user is not the current owner', function() {
			
				var testPath = filesystem.root.path + '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = false;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
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
			it('should return a systemError if isValidUserName returns false', function() {
			
				var testPath = '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(false);
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.an.instanceof(Error).with.property('message').that.includes('illegal user name');
			
			});
			it('should assign false to isRecursive if argument value is non-boolean');
			it('should return a systemError if pth does not resolve to a path inside of root, public, or users', function() {
			
				var testPath = '/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if pth resolves to a non-extant path', function() {
			
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.an.instanceof(Error).with.property('code').that.includes('ENOENT');
			
			});
			it('should return an error if this.getPermissions(pth) returns an error');
			it('should return an error if fs.statSync throws an error when getting stats for resolved path');
			it('should return an error if isRecursive is true and this.readdirRecursive returns an Error');
			it('should return a systemError if isRecursive is true and this.readdirRecursive returns a value that is not an array');
			it('should return true if isRecursive is true, permissions at pth are updated without error, and length of the array result for this.readdirRecursive is less than 1');
			it('should return true if if isRecursive is true, permissions at pth are updated without error, and recursive operations complete without error');
			it('should return an error if if isRecursive is true, permissions at pth are updated without error, and any of the recursive operations return an error');
			it('should return an error if fs cannot write to the permissions file at pth', function() {
			
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testPrevPerms = getTestPerms();
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').throws(SystemError.EIO({syscall: 'write', path: testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME}));
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.an.instanceof(Error).with.property('code').that.equals('EIO');
			
			});
			it('should write a new JSON object with owner: "{userName}" to a permissions file at pth if pth resolves to a directory in root, public, or users, this.sudo, userName matches a user in the db, and permissions were not previously set', function() {
			
				var finalPath, jsonOutput;
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testPrevPerms = getTestPerms();
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testUserName,
					allowed: []
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, perms) {
				
					finalPath = pth;
					jsonOutput = perms;
					return true;
				
				});
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should write only updated owner: "{userName}" in the JSON for the permissions file at pth if pth resolves to a directory in root, public, or users, this.sudo, userName matches a user in the db, and permissions were previously set', function() {
			
				var finalPath, jsonOutput;
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testPrevPerms = getTestPerms();
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testUserName,
					allowed: testPrevPerms.allowed,
					fuser: testPrevPerms.fuser
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return true; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, perms) {
				
					finalPath = pth;
					jsonOutput = perms;
					return true;
				
				});
				expect(filesystem.changeOwner(testPath, testUserName)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should write a new JSON object with owner: "{userName}" to a permissions file in the enclosing dir of pth if pth resolves to a file in root, public, or users, this.sudo, userName matches a user in the db, and permissions were not previously set', function() {
			
				var finalPath, jsonOutput;
				var testFileName = 'marathon';
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testPrevPerms = getTestPerms();
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testUserName,
					allowed: []
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getDefaultPerms());
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, perms) {
				
					finalPath = pth;
					jsonOutput = perms;
					return true;
				
				});
				expect(filesystem.changeOwner(testPath + testFileName, testUserName)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
			it('should write only updated owner: "{userName}" in the JSON for the permissions file in the enclosing directory of pth if pth resolves to a file in root, public, or users, this.sudo, userName matches a user in the db, and permissions were previously set', function() {
			
				var finalPath, jsonOutput;
				var testFileName = 'marathon';
				var testPath = filesystem.root.path + '/home/fuser/usr/local/bin/';
				var testUserName = instanceUser.uName;
				filesystem.sudo = true;
				var isValidUserNameStub = sinon.stub(filesystem, 'isValidUserName').returns(true);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var testPrevPerms = getTestPerms();
				testPrevPerms.toGeneric = function() {
				
					return {
						owner: this.owner,
						allowed: this.allowed,
						fuser: this.fuser
					}
				
				};
				var finalData = {
					owner: testUserName,
					allowed: testPrevPerms.allowed,
					fuser: testPrevPerms.fuser
				};
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPrevPerms);
				var testStats = getTestStats();
				testStats.isDirectory = function() { return false; };
				var statSyncStub = sinon.stub(fs, 'statSync').returns(testStats);
				var writeFileSyncStub = sinon.stub(fs, 'writeFileSync').callsFake(function setArgVars(pth, perms) {
				
					finalPath = pth;
					jsonOutput = perms;
					return true;
				
				});
				expect(filesystem.changeOwner(testPath + testFileName, testUserName)).to.be.true;
				expect(finalPath).to.equal(testPath + UWOT_HIDDEN_PERMISSIONS_FILENAME);
				expect(JSON.parse(jsonOutput)).to.deep.equal(finalData);
			
			});
		
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
		describe('visibility(fileArray, pth, showInvisible)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.visibility).to.be.a('function');
			
			});
			it('should return the fileArray arg unchanged if it is not an array', function() {
			
				expect(filesystem.visibility(null, null)).to.be.null;
				expect(filesystem.visibility({things: 'xyz', stuff: 'abc'})).to.deep.equal({things: 'xyz', stuff: 'abc'});
			
			});
			it('should return a TypeError if showInvisible is truthy and pth is not a string', function() {
			
				expect(filesystem.visibility(['etc', 'var', 'run'], null, true)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid pth passed to visibility');
			
			});
			it('should remove a uwot permissions file from fileArray if showInvisible is truthy and a matching filename is in fileArray', function() {
			
				var testArray = [UWOT_HIDDEN_PERMISSIONS_FILENAME, 'etc', 'var', 'run'];
				var testPath = '/';
				expect(filesystem.visibility(testArray, testPath, true)).to.be.an('array').that.does.not.include(UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			});
			it('should add ".." entry to finalArray if showInvisible is truthy and pth is not root of VFS', function() {
			
				var testArray = [UWOT_HIDDEN_PERMISSIONS_FILENAME, 'etc', 'var', 'run'];
				var testPath = '/usr';
				expect(filesystem.visibility(testArray, testPath, true)).to.be.an('array').that.includes('..');
			
			});
			it('should always add "." entry to finalArray if showInvisible is truthy', function() {
			
				var testArray = [UWOT_HIDDEN_PERMISSIONS_FILENAME, 'etc', 'var', 'run'];
				var testPath = '/';
				expect(filesystem.visibility(testArray, testPath, true)).to.be.an('array').that.includes('.');
			
			});
			it('should remove any filenames from fileArray that start with "." if showInvisible is falsey or undefined', function() {
			
				var testArray = [UWOT_HIDDEN_PERMISSIONS_FILENAME, '.DS_Store', 'etc', 'var', 'run'];
				var testPath = '/';
				expect(filesystem.visibility(testArray, testPath)).to.deep.equal(['etc', 'var', 'run']);
			
			});
		
		});
		describe('longFormatFiles(fileArray, pth)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.longFormatFiles).to.be.a('function');
			
			});
			it('should return fileArray arg unchanged if it is not an array or is empty', function() {
			
				expect(filesystem.longFormatFiles({things: 'xyz', stuff: 'abc'})).to.deep.equal({things: 'xyz', stuff: 'abc'});
				expect(filesystem.longFormatFiles([])).to.deep.equal([]);
			
			});
			it('should return a TypeError if pth is not a string', function() {
			
				expect(filesystem.longFormatFiles(['etc', 'var', 'run'], null)).to.be.an.instanceof(TypeError).with.property('message').that.equals('invalid pth passed to longFormatFiles');
			
			});
			it('should return an error if this.getPermissions returns an Error');
			it('should return "-rx" if getUserPermsString returns false and pth is inside pubDir');
			it('should return "---" if getUserPermsString returns false and pth is not inside pubDir');
			
			it('should return "d" as the first character for lines representing directories', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isDirectory = function() { return true; };
					return dirStats;
				
				});
				var testArray = ['run'];
				var testPath = '/var';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[0]).to.equal('d');
			
			});
			it('should return "s" as the first character for lines representing symlinks', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return true; };
					return dirStats;
				
				});
				var testArray = ['certs'];
				var testPath = '/etc/tls';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[0]).to.equal('s');
			
			});
			it('should return "-" as the first character for lines representing neither dirs nor symlinks', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[0]).to.equal('-');
			
			});
			it('should return three characters matching the permissions allowed property members or dashes for each line', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[1]).to.equal('r');
				expect(testResultArray[2]).to.equal('-');
				expect(testResultArray[3]).to.equal('x');
			
			});
			it('should omit a file\'s line from the finalArray if statSync throws an error', function() {
			
				var testPerms = getTestPerms();
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(testPerms);
				var testArray = ['run'];
				var testPath = '/var';
				var statSyncStub = sinon.stub(fs, 'statSync').throws(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				expect(testResult).to.be.an('array').that.is.empty;
			
			});
			it('should output 6 chars containing spaces and the number of links to a file for each line', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[4]).to.equal(' ');
				expect(testResultArray[5]).to.equal(' ');
				expect(testResultArray[6]).to.equal(' ');
				expect(testResultArray[7]).to.equal(' ');
				expect(testResultArray[8]).to.equal(' ');
				expect(testResultArray[9]).to.equal('1');
			
			});
			it('should output the owner from getPermissions on each line', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[10]).to.equal(' ');
				expect(testResultArray[11]).to.equal('m');
				expect(testResultArray[12]).to.equal('o');
				expect(testResultArray[13]).to.equal('r');
				expect(testResultArray[14]).to.equal('t');
				expect(testResultArray[15]).to.equal('i');
				expect(testResultArray[16]).to.equal('m');
				expect(testResultArray[17]).to.equal('e');
				expect(testResultArray[18]).to.equal('r');
				expect(testResultArray[19]).to.equal('h');
				expect(testResultArray[20]).to.equal('e');
				expect(testResultArray[21]).to.equal('m');
				expect(testResultArray[22]).to.equal('p');
			
			});
			it('should output 11 chars containing spaces and the byte size of the file for each line', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[23]).to.equal(' ');
				expect(testResultArray[24]).to.equal(' ');
				expect(testResultArray[25]).to.equal(' ');
				expect(testResultArray[26]).to.equal(' ');
				expect(testResultArray[27]).to.equal(' ');
				expect(testResultArray[28]).to.equal(' ');
				expect(testResultArray[29]).to.equal(' ');
				expect(testResultArray[30]).to.equal(' ');
				expect(testResultArray[31]).to.equal('5');
				expect(testResultArray[32]).to.equal('2');
				expect(testResultArray[33]).to.equal('7');
			
			});
			it('should output the last modified date using three char month, space, 2 char date, space, 2 char hour(24h), colon, and 2 char minute for each file modified in the current year', function() {
			
				var now = new Date();
				var nowArray = Array.from(now.toLocaleString('en-us', {hourCycle: 'h24', hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'}).toUpperCase().replace(',', '').replace(' AM', '').replace(' PM', ''));
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					dirStats.mtime = now;
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[34]).to.equal(' ');
				expect(testResultArray[35]).to.equal(nowArray[0]);
				expect(testResultArray[36]).to.equal(nowArray[1]);
				expect(testResultArray[37]).to.equal(nowArray[2]);
				expect(testResultArray[38]).to.equal(nowArray[3]);
				expect(testResultArray[39]).to.equal(nowArray[4]);
				expect(testResultArray[40]).to.equal(nowArray[5]);
				expect(testResultArray[41]).to.equal(nowArray[6]);
				expect(testResultArray[42]).to.equal(nowArray[7]);
				expect(testResultArray[43]).to.equal(nowArray[8]);
				expect(testResultArray[44]).to.equal(nowArray[9]);
				expect(testResultArray[45]).to.equal(nowArray[10]);
				expect(testResultArray[46]).to.equal(nowArray[11]);
			
			});
			it('should output the last modified date using three char month, space, 2 char date, space, and 4 char year for each file modified before the current year', function() {
			
				var then = getTestStats().mtime;
				var thenArray = Array.from(then.toLocaleString('en-us', {month: 'short', day: '2-digit', year: 'numeric'}).toUpperCase().replace(',', ' '));
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[34]).to.equal(' ');
				expect(testResultArray[35]).to.equal(thenArray[0]);
				expect(testResultArray[36]).to.equal(thenArray[1]);
				expect(testResultArray[37]).to.equal(thenArray[2]);
				expect(testResultArray[38]).to.equal(thenArray[3]);
				expect(testResultArray[39]).to.equal(thenArray[4]);
				expect(testResultArray[40]).to.equal(thenArray[5]);
				expect(testResultArray[41]).to.equal(thenArray[6]);
				expect(testResultArray[42]).to.equal(thenArray[7]);
				expect(testResultArray[43]).to.equal(thenArray[8]);
				expect(testResultArray[44]).to.equal(thenArray[9]);
				expect(testResultArray[45]).to.equal(thenArray[10]);
				expect(testResultArray[46]).to.equal(thenArray[11]);
			
			});
			it('should output the file name for each line', function() {
			
				var getPermissionsStub = sinon.stub(filesystem, 'getPermissions').returns(getTestPerms());
				var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnDirStats(pth) {
				
					var dirStats = getTestStats();
					dirStats.isSymbolicLink = function() { return false; };
					return dirStats;
				
				});
				var testArray = ['bash.rc'];
				var testPath = '~/';
				var testResult = filesystem.longFormatFiles(testArray, testPath);
				
				var testResultArray = Array.from(testResult[0]);
				expect(testResultArray[47]).to.equal(' ');
				expect(testResultArray[48]).to.equal('b');
				expect(testResultArray[49]).to.equal('a');
				expect(testResultArray[50]).to.equal('s');
				expect(testResultArray[51]).to.equal('h');
				expect(testResultArray[52]).to.equal('.');
				expect(testResultArray[53]).to.equal('r');
				expect(testResultArray[54]).to.equal('c');
			
			});
		
		});
		describe('getPathLocVars(pth, checkIfExists)', function() {
		
			it('should be a function', function() {
			
				expect(filesystem.getPathLocVars).to.be.a('function');
			
			});
			it('should return an error if this.resolvePath returns an error', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(SystemError.ENOENT({syscall: 'stat', path: testPath}));
				expect(filesystem.getPathLocVars(testPath)).to.be.an.instanceof(Error).with.property('code').that.equals('ENOENT');
			
			});
			it('should perform resolvePath without checking for the file\'s existence if checkIfExists is false', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath, false)).to.deep.equal({
					fullPath:		testPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
				expect(resolvePathStub.calledWith(testPath, false));
			
			});
			it('should perform resolvePath while checking for the file\'s existence if checkIfExists is not a boolean or is true', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returnsArg(0);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		testPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
				expect(resolvePathStub.calledWith(testPath, true));
			
			});
			it('should return an object containing the resolvedPath as the value of fullPath property', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with true as the value of inRoot property if resolved path is inside root.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			true,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with false as the value of inRoot property if resolved path is not inside root.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with true as the value of inUsers property if resolved path is inside config users directory path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(true);
				isInUserStub.onCall(1).returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		true,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with false as the value of inUsers property if resolved path is not inside config users directory path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(false);
				isInUserStub.onCall(1).returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with true as the value of inPub property if resolved path is inside pubDir.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(false);
				isInUserStub.onCall(1).returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			true,
					inAllowed:		true,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with false as the value of inPub property if resolved path is not inside pubDir.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(false);
				isInUserStub.onCall(1).returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with true as the value of isOwned property if resolved path is inside userDir.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(true);
				isInUserStub.onCall(1).returns(true);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		true,
					isOwned:		true,
					inPub:			false,
					inAllowed:		true,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with false as the value of isOwned property if resolved path is not inside userDir.path', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(false);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(false);
				isInUserStub.onCall(1).returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			false,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			false,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with true as the value of inAllowed property if either inPub or isOwned are true', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser');
				isInUserStub.onCall(0).returns(true);
				isInUserStub.onCall(1).returns(true);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(true);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			true,
					inUsers:		true,
					isOwned:		true,
					inPub:			true,
					inAllowed:		true,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
			it('should return an object with false as the value of inAllowed property if neither inPub or isOwned are true', function() {
			
				var testPath = 'which/way/did/i/go';
				var resolvedPath = path.join(filesystem.root.path, testPath);
				var resolvePathStub = sinon.stub(filesystem, 'resolvePath').returns(resolvedPath);
				var isInRootStub = sinon.stub(filesystem, 'isInRoot').returns(true);
				var isInUserStub = sinon.stub(filesystem, 'isInUser').returns(false);
				var isInPubStub = sinon.stub(filesystem, 'isInPub').returns(false);
				expect(filesystem.getPathLocVars(testPath)).to.deep.equal({
					fullPath:		resolvedPath,
					inRoot:			true,
					inUsers:		false,
					isOwned:		false,
					inPub:			false,
					inAllowed:		false,
					inVFS:			true,
					sudoAllowed:	false
				});
			
			});
		
		});
		describe('readdirRecursive(pth, fType)', function() {
		
			it('should be a function');
			it('should return a systemError if pth argument value is not a string');
			it('should assign null to fType if fType argument value is not a string or not a valid file type');
			it('should return an error if this.resolvePath(pth) returns an Error');
			it('should return an error if fs.statSync throws an Error');
			it('should return an error if this.readDir returns an Error');
			it('should not include permissions files in the result array');
			it('should return an error if any file causes fs.statSync to throw an Error');
			it('should begin reading files inside of the directory at pth if it points to a directory');
			it('should begin reading files inside of the parent directory for file at pth if it points to a non-directory file');
			it('should only include files if fType is "file"');
			it('should only include directories if fType is "directory"');
			it('should only include symbolic links if fType is "symlink"');
			it('should only include sockets if fType is "socket"');
			it('should only include FIFOs if fType is "fifo"');
			it('should include any file type that is not a permissions file if fType is null');
			it('should return an error if recursive read of a directory in starting path returns an error');
			it('should push the results of a recursive directory read to the result array if the recursive read completes without error');
		
		});
	
	});
	describe('UwotFsPermissions', function() {
	
		var testStatsFile;
		var testStatsDir;
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
			dbFindStub.restore();
			listUsersStub.restore();
			testStatsFile = getTestStats();
			testStatsDir = getTestStats();
			testStatsFile.isFile = function() { return true; };
			testStatsDir.isDirectory = function() { return true; };
			var statSyncStub = sinon.stub(fs, 'statSync').callsFake(function returnStats(pth) {
			
				if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
				
					return testStatsFile;
				
				}
				else {
				
					return testStatsDir;
				
				}
			
			});
			var readFileSyncStub = sinon.stub(fs, 'readFileSync').returns(JSON.stringify(getTestPerms()));
			testPermissionsObj = filesystem.getDefaultPermissions('usr');
			statSyncStub.restore();
			readFileSyncStub.restore();
		
		});
		describe('constructor(permissions)', function() {
		
			it('should not be able to be called outside of UwotFs methods', function() {
			
				function throwReferenceError() {
				
					return new UwotFsPermissions();
				
				}
				expect(throwReferenceError).to.throw(ReferenceError, 'UwotFsPermissions is not defined');
			
			});
			it('should be a function', function() {
			
				expect(testPermissionsObj.constructor).to.be.a('function');
				expect(testPermissionsObj.constructor.name).to.equal('UwotFsPermissions');
			
			});
			it('should throw a TypeError if permissions arg is not an object', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				function throwTypeError() {
				
					return new testPermissionsObj.constructor();
				
				}
				expect(throwTypeError).to.throw(TypeError, 'argument of UwotFsPermissions constructor must be an object');
			
			});
			it('should assign DEFAULT_OWNER to owner property and DEFAULT_ALLOWED to allowed property if permisssions === null', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor(null);
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal('root');
				expect(testPermissions.allowed).to.deep.equal(['r']);
			
			});
			it('should assign permissions.owner to owner property if permissions.owner is a string', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: altUser.uName, allowed: 'nuthin'});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.deep.equal(['r']);
			
			});
			it('should assign DEFAULT_OWNER to owner property if permissions.owner is not a string, undefined, or null', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: false, allowed: 'nuthin'});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal('root');
				expect(testPermissions.allowed).to.deep.equal(['r']);
			
			});
			it('should not assign owner property if permissions.owner is undefined or null', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: null, allowed: 'nuthin'});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.be.undefined;
				expect(testPermissions.allowed).to.deep.equal(['r']);
				testPermissions = new testPermissionsObj.constructor({allowed: 'nuthin'});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.be.undefined;
				expect(testPermissions.allowed).to.deep.equal(['r']);
			
			});
			it('should assign elements of permissions.allowed to allowed property array if permissions.allowed is an array and elements === "r", "w", or "x"', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: altUser.uName, allowed: ['r','x', 'y']});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.deep.equal(['r', 'x']);
			
			});
			it('should assign DEFAULT_ALLOWED to the allowed property if permissions.allowed is not an array, undefined, or null', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: altUser.uName, allowed: "['r','x', 'y']"});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.deep.equal(['r']);
			
			});
			it('should not assign the allowed property if permissions.allowed is undefined or null', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissions = new testPermissionsObj.constructor({owner: altUser.uName, allowed: null});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.be.undefined;
				testPermissions = new testPermissionsObj.constructor({owner: altUser.uName});
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.be.undefined;
			
			});
			it('should assign any other properties that are not owner or allowed to itself, if the property value is an array containing only any or none of ["r", "w", "x"]', function() {
			
				delete testPermissionsObj.owner;
				delete testPermissionsObj.allowed;
				var testPermissionsArgs = {owner: altUser.uName, allowed: ['r','x', 'y']};
				testPermissionsArgs[notFoundUser.uName] = ['w', 'x', 'y', 'z'];
				testPermissionsArgs[instanceUser.uName] = [];
				var testPermissions = new testPermissionsObj.constructor(testPermissionsArgs);
				expect(testPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('UwotFsPermissions');
				expect(testPermissions.owner).to.equal(altUser.uName);
				expect(testPermissions.allowed).to.deep.equal(['r', 'x']);
				expect(testPermissions[notFoundUser.uName]).to.deep.equal(['w', 'x']);
				expect(testPermissions[instanceUser.uName]).to.be.an('array').that.is.empty;
			
			});
		
		});
		describe('toGeneric()', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.toGeneric).to.be.a('function');
			
			});
			it('should return a new object with constructor.name === "Object"', function() {
			
				var testGenericPermissions = testPermissionsObj.toGeneric();
				expect(testGenericPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
			
			});
			it('should set owner to DEFAULT_OWNER if owner property is not a string', function() {
			
				delete testPermissionsObj.owner;
				var testGenericPermissions = testPermissionsObj.toGeneric();
				expect(testGenericPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
				expect(testGenericPermissions.owner).to.equal('root');
			
			});
			it('should set owner to own owner property if it is a string', function() {
			
				testPermissionsObj.owner = instanceUser.uName;
				var testGenericPermissions = testPermissionsObj.toGeneric();
				expect(testGenericPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
				expect(testGenericPermissions.owner).to.equal(instanceUser.uName);
			
			});
			it('should set allowed property to own allowed property', function() {
			
				testPermissionsObj.allowed = ['r', 'x'];
				var testGenericPermissions = testPermissionsObj.toGeneric();
				expect(testGenericPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
				expect(testGenericPermissions.allowed).to.deep.equal(['r', 'x']);
			
			});
			it('should set any user specific permission properties', function() {
			
				testPermissionsObj[instanceUser.uName] = ['r', 'x'];
				var testGenericPermissions = testPermissionsObj.toGeneric();
				expect(testGenericPermissions).to.be.an('object').with.property('constructor').with.property('name').that.equals('Object');
				expect(testGenericPermissions[instanceUser.uName]).to.deep.equal(['r', 'x']);
			
			});
		
		});
		describe('toJSON()', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.toJSON).to.be.a('function');
			
			});
			it('should return a JSON string representing the value of this.toGeneric()', function() {
			
				expect(testPermissionsObj.toJSON()).to.equal(JSON.stringify(testPermissionsObj.toGeneric()));
			
			});
		
		});
		describe('getUserPermsArray(userName)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.getUserPermsArray).to.be.a('function');
		
			});
			it('should return this.allowed if user does not have specific permissions', function() {
			
				expect(testPermissionsObj.getUserPermsArray(altUser.uName)).to.deep.equal(testPermissionsObj.allowed);
			
			});
			it('should return an array if the user has specific permissions', function() {
			
				var altPerms = ['r', 'w', 'x'];
				testPermissionsObj[altUser.uName] = altPerms;
				expect(testPermissionsObj.getUserPermsArray(altUser.uName)).to.deep.equal(altPerms);
			
			});
		
		});
		describe('mayRead(userName)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.mayRead).to.be.a('function');
		
			});
			it('should return false if user does not have specific permissions and this.allowed does not contain "r"', function() {
			
				testPermissionsObj.allowed = ['x'];
				expect(testPermissionsObj.mayRead(altUser.uName)).to.be.false;
			
			});
			it('should return false if user does have specific permissions and the specific permissions do not contain "r"', function() {
			
				testPermissionsObj[altUser.uName] = ['x'];
				expect(testPermissionsObj.mayRead(altUser.uName)).to.be.false;
			
			});
			it('should return true if user does not have specific permissions and this.allowed contains "r"', function() {
			
				expect(testPermissionsObj.mayRead(altUser.uName)).to.be.true;
			
			});
			it('should return true if user does have specific permissions and the specific permissions contains "r"', function() {
			
				testPermissionsObj[altUser.uName] = ['r', 'w'];
				expect(testPermissionsObj.mayRead(altUser.uName)).to.be.true;
			
			});
		
		});
		describe('mayWrite(userName)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.mayWrite).to.be.a('function');
		
			});
			it('should return false if user does not have specific permissions and this.allowed does not contain "w"', function() {
			
				testPermissionsObj.allowed = ['x'];
				expect(testPermissionsObj.mayWrite(altUser.uName)).to.be.false;
			
			});
			it('should return false if user does have specific permissions and the specific permissions do not contain "w"', function() {
			
				testPermissionsObj[altUser.uName] = ['x'];
				expect(testPermissionsObj.mayWrite(altUser.uName)).to.be.false;
			
			});
			it('should return true if user does not have specific permissions and this.allowed contains "w"', function() {
			
				testPermissionsObj.allowed = ['w', 'x'];
				expect(testPermissionsObj.mayWrite(altUser.uName)).to.be.true;
			
			});
			it('should return true if user does have specific permissions and the specific permissions contains "w"', function() {
			
				testPermissionsObj[altUser.uName] = ['r', 'w'];
				expect(testPermissionsObj.mayWrite(altUser.uName)).to.be.true;
			
			});
		
		});
		describe('mayExecute(userName)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.mayExecute).to.be.a('function');
		
			});
			it('should return false if user does not have specific permissions and this.allowed does not contain "x"', function() {
			
				testPermissionsObj.allowed = ['r'];
				expect(testPermissionsObj.mayExecute(altUser.uName)).to.be.false;
			
			});
			it('should return false if user does have specific permissions and the specific permissions do not contain "x"', function() {
			
				testPermissionsObj[altUser.uName] = ['r'];
				expect(testPermissionsObj.mayExecute(altUser.uName)).to.be.false;
			
			});
			it('should return true if user does not have specific permissions and this.allowed contains "x"', function() {
			
				testPermissionsObj.allowed = ['x'];
				expect(testPermissionsObj.mayExecute(altUser.uName)).to.be.true;
			
			});
			it('should return true if user does have specific permissions and the specific permissions contains "x"', function() {
			
				testPermissionsObj[altUser.uName] = ['x'];
				expect(testPermissionsObj.mayExecute(altUser.uName)).to.be.true;
			
			});
		
		});
		describe('getUserPermsString(userName)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.getUserPermsString).to.be.a('function');
		
			});
			it('should return a string with the first character as "-" if user does not have specific permissions and this.allowed does not contain "r"', function() {
			
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[0]).to.equal('-');
			
			});
			it('should return a string with the first character as "r" if user does not have specific permissions and this.allowed contains "r"', function() {
			
				testPermissionsObj.allowed = ['r'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[0]).to.equal('r');
			
			});
			it('should return a string with the second character as "-" if user does not have specific permissions and this.allowed does not contain "w"', function() {
			
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[1]).to.equal('-');
			
			});
			it('should return a string with the second character as "w" if user does not have specific permissions and this.allowed contains "w"', function() {
			
				testPermissionsObj.allowed = ['w'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[1]).to.equal('w');
			
			});
			it('should return a string with the third character as "-" if user does not have specific permissions and this.allowed does not contain "x"', function() {
			
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[2]).to.equal('-');
			
			});
			it('should return a string with the third character as "x" if user does not have specific permissions and this.allowed contains "x"', function() {
			
				testPermissionsObj.allowed = ['x'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[2]).to.equal('x');
			
			});
			it('should return a string with the first character as "-" if user has specific permissions and the specific permissions do not contain "r"', function() {
			
				testPermissionsObj[altUser.uName] = [];
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[0]).to.equal('-');
			
			});
			it('should return a string with the first character as "r" if user has specific permissions and the specific permissions contain "r"', function() {
			
				testPermissionsObj[altUser.uName] = ['r'];
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[0]).to.equal('r');
			
			});
			it('should return a string with the second character as "-" if user has specific permissions and the specific permissions do not contain "w"', function() {
			
				testPermissionsObj[altUser.uName] = [];
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[1]).to.equal('-');
			
			});
			it('should return a string with the second character as "w" if user has specific permissions and the specific permissions contain "w"', function() {
			
				testPermissionsObj[altUser.uName] = ['w'];
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[1]).to.equal('w');
			
			});
			it('should return a string with the third character as "-" if user has specific permissions and the specific permissions do not contain "x"', function() {
			
				testPermissionsObj[altUser.uName] = [];
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[2]).to.equal('-');
			
			});
			it('should return a string with the third character as "x" if user has specific permissions and the specific permissions contain "x"', function() {
			
				testPermissionsObj[altUser.uName] = ['x'];
				testPermissionsObj.allowed = [];
				var testResult = testPermissionsObj.getUserPermsString(altUser.uName);
				var testResultArray = Array.from(testResult);
				expect(testResultArray[2]).to.equal('x');
			
			});
		
		});
		describe('concatPerms(otherPerms)', function() {
		
			it('should be a function', function() {
			
				expect(testPermissionsObj.concatPerms).to.be.a('function');
			
			});
			it('should throw a TypeError if otherPerms is not an object', function() {
			
				function throwTypeError() {
				
					return testPermissionsObj.concatPerms();
				
				}
				expect(throwTypeError).to.throw(TypeError, 'argument passed to concatPerms must be an object');
			
			});
			it('should return a new object with properties matching this if otherPerms is null', function() {
			
				expect(testPermissionsObj.concatPerms(null)).to.deep.equal(testPermissionsObj);
			
			});
			it('should return a new object with all property values of otherPerms unless this has a different value for any key', function() {
			
				var otherPerms = testPermissionsObj.concatPerms(null);
				otherPerms.owner = instanceUser.uName;
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				otherPerms[altUser.uName] = ['r'];
				var finalResult = testPermissionsObj.concatPerms(otherPerms);
				expect(finalResult.owner).to.equal(testPermissionsObj.owner);
				expect(finalResult.allowed).to.deep.equal(testPermissionsObj.allowed);
				expect(finalResult[altUser.uName]).to.deep.equal(otherPerms[altUser.uName]);
			
			});
			it('should return an object with constructor.name === "UwotFsPermissions"', function() {
			
				var otherPerms = testPermissionsObj.concatPerms(null);
				otherPerms.owner = instanceUser.uName;
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				otherPerms[altUser.uName] = ['r'];
				var finalResult = testPermissionsObj.concatPerms(otherPerms);
				expect(finalResult.constructor.name).to.equal('UwotFsPermissions');
			
			});
			it('should return an error if Object.assign(otherPermsClassObj.toGeneric(), this.toGeneric()) throws an error', function() {
			
				var otherPerms = testPermissionsObj.concatPerms(null);
				otherPerms.owner = instanceUser.uName;
				testPermissionsObj.allowed = ['r', 'w', 'x'];
				otherPerms[altUser.uName] = ['r'];
				var toGenericStub = sinon.stub(testPermissionsObj, 'toGeneric').throws(new Error('test toGeneric Error'));
				var finalResult = testPermissionsObj.concatPerms(otherPerms);
				expect(finalResult).to.be.an.instanceof(Error).with.property('message').that.equals('test toGeneric Error');
				
			
			});
			it('should assign otherPerms.allowed to the result object\'s allowed property if the object the method is called on has null or undefined as the value of its allowd property', function() {
			
				var otherPerms = testPermissionsObj.concatPerms(null);
				otherPerms.owner = instanceUser.uName;
				testPermissionsObj.allowed = null;
				var otherAllowed = ['r', 'w', 'x'];
				otherPerms.allowed = otherAllowed;
				otherPerms[altUser.uName] = ['r'];
				var finalResult = testPermissionsObj.concatPerms(otherPerms);
				expect(finalResult.allowed).to.deep.equal(otherAllowed);
			
			});
		
		})
	
	});

});
