'use strict';
var Datastore = require('nedb-core');
var bcrypt = require('bcryptjs');
var sanitize = require('./helpers/valueConversion');
var rules = require('password-rules');

/**
 * Number	_id
 * String	fName
 * String	lName
 * String	uName
 * Date		createdAt
 * Date		updatedAt
 * String	password
 * String	salt
 * Boolean 	sudoer
 */
 
class User {

 	constructor(
 		_id,
 		fName,
 		lName,
 		uName,
 		createdAt,
 		updatedAt,
 		password,
 		salt,
 		sudoer
	) {
	
		var clean_id = sanitize.cleanInt(_id, null);
		if (null !== clean_id) {
		
			this._id = clean_id;
		
		}
		this.fName = sanitize.cleanString(fName);
		this.lName = sanitize.cleanString(lName);
		this.uName = sanitize.cleanString(uName);
		this.password = sanitize.cleanString(password);
		this.sudoer = sanitize.cleanBool(sudoer);
		this.salt = sanitize.cleanString(salt);
		this.createdAt = sanitize.cleanDate(createdAt);
		this.updatedAt = sanitize.cleanDate(updatedAt);
	
	}
	
	saltPass(password) {
	
		if ('string' != typeof password) {
		
			throw new TypeError('invalid password value passed to saltPass.');
		
		}
		if ('undefined' == typeof this.salt || null == this.salt || !this.salt) {
		
			this.salt = bcrypt.genSaltSync(16);
		
		}
		var secretHash = bcrypt.hashSync(password, this.salt);
		return secretHash;
	
	}
	
	verifyPassword(password) {
	
		if ('undefined' == typeof this.salt || null == this.salt || !this.salt) {
		
			return false;
		
		}
		else {
		
			return bcrypt.compareSync(password, this.password);
		
		}
	
	}
	
	maySudo() {
	
		if ('boolean' !== typeof this.sudoer || !this.sudoer) {
		
			return false;
		
		}
		else {
		
			return this.sudoer;
		
		}
	
	}

};


module.exports = class WotUsers {

	constructor() {
	
		this.db = new Datastore({ filename: 'var/nedb/users.js', autoload: true, timestampData: true });
	
	}
	
	findById(uId, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to findById.');
		
		}
		else if (isNaN(parseInt(uId))) {
		
			return callback(new TypeError('invalid id passed to findById.'), null);
		
		}
		else {
		
			self.fbiCallback = callback;
			this.db.find({_id: uId}, {password: 0, salt: 0}, function(error, data) {
			
				if (error) {
				
					return self.fbiCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' != typeof data[0]) {
				
					return self.fbiCallback(false, false);
				
				}
				else {
				
					var foundRecord = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						null,
						null,
						data[0].sudoer
					);
					return self.fbiCallback(false, foundRecord);
				
				}
			
			});
		
		}
	
	}
	
	findByName(uName, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to findByName.');
		
		}
		else if ('string' !== typeof uName) {
		
			return callback(new TypeError('invalid user name passed to findByName.'), null);
		
		}
		else {
		
			self.fbnCallback = callback;
			this.db.find({uName: sanitize.cleanString(uName)}, {password: 0, salt: 0}, function(error, data) {
			
				if (error) {
				
					return self.fbnCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' != typeof data[0]) {
				
					return self.fbnCallback(false, false);
				
				}
				else {
				
					var foundRecord = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						null,
						null,
						data[0].sudoer
					);
					return self.fbiCallback(false, foundRecord);
				
				}
			
			});
		
		}
	
	}
	
	createNew(uObj, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to createNew.');
		
		}
		else if ('object' !== typeof uObj || null === uObj || 'string' !== uObj.uName || '' === uObj.uName || 'string' !== typeof uObj.password || '' === uObj.password) {
		
			return callback(new TypeError('invalid user object passed to createNew.'), null);
		
		}
		else {
		
			self.cnCallback = callback;
			var pwInvalid = rules(uObj.password, {maximumLength: 255});
			this.isUnique(sanitize.cleanString(uObj.password), function(error, isUnique) {
			
				if (error) {
		
					return self.cnCallback(error, isUnique);
		
				}
				else if (!isUnique) {
			
					var message = 'User "' + uObj.uName + '" already exists.';
					return self.cnCallback(new Error(message), false);
			
				}
				else if (pwInvalid) {
				
					return self.cnCallback(new Error(pwInvalid.sentence), false);
				
				}
				else {
				
					var newUser = new User(
						null,
						uObj.fName,
						uObj.lName,
						uObj.uName,
						uObj.createdAt,
						uObj.updatedAt,
						uObj.password,
						null,
						uObj.sudoer
					
					);
					newUser.password = newUser.saltPass(newUser.password);
					delete newUser._id;
					self.db.insert(newUser, function(error, data) {
			
						if (error) {
				
							return this.cnCallback(error, null);
				
						}
						else if (!data.length) {
				
							return this.cnCallback(false, false);
				
						}
						else {
				
							return this.cnCallback(false, data);
				
						}
			
					});
				
				}
			
			});
		
		}
	
	}
	
	remove(uId, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to remove.');
		
		}
		else if ('number' != typeof uId || 0 > uId) {
		
			return callback(new TypeError('invalid user id passed to remove.'), null)
		
		}
		else {
		
			self.rCallback = callback;
			this.db.remove({_id: uId}, function(error, data) {
			
				if (error) {
				
					return this.rCallback(error, null);
				
				}
				else if (data === 0) {
				
					return this.rCallback(false, false);
				
				}
				else {
				
					return this.rCallback(false, true);
				
				}
			
			});
		
		}
	
	}
	
	changePw(uId, oldPw, newPw, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to changePw.');
		
		}
		else if ('number' != typeof uId || 0 > uId || 'string' !== typeof oldPw || 'string' !== typeof newPw) {
		
			return callback(new TypeError('invalid args passed to changePw.'), null);
		
		}
		else {
		
			self.cpCallback = callback;
			var pwInvalid = rules(newPw, {maximumLength: 255});
			this.validate(uId, oldPw, function(error, isValid) {
			
				if (error) {
				
					return self.cpCallback(error, null);
				
				}
				else if (!isValid) {
				
					return self.cpCallback(new Error('current data for user is invalid.'), null);
				
				}
				else if (pwInvalid) {
				
					return self.cpCallback(new Error(pwInvalid.sentence), null);
				
				}
				else {
				
					var uObj = new User (
						uId,
						null,
						null,
						null,
						null,
						null,
						newPw,
						null,
						false
					);
					uObj.password = uObj.saltPass(uObj.password);
					self.db.update({_id: uId}, {$set: {password: uObj.password, salt: uObj.salt}}, function(error, data) {
			
						if (error) {
				
							return self.cpCallback(error, null);
				
						}
						else if (data === 0) {
				
							return self.cpCallback(false, false);
				
						}
						else {
				
							return self.cpCallback(false, true);
				
						}
			
					});
				
				}
			
			});
		
		}
	
	}
	
	validate(uId, pw, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to validate.');
		
		}
		else if ('number' != typeof uId || 0 > uId || 'string' !== typeof pw || '' === pw) {
		
			return callback(new TypeError('invalid args passed to validate.'), null);
		
		}
		else {
		
			self.vCallback = callback;
			this.db.find({_id: uId}, function(error, data) {
			
				if (error) {
				
					return self.vCallback(error, null);
				
				}
				else if (!Array.isArray(data) || !data.length || 'object' != typeof data[0]) {
				
					return self.vCallback(false, false);
				
				}
				else {
				
					var checkUser = new User(
						data[0]._id,
						data[0].fName,
						data[0].lName,
						data[0].uName,
						data[0].createdAt,
						data[0].updatedAt,
						data[0].password,
						data[0].salt,
						data[0].sudoer
					);
					return self.vCallback(false, checkUser.verifyPassword(pw));
				
				}
			
			});
		
		}
	
	}
	
	isUnique(username, callback) {
	
		var self = this;
		if ('function' != typeof callback) {
		
			throw new TypeError('invalid callback passed to isUnique.');
		
		}
		else if ('string' != typeof username) {
		
			return callback(new TypeError('invalid username passed to isUnique.'), null);
		
		}
		else {
		
			self.iuCallback = callback;
			var iuQuery = {uName: username};
			this.db.count(iuQuery, function(error, result) {
		
				if (error) {
				
					return self.iuCallback(error, false);
			
				}
				if ('undefined' == typeof result || result < 1) {
			
					return self.iuCallback(false, true);
			
				}
				return self.iuCallback(false, false);
		
			});
		
		}
	
	}

};
