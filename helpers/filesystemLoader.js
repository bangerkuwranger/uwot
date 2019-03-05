'use strict';
const fs = require('fs');
const path = require('path');
const FileSystem = require('../filesystem');
const GUEST_UID = 'GUEST';

module.exports = {

	// loads guest filesystem
	loadGuest() {
	
		var guestCwd = global.Uwot.Config.get('server', 'pubDir');
		try {
		
			global.Uwot.FileSystems[GUEST_UID] = new FileSystem(GUEST_UID, guestCwd);
			return true;
		
		}
		catch(e) {
		
			return e;
		
		}
		
	
	},
	
	// TBD
	//loads filesystems for active session users
	loadActiveSessionFilesystems(sessionStore, callback) {
	
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to loadActiveSessionFilesystems')
		
		}
		else {
		
			sessionStore.all(function(error, activeSessions) {
		
				if (error) {
				
					return callback(error, null);
				
				}
				else if ('object' !== typeof activeSessions || !Array.isArray(activeSessions) || activeSessions.length < 1) {
				
					return callback(false, false);
				
				}
				else {
				
					var loadedSessionIds = [];
					for (let i = 0; i < activeSessions.length; i++) {
					
						var sessionObj = activeSessions[i];
// 	global.Uwot.Constants.tryParseJSON(activeSessions[0].passport.user)._id
						if ('object' === typeof sessionObj && null !== sessionObj && 'object' === typeof sessionObj.passport && null !== sessionObj.passport && 'string' === typeof sessionObj.passport.user) {
						
							var userObj = global.Uwot.Constants.tryParseJSON(sessionObj.passport.user);
							if (userObj && 'string' === typeof userObj._id) {
							
								try {
		
									global.Uwot.FileSystems[userObj._id] = new FileSystem(userObj._id);
									loadedSessionIds.push(userObj._id);
		
								}
								catch(e) {
		
									return callback(e, loadedSessionIds);
		
								}
								
							}
						
						}
						if ((i + 1) >= activeSessions.length) {
						
							return callback(false, loadedSessionIds);
						
						}
					
					}
				
				}
		
			});
		
		}
	
	},
	
	// if userId is not passed, returns array of loaded filesystem userIds.
	// if userId is provided, compares against list of userIds and returns
	// true if userId filesystem is loaded,
	// false if not or if userId is not a string.
	isValidFs(userId) {
	
		if ('undefined' === typeof userId || null === userId || '' === userId) {
		
			return Object.keys(global.Uwot.FileSystems);
		
		}
		else if ('string' !== typeof userId) {
		
			return false;
		
		}
		else {
		
			var loadedFsArray = Object.keys(global.Uwot.FileSystems);
			return loadedFsArray.indexOf(userId.trim()) !== -1;
		
		}
	
	}

};
