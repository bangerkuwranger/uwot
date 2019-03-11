'use strict';
const fs = require('fs');
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
	'touch'
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
			
// 				this.allowed = permissions.allowed;
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
// 					if (this.isValidUserName(thisName)) {
				
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
					
						}
						this[thisName] = userPerms;
				
// 					}
	
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
		if('UwotFsPermissions' !== otherPerms.constructor.name) {
		
			try {
			
				otherPermsClassObj = new UwotFsPermissions(otherPerms);
				newArg = Object.assign(otherPermsClassObj.toGeneric(), this.toGeneric());
				if ('undefined' === typeof thisOwner || null === thisOwner) {
				
					newArg.owner = otherOwner;
				
				}
				if ('undefined' === typeof thisAllowed || null === thisAllowed) {
				
					newArg.allowed = otherAllowed;
				
				}
				return new UwotFsPermissions(newArg);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			newArg = Object.assign(otherPerms.toGeneric(), this.toGeneric());
			if ('undefined' === typeof thisOwner || null === thisOwner) {
			
				newArg.owner = otherOwner;
			
			}
			if ('undefined' === typeof thisAllowed || null === thisAllowed) {
			
				newArg.allowed = otherAllowed;
			
			}
			return new UwotFsPermissions(newArg);
		
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
						result = this.readDir(this.cwd);
						// need to parse flags to format output...
						// only supporting -l and -a
						// need to parse args in case a path is provided
						break;
					case 'pwd':
						result = this.getVcwd();
						break;
					case 'mkdir':
						// will support -p (recursive path dir creation)
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
						result = this.moveFile(...argArr);
						break;
					case 'cp':
						//need to parse flags from argArr prior to calls...
						// should support -n, -R
						result = this.copy(...argArr);
						break;
					case 'stat':
						//need to parse flags from argArr prior to call...
						//should support -f and -F
						result = this.stat(...argArr);
						// and format result after
						break;
					case 'touch':
						result = this.append(...argArr, '');
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
	
	copy(source, target) {
		
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
		
			try {
			
				fs.copyFileSync(path.join(fullPathSource, fileNameSource), path.join(fullPathTarget, fileNameTarget));
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (!canRead) {
		
			return systemError.EACCES({'path': source, 'syscall': 'open'});
		
		}
		else {
		
			return systemError.EACCES({'path': target, 'syscall': 'write'}); 
		
		}
	
	}
	
	createDir(pth) {
	
		var fullPath;
		var dirName = path.basename(pth);
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
			
				return fs.readFileSync(path.join(fullPath, fileName));
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'read'});
		
		}
	
	}
	
	moveFile(source, target) {
	
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
	
	stat(pth) {
	
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
		var fullPath = this.resolvePath(pth);
		var inUsers = this.isInUser(fullPath, "*");
		var inAllowed = (this.isInPub(fullPath) || this.isInUser(fullPath));
		var inRoot = this.isInRoot(fullPath);
		if (!inRoot && !inAllowed && !inUsers) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		else if ((inRoot || inUsers) && !inAllowed) {
		
			vfsReadable = (this.sudo && global.Uwot.Config.getVal('users', 'sudoFullRoot'));
		
		}
		else if (this.isInUser(fullPath)) {
		
			vfsReadable = true;
		
		}
		else if (this.isInPub(fullPath)) {
		
			var permissions = this.getPermissions(fullPath);
			if (permissions instanceof Error) {
			
				return permissions;
			
			}	
			else if (permissions && 'object' === typeof permissions) {
				
				if ('string' === typeof permissions.owner && this.user['uName'] === permissions.owner) { 
				
					vfsReadable = true;
				
				}
				else if ('object' === typeof permissions[this.user['uName']] && Array.isArray(permissions[this.user['uName']]) && -1 !== permissions[this.user['uName']].indexOf('r')) {
				
					vfsReadable = true;
				
				}
			
			}
			else {
			
				//permissions not set defaults to readable in pubDir
				vfsReadable = true;
			
			}
		
		}
		if (vfsReadable) {
		
			try {
			
				fs.accessSync(fullPath, fs.constants.R_OK);
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
		var fullPath = this.resolvePath(pth);
		var inUsers = this.isInUser(fullPath, "*");
		var inPub = this.isInPub(fullPath);
		var inHome = this.isInUser(fullPath);
		var inRoot = this.isInRoot(fullPath);
		if (!inRoot && !inPub && !inUsers) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		else if (inHome && global.Uwot.Config.getVal('users', 'homeWritable') && global.Uwot.Config.getVal('users', 'createHome')) {
		
			vfsWritable = true;
		
		}
		else if (inPub) {

			var permissions = this.getPermissions(fullPath);
			if (permissions instanceof Error) {
			
				return permissions;
			
			}	
			else if (permissions && 'object' === typeof permissions) {
				
				if ('string' === typeof permissions.owner && this.user['uName'] === permissions.owner) { 
				
					vfsWritable = true;
				
				}
				else if ('object' === typeof permissions[this.user['uName']] && Array.isArray(permissions[this.user['uName']]) && -1 !== permissions[this.user['uName']].indexOf('w')) {
				
					vfsWritable = true;
				
				}
			
			}
		
		}
		else if (inRoot && this.sudo && global.Uwot.Config.getVal('users', 'sudoFullRoot')) {
		
			vfsWritable = true;
		
		}
		if (vfsWritable) {
		
			try {
			
				fs.accessSync(fullPath, fs.constants.W_OK);
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
	
		var fullPath = this.resolvePath(pth);
		var inRoot = this.isInRoot(fullPath);
		var inUsers = this.isInUser(fullPath, "*");
		var inAllowed = (this.isInPub(fullPath) || this.isInUser(fullPath));
		if (!inRoot && !inUsers && !inAllowed) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		else if (inRoot && !inAllowed && !(this.sudo && (global.Uwot.Config.getVal('users', 'sudoFullRoot')))) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE});
		
		}
		var pthStats, permFile, permissions;
		try {
		
			pthStats = fs.statSync(fullPath);
		
		}
		catch (e) {
		
			return e;
		
		}
		if (pthStats.isDirectory()) {
			
			try{
		
				permFile = fs.readFileSync(path.resolve(fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME));
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
		
			var thisDir = path.dirname(fullPath);
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
		var fullPath = this.resolvePath(pth);
		var inRoot = this.isInRoot(fullPath);
		var inUsers = this.isInUser(fullPath, "*");
		var isOwned = this.isInUser(fullPath);
		var inAllowed = (this.isInPub(fullPath) || isOwned);
		if (!inRoot && !inUsers && !inAllowed) {
		
			return systemError.ENOENT({path: pth, syscall: 'chmod'});
		
		}
		var currentPermissions = this.getPermissions(fullPath);
		if (currentPermissions instanceof Error || !currentPermissions) {
		
			currentPermissions = new UwotFsPermissions(null);
		
		}
		var newPermissions = new UwotFsPermissions(permissions);
		if (currentPermissions.allowed !== DEFAULT_ALLOWED && ('object' !== typeof newPermissions.allowed || null === newPermissions.allowed || !Array.isArray(newPermissions.allowed))) {
		
			newPermissions.allowed = currentPermissions.allowed;
		
		}
		if (isOwned && DEFAULT_OWNER === currentPermissions.owner && 'string' !== newPermissions.owner) {
		
			newPermissions.owner = this.user['uName'];
		
		}
		var updatedPermissions = JSON.stringify(newPermissions.concatPerms(currentPermissions.toGeneric()).toGeneric());
		var permPath;
		try {
		
			var pthStats = fs.statSync(fullPath);
			if (pthStats.isDirectory()) {
			
				permPath = path.resolve(fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
			else {
			
				permPath = path.resolve(path.dirname(fullPath), UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
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
	
	changeAllowed(pth, allowed) {
	
		if (!this.sudo || 'string' !== typeof pth) {
		
			return systemError.EPERM({path: pth, syscall: 'chmod'});
		
		}
		else if ('object' !== typeof allowed || null === allowed || !Array.isArray(allowed)) {
		
			return new TypeError('invalid allowed');
		
		}
		var fullPath = this.resolvePath(pth);
		var inRoot = this.isInRoot(fullPath);
		var inUsers = this.isInUser(fullPath, "*");
		var isOwned = this.isInUser(fullPath);
		var inAllowed = (this.isInPub(fullPath) || isOwned);
		if (!inRoot && !inUsers && !inAllowed) {
		
			return systemError.ENOENT({path: pth, syscall: 'chmod'});
		
		}
		var currentPermissions = this.getPermissions(fullPath);
		if (currentPermissions instanceof Error || !currentPermissions) {
		
			currentPermissions = new UwotFsPermissions(null);
		
		}
		var currentPermissionsGeneric = currentPermissions.toGeneric();
		currentPermissionsGeneric.allowed = allowed;
		var newPermissions;
		try {
		
			newPermissions = new UwotFsPermissions(currentPermissionsGeneric);
		
		}
		catch(e) {
		
			return e;
		
		}
		var permPath;
		try {
		
			var pthStats = fs.statSync(fullPath);
			if (pthStats.isDirectory()) {
			
				permPath = path.resolve(fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
			else {
			
				permPath = path.resolve(path.dirname(fullPath), UWOT_HIDDEN_PERMISSIONS_FILENAME);
			
			}
		
		}
		catch(e) {
		
			return e;
		
		}
		var updatedPermissions = newPermissions.toJSON();
		try {
		
			fs.writeFileSync(permPath, updatedPermissions);
			return true;
		
		}
		catch(e) {
		
			return e;
		
		}
		
	
	}
	
	changeOwner(pth, userName) {
	
		if (!this.sudo) {
		
			return systemError.EPERM({path: pth, syscall: 'chown'});
		
		}
		else if ('string' !== typeof userName) {
		
			return new TypeError('invalid user');
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('invalid path');
		
		}
		else if (!this.isValidUserName(userName)) {
			
			return new Error(userName + ': illegal user name');
			
		}
		else {
		
			var fullPath = this.resolvePath(pth);
			var inRoot = this.isInRoot(fullPath);
			var inUsers = this.isInUser(fullPath, "*");
			var isOwned = this.isInUser(fullPath);
			var inAllowed = (this.isInPub(fullPath) || isOwned);
			if (!inRoot && !inUsers && !inAllowed) {
			
				return systemError.ENOENT({path: pth, syscall: 'chown'});
			
			}
			var currentPermissions = this.getPermissions(fullPath);
			if (currentPermissions instanceof Error) {
			
				currentPermissions = new UwotFsPermissions(null);
			
			}
			var newPermissions = new UwotFsPermissions({owner: userName});
			if (currentPermissions.allowed !== DEFAULT_ALLOWED) {
			
				newPermissions.allowed = currentPermissions.allowed;
			
			}
			var updatedPermissions = newPermissions.concatPerms(currentPermissions.toGeneric()).toJSON();
			var permPath;
			try {
			
				var pthStats = fs.statSync(fullPath);
				if (pthStats.isDirectory()) {
				
					permPath = path.resolve(fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
				}
				else {
				
					permPath = path.resolve(path.dirname(fullPath), UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
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

}

module.exports = UwotFs;
