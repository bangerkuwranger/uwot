'use strict';
const fs = require('fs');
const path = require('path');
const pathIsInside = require('path-is-inside');
const systemError = require('./helpers/systemError'');
const Users = require('./users');
var userInterface = new Users();

const UWOT_HIDDEN_PERMISSIONS_FILENAME = '.uwotprm';

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
			else if (this.isReadable(absPth)) {
			
				this.cwd = absPth.replace(this.root.path, '');
				return true;
			
			}
			else {
			
				return false;
		
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
		
		if (this.isReadable(source) && this.isWritable(target)) {
		
			try {
			
				fs.copyFileSync(source, target);
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
	
		if (this.isReadable(pth)) {
		
			try {
			
				return fs.readdirSync(pth);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	readFile(pth) {
	
		if (this.isReadable(pth)) {
		
			try {
			
				return fs.readfileSync(pth);
			
			}
			catch(e) {
			
				return e;
			
			}
		
		}
		else {
		
			return false;
		
		}
	
	}
	
	moveFile(pth, newPath) {
	
		if (this.isReadable(pth) && this.isWritable(newPath)) {
		
			try {
			
				fs.renameSync(pth, newPath);
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
	
		if (this.isReadable(pth)) {	
			
			try {
		
				var stats = fs.statSync(pth);
				return stats;
		
			}
			catch(e) {
		
				return e;
		
			}
		
		}
		else {
		
			return false;
		
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
	
	isInUser(pth) {
	
		if (null === this.userDir || !this.userDir.exists()) {
		
			return false;
		
		}
		else if ('string' !== typeof pth) {
		
			return new TypeError('path passed to isInUser must be a string');
		
		}
		else {
		
			var fullPath = path.resolve(this.tildeExpand(pth));
			return pathIsInside(fullPath, this.userDir.path);
		
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
	
	// TBD
	isReadable(pth) {
	
		if ('string' !== typeof pth) {
		
			return false;
		
		}
		else if (path.basename(pth) === '.uwotprm') {
		
			return false;
		
		}
		if (!this.isInRoot(pth) && !this.isInPub(pth) && !this.isInUser(pth)) {
		
			return false;
		
		}
		
		return true;
	
	}
	
	// TBD
	isWritable(pth) {
	
		return false;
	
	}
	

}

module.exports = UwotFs;
