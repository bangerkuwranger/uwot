'use strict';
const fs = require('fs');
const path = require('path');
const Users = require('./users');
var userInterface = new Users();

class UwotFs {

	constructor(userId, cwd) {
	
		if ('string' === cwd) {
		
			this.cwd = cwd;
		
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
	
	}
	
	setDirs() {
	
		this.root = {
			path = path.resolve(global.appRoot, 'fs'),
			r: true,
			w: false,
			x: false,
			exists = function () { fs.existsSync(this.root.path) };
		};
		this.pubDir = {
			path: global.UwotConfig.get('server', 'pubDir'),
			r: true,
			w: false,
			x: false,
			exists = function () { fs.existsSync(this.pubDir.path) };
		};
		this.userDir = this.user.uName === 'guest' ? null : {
			path: path.resolve(global.UwotConfig.get('server', 'userDir'), user.uName),
			r: true,
			w: global.UwotConfig.get('server', 'homeWritable'),
			x: false,
			exists = function () { fs.existsSync(this.userDir.path) };
		};
		if ('string' !== this.cwd) {
		
			this.cwd = null !== this.userDir ? this.userDir.path : this.pubDir.path;
		
		}
	
	}
	
	isInUser(path) {
	
	
	
	}
	
	isInPub(path) {
	
	
	
	}
	
	tildeExpand(path) {
	
		if (this.userDir === null) {
		
			return path;
		
		}
		else {
		
			if (path.startsWith('~')) {
			
				return path.replace('~', this.userDir.path + '/');
			
			}
			return path;
		}	
	
	}
	
	

}

module.exports = UwotFs;
