'use strict';
const EOL = require('os').EOL;
const fs = require('fs-extra');
const path = require('path');
const pathIsInside = require('path-is-inside');
const systemError = require('./helpers/systemError');
const sanitize = require('./helpers/valueConversion');
const FlagSet = require('./helpers/flags');
// const Users = require('./users');


const UWOT_HIDDEN_PERMISSIONS_FILENAME = '.uwotprm';
const DEFAULT_OWNER = 'root';
const ALLOWED_NONE = [];
const ALLOWED_READ = ['r'];
const ALLOWED_WRITE = ['w'];
const ALLOWED_EXE = ['x'];
const ALLOWED_READ_WRITE = ['r','w'];
const ALLOWED_READ_EXE = ['r','x'];
const ALLOWED_WRITE_EXE = ['w','x'];
const ALLOWED_READ_WRITE_EXE = ['r','w','x'];
const DEFAULT_ALLOWED = ALLOWED_READ;

const VALID_CMDS = [
	'cd',
	'ls',
	'pwd',
	'mkdir',
	'rm',
	'rmdir',
	'mv',
	'cp',
	'stat',
	'touch',
	'cat',
	'chmod',
	'chown'
];

const VALID_STAT_FORMAT_PLACEHOLDERS = [
	'A',
	'b',
	'B',
	'f',
	'F',
	'h',
	'N',
	's',
	'U',
	'w',
	'W',
	'x',
	'X',
	'y',
	'Y'
];

const VALID_FILE_TYPES = [
	'file',
	'directory',
	'symlink',
	'socket',
	'fifo'
];

class UwotFsPermissions {

	constructor(permissions) {
	
		if ('object' !== typeof permissions) {
		
			throw new TypeError('argument of UwotFsPermissions constructor must be an object');
		
		}
		else if (null !== permissions) {
		
			if ('string' === typeof permissions.owner) {
			
				this.owner = sanitize.cleanString(permissions.owner);
			
			}
			else if ('undefined' !== typeof permissions.owner && null !== permissions.owner) {
			
				this.owner = DEFAULT_OWNER;
			
			}
			delete permissions.owner;
			if ('object' === typeof permissions.allowed && Array.isArray(permissions.allowed)) {
			
				this.allowed = [];
				permissions.allowed.forEach(function(val) {
				
					switch(val) {
					
						case 'r':
							this.allowed.push('r');
							break;
						case 'w':
							this.allowed.push('w');
							break;
						case 'x':
							this.allowed.push('x');
							break;
					
					}
				
				}.bind(this));
			
			}
			else if ('undefined' !== typeof permissions.allowed && null !== permissions.allowed) {
			
				this.allowed = DEFAULT_ALLOWED;
			
			}
			delete permissions.allowed;
			var permUsers = Object.keys(permissions);
			delete permUsers.validUsers;
			if (0 < permUsers.length) {

				for (let i = 0; i < permUsers.length; i++) {
	
					var thisName = permUsers[i];
					let userPerms = [];
					if ('object' === typeof permissions[thisName] && Array.isArray(permissions[thisName])) {
				
						if (-1 !== permissions[thisName].indexOf('r')) {
					
							userPerms.push('r');
					
						}
						if (-1 !== permissions[thisName].indexOf('w')) {
					
							userPerms.push('w');
					
						}
						if (-1 !== permissions[thisName].indexOf('x')) {
					
							userPerms.push('x');
					
						}
						this[thisName] = userPerms;
				
					}
	
				}
			
			}
		
		}
		else {
		
			this.owner = DEFAULT_OWNER;
			this.allowed = DEFAULT_ALLOWED;
		
		}
	
	}
	
	toGeneric() {
	
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
	
	}
	
	toJSON() {
	
		return JSON.stringify(this.toGeneric());
	
	}
	
	getUserPermsArray(userName) {
	
		var userList = Object.keys(this);	
		var userPerms = 'string' === typeof userName && -1 < userList.indexOf(userName) ? this[userName] : this.allowed;
		return userPerms;
	
	}
	
	mayRead(userName) {
	
		var userPerms = this.getUserPermsArray(userName);
		return userPerms.indexOf('r') > -1;
	
	}
	
	mayWrite(userName) {
	
		var userPerms = this.getUserPermsArray(userName);
		return userPerms.indexOf('w') > -1;
	
	}
	
	mayExecute(userName) {
	
		var userPerms = this.getUserPermsArray(userName);
		return userPerms.indexOf('x') > -1;
	
	}
	
	getUserPermsString(userName) {
	
		var userPerms = this.getUserPermsArray(userName);
		var permLine = '';
		if (-1 !== userPerms.indexOf('r')) {
		
			permLine += 'r';
		
		}
		else {
		
			permLine += '-';
		
		}
		if (-1 !== userPerms.indexOf('w')) {
		
			permLine += 'w';
		
		}
		else {
		
			permLine += '-';
		
		}
		if (-1 !== userPerms.indexOf('x')) {
		
			permLine += 'x';
		
		}
		else {
		
			permLine += '-';
		
		}
		return permLine;
	
	}
	
	// values of this override values of otherPerms if property matches
	// returns new UwotFsPermissions object
	concatPerms(otherPerms) {
	
		var thisOwner = this.owner;
		var thisAllowed = this.allowed;
		var otherOwner, otherAllowed;
		if ('object' !== typeof otherPerms) {
		
			throw new TypeError('argument passed to concatPerms must be an object');
		
		}
		else if (null === otherPerms) {
		
			return new UwotFsPermissions(this.toGeneric());
		
		}
		if ('string' === typeof otherPerms.owner) {
		
			otherOwner = otherPerms.owner;
		
		}
		if('object' === typeof otherPerms.allowed && Array.isArray(otherPerms.allowed)) {
		
			otherAllowed = otherPerms.allowed;
		
		}
		var otherPermsClassObj, newArg;
		if ('UwotFsPermissions' !== otherPerms.constructor.name) {
		
			try {
			
				otherPermsClassObj = new UwotFsPermissions(otherPerms);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			otherPermsClassObj = otherPerms;
		
		}
		try {
		
			newArg = Object.assign(otherPermsClassObj.toGeneric(), this.toGeneric());
		
		}
		catch(e) {
		
			return e;
		
		}
		if ('undefined' === typeof thisOwner || null === thisOwner) {
		
			newArg.owner = otherOwner;
		
		}
		if ('undefined' === typeof thisAllowed || null === thisAllowed) {
		
			newArg.allowed = otherAllowed;
		
		}
		try {
		
			return new UwotFsPermissions(newArg);
		
		}
		catch(e) {
		
			return e;
		
		}
	
	}

}

/* 
vfs is implemented in posix-like manner. 
it is NOT supposed to be a fully functional posix environment, so a lot of functions
are removed from the implementation. this can always be expanded by the config users,
with a LOT of work, but is possible.
The basic implementation works thusly:
	* virtual 'root' is 'wot/fs'. this is hardcoded, can only be overridden by subclass of this, and some other rework.
	* virtual '/pub/' is symlink to config server:pubDir. doesn't need to be in vroot.
		* is '/var/www/html/' in vroot by default
		* is default location for vCWD for guests(if enabled), users(if !users:createHome)
		* generally where the 'stuff' is for the purpose of this app for public site
	* virtual ~(user home dir) is '/home/[uname]' directly or by symlink
		* is created in 'fs/home' by default if config 'users:createHome' enabled
		* is default location for vCWD for users if enabled
		* is read-only by default, can be writable for own user (or sudoer user) in config 
			'users:homeWritable'
		* if config 'server:userDir' is changed, is created in that dir, and symlinked from
			vroot '/home'
		* generally only traversable by own user
	* virtual fs 'cwd' is this.cwd, which is always a relative path from vroot
		* this.getCwd returns the local filesystem absolute path for vcwd.
			should only be used by methods of this class
		* this.getVcwd returns an 'absolute' path with vroot as '/'. 
			may be used for values returned to console.
		* this.resolvePath uses this.cwd as fallback after tilde expansion and checks
			against absolute path. this allows vfs to resolve internal paths.
	* all fs operations are synchronous
		* async wrapper (this.cmd()) should be used by processes returning values to end user
			* this method accepts bash/posix values for command names that match method logic, and array of arguments. Last arg allows to elevate permissions to 'root'
			* 'root' user doesn't exist. this.sudo can be set for a single operation,
				that's all. doesn't do much by default besides allowing access to other
				user dirs (if user.maySudo()).
				* if config 'users:sudoFullRoot' is set, this.sudo allows access to 
					everything in vroot, but cannot remove root dir or any of the dirs 
					on root level. because.
				* 'su' is not included in binPath by default, so if that's the experience
					you're after, you'll need to enable sudoFullRoot and include su in
					a binpath for your final app
		

*/

// class for synchronous, user permissions limited filesystem ops.
class UwotFs {

	constructor(userId, cwd) {
	
		this.sudo = false;
		this.dirsSet = false;
		global.Uwot.Users.listUsers(function(error, userList) {
		
			if (error) {
			
				throw error;
			
			}
			else {
			
				this.validUsers = userList;
			
			}
		
		}.bind(this));
		
		
		if ('string' !== typeof userId) {
		
			global.Uwot.Users.getGuest(function(error, user) {
			
				if (error) {
				
					throw error;
				
				}
				else {
				
					this.user = user;
					this.setDirs(cwd);
					return;
				
				}
			
			}.bind(this));
		
		}
		else {
		
			global.Uwot.Users.findById(userId, function(error, user) {
			
				if (error) {
				
					throw error;
				
				}
				else if (!user) {
				
					global.Uwot.Users.getGuest(function(error, user) {
			
						if (error) {
				
							throw error;
				
						}
						else {
				
							this.user = user;
							this.user.maySudo = function() {return false;};
							this.setDirs(cwd);
							return;
				
						}
			
					}.bind(this));
				
				}
				else {
				
					this.user = user;
					this.setDirs(cwd);
					return;
				
				}
			
			}.bind(this));
		
		}
		
	
	}
	
	setDirs(userCwd) {
	
		this.root = {
			path: path.resolve(global.Uwot.Constants.appRoot, 'fs'),
			r: true,
			w: false,
			x: false
		};
		this.pubDir = {
			path: global.Uwot.Config.getVal('server', 'pubDir'),
			r: true,
			w: false,
			x: false
		};
		this.userDir = this.user.uName === 'guest' ? null : {
			path: path.resolve(global.Uwot.Config.getVal('server', 'userDir'), this.user.uName),
			r: true,
			w: global.Uwot.Config.getVal('users', 'homeWritable'),
			x: false
		};
		var defaultcwd = null !== this.userDir ? this.userDir.path : this.pubDir.path;
		if ('string' !== typeof userCwd) {
		
			this.changeCwd(defaultcwd);
		
		}
		else {
		
			var isValidCwdForUser = this.changeCwd(userCwd);
			if (!isValidCwdForUser || isValidCwdForUser instanceof Error) {
			
				this.changeCwd(defaultcwd);
			
			}
		
		}
		this.dirsSet = true;
		return this.dirsSet;
	
	}
	
	// TBD
	//async wrapper for fs commands.
	// argArr accepts array of argument objects, empty array, or null
	// isSudo accepts boolean or undefined
	cmd(cmdName, argArr, callback, isSudo) {
	
		//sanity
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to cmd');
		
		}
		//check against valid
		if ('string' !== typeof cmdName || 'object' !== typeof argArr || -1 === VALID_CMDS.indexOf(cmdName)) {
		
			return callback(systemError.EINVAL({'syscall': 'signal'}), null);
		
		}
		else {
		
			// set null args to empty array
			if (null === argArr || !Array.isArray(argArr)) {
			
				argArr = [];
			
			}
			//set this.sudo (checking if user is allowed)
			if ('boolean' === typeof isSudo && isSudo && this.user.maySudo()) {
			
				this.sudo = true;
			
			}
			else {
			
				this.sudo = false;
			
			}
			var result;
			try {
			
				//perform matching command, expanding argArr
				switch(cmdName) {
			
					case 'cd':
						result = this.changeCwd(...argArr);
						break;
					case 'ls':
						// expected argArr:
						// [(string)path, (bool)showInvisible, (bool)longForm]
						var rawFileArr = this.readDir(argArr[0]);
						argArr[1] = 'boolean' === typeof argArr[1] ? argArr[1] : false;
						argArr[2] = 'boolean' === typeof argArr[2] ? argArr[2] : false;
						var vprocFileArr = this.visibility(rawFileArr, argArr[0], argArr[1]);
						result = argArr[2] ? this.longFormatFiles(vprocFileArr, argArr[0]) : vprocFileArr;
						break;
					case 'pwd':
						result = this.getVcwd();
						break;
					case 'mkdir':
						// will support -p (recursive path dir creation)
						argArr[1] = 'boolean' === typeof argArr[1] ? argArr[1] : false;
						result = this.createDir(...argArr);
						break;
					case 'rm':
						//need to parse flags from argArr prior to calls...
						// -d for dirs, -R recursive
						result = this.removeFile(...argArr);
						break;
					case 'rmdir':
						result = this.removeDir(...argArr);
						break;
					case 'mv':
						// should support -n
						// expected argArr:
						// [(string)source, (string)target, (bool)noOverwrite]
						argArr[2] = 'boolean' === typeof argArr[2] ? argArr[2] : false;
						result = this.moveFile(...argArr);
						break;
					case 'cp':
						// should support -n, -R
						// expected argArr:
						// [(string)source, (string)target, (bool)noOverwrite, (bool)isRecursive]
						result = this.copy(...argArr);
						break;
					case 'stat':
						// expected argArr:
						// [(string)path, (bool)isVerbose, (bool)appendFtc, (string)format]
						// support -v -f and -F but not multiple paths
						result = this.stat(...argArr);
						break;
					case 'touch':
						result = this.touch(...argArr);
						break;
					case 'cat':
						// expected argArr:
						// [(string)path(s), (string)separator]
						var separator = argArr.pop();
						result = this.cat(argArr, separator);
						break;
					case 'chmod':
						// expected argArr:
						// [(string)path, (array)allowed, (bool)isRecursive, (string)username]
						result = this.changeAllowed(...argArr);
						break;
					case 'chown':
						// expected argArr:
						// [(string)path, (string)username, (bool)isRecursive]
						result = this.changeOwner(...argArr);
						break;
					default:
						result = systemError.EINVAL({'syscall': 'signal'});
			
				}
			
			}
			catch(e) {
			
				//set this.sudo = false
				this.sudo = false;
				return callback(e, null);
			
			}
			//set this.sudo = false
			this.sudo = false;
			//handle sync and system errors
			// just passing these through for now
			//return result or error
			if (result instanceof Error) {
			
				if (result.hasOwnProperty('code')) {
				
					var seCode = result.code;
					var sePath, seTarget;
					if ('string' === typeof result.path && 'string' === typeof result.dest) {
					
						sePath = 'string' === typeof result.path && this.isInRoot(result.path) ? this.dissolvePath(result.path) : result.path;
						seTarget = 'string' === typeof result.dest && this.isInRoot(result.dest) ? this.dissolvePath(result.dest) : result.dest;
						result = systemError[seCode]({syscall: result.syscall, path: sePath, dest: seTarget});
					
					}
					else if ('string' === typeof result.dest) {
					
						seTarget = 'string' === typeof result.dest && this.isInRoot(result.dest) ? this.dissolvePath(result.dest) : result.dest;
						result = systemError[seCode]({syscall: result.syscall, dest: seTarget});
					
					}
					else if ('string' === typeof result.path) {
					
						sePath = 'string' === typeof result.path && this.isInRoot(result.path) ? this.dissolvePath(result.path) : result.path;
						result = systemError[seCode]({syscall: result.syscall, path: sePath});
					
					}
				
				}
				return callback(result, null);
			
			}
			else {
			
				return callback(false, result);
			
			}
		
		}
	
	}
	
	// TBD
	// set req.session.vfsCwd
	changeCwd(pth) {
	
		//check is string
		if ('string' !== typeof pth) {
		
			return new TypeError('path must be a string');
		
		}
		else {
			
			//resolve
			var absPth = this.resolvePath(pth);
			if('string' !== typeof absPth) {
			
				return absPth;
			
			}
			//check isReadable
			var canRead = this.isReadable(absPth);
			//check isDirectory
			var pthIsDirectory;
			try {
			
				pthIsDirectory = fs.statSync(absPth).isDirectory();
			
			}
			catch(dirErr) {
			
				return dirErr;
			
			}
			if (canRead instanceof Error) {
			
				return canRead;
			
			}
			else if (!pthIsDirectory) {
			
				return systemError.ENOTDIR({syscall: 'stat', path: pth});
			
			}
			else if (canRead && absPth === this.root.path) {
			
				this.cwd = '';
				return true;
			
			}
			else if (canRead) {
			
				this.cwd = absPth.replace(this.root.path + path.sep, '');
				return true;
			
			}
			else {
			
				return systemError.EACCES({'path': pth, 'syscall': 'chdir'});
		
			}
		
		}
	
	}
	
	// this.cwd is relative path to this.root.path
	// TBD
	// get req.session.vfsCwd
	// check if user can access that dir
	getVcwd() {
	
		return 'string' === typeof this.cwd && '' !== this.cwd ? path.sep + this.cwd : path.sep;
	
	}
	
	// returns absolute path of this.cwd
	// TBD
	// get req.session.vfsCwd
	// check if user can access that dir
	getCwd() {
	
		return 'string' === typeof this.cwd && '' !== this.cwd ? path.resolve(this.root.path, this.cwd) : this.root.path;
	
	}
	
	append(pth, data) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.appendFileSync(path.join(fullPath, fileName), data);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'write'});
		
		}
	
	}
	
	touch(pth) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var now = new Date();
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.appendFileSync(path.join(fullPath, fileName), '');
			
			}
			catch(e) {
			
				if (e instanceof Error && 'string' === typeof e.code && 'EISDIR' === e.code) {
				
					try {
			
						fs.utimesSync(path.join(fullPath, fileName), now, now);
						return true;
			
					}
					catch(err) {
			
						return err;
			
					}
				
				}
				return e;
			
			}
			try {
			
				fs.utimesSync(path.join(fullPath, fileName), now, now);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'write'});
		
		}
	
	}
	
	cat(pthArr, separator) {
	
		var catArr = [];
		separator = 'string' === typeof separator ? separator : EOL;
		for (let catIdx = 0; catIdx < pthArr.length; catIdx++) {
		
			if ('string' === typeof pthArr[catIdx]) {
			
				let thisFileString = this.readFile(pthArr[catIdx]);
				if ('object' === typeof thisFileString && thisFileString instanceof Error) {
				
					catIdx = pthArr.length;
					return thisFileString;
				
				}
				else if ('string' !== typeof thisFileString) {
				
					catIdx = pthArr.length;
					return systemError.EIO({syscall: 'read', path: pthArr[catIdx]});
				
				}
				else {
				
					catArr.push(thisFileString);
				
				}
			
			}
			else {
			
				catIdx = pthArr.length;
				return systemError.EINVAL({syscall: 'read'});
			
			}
			if ((catIdx + 1) >= pthArr.length) {
			
				// Extra EOL is default between files; default POSIX would require '' as separator
				return catArr.join(separator+EOL);
			
			}
		
		}
	
	}
	
	copy(source, target, noOverwrite, isRecursive) {
		
		noOverwrite = 'boolean' === typeof noOverwrite ? noOverwrite : false;
		isRecursive = 'boolean' === typeof isRecursive ? isRecursive : false;
		var fullPathSource, fullPathTarget;
		var fileNameSource = path.basename(source);
		var fileNameTarget = path.basename(target);
		if (path.isAbsolute(source) && -1 !== source.indexOf(this.root.path)) {
		
			fullPathSource = source;
		
		}
		else {
		
			fullPathSource = this.resolvePath(source, false);
			if ('string' !== typeof fullPathSource) {
			
				return fullPathSource;
			
			}
		
		}
		if (path.isAbsolute(target) && -1 !== target.indexOf(this.root.path)) {
		
			fullPathTarget = target;
		
		}
		else {
		
			fullPathTarget = this.resolvePath(target, false);
			if ('string' !== typeof fullPathTarget) {
			
				return fullPathTarget;
			
			}
		
		}
		fullPathSource = path.dirname(fullPathSource);
		fullPathTarget = path.dirname(fullPathTarget);
		var canRead = this.isReadable(fullPathSource);
		var canWrite = this.isWritable(fullPathTarget);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canRead && canWrite) {
		
			var cpOpts;
			if (isRecursive) {
			
				try {
				
					cpOpts = {
						overwrite: !noOverwrite,
						errorOnExist : true
					};
					fs.copySync(path.join(fullPathSource, fileNameSource), path.join(fullPathTarget, fileNameTarget), cpOpts);
					return true;
				
				}
				catch(e) {
			
					return e;
			
				}
			
			}
			else {
			
				try {
			
					cpOpts = noOverwrite ? fs.constants.COPYFILE_EXCL : cpOpts;
					fs.copyFileSync(path.join(fullPathSource, fileNameSource), path.join(fullPathTarget, fileNameTarget), cpOpts);
					return true;
			
				}
				catch(e) {
			
					return e;
			
				}
			
			}
		
		}
		else if (!canRead) {
		
			return systemError.EACCES({'path': source, 'syscall': 'open'});
		
		}
		else {
		
			return systemError.EACCES({'path': target, 'syscall': 'write'}); 
		
		}
	
	}
	
	createDir(pth, recurse) {
	
		var fullPath;
		var dirName = path.basename(pth);
		if('boolean' !== typeof recurse) {
		
			recurse = false;
		
		}
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.mkdirSync(path.join(fullPath, dirName));
				return path.join(fullPath, dirName);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'write'});
		
		}
	
	}
	
	readDir(pth) {
	
		var fullPath;
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			try {
			
				fullPath = this.resolvePath(pth, false);
			
			}
			catch(err) {
			
				return err;
			
			}
		
		}
		var canRead = this.isReadable(fullPath);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {
		
			try {
			
				return fs.readdirSync(fullPath);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'readdir'});
		
		}
	
	}
	
	readFile(pth) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			try {
			
				fullPath = this.resolvePath(pth, false);
			
			}
			catch(err) {
			
				return err;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canRead = this.isReadable(fullPath);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {
		
			try {
			
				return fs.readFileSync(path.join(fullPath, fileName), 'utf8');
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'read'});
		
		}
	
	}
	
	moveFile(source, target, noOverwrite) {
	
		noOverwrite = 'boolean' === typeof noOverwrite ? noOverwrite : false;
		var fullPathSource, fullPathTarget;
		var fileNameSource = path.basename(source);
		var fileNameTarget = path.basename(target);
		if (path.isAbsolute(source) && -1 !== source.indexOf(this.root.path)) {
		
			fullPathSource = source;
		
		}
		else {
		
			fullPathSource = this.resolvePath(source, false);
			if ('string' !== typeof fullPathSource) {
			
				return fullPathSource;
			
			}
		
		}
		if (path.isAbsolute(target) && -1 !== target.indexOf(this.root.path)) {
		
			fullPathTarget = target;
		
		}
		else {
		
			fullPathTarget = this.resolvePath(target, false);
			if ('string' !== typeof fullPathTarget) {
			
				return fullPathTarget;
			
			}
		
		}
		fullPathSource = path.dirname(fullPathSource);
		fullPathTarget = path.dirname(fullPathTarget);
		var canRead = this.isReadable(fullPathSource);
		var canWrite = this.isWritable(fullPathSource);
		var canWriteNew = this.isWritable(fullPathTarget);
		var targetExists = false;
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWriteNew instanceof Error) {
		
			return canWriteNew;
		
		}
		else if (canRead && canWrite && canWriteNew) {
		
			if (noOverwrite) {
		
				try {
			
					targetExists = fs.existsSync(fullPathTarget);
			
				}
				catch(e) {
			
					return e;
			
				}
				if (targetExists) {
				
					return new Error('File "' + path.basename(source) + '" not moved; "' + path.basename(target) + '" exists and -n flag prevents overwriting existing file.');
				
				}
		
			}
			try {
			
				fs.renameSync(path.join(fullPathSource, fileNameSource), path.join(fullPathTarget, fileNameTarget));
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (!canRead) {
		
			return systemError.EACCES({'path': source, 'syscall': 'read'});
		
		}
		else if (!canWrite) {
		
			return systemError.EACCES({'path': source, 'syscall': 'unlink'});
		
		}
		else {
		
			return systemError.EACCES({'path': target, 'syscall': 'write'});
		
		}
	
	}
	
	removeDir(pth) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.rmdirSync(path.join(fullPath, fileName));
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'rmdir'});
		
		}
	
	}
	
	removeFile(pth) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.unlinkSync(path.join(fullPath, fileName));
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'unlink'});
		
		}
	
	}
	
	stat(pth, isVerbose, appendFtc, format) {
	
		isVerbose = 'boolean' === typeof isVerbose ? isVerbose : false;
		appendFtc = 'boolean' === typeof appendFtc && !isVerbose ? appendFtc : false;
		format = 'string' === typeof format && !isVerbose ? format : '%e%A %h %U %s "%X" "%Y" "%W" %B %b %N';
		if (isVerbose) {
		
			format = 'File: "%N"' + EOL;
			format += 'Size: %s Blocks: %b BlockSize: %B' + EOL;
			format += 'FileType: %F' + EOL;
			format += 'Links: %h' + EOL;
			format += 'Allowed: %A' + EOL;
			format += 'Owner: %U' + EOL;
			format += 'LastAccessed: %X' + EOL;
			format += 'LastModified: %Y' + EOL;
			format += 'Created: %W' + EOL;
		
		}
		else if (appendFtc) {
		
			format = format.replace(/(?<!\\{1})(%N)(?!%f)/g, '%N%f');
		
		}
		var lstatInfo = this.lstat(pth);
		var permInfo = this.getPermissions(pth);
		var subVals = {
			A: ''
		};
		if (lstatInfo instanceof Error) {
		
			return lstatInfo;
		
		}
		else if (permInfo instanceof Error) {
		
			return permInfo;
		
		}
		subVals.A = permInfo.getUserPermsString();
		subVals.U = 'string' === typeof permInfo.owner ? permInfo.owner : DEFAULT_OWNER;
		subVals.N = path.basename(pth);
		if ('object' === typeof lstatInfo && lstatInfo instanceof fs.Stats) {
		
			subVals.b = lstatInfo.blocks;
			subVals.B = lstatInfo.blksize;
			subVals.h = lstatInfo.nlink;
			subVals.s = lstatInfo.size;
			subVals.w = lstatInfo.birthtimeMs;
			subVals.W = lstatInfo.birthtime;
			subVals.x = lstatInfo.atimeMs;
			subVals.X = lstatInfo.atime;
			subVals.y = lstatInfo.mtimeMs;
			subVals.Y = lstatInfo.mtime;
			if (lstatInfo.isFIFO()) {
			
				subVals.e = 'p';
				subVals.f = '|';
				subVals.F = 'FIFO';
			
			}
			else if (lstatInfo.isDirectory()) {
			
				subVals.e = 'd';
				subVals.f = '/';
				subVals.F = 'Directory';
			
			}
			else if (lstatInfo.isFile()) {
			
				subVals.e = '-';
				subVals.f = '';
				subVals.F = 'File';
			
			}
			else if (lstatInfo.isSocket()) {
			
				subVals.e = 's';
				subVals.f = '=';
				subVals.F = 'Socket';
			
			}
			else if (lstatInfo.isSymbolicLink()) {
			
				subVals.e = 'l';
				subVals.f = '@';
				subVals.F = 'Symbolic Link';
			
			}
		
		}
		var formatted = format.toString();
		formatted = formatted.replace(/(?<!\\{1})(%A)/g, subVals.A);
		formatted = formatted.replace(/(?<!\\{1})(%b)/g, subVals.b);
		formatted = formatted.replace(/(?<!\\{1})(%B)/g, subVals.B);
		formatted = formatted.replace(/(?<!\\{1})(%e)/g, subVals.e);
		formatted = formatted.replace(/(?<!\\{1})(%f)/g, subVals.f);
		formatted = formatted.replace(/(?<!\\{1})(%F)/g, subVals.F);
		formatted = formatted.replace(/(?<!\\{1})(%h)/g, subVals.h);
		formatted = formatted.replace(/(?<!\\{1})(%N)/g, subVals.N);
		formatted = formatted.replace(/(?<!\\{1})(%s)/g, subVals.s);
		formatted = formatted.replace(/(?<!\\{1})(%U)/g, subVals.U);
		formatted = formatted.replace(/(?<!\\{1})(%w)/g, subVals.w);
		formatted = formatted.replace(/(?<!\\{1})(%W)/g, subVals.W);
		formatted = formatted.replace(/(?<!\\{1})(%x)/g, subVals.x);
		formatted = formatted.replace(/(?<!\\{1})(%X)/g, subVals.X);
		formatted = formatted.replace(/(?<!\\{1})(%y)/g, subVals.y);
		formatted = formatted.replace(/(?<!\\{1})(%Y)/g, subVals.Y);
		return formatted;
	
	}
	
	lstat(pth) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canRead = this.isReadable(fullPath);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {	
			
			try {
		
				var stats = fs.statSync(path.join(fullPath, fileName));
				return stats;
		
			}
			catch(e) {
		
				return e;
		
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'stat'});
		
		}
	
	}
	
	write(pth, data) {
	
		var fullPath;
		var fileName = path.basename(pth);
		if (path.isAbsolute(pth) && -1 !== pth.indexOf(this.root.path)) {
		
			fullPath = pth;
		
		}
		else {
		
			fullPath = this.resolvePath(pth, false);
			if ('string' !== typeof fullPath) {
			
				return fullPath;
			
			}
		
		}
		fullPath = path.dirname(fullPath);
		var canWrite = this.isWritable(fullPath);
		if (canWrite instanceof Error) {
		
			return canWrite;
		
		}
		else if (canWrite) {
		
			try {
			
				fs.writeFileSync(path.join(fullPath, fileName), data);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'write'});
		
		}
	
	}
	
	// path must be a string or will return an error
	// if userName undefined or non-string, will check against this.userDir.path (which must exist!)
	// if userName === "*", will check against the entire user directory path
	// if userName is a string matching an existing user, will check against that user's directory path (which must exist!)
	isInUser(pth, userName) {
	
		
		if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInUser must be a string');
		
		}
		else if ('string' !== typeof userName && (null === this.userDir || !fs.existsSync(this.userDir.path))) {
		
			return false;
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			if ('string' !== typeof userName) {
			
				return pathIsInside(fullPath, this.userDir.path);
			
			}
			else if (userName === "*") {
			
				return pathIsInside(fullPath, path.resolve(global.Uwot.Config.getVal('server', 'userDir')));
		
			}
			else {

				var thisUserDirPath = path.resolve(global.Uwot.Config.getVal('server', 'userDir'), userName);
				if (fs.existsSync(thisUserDirPath)) {
		
					return pathIsInside(fullPath, thisUserDirPath);
				
				}
				else {
		
					return false;
		
				}
			
			}
		
		}
	
	}
	
	isInPub(pth) {
	
		if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInPub must be a string');
		
		}
		else if (null === this.pubDir || !fs.existsSync(this.pubDir.path)) {
		
			return false;
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			return pathIsInside(fullPath, this.pubDir.path);
		
		}
	
	}
	
	isInRoot(pth) {
	
		if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInRoot must be a string');
		
		}
		else if (null === this.root || !fs.existsSync(this.root.path)) {
		
			return false;
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			return pathIsInside(fullPath, this.root.path);
		
		}
	
	}
	
	
	tildeExpand(pth) {
			
		if ('string' === typeof pth && pth.startsWith('~')) {
		
			
			return null !== this.userDir ? path.join(this.userDir.path, pth.replace('~', '')) : path.join(this.root.path, pth.replace('~', ''));
		
		}
		return pth;
	
	}
	
	
	// resolves path w/ expansion, using this.cwd
	resolvePath(pth, checkIfExists) {
	
		if('boolean' !== typeof checkIfExists) {
		
			checkIfExists = true;
		
		}
		if ('string' !== typeof pth) {
		
			return new TypeError('path passed to resolvePath must be a string');
		
		}
		else if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
		
			return systemError.ENOENT({syscall: 'stat', path: pth});
		
		}
		if (pth.startsWith('~')) {
		
			pth = this.tildeExpand(pth);
		
		}
		var pthStats;
		if (pth === path.sep) {
		
			try {
			
				if (checkIfExists) {
				
					pthStats = fs.statSync(this.root.path);
				
				}
				return this.root.path;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (path.isAbsolute(pth)) {
		
			var pthInRoot;
			var absPth = pth; 
			try {
			
				pthInRoot = this.isInRoot(pth);
				if (pthInRoot instanceof Error) {
				
					throw pthInRoot;
				
				}
				else if (!pthInRoot) {
				
					absPth = path.resolve(this.root.path, pth.replace(/^\/+/g, ''));
				
				}
				if (checkIfExists) {
				
					pthStats = pthInRoot ? fs.statSync(pth) : fs.statSync(absPth);
				
				}
				return pthInRoot ? pth : absPth;
			
			}
			catch(error) {
			
				return error;
			
			}
		
		}
		else {
		
			var fromCwd = path.resolve('string' === typeof this.cwd ? this.getCwd() : this.root.path, pth);
			try {
		
				if (checkIfExists) {
				
					pthStats = fs.statSync(fromCwd);
				
				}
				return fromCwd;
		
			}
			catch(e) {
		
				// this level of redundancy is nice in theory, but in practice it will result in nonsensical output to the user; relative paths, in general, should only be tested against the cwd and return an error if nonextant
//				var fromRoot = path.resolve(this.root.path, pth);
// 				try {
// 			
// 					if (checkIfExists) {
// 					
// 						var fromRootStats = fs.statSync(fromRoot);
// 						
// 					}
// 					return fromRoot;
// 			
// 				}
// 				catch(err) {
// 			
// 					return err;
// 			
// 				}
				return e;
		
			}
		
		}
	
	}
	
	dissolvePath(pth) {
	
		var thisCwd = this.getCwd();
		if ('string' !== typeof pth) {
		
			return pth;
		
		}
		else if (path.isAbsolute(pth) && null !== this.userDir && 'string' === typeof this.userDir.path && -1 !== pth.indexOf(this.userDir.path)) {
		
			var udPre = '/home/' + this.user.uName;
			return pth.replace(this.userDir.path, udPre);
		
		}
		else if (path.isAbsolute(pth) && null !== this.pubDir && 'string' === typeof this.pubDir.path && -1 !== pth.indexOf(this.pubDir.path)) {
		
			var pdPre = '/var/www/html';
			return pth.replace(this.pubDir.path, pdPre);
		
		}
		else if (path.isAbsolute(pth) && 'string' === typeof thisCwd && -1 !== pth.indexOf(thisCwd)) {
		
			var cwdPre;
			if (null !== this.userDir && 'string' === typeof this.userDir.path && -1 !== thisCwd.indexOf(this.userDir.path)) {
			
				cwdPre = thisCwd.replace(this.userDir.path, '/home/' + this.user.uName);
			
			}
			else if (null !== this.pubDir && 'string' === typeof this.pubDir.path && -1 !== thisCwd.indexOf(this.pubDir.path)) {
			
				cwdPre = thisCwd.replace(this.pubDir.path, '/var/www/html');
			
			}
			else if (-1 !== thisCwd.indexOf(this.root.path)) {
			
				cwdPre = thisCwd.replace(this.root.path, '');
			
			}
			else {
			
				cwdPre = '';
			
			}
			return pth.replace(thisCwd, cwdPre);
		
		}
		else if (path.isAbsolute(pth) && 'string' === typeof this.root.path && -1 !== pth.indexOf(this.root.path)) {
		
			return pth.replace(this.root.path, '');
		
		}
		else {
		
			return pth;
		
		}
	
	}
	
	isReadable(pth) {
	
		var vfsReadable = false;
		if ('string' !== typeof pth) {
		
			return systemError.EINVAL({'path': pth, 'syscall': 'stat'});
		
		}
		else if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		var pthVars = this.getPathLocVars(pth, false);
		if (!pthVars.inVFS) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		else if (!pthVars.inAllowed && pthVars.sudoAllowed) {
		
			vfsReadable = true;
		
		}
		else if (pthVars.isOwned) {
		
			vfsReadable = true;
		
		}
		else {
		
			var permissions = this.getPermissions(pthVars.fullPath);
			if (permissions instanceof Error) {
			
				return permissions;
			
			}	
			else if ('string' === typeof permissions.owner && this.user['uName'] === permissions.owner) { 
			
				vfsReadable = true;
			
			}
			else if (permissions.mayRead(this.user.uName)) {
			
				vfsReadable = true;
			
			}
		
		}
		if (vfsReadable) {
		
			try {
			
				fs.accessSync(pthVars.fullPath, fs.constants.R_OK);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'stat'});
		
		}
	
	}
	
	// TBD
	isWritable(pth) {
	
		var vfsWritable = false;
		if ('string' !== typeof pth) {
		
			return systemError.EINVAL({'path': pth, 'syscall': 'stat'});
		
		}
		else if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		var pthVars = this.getPathLocVars(pth, false);
		if (!pthVars.inVFS) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		else if (pthVars.isOwned && global.Uwot.Config.getVal('users', 'homeWritable') && global.Uwot.Config.getVal('users', 'createHome')) {
		
			vfsWritable = true;
		
		}
		else if (!pthVars.inAllowed && pthVars.sudoAllowed) {
		
			vfsWritable = true;
		
		}
		else if (pthVars.inPub) {

			var permissions = this.getPermissions(pthVars.fullPath);
			if (permissions instanceof Error) {
			
				return permissions;
			
			}	
			else if ('string' === typeof permissions.owner && this.user['uName'] === permissions.owner) { 
			
				vfsWritable = true;
			
			}
			else if (permissions.mayWrite(this.user.uName)) {
			
				vfsWritable = true;
			
			}
		
		}
		
		if (vfsWritable) {
		
			try {
			
				fs.accessSync(pthVars.fullPath, fs.constants.W_OK);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'stat'});
		
		}
	
	}
	
	getPermissions(pth) {
	
		// Look in dir at pth for permFile and get permissions Obj
		var permObj = this.getExplicitPermissions(pth);
		if ('object' === typeof permObj) {
		
			// Error or UwotFsPermissions instance
			return permObj;
		
		}
		else if (!permObj) {
		
			// No Error, no explicit permissions. Go up the tree and look.
			permObj = this.getInheritedPermissions(pth);
		
		}
		else {
		
			// shouldn't get here
			return permObj;
		
		}
		
		// Check inherited permissions result
		if ('object' === typeof permObj) {
		
			// Error or UwotFsPermissions instance
			return permObj;
		
		}
		else if (!permObj) {
		
			// No Error, no inherited permissions. Get defaults (or error) and return.
			permObj = this.getDefaultPermissions(pth);
			return permObj;
		
		}
		else {
		
			// shouldn't get here
			return permObj;
		
		}
		
	
	}
	
	getExplicitPermissions(pth) {
	
		var pthVars = this.getPathLocVars(pth);
		if (pthVars instanceof Error) {
		
			return pthVars;
		
		}
		if (!pthVars.inRoot && !pthVars.inUsers && !pthVars.inAllowed) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		else if (pthVars.inRoot && !pthVars.inAllowed && !(this.sudo && (global.Uwot.Config.getVal('users', 'sudoFullRoot')))) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		var pthStats, permFile, permissions;
		try {
		
			pthStats = fs.statSync(pthVars.fullPath);
		
		}
		catch (e) {
		
			return e;
		
		}
		if (pthStats.isDirectory()) {
			
			try{
		
				permFile = fs.readFileSync(path.resolve(pthVars.fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME));
				permissions = global.Uwot.Constants.tryParseJSON(permFile);
				if ('object' === typeof permissions) {
			
					return new UwotFsPermissions(permissions);
			
				}
				else {
				
					return false;
				
				}
			
			}
			catch(e) {
			
				return false;
			
			}
		
		}
		else if (pthStats.isFile()) {
		
			var thisDir = path.dirname(pthVars.fullPath);
			try{
		
				permFile = fs.readFileSync(path.resolve(thisDir, UWOT_HIDDEN_PERMISSIONS_FILENAME));
				permissions = global.Uwot.Constants.tryParseJSON(permFile);
				if ('object' === typeof permissions) {
			
					return new UwotFsPermissions(permissions);
			
				}
				else {
				
					return false;
				
				}
			
			}
			catch(e) {
			
				return false;
			
			}
		
		}
		else {
		
			return systemError.ENOENT({path: pth, syscall: 'stat'});
		
		}
	
	}
	
	getInheritedPermissions(pth) {
	
		var pthVars = this.getPathLocVars(pth);
		if ('object' === typeof pthVars && pthVars instanceof Error) {
		
			return pthVars;
		
		}
		else if (!pthVars.inVFS) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		else if (pthVars.fullPath === this.root.path) {
		
			return false;
		
		}
		else {
		
			var parentPath = pthVars.fullPath.toString();
			var parentPermissions = false;
			while (parentPath !== this.root.path && !parentPermissions) {
			
				parentPath = path.resolve(parentPath, '..');
				if (fs.existsSync(path.join(parentPath, UWOT_HIDDEN_PERMISSIONS_FILENAME))) {
				
					parentPermissions = this.getExplicitPermissions(parentPath);
				
				}
			
			}
			return parentPermissions;
		
		}
	
	}
	
	getDefaultPermissions(pth) {
	
		var pthVars = this.getPathLocVars(pth);
		if ('object' === typeof pthVars && pthVars instanceof Error) {
		
			return pthVars;
		
		}
		else if (!pthVars.inRoot && !pthVars.inUsers && !pthVars.inPub) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		else if (pthVars.inRoot && !pthVars.inAllowed && (this.sudo && (global.Uwot.Config.getVal('users', 'sudoFullRoot')))) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_READ});
		
		}
		else if (pthVars.inPub) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_READ_EXE});
		
		}
		else if (pthVars.isOwned) {
		
			return new UwotFsPermissions({'owner': this.user.uName, 'allowed': global.Uwot.Config.getVal('users', 'homeWritable') ? ALLOWED_READ_WRITE_EXE : ALLOWED_READ_EXE});
		
		}
		else {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
	
	}
	
	setPermissions(pth, userName, permissions) {
	
		if (!this.sudo || 'string' !== typeof pth) {
		
			return systemError.EPERM({path: pth, syscall: 'chmod'});
		
		}
		else if ('string' !== typeof userName || 'object' !== typeof permissions || null === permissions) {
		
			return new TypeError('invalid user or permissions');
		
		}
		
		var userExists = this.isValidUserName(userName);
		if (!userExists) {
		
			return new Error(userName + ': illegal user name');
		
		}
		var pthVars = this.getPathLocVars(pth);
		if (!pthVars.inRoot && !pthVars.inUsers && !pthVars.inAllowed) {
		
			return systemError.ENOENT({path: pth, syscall: 'chmod'});
		
		}
		var currentPermissions = this.getPermissions(pthVars.fullPath);
		if (currentPermissions instanceof Error) {
		
			return currentPermissions;
		
		}
		var newPermissions = new UwotFsPermissions(permissions);
		if (currentPermissions.allowed !== DEFAULT_ALLOWED && ('object' !== typeof newPermissions.allowed || null === newPermissions.allowed || !Array.isArray(newPermissions.allowed))) {
		
			newPermissions.allowed = currentPermissions.allowed;
		
		}
		if (pthVars.isOwned && DEFAULT_OWNER === currentPermissions.owner && 'string' !== typeof newPermissions.owner) {
		
			newPermissions.owner = this.user['uName'];
		
		}
		var updatedPermissions = JSON.stringify(newPermissions.concatPerms(currentPermissions.toGeneric()).toGeneric());
		var permPath;
		try {
		
			var pthStats = fs.statSync(pthVars.fullPath);
			if (pthStats.isDirectory()) {
			
				permPath = path.resolve(pthVars.fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
			else {
			
				var dirPath = path.dirname(pthVars.fullPath);
				permPath = path.resolve(dirPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
		
		}
		catch(e) {
		
			return e;
		
		}
		try {
		
			fs.writeFileSync(permPath, updatedPermissions);
			return true;
		
		}
		catch(e) {
		
			return e;
		
		}
	
	}
	
	changeAllowed(pth, allowed, isRecursive, userName) {
	
		if ('string' !== typeof pth) {
		
			return systemError.EINVAL({syscall: 'chmod'});
		
		}
		else if ('object' !== typeof allowed || null === allowed || !Array.isArray(allowed)) {
		
			return new TypeError('invalid allowed');
		
		}
		var self = this;
		isRecursive = 'boolean' === typeof isRecursive ? isRecursive : false;
		userName = 'string' === typeof userName && self.isValidUserName(userName) ? userName : null;
		var pthVars = self.getPathLocVars(pth);
		if (!pthVars.inRoot && !pthVars.inUsers && !pthVars.inAllowed) {
		
			return systemError.ENOENT({path: pth, syscall: 'chmod'});
		
		}
		var currentPermissions = self.getPermissions(pthVars.fullPath);
		if (currentPermissions instanceof Error) {
		
			return currentPermissions;
		
		}
		var currentPermissionsGeneric = currentPermissions.toGeneric();
		if (!self.sudo && ('string' !== typeof currentPermissions.owner || self.user.uName !== currentPermissions.owner)) {
		
			return systemError.EPERM({syscall: 'chmod', path: pthVars.fullPath});
		
		}
		if (null === userName) {
		
			currentPermissionsGeneric.allowed = allowed;
		
		}
		else {
		
			currentPermissionsGeneric[userName] = allowed;
		
		}
		var newPermissions;
		try {
		
			newPermissions = new UwotFsPermissions(currentPermissionsGeneric);
		
		}
		catch(e) {
		
			return e;
		
		}
		var permPath;
		try {
		
			var pthStats = fs.statSync(pthVars.fullPath);
			if (pthStats.isDirectory()) {
			
				permPath = path.resolve(pthVars.fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
			else {
			
				var dirPath = path.dirname(pthVars.fullPath);
				permPath = path.resolve(dirPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
		
		}
		catch(e) {
		
			return e;
		
		}
		var updatedPermissions = newPermissions.toJSON();
		try {
		
			fs.writeFileSync(permPath, updatedPermissions);
			if (isRecursive) {
			
				var subDirs = self.readdirRecursive(pthVars.fullPath, 'directory');
				if ('object' !== typeof subDirs || (!Array.isArray(subDirs) && !(subDirs instanceof Error))) {
				
					return systemError.EIO({syscall: 'readdir', path: pthVars.fullPath});
				
				}
				else if (subDirs instanceof Error) {
				
					return subDirs;
				
				}
				else if (subDirs.length < 1) {
				
					return true;
				
				}
				else {
				
					for (let i = 0; i < subDirs.length; i++) {
					
						var curseResult;
						try {
						
							curseResult = self.changeAllowed(subDirs[i], allowed, false, userName);
						
						}
						catch(e) {
						
							i = subDirs.length;
							return e;
						
						}
						if (curseResult instanceof Error) {
						
							i = subDirs.length;
							return curseResult;
						
						}
						if ((i + 1) >= subDirs.length) {
						
							return true;
						
						}
					
					}
				
				}
			
			}
			else {
			
				return true;
			
			}
		
		}
		catch(e) {
		
			return e;
		
		}
		
	
	}
	
	changeOwner(pth, userName, isRecursive) {
	
		if ('string' !== typeof userName) {
		
			return new TypeError('invalid user');
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('invalid path');
		
		}
		else if (!this.isValidUserName(userName)) {
			
			return new Error(userName + ': illegal user name');
			
		}
		else {
		
			isRecursive = 'boolean' === typeof isRecursive ? isRecursive : false;
			var pthVars = this.getPathLocVars(pth);
			if (!pthVars.inVFS) {
			
				return systemError.ENOENT({path: pth, syscall: 'chown'});
			
			}
			var currentPermissions = this.getPermissions(pthVars.fullPath);
			if (currentPermissions instanceof Error) {
			
				return currentPermissions;
			
			}
			if (!this.sudo && !('string' === typeof currentPermissions.owner && this.user.uName === currentPermissions.owner)) {
		
				return systemError.EPERM({path: pth, syscall: 'chown'});
		
			}
			else {
			
				var newPermissions = new UwotFsPermissions({owner: userName});
				if (currentPermissions.allowed !== DEFAULT_ALLOWED) {
			
					newPermissions.allowed = currentPermissions.allowed;
			
				}

				var updatedPermissions = newPermissions.concatPerms(currentPermissions.toGeneric()).toJSON();
				var permPath;
				try {
			
					var pthStats = fs.statSync(pthVars.fullPath);
					if (pthStats.isDirectory()) {
				
						permPath = path.resolve(pthVars.fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
					}
					else {
				
						permPath = path.resolve(path.dirname(pthVars.fullPath), UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
					}
			
				}
				catch(e) {
			
					return e;
			
				}
				try {
			
					fs.writeFileSync(permPath, updatedPermissions);
					if (isRecursive) {
			
						var subDirs = this.readdirRecursive(pthVars.fullPath, 'directory');
						if (subDirs instanceof Error) {
				
							return subDirs;
				
						}
						else if ('object' !== typeof subDirs || !Array.isArray(subDirs)) {
				
							return systemError.EIO({syscall: 'readdir', path: pthVars.fullPath});
				
						}
						else if (subDirs.length < 1) {
				
							return true;
				
						}
						else {
				
							for (let i = 0; i < subDirs.length; i++) {
					
								var curseResult;
								try {
						
									curseResult = this.changeOwner(subDirs[i], userName, false);
						
								}
								catch(e) {
						
									i = subDirs.length;
									return e;
						
								}
								if (curseResult instanceof Error) {
						
									i = subDirs.length;
									return curseResult;
						
								}
								if ((i + 1) >= subDirs.length) {
						
									return true;
						
								}
					
							}
				
						}
			
					}
					else {
			
						return true;
			
					}
			
				}
				catch(e) {
			
					return e;
			
				}
			
			}
		
		}
	
	}
	
	isValidUserName(userName) {
	
		var userExists = false;
		for (let i = 0; i < this.validUsers.length; i++) {
		
			if (userName === this.validUsers[i]['uName']) {
			
				userExists = true;
				i = this.validUsers.length;
			
			}
			if ((i + 1) >= this.validUsers.length) {
			
				return userExists;
			
			}
		
		}
	
	}
	
	visibility(fileArray, pth, showInvisible) {
	
		var finalArray;
		if ('object' !== typeof fileArray || !Array.isArray(fileArray)) {
		
			return fileArray;
		
		}
		else if (showInvisible && 'string' !== typeof pth) {
		
			return new TypeError('invalid pth passed to visibility');
		
		}
		else if (showInvisible) {
		
			finalArray = fileArray.map((x) => { return x; });
			var pFileIdx = finalArray.indexOf(UWOT_HIDDEN_PERMISSIONS_FILENAME);
			if (-1 < pFileIdx) {
			
				finalArray.splice(pFileIdx, 1);
			
			}
			if ('string' === typeof pth && pth !== this.root.path && pth !== '/' && pth !== '') {
			
				finalArray.unshift('..');
			
			}
			finalArray.unshift('.');
			return finalArray;
		
		}
		else {
		
			finalArray = [];
			for (let i = 0; i < fileArray.length; i++) {
			
				if ('string' === typeof fileArray[i] && !fileArray[i].startsWith('.')) {
				
					finalArray.push(fileArray[i]);
				
				}
				if ((i + 1) >= fileArray.length) {
				
					return finalArray;
				
				}
			
			}
		
		}
	
	}
	
	longFormatFiles(fileArray, pth) {
	
		var finalArray = [];
		if ('object' !== typeof fileArray || !Array.isArray(fileArray) || fileArray.length < 1) {
		
			return fileArray;
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('invalid pth passed to longFormatFiles');
		
		}
		// getPermissions for parent directory
		var parentPerms = this.getPermissions(pth);
		if (parentPerms instanceof Error) {
		
			return parentPerms;
		
		}
		var permLine;
		if (false === parentPerms && this.isInPub(pth)) {
		
			permLine = 'r-x';
		
		}
		else if (false === parentPerms && this.isInUser(pth)) {
		
			permLine = global.Uwot.Config.getVal('users', 'homeWritable') === true ? 'rwx' : 'r-x';
		
		}
		else if (false === parentPerms) {
		
			permLine = '---';
		
		}
		else {
		
			permLine = parentPerms.getUserPermsString();
		
		}
		var owner = 'string' === typeof parentPerms.owner ? parentPerms.owner : 'root';
		// loop through files
		for (let i = 0; i < fileArray.length; i++) {
		
			// statSync file
			var thisFilePath, thisFileStats, thisSubdirPerms;
			try {
			
				thisFilePath = path.resolve(pth, fileArray[i]);
				thisFileStats = fs.statSync(thisFilePath);
				var thisLine = '';
				// use perms and stats to build line:
				// file/dir/link, perm.allowed, stats.nlink, perm.owner, stats.size, stats.mtime, fName
				if (thisFileStats.isDirectory()) {
			
					thisLine += 'd';
					thisSubdirPerms = this.getPermissions(thisFilePath);
					if (thisSubdirPerms instanceof Error) {
					
						return thisSubdirPerms;
					
					}
					thisLine += thisSubdirPerms.getUserPermsString();
			
				}
				else if (thisFileStats.isSymbolicLink()) {
			
					thisLine += 's' + permLine;
			
				}
				else {
			
					thisLine += '-' + permLine;
			
				}
				
				var links = ' '.repeat(6 - thisFileStats.nlink.toString().length);
				links += thisFileStats.nlink + ' ' + owner;
				var size = ' '.repeat(11 - thisFileStats.size.toString().length);
				size += thisFileStats.size;
				var now = new Date();
				var mDate = new Date(thisFileStats.mtime);
				var dateLine = ' ';
				if (mDate.getFullYear() < now.getFullYear()) {
			
					dateLine += mDate.toLocaleString('en-us', {month: 'short', day: '2-digit', year: 'numeric'}).toUpperCase().replace(',', ' ');
			
				}
				else {
			
					dateLine += mDate.toLocaleString('en-us', {hourCycle: 'h24', hour12: false, month: 'short', day: '2-digit', hour: '2-digit', minute: '2-digit'}).toUpperCase().replace(',', '').replace(' AM', '').replace(' PM', '');
			
				}
				thisLine += links + size + dateLine + ' ' + fileArray[i] + EOL;
				// add to finalArray
				finalArray.push(thisLine);
			
			}
			catch (e) {
			
				console.log(e);
			
			}
			
			if ((i + 1) >= fileArray.length) {
			
				return finalArray;
			
			}
		
		}
	
	}
	
	getPathLocVars(pth, checkIfExists) {
	
		if ('boolean' !== typeof checkIfExists) {
		
			checkIfExists = true;
		
		}
		var fullPath = this.resolvePath(pth, checkIfExists);
		var pathLocVars = fullPath instanceof Error ? 
		fullPath :
		{
			fullPath,
			inRoot:		this.isInRoot(fullPath),
			inUsers:	this.isInUser(fullPath, "*"),
			isOwned:	this.isInUser(fullPath),
			inPub:		this.isInPub(fullPath)
		};
		if (!(pathLocVars instanceof Error)) {
		
			pathLocVars.inAllowed = (pathLocVars.inPub || pathLocVars.isOwned);
			pathLocVars.inVFS = pathLocVars.inRoot || pathLocVars.inPub || pathLocVars.inUsers;
			pathLocVars.sudoAllowed = pathLocVars.inRoot && this.sudo && global.Uwot.Config.getVal('users', 'sudoFullRoot');
		
		}
		return pathLocVars;
	
	}
	
	readdirRecursive(pth, fType) {
	
		if ('string' !== typeof pth) {
		
			return systemError.EINVAL({syscall: 'read'});
		
		}
		if ('string' !== typeof fType || -1 === VALID_FILE_TYPES.indexOf(fType)) {
		
			fType = null;
		
		}
		var fullPath, dirArr, pthArr = [];
		try {
		
			fullPath = this.resolvePath(pth);
			if (fullPath instanceof Error) {
			
				return fullPath;
			
			}
			var pthStats = fs.statSync(fullPath);
			fullPath = pthStats.isDirectory() ? fullPath : path.dirname(fullPath);
			dirArr = this.readDir(fullPath);
			if (dirArr instanceof Error) {
			
				return dirArr;
			
			}
		
		}
		catch(e) {
		
			return e;
		
		}
		for (const fileName of dirArr) {
		
			if ('string' !== typeof fileName) {
			
				pthArr = systemError.EINVAL({syscall: 'stat', path: fullPath + fileName});
				break;
			
			}
			else if (fileName !== UWOT_HIDDEN_PERMISSIONS_FILENAME) {
			
				var filePath = path.join(fullPath, fileName);
				var thisFileStats;
				try {
			
					thisFileStats = fs.statSync(filePath);
			
				}
				catch(e) {
			
					return e;
			
				}
				switch(fType) {
			
					case 'file':
						if (thisFileStats.isFile()) {
					
							pthArr.push(filePath);
					
						}
						break;
					case 'directory':
						if (thisFileStats.isDirectory()) {
					
							pthArr.push(filePath);
					
						}
						break;
					case 'symlink':
						if (thisFileStats.isSymbolicLink()) {
					
							pthArr.push(filePath);
					
						}
						break;
					case 'socket':
						if (thisFileStats.isSocket()) {
					
							pthArr.push(filePath);
					
						}
						break;
					case 'fifo':
						if (thisFileStats.isFIFO()) {
					
							pthArr.push(filePath);
					
						}
						break;
					default:
						pthArr.push(filePath);
			
				}
				if (thisFileStats.isDirectory()) {
			
					var subDirArray = this.readdirRecursive(filePath, fType);
					if (subDirArray instanceof Error) {
					
						return subDirArray;
					
					}
					pthArr = pthArr.concat(subDirArray);
			
				}
			
			}
		
		}
		return pthArr;
	
	}

}

module.exports = UwotFs;
