'use strict';
var Datastore = require('nedb-core');
var uid = require('uid-safe');
var sanitize = require('./helpers/valueConversion');

/**
 * String	_id
 * Date		createdAt
 * Date		expiresAt
 * Number	expires
 */
 
class InstanceSession {

	constructor(
		_id,
		expiry,
		createdAt,
		expiresAt
	) {
	
		var cleanId = sanitize.cleanString(_id, null);
		if (null !== cleanId) {
		
			this._id = cleanId;
		
		}
		else {
		
			this._id = uid.sync(18);
		
		}
		this.createdAt = ('string' === typeof createdAt || ('object' === typeof createdAt && createdAt instanceof Date)) ? sanitize.cleanDate(createdAt) : new Date();
		var cleanExpiry = sanitize.cleanInt(expiry);
		var cleanExpireDate = ('string' === typeof expiresAt || ('object' === typeof expiresAt && expiresAt instanceof Date)) ? sanitize.cleanDate(expiresAt) : null;
		var expireMs = cleanExpiry <= 0 ? global.Uwot.Config.getVal('users', 'instanceSessionExpiry') : cleanExpiry;
		this.expiresAt = null !== cleanExpireDate ? cleanExpireDate : new Date(this.createdAt.getTime() + expireMs);
	
	}
	
	validate() {
	
		var now = new Date();
		if ('object' !== typeof this.expiresAt || !(this.expiresAt instanceof Date)) {
		
			return false;
		
		}
		else {
		
			return this.expiresAt > now;
		
		}
	
	}
	
	renew(expiryExtension) {
	
		var cleanExpiry = sanitize.cleanInt(expiryExtension);
		var expireMs = cleanExpiry <= 0 ? global.Uwot.Config.getVal('users', 'instanceSessionExpiry') : cleanExpiry;
		this.expiresAt = new Date(this.expiresAt.getTime() + expireMs);
	
	}
	
	toDB() {
	
		return {
			"_id":			this._id,
			"createdAt":	this.createdAt,
			"expiresAt":	this.expiresAt
		};
	
	}

}

module.exports = class UwotInstanceSessions {

	constructor() {
	
		this.db = new Datastore({ filename: 'var/nedb/instanceSessions.db', autoload: true, timestampData: true });

	}
	
	createNew(expiryMs, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to createNew.');
		
		}
		else {
		
			self.cnCallback = callback;
			if ('number' === typeof expiryMs || 'string' === typeof expiryMs) {
			
				expiryMs = sanitize.cleanInt(expiryMs, null);
			
			}
			else {
			
				expiryMs = null;
			
			}
				
			var newSession = new InstanceSession(
				null,
				expiryMs
			);
			self.db.insert(newSession.toDB(), function(error, data) {
			
				if (error) {
		
					return self.cnCallback(error, null);
		
				}
				else if ('object' !== typeof data || null === data || 'string' !== typeof data._id) {
		
					return self.cnCallback(false, false);
		
				}
				else {
		
					try {
					
						var savedSession = new InstanceSession(
							data._id,
							0,
							data.createdAt,
							data.expiresAt
						);
						return self.cnCallback(false, savedSession);
					
					}
					catch(e) {
					
						return self.cnCallback(e, null);
					
					}
				
				}
	
			});
			
		}
	
	}
	
	remove(sessionId, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to remove.');
		
		}
		else if ('string' !== typeof sessionId || '' === sessionId) {
		
			return callback(new TypeError('invalid session id passed to remove.'), null);
		
		}
		else {
		
			self.rCallback = callback;
			this.db.remove({_id: sessionId}, {}, function(error, data) {
			
				if (error) {
				
					return self.rCallback(error, null);
				
				}
				else if (data === 0) {
				
					return self.rCallback(false, false);
				
				}
				else {
				
					return self.rCallback(false, true);
				
				}
			
			});
		
		}
	
	}
	
	validate(sessionId, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to validate.');
		
		}
		else if ('string' !== typeof sessionId || '' === sessionId) {
		
			return callback(new TypeError('invalid sessionId passed to validate.'), null);
		
		}
		else {
		
			self.vCallback = callback;
			this.db.find({_id: sessionId}, {}, function(error, data) {
			
				if (error) {
				
					return self.vCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' !== typeof data[0]) {
				
					return self.vCallback(false, false);
				
				}
				else {
				
					var checkSession = new InstanceSession(
						data[0]._id,
						null,
						data[0].createdAt,
						data[0].expiresAt
					);
					return self.vCallback(false, checkSession.validate());
				
				}
			
			});
		
		}
	
	}
	
	invalidate(sessionId, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to invalidate.');
		
		}
		else if ('string' !== typeof sessionId || '' === sessionId) {
		
			return callback(new TypeError('invalid sessionId passed to invalidate.'), null);
		
		}
		else {
		
			self.ivCallback = callback;
			this.db.update({_id: sessionId}, {$set: {expiresAt: new Date()}}, {}, function(error, updatedCount) {
			
				if (error) {
				
					return self.ivCallback(error, null);
				
				}
				else if (updatedCount < 1) {
				
					return self.ivCallback(false, false);
				
				}
				else {
				
					return self.ivCallback(false, sessionId);
				
				}
			
			});
		
		}
	
	}
	
	renew(sessionId, expiryExtensionMs, callback) {
	
		var self = this;
		if ('function' !== typeof callback) {
		
			throw new TypeError('invalid callback passed to renew.');
		
		}
		else if ('string' !== typeof sessionId || '' === sessionId) {
		
			return callback(new TypeError('invalid sessionId passed to renew.'), null);
		
		}
		else {
		
			self.rnCallback = callback;
			if (!expiryExtensionMs) {
			
				expiryExtensionMs = 0;
			
			}
			this.db.find({_id: sessionId}, {}, function(error, data) {
			
				if (error) {
				
					return self.rnCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' !== typeof data[0]) {
				
					return self.rnCallback(false, false);
				
				}
				else {
				
					var renewSession = new InstanceSession(
						data[0]._id,
						null,
						data[0].createdAt,
						data[0].expiresAt
					);
					renewSession.renew(expiryExtensionMs);
					self.db.update({_id: sessionId}, {$set: {expiresAt: renewSession.expiresAt}}, {}, function(error, updatedCount) {
			
						if (error) {
				
							return self.rnCallback(error, null);
				
						}
						else if (updatedCount < 1) {
				
							return self.rnCallback(false, false);
				
						}
						else {
				
							return self.rnCallback(false, sessionId);
				
						}
			
					});
				
				}
			
			});
		
		}
	
	}

};
