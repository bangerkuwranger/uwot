'use strict';
const fs = require('fs');
const path = require('path');
const pathIsInside = require('path-is-inside');
const systemError = require('./helpers/systemError');
const sanitize = require('./helpers/valueConversion');
const Users = require('./users');
var userInterface = new Users();

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


class UwotFsPermissions {

	constructor(permissions) {
	
		if ('object' !== typeof permissions) {
		
			throw new TypeError('argument of UwotFsPermissions constructor must be an object');
		
		}
		else if (null !== permissions) {
		
			if ('string' == typeof permissions.owner) {
			
				this.owner = sanitize.cleanString(permissions.owner);
				delete permissions.owner;
			
			}
			if ('object' == typeof permissions.allowed && Array.isArray(permissions.allowed)) {
			
				this.allowed = permissions.allowed;
				delete permissions.allowed;
			
			}
			else {
			
				this.allowed = DEFAULT_ALLOWED;
			
			}
			var permUsers = Object.keys(permissions);
			if (0 < permUsers.length) {
			
				userInterface.listUsers(function(error, userList) {
			
					for (let i = 0; i < permUsers.length; i++) {
			
						var thisId = userList[i];
						if (-1 !== permUsers.indexOf(thisId) && permissions.hasOwnProperty(thisId)) {
						
							let userPerms = [];
							if ('object' == typeof permissions[thisId] && Array.isArray(permissions[thisId])) {
							
								if (-1 !== permissions[thisId].indexOf('r')) {
								
									userPerms.push('r');
								
								}
								if (-1 !== permissions[thisId].indexOf('w')) {
								
									userPerms.push('w');
								
								}
								if (-1 !== permissions[thisId].indexOf('x')) {
								
									userPerms.push('x');
								
								}
							
							}
							this.thisId = userPerms;
						
						}
			
					}
		
				}.bind(this));
			
			}
		
		}
	
	}
	
	toGeneric() {
	
		var genericPermissionsObj = {
			owner: 'string' == typeof this.owner ? this.owner : DEFAULT_OWNER,
			allowed: this.allowed
		}
		var permUsers = Object.keys(this);
		for (let i = 0; i < permUsers.length; i++) {
		
			if (this.hasOwnProperty(permUsers[i]) && 'owner' !== permUsers[i] && 'allowed' !== permUsers[i] && 'object' == typeof this[permUsers[i]] && Array.isArray(this[permUsers[i]])) {
			
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
	
		if ('object' !== typeof otherPerms) {
		
			throw new TypeError('argument passed to concatPerms must be an object');
		
		}
		else {
		
			var newArg = Object.assign(otherPerms, this);
			return new UwotFsPermissions(newArg);
		
		}
	
	}

};

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
	
		if ('string' === cwd) {
		
			// distinct from process.cwd; this is 'virtual' fs cwd
// 			this.cwd = cwd;
			this.changeCwd(cwd);
		
		}
		if ('string' !== typeof userId) {
		
			userInterface.getGuest(function(error, user) {
			
				if (error) {
				
					throw error;
				
				}
				else {
				
					this.user = user;
					this.setDirs();
					return;
				
				}
			
			}.bind(this));
		
		}
		else {
		
			userInterface.findById(userId, function(error, user) {
			
				if (error) {
				
					throw error;
				
				}
				else if (!user) {
				
					userInterface.getGuest(function(error, user) {
			
						if (error) {
				
							throw error;
				
						}
						else {
				
							this.user = user;
							this.setDirs();
					return;
				
						}
			
					}.bind(this));
				
				}
				else {
				
					this.user = user;
					this.setDirs();
					return;
				
				}
			
			}.bind(this));
		
		}
		this.sudo = false;
	
	}
	
	setDirs() {
	
		this.root = {
			path: path.resolve(global.appRoot, 'fs'),
			r: true,
			w: false,
			x: false,
			exists: function () { fs.existsSync(this.root.path) }
		};
		this.pubDir = {
			path: global.UwotConfig.get('server', 'pubDir'),
			r: true,
			w: false,
			x: false,
			exists: function () { fs.existsSync(this.pubDir.path) }
		};
		this.userDir = this.user.uName === 'guest' ? null : {
			path: path.resolve(global.UwotConfig.get('server', 'userDir'), user.uName),
			r: true,
			w: global.UwotConfig.get('server', 'homeWritable'),
			x: false,
			exists: function () { fs.existsSync(this.userDir.path) }
		};
		if ('string' !== this.cwd) {
		
			var defaultcwd = null !== this.userDir ? this.userDir.path : this.pubDir.path;
			this.changeCwd(defaultcwd);
		
		}
	
	}
	
	// TBD
	//async wrapper for fs commands.
	cmd(cmdName, argArr, callback, isSudo) {
	
		//check against valid
		//set this.sudo (checking if user is allowed)
		//perform matching command, expanding argArr
		//set this.sudo = false
		//handle sync and system errors
		//return result or error
	
	}
	
	// TBD
	changeCwd(pth) {
	
		//check is string
		if ('string' !== typeof pth) {
		
			return new TypeError('path must be a string');
		
		}
		else {
			
			//resolve
			var absPth = this.resolvePath(pth);
			//return error objects
			if('string' !== typeof absPth) {
			
				return absPth;
			
			}
			//check isReadable
			var canRead = this.isReadable(absPth);
			if (canRead instanceof Error) {
			
				return canRead;
			
			}
			else if (canRead) {
			
				this.cwd = absPth.replace(this.root.path, '');
				return true;
			
			}
			else {
			
				return systemError.EACCES({'path': pth, 'syscall': 'chdir'});
		
			}
		
		}
	
	}
	
	// this.cwd is relative path to this.root.path
	getVcwd() {
	
		return 'string' == typeof this.cwd ? this.cwd : path.sep;
	
	}
	
	// returns absolute path of this.cwd
	getCwd() {
	
		return 'string' == typeof this.cwd ? path.resolve(this.root.path, this.cwd) : this.root.path;
	
	}
	
	append(pth, data) {
	
		if (this.isWritable(pth)) {
		
			try {
			
				fs.appendFileSync(pth, data);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	copy(source, target) {
		
		var canRead = this.isReadable(source);
		var canWrite = this.isWritable(target);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead && canWrite) {
		
			try {
			
				fs.copyFileSync(source, target);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (!canRead){
		
			return systemError.EACCES({'path': source, 'syscall': 'open'});
		
		}
		else {
		
			return systemError.EACCES({'path': target, 'syscall': 'write'}); 
		
		}
	
	}
	
	createDir(pth) {
	
		if (this.isWritable(pth)) {
		
			try {
			
				fs.mkdirSync(pth);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	readDir(pth) {
	
		var canRead = this.isReadable(pth);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {
		
			try {
			
				return fs.readdirSync(pth);
			
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
	
		var canRead = this.isReadable(pth);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {
		
			try {
			
				return fs.readFileSync(pth);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.EACCES({'path': pth, 'syscall': 'read'});
		
		}
	
	}
	
	moveFile(pth, newPath) {
	
		var canRead = this.isReadable(pth);
		var canWrite = this.isWritable(pth);
		var canWriteNew = this.isWritable(newPath);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead && canWrite && canWriteNew) {
		
			try {
			
				fs.renameSync(pth, newPath);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (!canRead) {
		
			return systemError.EACCES({'path': pth, 'syscall': 'read'});
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	removeDir(pth) {
	
		if (this.isWritable(pth)) {
		
			try {
			
				fs.rmdirSync(pth);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	removeFile(pth) {
	
		if (this.isWritable(pth)) {
		
			try {
			
				fs.unlinkSync(pth);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	stat(pth) {
	
		var canRead = this.isReadable(pth);
		if (canRead instanceof Error) {
		
			return canRead;
		
		}
		else if (canRead) {	
			
			try {
		
				var stats = fs.statSync(pth);
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
	
		if (this.isWritable(pth)) {
		
			try {
			
				fs.writeFileSync(pth, data);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	isInUser(pth, userId) {
	
		if (null === this.userDir || !this.userDir.exists()) {
		
			return false;
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInUser must be a string');
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			if ('string' !== typeof userId) {
			
				return pathIsInside(fullPath, global.UwotConfig.get('server', 'userDir'))
			
			}
			else if (userId === this.user['_id']) {
			
				return pathIsInside(fullPath, this.userDir.path);
		
			}
			else {
			
				return pathIsInside(fullPath, path.resolve(global.UwotConfig.get('server', 'userDir'), userId));
			
			}
		
		}
	
	}
	
	isInPub(pth) {
	
		if (null === this.pubDir || !this.pubDir.exists()) {
		
			return false;
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInPub must be a string');
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			return pathIsInside(fullPath, this.pubDir.path);
		
		}
	
	}
	
	isInRoot(pth) {
	
		if (null === this.root || !this.root.exists()) {
		
			return false;
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInRoot must be a string');
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			return pathIsInside(fullPath, this.root.path);
		
		}
	
	}
	
	
	tildeExpand(pth) {
	
		if (this.userDir === null) {
		
			return pth;
		
		}
		else {
		
			if (pth.startsWith('~')) {
			
				return path.resolve(pth.replace('~', this.userDir.path + path.sep));
			
			}
			return pth;
		}	
	
	}
	
	// resolves path w/ expansion, using this.cwd
	resolvePath(pth) {
	
		if ('string' != typeof pth) {
		
			return new TypeError('path passed to resolvePath must be a string');
		
		}
		else if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
		
			return systemError.ENOENT({syscall: 'stat', path: pth});
		
		}
		if (pth.startsWith('~')) {
		
			pth = this.tildeExpand(pth);
		
		}
		if (path.isAbsolute(pth)) {
		
			pth = pth.replace(path.sep, '');
		
		}
		var fromCwd = path.resolve(this.cwd, pth);
		try {
		
			var fromCwdStats = fs.statSync(fromCwd);
			return fromCwd;
		
		}
		catch(e) {
		
			var fromRoot = path.resolve(this.root.path, pth);
			try {
			
				var fromRootStats = fs.statSync(fromRoot);
				return fromRoot;
			
			}
			catch(err) {
			
				return err;
			
			}
		
		}
	
	}
	
	isReadable(pth) {
	
		var vfsReadable = false;
		if ('string' !== typeof pth) {
		
			return false;
		
		}
		else if (path.basename(pth) === UWOT_HIDDEN_PERMISSIONS_FILENAME) {
		
			return systemError.ENOENT({'path': pth, 'syscall': 'stat'});
		
		}
		var fullPath = this.resolvePath(pth);
		var inUsers = this.isInUser(fullPath);
		var inAllowed = (this.isInPub(fullPath) || this.isInUser(fullPath, this.user['_id']));
		var inRoot = this.isInRoot(fullPath);
		if (!inRoot && !inAllowed && !inUsers) {
		
			return false;
		
		}
		else if ((inRoot || inUsers) && !inAllowed) {
		
			vfsReadable = (this.sudo && global.UwotConfig.get('users', 'sudoFullRoot'));
		
		}
		else if (this.sudo) {
		
			vfsReadable = true;
		
		}
		else if (this.isInPub(fullPath)) {
		
			var permissions = this.getPermissions(fullPath);
			if (permissions instanceof Error) {
			
				return permissions;
			
			}	
			else if (permissions && 'object' == typeof permissions) {
				
				if ('string' == typeof permissions.owner && this.user['_id'] === permissions.owner) { 
				
					vfsReadable = true;
				
				}
				else if ('object' == typeof permissions[this.user['_id']] && 'boolean' == typeof permissions[this.user['_id']].r && permissions[this.user['_id']].r) {
				
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
		return false;
	
	}
	
	// TBD
	isWritable(pth) {
	
		return false;
	
	}
	
	getPermissions(pth) {
	
		var fullPath = this.resolvePath(pth);
		var inRoot = this.isInRoot(fullPath);
		var inUsers = this.isInUser(fullPath);
		var inAllowed = (this.isInPub(fullPath) || this.isInUser(fullPath, this.user['_id']));
		if (!inRoot && !inUsers && !inAllowed) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE}).toGeneric();
		
		}
		else if (!inAllowed && !(this.sudo || (global.UwotConfig.get('users', 'sudoFullRoot')))) {
		
			return new UwotFsPermissions({'owner': DEFAULT_OWNER, 'allowed': ALLOWED_NONE}).toGeneric();
		
		}
		try {
		
			var pthStats = fs.statSync(fullPath);
		
		}
		catch (e) {
		
			return e;
		
		}
		if (pthStats.isDirectory()) {
			
			try{
		
				var permFile = fs.readFileSync(path.resolve(fullPath, UWOT_HIDDEN_PERMISSIONS_FILENAME));
				var permissions = global.tryParseJSON(permFile);
				if ('object' == typeof permissions) {
			
					return new UwotFsPermissions(permissions).toGeneric();
			
				}
				else {
				
					return false;
				
				}
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else if (pthStats.isFile()) {
		
			var thisDir = path.dirname(fullPath);
			try{
		
				var permFile = fs.readFileSync(path.resolve(thisDir, UWOT_HIDDEN_PERMISSIONS_FILENAME));
				var permissions = global.tryParseJSON(permFile);
				if ('object' == typeof permissions) {
			
					return new UwotFsPermissions(permissions).toGeneric();
			
				}
				else {
				
					return false;
				
				}
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return systemError.ENOENT({path: pth, syscall: 'stat'});
		
		}
	
	}
	
	setPermissions(pth, userId, permissions) {
	
		if (!this.sudo) {
		
			return systemError.EPERM({path: pth, syscall: 'chmod'});
		
		}
		else if ('string' !== userId || 'object' !== typeof permissions) {
		
			return new TypeError('invalid user or permissions');
		
		}
		userInterface.listUsers(function(error, userList){
		
			var userExists = false;
			if (error) {
			
				return systemError.UNKOWN({path: pth, syscall: 'chmod'});
			
			}
			else if (userId !== this.user['_id']) {
			
				userExists = false;
				for (let i = 0; i < userList.length; i++) {
				
					if (userId === userList[i]['_id']) {
					
						userExists = true;
						i = userList.length;
					
					}
				
				}
			
			}
			else {
			
				userExists = true;
			
			}
			if (!userExists) {
			
				return new Error(userId + ': illegal user name');
			
			}
			var fullPath = this.resolvePath(pth);
			var inRoot = this.isInRoot(fullPath);
			var inUsers = this.isInUser(fullPath);
			var isOwned = this.isInUser(fullPath, this.user['_id']);
			var inAllowed = (this.isInPub(fullPath) || this.isOwned);
			if (!inRoot && !inUsers && !inAllowed) {
			
				return systemError.ENOENT({path: pth, syscall: 'chmod'});
			
			}
			var currentPermissions = this.getPermissions(fullPath);
			if (currentPermissions instanceof Error) {
			
				currentPermissions = new UwotFsPermissions(null);
			
			}
			var newPermissions = new UwotFsPermissions(permissions);
			if (currentPermissions.allowed !== DEFAULT_ALLOWED) {
			
				newPermissions.allowed = currentPermissions.allowed;
			
			}
			if (isOwned && DEFAULT_OWNER === currentPermissions.owner) {
			
				newPermissions.owner = this.user['_id'];
			
			}
			var updatedPermissions = newPermissions.concatPerms(currentPermissions);
			try {
			
				var pthStats = fs.statSync(fullPath);
				var permPath;
				if (pthStats.isDirectory()) {
				
					permPath = path.resolve(fullpath, UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
				}
				else {
				
					permPath = path.resolve(path.dirname(fullpath), UWOT_HIDDEN_PERMISSIONS_FILENAME);
				
				}
			
			}
			catch(e) {
			
				return e;
			
			}
			try {
			
				fs.writeFileSync(fullPath, updatedPermissions);
				return true;
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}.bind(this));
	
	}
	
	// TBD
	changeOwner(pth, user) {
	
	
	
	}

}

module.exports = UwotFs;
